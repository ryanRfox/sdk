import {
	type Address as ViemAddress,
	getAddress,
	type Hex,
	hexToBytes,
	type Log,
	type TransactionReceipt,
} from 'viem';
import { ABI } from './abi';
import { ZERO_ADDRESS, type Address } from './address';
import { Event } from './event';
import { Hash } from './hash';
import { createReceipt, type Receipt, type TransactionStatus } from './receipt';

/**
 * Creates a new ABI (Application Binary Interface) from a JSON string
 * @param json ABI definition in JSON string format
 * @returns A new ABI instance, or undefined if the JSON is invalid
 */
export function abiFromJSON(json: string): ABI | undefined {
	try {
		return new ABI(json);
	} catch {
		return undefined;
	}
}

/**
 * Normalizes and validates an address string.
 * Returns a checksummed viem Address type.
 *
 * @param hex - Hex string with or without 0x prefix
 * @returns Checksummed address
 * @throws Error if the hex string is invalid
 *
 * @example
 * ```typescript
 * const address = addressFromHex('742d35cc6634c0532925a3b844bc9e7595f7e9f1');
 * // Returns: '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1'
 * ```
 */
export function addressFromHex(hex: string): Address {
	const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
	return getAddress(cleanHex as ViemAddress);
}

/**
 * Converts a hex string to a byte array
 * @param s Hex string (with or without 0x prefix)
 * @returns Byte array representation of the hex string, or undefined if the string is not valid hex
 */
export function bytecodeFromHex(s: string): Uint8Array | undefined {
	try {
		const cleanHex = s.startsWith('0x') ? s.slice(2) : s;
		return hexToBytes(`0x${cleanHex}` as Hex);
	} catch {
		return undefined;
	}
}

/**
 * Converts Ethereum logs to Radius events
 * @param logs Ethereum logs
 * @returns Array of Radius events
 */
export function eventsFromEthLogs(logs: Log[]): Event[] {
	return logs.map((log) => new Event(log.topics[0] ?? '', {}, log.data ?? '0x'));
}

/**
 * Normalizes a hash string to proper hex format.
 *
 * @param hex - The hexadecimal string (with or without 0x prefix)
 * @returns Normalized hash with 0x prefix
 * @throws Error if the hex string is invalid
 */
export function hashFromHex(hex: string): Hash {
	const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
	return new Hash(hexToBytes(cleanHex as Hex));
}

/**
 * Creates a new Radius receipt from an Ethereum/viem receipt.
 *
 * @param receipt - viem TransactionReceipt
 * @param from - Sender address (optional, uses receipt.from)
 * @param to - Recipient address (optional, uses receipt.to)
 * @param value - Transaction value (optional)
 * @returns Radius Receipt
 *
 * @deprecated Use RadiusReceipt from client directly instead
 */
export function receiptFromEthReceipt(
	receipt: TransactionReceipt,
	from?: Address,
	to?: Address,
	value?: bigint,
): Receipt {
	const status: TransactionStatus = receipt.status;
	return createReceipt(
		from ?? receipt.from,
		to ?? receipt.to ?? null,
		receipt.contractAddress ?? null,
		receipt.transactionHash,
		receipt.gasUsed,
		status,
		eventsFromEthLogs(receipt.logs ?? []),
		value,
	);
}

/**
 * Returns the zero address constant.
 *
 * @returns The zero address (0x0000000000000000000000000000000000000000)
 *
 * @deprecated Import ZERO_ADDRESS constant directly instead
 */
export function zeroAddress(): Address {
	return ZERO_ADDRESS;
}
