/**
 * Radius SDK Client - A viem-based client for interacting with the Radius platform.
 *
 * This module provides the primary interface for reading blockchain state,
 * sending transactions, deploying contracts, and interacting with smart contracts.
 */
import { createPublicClient, decodeFunctionResult, encodeAbiParameters, encodeFunctionData, } from 'viem';
import { getContract, } from '../contracts/typedContract.js';
import { createInterceptingTransport } from '../transport';
import { AbiError, ContractCallError, ContractDeploymentError, MissingAbiError, RadiusError, TransactionRevertedError, } from '../errors';
/**
 * Maximum gas limit for transactions.
 * Used to cap gas estimates to prevent unexpectedly high costs.
 */
export const MAX_GAS = 1319413953330n;
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
function getRpcUrl(chain) {
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
        throw new RadiusError('Missing RPC URL configuration', {
            details: 'Set RADIUS_RPC_URL environment variable or configure chain.rpcUrls',
        });
    }
    return chainUrl;
}
export function createRadiusClient(config) {
    // Get RPC URL from config, env vars, or chain default
    const rpcUrl = getRpcUrl(config.chain);
    // Create transport - use provided transport or create intercepting transport if logger/interceptor provided
    let transport;
    if (config.transport) {
        transport = config.transport;
    }
    else if (config.logger || config.interceptor) {
        transport = createInterceptingTransport({
            url: rpcUrl,
            interceptor: config.interceptor,
            logger: config.logger,
        });
    }
    else {
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
    function toRadiusReceipt(receipt) {
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
    async function signAndSendTransaction(signer, tx) {
        // Get nonce
        const nonce = await publicClient.getTransactionCount({
            address: signer.address,
            blockTag: 'pending',
        });
        // Estimate gas if not provided
        let gas;
        if (tx.gas !== undefined) {
            gas = tx.gas;
        }
        else {
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
        async getChainId() {
            return BigInt(publicClient.chain?.id ?? (await publicClient.getChainId()));
        },
        async getBalance(params) {
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
        async getCode(params) {
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
        async getTransactionCount(params) {
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
        async estimateGas(tx) {
            const estimate = await publicClient.estimateGas(tx);
            // Apply 20% safety margin
            const margin = estimate / 5n;
            const gas = estimate + margin;
            // Cap at MAX_GAS
            return gas > MAX_GAS ? MAX_GAS : gas;
        },
        async call(contract, method, ...args) {
            if (!contract.abi) {
                throw new MissingAbiError('Contract ABI is required');
            }
            if (!contract.address) {
                throw new ContractCallError('Contract address is required', {
                    functionName: method,
                    args: args,
                });
            }
            // Encode the function call
            let data;
            try {
                data = encodeFunctionData({
                    abi: contract.abi,
                    functionName: method,
                    args: args,
                });
            }
            catch (err) {
                throw new AbiError(`Failed to encode function call: ${err.message}`, {
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
                    args: args,
                });
            }
            // Decode the result
            let decoded;
            try {
                decoded = decodeFunctionResult({
                    abi: contract.abi,
                    functionName: method,
                    data: result.data,
                });
            }
            catch (err) {
                throw new AbiError(`Failed to decode function result: ${err.message}`, {
                    cause: err instanceof Error ? err : undefined,
                });
            }
            return decoded;
        },
        async execute(contract, signer, method, ...args) {
            if (!contract.abi) {
                throw new MissingAbiError('Contract ABI is required');
            }
            if (!contract.address) {
                throw new ContractCallError('Contract address is required', {
                    functionName: method,
                    args: args,
                });
            }
            // Encode the function call
            let data;
            try {
                data = encodeFunctionData({
                    abi: contract.abi,
                    functionName: method,
                    args: args,
                });
            }
            catch (err) {
                throw new AbiError(`Failed to encode function call: ${err.message}`, {
                    cause: err instanceof Error ? err : undefined,
                });
            }
            return signAndSendTransaction(signer, {
                to: contract.address,
                data,
                value: 0n,
            });
        },
        async executeAndWait(contract, signer, method, ...args) {
            const hash = await this.execute(contract, signer, method, ...args);
            return this.waitForTransactionReceipt({ hash });
        },
        async send(signer, to, value) {
            return signAndSendTransaction(signer, {
                to,
                value,
            });
        },
        async sendAndWait(signer, to, value) {
            const hash = await this.send(signer, to, value);
            return this.waitForTransactionReceipt({ hash });
        },
        async deployContract(signer, bytecode, abi, ...args) {
            // Encode constructor arguments if any
            let deployData = bytecode;
            if (args.length > 0) {
                // Find the constructor in the ABI
                const ctorItem = abi.find((item) => typeof item === 'object' &&
                    item !== null &&
                    'type' in item &&
                    item.type === 'constructor');
                if (ctorItem?.inputs && ctorItem.inputs.length > 0) {
                    try {
                        const encodedArgs = encodeAbiParameters(ctorItem.inputs, args);
                        // Append constructor args to bytecode (remove 0x prefix from encoded args)
                        deployData = `${bytecode}${encodedArgs.slice(2)}`;
                    }
                    catch (err) {
                        throw new AbiError(`Failed to encode constructor arguments: ${err.message}`, {
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
                    constructorArgs: args,
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
        async sendRawTransaction(params) {
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
        async waitForTransactionReceipt(params) {
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
        async readContract(params) {
            const { address, abi, functionName, args = [] } = params;
            const contract = { address, abi };
            return this.call(contract, functionName, ...args);
        },
        async writeContract(params) {
            const { address, abi, functionName, args = [], account } = params;
            const contract = { address, abi };
            return this.execute(contract, account, functionName, ...args);
        },
        extend(extender) {
            const extension = extender(this);
            return Object.assign(Object.create(this), extension);
        },
        getContract(params) {
            return getContract(this, params);
        },
    };
}
//# sourceMappingURL=client.js.map