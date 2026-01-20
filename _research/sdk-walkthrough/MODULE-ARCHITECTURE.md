# Radius V2 SDK - Module Architecture

**Date:** 2026-01-19
**SDK Version:** v2.0.0-alpha.6
**Branch Analyzed:** main

This document provides a comprehensive walkthrough of each SDK module, explaining what it does, why it exists (vs using Viem directly), and how modules relate to each other.

---

## Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │           Main Entry Point          │
                    │          (index.ts)                 │
                    └─────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
   ┌────▼────┐                  ┌─────▼────┐                  ┌─────▼─────┐
   │ chains  │                  │  client  │                  │  errors   │
   └─────────┘                  └──────────┘                  └───────────┘
   (Foundation)                 (Core API)                    (Cross-cutting)
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼────┐     ┌──────▼─────┐    ┌──────▼─────┐
              │contracts │     │ transport  │    │  webauthn  │
              └──────────┘     └────────────┘    └────────────┘
              (Extensions)     (Infrastructure)  (Server-side)
                                      │
                              ┌───────▼───────┐
                              │    events     │
                              └───────────────┘
                              (Subscriptions)
```

---

## Module 1: `chains/` — The Foundation

### Purpose

Define Radius chain configurations that plug directly into Viem.

### Files

| File | Purpose |
|------|---------|
| `radius.ts` | Mainnet chain (ID: 723) |
| `radiusTestnet.ts` | Testnet chain (ID: 1223953) |
| `index.ts` | Re-exports both chains |

### Why It Exists

Radius isn't in Viem's chain registry yet. This module provides `viem.defineChain()` configurations for seamless integration.

### Key Code Reference

```typescript
// chains/radiusTestnet.ts:19-39
export const radiusTestnet = defineChain({
  id: 1223953,
  name: 'Radius Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.radiustech.xyz'],
    },
  },
  // ...
});
```

### Notable Difference from Standard Chains

The native currency is `USD`, not `ETH`. This is unusual for an EVM chain - no other major chain uses USD as its native token symbol with 18 decimals.

### Usage Pattern

```typescript
// These chains work identically to mainnet, sepolia, etc.
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { createPublicClient, http } from 'viem';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});
```

---

## Module 2: `client/` — The Core API

### Purpose

The primary interface for interacting with Radius. This is where the SDK adds significant value over raw Viem.

### Files

| File | Lines | Purpose |
|------|-------|---------|
| `client.ts` | ~1088 | `RadiusClient` implementation |
| `index.ts` | ~20 | Re-exports |

### Why It Exists (vs Raw Viem)

#### 1. Zero Gas Price Handling

Radius uses `gasPrice: 0n`. This is hardcoded in the SDK:

```typescript
// client.ts:623
const signedTx = await signer.signTransaction({
  // ...
  gasPrice: 0n, // Radius uses zero gas price
  chainId: config.chain.id,
});
```

Without the SDK, you'd need to remember this for every transaction.

#### 2. Convenience Methods

**Viem approach (verbose):**
```typescript
const hash = await walletClient.sendTransaction({ to, value });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

**Radius SDK approach:**
```typescript
const receipt = await client.sendAndWait(signer, to, value);
```

#### 3. Batch Transactions (Critical for Radius)

**This is the most important SDK feature.**

From `client.ts:317-319`:
> "Radius does not queue future-nonce transactions like Ethereum. This method ensures all transactions arrive in nonce order by using JSON-RPC batching."

In standard Ethereum, you can broadcast transactions with sequential nonces and the mempool queues them. **Radius doesn't do this.** If nonce 5 arrives before nonce 4, nonce 5 gets rejected.

The `sendTransactionBatch` method:
1. Gets current nonce once
2. Signs all transactions with sequential nonces
3. Sends all transactions in a single JSON-RPC batch request

```typescript
// client.ts:740-862
async sendTransactionBatch(
  signer: LocalAccount,
  transactions: BatchTransactionRequest[],
): Promise<Hash[]> {
  // Get current nonce once
  const startNonce = await publicClient.getTransactionCount({
    address: signer.address,
    blockTag: 'pending',
  });

  // Sign all transactions with sequential nonces
  const signedTxs = await Promise.all(
    transactions.map(async (tx, i) => {
      return signer.signTransaction({
        // ...
        nonce: startNonce + i,  // Sequential nonces
      });
    }),
  );

  // Build JSON-RPC batch request
  const batchRequest = signedTxs.map((raw, i) => ({
    jsonrpc: '2.0',
    id: i,
    method: 'eth_sendRawTransaction',
    params: [raw],
  }));

  // Send single HTTP POST request
  const response = await fetch(rpcUrl, { ... });
  // ...
}
```

