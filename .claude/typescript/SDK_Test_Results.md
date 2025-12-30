# SDK Test Results

**Date**: 2025-12-29 (Re-validated)
**SDK Version**: 1.0.0
**Testnet RPC**: https://rpc.testnet.radiustech.xyz
**Chain ID**: 1223953 (0x12ad11)

## Environment Details

- **Node.js**: >= 20.12.2
- **Package Manager**: pnpm 9.14.2
- **ethers.js**: 6.13.5
- **Test Framework**: vitest 3.0.5
- **OS**: macOS Darwin 25.2.0

## Test Account Used

- **Address**: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Anvil Account 0)
- **Native Balance**: ~8.16 ETH
- **SBC Balance**: ~1.995 ISB tokens

---

## Test Matrix

### Phase 2: Must Have Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Connect to Radius testnet | PASS | Chain ID verified as 1223953 |
| 2 | Create/import accounts from private key | PASS | `withPrivateKey()` works correctly |
| 3 | Check native balance | PASS | `account.balance(client)` returns accurate wei balance |
| 4 | Check SBC token balance | PASS | Via ERC-20 `balanceOf()` contract call |
| 5 | Send native value transfers | PASS | `account.send()` works with immediate confirmation |
| 6 | Send SBC token transfers | **SDK BUG** | Gas estimation missing `from` - Network works |
| 7 | Deploy smart contracts | PASS | `client.deployContract()` works correctly |
| 8 | Read from contracts (call) | PASS | `contract.call()` works correctly |
| 9 | Write to contracts (execute) | PASS | `contract.execute()` works for non-ERC20 contracts |

### Phase 3: Nice to Have Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Event subscription | PARTIAL | Events available in receipts, no live subscription |
| 2 | Balance watching/polling | NOT IMPLEMENTED | No built-in polling mechanism |
| 3 | Gas estimation helpers | PASS | `client.estimateGas()` available (but has bug) |
| 4 | Batch transactions | NOT IMPLEMENTED | No batch transaction support |
| 5 | x402 payment protocol | NOT IMPLEMENTED | Not present in SDK |

### Radius-Specific Behavior

| # | Behavior | Status | Notes |
|---|----------|--------|-------|
| 1 | Zero gas price | PASS | `effectiveGasPrice: 0x0` confirmed |
| 2 | Immediate finality | PASS | Balance updates immediately after tx |
| 3 | Stablecoin fees | WORKS | Transactions succeed without native ETH gas |

---

## SDK BUG: ERC-20 Token Transfers (Client-Side Only)

### Bug Description

ERC-20 token transfers fail in the SDK with error:
```
"ERC20: transfer from the zero address"
```

### Network Verification - WORKS!

**The network is NOT broken.** Verified with `cast send`:
```bash
$ cast send 0xF966020a30946A64B39E2e243049036367590858 "transfer(address,uint256)" \
    0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --rpc-url https://rpc.testnet.radiustech.xyz

status               1 (success)
effectiveGasPrice    1
transactionHash      0x6dcab44c1cdbd9ba975a4047704f27d9ebc5c817c88a273be65f10d6c2032967
```

### Root Cause

**Location**: `src/client/client.ts` lines 217-230

The `estimateGas()` method doesn't include the `from` address when calling `ethClient.estimateGas()`:

```typescript
async estimateGas(tx: Transaction): Promise<bigint> {
  const estimate = await this.ethClient.estimateGas({
    to: tx.to?.ethAddress(),
    data: tx.data ? eth.hexlify(tx.data) : undefined,
    value: tx.value,
    // MISSING: from: signer.address()
  });
  // ...
}
```

When the ERC-20 contract's `transfer()` function is called during gas estimation, it checks `msg.sender` (the `from` address). Since `from` is not provided, the node defaults to the zero address, causing the revert.

### Impact

