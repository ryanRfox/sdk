import type { Address, Hash, Hex } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';
export declare class TransactionFailedError extends RadiusError {
    readonly name = "TransactionFailedError";
    readonly transactionHash?: Hash;
    readonly reason?: string;
    constructor(message: string, options?: RadiusErrorOptions & {
        transactionHash?: Hash;
        reason?: string;
    });
}
export declare class TransactionRevertedError extends RadiusError {
    readonly name = "TransactionRevertedError";
    readonly transactionHash?: Hash;
    readonly reason?: string;
    readonly revertReason?: string;
    readonly revertData?: Hex;
    constructor(message: string, options?: RadiusErrorOptions & {
        transactionHash?: Hash;
        reason?: string;
        revertReason?: string;
        revertData?: Hex;
    });
}
export declare class GasEstimationError extends RadiusError {
    readonly name = "GasEstimationError";
    readonly to?: Address;
    readonly data?: Hex;
    constructor(message: string, options?: RadiusErrorOptions & {
        to?: Address;
        data?: Hex;
    });
}
export declare class NonceError extends RadiusError {
    readonly name = "NonceError";
    readonly nonce?: number;
    readonly expectedNonce?: number;
    constructor(message: string, options?: RadiusErrorOptions & {
        nonce?: number;
        expectedNonce?: number;
    });
}
export declare class TransactionTimeoutError extends RadiusError {
    readonly name = "TransactionTimeoutError";
    readonly transactionHash?: Hash;
    readonly timeout?: number;
    constructor(message: string, options?: RadiusErrorOptions & {
        transactionHash?: Hash;
        timeout?: number;
    });
}
//# sourceMappingURL=transaction.d.ts.map