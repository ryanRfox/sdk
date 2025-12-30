import { decodeEventLog } from 'viem';
import { ERC20_ABI } from '../contracts/erc20';
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
export function watchApproval(client, params) {
  // Build event filter args based on owner/spender parameters
  const args = {};
  if (params.owner) args.owner = params.owner;
  if (params.spender) args.spender = params.spender;
  return client.watchContractEvent({
    address: params.address,
    abi: ERC20_ABI,
    eventName: 'Approval',
    args: Object.keys(args).length > 0 ? args : undefined,
    onLogs: (logs) => {
      // Decode and transform logs to ApprovalEvent format
      const events = logs
        .map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: ERC20_ABI,
              data: log.data,
              topics: log.topics,
            });
            return {
              owner: decoded.args.owner,
              spender: decoded.args.spender,
              value: decoded.args.value,
              log: log,
            };
          } catch (error) {
            // Skip logs that can't be decoded
            if (params.onError) {
              params.onError(
                error instanceof Error ? error : new Error('Failed to decode Approval event')
              );
            }
            return null;
          }
        })
        .filter((event) => event !== null);
      if (events.length > 0) {
        params.onApproval(events);
      }
    },
    onError: params.onError,
    pollingInterval: params.pollingInterval,
  });
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
export function watchApprovalForAddress(client, params) {
  // Validate parameters
  if (params.ownerOnly && params.spenderOnly) {
    throw new Error('Cannot set both ownerOnly and spenderOnly to true');
  }
  // Determine filter parameters
  let owner;
  let spender;
  if (params.ownerOnly) {
    owner = params.watchAddress;
  } else if (params.spenderOnly) {
    spender = params.watchAddress;
  } else {
    // Watch both: need to create two separate subscriptions
    // This is a limitation of eth_subscribe - can't do OR filters
    // We'll need to watch both and merge results
    const unwatchOwner = watchApproval(client, {
      address: params.tokenAddress,
      owner: params.watchAddress,
      onApproval: params.onApproval,
      onError: params.onError,
      sync: params.sync,
      pollingInterval: params.pollingInterval,
    });
    const unwatchSpender = watchApproval(client, {
      address: params.tokenAddress,
      spender: params.watchAddress,
      onApproval: params.onApproval,
      onError: params.onError,
      sync: params.sync,
      pollingInterval: params.pollingInterval,
    });
    // Return combined unwatch function
    return () => {
      unwatchOwner();
      unwatchSpender();
    };
  }
  return watchApproval(client, {
    address: params.tokenAddress,
    owner,
    spender,
    onApproval: params.onApproval,
    onError: params.onError,
    sync: params.sync,
    pollingInterval: params.pollingInterval,
  });
}
//# sourceMappingURL=watchApproval.js.map
