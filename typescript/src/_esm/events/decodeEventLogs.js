/**
 * Event log decoding utilities for Radius SDK.
 * Provides convenient wrappers around viem's decodeEventLog.
 */
import { decodeEventLog, } from 'viem';
export function decodeEventLogs(params) {
    const { abi, logs, strict = true } = params;
    const decoded = [];
    const failed = [];
    for (const log of logs) {
        try {
            const result = decodeEventLog({
                abi,
                data: log.data,
                topics: log.topics,
            });
            decoded.push({
                eventName: result.eventName,
                args: result.args,
                log,
            });
        }
        catch (error) {
            if (strict) {
                throw error;
            }
            failed.push({
                log,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    if (strict) {
        return decoded;
    }
    return {
        decoded,
        failed: failed.length > 0 ? failed : undefined,
    };
}
/**
 * Filters and decodes logs for a specific event type.
 *
 * This is useful when you only care about a specific event from a receipt
 * or log array that may contain multiple event types.
 *
 * @param params - The parameters for filtering
 * @returns Array of decoded logs matching the event name
 *
 * @example
 * ```typescript
 * import { filterEventLogs } from '@radiustechsystems/sdk/events';
 *
 * // Get only Transfer events from a receipt
 * const transfers = filterEventLogs({
 *   abi: erc20Abi,
 *   logs: receipt.logs,
 *   eventName: 'Transfer',
 * });
 *
 * for (const transfer of transfers) {
 *   console.log(`${transfer.args.from} sent ${transfer.args.value} to ${transfer.args.to}`);
 * }
 * ```
 */
export function filterEventLogs(params) {
    const { abi, logs, eventName } = params;
    // Find the event in the ABI to get its signature
    const eventAbi = abi.find((item) => item.type === 'event' && item.name === eventName);
    if (!eventAbi) {
        throw new Error(`Event "${eventName}" not found in ABI`);
    }
    const result = [];
    for (const log of logs) {
        try {
            const decoded = decodeEventLog({
                abi,
                data: log.data,
                topics: log.topics,
            });
            if (decoded.eventName === eventName) {
                result.push({
                    eventName: decoded.eventName,
                    args: decoded.args,
                    log,
                });
            }
        }
        catch {
            // Skip logs that don't match or can't be decoded
            continue;
        }
    }
    return result;
}
//# sourceMappingURL=decodeEventLogs.js.map