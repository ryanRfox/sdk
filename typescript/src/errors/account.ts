/**
 * Account and signer-related errors
 */
import type { Address } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';

/**
 * Error thrown when a signer is required but not available.
 *
 * @example
 * ```typescript
 * try {
 *   // Attempting to send without an account configured
 *   await walletClient.sendTransaction({ to, value });
 * } catch (error) {
 *   if (error instanceof SignerNotFoundError) {
 *     console.log('Please connect a wallet');
 *   }
 * }
 * ```
 */
export class SignerNotFoundError extends RadiusError {
	override readonly name = 'SignerNotFoundError';

	constructor(message = 'Signer is required', options: RadiusErrorOptions = {}) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#signer-not-found',
		});
	}
}

/**
 * Error thrown when account balance is insufficient for an operation.
 *
 * @example
 * ```typescript
 * try {
 *   await walletClient.sendTransaction({ to, value });
 * } catch (error) {
 *   if (error instanceof InsufficientBalanceError) {
 *     console.log(`Need ${error.required}, have ${error.balance}`);
 *   }
 * }
 * ```
 */
export class InsufficientBalanceError extends RadiusError {
	override readonly name = 'InsufficientBalanceError';

	/** The account address */
	readonly address?: Address;
	/** Current balance (in wei) */
	readonly balance?: bigint;
	/** Required balance (in wei) */
	readonly required?: bigint;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			address?: Address;
			balance?: bigint;
			required?: bigint;
		} = {},
	) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#insufficient-balance',
		});
		this.address = options.address;
		this.balance = options.balance;
		this.required = options.required;
	}
}

/**
 * Error thrown when signing a message or transaction fails.
 */
export class SigningError extends RadiusError {
	override readonly name = 'SigningError';

	constructor(message: string, options: RadiusErrorOptions = {}) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#signing',
		});
	}
}

/**
 * Error thrown when an invalid private key is provided.
 */
export class InvalidPrivateKeyError extends RadiusError {
	override readonly name = 'InvalidPrivateKeyError';

	constructor(message = 'Invalid private key', options: RadiusErrorOptions = {}) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-private-key',
		});
	}
}

/**
 * Error thrown when address validation fails.
 */
export class InvalidAddressError extends RadiusError {
	override readonly name = 'InvalidAddressError';

	/** The invalid address value */
	readonly invalidAddress?: string;

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			invalidAddress?: string;
		} = {},
	) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-address',
		});
		this.invalidAddress = options.invalidAddress;
	}
}
