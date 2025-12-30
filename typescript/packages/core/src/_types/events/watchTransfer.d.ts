/**
 * ERC-20 Transfer event watching utilities for Radius SDK.
 * Provides convenient wrappers for watching Transfer events in real-time.
 */
import type { Address, Log, PublicClient, WatchContractEventReturnType } from 'viem';
/**
 * Decoded Transfer event data.
 */
export interface TransferEvent {
  /** The address that sent the tokens */
  from: Address;
  /** The address that received the tokens */
  to: Address;
  /** The amount of tokens transferred (in smallest unit) */
  value: bigint;
  /** The raw log data */
  log: Log;
}
/**
 * Parameters for watching Transfer events.
 */
export interface WatchTransferParameters {
  /** The ERC-20 token contract address to watch */
  address: Address;
  /** Optional: Filter by sender address */
  from?: Address;
  /** Optional: Filter by recipient address */
  to?: Address;
  /** Callback function invoked when Transfer events are received */
  onTransfer: (events: TransferEvent[]) => void;
  /** Callback function invoked when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to emit logs from the latest block on subscription start */
  sync?: boolean;
  /** Polling interval in milliseconds (for HTTP transport fallback) */
  pollingInterval?: number;
}
/**
 * Watches for ERC-20 Transfer events in real-time.
 * Automatically decodes Transfer events and provides type-safe callbacks.
 *
 * @param client - The PublicClient to use (WebSocket transport recommended)
 * @param params - Transfer event watching parameters
 * @returns An unwatch function to stop the subscription
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchTransfer } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch all transfers for a token
 * const unwatch = watchTransfer(client, {
 *   address: '0x...', // Token address
 *   onTransfer: (events) => {
 *     events.forEach(event => {
 *       console.log(`Transfer: ${event.value} from ${event.from} to ${event.to}`);
 *     });
 *   },
 * });
 *
 * // Watch transfers to a specific address
 * const unwatchToAddress = watchTransfer(client, {
 *   address: '0x...', // Token address
 *   to: '0x...', // Recipient address
 *   onTransfer: (events) => {
 *     console.log(`Received ${events.length} transfers`);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - Requires WebSocket transport for real-time subscriptions
 * - Automatically decodes Transfer events using ERC-20 ABI
 * - Filters by from/to addresses if provided
 * - Event signature: Transfer(address indexed from, address indexed to, uint256 value)
 * - Subscriptions consume gas from your RPC key on Radius (10 GAS/sec)
 */
export declare function watchTransfer(
  client: PublicClient,
  params: WatchTransferParameters
): WatchContractEventReturnType;
/**
 * Parameters for watching Transfer events for a specific address (as sender or receiver).
 */
export interface WatchTransferForAddressParameters {
  /** The ERC-20 token contract address to watch */
  tokenAddress: Address;
  /** The address to watch (as sender or receiver) */
  watchAddress: Address;
  /** Whether to watch as sender only (default: false, watches both sender and receiver) */
  senderOnly?: boolean;
  /** Whether to watch as receiver only (default: false, watches both sender and receiver) */
  receiverOnly?: boolean;
  /** Callback function invoked when Transfer events are received */
  onTransfer: (events: TransferEvent[]) => void;
  /** Callback function invoked when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to emit logs from the latest block on subscription start */
  sync?: boolean;
  /** Polling interval in milliseconds (for HTTP transport fallback) */
  pollingInterval?: number;
}
/**
 * Watches for Transfer events involving a specific address (as sender or receiver).
 * Convenience wrapper around watchTransfer for monitoring a single address.
 *
 * @param client - The PublicClient to use (WebSocket transport recommended)
 * @param params - Transfer watching parameters for specific address
 * @returns An unwatch function to stop the subscription
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchTransferForAddress } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch all transfers involving an address (sent or received)
 * const unwatch = watchTransferForAddress(client, {
 *   tokenAddress: '0x...', // Token address
 *   watchAddress: '0x...', // Address to monitor
 *   onTransfer: (events) => {
 *     events.forEach(event => {
 *       if (event.from === watchAddress) {
 *         console.log(`Sent ${event.value} to ${event.to}`);
 *       } else {
 *         console.log(`Received ${event.value} from ${event.from}`);
 *       }
 *     });
 *   },
 * });
 *
 * // Watch only transfers sent from an address
 * const unwatchSent = watchTransferForAddress(client, {
 *   tokenAddress: '0x...',
 *   watchAddress: '0x...',
 *   senderOnly: true,
 *   onTransfer: (events) => {
 *     console.log(`Sent ${events.length} transfers`);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - If neither senderOnly nor receiverOnly is set, watches both directions
 * - Cannot set both senderOnly and receiverOnly to true
 * - More efficient than watching all transfers and filtering client-side
 * - Server-side filtering reduces network traffic and processing
 */
export declare function watchTransferForAddress(
  client: PublicClient,
  params: WatchTransferForAddressParameters
): WatchContractEventReturnType;
//# sourceMappingURL=watchTransfer.d.ts.map
