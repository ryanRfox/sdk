# EIP-1559 Support Research for Radius Network

**Date**: 2026-01-19
**Researcher**: Claude Code
**Network**: Radius Testnet (https://rpc.testnet.radiustech.xyz)
**Chain ID**: 1223953 (0x12ad11)

## Executive Summary

**FINDING: Radius Network FULLY SUPPORTS EIP-1559 (Type 2) transactions.**

The previous observation that EIP-1559 transactions "failed" was due to a **gas estimation bug**, NOT lack of EIP-1559 support. The network's `eth_estimateGas` RPC method underestimates gas requirements for certain transaction types (particularly when interacting with precompile addresses).

## Test Methodology

Tests were performed using:
1. Direct curl commands to the RPC endpoint
2. Foundry's `cast` tool
3. Viem library with explicit transaction type specification

Test account: Anvil Account #1
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

---

## Part 1: RPC Capability Check

### 1.1 eth_gasPrice

```bash
curl -s -X POST https://rpc.testnet.radiustech.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'
```

**Response:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x0"}
```

**Analysis:** Returns 0 - Radius has zero gas price (gasless network).

### 1.2 eth_maxPriorityFeePerGas (EIP-1559 specific)

```bash
curl -s -X POST https://rpc.testnet.radiustech.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_maxPriorityFeePerGas","params":[],"id":2}'
```

**Response:**
```json
{"jsonrpc":"2.0","id":2,"result":"0x0"}
```

**Analysis:** Method exists and returns 0. This RPC method is EIP-1559 specific - its presence indicates EIP-1559 support.

### 1.3 eth_feeHistory (EIP-1559 specific)

```bash
curl -s -X POST https://rpc.testnet.radiustech.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_feeHistory","params":["0x4", "latest", [25, 75]],"id":3}'
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "baseFeePerGas": ["0x342770c0", "0x2da282a8"],
    "gasUsedRatio": [0.0],
    "baseFeePerBlobGas": ["0x0", "0x0"],
    "blobGasUsedRatio": [0.0],
    "oldestBlock": "0x1"
  }
}
```

**Analysis:** Method exists and returns proper EIP-1559 fee history data including `baseFeePerGas`.

### 1.4 Block baseFeePerGas Field

```bash
curl -s -X POST https://rpc.testnet.radiustech.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false],"id":4}'
```

**Response (relevant fields):**
```json
{
  "baseFeePerGas": "0x0",
  "number": "0x19bd90a3b7d",
  ...
}
```

**Analysis:** Blocks contain the `baseFeePerGas` field, confirming EIP-1559 block structure support.

---

## Part 2: Transaction Type Tests

### 2.1 Legacy Transaction (Type 0)

**Test with cast:**
```bash
cast send 0x0000000000000000000000000000000000000001 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://rpc.testnet.radiustech.xyz \
  --gas-price 0 \
  --legacy \
  --value 0
```

**Result:** SUCCESS
- Transaction Hash: `0x7be014fa10cafd9303ee3de613fcf1e0a17b9eebddcedc99fb521dd34ee4a778`
- Status: 1 (success)
- Type: 0
- Gas Used: 24,000

### 2.2 EIP-2930 Transaction (Type 1)

**Test with viem:**
```javascript
const hash = await walletClient.sendTransaction({
  to: '0x0000000000000000000000000000000000000001',
  value: 0n,
  type: 'eip2930',
  gasPrice: 0n,
  accessList: [],
  gas: 30000n,
});
```

**Result:** SUCCESS
- Transaction Hash: `0x97b79b07652f0ebb3561d55ead653dcc2a57cfe6bf676168cc339305fd081430`
- Status: success
- Type: eip2930 (1)
- Gas Used: 24,000

### 2.3 EIP-1559 Transaction (Type 2)

**Test with viem:**
```javascript
const hash = await walletClient.sendTransaction({
  to: '0x0000000000000000000000000000000000000001',
  value: 0n,
  type: 'eip1559',
  maxFeePerGas: 0n,
  maxPriorityFeePerGas: 0n,
  gas: 30000n,
});
```

**Result:** SUCCESS
- Transaction Hash: `0xc32c408e7c01140e9e5941940b90aab060dba05e0c4f7ab8d059a7859678dcc4`
- Status: success
- Type: eip1559 (2)
- Gas Used: 24,000

**Verified transaction details:**
```json
{
  "hash": "0xc32c408e7c01140e9e5941940b90aab060dba05e0c4f7ab8d059a7859678dcc4",
  "type": "0x2",
  "maxFeePerGas": "0x0",
  "maxPriorityFeePerGas": "0x0",
  "gas": "0x7530",
  "accessList": [],
  "yParity": "0x1"
}
```

---

## Part 3: Root Cause Analysis

### The Gas Estimation Bug

When sending to a precompile address (0x01), the network requires 24,000 gas, but `eth_estimateGas` returns 21,000:

```bash
curl -s -X POST https://rpc.testnet.radiustech.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_estimateGas","params":[{"from":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","to":"0x0000000000000000000000000000000000000001","value":"0x0"}],"id":1}'
```

**Response:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x5208"}
```