#### 4. Gas Estimation with Safety Margin

The SDK applies a 20% safety margin and caps at `MAX_GAS`:

```typescript
// client.ts:156
export const MAX_GAS = 1319413953330n;

// client.ts:607-614
const margin = estimate / 5n;  // 20% margin
gas = estimate + margin;
if (gas > MAX_GAS) {
  gas = MAX_GAS;
}
```

Note: The `MAX_GAS` value (1.3 trillion) is suspiciously specific. Its origin is undocumented.

#### 5. Environment Variable Support

```typescript
// client.ts:519-525
if (typeof process !== 'undefined' && process.env) {
  const envUrl = process.env.RADIUS_RPC_URL || process.env.RADIUS_ENDPOINT;
  if (envUrl) {
    return envUrl;
  }
}
```

### Key Interfaces

```typescript
interface RadiusClient {
  readonly publicClient: PublicClient;  // Access to underlying viem client

  // Read operations
  getChainId(): Promise<bigint>;
  getBalance(params: GetBalanceParameters): Promise<bigint>;
  getCode(params: GetCodeParameters): Promise<Hex | undefined>;
  getTransactionCount(params: GetTransactionCountParameters): Promise<number>;

  // Write operations
  send(signer, to, value): Promise<Hash>;
  sendAndWait(signer, to, value): Promise<RadiusReceipt>;
  sendTransactionBatch(signer, transactions): Promise<Hash[]>;

  // Contract operations
  readContract<T>(params): Promise<T>;
  writeContract(params): Promise<Hash>;
  deployContract(signer, bytecode, abi, ...args): Promise<{ address, receipt }>;

  // Extension
  extend<T>(extender: (client) => T): RadiusClient & T;
  getContract<TAbi>(params): TypedContract<TAbi>;
}
```

### Extend Pattern

The SDK supports Viem's extend pattern:

```typescript
const client = createRadiusClient({ chain: radiusTestnet }).extend((base) => ({
  async getBalanceFormatted(address: Address) {
    const balance = await base.getBalance({ address });
    return formatEther(balance);
  },
}));
```

---

## Module 3: `contracts/` — Typed Contract Helper

### Purpose

Provide autocomplete-friendly contract interactions with clear read/write separation.

### Files

| File | Purpose |
|------|---------|
| `typedContract.ts` | `getContract()` helper and types |
| `index.ts` | Re-exports |

### Why It Exists

Viem's `getContract` returns a typed contract, but the Radius SDK provides cleaner ergonomics:

### Key Difference from Viem

Write methods default to **waiting for receipt**. You can opt-out:

```typescript
// Default: waits for receipt
const receipt = await token.write.transfer({
  args: ['0x...', 1000n],
  signer: account,
});

// Opt-out: just get hash
const hash = await token.write.transfer({
  args: ['0x...', 1000n],
  signer: account,
  options: { wait: false },
});
```

This is implemented with a conditional return type:

```typescript
// typedContract.ts:29
export type WriteResult<TWait extends boolean | undefined> = TWait extends false
  ? Hash
  : RadiusReceipt;
```

### Implementation Detail

Uses JavaScript Proxy for dynamic method access:

```typescript
// typedContract.ts:127-145
const read = new Proxy({}, {
  get(_target, functionName: string) {
    return async (...callArgs: unknown[]) => {
      const args = callArgs.length === 1 && Array.isArray(callArgs[0])
        ? callArgs[0]
        : callArgs;
      return client.readContract({
        address,
        abi,
        functionName,
        args,
      });
    };
  },
});
```

---

## Module 4: `errors/` — Rich Error Hierarchy

### Purpose

Structured error handling that extends Viem's `BaseError` for ecosystem compatibility.

### Files

| File | Purpose |
|------|---------|
| `base.ts` | `RadiusError` base class |
| `account.ts` | Account-related errors |
| `contract.ts` | Contract errors |
| `transaction.ts` | Transaction errors |
| `index.ts` | Re-exports and type unions |

### Why It Exists

