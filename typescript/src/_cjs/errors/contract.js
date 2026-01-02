"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingAbiError = exports.AbiError = exports.ContractDeploymentError = exports.ContractCallError = void 0;
const base_1 = require("./base");
class ContractCallError extends base_1.RadiusError {
    name = 'ContractCallError';
    contractAddress;
    functionName;
    args;
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Contract call failed',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#contract-call',
        });
        this.contractAddress = options.contractAddress;
        this.functionName = options.functionName;
        this.args = options.args;
    }
}
exports.ContractCallError = ContractCallError;
class ContractDeploymentError extends base_1.RadiusError {
    name = 'ContractDeploymentError';
    bytecode;
    constructorArgs;
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Contract deployment failed',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#contract-deployment',
        });
        this.bytecode = options.bytecode;
        this.constructorArgs = options.constructorArgs;
    }
}
exports.ContractDeploymentError = ContractDeploymentError;
class AbiError extends base_1.RadiusError {
    name = 'AbiError';
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'ABI error',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#abi',
        });
    }
}
exports.AbiError = AbiError;
class MissingAbiError extends base_1.RadiusError {
    name = 'MissingAbiError';
    constructor(message = 'Contract ABI is required', options = {}) {
        super(message, {
            shortMessage: 'Missing ABI',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#missing-abi',
        });
    }
}
exports.MissingAbiError = MissingAbiError;
//# sourceMappingURL=contract.js.map