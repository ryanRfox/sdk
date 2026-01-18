# Documentation Plan: Radius Transaction Behavior

## Overview

This document outlines how to document the Radius transaction submission behavior for SDK users. The key insight is that **Radius does not have a traditional mempool** — transactions must arrive in nonce order.

---

## Developer Expectations vs Radius Reality

### What viem Provides

| viem Feature | Purpose | Works for tx batching? |
|--------------|---------|------------------------|
| `http({ batch: true })` | Batch RPC calls within time window | Technically, but not designed for it |
| `multicall()` | Batch contract reads | No - reads only |
| `sendCalls()` (EIP-5792) | Wallet-based batching | Requires wallet support |

**viem has no `sendTransactionBatch()`** - there's no built-in function for batching transactions.

### Standard Ethereum Pattern

On Ethereum, developers expect this to work:

```typescript
// Standard Ethereum pattern - developers expect this to work
const hashes = await Promise.all([
  client.sendTransaction({ nonce: 5 }),
  client.sendTransaction({ nonce: 7 }),  // Future nonce
  client.sendTransaction({ nonce: 6 }),  // Out of order
]);
// All succeed because mempool queues future nonces
```

**Developers expect the mempool to:**
1. Accept transactions with future nonces
2. Queue them until prior nonces arrive
3. Execute in nonce order regardless of submission order

### Radius Reality

Radius rejects future nonces immediately → the standard pattern fails ~50% of the time.

### Why This Matters

This is a **breaking assumption** for developers familiar with Ethereum. They will naturally use `Promise.all()` and experience intermittent failures. We must:

1. **Document prominently** - Can't be buried in footnotes
2. **Provide easy alternative** - `sendTransactionBatch()` helper makes the right pattern easy

---

## Code Examples: Standard EVM vs Radius

### Scenario: Send 3 Transactions

A developer needs to send 3 transactions from the same account (e.g., approve + swap + transfer).

### Standard EVM Developer Code (Ethereum, Arbitrum, etc.)

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

const account = privateKeyToAccount('0x...');
const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

// Standard pattern: fire all transactions, let mempool handle ordering
const [hash1, hash2, hash3] = await Promise.all([
  client.sendTransaction({ to: contractA, data: approveData }),
  client.sendTransaction({ to: contractB, data: swapData }),
  client.sendTransaction({ to: contractC, data: transferData }),
]);

// ✅ Works on Ethereum - mempool queues future nonces
// Even if hash2 arrives at the node before hash1, it waits in the mempool
console.log('All transactions submitted:', hash1, hash2, hash3);
```

**Why this works on Ethereum:**
- viem fetches nonce for each tx (gets N, N, N due to race)
- Actually, viem is smart - it tracks pending nonces locally
- But even if nonces arrive out of order, the mempool queues them
- The node executes them in nonce order once all arrive

### Same Code on Radius (FAILS ~50%)

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const account = privateKeyToAccount('0x...');
const client = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
});

// ❌ FAILS ON RADIUS - Same code, different result
const [hash1, hash2, hash3] = await Promise.all([
  client.sendTransaction({ to: contractA, data: approveData }),
  client.sendTransaction({ to: contractB, data: swapData }),
  client.sendTransaction({ to: contractC, data: transferData }),
]);

// Results:
// - hash1: might succeed (if it arrives first)
// - hash2: "Exec Failed" (arrived before hash1 was processed)
// - hash3: "Exec Failed" (arrived before hash1 was processed)
```

**Why this fails on Radius:**
- Multiple HTTP requests race to the RPC
- Network timing determines arrival order
- If nonce N+1 arrives before N is processed → rejected
- No mempool to queue future nonces

### Radius Developer Code: Option 1 - Sequential

```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const signer = privateKeyToAccount('0x...');

// ✅ Sequential: await each transaction before sending next
const hash1 = await client.sendTransaction(signer, { to: contractA, data: approveData });
const hash2 = await client.sendTransaction(signer, { to: contractB, data: swapData });
const hash3 = await client.sendTransaction(signer, { to: contractC, data: transferData });

console.log('All transactions submitted:', hash1, hash2, hash3);
```

**Pros:** Simple, always works
**Cons:** Slower - each tx must complete RPC round-trip before next is sent

### Radius Developer Code: Option 2 - Batch Helper (Recommended)

```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const signer = privateKeyToAccount('0x...');

// ✅ Batch: all transactions sent in single HTTP request
const hashes = await client.sendTransactionBatch(signer, [
  { to: contractA, data: approveData },
  { to: contractB, data: swapData },
  { to: contractC, data: transferData },
]);

console.log('All transactions submitted:', hashes);
// hashes = ['0x...', '0x...', '0x...']
```

