/**
 * ERC-20 Approval event watching utilities for Radius SDK.
 * Provides convenient wrappers for watching Approval events in real-time.
 */
import type { Address, Log, PublicClient, WatchContractEventReturnType } from 'viem';
/**
 * Decoded Approval event data.
 */
export interface ApprovalEvent {
  /** The address that owns the tokens */
  owner: Address;
  /** The address that is approved to spend the tokens */
  spender: Address;
  /** The amount of tokens approved (in smallest unit) */
  value: bigint;
  /** The raw log data */
  log: Log;
}
/**
 * Parameters for watching Approval events.
 */
export interface WatchApprovalParameters {
  /** The ERC-20 token contract address to watch */
  address: Address;
  /** Optional: Filter by owner address */
  owner?: Address;
  /** Optional: Filter by spender address */
  spender?: Address;
  /** Callback function invoked when Approval events are received */
  onApproval: (events: ApprovalEvent[]) => void;
  /** Callback function invoked when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to emit logs from the latest block on subscription start */
  sync?: boolean;
  /** Polling interval in milliseconds (for HTTP transport fallback) */
  pollingInterval?: number;
}
/**
 * Watches for ERC-20 Approval events in real-time.
 * Automatically decodes Approval events and provides type-safe callbacks.
 *
 * @param client - The PublicClient to use (WebSocket transport recommended)
 * @param params - Approval event watching parameters
 * @returns An unwatch function to stop the subscription
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchApproval } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch all approvals for a token
 * const unwatch = watchApproval(client, {
 *   address: '0x...', // Token address
 *   onApproval: (events) => {
 *     events.forEach(event => {
 *       console.log(`Approval: ${event.owner} approved ${event.spender} for ${event.value}`);
 *     });
 *   },
 * });
 *
 * // Watch approvals from a specific owner
 * const unwatchOwner = watchApproval(client, {
 *   address: '0x...', // Token address
 *   owner: '0x...', // Owner address
 *   onApproval: (events) => {
 *     console.log(`Owner granted ${events.length} approvals`);
 *   },
 * });
 *
 * // Watch approvals for a specific spender
 * const unwatchSpender = watchApproval(client, {
 *   address: '0x...', // Token address
 *   spender: '0x...', // Spender address
 *   onApproval: (events) => {
 *     console.log(`Spender received ${events.length} approvals`);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - Requires WebSocket transport for real-time subscriptions
 * - Automatically decodes Approval events using ERC-20 ABI
 * - Filters by owner/spender addresses if provided
 * - Event signature: Approval(address indexed owner, address indexed spender, uint256 value)
 * - Subscriptions consume gas from your RPC key on Radius (10 GAS/sec)
 * - An approval value of 0 revokes the approval
 */
export declare function watchApproval(
  client: PublicClient,
  params: WatchApprovalParameters
): WatchContractEventReturnType;
/**
 * Parameters for watching Approval events for a specific address (as owner or spender).
 */
export interface WatchApprovalForAddressParameters {
  /** The ERC-20 token contract address to watch */
  tokenAddress: Address;
  /** The address to watch (as owner or spender) */
  watchAddress: Address;
  /** Whether to watch as owner only (default: false, watches both owner and spender) */
  ownerOnly?: boolean;
  /** Whether to watch as spender only (default: false, watches both owner and spender) */
  spenderOnly?: boolean;
  /** Callback function invoked when Approval events are received */
  onApproval: (events: ApprovalEvent[]) => void;
  /** Callback function invoked when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to emit logs from the latest block on subscription start */
  sync?: boolean;
  /** Polling interval in milliseconds (for HTTP transport fallback) */
  pollingInterval?: number;
}
/**
 * Watches for Approval events involving a specific address (as owner or spender).
 * Convenience wrapper around watchApproval for monitoring a single address.
 *
 * @param client - The PublicClient to use (WebSocket transport recommended)
 * @param params - Approval watching parameters for specific address
 * @returns An unwatch function to stop the subscription
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport, watchApprovalForAddress } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: createWebSocketTransport(radiusTestnet),
 * });
 *
 * // Watch all approvals involving an address (as owner or spender)
 * const unwatch = watchApprovalForAddress(client, {
 *   tokenAddress: '0x...', // Token address
 *   watchAddress: '0x...', // Address to monitor
 *   onApproval: (events) => {
 *     events.forEach(event => {
 *       if (event.owner === watchAddress) {
 *         console.log(`Approved ${event.spender} for ${event.value}`);
 *       } else {
 *         console.log(`Received approval from ${event.owner} for ${event.value}`);
 *       }
 *     });
 *   },
 * });
 *
 * // Watch only approvals granted by an address (as owner)
 * const unwatchAsOwner = watchApprovalForAddress(client, {
 *   tokenAddress: '0x...',
 *   watchAddress: '0x...',
 *   ownerOnly: true,
 *   onApproval: (events) => {
 *     console.log(`Granted ${events.length} approvals`);
 *   },
 * });
 *
 * // Watch only approvals received by an address (as spender)
 * const unwatchAsSpender = watchApprovalForAddress(client, {
 *   tokenAddress: '0x...',
 *   watchAddress: '0x...',
 *   spenderOnly: true,
 *   onApproval: (events) => {
 *     console.log(`Received ${events.length} approvals`);
 *   },
 * });
 *
 * // Stop watching
 * unwatch();
 * ```
 *
 * @remarks
 * - If neither ownerOnly nor spenderOnly is set, watches both roles
 * - Cannot set both ownerOnly and spenderOnly to true
 * - More efficient than watching all approvals and filtering client-side
 * - Server-side filtering reduces network traffic and processing
 */
export declare function watchApprovalForAddress(
  client: PublicClient,
  params: WatchApprovalForAddressParameters
): WatchContractEventReturnType;
//# sourceMappingURL=watchApproval.d.ts.map
