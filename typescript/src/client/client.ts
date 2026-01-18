/**
 * Radius SDK Client - A viem-based client for interacting with the Radius platform.
 *
 * This module provides the primary interface for reading blockchain state,
 * sending transactions, deploying contracts, and interacting with smart contracts.
 */
import {
	type Abi,
	type AbiParameter,
	type BlockTag,
	type Chain,
	createPublicClient,
	decodeFunctionResult,
	encodeAbiParameters,
	encodeFunctionData,
	type Hash,
	type Hex,
	type LocalAccount,
	type PublicClient,
	type TransactionReceipt,
	type TransactionRequest,
	type Transport,
	type Address as ViemAddress,
} from 'viem';
import {
	getContract,
	type GetContractParameters,
	type TypedContract,
} from '../contracts/typedContract.js';

/**
 * Parameters for getBalance method (matches viem).
 */
export interface GetBalanceParameters {
	/** The address to get the balance of */
	address: ViemAddress;
	/** The block number to get the balance at */
	blockNumber?: bigint;
	/** The block tag to get the balance at (default: 'latest') */
	blockTag?: BlockTag;
}

/**
 * Parameters for getCode method (matches viem).
 */
export interface GetCodeParameters {
	/** The address to get the code at */
	address: ViemAddress;
	/** The block number to get the code at */
	blockNumber?: bigint;
	/** The block tag to get the code at (default: 'latest') */
	blockTag?: BlockTag;
}

/**
 * Parameters for getTransactionCount method (matches viem).
 */
export interface GetTransactionCountParameters {
	/** The address to get the transaction count for */
	address: ViemAddress;
	/** The block number to get the count at */
	blockNumber?: bigint;
	/** The block tag to get the count at (default: 'pending') */
	blockTag?: BlockTag;
}

/**
 * Parameters for sendRawTransaction method (matches viem).
 */
export interface SendRawTransactionParameters {
	/** The signed serialized transaction */
	serializedTransaction: Hex;
}

/**
 * Parameters for waitForTransactionReceipt method (matches viem).
 */
export interface WaitForTransactionReceiptParameters {
	/** The transaction hash to wait for */
	hash: Hash;
}

/**
 * Parameters for readContract method (matches viem).
 */
export interface ReadContractParameters {
	/** The contract address */
	address: ViemAddress;
	/** The contract ABI */
	abi: Abi;
	/** The function name to call */
	functionName: string;
	/** Arguments to pass to the function */
	args?: readonly unknown[];
	/** The block number to read at */
	blockNumber?: bigint;
	/** The block tag to read at (default: 'latest') */
	blockTag?: BlockTag;
}

/**
 * Parameters for writeContract method (matches viem).
 */
export interface WriteContractParameters {
	/** The contract address */
	address: ViemAddress;
	/** The contract ABI */
	abi: Abi;
	/** The function name to call */
	functionName: string;
	/** Arguments to pass to the function */
	args?: readonly unknown[];
	/** The account to sign the transaction */
	account: LocalAccount;
}

/**
 * ABI constructor type definition.
 */
type AbiConstructor = {
	type: 'constructor';
	inputs: readonly AbiParameter[];
	stateMutability: 'nonpayable' | 'payable';
};

import { createInterceptingTransport, type Interceptor, type Logf } from '../transport';
import {
	AbiError,
	ContractCallError,
	ContractDeploymentError,
	MissingAbiError,
	RadiusError,
	TransactionRevertedError,
} from '../errors';

/**
 * Maximum gas limit for transactions.
 * Used to cap gas estimates to prevent unexpectedly high costs.
 */
export const MAX_GAS = 1319413953330n;

/**
 * Receipt returned from transaction execution.
 * Contains information about the transaction result.
 */
export interface RadiusReceipt {
	/** The transaction hash */
	transactionHash: Hash;
	/** The sender address */
	from: ViemAddress;
	/** The recipient address (or null for contract creation) */
	to: ViemAddress | null;
	/** The created contract address (if any) */
	contractAddress: ViemAddress | null;
	/** The amount of gas used */
	gasUsed: bigint;
	/** The transaction status (1 for success, 0 for failure) */
	status: 'success' | 'reverted';
	/** The block number the transaction was included in */
	blockNumber: bigint;
	/** The block hash */
	blockHash: Hash;
	/** Transaction logs */
	logs: TransactionReceipt['logs'];
}

