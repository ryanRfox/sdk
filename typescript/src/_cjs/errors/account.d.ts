import type { Address } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';
export declare class SignerNotFoundError extends RadiusError {
    readonly name = "SignerNotFoundError";
    constructor(message?: string, options?: RadiusErrorOptions);
}
export declare class InsufficientBalanceError extends RadiusError {
    readonly name = "InsufficientBalanceError";
    readonly address?: Address;
    readonly balance?: bigint;
    readonly required?: bigint;
    constructor(message: string, options?: RadiusErrorOptions & {
        address?: Address;
        balance?: bigint;
        required?: bigint;
    });
}
export declare class SigningError extends RadiusError {
    readonly name = "SigningError";
    constructor(message: string, options?: RadiusErrorOptions);
}
export declare class InvalidPrivateKeyError extends RadiusError {
    readonly name = "InvalidPrivateKeyError";
    constructor(message?: string, options?: RadiusErrorOptions);
}
export declare class InvalidAddressError extends RadiusError {
    readonly name = "InvalidAddressError";
    readonly invalidAddress?: string;
    constructor(message: string, options?: RadiusErrorOptions & {
        invalidAddress?: string;
    });
}
//# sourceMappingURL=account.d.ts.map