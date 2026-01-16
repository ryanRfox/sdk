/**
 * Event log decoding utilities for Radius SDK.
 * Provides convenient wrappers around viem's decodeEventLog.
 */
import {
	type Abi,
	type AbiEvent,
	type DecodeEventLogReturnType,
	type Log,
	decodeEventLog,
} from 'viem';

/**
 * A decoded event log with the original log data preserved.
 */
export interface DecodedEventLog<TAbi extends Abi = Abi> {
	/** The decoded event name */
	eventName: string;
	/** The decoded event arguments */
	args: DecodeEventLogReturnType<TAbi>['args'];
	/** The original raw log */
	log: Log;
}

/**
 * Parameters for decodeEventLogs.
 */
export interface DecodeEventLogsParameters<TAbi extends Abi = Abi> {
	/** The contract ABI containing event definitions */
	abi: TAbi;
	/** The logs to decode */
	logs: Log[];
	/** If true, skip logs that fail to decode instead of throwing (default: false) */
	strict?: boolean;
}

/**
 * Result when strict mode is disabled and some logs fail to decode.
 */
export interface DecodeEventLogsResult<TAbi extends Abi = Abi> {
	/** Successfully decoded logs */
	decoded: DecodedEventLog<TAbi>[];
	/** Logs that failed to decode (only present when strict: false) */
	failed?: Array<{ log: Log; error: Error }>;
}

/**
 * Decodes an array of event logs using the provided ABI.
 *
 * This is a convenience wrapper around viem's `decodeEventLog` that handles
 * multiple logs at once and provides options for error handling.
 *
 * @param params - The parameters for decoding
 * @returns Array of decoded event logs (or result object if strict: false)
 * @throws Error if any log fails to decode and strict mode is enabled (default)
 *
 * @example
 * ```typescript
 * import { decodeEventLogs } from '@radiustechsystems/sdk/events';
 *
 * const erc20Abi = [
 *   {
 *     type: 'event',
 *     name: 'Transfer',
 *     inputs: [
 *       { indexed: true, name: 'from', type: 'address' },
 *       { indexed: true, name: 'to', type: 'address' },
 *       { indexed: false, name: 'value', type: 'uint256' },
 *     ],
 *   },
 * ] as const;
 *
 * // Decode logs from a transaction receipt
 * const decoded = decodeEventLogs({
 *   abi: erc20Abi,
 *   logs: receipt.logs,
 * });
 *
 * for (const event of decoded) {
 *   if (event.eventName === 'Transfer') {
 *     console.log(`Transfer: ${event.args.from} -> ${event.args.to}: ${event.args.value}`);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With strict: false to handle mixed logs from multiple contracts
 * const result = decodeEventLogs({
 *   abi: erc20Abi,
 *   logs: mixedLogs,
 *   strict: false,
 * });
 *
 * console.log(`Decoded ${result.decoded.length} logs`);
 * console.log(`Failed to decode ${result.failed?.length ?? 0} logs`);
 * ```
 */
export function decodeEventLogs<TAbi extends Abi>(
	params: DecodeEventLogsParameters<TAbi> & { strict: false },
): DecodeEventLogsResult<TAbi>;
export function decodeEventLogs<TAbi extends Abi>(
	params: DecodeEventLogsParameters<TAbi> & { strict?: true },
): DecodedEventLog<TAbi>[];
export function decodeEventLogs<TAbi extends Abi>(
	params: DecodeEventLogsParameters<TAbi>,
): DecodedEventLog<TAbi>[] | DecodeEventLogsResult<TAbi>;
export function decodeEventLogs<TAbi extends Abi>(
	params: DecodeEventLogsParameters<TAbi>,
): DecodedEventLog<TAbi>[] | DecodeEventLogsResult<TAbi> {
	const { abi, logs, strict = true } = params;

	const decoded: DecodedEventLog<TAbi>[] = [];
	const failed: Array<{ log: Log; error: Error }> = [];

	for (const log of logs) {
		try {
			const result = decodeEventLog({
				abi,
				data: log.data,
				topics: log.topics,
			});

			decoded.push({
				eventName: result.eventName as string,
				args: result.args as DecodeEventLogReturnType<TAbi>['args'],
				log,
			});
		} catch (error) {
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
 * Parameters for filterEventLogs.
 */
export interface FilterEventLogsParameters<
	TAbi extends Abi = Abi,
	TEventName extends string = string,
> {
	/** The contract ABI containing event definitions */
	abi: TAbi;
	/** The logs to filter and decode */
	logs: Log[];
	/** The event name to filter for */
	eventName: TEventName;
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
export function filterEventLogs<TAbi extends Abi, TEventName extends string>(
	params: FilterEventLogsParameters<TAbi, TEventName>,
): DecodedEventLog<TAbi>[] {
	const { abi, logs, eventName } = params;

	// Find the event in the ABI to get its signature
	const eventAbi = abi.find(
		(item): item is AbiEvent => item.type === 'event' && item.name === eventName,
	);

	if (!eventAbi) {
		throw new Error(`Event "${eventName}" not found in ABI`);
	}

	const result: DecodedEventLog<TAbi>[] = [];

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
					args: decoded.args as DecodeEventLogReturnType<TAbi>['args'],
					log,
				});
			}
		} catch {
			// Skip logs that don't match or can't be decoded
			continue;
		}
	}

	return result;
}
