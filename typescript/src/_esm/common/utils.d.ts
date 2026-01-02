import { type Log, type TransactionReceipt } from 'viem';
import { ABI } from './abi';
import { type Address } from './address';
import { Event } from './event';
import { Hash } from './hash';
import { type Receipt } from './receipt';
/**
 * Creates a new ABI (Application Binary Interface) from a JSON string
 * @param json ABI definition in JSON string format
 * @returns A new ABI instance, or undefined if the JSON is invalid
 */
export declare function abiFromJSON(json: string): ABI | undefined;
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
export declare function addressFromHex(hex: string): Address;
/**
 * Converts a hex string to a byte array
 * @param s Hex string (with or without 0x prefix)
 * @returns Byte array representation of the hex string, or undefined if the string is not valid hex
 */
export declare function bytecodeFromHex(s: string): Uint8Array | undefined;
/**
 * Converts Ethereum logs to Radius events
 * @param logs Ethereum logs
 * @returns Array of Radius events
 */
export declare function eventsFromEthLogs(logs: Log[]): Event[];
/**
 * Normalizes a hash string to proper hex format.
 *
 * @param hex - The hexadecimal string (with or without 0x prefix)
 * @returns Normalized hash with 0x prefix
 * @throws Error if the hex string is invalid
 */
export declare function hashFromHex(hex: string): Hash;
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
export declare function receiptFromEthReceipt(receipt: TransactionReceipt, from?: Address, to?: Address, value?: bigint): Receipt;
/**
 * Returns the zero address constant.
 *
 * @returns The zero address (0x0000000000000000000000000000000000000000)
 *
 * @deprecated Import ZERO_ADDRESS constant directly instead
 */
export declare function zeroAddress(): Address;
//# sourceMappingURL=utils.d.ts.map