/**
 * Configuration options for creating a RadiusClient.
 */
export interface RadiusClientConfig {
	/** The chain configuration (use radiusTestnet or radiusMainnet from @radiustechsystems/sdk/chains) */
	chain: Chain;
	/** The viem transport to use (defaults to http transport based on chain config) */
	transport?: Transport;
	/** Optional response interceptor for modifying or monitoring JSON-RPC responses */
	interceptor?: Interceptor;
	/** Optional logger function for debugging request/response cycles */
	logger?: Logf;
}

/**
 * Contract interface for the client's call and execute methods.
 * Must have an ABI and address for contract interactions.
 */
export interface ContractInstance {
	/** The contract's ABI */
	abi: Abi;
	/** The contract's deployed address */
	address: ViemAddress;
}

/**
 * The RadiusClient provides methods for interacting with the Radius platform.
 *
 * This is the main entry point for:
 * - Reading blockchain state (balances, contract data, chain info)
 * - Sending transactions (native transfers, contract calls)
 * - Deploying smart contracts
 *
 * @example
 * ```typescript
 * import { createRadiusClient, privateKeyToAccount } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { http } from 'viem';
 *
 * const client = createRadiusClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // Get balance (viem-compatible syntax)
 * const balance = await client.getBalance({ address: '0x...' });
 *
 * // Send transaction and wait for receipt
 * const account = privateKeyToAccount('0x...privateKey');
 * const receipt = await client.sendAndWait(account, '0x...recipient', 1000000000000000000n);
 * ```
 */
export interface RadiusClient {
	/**
	 * The underlying viem PublicClient for advanced operations.
	 */
	readonly publicClient: PublicClient;

	/**
	 * Get the chain ID of the connected network.
	 * @returns The chain ID as a bigint
	 */
	getChainId(): Promise<bigint>;

	/**
	 * Get the balance of an address in wei.
	 *
	 * @param params - The parameters for the balance query
	 * @param params.address - The address to check
	 * @param params.blockTag - Optional block tag (default: 'latest')
	 * @param params.blockNumber - Optional block number
	 * @returns The balance in wei
	 *
	 * @example
	 * ```typescript
	 * const balance = await client.getBalance({ address: '0x...' });
	 * ```
	 */
	getBalance(params: GetBalanceParameters): Promise<bigint>;

	/**
	 * Get the bytecode deployed at an address.
	 *
	 * @param params - The parameters for the code query
	 * @param params.address - The contract address
	 * @param params.blockTag - Optional block tag (default: 'latest')
	 * @param params.blockNumber - Optional block number
	 * @returns The bytecode as a hex string, or undefined if no code
	 *
	 * @example
	 * ```typescript
	 * const code = await client.getCode({ address: '0x...' });
	 * ```
	 */
	getCode(params: GetCodeParameters): Promise<Hex | undefined>;

	/**
	 * Get the transaction count (nonce) for an address.
	 *
	 * @param params - The parameters for the transaction count query
	 * @param params.address - The address to check
	 * @param params.blockTag - Optional block tag (default: 'pending')
	 * @param params.blockNumber - Optional block number
	 * @returns The transaction count
	 *
	 * @example
	 * ```typescript
	 * const nonce = await client.getTransactionCount({ address: '0x...' });
	 * ```
	 */
	getTransactionCount(params: GetTransactionCountParameters): Promise<number>;

	/**
	 * Estimate gas for a transaction.
	 * Applies a 20% safety margin and caps at MAX_GAS.
	 * @param tx - The transaction parameters
	 * @returns The estimated gas with safety margin
	 */
	estimateGas(tx: TransactionRequest): Promise<bigint>;

	/**
	 * Call a read-only contract method (does not create a transaction).
	 * @param contract - The contract instance with ABI and address
	 * @param method - The method name to call
	 * @param args - Arguments to pass to the method
	 * @returns The decoded return value(s) from the contract
	 */
	call<T = unknown>(contract: ContractInstance, method: string, ...args: unknown[]): Promise<T>;

