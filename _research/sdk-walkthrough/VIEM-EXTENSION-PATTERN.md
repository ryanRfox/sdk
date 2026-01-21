# Viem Extension Pattern Research

**Date:** 2026-01-19
**Goal:** Determine if `sendTransactionBatch` can be added to viem's PublicClient or WalletClient using the extend pattern

---

## Executive Summary

**Yes, Radius can export a `radiusActions()` decorator** that adds `sendTransactionBatch` (and other Radius-specific methods) to a standard viem client using the `extend()` pattern. This approach is well-established in viem's ecosystem and used by:

- **zkSync**: `eip712WalletActions()`, `publicActionsL2()`
- **OP Stack**: `publicActionsL2()`, `walletActionsL1()`
- **Experimental ERCs**: `erc7821Actions()`, `erc7715Actions()`, `erc7739Actions()`

This would allow users to either:
1. Use the Radius SDK's `RadiusClient` (current approach)
2. Use a standard viem client extended with `radiusActions()`

---

## 1. How Viem's `client.extend()` Works

### Basic Pattern

The `extend()` method on viem clients accepts a function that receives the client and returns an object with additional methods:

```typescript
const extendedClient = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend((client) => ({
  async customMethod(args: SomeParams) {
    // Access client methods, make RPC calls, etc.
    return client.request({ method: 'custom_method', params: [args] });
  },
}));

// Now available on the client
await extendedClient.customMethod({ ... });
```

### Type System

The extend method preserves type safety through TypeScript generics:

```typescript
interface Client {
  extend<TExtension extends Record<string, unknown>>(
    extender: (client: Client) => TExtension
  ): Client & TExtension;
}
```

When you extend a client, the return type is the intersection of the original client type and the extension.

---

## 2. How zkSync and Others Add Chain-Specific Methods

### Pattern: Factory Function Returning Decorator

The standard pattern is a factory function that returns a decorator:

```typescript
// From viem/zksync/decorators/eip712.ts
export function eip712WalletActions() {
  return <
    transport extends Transport,
    chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Eip712WalletActions<chain, account> => ({
    sendTransaction: (args) => sendTransaction(client, args),
    signTransaction: (args) => signTransaction(client, args),
    deployContract: (args) => deployContract(client, args),
    writeContract: (args) => writeContract(client, args),
  });
}

// Usage
const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum),
}).extend(eip712WalletActions());

// Now has zkSync-specific sendTransaction
const hash = await walletClient.sendTransaction({
  to: '0x...',
  value: 1n,
  paymaster: '0x...', // zkSync-specific field
});
```

### Key Characteristics

1. **Factory function** (`eip712WalletActions()`) - allows passing configuration if needed
2. **Returns a function** that takes the client and returns the actions object
3. **Generic constraints** ensure type safety for chain/account types
4. **Actions call standalone functions** passing the client as first argument

### zkSync publicActionsL2 Example

```typescript
// From viem/zksync/decorators/publicL2.ts
export function publicActionsL2() {
  return <
    transport extends Transport = Transport,
    chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): PublicActionsL2<chain, account> => {
    return {
      estimateGasL1ToL2: (args) => estimateGasL1ToL2(client, args),
      getDefaultBridgeAddresses: () => getDefaultBridgeAddresses(client),
      getAllBalances: (args) => getAllBalances(client, args),
      // ... many more zkSync-specific methods
    };
  };
}
```

---

## 3. Adding `sendTransactionBatch` as Radius Actions

### Proposed Implementation

