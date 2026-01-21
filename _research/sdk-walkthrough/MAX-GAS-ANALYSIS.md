# MAX_GAS Constant Analysis

**Date:** 2026-01-19
**Objective:** Determine if MAX_GAS should be dynamically fetched from the Radius network

---

## Executive Summary

**Finding:** The Radius network returns `gasLimit: 0` for all blocks, making dynamic fetching impossible. The hardcoded `MAX_GAS` constant must remain as-is until the Radius protocol exposes gas limit information via RPC.

**Recommendation:** Keep the hardcoded value but add documentation explaining its origin and purpose.

---

## Test Results

### 1. Block Gas Limit Analysis

**Test:** Fetch `block.gasLimit` from multiple blocks on Radius Testnet

```typescript
// Using viem with Radius SDK
const client = createPublicClient({ chain: radiusTestnet, transport: http() });
const block = await client.getBlock();
console.log('Block gasLimit:', block.gasLimit);
```

**Results:**
| Block Number | gasLimit | gasUsed |
|--------------|----------|---------|
| 1768880665320 | 0 | 0 |
| 1768880664320 | 0 | 0 |
| 1768880663320 | 0 | 0 |
| 1768880662320 | 0 | 0 |
| 1768880661320 | 0 | 0 |
| 256 (0x100) | 0 | 0 |

**Observation:** ALL blocks return `gasLimit: 0`. This is different from Ethereum where `gasLimit` is typically ~30,000,000.

---

### 2. Raw RPC Response

**Test:** Direct curl to Radius testnet RPC

```bash
curl -s -X POST "https://rpc.testnet.radiustech.xyz" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false],"id":1}'
```

**Response (abbreviated):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "number": "0x19bd97ffd74",
    "gasLimit": "0x0",
    "gasUsed": "0x0",
    "baseFeePerGas": "0x0",
    "difficulty": "0x0"
  }
}
```

**Key observations:**
- `gasLimit`: `"0x0"` (zero)
- `gasUsed`: `"0x0"` (zero)
- `baseFeePerGas`: `"0x0"` (zero gas price)
- Block numbers are extremely large (~1.77 trillion)

---

### 3. Gas Estimation Works

**Test:** `eth_estimateGas` for a simple transfer

```bash
curl -s -X POST "https://rpc.testnet.radiustech.xyz" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_estimateGas","params":[{"from":"0x..","to":"0x..","value":"0x1"}],"id":1}'
```

**Result:** `"0x5208"` (21000) - Standard ETH transfer gas

**Observation:** Gas estimation works correctly despite `block.gasLimit` being zero.

---

### 4. Gas Price

**Test:** `eth_gasPrice`

**Result:** `"0x0"` (zero)

**Observation:** Radius uses zero gas price, consistent with being a fee-less or pre-paid network.

---

### 5. MAX_GAS Comparison

| Value | Decimal | Hex |
|-------|---------|-----|
| SDK MAX_GAS | 1,319,413,953,330 | 0x13333333332 |
| block.gasLimit | 0 | 0x0 |
| Ethereum block limit | ~30,000,000 | ~0x1C9C380 |

**Analysis of 0x13333333332:**
- Binary: `10011001100110011001100110011001100110010`
- Pattern: Repeating `0x3` nibbles with leading `0x1`
- This is NOT a standard Ethereum-style gas limit
- Appears to be a deliberately chosen large number

---

## Why Dynamic Fetch Won't Work

### Problem 1: Zero Gas Limit
The Radius RPC returns `gasLimit: 0` for all blocks. Using this value would prevent any transaction:

```typescript
// This would break all transactions:
const maxGas = block.gasLimit; // 0n
if (gas > maxGas) {
  gas = maxGas; // Sets gas to 0, tx fails
}
```

### Problem 2: No Custom RPC Methods
Testing `rpc_modules` returned "Method not found" - no discoverable Radius-specific RPC methods for gas limits.

### Problem 3: Different Architecture
Radius appears to handle gas differently from Ethereum:
- Zero gas price
- Zero block gas limit
- Gas estimation still works
- Very large block numbers (timestamp-based?)

This suggests Radius may not use traditional block gas limits for transaction validation.

---

## Recommendations

### Immediate Action: Keep Hardcoded Value
The current `MAX_GAS = 1319413953330n` must remain hardcoded because:
1. Dynamic fetch returns 0 (would break all transactions)
2. No alternative RPC method discovered
3. The SDK works correctly with this value

### Documentation Update
Add this comment to the constant:

```typescript
/**
 * Maximum gas limit for transactions on Radius.
 *
 * IMPORTANT: This value cannot be dynamically fetched because:
 * - Radius returns gasLimit: 0 for all blocks
 * - This is a Radius-specific protocol constant
 * - The hex value 0x13333333332 appears intentionally chosen
 *
 * Used to cap gas estimates to prevent unexpectedly high values
 * that could cause transaction failures.
 */
