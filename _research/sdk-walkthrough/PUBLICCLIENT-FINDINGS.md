# PublicClient vs RadiusClient Findings

**Date:** 2026-01-19 (Updated)
**Test Branch:** research/findings
**Test Account:** Anvil Account #1 (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)

---

## Executive Summary

~~**Root Cause:** Radius only supports legacy transactions. Viem's WalletClient defaults to EIP-1559 transactions, which Radius rejects.~~

**CORRECTION (2026-01-19):** The above was **WRONG**. Radius supports ALL transaction types including EIP-1559. The previous test failures were caused by sending to precompile addresses (0x01), which have a gas estimation bug on Radius.

**Actual Finding:** RadiusClient is **not necessary** for basic operations. Standard viem works without any special configuration.

**RadiusClient's Only Essential Feature:** `sendTransactionBatch()` for handling multiple transactions in no-mempool environment.

---

## Corrected Test Results

### Reading Operations (PublicClient)

| Operation | Result |
|-----------|--------|
| `getBalance()` | Works |
| `getChainId()` | Works (1223953) |
| `getGasPrice()` | Works (returns 0n) |
| `getBlockNumber()` | Works |
| `estimateGas()` | Works |
| `getBlock()` | Works |
| `getTransaction()` | Works |
| `getTransactionReceipt()` | Works |

**Verdict:** PublicClient works perfectly for all read operations.

### Writing Operations (WalletClient) - CORRECTED

| Transaction Type | Configuration | Result |
|-----------------|---------------|--------|
| Legacy (Type 0) | `type: 'legacy', gasPrice: 0n` | **Works** |
| EIP-2930 (Type 1) | `type: 'eip2930', accessList: [], gasPrice: 0n` | **Works** |
| EIP-1559 (Type 2) | `type: 'eip1559', maxFeePerGas: 0n, maxPriorityFeePerGas: 0n` | **Works** |
| Default (no type) | Let viem decide | **Works** (viem chooses EIP-1559) |
| Just gasPrice: 0n | No explicit type | **Works** |

**Verdict:** ALL transaction types work on Radius. No special configuration needed.

### Batch Transactions

| Method | Result | Notes |
|--------|--------|-------|
| Sequential sends | Works | Slow (~350ms per tx) |
| Parallel Promise.all | **Fails** | Nonce collision (expected) |
| RadiusClient.sendTransactionBatch | Works | Fast, handles nonces |

**Verdict:** `sendTransactionBatch()` is the only RadiusClient feature with no viem equivalent.

---

## Why Previous Tests Failed

The original tests used address `0x0000000000000000000000000000000000000001` (a precompile) as the recipient. Precompile addresses have a gas estimation bug on Radius that causes transactions to revert.

When testing with regular EOA addresses (Account #2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8), all transaction types work correctly.

---

## Using Viem Directly (Without RadiusClient)

Standard viem works without any special configuration:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
});

// This just works - no special config needed
const hash = await walletClient.sendTransaction({
  to: recipient,
  value: amount,
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

**No need for:**
- `type: 'legacy'` - EIP-1559 works fine
- `gasPrice: 0n` - viem auto-detects from chain

---

## When RadiusClient IS Needed

### 1. Batch Transactions (Essential)

The only feature with no viem equivalent:

```typescript
// This cannot be done with raw viem due to nonce management
const hashes = await radiusClient.sendTransactionBatch(signer, [
  { to: recipient1, value: amount1 },
  { to: recipient2, value: amount2 },
  { to: recipient3, value: amount3 },
]);
```

### 2. Convenience (Optional)

```typescript
// RadiusClient - slightly shorter
const receipt = await client.sendAndWait(signer, to, value);

// Raw viem - two lines
const hash = await walletClient.sendTransaction({ to, value });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

---

## Recommendations

### Option A: Minimal SDK

Export only what's actually needed:
1. Chain configuration (`radiusTestnet`)
2. `sendTransactionBatch()` utility function

### Option B: Keep RadiusClient as Convenience Layer

Keep the full RadiusClient but update documentation:
- "RadiusClient is optional for single transactions"
- "Standard viem works without special configuration"
- "Use RadiusClient for batch transactions"

### Option C: Document Both Approaches

Provide examples for both:
1. "Quick start with RadiusClient" (easy path)
2. "Using raw viem" (for existing viem projects)

---

## Test Scripts

| Script | Purpose |
|--------|---------|
| `typescript/scripts/viem-radius-comprehensive-test.ts` | Full test of all transaction types |
| `typescript/scripts/publicclient-test.ts` | Initial comparison (outdated conclusions) |
| `typescript/scripts/debug-tx-difference.ts` | Transaction type analysis |
| `typescript/scripts/final-tx-test.ts` | Isolated parameter testing |

Run comprehensive test:
```bash
cd typescript && npx tsx scripts/viem-radius-comprehensive-test.ts
```

---

## Open Question: MAX_GAS

The `MAX_GAS` constant (1319413953330n) is hardcoded in `client.ts:157`. Origin unknown.

This value is used to cap gas estimates. If this value is wrong, transactions could fail.

Need clarification: Where does this number come from?

---

## Related Documents

- [VIEM-RADIUS-TEST-RESULTS.md](./VIEM-RADIUS-TEST-RESULTS.md) - Detailed test results with transaction hashes