```typescript
// @radiustechsystems/sdk/actions/sendTransactionBatch.ts
import type { Client, Hash, Hex, LocalAccount, Transport, Chain } from 'viem';

export interface BatchTransactionRequest {
  to: `0x${string}`;
  value?: bigint;
  data?: Hex;
  gas?: bigint;
}

export interface SendTransactionBatchParameters {
  account: LocalAccount;
  transactions: BatchTransactionRequest[];
}

export async function sendTransactionBatch<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  client: Client<TTransport, TChain>,
  { account, transactions }: SendTransactionBatchParameters,
): Promise<Hash[]> {
  // Get RPC URL from client transport
  const rpcUrl = client.transport.url;

  // Get current nonce
  const startNonce = await client.getTransactionCount({
    address: account.address,
    blockTag: 'pending',
  });

  // Estimate gas for each transaction
  const gasEstimates = await Promise.all(
    transactions.map(async (tx) => {
      if (tx.gas !== undefined) return tx.gas;
      const estimate = await client.estimateGas({
        account: account.address,
        to: tx.to,
        data: tx.data,
        value: tx.value ?? 0n,
      });
      return estimate + (estimate / 5n); // 20% margin
    }),
  );

  // Sign all transactions with sequential nonces
  const signedTxs = await Promise.all(
    transactions.map(async (tx, i) => {
      return account.signTransaction({
        to: tx.to,
        data: tx.data,
        value: tx.value ?? 0n,
        nonce: startNonce + i,
        gas: gasEstimates[i],
        gasPrice: 0n,
        chainId: client.chain?.id,
      });
    }),
  );

  // Build and send JSON-RPC batch request
  const batchRequest = signedTxs.map((raw, i) => ({
    jsonrpc: '2.0' as const,
    id: i,
    method: 'eth_sendRawTransaction',
    params: [raw],
  }));

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchRequest),
  });

  const batchResponse = await response.json();

  // Extract hashes in order
  return batchResponse
    .sort((a: any, b: any) => a.id - b.id)
    .map((r: any) => r.result as Hash);
}
```

### Radius Actions Decorator

```typescript
// @radiustechsystems/sdk/decorators/radiusActions.ts
import type { Client, Transport, Chain, Account, Hash, LocalAccount } from 'viem';
import {
  sendTransactionBatch,
  type BatchTransactionRequest,
} from '../actions/sendTransactionBatch.js';

export type RadiusActions = {
  /**
   * Send multiple transactions in a single JSON-RPC batch request.
   * Transactions are automatically assigned sequential nonces.
   *
   * @remarks
   * Radius does not queue future-nonce transactions like Ethereum.
   * This method ensures all transactions arrive in nonce order.
   *
   * @example
   * const hashes = await client.sendTransactionBatch({
   *   account: signer,
   *   transactions: [
   *     { to: '0x...', value: 1000000000000000000n },
   *     { to: '0x...', data: '0x...' },
   *   ],
   * });
   */
  sendTransactionBatch: (args: {
    account: LocalAccount;
    transactions: BatchTransactionRequest[];
  }) => Promise<Hash[]>;
};

export function radiusActions() {
  return <
    transport extends Transport = Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): RadiusActions => {
    return {
      sendTransactionBatch: (args) => sendTransactionBatch(client, args),
    };
  };
}
```

### Usage by End Users

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { radiusActions } from '@radiustechsystems/sdk';

const account = privateKeyToAccount('0x...');

const client = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusActions());

// Now has sendTransactionBatch with full type safety!
const hashes = await client.sendTransactionBatch({
  account,
  transactions: [
    { to: '0x...', value: 1000000000000000000n },
    { to: '0x...', data: '0xabcd...' },
  ],
});
```

---

## 4. Type-Safe API Design

### Type Definitions

```typescript
// types/radius.ts
import type { Address, Hash, Hex, LocalAccount } from 'viem';

export interface BatchTransactionRequest {
  /** The recipient address */
  to: Address;
  /** The amount to send in wei (default: 0n) */
  value?: bigint;
  /** The transaction data (for contract calls) */
  data?: Hex;
  /** Gas limit (if not provided, will be estimated) */
  gas?: bigint;
}

export interface SendTransactionBatchParameters {
  /** The account to sign transactions with */
  account: LocalAccount;
  /** Array of transaction requests */
  transactions: BatchTransactionRequest[];
}

export interface BatchTransactionResult {
  index: number;
  hash?: Hash;
  error?: string;
}
```

### Generic Constraints for Chain Types

Like zkSync, we could optionally constrain to Radius chains:

```typescript
// types/chain.ts
import type { Chain } from 'viem';

