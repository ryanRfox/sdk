import { type Log, type TransactionReceipt } from 'viem';
import { ABI } from './abi';
import { Address } from './address';
import { Event } from './event';
import { Hash } from './hash';
import { Receipt } from './receipt';
import type { BigNumberish } from './transaction';
/**
 * Creates a new ABI (Application Binary Interface) from a JSON string
 * @param json ABI definition in JSON string format
 * @returns A new ABI instance, or undefined if the JSON is invalid
 */
export declare function abiFromJSON(json: string): ABI | undefined;
/**
 * Creates an Address from a hex string
 * @param hex Hex string with or without 0x prefix
 * @returns Address instance
 * @throws Error if the hex string is invalid
 */
export declare function addressFromHex(hex: string): Address;
/**
 * Converts a hex string to a byte array
 * @param s Hex string (with or without 0x prefix)
 * @returns Byte array representation of the hex string, or undefined if the string is not valid hex
 */
export declare function bytecodeFromHex(s: string): Uint8Array | undefined;
/**
 * Converts a Radius Address to an Ethereum Address
 * @param address Radius Address
 * @returns Ethereum Address, or undefined if the input is undefined
 */
export declare function ethAddressFromRadiusAddress(address?: Address): string | undefined;
/**
 * Converts Ethereum logs to Radius events
 * @param logs Ethereum logs
 * @returns Array of Radius events
 */
export declare function eventsFromEthLogs(logs: Log[]): Event[];
/**
 * Creates a Hash from a hexadecimal string
 * @param hex The hexadecimal string (with or without 0x prefix)
 * @returns A new Hash instance
 * @throws Error if the hex string is invalid
 */
export declare function hashFromHex(hex: string): Hash;
/**
 * Creates a new Radius receipt from an Ethereum receipt
 * @param receipt Ethereum receipt
 * @param from Sender address
 * @param to Recipient address
 * @param value Transaction value
 * @returns Radius receipt
 */
export declare function receiptFromEthReceipt(receipt: TransactionReceipt, from: Address, to?: Address, value?: BigNumberish): Receipt;
/**
 * Creates a zero address (0x0000000000000000000000000000000000000000)
 * Used as a default value or to represent the zero address in the Ethereum ecosystem
 * @returns An Address instance representing the zero address
 */
export declare function zeroAddress(): Address;
//# sourceMappingURL=utils.d.ts.map