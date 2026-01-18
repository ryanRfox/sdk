/**
 * Typed contract helper for Radius SDK.
 *
 * Provides a viem-style typed contract interface with autocomplete support
 * for contract methods based on the ABI.
 */
import type {
	Abi,
	Address,
	ContractFunctionArgs,
	ContractFunctionName,
	ContractFunctionReturnType,
	Hash,
	LocalAccount,
} from 'viem';
import type { RadiusClient, RadiusReceipt } from '../client/client.js';

/**
 * Options for write operations.
 */
export interface WriteOptions {
	/** Whether to wait for the transaction receipt (default: true) */
	wait?: boolean;
}

/**
 * Result of a write operation.
 */
export type WriteResult<TWait extends boolean | undefined> = TWait extends false
	? Hash
	: RadiusReceipt;

/**
 * The read namespace of a typed contract.
 * Provides autocomplete for view and pure functions.
 */
export type TypedContractRead<TAbi extends Abi> = {
	[TFunctionName in ContractFunctionName<TAbi, 'view' | 'pure'>]: (
		...args: ContractFunctionArgs<TAbi, 'view' | 'pure', TFunctionName> extends readonly []
			? []
			: [args: ContractFunctionArgs<TAbi, 'view' | 'pure', TFunctionName>]
	) => Promise<ContractFunctionReturnType<TAbi, 'view' | 'pure', TFunctionName>>;
};

/**
 * The write namespace of a typed contract.
 * Provides autocomplete for nonpayable and payable functions.
 */
export type TypedContractWrite<TAbi extends Abi> = {
	[TFunctionName in ContractFunctionName<TAbi, 'nonpayable' | 'payable'>]: <
		TWait extends boolean | undefined = true,
	>(
		params: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName> extends readonly []
			? { signer: LocalAccount; options?: WriteOptions & { wait?: TWait } }
			: {
					args: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>;
					signer: LocalAccount;
					options?: WriteOptions & { wait?: TWait };
				},
	) => Promise<WriteResult<TWait>>;
};

/**
 * A typed contract instance with read and write namespaces.
 */
export interface TypedContract<TAbi extends Abi> {
	/** The contract address */
	address: Address;
	/** The contract ABI */
	abi: TAbi;
	/** Read-only methods (view and pure functions) */
	read: TypedContractRead<TAbi>;
	/** State-changing methods (nonpayable and payable functions) */
	write: TypedContractWrite<TAbi>;
}

/**
 * Parameters for getContract.
 */
export interface GetContractParameters<TAbi extends Abi> {
	/** The contract address */
	address: Address;
	/** The contract ABI */
	abi: TAbi;
}

/**
 * Creates a typed contract instance with autocomplete support.
 *
 * @param client - The RadiusClient instance
 * @param params - The contract address and ABI
 * @returns A typed contract with read and write namespaces
 *
 * @example
 * ```typescript
 * import { createRadiusClient, getContract } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createRadiusClient({ chain: radiusTestnet });
 *
 * const erc20Abi = [
 *   { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
 *   { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
 * ] as const;
 *
 * const token = getContract(client, {
 *   address: '0x...',
 *   abi: erc20Abi,
 * });
 *
 * // Read - autocomplete shows balanceOf
 * const balance = await token.read.balanceOf(['0x...']);
 *
 * // Write - autocomplete shows transfer
 * const receipt = await token.write.transfer({
 *   args: ['0x...', 1000000n],
 *   signer: account,
 * });
 * ```
 */
export function getContract<TAbi extends Abi>(
	client: RadiusClient,
	params: GetContractParameters<TAbi>,
): TypedContract<TAbi> {
	const { address, abi } = params;
	const contract = { address, abi };

	// Create read proxy
	const read = new Proxy(
		{},
		{
			get(_target, functionName: string) {
				return async (...callArgs: unknown[]) => {
					// If args were passed as a single array argument, spread them
					// Otherwise use loose arguments directly
					const args =
						callArgs.length === 1 && Array.isArray(callArgs[0]) ? callArgs[0] : callArgs;
					return client.call(contract, functionName, ...args);
				};
			},
		},
	) as TypedContractRead<TAbi>;

	// Create write proxy
	const write = new Proxy(
		{},
		{
			get(_target, functionName: string) {
				return async (params: {
					args?: unknown[];
					signer: LocalAccount;
					options?: WriteOptions;
				}) => {
					const { args = [], signer, options = {} } = params;
					const { wait = true } = options;

					if (wait) {
						return client.executeAndWait(contract, signer, functionName, ...args);
					}
					return client.execute(contract, signer, functionName, ...args);
				};
			},
		},
	) as TypedContractWrite<TAbi>;

	return {
		address,
		abi,
		read,
		write,
	};
}
