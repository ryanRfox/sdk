# Viem Patterns Deep Dive for Radius SDK V2 Refactoring

**Date:** 2026-01-19
**Purpose:** Comprehensive analysis of viem patterns that Radius SDK should adopt to eliminate RadiusClient in favor of extending viem clients

---

## Executive Summary

This document provides a detailed analysis of viem's architecture patterns and a concrete proposal for refactoring the Radius SDK to:

1. **Eliminate `RadiusClient`** - Replace with standard viem clients extended with Radius-specific actions
2. **Follow viem's established patterns** - Actions, decorators, chainConfig, type system
3. **Reduce technical debt** - Leverage viem's battle-tested infrastructure
4. **Maintain backward compatibility** - Support both patterns during migration

The key insight: **viem is designed for extensibility**. zkSync, OP Stack, Celo, and many other chains successfully extend viem without creating custom client wrappers.

---

## Table of Contents

1. [Viem Actions Pattern](#1-viem-actions-pattern)
2. [Viem Decorators Pattern](#2-viem-decorators-pattern)
3. [Viem Chain Configuration](#3-viem-chain-configuration)
4. [Viem Contract Utilities](#4-viem-contract-utilities)
5. [Viem Type System](#5-viem-type-system)
6. [Current RadiusClient Analysis](#6-current-radiusclient-analysis)
7. [Proposed SDK V2 Structure](#7-proposed-sdk-v2-structure)
8. [Migration Path](#8-migration-path)
9. [Code Examples](#9-code-examples)

---

## 1. Viem Actions Pattern

### Overview

Actions in viem are **standalone async functions** that take a client as their first argument. This design enables:
- Tree-shaking (only import what you use)
- Reusability across different client types
- Easy testing (mock the client)
- Consistent API shape

### Directory Structure

```
viem/src/actions/
├── ens/                    # ENS-specific actions
│   ├── getEnsAddress.ts
│   ├── getEnsAvatar.ts
│   └── getEnsName.ts
├── public/                 # PublicClient actions
│   ├── call.ts
│   ├── estimateGas.ts
│   ├── getBalance.ts
│   ├── getBlock.ts
│   ├── getTransaction.ts
│   ├── multicall.ts
│   └── readContract.ts
├── wallet/                 # WalletClient actions
│   ├── sendTransaction.ts
│   ├── sendCalls.ts       # EIP-5792 batch calls
│   ├── signMessage.ts
│   ├── signTransaction.ts
│   └── writeContract.ts
├── test/                   # Anvil/test node actions
│   ├── mine.ts
│   ├── setBalance.ts
│   └── impersonateAccount.ts
└── index.ts               # Barrel export
```

### Action Function Signature

Every viem action follows this pattern:

```typescript
export async function actionName<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  parameters: ActionParameters,
): Promise<ActionReturnType> {
  // Implementation
}
```

### Example: sendTransaction Action

From `viem/src/actions/wallet/sendTransaction.ts`:

```typescript
export async function sendTransaction(
  client,
  parameters
) {
  const {
    account: account_ = client.account,
    chain = client.chain,
    ...rest
  } = parameters;

  // Parse account
  const account = account_ ? parseAccount(account_) : null;

  // For JSON-RPC accounts (MetaMask, etc.)
  if (account?.type === 'json-rpc' || account === null) {
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({ ...rest, account, chainId });

    return client.request({
      method: 'eth_sendTransaction',
      params: [request],
    });
  }

  // For local accounts (private key)
  if (account?.type === 'local') {
    const request = await getAction(client, prepareTransactionRequest, 'prepareTransactionRequest')({
      account,
      chain,
      ...rest,
    });

    const serializer = chain?.serializers?.transaction;
    const serializedTransaction = await account.signTransaction(request, { serializer });

    return getAction(client, sendRawTransaction, 'sendRawTransaction')({
      serializedTransaction,
    });
  }
}
```

**Key patterns:**
1. Uses `client.chain?.formatters` for chain-specific formatting
2. Uses `chain?.serializers?.transaction` for chain-specific serialization
3. Uses `getAction()` to call other actions (enables tree-shaking)
4. Supports both JSON-RPC and local account types

### How Radius Should Adopt This

**Create standalone action functions for Radius-specific operations:**

```typescript
// src/actions/sendTransactionBatch.ts
export async function sendTransactionBatch<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  client: Client<TTransport, TChain>,
  parameters: SendTransactionBatchParameters,
): Promise<Hash[]> {
  // Implementation using client.request for JSON-RPC batch
}
```

---

## 2. Viem Decorators Pattern

### Overview

Decorators are functions that **wrap action functions and bind them to a client instance**. They enable the `client.methodName()` syntax that developers expect.

### How Decorators Work

```typescript
// viem/src/clients/decorators/public.ts
export function publicActions(client) {
  return {
    call: (args) => call(client, args),
    estimateGas: (args) => estimateGas(client, args),
    getBalance: (args) => getBalance(client, args),
    getBlock: (args) => getBlock(client, args),
    // ... all public actions
  };
}
```

The decorator:
1. Takes the client as input
2. Returns an object with methods
3. Each method calls the standalone action function with the client

### Client Creation with Decorators

```typescript
// viem/src/clients/createPublicClient.ts
export function createPublicClient(parameters) {
  const client = createClient({
    ...parameters,
    type: 'publicClient',
  });
  return client.extend(publicActions);
}
```

### The extend() Pattern

The magic happens in `createClient`:

```typescript
// viem/src/clients/createClient.ts
export function createClient(parameters) {
  const client = {
    account,
    chain,
    request,
    transport,
    // ...
  };

  function extend(base) {
    return (extendFn) => {
      const extended = extendFn(base);
      for (const key in client) delete extended[key];
      const combined = { ...base, ...extended };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }

  return Object.assign(client, { extend: extend(client) });
}
```

This allows chaining:

```typescript
const client = createClient({ chain, transport })
  .extend(publicActions)
  .extend(walletActions)
  .extend(radiusActions());
```

### Chain-Specific Decorators (zkSync Example)

```typescript
// viem/src/zksync/decorators/eip712.ts
export function eip712WalletActions() {
  return (client) => ({
    sendTransaction: (args) => sendTransaction(client, args),
    signTransaction: (args) => signTransaction(client, args),
    deployContract: (args) => deployContract(client, args),
    writeContract: (args) => writeContract(
      Object.assign(client, {
        sendTransaction: (args) => sendTransaction(client, args),
      }),
      args
    ),
  });
}
```

**Note the factory function pattern:** `eip712WalletActions()` returns the decorator. This allows:
- Passing configuration options
- Creating different decorator variants
- Lazy initialization

### zkSync publicActionsL2 Example

```typescript
// viem/src/zksync/decorators/publicL2.ts
export function publicActionsL2() {
  return (client) => ({
    estimateGasL1ToL2: (args) => estimateGasL1ToL2(client, args),
    getDefaultBridgeAddresses: () => getDefaultBridgeAddresses(client),
    getAllBalances: (args) => getAllBalances(client, args),
    getL1BatchNumber: () => getL1BatchNumber(client),
    getTransactionDetails: (args) => getTransactionDetails(client, args),
    // ... 15+ zkSync-specific methods
  });
}
```

### How Radius Should Adopt This

**Create a `radiusWalletActions()` decorator:**

```typescript
// src/decorators/radiusWalletActions.ts
import { sendTransactionBatch } from '../actions/sendTransactionBatch.js';
import { waitForTransactionBatch } from '../actions/waitForTransactionBatch.js';

export function radiusWalletActions() {
  return (client) => ({
    sendTransactionBatch: (args) => sendTransactionBatch(client, args),
    waitForTransactionBatch: (args) => waitForTransactionBatch(client, args),
  });
}
```

**Usage:**

```typescript
import { createWalletClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { radiusWalletActions } from '@radiustechsystems/sdk';

const client = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

const hashes = await client.sendTransactionBatch({
  transactions: [
    { to: '0x...', value: 1n },
    { to: '0x...', value: 2n },
  ],
});
```

---

## 3. Viem Chain Configuration

### Overview

Chain configuration in viem goes beyond simple metadata. It includes:
- **Formatters**: Transform data between RPC format and viem format
- **Serializers**: Custom transaction serialization
- **Custom functions**: Chain-specific utilities
- **Contracts**: Well-known contract addresses

### chainConfig Structure (zkSync Example)

```typescript
// viem/src/zksync/chainConfig.ts
export const chainConfig = {
  blockTime: 1_000,  // 1 second blocks
  formatters,        // Custom formatters
  serializers,       // Custom serializers
  custom: {
    getEip712Domain, // zkSync EIP-712 domain
  },
};
```

### Formatters

Formatters transform RPC responses into viem's internal format:

```typescript
// viem/src/zksync/formatters.ts
export const formatters = {
  block: defineBlock({
    format(args) {
      return {
        l1BatchNumber: args.l1BatchNumber
          ? hexToBigInt(args.l1BatchNumber)
          : null,
        l1BatchTimestamp: args.l1BatchTimestamp
          ? hexToBigInt(args.l1BatchTimestamp)
          : null,
        transactions: args.transactions?.map((tx) => {
          if (typeof tx === 'string') return tx;
          const formatted = formatters.transaction?.format(tx);
          if (formatted.typeHex === '0x71') formatted.type = 'eip712';
          return formatted;
        }),
      };
    },
  }),

  transaction: defineTransaction({
    format(args) {
      return {
        type: args.type === '0x71' ? 'eip712' : undefined,
        l1BatchNumber: args.l1BatchNumber
          ? hexToBigInt(args.l1BatchNumber)
          : null,
      };
    },
  }),

  transactionRequest: defineTransactionRequest({
    exclude: ['gasPerPubdata', 'paymaster', 'paymasterInput'],
    format(args) {
      if (args.gasPerPubdata || args.paymaster) {
        return {
          eip712Meta: {
            gasPerPubdata: toHex(args.gasPerPubdata),
            paymasterParams: args.paymaster
              ? { paymaster: args.paymaster, paymasterInput: args.paymasterInput }
              : undefined,
          },
          type: '0x71',
        };
      }
      return {};
    },
  }),
};
```

**How viem uses formatters:**

```typescript
// In sendTransaction action
const chainFormat = client.chain?.formatters?.transactionRequest?.format;
const format = chainFormat || formatTransactionRequest;
const request = format({ ...params }, 'sendTransaction');
```

### Serializers

Serializers convert transactions to RLP-encoded format:

```typescript
// viem/src/zksync/serializers.ts
export const serializers = {
  transaction: serializeTransaction,
};

function serializeTransaction(transaction, signature) {
  if (isEIP712Transaction(transaction)) {
    return serializeTransactionEIP712(transaction);
  }
  return serializeTransaction_(transaction, signature);
}

function serializeTransactionEIP712(transaction) {
  const serializedTransaction = [
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    toHex(chainId),
    // ... zkSync-specific fields
  ];

  return concatHex(['0x71', toRlp(serializedTransaction)]);
}
```

**How viem uses serializers:**

```typescript
// In sendTransaction action
const serializer = chain?.serializers?.transaction;
const serializedTransaction = await account.signTransaction(request, { serializer });
```

### Chain Definition with Config

```typescript
// viem/src/zksync/chains.ts
import { defineChain } from '../utils/chain/defineChain.js';
import { chainConfig } from './chainConfig.js';

export const zksync = defineChain({
  id: 324,
  name: 'zkSync',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.era.zksync.io'] },
  },
  blockExplorers: {
    default: { name: 'zkSync Explorer', url: 'https://explorer.zksync.io' },
  },
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
  ...chainConfig, // Spreads formatters, serializers, custom
});
```

### How Radius Should Adopt This

**For Radius (no mempool, zero gas price), consider:**

```typescript
// src/chains/chainConfig.ts
export const chainConfig = {
  blockTime: 500, // 500ms blocks (adjust based on actual)

  // Format transactions to handle zero gas price display
  formatters: {
    transaction: defineTransaction({
      format(args) {
        return {
          // Radius-specific formatting if needed
        };
      },
    }),

    transactionRequest: defineTransactionRequest({
      format(args) {
        // Ensure gas price is always 0
        return {
          gasPrice: 0n,
        };
      },
    }),
  },

  // Custom functions
  custom: {
    hasMempool: false, // Document no-mempool behavior
    supportsParallelNonces: false, // Document nonce requirements
  },
};
```

**Chain definition:**

```typescript
// src/chains/radius.ts
import { defineChain } from 'viem';
import { chainConfig } from './chainConfig.js';

export const radius = defineChain({
  id: 723,
  name: 'Radius',
  nativeCurrency: { decimals: 18, name: 'USD', symbol: 'USD' },
  rpcUrls: {
    default: { http: ['https://rpc.radiustech.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Radius Explorer', url: 'https://explorer.radiustech.xyz' },
  },
  // Spread chain config for formatters, serializers, custom
  ...chainConfig,
});
```

---

## 4. Viem Contract Utilities

### Overview

Viem handles well-known contracts through:
- **Chain-level contract addresses**: Stored in chain definition
- **Constant ABIs**: Minimal ABIs for known contracts
- **Helper functions**: Get addresses dynamically

### Contract Address Storage

```typescript
// Chain definition includes contracts
export const mainnet = defineChain({
  id: 1,
  name: 'Ethereum',
  // ...
  contracts: {
    ensUniversalResolver: {
      address: '0xeeeeeeee14d718c2b47d9923deab1335e144eeee',
      blockCreated: 23_085_558,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
});
```

### Getting Contract Addresses

```typescript
// viem/src/utils/chain/getChainContractAddress.ts
export function getChainContractAddress({ blockNumber, chain, contract: name }) {
  const contract = chain?.contracts?.[name];

  if (!contract) {
    throw new ChainDoesNotSupportContract({ chain, contract: { name } });
  }

  if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber) {
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: { name, blockCreated: contract.blockCreated },
    });
  }

  return contract.address;
}
```

### Constant ABIs

```typescript
// viem/src/constants/abis.ts
export const multicall3Abi = [
  {
    inputs: [{ components: [...], name: 'calls', type: 'tuple[]' }],
    name: 'aggregate3',
    outputs: [{ components: [...], name: 'returnData', type: 'tuple[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];
```

### Usage in Actions

```typescript
// viem/src/actions/public/multicall.ts
export async function multicall(client, parameters) {
  const multicallAddress = (() => {
    if (parameters.multicallAddress) return parameters.multicallAddress;
    if (deployless) return null;
    if (client.chain) {
      return getChainContractAddress({
        blockNumber,
        chain: client.chain,
        contract: 'multicall3',
      });
    }
    throw new Error('client chain not configured. multicallAddress is required.');
  })();

  // Use multicall3Abi for the call
  return readContract(client, {
    address: multicallAddress,
    abi: multicall3Abi,
    functionName: 'aggregate3',
    args: [calls],
  });
}
```

### How Radius Should Adopt This

**If Radius has well-known contracts (e.g., a batch executor):**

```typescript
// src/chains/radius.ts
export const radius = defineChain({
  id: 723,
  name: 'Radius',
  // ...
  contracts: {
    multicall3: {
      address: '0x...', // If deployed on Radius
      blockCreated: 1,
    },
    // Radius-specific contracts
    batchExecutor: {
      address: '0x...',
      blockCreated: 1,
    },
  },
});
```

**Store ABIs separately:**

```typescript
// src/constants/abis.ts
export const batchExecutorAbi = [...] as const;
```

---

## 5. Viem Type System

### Overview

Viem's type system ensures:
- Chain-specific types flow through the client
- Transaction types are correctly discriminated
- Return types match the chain's data format

### Generic Constraints

```typescript
// Action functions use generics for chain/account types
export async function sendTransaction<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: SendTransactionParameters<TChain, TAccount>,
): Promise<Hash> {
  // TChain affects available transaction fields
  // TAccount affects whether account param is required
}
```

### Chain-Specific Return Types

```typescript
// zkSync augments the Transaction type
interface ZkSyncTransaction extends Transaction {
  l1BatchNumber: bigint | null;
  l1BatchTxIndex: bigint | null;
}

// When using zkSync chain, getTransaction returns ZkSyncTransaction
const tx = await client.getTransaction({ hash: '0x...' });
// tx.l1BatchNumber is available with proper types
```

### Discriminated Unions for Transaction Types

```typescript
// viem uses transaction type discriminated unions
type TransactionRequest =
  | TransactionRequestLegacy  // type: 'legacy'
  | TransactionRequestEIP2930 // type: 'eip2930'
  | TransactionRequestEIP1559 // type: 'eip1559'
  | TransactionRequestEIP4844 // type: 'eip4844'
  | TransactionRequestEIP7702; // type: 'eip7702'

// zkSync adds its own type
type ZkSyncTransactionRequest =
  | TransactionRequest
  | TransactionRequestEIP712; // type: 'eip712'
```

### Type Narrowing in Actions

```typescript
// Actions narrow types based on chain
if (account?.type === 'json-rpc') {
  // Handle JSON-RPC account
} else if (account?.type === 'local') {
  // Handle local account
} else if (account?.type === 'smart') {
  // Handle smart account
}
```

### How Radius Should Adopt This

**Define Radius-specific types:**

```typescript
// src/types/transaction.ts
export interface RadiusTransaction extends Transaction {
  // Any Radius-specific fields
}

// src/types/chain.ts
export interface RadiusChain extends Chain {
  custom?: {
    hasMempool: false;
    supportsParallelNonces: false;
  };
}
```

**Constrain decorators to Radius chains (optional):**

```typescript
export function radiusWalletActions() {
  return <
    TTransport extends Transport,
    TChain extends RadiusChain | undefined,
    TAccount extends Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): RadiusWalletActions => ({
    sendTransactionBatch: (args) => sendTransactionBatch(client, args),
  });
}
```

---

## 6. Current RadiusClient Analysis

### What RadiusClient Does Today

```typescript
interface RadiusClient {
  // Exposes underlying viem client
  readonly publicClient: PublicClient;

  // Direct pass-through to viem
  getChainId(): Promise<bigint>;
  getBalance(params): Promise<bigint>;
  getCode(params): Promise<Hex | undefined>;
  getTransactionCount(params): Promise<number>;
  estimateGas(tx): Promise<bigint>;
  sendRawTransaction(params): Promise<Hash>;
  waitForTransactionReceipt(params): Promise<RadiusReceipt>;
  readContract(params): Promise<T>;

  // Custom Radius methods
  send(signer, to, value): Promise<Hash>;
  sendAndWait(signer, to, value): Promise<RadiusReceipt>;
  sendTransactionBatch(signer, transactions): Promise<Hash[]>;  // KEY METHOD
  deployContract(signer, bytecode, abi, ...args): Promise<{address, receipt}>;
  writeContract(params): Promise<Hash>;

  // Extension support
  extend<T>(extender): RadiusClient & T;
  getContract(params): TypedContract;
}
```

### Which Methods Should Become Actions

| Method | Should be Action? | Reason |
|--------|-------------------|--------|
| `getBalance` | No | Already in viem |
| `getCode` | No | Already in viem |
| `getTransactionCount` | No | Already in viem |
| `estimateGas` | No | Already in viem |
| `sendRawTransaction` | No | Already in viem |
| `waitForTransactionReceipt` | No | Already in viem |
| `readContract` | No | Already in viem |
| `send` | Maybe | Convenience wrapper |
| `sendAndWait` | Maybe | Convenience wrapper |
| **`sendTransactionBatch`** | **Yes** | Radius-specific, critical |
| `deployContract` | No | Already in viem |
| `writeContract` | No | Already in viem |

### What Makes RadiusClient Different

1. **Validation wrappers** - Provides better error messages for common mistakes
2. **`sendTransactionBatch`** - Only unique functionality
3. **Zero gas handling** - Ensures gasPrice: 0n
4. **Convenience methods** - `send`, `sendAndWait` combine multiple operations

### Technical Debt in RadiusClient

1. **Duplicates viem functionality** - Most methods are thin wrappers
2. **Different API than viem** - Users must learn new patterns
3. **Doesn't leverage viem's extend()** - Custom extend implementation
4. **No chain-level configuration** - Doesn't use formatters/serializers

---

## 7. Proposed SDK V2 Structure

### Directory Structure

```
@radiustechsystems/sdk/
├── src/
│   ├── actions/
│   │   ├── sendTransactionBatch.ts     # Standalone action
│   │   ├── waitForTransactionBatch.ts  # Standalone action
│   │   └── index.ts
│   │
│   ├── decorators/
│   │   ├── radiusWalletActions.ts      # Wallet action decorator
│   │   └── index.ts
│   │
│   ├── chains/
│   │   ├── chainConfig.ts              # Formatters, serializers
│   │   ├── radius.ts                   # Mainnet chain
│   │   ├── radiusTestnet.ts            # Testnet chain
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── chain.ts                    # RadiusChain type
│   │   ├── transaction.ts              # Radius transaction types
│   │   └── index.ts
│   │
│   ├── errors/                         # Keep existing error hierarchy
│   │   └── ...
│   │
│   ├── events/                         # Keep existing event utilities
│   │   └── ...
│   │
│   └── index.ts                        # Main exports
│
├── package.json
└── tsconfig.json
```

### Main Exports

```typescript
// src/index.ts

// Chains
export { radius, radiusTestnet } from './chains/index.js';

// Decorators (NEW)
export { radiusWalletActions } from './decorators/index.js';

// Actions (NEW - for direct import)
export { sendTransactionBatch, waitForTransactionBatch } from './actions/index.js';

// Types
export type { RadiusChain, BatchTransactionRequest } from './types/index.js';

// Errors (keep existing)
export * from './errors/index.js';

// Events (keep existing)
export * from './events/index.js';

// DEPRECATED - keep for backward compatibility
export { createRadiusClient } from './client/client.js';
```

### radiusWalletActions Decorator

```typescript
// src/decorators/radiusWalletActions.ts
import type { Client, Transport, Account, Hash, LocalAccount } from 'viem';
import type { RadiusChain } from '../types/chain.js';
import { sendTransactionBatch, type SendTransactionBatchParameters } from '../actions/sendTransactionBatch.js';
import { waitForTransactionBatch, type WaitForTransactionBatchParameters } from '../actions/waitForTransactionBatch.js';

export type RadiusWalletActions = {
  /**
   * Send multiple transactions in a single JSON-RPC batch request.
   * Transactions are automatically assigned sequential nonces.
   *
   * @remarks
   * Radius does not queue future-nonce transactions like Ethereum.
   * This method ensures all transactions arrive in nonce order.
   *
   * @example
   * ```typescript
   * const hashes = await client.sendTransactionBatch({
   *   transactions: [
   *     { to: '0x...', value: 1000000000000000000n },
   *     { to: '0x...', data: '0x...' },
   *   ],
   * });
   * ```
   */
  sendTransactionBatch: (args: SendTransactionBatchParameters) => Promise<Hash[]>;

  /**
   * Wait for multiple transaction receipts in parallel.
   */
  waitForTransactionBatch: (args: WaitForTransactionBatchParameters) => Promise<TransactionReceipt[]>;
};

/**
 * Extends a viem WalletClient with Radius-specific actions.
 *
 * @example
 * ```typescript
 * import { createWalletClient, http } from 'viem';
 * import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
 *
 * const client = createWalletClient({
 *   account,
 *   chain: radiusTestnet,
 *   transport: http(),
 * }).extend(radiusWalletActions());
 *
 * const hashes = await client.sendTransactionBatch({
 *   transactions: [{ to: '0x...', value: 1n }],
 * });
 * ```
 */
export function radiusWalletActions() {
  return <
    TTransport extends Transport = Transport,
    TChain extends RadiusChain | undefined = RadiusChain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): RadiusWalletActions => ({
    sendTransactionBatch: (args) => sendTransactionBatch(client, args),
    waitForTransactionBatch: (args) => waitForTransactionBatch(client, args),
  });
}
```

### sendTransactionBatch Action

```typescript
// src/actions/sendTransactionBatch.ts
import type { Client, Hash, Hex, Transport, Chain, Address, LocalAccount } from 'viem';
import { BatchTransactionError } from '../errors/transaction.js';

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

const MAX_GAS = 1319413953330n;

/**
 * Send multiple transactions in a single JSON-RPC batch request.
 *
 * @remarks
 * Radius does not queue future-nonce transactions like Ethereum.
 * This action ensures all transactions arrive in nonce order by using JSON-RPC batching.
 */
export async function sendTransactionBatch<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  client: Client<TTransport, TChain>,
  { account, transactions }: SendTransactionBatchParameters,
): Promise<Hash[]> {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('sendTransactionBatch requires at least one transaction');
  }

  // Get RPC URL from transport
  const rpcUrl = (client.transport as any).url;
  if (!rpcUrl) {
    throw new Error('Transport must have a URL for batch requests');
  }

  // Get current nonce
  const startNonce = await client.getTransactionCount({
    address: account.address,
    blockTag: 'pending',
  });

  // Estimate gas for each transaction in parallel
  const gasEstimates = await Promise.all(
    transactions.map(async (tx) => {
      if (tx.gas !== undefined) return tx.gas;
      const estimate = await client.estimateGas({
        account: account.address,
        to: tx.to,
        data: tx.data,
        value: tx.value ?? 0n,
      });
      let gas = estimate + estimate / 5n; // 20% margin
      return gas > MAX_GAS ? MAX_GAS : gas;
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
        gasPrice: 0n, // Radius uses zero gas price
        chainId: client.chain?.id,
      });
    }),
  );

  // Build JSON-RPC batch request
  const batchRequest = signedTxs.map((raw, i) => ({
    jsonrpc: '2.0' as const,
    id: i,
    method: 'eth_sendRawTransaction',
    params: [raw],
  }));

  // Send single HTTP POST request
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchRequest),
  });

  if (!response.ok) {
    throw new Error(`Batch request failed with status ${response.status}`);
  }

  const batchResponse = await response.json() as Array<{
    id: number;
    result?: Hash;
    error?: { code: number; message: string; data?: string };
  }>;

  // Parse responses in order
  const sortedResponses = [...batchResponse].sort((a, b) => a.id - b.id);
  const results: Array<{ index: number; hash?: Hash; error?: string }> = [];
  const hashes: Hash[] = [];
  let hasError = false;

  for (let i = 0; i < transactions.length; i++) {
    const res = sortedResponses[i];
    if (res?.result) {
      results.push({ index: i, hash: res.result });
      hashes.push(res.result);
    } else {
      const errorMsg = res?.error?.data || res?.error?.message || 'Unknown error';
      results.push({ index: i, error: errorMsg });
      hasError = true;
    }
  }

  if (hasError) {
    throw new BatchTransactionError(
      `${results.filter(r => r.error).length} of ${transactions.length} transactions failed`,
      results,
    );
  }

  return hashes;
}
```

---

## 8. Migration Path

### Phase 1: Add New Exports (Non-Breaking)

1. Create `radiusWalletActions()` decorator
2. Create standalone action functions
3. Export alongside existing `createRadiusClient`
4. Update documentation to show both patterns

```typescript
// Users can now do either:

// Old way (still works)
const client = createRadiusClient({ chain: radiusTestnet });
await client.sendTransactionBatch(account, transactions);

// New way (preferred)
const client = createWalletClient({ account, chain: radiusTestnet, transport: http() })
  .extend(radiusWalletActions());
await client.sendTransactionBatch({ transactions });
```

### Phase 2: Deprecate RadiusClient

1. Add `@deprecated` JSDoc to `createRadiusClient`
2. Log deprecation warning on first use
3. Update all examples to use new pattern
4. Provide migration guide

### Phase 3: Remove RadiusClient (Major Version)

1. Remove `createRadiusClient` export
2. Update package major version
3. Complete migration guide

### Migration Examples

**Before:**
```typescript
import { createRadiusClient, privateKeyToAccount } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const account = privateKeyToAccount('0x...');

// Send batch
const hashes = await client.sendTransactionBatch(account, [
  { to: '0x...', value: 1n },
]);

// Read balance
const balance = await client.getBalance({ address: '0x...' });

// Read contract
const result = await client.readContract({ address, abi, functionName, args });
```

**After:**
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

const account = privateKeyToAccount('0x...');

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

// Send batch (NEW API)
const hashes = await walletClient.sendTransactionBatch({
  transactions: [{ to: '0x...', value: 1n }],
});

// Read balance (standard viem)
const balance = await publicClient.getBalance({ address: '0x...' });

// Read contract (standard viem)
const result = await publicClient.readContract({ address, abi, functionName, args });
```

---

## 9. Code Examples

### Example 1: Basic Setup

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

// Create clients
const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());
```

### Example 2: Batch Transactions

```typescript
// Send multiple transfers atomically
const hashes = await walletClient.sendTransactionBatch({
  transactions: [
    { to: '0xRecipient1', value: parseEther('1') },
    { to: '0xRecipient2', value: parseEther('2') },
    { to: '0xRecipient3', value: parseEther('3') },
  ],
});

console.log('Transaction hashes:', hashes);

// Wait for all receipts
const receipts = await walletClient.waitForTransactionBatch({
  hashes,
});
```

### Example 3: Batch Contract Calls

```typescript
import { encodeFunctionData } from 'viem';

const tokenAbi = [...];
const tokenAddress = '0x...';

const hashes = await walletClient.sendTransactionBatch({
  transactions: [
    {
      to: tokenAddress,
      data: encodeFunctionData({
        abi: tokenAbi,
        functionName: 'transfer',
        args: ['0xRecipient1', 1000n],
      }),
    },
    {
      to: tokenAddress,
      data: encodeFunctionData({
        abi: tokenAbi,
        functionName: 'transfer',
        args: ['0xRecipient2', 2000n],
      }),
    },
  ],
});
```

### Example 4: Combining with Standard Viem

```typescript
// The extended client still has all standard wallet actions
const walletClient = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

// Standard viem method
const singleHash = await walletClient.sendTransaction({
  to: '0x...',
  value: parseEther('1'),
});

// Radius-specific method
const batchHashes = await walletClient.sendTransactionBatch({
  transactions: [...],
});

// Standard viem method
const signedMessage = await walletClient.signMessage({
  message: 'Hello Radius!',
});
```

### Example 5: Using Actions Directly (Advanced)

```typescript
import { sendTransactionBatch } from '@radiustechsystems/sdk';

// Use the standalone action function
const hashes = await sendTransactionBatch(walletClient, {
  account,
  transactions: [...],
});
```

---

## Summary

### Key Changes for V2

1. **Add `radiusWalletActions()` decorator** - Main entry point for Radius functionality
2. **Create standalone action functions** - `sendTransactionBatch`, `waitForTransactionBatch`
3. **Enhance chain configuration** - Add formatters if needed for Radius-specific fields
4. **Deprecate `RadiusClient`** - Keep for backward compatibility, remove in next major
5. **Follow viem patterns** - Directory structure, type system, documentation style

### Benefits

1. **Standard viem API** - Users don't learn new patterns
2. **Tree-shakeable** - Import only what you use
3. **Composable** - Works with other viem extensions
4. **Type-safe** - Full TypeScript support
5. **Familiar** - Same pattern as zkSync, OP Stack, etc.

### What Radius Keeps

1. **Chain definitions** - `radius`, `radiusTestnet`
2. **Error hierarchy** - Rich error types
3. **Event utilities** - `getLogs`, watch functions
4. **The batch action** - Core differentiator

### What Radius Removes

1. **RadiusClient** - Replace with decorator pattern
2. **Wrapper methods** - Use viem directly for standard ops
3. **Custom extend()** - Use viem's built-in extend