	/**
	 * Execute a state-changing contract method.
	 * Returns immediately after the transaction is sent (does not wait for receipt).
	 * @param contract - The contract instance with ABI and address
	 * @param signer - The signer to sign the transaction
	 * @param method - The method name to execute
	 * @param args - Arguments to pass to the method
	 * @returns The transaction hash
	 */
	execute(
		contract: ContractInstance,
		signer: LocalAccount,
		method: string,
		...args: unknown[]
	): Promise<Hash>;

	/**
	 * Execute a state-changing contract method and wait for the receipt.
	 * @param contract - The contract instance with ABI and address
	 * @param signer - The signer to sign the transaction
	 * @param method - The method name to execute
	 * @param args - Arguments to pass to the method
	 * @returns The transaction receipt
	 */
	executeAndWait(
		contract: ContractInstance,
		signer: LocalAccount,
		method: string,
		...args: unknown[]
	): Promise<RadiusReceipt>;


	/**
	 * Send native currency to an address.
	 * Returns immediately after the transaction is sent (does not wait for receipt).
	 * @param signer - The signer to sign the transaction
	 * @param to - The recipient address
	 * @param value - The amount to send in wei
	 * @returns The transaction hash
	 */
	send(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<Hash>;

	/**
	 * Send native currency to an address and wait for the receipt.
	 * @param signer - The signer to sign the transaction
	 * @param to - The recipient address
	 * @param value - The amount to send in wei
	 * @returns The transaction receipt
	 */
	sendAndWait(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<RadiusReceipt>;


	/**
	 * Deploy a smart contract.
	 * @param signer - The signer to sign the deployment transaction
	 * @param bytecode - The contract bytecode
	 * @param abi - The contract ABI
	 * @param args - Constructor arguments (if any)
	 * @returns The deployed contract address and transaction receipt
	 */
	deployContract(
		signer: LocalAccount,
		bytecode: Hex,
		abi: Abi,
		...args: unknown[]
	): Promise<{ address: ViemAddress; receipt: RadiusReceipt }>;

	/**
	 * Send a raw signed transaction.
	 * Returns immediately after the transaction is sent.
	 *
	 * @param params - The parameters for the raw transaction
	 * @param params.serializedTransaction - The signed serialized transaction
	 * @returns The transaction hash
	 *
	 * @example
	 * ```typescript
	 * const hash = await client.sendRawTransaction({ serializedTransaction: '0x...' });
	 * ```
	 */
	sendRawTransaction(params: SendRawTransactionParameters): Promise<Hash>;

	/**
	 * Wait for a transaction receipt.
	 *
	 * @param params - The parameters for the receipt query
	 * @param params.hash - The transaction hash to wait for
	 * @returns The transaction receipt
	 *
	 * @example
	 * ```typescript
	 * const receipt = await client.waitForTransactionReceipt({ hash: '0x...' });
	 * ```
	 */
	waitForTransactionReceipt(params: WaitForTransactionReceiptParameters): Promise<RadiusReceipt>;

	/**
	 * Read data from a contract (viem-compatible alias for call).
	 *
	 * @param params - The parameters for the contract read
	 * @returns The decoded return value from the contract function
	 *
	 * @example
	 * ```typescript
	 * const balance = await client.readContract({
	 *   address: '0x...',
	 *   abi: erc20Abi,
	 *   functionName: 'balanceOf',
	 *   args: ['0x...'],
	 * });
	 * ```
	 */
	readContract<T = unknown>(params: ReadContractParameters): Promise<T>;

	/**
	 * Execute a write operation on a contract (viem-compatible alias for execute).
	 * Returns the transaction hash immediately without waiting for confirmation.
	 *
	 * @param params - The parameters for the contract write
	 * @returns The transaction hash
	 *
	 * @example
	 * ```typescript
	 * const hash = await client.writeContract({
	 *   address: '0x...',
	 *   abi: erc20Abi,
	 *   functionName: 'transfer',
	 *   args: ['0x...', 1000n],
	 *   account: signer,
	 * });
	 * ```
	 */
	writeContract(params: WriteContractParameters): Promise<Hash>;

	/**
	 * Extend the client with custom actions.
	 *
	 * @param extender - A function that receives the base client and returns custom actions
	 * @returns A new client with the custom actions added
	 *
	 * @example
	 * ```typescript
	 * const client = createRadiusClient({ chain: radiusTestnet }).extend((base) => ({
	 *   async getBalanceFormatted(address: Address) {
	 *     const balance = await base.getBalance({ address });
	 *     return formatEther(balance);
	 *   },
	 * }));
	 *
	 * const formatted = await client.getBalanceFormatted('0x...');
	 * ```
	 */
	extend<TExtension extends Record<string, unknown>>(
		extender: (client: RadiusClient) => TExtension,
	): RadiusClient & TExtension;

	/**
	 * Get a typed contract instance with autocomplete support for contract methods.
	 *
	 * @param params - The contract address and ABI
	 * @returns A typed contract with read and write namespaces
	 *
	 * @example
	 * ```typescript
	 * const erc20Abi = [
	 *   { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
	 *   { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
	 * ] as const;
	 *
	 * const token = client.getContract({
	 *   address: '0x...',
	 *   abi: erc20Abi,
	 * });
	 *
	 * // Read methods - autocomplete shows balanceOf
	 * const balance = await token.read.balanceOf(['0x...']);
	 *
	 * // Write methods - autocomplete shows transfer
	 * const receipt = await token.write.transfer({
	 *   args: ['0x...', 1000000n],
	 *   signer: account,
	 * });
	 *
	 * // Write without waiting for receipt
	 * const hash = await token.write.transfer({
	 *   args: ['0x...', 1000000n],
	 *   signer: account,
	 *   options: { wait: false },
	 * });
	 * ```
	 */
	getContract<TAbi extends Abi>(params: GetContractParameters<TAbi>): TypedContract<TAbi>;
}

/**
 * Creates a new RadiusClient instance.
 *
 * @param config - Configuration options for the client
 * @returns A RadiusClient instance
 *
 * @example
 * ```typescript
 * import { createRadiusClient } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { http } from 'viem';
 *
 * // Basic usage
 * const client = createRadiusClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // With logging
 * const clientWithLogging = createRadiusClient({
 *   chain: radiusTestnet,
 *   logger: console.log,
 * });
 *
 * // With custom interceptor
 * const clientWithInterceptor = createRadiusClient({
 *   chain: radiusTestnet,
 *   interceptor: async (reqBody, response) => {
 *     // Custom response handling
 *     return response;
 *   },
 * });
 * ```
 */
/**
 * Get RPC URL from environment variables or chain config.
 * Checks RADIUS_RPC_URL and RADIUS_ENDPOINT environment variables.
 */
function getRpcUrl(chain: Chain): string {
	// Check environment variables first (Node.js only)
	if (typeof process !== 'undefined' && process.env) {
		const envUrl = process.env.RADIUS_RPC_URL || process.env.RADIUS_ENDPOINT;
		if (envUrl) {
			return envUrl;
		}
	}

	// Fall back to chain config
	const chainUrl = chain.rpcUrls.default.http[0];
	if (!chainUrl) {
		throw new RadiusError(
			'Missing RPC URL configuration',
			{
				details: 'Set RADIUS_RPC_URL environment variable or configure chain.rpcUrls',
			},
		);
	}
	return chainUrl;
}

export function createRadiusClient(config: RadiusClientConfig): RadiusClient {
	// Get RPC URL from config, env vars, or chain default
	const rpcUrl = getRpcUrl(config.chain);

	// Create transport - use provided transport or create intercepting transport if logger/interceptor provided
	let transport: Transport;
	if (config.transport) {
		transport = config.transport;
	} else if (config.logger || config.interceptor) {
		transport = createInterceptingTransport({
			url: rpcUrl,
			interceptor: config.interceptor,
			logger: config.logger,
		});
	} else {
		// Create a basic http transport using the intercepting transport without logger/interceptor
		transport = createInterceptingTransport({ url: rpcUrl });
	}

	const publicClient = createPublicClient({
		chain: config.chain,
		transport,
	});

	/**
	 * Convert a viem TransactionReceipt to RadiusReceipt
	 */
	function toRadiusReceipt(receipt: TransactionReceipt): RadiusReceipt {
		return {
			transactionHash: receipt.transactionHash,
			from: receipt.from,
			to: receipt.to ?? null,
			contractAddress: receipt.contractAddress ?? null,
			gasUsed: receipt.gasUsed,
			status: receipt.status,
			blockNumber: receipt.blockNumber,
			blockHash: receipt.blockHash,
			logs: receipt.logs,
		};
	}

	/**
	 * Sign and send a transaction
	 */
	async function signAndSendTransaction(
		signer: LocalAccount,
		tx: {
			to?: ViemAddress;
			data?: Hex;
			value?: bigint;
			gas?: bigint;
		},
	): Promise<Hash> {
		// Get nonce
		const nonce = await publicClient.getTransactionCount({
			address: signer.address,
			blockTag: 'pending',
		});

		// Estimate gas if not provided
		let gas: bigint;
		if (tx.gas !== undefined) {
			gas = tx.gas;
		} else {
			const estimate = await publicClient.estimateGas({
				account: signer.address,
				to: tx.to,
				data: tx.data,
				value: tx.value,
			});
			// Apply 20% safety margin
			const margin = estimate / 5n;
			gas = estimate + margin;
			// Cap at MAX_GAS
			if (gas > MAX_GAS) {
				gas = MAX_GAS;
			}
		}

		// Sign the transaction
		const signedTx = await signer.signTransaction({
			to: tx.to,
			data: tx.data,
			value: tx.value ?? 0n,
			nonce,
			gas,
			gasPrice: 0n, // Radius uses zero gas price
			chainId: config.chain.id,
		});

		// Send the signed transaction
		return publicClient.sendRawTransaction({
			serializedTransaction: signedTx,
		});
	}

	return {
		publicClient,

		async getChainId(): Promise<bigint> {
			return BigInt(publicClient.chain?.id ?? (await publicClient.getChainId()));
		},

		async getBalance(params: GetBalanceParameters): Promise<bigint> {
			// Validate params - detect common mistakes
			if (typeof params === 'string') {
				throw new RadiusError('getBalance expects an object parameter', {
					metaMessages: [
						'You passed a string directly.',
						'Use client.getBalance({ address }) instead of client.getBalance(address)',
					],
					details: `Received: ${typeof params}`,
				});
			}
			if (!params || typeof params !== 'object' || !('address' in params)) {
				throw new RadiusError('getBalance expects an object with an address property', {
					metaMessages: [
						'Example: client.getBalance({ address: "0x..." })',
					],
					details: `Received: ${JSON.stringify(params)}`,
				});
			}

			const { address, blockNumber, blockTag = 'latest' } = params;
			if (blockNumber !== undefined) {
				return publicClient.getBalance({ address, blockNumber });
			}
			return publicClient.getBalance({ address, blockTag });
		},

		async getCode(params: GetCodeParameters): Promise<Hex | undefined> {
			// Validate params - detect common mistakes
			if (typeof params === 'string') {
				throw new RadiusError('getCode expects an object parameter', {
					metaMessages: [
						'You passed a string directly.',
						'Use client.getCode({ address }) instead of client.getCode(address)',
					],
					details: `Received: ${typeof params}`,
				});
			}
			if (!params || typeof params !== 'object' || !('address' in params)) {
				throw new RadiusError('getCode expects an object with an address property', {
					metaMessages: [
						'Example: client.getCode({ address: "0x..." })',
					],
					details: `Received: ${JSON.stringify(params)}`,
				});
			}

			const { address, blockNumber, blockTag = 'latest' } = params;
			if (blockNumber !== undefined) {
				return publicClient.getCode({ address, blockNumber });
			}
			return publicClient.getCode({ address, blockTag });
		},

		async getTransactionCount(params: GetTransactionCountParameters): Promise<number> {
			// Validate params - detect common mistakes
			if (typeof params === 'string') {
				throw new RadiusError('getTransactionCount expects an object parameter', {
					metaMessages: [
						'You passed a string directly.',
						'Use client.getTransactionCount({ address }) instead of client.getTransactionCount(address)',
					],
					details: `Received: ${typeof params}`,
				});
			}
			if (!params || typeof params !== 'object' || !('address' in params)) {
				throw new RadiusError('getTransactionCount expects an object with an address property', {
					metaMessages: [
						'Example: client.getTransactionCount({ address: "0x..." })',
					],
					details: `Received: ${JSON.stringify(params)}`,
				});
			}

			const { address, blockNumber, blockTag = 'pending' } = params;
			if (blockNumber !== undefined) {
				return publicClient.getTransactionCount({ address, blockNumber });
			}
			return publicClient.getTransactionCount({ address, blockTag });
		},

		async estimateGas(tx: TransactionRequest): Promise<bigint> {
			const estimate = await publicClient.estimateGas(tx);
			// Apply 20% safety margin
			const margin = estimate / 5n;
			const gas = estimate + margin;
			// Cap at MAX_GAS
			return gas > MAX_GAS ? MAX_GAS : gas;
		},

		async call<T = unknown>(
			contract: ContractInstance,
			method: string,
			...args: unknown[]
		): Promise<T> {
			if (!contract.abi) {
				throw new MissingAbiError('Contract ABI is required');
			}
			if (!contract.address) {
				throw new ContractCallError('Contract address is required', {
					functionName: method,
					args: args as readonly unknown[],
				});
			}

			// Encode the function call
			let data: Hex;
			try {
				data = encodeFunctionData({
					abi: contract.abi,
					functionName: method,
					args: args as readonly unknown[],
				});
			} catch (err) {
				throw new AbiError(`Failed to encode function call: ${(err as Error).message}`, {
					cause: err instanceof Error ? err : undefined,
				});
			}

			// Make the call
			const result = await publicClient.call({
				to: contract.address,
				data,
			});

			if (!result.data) {
				throw new ContractCallError('No data returned from contract call', {
					contractAddress: contract.address,
					functionName: method,
					args: args as readonly unknown[],
				});
			}

			// Decode the result
			let decoded: unknown;
			try {
				decoded = decodeFunctionResult({
					abi: contract.abi,
					functionName: method,
					data: result.data,
				});
			} catch (err) {
				throw new AbiError(`Failed to decode function result: ${(err as Error).message}`, {
					cause: err instanceof Error ? err : undefined,
				});
			}

			return decoded as T;
		},

		async execute(
			contract: ContractInstance,
			signer: LocalAccount,
			method: string,
			...args: unknown[]
		): Promise<Hash> {
			if (!contract.abi) {
				throw new MissingAbiError('Contract ABI is required');
			}
			if (!contract.address) {
				throw new ContractCallError('Contract address is required', {
					functionName: method,
					args: args as readonly unknown[],
				});
			}

			// Encode the function call
			let data: Hex;
			try {
				data = encodeFunctionData({
					abi: contract.abi,
					functionName: method,
					args: args as readonly unknown[],
				});
			} catch (err) {
				throw new AbiError(`Failed to encode function call: ${(err as Error).message}`, {
					cause: err instanceof Error ? err : undefined,
				});
			}

			return signAndSendTransaction(signer, {
				to: contract.address,
				data,
				value: 0n,
			});
		},

		async executeAndWait(
			contract: ContractInstance,
			signer: LocalAccount,
			method: string,
			...args: unknown[]
		): Promise<RadiusReceipt> {
			const hash = await this.execute(contract, signer, method, ...args);
			return this.waitForTransactionReceipt({ hash });
		},

		async send(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<Hash> {
			return signAndSendTransaction(signer, {
				to,
				value,
			});
		},

		async sendAndWait(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<RadiusReceipt> {
			const hash = await this.send(signer, to, value);
			return this.waitForTransactionReceipt({ hash });
		},

		async deployContract(
			signer: LocalAccount,
			bytecode: Hex,
			abi: Abi,
			...args: unknown[]
		): Promise<{ address: ViemAddress; receipt: RadiusReceipt }> {
			// Encode constructor arguments if any
			let deployData: Hex = bytecode;
			if (args.length > 0) {
				// Find the constructor in the ABI
				const ctorItem = abi.find(
					(item): item is AbiConstructor =>
						typeof item === 'object' &&
						item !== null &&
						'type' in item &&
						item.type === 'constructor',
				);
				if (ctorItem?.inputs && ctorItem.inputs.length > 0) {
					try {
						const encodedArgs = encodeAbiParameters(ctorItem.inputs, args as readonly unknown[]);
						// Append constructor args to bytecode (remove 0x prefix from encoded args)
						deployData = `${bytecode}${encodedArgs.slice(2)}` as Hex;
					} catch (err) {
						throw new AbiError(`Failed to encode constructor arguments: ${(err as Error).message}`, {
							cause: err instanceof Error ? err : undefined,
						});
					}
				}
			}

			// Send deployment transaction (to is undefined for contract creation)
			const hash = await signAndSendTransaction(signer, {
				data: deployData,
				value: 0n,
			});

			// Wait for receipt
			const receipt = await this.waitForTransactionReceipt({ hash });

			if (!receipt.contractAddress) {
				throw new ContractDeploymentError('Contract deployment failed: no contract address in receipt', {
					bytecode,
					constructorArgs: args as readonly unknown[],
				});
			}

			if (receipt.status !== 'success') {
				throw new TransactionRevertedError('Contract deployment failed: transaction reverted', {
					transactionHash: receipt.transactionHash,
				});
			}

			return {
				address: receipt.contractAddress,
				receipt,
			};
		},

		async sendRawTransaction(params: SendRawTransactionParameters): Promise<Hash> {
			// Validate params
			if (typeof params === 'string') {
				throw new RadiusError('sendRawTransaction expects an object parameter', {
					metaMessages: [
						'You passed a string directly.',
						'Use client.sendRawTransaction({ serializedTransaction }) instead of client.sendRawTransaction(signedTx)',
					],
					details: `Received: ${typeof params}`,
				});
			}
			if (!params || typeof params !== 'object' || !('serializedTransaction' in params)) {
				throw new RadiusError('sendRawTransaction expects an object with a serializedTransaction property', {
					metaMessages: [
						'Example: client.sendRawTransaction({ serializedTransaction: "0x..." })',
					],
					details: `Received: ${JSON.stringify(params)}`,
				});
			}

			return publicClient.sendRawTransaction({
				serializedTransaction: params.serializedTransaction,
			});
		},

		async waitForTransactionReceipt(params: WaitForTransactionReceiptParameters): Promise<RadiusReceipt> {
			// Validate params
			if (typeof params === 'string') {
				throw new RadiusError('waitForTransactionReceipt expects an object parameter', {
					metaMessages: [
						'You passed a string directly.',
						'Use client.waitForTransactionReceipt({ hash }) instead of client.waitForTransactionReceipt(hash)',
					],
					details: `Received: ${typeof params}`,
				});
			}
			if (!params || typeof params !== 'object' || !('hash' in params)) {
				throw new RadiusError('waitForTransactionReceipt expects an object with a hash property', {
					metaMessages: [
						'Example: client.waitForTransactionReceipt({ hash: "0x..." })',
					],
					details: `Received: ${JSON.stringify(params)}`,
				});
			}

			const receipt = await publicClient.waitForTransactionReceipt({ hash: params.hash });
			return toRadiusReceipt(receipt);
		},

		async readContract<T = unknown>(params: ReadContractParameters): Promise<T> {
			const { address, abi, functionName, args = [] } = params;
			const contract = { address, abi };
			return this.call<T>(contract, functionName, ...args);
		},

		async writeContract(params: WriteContractParameters): Promise<Hash> {
			const { address, abi, functionName, args = [], account } = params;
			const contract = { address, abi };
			return this.execute(contract, account, functionName, ...args);
		},

		extend<TExtension extends Record<string, unknown>>(
			extender: (client: RadiusClient) => TExtension,
		): RadiusClient & TExtension {
			const extension = extender(this as RadiusClient);
			return Object.assign(Object.create(this), extension) as RadiusClient & TExtension;
		},

		getContract<TAbi extends Abi>(params: GetContractParameters<TAbi>): TypedContract<TAbi> {
			return getContract(this as RadiusClient, params);
		},
	} as RadiusClient;
}

// Re-export commonly used viem types for convenience
export type { Chain, Transport, Abi, Hash, Hex, TransactionReceipt };
export type { ViemAddress as Address };
