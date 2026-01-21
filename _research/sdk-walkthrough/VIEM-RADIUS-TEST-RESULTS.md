# Comprehensive Viem vs RadiusClient Test Results

**Date:** 2026-01-19
**Test Script:** `typescript/scripts/viem-radius-comprehensive-test.ts`
**Network:** Radius Testnet (Chain ID: 1223953)

---

## Executive Summary

**CRITICAL CORRECTION:** The previous finding that "Radius only supports legacy transactions" is **WRONG**.

**Actual Finding:** Radius supports **ALL** transaction types (Legacy, EIP-2930, EIP-1559). The previous test failures were caused by using precompile addresses (0x01) which have a gas estimation bug, not by transaction type rejection.

### Key Conclusions

| Question | Answer |
|----------|--------|
| Does viem's WalletClient work on Radius? | **YES** - Works with all transaction types |
| Is RadiusClient necessary for basic transactions? | **NO** - Raw viem works fine |
| Is configuration needed for viem? | **MINIMAL** - Just omit gas params or set to 0n |
| Is sendTransactionBatch essential? | **YES** - For parallel transaction scenarios |
| Can RadiusClient be eliminated? | **Partially** - sendTransactionBatch is the only essential feature |

---

## Test Results Matrix

### Section 1: Read Operations (PublicClient)

| Operation | Result | Details |
|-----------|--------|---------|
| getBalance() | PASS | Returns USD balance correctly |
| getChainId() | PASS | Returns 1223953 |
| getBlockNumber() | PASS | Works correctly |
| getGasPrice() | PASS | Returns 0n (Radius is gasless) |
| estimateGas() - EOA | PASS | Returns 21000 for simple transfer |
| getBlock() | PASS | Returns block with transactions |

**Verdict:** All read operations work perfectly with standard viem PublicClient.

---

### Section 2: Write Operations - Transaction Types

Testing transactions from Account #1 to Account #2 (both regular EOAs, not precompiles).

| Transaction Type | Configuration | Result | Transaction Hash |
|-----------------|---------------|--------|------------------|
| Legacy (Type 0) | `type: 'legacy', gasPrice: 0n` | **PASS** | 0x2dee8d057f6a82a9d21e39ed54f7fdbb7d5a99846ff04ee47873d30f3c5a2bab |
| EIP-2930 (Type 1) | `type: 'eip2930', accessList: [], gasPrice: 0n` | **PASS** | 0xed67793e598729fa3d34f779f1b03f815664f54486f585744ecd2dd95d2f6cf2 |
| EIP-1559 (Type 2) | `type: 'eip1559', maxFeePerGas: 0n, maxPriorityFeePerGas: 0n` | **PASS** | 0xd3ce5f49e26fa35a2f52fd224fc9e9b1c071fbe19966d5aa779f0181bfd62633 |
| Default (viem choice) | No type specified | **PASS** | 0xb6448eb45dcf37b7e0aa6dc99b7f426f8926e416d2bde243b3682550e2a7bf54 |
| Just gasPrice: 0n | `gasPrice: 0n` only | **PASS** | 0x37b400396c8834656490e64bfd8c3f42fc2565838c996e374dfd1ba96053e980 |

**Critical Finding:** When no type is specified, viem prepares type `eip1559` and it **WORKS FINE** on Radius.

**Verdict:** Radius supports ALL transaction types. The previous "legacy only" conclusion was incorrect.

---

### Section 3: Batch Transaction Tests

| Test | Result | Time (ms) | Notes |
|------|--------|-----------|-------|
| Sequential WalletClient (3 txs) | **PASS** | 1048 | Works, but slower |
| Parallel WalletClient (Promise.all) | **FAIL** | - | Nonce collision (expected) |
| RadiusClient.sendTransactionBatch | **PASS** | 521 | Faster, handles nonces |

**Analysis:**
- Sequential sends work but are slow (~350ms per transaction)
- Parallel sends fail due to nonce collision - this is expected behavior
- sendTransactionBatch is 2x faster and handles nonce ordering automatically

**Verdict:** `sendTransactionBatch` is essential for multi-transaction scenarios.

---

### Section 4: Contract Interactions

