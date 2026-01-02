/**
 * Block watching utilities for Radius SDK.
 * Provides wrappers for watching new blocks in real-time.
 *
 * @remarks Radius-Specific Limitations
 *
 * **HTTP Polling (Current Implementation)**:
 * - Radius does NOT support `newHeads` WebSocket subscriptions
 * - `eth_subscribe` only supports "logs" type subscriptions (not newHeads, not newPendingTransactions)
 * - WebSocket is NOT currently enabled on Radius testnet
 * - Default polling interval: 1000ms (1 second)
 * - Uses HTTP-based polling to detect new blocks as a fallback mechanism
 *
 * **Future Considerations**:
 * - When WebSocket is enabled on Radius, this module can be updated to use native subscriptions
 * - Review implementation in watchLogs.ts as a reference for WebSocket usage patterns
 */
import type { Block, PublicClient } from 'viem';
/**
 * Default polling interval for block watching in milliseconds.
 * Used when polling is required (e.g., HTTP transport fallback).
 * Can be overridden per watch call via pollingInterval parameter.
 */
export declare const DEFAULT_POLLING_INTERVAL_MS = 1000;
/**
 * Parameters for watching new block numbers.
 */
export interface WatchBlockNumberParams {
    /** Callback function invoked when a new block number is detected */
    onBlockNumber: (blockNumber: bigint) => void;
    /** Callback function invoked when an error occurs */
    onError?: (error: Error) => void;
    /** Whether to emit the current block number on subscription start */
    emitOnBegin?: boolean;
    /** Polling interval in milliseconds (default: 1000ms for HTTP, real-time for WebSocket) */
    pollingInterval?: number;
}
/**
 * Watches for new block numbers.
 * Uses WebSocket subscriptions when available, falls back to polling for HTTP transport.
 *
 * @param client - The PublicClient to use
 * @param params - Block number watching parameters
 * @returns An unwatch function to stop watching
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchBlockNumber } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch for new blocks
 * const unwatch = watchBlockNumber(client, {
 *   onBlockNumber: (blockNumber) => {
 *     console.log('New block:', blockNumber);
 *   },
 *   onError: (error) => {
 *     console.error('Error:', error);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - WebSocket transport provides real-time block notifications
 * - HTTP transport falls back to polling (default 1s interval)
 * - Radius does not support eth_newBlockFilter (traditional filter API)
 * - WebSocket subscriptions are more efficient than polling
 * - For HTTP clients, consider increasing pollingInterval to reduce load
 */
export declare function watchBlockNumber(client: PublicClient, params: WatchBlockNumberParams): () => void;
/**
 * Parameters for watching new blocks (full block data).
 */
export interface WatchBlocksParams {
    /** Callback function invoked when a new block is detected */
    onBlock: (block: Block) => void;
    /** Callback function invoked when an error occurs */
    onError?: (error: Error) => void;
    /** Whether to emit the current block on subscription start */
    emitOnBegin?: boolean;
    /** Whether to include transactions in the block (default: false) */
    includeTransactions?: boolean;
    /** Polling interval in milliseconds (default: 1000ms for HTTP, real-time for WebSocket) */
    pollingInterval?: number;
}
/**
 * Watches for new blocks with full block data.
 * Uses WebSocket subscriptions when available, falls back to polling for HTTP transport.
 *
 * @param client - The PublicClient to use
 * @param params - Block watching parameters
 * @returns An unwatch function to stop watching
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchBlocks } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch for new blocks
 * const unwatch = watchBlocks(client, {
 *   onBlock: (block) => {
 *     console.log('New block:', block.number);
 *     console.log('Timestamp:', block.timestamp);
 *     console.log('Transactions:', block.transactions.length);
 *   },
 * });
 *
 * // Watch blocks with full transaction data
 * const unwatchWithTxs = watchBlocks(client, {
 *   includeTransactions: true,
 *   onBlock: (block) => {
 *     console.log('New block with', block.transactions.length, 'transactions');
 *     // block.transactions contains full transaction objects
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - WebSocket transport provides real-time block notifications
 * - HTTP transport falls back to polling (default 1s interval)
 * - includeTransactions=true fetches full transaction data (slower)
 * - includeTransactions=false only includes transaction hashes (faster, default)
 * - WebSocket is recommended for real-time block monitoring
 * - Polling with includeTransactions=true can be expensive
 */
export declare function watchBlocks(client: PublicClient, params: WatchBlocksParams): () => void;
/**
 * Parameters for watching pending transactions.
 */
export interface WatchPendingTransactionsParams {
    /** Callback function invoked when new pending transactions are detected */
    onTransactions: (hashes: `0x${string}`[]) => void;
    /** Callback function invoked when an error occurs */
    onError?: (error: Error) => void;
    /** Polling interval in milliseconds (required for HTTP transport) */
    pollingInterval?: number;
}
/**
 * Watches for pending transactions in the mempool.
 *
 * @param client - The PublicClient to use
 * @param params - Pending transaction watching parameters
 * @returns An unwatch function to stop watching
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchPendingTransactions } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch for pending transactions
 * const unwatch = watchPendingTransactions(client, {
 *   onTransactions: (hashes) => {
 *     console.log('New pending transactions:', hashes);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - LIMITATION: Radius does not support eth_newPendingTransactionFilter
 * - This function may not work as expected on Radius
 * - WebSocket transport with "pendingTransactions" subscription is not supported
 * - Consider using block watching and filtering confirmed transactions instead
 * - This is provided for API completeness but may have limited functionality
 */
export declare function watchPendingTransactions(client: PublicClient, params: WatchPendingTransactionsParams): () => void;
//# sourceMappingURL=watchBlock.d.ts.map