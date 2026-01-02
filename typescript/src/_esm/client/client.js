/**
 * Radius SDK Client - A viem-based client for interacting with the Radius platform.
 *
 * This module provides the primary interface for reading blockchain state,
 * sending transactions, deploying contracts, and interacting with smart contracts.
 */
import { createPublicClient, decodeFunctionResult, encodeAbiParameters, encodeFunctionData, } from 'viem';
import { createInterceptingTransport } from '../transport';
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
        throw new Error('No RPC URL configured. Set RADIUS_RPC_URL environment variable or configure chain.rpcUrls');
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
            chainId: signer.chainId,
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
        async getBalance(address) {
            return publicClient.getBalance({ address });
        },
        async getCode(address) {
            const code = await publicClient.getCode({ address });
            return code ?? '0x';
        },
        async getNonce(address) {
            return publicClient.getTransactionCount({
                address,
                blockTag: 'pending',
            });
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
                throw new Error('Contract ABI is required');
            }
            if (!contract.address) {
                throw new Error('Contract address is required');
            }
            // Encode the function call
            const data = encodeFunctionData({
                abi: contract.abi,
                functionName: method,
                args: args,
            });
            // Make the call
            const result = await publicClient.call({
                to: contract.address,
                data,
            });
            if (!result.data) {
                throw new Error('No data returned from contract call');
            }
            // Decode the result
            const decoded = decodeFunctionResult({
                abi: contract.abi,
                functionName: method,
                data: result.data,
            });
            return decoded;
        },
        async execute(contract, signer, method, ...args) {
            if (!contract.abi) {
                throw new Error('Contract ABI is required');
            }
            if (!contract.address) {
                throw new Error('Contract address is required');
            }
            // Encode the function call
            const data = encodeFunctionData({
                abi: contract.abi,
                functionName: method,
                args: args,
            });
            return signAndSendTransaction(signer, {
                to: contract.address,
                data,
                value: 0n,
            });
        },
        async executeAndWait(contract, signer, method, ...args) {
            const hash = await this.execute(contract, signer, method, ...args);
            return this.waitForReceipt(hash);
        },
        /** @deprecated Use executeAndWait instead */
        async executeSync(contract, signer, method, ...args) {
            return this.executeAndWait(contract, signer, method, ...args);
        },
        async send(signer, to, value) {
            return signAndSendTransaction(signer, {
                to,
                value,
            });
        },
        async sendAndWait(signer, to, value) {
            const hash = await this.send(signer, to, value);
            return this.waitForReceipt(hash);
        },
        /** @deprecated Use sendAndWait instead */
        async sendSync(signer, to, value) {
            return this.sendAndWait(signer, to, value);
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
                    const encodedArgs = encodeAbiParameters(ctorItem.inputs, args);
                    // Append constructor args to bytecode (remove 0x prefix from encoded args)
                    deployData = `${bytecode}${encodedArgs.slice(2)}`;
                }
            }
            // Send deployment transaction (to is undefined for contract creation)
            const hash = await signAndSendTransaction(signer, {
                data: deployData,
                value: 0n,
            });
            // Wait for receipt
            const receipt = await this.waitForReceipt(hash);
            if (!receipt.contractAddress) {
                throw new Error('Contract deployment failed: no contract address in receipt');
            }
            if (receipt.status !== 'success') {
                throw new Error('Contract deployment failed: transaction reverted');
            }
            return {
                address: receipt.contractAddress,
                receipt,
            };
        },
        async sendRawTransaction(signedTx) {
            return publicClient.sendRawTransaction({
                serializedTransaction: signedTx,
            });
        },
        async waitForReceipt(hash) {
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            return toRadiusReceipt(receipt);
        },
        extend(extender) {
            const extension = extender(this);
            return Object.assign(Object.create(this), extension);
        },
    };
}
//# sourceMappingURL=client.js.map