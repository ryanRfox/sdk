# Fix: Include sender address in gas estimation for ERC-20 compatibility

## Summary

This PR fixes a critical bug where ERC-20 token transfers fail with `ERC20: transfer from the zero address` during gas estimation. The fix adds proper sender address handling to the `estimateGas()` method.

## Changes

- Added optional `from?: Address` parameter to `estimateGas()` method
- Modified `prepareTx()` to pass the signer's address to `estimateGas()` when available
- Added JSDoc documentation explaining when `from` is required

## Problem

When calling `eth_estimateGas` without a `from` address, Ethereum nodes default to `address(0)`. This causes any contract that validates `msg.sender` to fail during gas estimation.

### Affected Code (Before)

```typescript
// src/client/client.ts:219-225
async estimateGas(tx: Transaction): Promise<bigint> {
  const estimate = await this.ethClient.estimateGas({
    to: tx.to?.ethAddress(),
    data: tx.data ? eth.hexlify(tx.data) : undefined,
    value: tx.value,
  });
  // ...
}
```

### Fixed Code (After)

```typescript
// src/client/client.ts:219-226
async estimateGas(tx: Transaction, from?: Address): Promise<bigint> {
  const estimate = await this.ethClient.estimateGas({
    from: from?.ethAddress(),  // Now includes sender address
    to: tx.to?.ethAddress(),
    data: tx.data ? eth.hexlify(tx.data) : undefined,
    value: tx.value,
  });
  // ...
}
```

### prepareTx() Update

```typescript
// src/client/client.ts:372-374
// Estimate gas cost for the transaction, passing the signer's address if available
// This is required for accurate estimation of transactions that depend on msg.sender
tx.gas = await this.estimateGas(tx, params.signer?.address());
```

## How Other SDKs Handle This

| SDK | Implementation |
|-----|----------------|
| **ethers.js v6** | Automatically populates `from` when transaction is connected to a Signer |
| **viem** | Requires explicit `account` parameter for `estimateGas` |
| **Tempo SDK** | Delegates to viem which handles it via the client's account |

Our fix aligns with ethers.js behavior - automatically including the sender when available while maintaining backward compatibility.

## Testing

### New Tests Added (6 tests)

1. **ERC-20 Transfer Test**: Verifies SBC token transfers work correctly
2. **Gas Estimation with From**: Tests `estimateGas()` with explicit `from` parameter
3. **Gas Estimation without From**: Tests backward compatibility
4. **Execute with Signer**: Verifies contract execution passes signer address
5. **Send with Signer**: Verifies native token sends work
6. **Backward Compatibility**: Ensures existing code continues to work

### Test Results

```
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total (6 new + 2 existing)
```

### Manual Verification

Successfully transferred SBC tokens on Radius testnet:
- Token: SBC (0x...)
- Network: Radius Testnet
- Transaction: Confirmed with status 1

## Breaking Changes

**None** - This fix is fully backward compatible:

- `estimateGas(tx)` continues to work (from defaults to undefined)
- All existing code paths remain functional
- New `from` parameter is optional

## Checklist

- [x] Code follows project style guidelines
- [x] JSDoc documentation added for new parameter
- [x] All new tests pass
- [x] All existing tests pass
- [x] Manual testing on testnet completed
- [x] No breaking changes introduced

## Related Issues

Fixes #[ISSUE_NUMBER] - ERC-20 token transfers fail with zero address error

## Reviewers

Please verify:
1. The `from` parameter is correctly passed through the call chain
2. Edge cases are handled (no signer, no from address)
3. Gas estimation margin (20%) is still applied correctly
