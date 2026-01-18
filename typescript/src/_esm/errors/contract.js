import { RadiusError } from './base';
/**
 * Error thrown when a contract call fails.
 */
export class ContractCallError extends RadiusError {
    name = 'ContractCallError';
    /** The contract address */
    contractAddress;
    /** The function name that was called */
    functionName;
    /** The arguments passed to the function */
    args;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#contract-call',
        });
        this.contractAddress = options.contractAddress;
        this.functionName = options.functionName;
        this.args = options.args;
    }
}
/**
 * Error thrown when contract deployment fails.
 */
export class ContractDeploymentError extends RadiusError {
    name = 'ContractDeploymentError';
    /** The contract bytecode */
    bytecode;
    /** The constructor arguments */
    constructorArgs;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#contract-deployment',
        });
        this.bytecode = options.bytecode;
        this.constructorArgs = options.constructorArgs;
    }
}
/**
 * Error thrown when ABI encoding/decoding fails.
 */
export class AbiError extends RadiusError {
    name = 'AbiError';
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#abi',
        });
    }
}
/**
 * Error thrown when a required contract ABI is missing.
 */
export class MissingAbiError extends RadiusError {
    name = 'MissingAbiError';
    constructor(message = 'Contract ABI is required', options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#missing-abi',
        });
    }
}
//# sourceMappingURL=contract.js.map