**Result:** 0x5208 = 21,000 (underestimate!)

### Test Results Matrix

| Target Address | Transaction Type | Gas Provided | Result |
|---------------|------------------|--------------|--------|
| Precompile (0x01) | Type 0 | 21,000 (auto) | REVERTED (out of gas) |
| Precompile (0x01) | Type 2 | 21,000 (auto) | REVERTED (out of gas) |
| Precompile (0x01) | Type 0 | 30,000 (explicit) | SUCCESS |
| Precompile (0x01) | Type 2 | 30,000 (explicit) | SUCCESS |
| Regular EOA | Type 0 | 21,000 (auto) | SUCCESS |
| Regular EOA | Type 2 | 21,000 (auto) | SUCCESS |

### Key Insight

The original "EIP-1559 doesn't work" observation was actually caused by:
1. Sending to a precompile address (0x01)
2. Using auto gas estimation (which returned 21,000)
3. Transaction reverting due to out-of-gas (actual requirement: 24,000)

When sending to regular EOA addresses, both transaction types work perfectly with auto gas estimation.

---

## Part 4: Conclusions

### Does Radius Support EIP-1559?

**YES, FULLY.** The network:
1. Implements `eth_maxPriorityFeePerGas` RPC method
2. Implements `eth_feeHistory` RPC method
3. Returns `baseFeePerGas` in block headers
4. Accepts and successfully processes Type 2 (EIP-1559) transactions
5. Properly handles `maxFeePerGas` and `maxPriorityFeePerGas` fields

### Does Radius Support EIP-2930?

**YES.** Type 1 transactions with access lists are fully supported.

### What Transaction Types ARE Supported?

| Type | Name | Status |
|------|------|--------|
| 0 | Legacy | Supported |
| 1 | EIP-2930 (Access List) | Supported |
| 2 | EIP-1559 (Dynamic Fee) | Supported |

### Minor Issue Found

There is a gas estimation discrepancy when transacting with precompile addresses:
- `eth_estimateGas` returns 21,000
- Actual execution requires 24,000

This is a minor RPC bug, not a transaction type support issue.

---

## Recommendations for Engineering Team

### Severity: LOW (was initially thought to be CRITICAL)

1. **No SDK changes needed for EIP-1559 support** - The network fully supports it.

2. **Consider adding gas buffer** - When using auto gas estimation, consider adding a small buffer (e.g., 10-20%) to prevent out-of-gas reverts in edge cases.

3. **Document precompile gas quirk** - Note that transactions to precompile addresses may require more gas than `eth_estimateGas` returns.

4. **Optional: Report to Radius team** - The `eth_estimateGas` underestimation for precompile addresses could be reported as a minor bug to the Radius network team.

---

## Appendix: All Successful Transaction Hashes

| Type | Hash | Status |
|------|------|--------|
| Legacy (0) | `0x7be014fa10cafd9303ee3de613fcf1e0a17b9eebddcedc99fb521dd34ee4a778` | Success |
| Legacy (0) | `0x64d57b3241dd2c42cb0d4692feb3b546befe8da4c1cb57fca146db6ee54fc056` | Success |
| Legacy (0) | `0xc933862315ea0e1f039df1fd389f041d43b261dc5d08d31a0f76476bf74d1e5a` | Success |
| EIP-2930 (1) | `0x97b79b07652f0ebb3561d55ead653dcc2a57cfe6bf676168cc339305fd081430` | Success |
| EIP-2930 (1) | `0x97a6f48564c17f84036ea6746e217040b6e2c107cd055a2e808f8c0539a31ea7` | Success |
| EIP-1559 (2) | `0x774e8390aabf7c621b038a2bead643eca330d679a38170ed5c1a599ea3a88e69` | Success |
| EIP-1559 (2) | `0xc32c408e7c01140e9e5941940b90aab060dba05e0c4f7ab8d059a7859678dcc4` | Success |
| EIP-1559 (2) | `0x4bc0a60775e4337d736cc5ad939ff2cc2f61372467d1c17a4e1f0cce8f179141` | Success |
| EIP-1559 (2) | `0x6e7baafdea4f33c68637299a1da0724f4bde4d15c4c03293c41d025eb52f6647` | Success |