**How `sendTransactionBatch` works internally:**
1. Get current nonce from RPC
2. Sign all transactions with sequential nonces (N, N+1, N+2)
3. Build JSON-RPC batch request: `[{eth_sendRawTransaction: tx1}, {eth_sendRawTransaction: tx2}, ...]`
4. Send single HTTP POST with batch
5. Parse responses, return array of hashes

**Pros:** Fast (single HTTP round-trip), reliable (100% success)
**Cons:** Requires SDK helper (not standard viem)

---

## API Design: `sendTransactionBatch`

### Proposed Signature

```typescript
/**
 * Sends multiple transactions in a single JSON-RPC batch request.
 * Transactions are automatically assigned sequential nonces.
 *
 * @param signer - The account to sign transactions with
 * @param transactions - Array of transaction requests (to, value, data, etc.)
 * @returns Array of transaction hashes in the same order as input
 *
 * @example
 * const hashes = await client.sendTransactionBatch(signer, [
 *   { to: '0x...', value: 1000000000000000000n },
 *   { to: '0x...', data: '0x...' },
 * ]);
 */
async function sendTransactionBatch(
  signer: Account,
  transactions: TransactionRequest[]
): Promise<Hash[]>
```

### Implementation Notes

1. **Nonce Management**
   - Fetch current nonce once at start
   - Assign N, N+1, N+2, ... to transactions in order
   - Do NOT rely on viem's internal nonce tracking

2. **Signing**
   - Sign all transactions before sending any
   - Use `signTransaction` from viem/accounts

3. **Batching**
   - Build JSON-RPC 2.0 batch: `[{jsonrpc: "2.0", method: "eth_sendRawTransaction", params: [signedTx], id: 0}, ...]`
   - Single `fetch()` call to RPC

4. **Response Handling**
   - Parse batch response: `[{result: "0x..."}, {result: "0x..."}, ...]`
   - Match by `id` to preserve order
   - Throw if any transaction fails (or return partial results?)

5. **Error Handling**
   - If one tx fails, what happens to others?
   - Options: fail-fast, return partial, return results with errors
   - Recommend: return array of `{hash?: string, error?: Error}` or throw on first error

---

## What Developers Need to Know

### The Core Concept

```
Traditional Ethereum:
  Submit tx(N+2) → queued in mempool (waits for N, N+1)
  Submit tx(N+1) → queued in mempool (waits for N)
  Submit tx(N)   → executes → N+1 executes → N+2 executes

Radius:
  Submit tx(N+2) → REJECTED ("nonce too high")
  Submit tx(N+1) → REJECTED ("nonce too high")
  Submit tx(N)   → executes
```

### Practical Implications

| Scenario | What Works | What Doesn't |
|----------|------------|--------------|
| Single transaction | Normal `sendTransaction` | — |
| Multiple transactions | Sequential OR JSON-RPC batch | Parallel individual HTTP requests |
| Pre-signing transactions | Must submit in nonce order | Can't submit future nonces early |

---

## Documentation Deliverables

### 1. New Guide: `docs/guides/transactions.mdx`

**Purpose:** Explain how to send transactions on Radius, with emphasis on multi-transaction scenarios.

**Sections:**
1. **Single Transaction** — Basic usage (same as quick-start)
2. **Multiple Transactions** — The key content
   - Why parallel requests fail
   - Solution 1: Sequential submission
   - Solution 2: JSON-RPC batching (recommended for throughput)
3. **Understanding Nonces** — How Radius handles nonces
4. **Error Reference** — Common errors and what they mean

**Code Examples:**
```typescript
// ❌ DON'T: This fails ~50% of the time
const results = await Promise.all([
  client.sendTransaction({ to: addr, value: 1n, nonce: 0 }),
  client.sendTransaction({ to: addr, value: 1n, nonce: 1 }),
  client.sendTransaction({ to: addr, value: 1n, nonce: 2 }),
]);

// ✅ DO: Sequential submission
for (const tx of transactions) {
  await client.sendTransaction(tx);
}

// ✅ DO: JSON-RPC batch (best throughput)
const hashes = await client.sendTransactionBatch(signer, transactions);
```

### 2. Update: `docs/guides/quick-start.mdx`

Add a note/callout after the "Send a Transaction" section:

```mdx
:::note Multiple Transactions
When sending multiple transactions, see the [Transactions Guide](/docs/guides/transactions)
for best practices. Radius requires transactions to be submitted in nonce order.
:::
```

### 3. API Reference Updates

Add JSDoc comments to relevant functions explaining the behavior:

```typescript
/**
 * Sends a transaction to the network.
 *
 * @remarks
 * When sending multiple transactions, they must be submitted in nonce order.
 * For best performance with multiple transactions, use {@link sendTransactionBatch}.
 *
 * @see {@link sendTransactionBatch} for sending multiple transactions efficiently
 */
```