| Test | Result | Notes |
|------|--------|-------|
| Deploy contract | **PASS** | Contract deployed successfully (0x0ae7c6989862798bcef5c95647a1abef4f11bcc8) |
| Read contract | **FAIL** | Invalid bytecode in test (not Radius issue) |
| Write contract (WalletClient) | **FAIL** | Invalid bytecode in test (not Radius issue) |
| Write contract (RadiusClient) | **FAIL** | Invalid bytecode in test (not Radius issue) |

**Note:** Contract test failures are due to test bytecode issues (InvalidJump error), not Radius limitations. Contract deployment itself succeeded.

---

### Section 5: Gas Estimation Accuracy

| Scenario | Estimated | Actual Used | Accuracy |
|----------|-----------|-------------|----------|
| EOA Transfer | 21000 | 21000 | 100% |

**Verdict:** Gas estimation is accurate for simple transfers.

---

### Section 6: Get Transaction / Receipt

| Operation | Result | Notes |
|-----------|--------|-------|
| getTransaction() | **PASS** | Returns full transaction details |
| getTransactionReceipt() | **PASS** | Returns receipt with status |

---

## What RadiusClient Actually Provides

### Essential Features (Can't do with raw viem)

| Feature | Why Essential |
|---------|---------------|
| `sendTransactionBatch()` | Handles nonce ordering for parallel sends; uses JSON-RPC batching |

### Convenience Features (Can do with raw viem, but RadiusClient is easier)

| Feature | RadiusClient | Raw viem |
|---------|-------------|----------|
| sendAndWait() | One line | Two lines (send + wait) |
| Gas margin | Automatic 20% | Manual calculation |
| Zero gas price | Automatic | Must specify `gasPrice: 0n` or let viem default |
| Contract deployment | One method | Manual bytecode handling |

---

## Recommended Configuration for Raw Viem

If using viem directly without RadiusClient:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Create clients - standard viem setup
const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
});

// Option 1: Let viem default (works fine)
const hash1 = await walletClient.sendTransaction({
  to: recipient,
  value: amount,
});

// Option 2: Explicit zero gas (also works)
const hash2 = await walletClient.sendTransaction({
  to: recipient,
  value: amount,
  gasPrice: 0n,
});

// Option 3: Explicit type (all work)
const hash3 = await walletClient.sendTransaction({
  to: recipient,
  value: amount,
  type: 'eip1559',
  maxFeePerGas: 0n,
  maxPriorityFeePerGas: 0n,
});
```

---

## Recommendations

### Option A: Simplify RadiusClient to Batch-Only

RadiusClient could be reduced to just:
1. `sendTransactionBatch()` - Essential for no-mempool environment
2. Chain configuration export

Everything else can use standard viem.

### Option B: Keep RadiusClient as Convenience Layer

Keep RadiusClient but document:
- "RadiusClient is optional for single transactions"
- "Use sendTransactionBatch for multiple transactions"
- "Raw viem works without special configuration"

### Option C: Remove RadiusClient, Export Utility Function

```typescript
// New minimal export
export { radiusTestnet } from './chains';
export { sendTransactionBatch } from './utils';
```

---

## Correcting Previous Findings

### Previous Claim (WRONG)
> "Radius only supports legacy transactions. Viem's WalletClient defaults to EIP-1559 transactions, which Radius rejects."

### Actual Finding (CORRECT)
> "Radius supports all transaction types (Legacy, EIP-2930, EIP-1559). Viem's default EIP-1559 transactions work correctly. Previous test failures were caused by using precompile addresses (0x01), not by transaction type rejection."

---

## Test Environment

- **Node Version:** 22+
- **Viem Version:** 2.x (peer dependency)
- **Test Accounts:** Anvil well-known accounts with USD on testnet
- **RPC:** https://rpc.testnet.radiustech.xyz

---

## Raw Test Output

```
Total: 21 | Passed: 17 | Failed: 4

Failures:
1. Parallel WalletClient - Expected (nonce collision)
2-4. Contract tests - Test bytecode issue (not Radius)

All transaction type tests: PASSED
All read operation tests: PASSED
Batch transaction tests: PASSED (except expected parallel failure)
```
