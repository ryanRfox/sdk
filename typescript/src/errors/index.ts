/**
 * Radius SDK Error Types
 *
 * This module provides a rich error hierarchy for better error handling
 * and debugging. All errors extend RadiusError which provides:
 * - Short messages for quick understanding
 * - Detailed error information
 * - Documentation links
 * - Error cause chain traversal via .walk()
 *
 * @example
 * ```typescript
 * import {
 *   RadiusError,
 *   TransactionFailedError,
 *   InsufficientBalanceError,
 * } from '@radiustechsystems/sdk';
 *
 * try {
 *   await client.sendTransaction({ to, value });
 * } catch (error) {
 *   if (error instanceof InsufficientBalanceError) {
 *     console.log('Not enough funds:', error.balance, 'required:', error.required);
 *   } else if (error instanceof TransactionFailedError) {
 *     console.log('Transaction failed:', error.transactionHash);
 *   } else if (error instanceof RadiusError) {
 *     console.log('SDK error:', error.shortMessage);
 *   }
 * }
 * ```
 */

// Account errors
export {
	InsufficientBalanceError,
	InvalidAddressError,
	InvalidPrivateKeyError,
	SignerNotFoundError,
	SigningError,
} from './account.js';
// Base error
export { RadiusError, type RadiusErrorOptions } from './base.js';

// Contract errors
export {
	AbiError,
	ContractCallError,
	ContractDeploymentError,
	MissingAbiError,
} from './contract.js';

// Transaction errors
export {
	BatchTransactionError,
	type BatchTransactionResult,
	GasEstimationError,
	NonceError,
	TransactionFailedError,
	TransactionRevertedError,
	TransactionTimeoutError,
} from './transaction.js';

// Error type unions for action functions
/**
 * Error types that can be thrown by sendTransaction operations.
 */
export type SendTransactionErrorType =
	| InsufficientBalanceError
	| TransactionFailedError
	| TransactionRevertedError
	| TransactionTimeoutError
	| SignerNotFoundError
	| GasEstimationError
	| NonceError;

/**
 * Error types that can be thrown by batch transaction operations.
 */
export type BatchTransactionErrorType = BatchTransactionError | GasEstimationError | NonceError;

/**
 * Error types that can be thrown by contract call operations.
 */
export type CallContractErrorType = ContractCallError | MissingAbiError | AbiError;

/**
 * Error types that can be thrown by contract execution operations.
 */
export type ExecuteContractErrorType =
	| ContractCallError
	| TransactionFailedError
	| TransactionRevertedError
	| SignerNotFoundError
	| GasEstimationError
	| MissingAbiError
	| AbiError;

/**
 * Error types that can be thrown by contract deployment operations.
 */
export type DeployContractErrorType =
	| ContractDeploymentError
	| TransactionFailedError
	| TransactionRevertedError
	| SignerNotFoundError
	| GasEstimationError
	| AbiError;

/**
 * Error types that can be thrown by signing operations.
 */
export type SigningErrorType = SigningError | SignerNotFoundError | InvalidPrivateKeyError;

// Import for type re-exports
import type {
	InsufficientBalanceError,
	InvalidPrivateKeyError,
	SignerNotFoundError,
	SigningError,
} from './account.js';
import type {
	AbiError,
	ContractCallError,
	ContractDeploymentError,
	MissingAbiError,
} from './contract.js';
import type {
	BatchTransactionError,
	GasEstimationError,
	NonceError,
	TransactionFailedError,
	TransactionRevertedError,
	TransactionTimeoutError,
} from './transaction.js';
