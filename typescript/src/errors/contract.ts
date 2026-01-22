/**
 * Contract-related errors
 */
import type { Address, Hex } from 'viem';
import { RadiusError, type RadiusErrorOptions } from './base';

/**
 * Error thrown when a contract call fails.
 */
export class ContractCallError extends RadiusError {
	override readonly name = 'ContractCallError';

	/** The contract address */
	readonly contractAddress?: Address;
	/** The function name that was called */
	readonly functionName?: string;
	/** The arguments passed to the function */
	readonly args?: readonly unknown[];

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			contractAddress?: Address;
			functionName?: string;
			args?: readonly unknown[];
		} = {},
	) {
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
	override readonly name = 'ContractDeploymentError';

	/** The contract bytecode */
	readonly bytecode?: Hex;
	/** The constructor arguments */
	readonly constructorArgs?: readonly unknown[];

	constructor(
		message: string,
		options: RadiusErrorOptions & {
			bytecode?: Hex;
			constructorArgs?: readonly unknown[];
		} = {},
	) {
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
	override readonly name = 'AbiError';

	constructor(message: string, options: RadiusErrorOptions = {}) {
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
	override readonly name = 'MissingAbiError';

	constructor(message = 'Contract ABI is required', options: RadiusErrorOptions = {}) {
		super(message, {
			...options,
			docsPath: options.docsPath ?? '/docs/sdk/errors#missing-abi',
		});
	}
}
