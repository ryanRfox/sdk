/**
 * Radius SDK Client - A viem-based client for interacting with the Radius platform.
 *
 * This module provides the primary interface for reading blockchain state,
 * sending transactions, deploying contracts, and interacting with smart contracts.
 */
import { type Abi, type Chain, type Hash, type Hex, type LocalAccount, type PublicClient, type TransactionReceipt, type TransactionRequest, type Transport, type Address as ViemAddress } from 'viem';
import { type Interceptor, type Logf } from '../transport';
/**
 * Maximum gas limit for transactions.
 * Used to cap gas estimates to prevent unexpectedly high costs.
 */
export declare const MAX_GAS = 1319413953330n;
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
 * import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { http } from 'viem';
 *
 * const client = createRadiusClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // Get balance
 * const balance = await client.getBalance('0x...');
 *
 * // Send transaction and wait for receipt
 * const account = createPrivateKeySigner('0x...privateKey');
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
     * @param address - The address to check
     * @returns The balance in wei
     */
    getBalance(address: ViemAddress): Promise<bigint>;
    /**
     * Get the bytecode deployed at an address.
     * @param address - The contract address
     * @returns The bytecode as a hex string, or '0x' if no code
     */
    getCode(address: ViemAddress): Promise<Hex>;
    /**
     * Get the pending nonce for an address.
     * @param address - The address to check
     * @returns The next nonce to use
     */
    getNonce(address: ViemAddress): Promise<number>;
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
    execute(contract: ContractInstance, signer: LocalAccount, method: string, ...args: unknown[]): Promise<Hash>;
    /**
     * Execute a state-changing contract method and wait for the receipt.
     * @param contract - The contract instance with ABI and address
     * @param signer - The signer to sign the transaction
     * @param method - The method name to execute
     * @param args - Arguments to pass to the method
     * @returns The transaction receipt
     */
    executeAndWait(contract: ContractInstance, signer: LocalAccount, method: string, ...args: unknown[]): Promise<RadiusReceipt>;
    /**
     * @deprecated Use executeAndWait instead
     */
    executeSync(contract: ContractInstance, signer: LocalAccount, method: string, ...args: unknown[]): Promise<RadiusReceipt>;
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
     * @deprecated Use sendAndWait instead
     */
    sendSync(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<RadiusReceipt>;
    /**
     * Deploy a smart contract.
     * @param signer - The signer to sign the deployment transaction
     * @param bytecode - The contract bytecode
     * @param abi - The contract ABI
     * @param args - Constructor arguments (if any)
     * @returns The deployed contract address and transaction receipt
     */
    deployContract(signer: LocalAccount, bytecode: Hex, abi: Abi, ...args: unknown[]): Promise<{
        address: ViemAddress;
        receipt: RadiusReceipt;
    }>;
    /**
     * Send a raw signed transaction.
     * Returns immediately after the transaction is sent.
     * @param signedTx - The signed transaction as a hex string
     * @returns The transaction hash
     */
    sendRawTransaction(signedTx: Hex): Promise<Hash>;
    /**
     * Wait for a transaction receipt.
     * @param hash - The transaction hash to wait for
     * @returns The transaction receipt
     */
    waitForReceipt(hash: Hash): Promise<RadiusReceipt>;
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
     *     const balance = await base.getBalance(address);
     *     return formatEther(balance);
     *   },
     * }));
     *
     * const formatted = await client.getBalanceFormatted('0x...');
     * ```
     */
    extend<TExtension extends Record<string, unknown>>(extender: (client: RadiusClient) => TExtension): RadiusClient & TExtension;
}
export declare function createRadiusClient(config: RadiusClientConfig): RadiusClient;
export type { Chain, Transport, Abi, Hash, Hex, TransactionReceipt };
export type { ViemAddress as Address };
//# sourceMappingURL=client.d.ts.map