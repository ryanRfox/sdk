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
export class TransactionFailedError extends RadiusError {
	override readonly name = 'TransactionFailedError';

	/** The transaction hash (if available) */
	readonly transactionHash?: Hash;
	/** The reason for failure */
	readonly reason?: string;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			transactionHash?: Hash;
			reason?: string;
		} = {},
	) {
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
	override readonly name = 'TransactionRevertedError';

	/** The transaction hash (if available) */
	readonly transactionHash?: Hash;
	/** The reason for failure */
	readonly reason?: string;
	/** The revert reason (decoded if available) */
	readonly revertReason?: string;
	/** The raw revert data */
	readonly revertData?: Hex;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			transactionHash?: Hash;
			reason?: string;
			revertReason?: string;
			revertData?: Hex;
		} = {},
	) {
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
	override readonly name = 'GasEstimationError';

	/** The address being called */
	readonly to?: Address;
	/** The call data */
	readonly data?: Hex;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			to?: Address;
			data?: Hex;
		} = {},
	) {
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
	override readonly name = 'NonceError';

	/** The nonce that was used */
	readonly nonce?: number;
	/** The expected nonce */
	readonly expectedNonce?: number;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			nonce?: number;
			expectedNonce?: number;
		} = {},
	) {
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
	override readonly name = 'TransactionTimeoutError';

	/** The transaction hash */
	readonly transactionHash?: Hash;
	/** How long we waited (in ms) */
	readonly timeout?: number;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			transactionHash?: Hash;
			timeout?: number;
		} = {},
	) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-timeout',
		});
		this.transactionHash = options.transactionHash;
		this.timeout = options.timeout;
	}
}