Viem errors are generic. Radius SDK provides specific error types with additional context:

- `InsufficientBalanceError` - includes `balance` and `required` amounts
- `TransactionRevertedError` - includes transaction hash
- `BatchTransactionError` - includes per-transaction results

### Viem Compatibility

```typescript
// errors/base.ts:53
export class RadiusError extends BaseError {
```

This means `error instanceof BaseError` from Viem catches Radius errors - important for WAGMI integration.

### Error Type Unions

Useful for TypeScript narrowing:

```typescript
// errors/index.ts:68-75
export type SendTransactionErrorType =
  | InsufficientBalanceError
  | TransactionFailedError
  | TransactionRevertedError
  | TransactionTimeoutError
  | SignerNotFoundError
  | GasEstimationError
  | NonceError;
```

---

## Module 5: `transport/` — HTTP Interceptors

### Purpose

Add logging and response interception to JSON-RPC calls for debugging.

### Files

| File | Purpose |
|------|---------|
| `interceptor.ts` | HTTP transport with interception |
| `websocket.ts` | WebSocket transport helper |
| `types.ts` | Type definitions |
| `index.ts` | Re-exports |

### Why It Exists

Debugging blockchain interactions is hard. This module enables:

```typescript
// Logging all requests/responses
const client = createRadiusClient({
  chain: radiusTestnet,
  logger: console.log,
});

// Response interception
const client = createRadiusClient({
  chain: radiusTestnet,
  interceptor: async (reqBody, response) => {
    // Custom response handling
    return response;
  },
});
```

### Implementation Detail

When only logging is needed (no interceptor), it uses Viem's native `http()` transport with callbacks for better performance. When interception is needed, it falls back to a custom transport.

```typescript
// interceptor.ts:178-201
if (!interceptor) {
  return http(url, {
    timeout,
    retryCount,
    retryDelay,
    onFetchRequest: logger ? (request) => { ... } : undefined,
    onFetchResponse: logger ? (response) => { ... } : undefined,
  });
}
```

---

## Module 6: `events/` — Event Subscriptions

### Purpose

Real-time event watching and historical log queries with Radius-specific optimizations.

### Files

| File | Purpose |
|------|---------|
| `getLogs.ts` | Historical queries with pagination |
| `watchTransfer.ts` | ERC-20 Transfer events |
| `watchApproval.ts` | ERC-20 Approval events |
| `watchBlock.ts` | Block/pending tx watching |
| `watchLogs.ts` | Generic log watching |
| `decodeEventLogs.ts` | Event decoding utilities |
| `index.ts` | Re-exports |

### Why It Exists (vs Raw Viem)

#### 1. Radius Block Range Restrictions

Viem's `getLogs` assumes unlimited block ranges. Radius restricts this.

```typescript
// getLogs.ts:77-141
export async function getLogs(client: PublicClient, params: GetLogsParams): Promise<Log[]> {
  const { chunkSize = 1000 } = params;

  // Process in chunks
  for (let currentFrom = fromBlock; currentFrom <= toBlock; currentFrom += BigInt(chunkSize)) {
    const currentTo = currentFrom + BigInt(chunkSize) - 1n > toBlock
      ? toBlock
      : currentFrom + BigInt(chunkSize) - 1n;

    const chunkLogs = await client.getLogs({
      address,
      fromBlock: currentFrom,
      toBlock: currentTo,
    });
    // ...
  }
}
```

Also provides adaptive version that auto-reduces chunk size on errors:

```typescript
// getLogs.ts:204-252
export async function getLogsAdaptive(...) {
  while (currentChunkSize >= minChunkSize) {
    try {
      return await getLogs(client, { chunkSize: currentChunkSize, ... });
    } catch (error) {
      if (errorMessage.includes('block range is too wide')) {
        currentChunkSize = Math.floor(currentChunkSize / 2);
        continue;
      }
      throw error;
    }
  }
}
```

#### 2. Typed Event Wrappers

```typescript
// watchTransfer.ts:91-141
export function watchTransfer(
  client: PublicClient,
  params: WatchTransferParameters,
): WatchContractEventReturnType {
  return client.watchContractEvent({
    address: params.address,
    abi: erc20Abi,
    eventName: 'Transfer',
    onLogs: (logs) => {
      const events: TransferEvent[] = logs.map((log) => {
        const decoded = decodeEventLog({ abi: erc20Abi, ... });
        return {
          from: decoded.args.from,
          to: decoded.args.to,
          value: decoded.args.value,
          log,
        };
      });
      params.onTransfer(events);
    },
  });
}
```