### 4. (Optional) SDK Enhancement: `sendTransactionBatch`

Consider adding a helper function to make batching easy:

```typescript
/**
 * Sends multiple transactions as a JSON-RPC batch.
 *
 * This is the recommended way to send multiple transactions efficiently.
 * Transactions are automatically ordered by nonce.
 *
 * @example
 * ```typescript
 * const hashes = await client.sendTransactionBatch(signer, [
 *   { to: addr1, value: 1n },
 *   { to: addr2, value: 2n },
 *   { to: addr3, value: 3n },
 * ]);
 * ```
 */
async function sendTransactionBatch(
  signer: Account,
  transactions: TransactionRequest[]
): Promise<Hash[]>
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `docs/guides/transactions.mdx` | **Create** | New guide for transaction handling |
| `docs/guides/quick-start.mdx` | **Update** | Add callout about multiple transactions |
| `scripts/generate-guides.ts` | **Update** | Add transactions guide template |
| `src/client/client.ts` | **Optional** | Add `sendTransactionBatch` method |
| `src/client/client.ts` | **Update** | Enhance JSDoc comments |

---

## Guide Content Draft

### `docs/guides/transactions.mdx`

```mdx
---
title: Sending Transactions
description: How to send single and multiple transactions on Radius
---

# Sending Transactions

This guide covers how to send transactions on Radius, including best practices for
sending multiple transactions efficiently.

## Single Transaction

Sending a single transaction works like any EVM chain:

```typescript
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const signer = createPrivateKeySigner('0x...');

const receipt = await client.sendAndWait(signer, '0x...recipient', 1000000000000000000n);
```

## Multiple Transactions

:::warning Important
Radius does not queue future-nonce transactions like Ethereum mainnet does.
Transactions must arrive at the RPC in nonce order.
:::

### What Doesn't Work

```typescript
// ❌ This fails ~50% of the time due to network timing
const results = await Promise.all([
  client.sendTransaction(signer, tx1),
  client.sendTransaction(signer, tx2),
  client.sendTransaction(signer, tx3),
]);
```

When you fire multiple HTTP requests simultaneously, they may arrive at the RPC
out of order. If `tx2` arrives before `tx1`, it will be rejected with "nonce too high".

### Solution 1: Sequential Submission

The simplest approach is to await each transaction before sending the next:

```typescript
// ✅ Always works
const receipts = [];
for (const tx of transactions) {
  const receipt = await client.sendAndWait(signer, tx.to, tx.value);
  receipts.push(receipt);
}
```

### Solution 2: JSON-RPC Batch (Recommended)

For better throughput, use JSON-RPC batching. This sends all transactions in a
single HTTP request, and the RPC processes them in array order:

```typescript
// ✅ Best throughput
const hashes = await client.sendTransactionBatch(signer, [
  { to: addr1, value: 1n },
  { to: addr2, value: 2n },
  { to: addr3, value: 3n },
]);
```

## How Radius Handles Nonces

Unlike Ethereum mainnet, Radius does not have a mempool that queues transactions:

| Ethereum Mainnet | Radius |
|------------------|--------|
| Future nonces queued | Future nonces rejected |
| Wait until prior nonces arrive | Must submit in order |
| Transactions can arrive out of order | Transactions must arrive in order |

This design choice simplifies the sequencer and reduces latency, but requires
clients to be mindful of submission order.

## Error Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `Exec Failed` | Transaction arrived out of nonce order | Use sequential or batch submission |
| `nonce X too high` | Submitted future nonce before current | Submit in nonce order |
| `nonce X already used` | Duplicate nonce | Get fresh nonce and retry |

## Next Steps

- [API Reference](/docs/api) - Complete API documentation
- [Events Guide](/docs/guides/events) - Subscribing to blockchain events
```

---

## Implementation Steps

1. **Create the guide file**
   ```bash
   touch docs/guides/transactions.mdx
   ```

2. **Update generate-guides.ts** to include the new guide

3. **Update quick-start.mdx** with callout

4. **Optional: Implement `sendTransactionBatch`** in the SDK

5. **Regenerate docs**
   ```bash
   pnpm generate:docs
   ```

6. **Test the documentation** by reading through as a new developer would

---

## Questions for Product/Team

1. Should `sendTransactionBatch` be added to the SDK, or just documented as a pattern?
2. Is this behavior expected to be the same on mainnet?
3. Should we document the gas-free testnet behavior, or is that temporary?

---

## References

- Research findings: `research/TESTNET-TX-FINDINGS.md`
- Test script: `research/rpc-behavior-test.ts`
- Test results: `research/rpc-behavior-results.json`