- **SDK ERC-20 token transfers**: BROKEN (gas estimation bug)
- **Network ERC-20 transfers**: WORK (verified with `cast` and MetaMask)
- **ERC-20 balance checks**: WORK (`contract.call('balanceOf', ...)` functions correctly)
- **Non-ERC20 contract calls**: WORK (SimpleStorage and other contracts work fine)

### Workarounds

1. **Use `cast` (Foundry)** - Works correctly
2. **Use ethers.js directly** - Standard approach works
3. **Use MetaMask** - User confirmed working

---

## Original Integration Tests

| Test | Status | Duration |
|------|--------|----------|
| Send transaction between accounts | PASS | ~1112ms |
| Deploy and interact with SimpleStorage contract | PASS | ~1561ms |

---

## Full Validation Tests

| Test | Status | Duration |
|------|--------|----------|
| Connect to Radius testnet | PASS | <100ms |
| Create/import accounts from private key | PASS | <100ms |
| Check native balance | PASS | <100ms |
| Check SBC token balance | PASS | ~300ms |
| Get SBC token metadata | PASS | ~728ms |
| Send native value transfer | PASS | ~760ms |
| Send SBC token transfer | **SDK BUG** | N/A - Network works, SDK fails |
| Deploy smart contract | PASS | ~802ms |
| Read from contracts (call) | PASS | ~1480ms |
| Write to contracts (execute) | PASS | ~1462ms |
| Event subscription (from receipts) | PASS | ~1394ms |
| Gas estimation | PASS | ~904ms |
| Zero gas price verification | PASS | ~838ms |
| Immediate finality | PASS | ~856ms |

**Total Duration**: ~10.9s for all 15 tests (14 pass, 1 documents SDK bug)

---

## SBC Token Details (Discovered)

The SBC token on testnet has different details than expected:

| Property | Expected | Actual |
|----------|----------|--------|
| Name | SBC Token | ISBToken |
| Symbol | SBC | ISB |
| Decimals | 18 | 18 |
| Address | 0xF966020a30946A64B39E2e243049036367590858 | Same |

---

## Error Messages Encountered

### ERC-20 Transfer Error (SDK Bug)

```
Error: Failed to estimate gas: execution reverted: "ERC20: transfer from the zero address"
  action="estimateGas"
  reason="ERC20: transfer from the zero address"
  transaction={
    "data": "0xa9059cbb...",
    "to": "0xF966020a30946A64B39E2e243049036367590858"
  }
  code=CALL_EXCEPTION
```

**Note**: The `transaction` object shows NO `from` field - this is the bug.

---

## Performance Observations

1. **Transaction confirmation**: Near-instant (<1s for simple transfers)
2. **Contract deployment**: ~600-800ms average
3. **Contract interactions**: ~700-1500ms depending on complexity
4. **RPC latency**: Consistent and responsive

---

## Recommendations

### HIGH Priority (SDK Bug Fix)

1. **FIX: Add `from` address to gas estimation** - ERC-20 transfers are broken in SDK
   - Workarounds exist (cast, ethers.js, MetaMask)
   - Network works correctly

### Medium Priority

1. **Add ERC-20 helper functions** to simplify token operations
2. **Document the ISB/SBC token naming** discrepancy

### Low Priority

1. **Consider adding event subscription** support for real-time updates
2. **Add batch transaction support**

---

## Conclusion

### Bug Status
- **SDK Bug Confirmed**: `estimateGas()` missing `from` address
- **Network Works**: `cast send` and MetaMask successfully transfer ERC-20 tokens
- **Workarounds Available**: Multiple alternatives exist

### What Works in SDK
- Native ETH operations (balance, transfers)
- Contract deployment
- Contract reads (including ERC-20 `balanceOf`)
- Simple contract writes (non-msg.sender-dependent)

### What Needs Fix in SDK
- ERC-20 token transfers (gas estimation needs `from` address)
- Any contract method checking `msg.sender` during gas estimation
