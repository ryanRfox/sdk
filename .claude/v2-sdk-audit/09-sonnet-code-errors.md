# Sonnet Code: Error Class Implementation

**Date**: 2026-01-15
**Model**: Claude Sonnet 4.5
**Task**: Replace generic Error throws with custom error classes

## Summary

Successfully replaced all 8 instances of generic `throw new Error()` in `client.ts` with appropriate custom error classes from the SDK's error hierarchy. All custom errors are now being properly utilized throughout the client code.

## Changes Made

### 1. Import Statements (Lines 34-41)
**Before:**
```typescript
import { createInterceptingTransport, type Interceptor, type Logf } from '../transport';
```

**After:**
```typescript
import { createInterceptingTransport, type Interceptor, type Logf } from '../transport';
import {
	AbiError,
	ContractCallError,
	ContractDeploymentError,
	MissingAbiError,
	RadiusError,
	TransactionRevertedError,
} from '../errors';
```

### 2. RPC URL Configuration Error (Lines 343-349)
**Before:**
```typescript
if (!chainUrl) {
	throw new Error(
		'No RPC URL configured. Set RADIUS_RPC_URL environment variable or configure chain.rpcUrls',
	);
}
```

**After:**
```typescript
if (!chainUrl) {
	throw new RadiusError(
		'No RPC URL configured. Set RADIUS_RPC_URL environment variable or configure chain.rpcUrls',
		{
			shortMessage: 'Missing RPC URL configuration',
		},
	);
}
```

**Rationale**: Configuration error at client initialization. Used `RadiusError` as base error since no specific ConfigurationError exists.

### 3. Contract Call - Missing ABI (Line 478)
**Before:**
```typescript
if (!contract.abi) {
	throw new Error('Contract ABI is required');
}
```

**After:**
```typescript
if (!contract.abi) {
	throw new MissingAbiError('Contract ABI is required');
}
```

**Rationale**: Specialized error for missing ABI validation.

### 4. Contract Call - Missing Address (Lines 481-485)
**Before:**
```typescript
if (!contract.address) {
	throw new Error('Contract address is required');
}
```

**After:**
```typescript
if (!contract.address) {
	throw new ContractCallError('Contract address is required', {
		functionName: method,
		args: args as readonly unknown[],
	});
}
```

**Rationale**: Contract call validation error with context about the attempted call.

### 5. Contract Call - ABI Encoding Error (Lines 487-496)
**Before:**
```typescript
const data = encodeFunctionData({
	abi: contract.abi,
	functionName: method,
	args: args as readonly unknown[],
});
```

**After:**
```typescript
let data: Hex;
try {
	data = encodeFunctionData({
		abi: contract.abi,
		functionName: method,
		args: args as readonly unknown[],
	});
} catch (err) {
	throw new AbiError(`Failed to encode function call: ${(err as Error).message}`, {
		cause: err,
	});
}
```

**Rationale**: Catch and wrap viem encoding errors with SDK's `AbiError` for consistent error handling.

### 6. Contract Call - No Data Returned (Lines 507-513)
**Before:**
```typescript
if (!result.data) {
	throw new Error('No data returned from contract call');
}
```

**After:**
```typescript
if (!result.data) {
	throw new ContractCallError('No data returned from contract call', {
		contractAddress: contract.address,
		functionName: method,
		args: args as readonly unknown[],
	});
}
```

**Rationale**: Contract call failure with full context about the failed call.

### 7. Contract Call - ABI Decoding Error (Lines 516-525)
**Before:**
```typescript
const decoded = decodeFunctionResult({
	abi: contract.abi,
	functionName: method,
	data: result.data,
});
```

**After:**
```typescript
let decoded: unknown;
try {
	decoded = decodeFunctionResult({
		abi: contract.abi,
		functionName: method,
		data: result.data,
	});
} catch (err) {
	throw new AbiError(`Failed to decode function result: ${(err as Error).message}`, {
		cause: err,
	});
}
```

**Rationale**: Catch and wrap viem decoding errors with SDK's `AbiError` for consistent error handling.

### 8. Contract Execute - Missing ABI (Line 541)
**Before:**
```typescript
if (!contract.abi) {
	throw new Error('Contract ABI is required');
}
```

**After:**
```typescript
if (!contract.abi) {
	throw new MissingAbiError('Contract ABI is required');
}
```

**Rationale**: Specialized error for missing ABI validation.

### 9. Contract Execute - Missing Address (Lines 544-548)
**Before:**
```typescript
if (!contract.address) {
	throw new Error('Contract address is required');
}
```

**After:**
```typescript
if (!contract.address) {
	throw new ContractCallError('Contract address is required', {
		functionName: method,
		args: args as readonly unknown[],
	});
}
```

**Rationale**: Contract execution validation error with context about the attempted call.