export interface RadiusChain extends Chain {
  // Any Radius-specific chain properties
  custom?: {
    isRadiusNetwork: true;
  };
}

// Then in decorators:
export function radiusActions() {
  return <
    transport extends Transport = Transport,
    chain extends RadiusChain | undefined = RadiusChain | undefined,
    account extends Account | undefined = Account | undefined,
  >(client: Client<transport, chain, account>): RadiusActions => {
    // ...
  };
}
```

---

## 5. Comparison: RadiusClient vs Extended Viem Client

### Current RadiusClient Approach

```typescript
const client = createRadiusClient({ chain: radiusTestnet });
const account = privateKeyToAccount('0x...');

const hashes = await client.sendTransactionBatch(account, [
  { to: '0x...', value: 1n },
  { to: '0x...', data: '0x...' },
]);
```

**Pros:**
- Single unified client
- SDK-specific optimizations built-in
- Consistent API across all operations

**Cons:**
- New client type (not standard viem)
- Cannot use with existing viem workflows
- Users need to learn new API

### Extended Viem Client Approach

```typescript
const client = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusActions());

const hashes = await client.sendTransactionBatch({
  account,
  transactions: [
    { to: '0x...', value: 1n },
    { to: '0x...', data: '0x...' },
  ],
});
```

**Pros:**
- Uses standard viem client
- Works with existing viem code/patterns
- Can combine with other extensions (e.g., `publicActions`, other chain actions)
- Familiar to viem users

**Cons:**
- Slightly more verbose setup
- Two ways to do the same thing

### Recommendation: Support Both

Export both patterns to support different user preferences:

```typescript
// For users who want the full SDK experience
import { createRadiusClient } from '@radiustechsystems/sdk';

// For users who want to extend their existing viem client
import { radiusActions } from '@radiustechsystems/sdk';
```

---

## 6. Additional Methods for radiusActions()

Beyond `sendTransactionBatch`, these methods could be added:

```typescript
export type RadiusActions = {
  /** Send multiple transactions atomically */
  sendTransactionBatch: (args: SendTransactionBatchParameters) => Promise<Hash[]>;

  /** Wait for multiple transaction receipts in parallel */
  waitForTransactionBatch: (args: { hashes: Hash[] }) => Promise<RadiusReceipt[]>;

  /** Get preconfirmation status (when available) */
  getPreconfirmationStatus?: (args: { hash: Hash }) => Promise<PreconfirmationStatus>;
};
```

---

## 7. Implementation Checklist

If implementing `radiusActions()`:

1. **Create standalone action functions:**
   - `src/actions/sendTransactionBatch.ts`
   - `src/actions/waitForTransactionBatch.ts`

2. **Create type definitions:**
   - `src/types/radius.ts` (BatchTransactionRequest, etc.)

3. **Create decorator factory:**
   - `src/decorators/radiusActions.ts`

4. **Export from package:**
   ```typescript
   // src/index.ts
   export { radiusActions, type RadiusActions } from './decorators/radiusActions.js';
   ```

5. **Add tests:**
   - Unit tests for action functions
   - Integration tests with extended client

6. **Documentation:**
   - Add examples showing extend pattern usage
   - Update migration guide

---

## 8. Conclusion

**The viem extend pattern is a proven, type-safe approach** for adding chain-specific functionality. Radius SDK could:

1. **Keep the existing `RadiusClient`** for users who want a unified SDK experience
2. **Add `radiusActions()` decorator** for users who prefer extending standard viem clients

This dual approach mirrors how zkSync's SDK works:
- `zksync-ethers` provides a custom `Provider` class
- `viem/zksync` provides `eip712WalletActions()` for extending viem clients

The extend pattern is particularly valuable because:
- It integrates seamlessly with existing viem code
- It's the officially recommended approach by viem
- It maintains full type safety
- It allows composition with other actions (publicActions, walletActions, etc.)
