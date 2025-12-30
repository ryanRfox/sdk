/**
 * Generic log watching utilities for Radius SDK.
 * Provides real-time event subscription capabilities using WebSocket.
 */
import type { Address, Hash, Log, PublicClient, WatchContractEventReturnType } from 'viem';
import { watchContractEvent } from 'viem/actions';
/**
 * Watches for contract events in real-time using WebSocket subscriptions.
 * Uses viem's watchContractEvent under the hood, which leverages eth_subscribe for "logs".
 *
 * @param client - The PublicClient to use (must be configured with WebSocket transport)
 * @param params - Event watching parameters including address, ABI, event name, and callback
 * @returns An unwatch function to stop the subscription
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchLogs } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * // Create client with WebSocket transport
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch for events
 * const unwatch = watchLogs(client, {
 *   address: '0x...',
 *   abi: contractAbi,
 *   eventName: 'Transfer',
 *   onLogs: (logs) => {
 *     console.log('Transfer events:', logs);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - Requires WebSocket transport for real-time subscriptions
 * - Radius supports eth_subscribe with type "logs" only
 * - Address parameter is mandatory on Radius
 * - Subscriptions consume gas from your RPC key (10 GAS/sec)
 * - Automatically cleaned up on disconnect
 * - For HTTP transport, consider using getLogs with polling instead
 */
export declare function watchLogs(
  client: PublicClient,
  params: Parameters<typeof watchContractEvent>[1]
): WatchContractEventReturnType;
/**
 * Parameters for watching raw logs without ABI decoding.
 */
export interface WatchRawLogsParameters {
  /** The contract address to watch */
  address: Address | Address[];
  /** Optional event signature hashes to filter by */
  topics?: Hash[][];
  /** Callback function invoked when logs are received */
  onLogs: (logs: Log[]) => void;
  /** Callback function invoked when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to emit logs from the latest block on subscription start */
  sync?: boolean;
  /** Polling interval in milliseconds (for HTTP transport fallback) */
  pollingInterval?: number;
}
/**
 * Watches for raw logs without ABI decoding.
 * Useful when you want to receive raw log data or watch multiple event types.
 *
 * @param client - The PublicClient to use (WebSocket transport recommended)
 * @param params - Raw log watching parameters
 * @returns An unwatch function to stop the subscription
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchRawLogs } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch for all events from a contract
 * const unwatch = watchRawLogs(client, {
 *   address: '0x...',
 *   onLogs: (logs) => {
 *     logs.forEach(log => {
 *       console.log('Log:', log.topics, log.data);
 *     });
 *   },
 *   onError: (error) => {
 *     console.error('Subscription error:', error);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - Does not decode log data; returns raw topics and data
 * - Useful for monitoring multiple event types from same contract
 * - Requires address parameter (mandatory on Radius)
 * - WebSocket transport provides real-time updates
 * - HTTP transport falls back to polling (less efficient)
 */
export declare function watchRawLogs(
  client: PublicClient,
  params: WatchRawLogsParameters
): WatchContractEventReturnType;
//# sourceMappingURL=watchLogs.d.ts.map