### 10. Contract Execute - ABI Encoding Error (Lines 551-560)
**Before:**
```typescript
const data = encodeFunctionData({
	abi: contract.abi,
	functionName: method,
	args: args as readonly unknown[],
});
```

**After:**
```typescript
let data: Hex;
try {
	data = encodeFunctionData({
		abi: contract.abi,
		functionName: method,
		args: args as readonly unknown[],
	});
} catch (err) {
	throw new AbiError(`Failed to encode function call: ${(err as Error).message}`, {
		cause: err,
	});
}
```

**Rationale**: Catch and wrap viem encoding errors with SDK's `AbiError` for consistent error handling.

### 11. Deploy Contract - Constructor ABI Encoding Error (Lines 614-622)
**Before:**
```typescript
const encodedArgs = encodeAbiParameters(ctorItem.inputs, args as readonly unknown[]);
deployData = `${bytecode}${encodedArgs.slice(2)}` as Hex;
```

**After:**
```typescript
try {
	const encodedArgs = encodeAbiParameters(ctorItem.inputs, args as readonly unknown[]);
	deployData = `${bytecode}${encodedArgs.slice(2)}` as Hex;
} catch (err) {
	throw new AbiError(`Failed to encode constructor arguments: ${(err as Error).message}`, {
		cause: err,
	});
}
```

**Rationale**: Catch and wrap viem constructor encoding errors with SDK's `AbiError`.

### 12. Deploy Contract - No Contract Address (Lines 632-636)
**Before:**
```typescript
if (!receipt.contractAddress) {
	throw new Error('Contract deployment failed: no contract address in receipt');
}
```

**After:**
```typescript
if (!receipt.contractAddress) {
	throw new ContractDeploymentError('Contract deployment failed: no contract address in receipt', {
		bytecode,
		constructorArgs: args as readonly unknown[],
	});
}
```

**Rationale**: Specialized deployment error with context about the deployment attempt.

### 13. Deploy Contract - Transaction Reverted (Lines 638-640)
**Before:**
```typescript
if (receipt.status !== 'success') {
	throw new Error('Contract deployment failed: transaction reverted');
}
```

**After:**
```typescript
if (receipt.status !== 'success') {
	throw new TransactionRevertedError('Contract deployment failed: transaction reverted', {
		transactionHash: receipt.transactionHash,
	});
}
```

**Rationale**: Specialized revert error indicating on-chain transaction failure with transaction hash for debugging.

## Error Classes Used

| Error Class | Use Cases | Lines |
|-------------|-----------|-------|
| `RadiusError` | Base error for configuration issues | 343-349 |
| `MissingAbiError` | Missing contract ABI validation | 478, 541 |
| `ContractCallError` | Missing address, no data returned | 481-485, 507-513, 544-548 |
| `AbiError` | ABI encoding/decoding failures | 487-496, 516-525, 551-560, 614-622 |
| `ContractDeploymentError` | Deployment without contract address | 632-636 |
| `TransactionRevertedError` | Transaction reverted on-chain | 638-640 |

## Error Classes NOT Used (But Available)

The following error classes exist but were not applicable in client.ts:
- `InsufficientBalanceError` - Would be used for explicit balance checks before transactions
- `GasEstimationError` - Would wrap viem gas estimation failures (currently unhandled)
- `SigningError` - Would wrap signing failures (currently unhandled)
- `InvalidAddressError` - Would be used for address validation
- `SignerNotFoundError` - Would be used for missing signer validation
- `InvalidPrivateKeyError` - Not applicable in client (used in signer modules)
- `TransactionFailedError` - For general transaction failures
- `TransactionTimeoutError` - For transaction receipt timeouts
- `NonceError` - For nonce-related issues

## Benefits

1. **Type-Safe Error Handling**: Developers can now use `instanceof` checks for specific error types
2. **Rich Error Context**: Each error includes relevant metadata (addresses, function names, args, etc.)
3. **Better Debugging**: Error cause chains preserved with `.walk()` method
4. **Documentation Links**: Each error type includes `docsPath` for reference
5. **Backwards Compatibility**: All errors still extend Error, existing catch blocks continue to work

## Example Usage

```typescript
import { MissingAbiError, ContractCallError, AbiError } from '@radiustechsystems/sdk';

try {
	const result = await client.call(contract, 'transfer', to, amount);
} catch (error) {
	if (error instanceof MissingAbiError) {
		console.log('ABI not provided');
	} else if (error instanceof ContractCallError) {
		console.log('Call failed:', error.functionName, error.contractAddress);
	} else if (error instanceof AbiError) {
		console.log('ABI encoding/decoding failed:', error.cause);
	}
}
```

## Verification

All generic `throw new Error()` instances have been replaced:
- **Before**: 8+ instances of generic Error throws
- **After**: 0 instances of generic Error throws
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/client/client.ts`

## Status: ✅ COMPLETE

All error classes are now properly utilized in the client implementation. The SDK provides rich, type-safe error handling with full context preservation.
