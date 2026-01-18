import { decodeEventLog, erc20Abi } from 'viem';
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
export function watchTransfer(client, params) {
    // Build event filter args based on from/to parameters
    const args = {};
    if (params.from)
        args.from = params.from;
    if (params.to)
        args.to = params.to;
    return client.watchContractEvent({
        address: params.address,
        abi: erc20Abi,
        eventName: 'Transfer',
        args: Object.keys(args).length > 0 ? args : undefined,
        onLogs: (logs) => {
            // Decode and transform logs to TransferEvent format
            const events = logs
                .map((log) => {
                try {
                    const decoded = decodeEventLog({
                        abi: erc20Abi,
                        data: log.data,
                        topics: log.topics,
                    });
                    return {
                        from: decoded.args.from,
                        to: decoded.args.to,
                        value: decoded.args.value,
                        log: log,
                    };
                }
                catch (error) {
                    // Skip logs that can't be decoded
                    if (params.onError) {
                        params.onError(error instanceof Error ? error : new Error('Failed to decode Transfer event'));
                    }
                    return null;
                }
            })
                .filter((event) => event !== null);
            if (events.length > 0) {
                params.onTransfer(events);
            }
        },
        onError: params.onError,
        pollingInterval: params.pollingInterval,
    });
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
export function watchTransferForAddress(client, params) {
    // Validate parameters
    if (params.senderOnly && params.receiverOnly) {
        throw new Error('Cannot set both senderOnly and receiverOnly to true');
    }
    // Determine filter parameters
    let from;
    let to;
    if (params.senderOnly) {
        from = params.watchAddress;
    }
    else if (params.receiverOnly) {
        to = params.watchAddress;
    }
    else {
        // Watch both: need to create two separate subscriptions
        // This is a limitation of eth_subscribe - can't do OR filters
        // Use deduplication to prevent duplicate callbacks for the same event
        const seenEvents = new Set();
        // Create a unique key for each event (using tx hash + log index)
        const getEventKey = (event) => {
            const txHash = event.log.transactionHash ?? 'pending';
            const logIndex = event.log.logIndex ?? 0;
            return `${txHash}-${logIndex}`;
        };
        // Wrapper that deduplicates events before calling the callback
        const deduplicatedCallback = (events) => {
            const newEvents = events.filter((event) => {
                const key = getEventKey(event);
                if (seenEvents.has(key)) {
                    return false;
                }
                seenEvents.add(key);
                return true;
            });
            if (newEvents.length > 0) {
                params.onTransfer(newEvents);
            }
        };
        const unwatchFrom = watchTransfer(client, {
            address: params.tokenAddress,
            from: params.watchAddress,
            onTransfer: deduplicatedCallback,
            onError: params.onError,
            sync: params.sync,
            pollingInterval: params.pollingInterval,
        });
        const unwatchTo = watchTransfer(client, {
            address: params.tokenAddress,
            to: params.watchAddress,
            onTransfer: deduplicatedCallback,
            onError: params.onError,
            sync: params.sync,
            pollingInterval: params.pollingInterval,
        });
        // Return combined unwatch function
        return () => {
            unwatchFrom();
            unwatchTo();
        };
    }
    return watchTransfer(client, {
        address: params.tokenAddress,
        from,
        to,
        onTransfer: params.onTransfer,
        onError: params.onError,
        sync: params.sync,
        pollingInterval: params.pollingInterval,
    });
}
//# sourceMappingURL=watchTransfer.js.map