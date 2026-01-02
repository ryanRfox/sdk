import type { Address, Hex } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';
export declare class ContractCallError extends RadiusError {
    readonly name = "ContractCallError";
    readonly contractAddress?: Address;
    readonly functionName?: string;
    readonly args?: readonly unknown[];
    constructor(message: string, options?: RadiusErrorOptions & {
        contractAddress?: Address;
        functionName?: string;
        args?: readonly unknown[];
    });
}
export declare class ContractDeploymentError extends RadiusError {
    readonly name = "ContractDeploymentError";
    readonly bytecode?: Hex;
    readonly constructorArgs?: readonly unknown[];
    constructor(message: string, options?: RadiusErrorOptions & {
        bytecode?: Hex;
        constructorArgs?: readonly unknown[];
    });
}
export declare class AbiError extends RadiusError {
    readonly name = "AbiError";
    constructor(message: string, options?: RadiusErrorOptions);
}
export declare class MissingAbiError extends RadiusError {
    readonly name = "MissingAbiError";
    constructor(message?: string, options?: RadiusErrorOptions);
}
//# sourceMappingURL=contract.d.ts.map