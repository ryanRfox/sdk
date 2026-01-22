/**
 * sendTransactionBatch action - sends multiple transactions in a single JSON-RPC batch request.
 *
 * Radius does not queue future-nonce transactions like Ethereum. This action ensures
 * all transactions arrive in nonce order by using JSON-RPC batching.
 */
import type { Account, Address, Chain, Client, Hash, Hex, Transport } from 'viem';
/** Default maximum number of transactions in a single batch */
export declare const DEFAULT_MAX_BATCH_SIZE = 100;
/** Default timeout for batch fetch requests in milliseconds (30 seconds) */
export declare const DEFAULT_BATCH_TIMEOUT = 30000;
/**
 * Transaction request for batch submission.
 */
export interface SendTransactionBatchParameters {
    /** Array of transactions to send in the batch */
    transactions: Array<{
        /** The recipient address */
        to: Address;
        /** The amount to send in wei (default: 0n) */
        value?: bigint;
        /** The transaction data (for contract calls) */
        data?: Hex;
        /** Gas limit (if not provided, will be estimated) */
        gas?: bigint;
    }>;
    /** Maximum number of transactions allowed in the batch (default: 100) */
    maxBatchSize?: number;
    /** Timeout in milliseconds for the batch fetch request (default: 30000) */
    timeout?: number;
}
/**
 * Return type for sendTransactionBatch action.
 */
export type SendTransactionBatchReturnType = Hash[];
/**
 * Send multiple transactions in a single JSON-RPC batch request.
 * Transactions are automatically assigned sequential nonces and sent atomically.
 *
 * @param client - The viem client (must have an account attached)
 * @param params - The batch transaction parameters
 * @param params.transactions - Array of transaction objects to send
 * @param params.maxBatchSize - Maximum batch size (default: 100)
 * @param params.timeout - Fetch timeout in milliseconds (default: 30000)
 * @returns Array of transaction hashes in the same order as input
 * @throws {BatchTransactionError} If any transaction in the batch fails
 * @throws {GasEstimationError} If gas estimation fails for any transaction
 * @throws {RadiusError} If input validation fails, HTTP request fails, or request times out
 *
 * @remarks
 * **Transport Note:** This function uses a direct `fetch()` call rather than
 * the client's configured transport. Custom transport interceptors, retry logic,
 * or middleware will not be applied to batch requests. This is necessary because
 * viem's transport layer does not expose batch JSON-RPC capabilities.
 *
 * @example
 * ```typescript
 * import { createWalletClient, http } from 'viem';
 * import { privateKeyToAccount } from 'viem/accounts';
 * import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: radiusTestnet,
 *   transport: http(),
 * }).extend(radiusWalletActions());
 *
 * const hashes = await client.sendTransactionBatch({
 *   transactions: [
 *     { to: '0x...', value: 1000000000000000000n },
 *     { to: '0x...', data: '0x...' },
 *   ],
 * });
 * ```
 */
export declare function sendTransactionBatch<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, params: SendTransactionBatchParameters): Promise<SendTransactionBatchReturnType>;
//# sourceMappingURL=sendTransactionBatch.d.ts.map