/**
 * Default polling interval for block watching in milliseconds.
 * Used when polling is required (e.g., HTTP transport fallback).
 * Can be overridden per watch call via pollingInterval parameter.
 */
export const DEFAULT_POLLING_INTERVAL_MS = 1000;
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
export function watchBlockNumber(client, params) {
  const watchParams = {
    onBlockNumber: params.onBlockNumber,
    onError: params.onError,
    emitOnBegin: params.emitOnBegin,
    pollingInterval: params.pollingInterval ?? DEFAULT_POLLING_INTERVAL_MS,
  };
  return client.watchBlockNumber(watchParams);
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
export function watchBlocks(client, params) {
  // Only pass includeTransactions if explicitly set to true
  const watchParams = {
    onBlock: params.onBlock,
    onError: params.onError,
    emitOnBegin: params.emitOnBegin,
    pollingInterval: params.pollingInterval ?? DEFAULT_POLLING_INTERVAL_MS,
  };
  // Type assertion needed because viem's type is very strict about false vs undefined
  if (params.includeTransactions === true) {
    watchParams.includeTransactions = true;
  }
  return client.watchBlocks(watchParams);
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
export function watchPendingTransactions(client, params) {
  return client.watchPendingTransactions({
    onTransactions: params.onTransactions,
    onError: params.onError,
    pollingInterval: params.pollingInterval,
  });
}
//# sourceMappingURL=watchBlock.js.map