#### 3. Bidirectional Address Watching

When watching both sent AND received transfers for an address, the SDK creates two subscriptions and deduplicates:

```typescript
// watchTransfer.ts:239-287
// Watch both: need to create two separate subscriptions
// This is a limitation of eth_subscribe - can't do OR filters
const seenEvents = new Set<string>();

const unwatchFrom = watchTransfer(client, { from: params.watchAddress, ... });
const unwatchTo = watchTransfer(client, { to: params.watchAddress, ... });

return () => {
  unwatchFrom();
  unwatchTo();
};
```

---

## Module 7: `webauthn/` — Server-Side Passkey Management

### Purpose

Backend handlers for WebAuthn credential management. **This module is not Viem-related** - it's for building servers that support passkey authentication.

### Files

| File | Purpose |
|------|---------|
| `Handler.ts` | HTTP request handlers |
| `Kv.ts` | Key-value store abstraction |
| `errors.ts` | WebAuthn-specific errors |
| `types.ts` | Type definitions |
| `internal/requestListener.ts` | Node.js adapter |

### Components

**Handler** - HTTP request handlers built on `@remix-run/fetch-router`

```typescript
// Handler.ts:112-254
export function keyManager(options: KeyManagerOptions): Handler {
  // GET /challenge - Generate WebAuthn challenge
  router.get(`${path}/challenge`, async () => {
    const challenge = `0x${...}` as Hex;
    await kv.set(`challenge:${challenge}`, '1');
    return Response.json({ challenge, rp: rpConfig });
  });

  // GET /:id - Get public key for credential
  router.get(`${path}/:id`, async ({ params }) => {
    const publicKey = await kv.get<Hex>(`credential:${id}`);
    return Response.json({ publicKey });
  });

  // POST /:id - Store public key for credential
  router.post(`${path}/:id`, async ({ params, request }) => {
    // Validates challenge, type, origin, user presence
    await kv.set(`credential:${id}`, publicKey);
    return new Response(null, { status: 204 });
  });
}
```

**Kv** - Key-value store abstraction

```typescript
// Kv.ts:94-107
export function memory(): Kv {
  const store = new Map<string, unknown>();
  return {
    async delete(key) { store.delete(key); },
    async get(key) { return store.get(key); },
    async set(key, value) { store.set(key, value); },
  };
}

// Kv.ts:137-143
export function cloudflare(kv: cloudflare.Parameters): Kv {
  return {
    delete: kv.delete.bind(kv),
    get: kv.get.bind(kv),
    set: kv.put.bind(kv),  // Cloudflare uses 'put'
  };
}
```

### Usage

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';

const handler = Handler.keyManager({
  kv: Kv.memory(),  // or Kv.cloudflare(env.KV)
  path: '/api/credentials',
  rp: { id: 'example.com', name: 'My App' },
});

// Express.js
app.use(handler.listener);

// Cloudflare Workers
export default { fetch: handler.fetch };
```

---

## Module Relationships

```
┌─────────────┐
│   chains    │ ─── Foundation for all other modules
└─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   client    │ ◄── │  transport  │  Client uses transport for HTTP
└─────────────┘     └─────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  contracts  │    │   errors    │  Client throws errors, uses contracts
└─────────────┘    └─────────────┘
                          ▲
                          │
                   ┌─────────────┐
                   │   events    │  Events uses transport, throws errors
                   └─────────────┘

┌─────────────┐
│  webauthn   │ ─── Standalone module, no SDK dependencies
└─────────────┘
```

---

## Documentation vs Implementation Gaps

### Verified Accurate

- Quick Start guide matches implementation
- Migration guide correctly documents breaking changes
- API reference exports match package.json

### Missing Documentation

1. **`sendTransactionBatch`** - Critical method with no dedicated guide explaining why it's necessary for Radius
2. **`MAX_GAS` constant** - Origin undocumented (1319413953330n is suspiciously specific)
3. **Block range restrictions** - No guide explaining when to use `getLogs` vs raw viem

### Documentation Path Mismatch (Fixed in alpha.6)

The previous audit noted docs said `/server` but path was `/webauthn`. This appears resolved in the current version.
