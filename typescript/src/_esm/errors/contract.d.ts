/**
 * Contract-related errors
 */
import type { Address, Hex } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';
/**
 * Error thrown when a contract call fails.
 */
export declare class ContractCallError extends RadiusError {
    readonly name = "ContractCallError";
    /** The contract address */
    readonly contractAddress?: Address;
    /** The function name that was called */
    readonly functionName?: string;
    /** The arguments passed to the function */
    readonly args?: readonly unknown[];
    constructor(message: string, options?: RadiusErrorOptions & {
        contractAddress?: Address;
        functionName?: string;
        args?: readonly unknown[];
    });
}
/**
 * Error thrown when contract deployment fails.
 */
export declare class ContractDeploymentError extends RadiusError {
    readonly name = "ContractDeploymentError";
    /** The contract bytecode */
    readonly bytecode?: Hex;
    /** The constructor arguments */
    readonly constructorArgs?: readonly unknown[];
    constructor(message: string, options?: RadiusErrorOptions & {
        bytecode?: Hex;
        constructorArgs?: readonly unknown[];
    });
}
/**
 * Error thrown when ABI encoding/decoding fails.
 */
export declare class AbiError extends RadiusError {
    readonly name = "AbiError";
    constructor(message: string, options?: RadiusErrorOptions);
}
/**
 * Error thrown when a required contract ABI is missing.
 */
export declare class MissingAbiError extends RadiusError {
    readonly name = "MissingAbiError";
    constructor(message?: string, options?: RadiusErrorOptions);
}
//# sourceMappingURL=contract.d.ts.map