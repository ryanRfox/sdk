import { RadiusError } from './base';
/**
 * Error thrown when a signer is required but not available.
 *
 * @example
 * ```typescript
 * try {
 *   await client.sendAndWait(undefined, to, value);
 * } catch (error) {
 *   if (error instanceof SignerNotFoundError) {
 *     console.log('Please connect a wallet');
 *   }
 * }
 * ```
 */
export class SignerNotFoundError extends RadiusError {
    name = 'SignerNotFoundError';
    constructor(message = 'Signer is required', options = {}) {
        super(message, {
            shortMessage: 'No signer available',
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
 *   await client.sendAndWait(signer, to, value);
 * } catch (error) {
 *   if (error instanceof InsufficientBalanceError) {
 *     console.log(`Need ${error.required}, have ${error.balance}`);
 *   }
 * }
 * ```
 */
export class InsufficientBalanceError extends RadiusError {
    name = 'InsufficientBalanceError';
    /** The account address */
    address;
    /** Current balance (in wei) */
    balance;
    /** Required balance (in wei) */
    required;
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Insufficient balance',
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
    name = 'SigningError';
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Failed to sign',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#signing',
        });
    }
}
/**
 * Error thrown when an invalid private key is provided.
 */
export class InvalidPrivateKeyError extends RadiusError {
    name = 'InvalidPrivateKeyError';
    constructor(message = 'Invalid private key', options = {}) {
        super(message, {
            shortMessage: 'Invalid private key format',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-private-key',
        });
    }
}
/**
 * Error thrown when address validation fails.
 */
export class InvalidAddressError extends RadiusError {
    name = 'InvalidAddressError';
    /** The invalid address value */
    invalidAddress;
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Invalid address',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-address',
        });
        this.invalidAddress = options.invalidAddress;
    }
}
//# sourceMappingURL=account.js.map