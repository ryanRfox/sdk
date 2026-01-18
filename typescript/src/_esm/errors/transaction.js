import { RadiusError } from './base';
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
export class TransactionFailedError extends RadiusError {
    name = 'TransactionFailedError';
    /** The transaction hash (if available) */
    transactionHash;
    /** The reason for failure */
    reason;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-failed',
        });
        this.transactionHash = options.transactionHash;
        this.reason = options.reason;
    }
}
/**
 * Error thrown when a transaction reverts on-chain.
 */
export class TransactionRevertedError extends RadiusError {
    name = 'TransactionRevertedError';
    /** The transaction hash (if available) */
    transactionHash;
    /** The reason for failure */
    reason;
    /** The revert reason (decoded if available) */
    revertReason;
    /** The raw revert data */
    revertData;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-reverted',
        });
        this.transactionHash = options.transactionHash;
        this.reason = options.reason;
        this.revertReason = options.revertReason;
        this.revertData = options.revertData;
    }
}
/**
 * Error thrown when gas estimation fails.
 */
export class GasEstimationError extends RadiusError {
    name = 'GasEstimationError';
    /** The address being called */
    to;
    /** The call data */
    data;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#gas-estimation',
        });
        this.to = options.to;
        this.data = options.data;
    }
}
/**
 * Error thrown when transaction nonce is invalid.
 */
export class NonceError extends RadiusError {
    name = 'NonceError';
    /** The nonce that was used */
    nonce;
    /** The expected nonce */
    expectedNonce;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#nonce',
        });
        this.nonce = options.nonce;
        this.expectedNonce = options.expectedNonce;
    }
}
/**
 * Error thrown when a transaction times out waiting for confirmation.
 */
export class TransactionTimeoutError extends RadiusError {
    name = 'TransactionTimeoutError';
    /** The transaction hash */
    transactionHash;
    /** How long we waited (in ms) */
    timeout;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-timeout',
        });
        this.transactionHash = options.transactionHash;
        this.timeout = options.timeout;
    }
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
export class BatchTransactionError extends RadiusError {
    name = 'BatchTransactionError';
    /** Results for each transaction in the batch */
    results;
    constructor(message, results, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#batch-transaction',
        });
        this.results = results;
    }
}
//# sourceMappingURL=transaction.js.map