# Bug: ERC-20 Token Transfers Fail with "transfer from the zero address" Error

## Summary

ERC-20 token transfers fail during gas estimation with the error `ERC20: transfer from the zero address`. This occurs because the `estimateGas()` method does not include the sender's address when calling the `eth_estimateGas` RPC method.

## Environment

- **SDK**: Radius TypeScript SDK
- **Network**: Radius Testnet
- **Affected Version**: All versions prior to fix

## Steps to Reproduce

1. Initialize a Radius client with a funded wallet
2. Attempt to transfer ERC-20 tokens (e.g., SBC token) using `client.execute()`
3. Observe the transaction fails during gas estimation

```typescript
import { Client, Signer, Address, Contract } from '@aspect-build/radius-sdk';

const client = await Client.new('https://rpc.testnet.trylayer.xyz');
const signer = await Signer.fromPrivateKey(privateKey);

// ERC-20 contract
const tokenAddress = Address.fromHex('0x...');
const erc20 = new Contract(tokenAddress, ERC20_ABI);

// This fails with "ERC20: transfer from the zero address"
const receipt = await client.execute(
  erc20,
  signer,
  'transfer',
  recipientAddress.ethAddress(),
  parseUnits('1', 18)
);
```

## Expected Behavior

The ERC-20 transfer should succeed, with gas estimation correctly simulating the transaction from the signer's address.

## Actual Behavior

The transaction fails during gas estimation with:

```
Error: ERC20: transfer from the zero address
```

## Root Cause Analysis

### Location
`src/client/client.ts:217-230` - The `estimateGas()` method

### Technical Details

When calling `eth_estimateGas`, Ethereum nodes require a `from` address to properly simulate transactions that depend on `msg.sender`. If `from` is not provided, nodes default to `address(0)` (the zero address).

For ERC-20 transfers, the contract checks:
```solidity
require(from != address(0), "ERC20: transfer from the zero address");
```

Since the SDK was not passing the `from` address, the node simulated the transfer as coming from `address(0)`, which has no token balance and triggers the zero address check.

### Comparison with Other SDKs

| SDK | Behavior |
|-----|----------|
| **ethers.js v6** | Automatically includes `from` address when using a Signer |
| **viem** | Requires `account` parameter explicitly for `estimateGas` |
| **Tempo SDK** | Delegates to viem which handles it via client account |

## Impact

- **Severity**: High
- **Affected Operations**: All ERC-20 token transfers and any contract interactions that validate `msg.sender`
- **Workaround**: None available without SDK modification

## Suggested Fix

1. Add an optional `from?: Address` parameter to the `estimateGas()` method
2. Modify `prepareTx()` to pass the signer's address to `estimateGas()` when available
3. Ensure backward compatibility for callers that don't provide a `from` address

## Labels

- `bug`
- `high-priority`
- `erc20`
- `gas-estimation`