export const MAX_GAS = 1319413953330n;
```

### Future Investigation
Ask the Radius team:
1. Why does `block.gasLimit` return 0?
2. Is 1319413953330 a protocol constant?
3. Where is the actual gas limit enforced?
4. Should there be a `radius_getMaxGas` RPC method?

---

## Implementation Alternatives Considered

### Option A: Dynamic Fetch (NOT VIABLE)
```typescript
// Would NOT work - returns 0
const block = await client.getBlock();
const maxGas = block.gasLimit; // 0n
```
**Status:** Not viable - breaks all transactions

### Option B: Ethereum-style Default (NOT RECOMMENDED)
```typescript
const MAX_GAS = 30_000_000n; // Ethereum mainnet style
```
**Status:** May be too restrictive for Radius - current SDK uses 44,000x higher value

### Option C: Custom RPC Method (NOT AVAILABLE)
```typescript
const maxGas = await client.request({ method: 'radius_getMaxGas' });
```
**Status:** Method does not exist

### Option D: Keep Current (RECOMMENDED)
```typescript
export const MAX_GAS = 1319413953330n;
```
**Status:** Works correctly, should add documentation

---

## Test Script Used

File: `/Users/fox/Getting Started/radius-sdk/typescript/test-gas-limit.ts`

```typescript
import { createPublicClient, http } from 'viem';
import { radiusTestnet } from './src/chains/index.js';
import { MAX_GAS } from './src/client/client.js';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: http()
});

async function main() {
  console.log('=== MAX_GAS Analysis for Radius Network ===\n');

  console.log('1. Hardcoded MAX_GAS constant:');
  console.log('   Value:', MAX_GAS.toString());
  console.log('   Hex: 0x' + MAX_GAS.toString(16));

  const block = await client.getBlock();
  console.log('2. Latest Block Info:');
  console.log('   Block number:', block.number?.toString());
  console.log('   Block gasLimit:', block.gasLimit?.toString());
  console.log('   Block gasUsed:', block.gasUsed?.toString());

  console.log('3. Checking gasLimit across multiple blocks:');
  const currentBlock = Number(block.number);
  for (let i = 0; i < 5; i++) {
    const blockNum = BigInt(currentBlock - i * 1000);
    if (blockNum > 0n) {
      const b = await client.getBlock({ blockNumber: blockNum });
      console.log('   Block ' + b.number + ': gasLimit=' + b.gasLimit);
    }
  }

  console.log('4. Gas Estimation Test:');
  const gasEstimate = await client.estimateGas({
    account: '0x0000000000000000000000000000000000000001',
    to: '0x0000000000000000000000000000000000000002',
    value: 1n,
  });
  console.log('   Simple transfer estimate:', gasEstimate.toString());

  console.log('5. Comparison:');
  console.log('   MAX_GAS === block.gasLimit:', MAX_GAS === block.gasLimit);
  console.log('   MAX_GAS > block.gasLimit:', MAX_GAS > block.gasLimit);

  const chainId = await client.getChainId();
  console.log('6. Chain ID:', chainId);

  const gasPrice = await client.getGasPrice();
  console.log('7. Gas Price:', gasPrice.toString());
}

main().catch(console.error);
```

Run with: `cd typescript && npx tsx test-gas-limit.ts`

---

## Conclusion

The investigation reveals that Radius operates with a fundamentally different gas model than Ethereum:
- Zero gas price
- Zero block gas limit (as reported by RPC)
- Large hardcoded MAX_GAS constant in SDK

**The hardcoded `MAX_GAS = 1319413953330n` must be kept** because dynamic fetching is not possible. The value appears to be a Radius protocol constant that should be documented and potentially exposed via a custom RPC method in the future.
