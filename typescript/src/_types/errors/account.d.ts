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
 *   await client.sendAndWait(undefined, to, value);
 * } catch (error) {
 *   if (error instanceof SignerNotFoundError) {
 *     console.log('Please connect a wallet');
 *   }
 * }
 * ```
 */
export declare class SignerNotFoundError extends RadiusError {
    readonly name = "SignerNotFoundError";
    constructor(message?: string, options?: RadiusErrorOptions);
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
export declare class InsufficientBalanceError extends RadiusError {
    readonly name = "InsufficientBalanceError";
    /** The account address */
    readonly address?: Address;
    /** Current balance (in wei) */
    readonly balance?: bigint;
    /** Required balance (in wei) */
    readonly required?: bigint;
    constructor(message: string, options?: RadiusErrorOptions & {
        address?: Address;
        balance?: bigint;
        required?: bigint;
    });
}
/**
 * Error thrown when signing a message or transaction fails.
 */
export declare class SigningError extends RadiusError {
    readonly name = "SigningError";
    constructor(message: string, options?: RadiusErrorOptions);
}
/**
 * Error thrown when an invalid private key is provided.
 */
export declare class InvalidPrivateKeyError extends RadiusError {
    readonly name = "InvalidPrivateKeyError";
    constructor(message?: string, options?: RadiusErrorOptions);
}
/**
 * Error thrown when address validation fails.
 */
export declare class InvalidAddressError extends RadiusError {
    readonly name = "InvalidAddressError";
    /** The invalid address value */
    readonly invalidAddress?: string;
    constructor(message: string, options?: RadiusErrorOptions & {
        invalidAddress?: string;
    });
}
//# sourceMappingURL=account.d.ts.map