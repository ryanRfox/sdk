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
 *   await client.sendAndWait(signer, to, value);
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
// Base error
export { RadiusError } from './base';
// Account errors
export { InsufficientBalanceError, InvalidAddressError, InvalidPrivateKeyError, SignerNotFoundError, SigningError, } from './account';
// Contract errors
export { AbiError, ContractCallError, ContractDeploymentError, MissingAbiError, } from './contract';
// Transaction errors
export { BatchTransactionError, GasEstimationError, NonceError, TransactionFailedError, TransactionRevertedError, TransactionTimeoutError, } from './transaction';
//# sourceMappingURL=index.js.map