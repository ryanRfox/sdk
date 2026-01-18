/**
 * Transaction-related errors
 */
import type { Address, Hash, Hex } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';
/**
 * Error thrown when a transaction fails to execute.
 *
 * @example
 * ```typescript
 * try {
 *   await client.sendAndWait(signer, to, value);
 * } catch (error) {
 *   if (error instanceof TransactionFailedError) {
 *     console.log('Transaction failed:', error.transactionHash);
 *     console.log('Reason:', error.shortMessage);
 *   }
 * }
 * ```
 */
export declare class TransactionFailedError extends RadiusError {
    readonly name = "TransactionFailedError";
    /** The transaction hash (if available) */
    readonly transactionHash?: Hash;
    /** The reason for failure */
    readonly reason?: string;
    constructor(message: string, options?: RadiusErrorOptions & {
        transactionHash?: Hash;
        reason?: string;
    });
}
/**
 * Error thrown when a transaction reverts on-chain.
 */
export declare class TransactionRevertedError extends RadiusError {
    readonly name = "TransactionRevertedError";
    /** The transaction hash (if available) */
    readonly transactionHash?: Hash;
    /** The reason for failure */
    readonly reason?: string;
    /** The revert reason (decoded if available) */
    readonly revertReason?: string;
    /** The raw revert data */
    readonly revertData?: Hex;
    constructor(message: string, options?: RadiusErrorOptions & {
        transactionHash?: Hash;
        reason?: string;
        revertReason?: string;
        revertData?: Hex;
    });
}
/**
 * Error thrown when gas estimation fails.
 */
export declare class GasEstimationError extends RadiusError {
    readonly name = "GasEstimationError";
    /** The address being called */
    readonly to?: Address;
    /** The call data */
    readonly data?: Hex;
    constructor(message: string, options?: RadiusErrorOptions & {
        to?: Address;
        data?: Hex;
    });
}
/**
 * Error thrown when transaction nonce is invalid.
 */
export declare class NonceError extends RadiusError {
    readonly name = "NonceError";
    /** The nonce that was used */
    readonly nonce?: number;
    /** The expected nonce */
    readonly expectedNonce?: number;
    constructor(message: string, options?: RadiusErrorOptions & {
        nonce?: number;
        expectedNonce?: number;
    });
}
/**
 * Error thrown when a transaction times out waiting for confirmation.
 */
export declare class TransactionTimeoutError extends RadiusError {
    readonly name = "TransactionTimeoutError";
    /** The transaction hash */
    readonly transactionHash?: Hash;
    /** How long we waited (in ms) */
    readonly timeout?: number;
    constructor(message: string, options?: RadiusErrorOptions & {
        transactionHash?: Hash;
        timeout?: number;
    });
}
/**
 * Result of a single transaction in a batch.
 */
export interface BatchTransactionResult {
    /** The index of this transaction in the batch */
    index: number;
    /** The transaction hash (if successful) */
    hash?: Hash;
    /** The error message (if failed) */
    error?: string;
}
/**
 * Error thrown when one or more transactions in a batch fail.
 *
 * @example
 * ```typescript
 * try {
 *   await client.sendTransactionBatch(signer, transactions);
 * } catch (error) {
 *   if (error instanceof BatchTransactionError) {
 *     console.log('Batch failed:', error.message);
 *     error.results.forEach((r, i) => {
 *       if (r.error) {
 *         console.log(`  Transaction ${i} failed: ${r.error}`);
 *       } else {
 *         console.log(`  Transaction ${i} succeeded: ${r.hash}`);
 *       }
 *     });
 *   }
 * }
 * ```
 */
export declare class BatchTransactionError extends RadiusError {
    readonly name = "BatchTransactionError";
    /** Results for each transaction in the batch */
    readonly results: BatchTransactionResult[];
    constructor(message: string, results: BatchTransactionResult[], options?: RadiusErrorOptions);
}
//# sourceMappingURL=transaction.d.ts.map