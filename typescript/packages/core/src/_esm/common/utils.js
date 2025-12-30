import { hexToBytes } from 'viem';
import { ABI } from './abi';
import { Address } from './address';
import { Event } from './event';
import { Hash } from './hash';
import { Receipt } from './receipt';
/**
 * Creates a new ABI (Application Binary Interface) from a JSON string
 * @param json ABI definition in JSON string format
 * @returns A new ABI instance, or undefined if the JSON is invalid
 */
export function abiFromJSON(json) {
    try {
        return new ABI(json);
    }
    catch {
        return undefined;
    }
}
/**
 * Creates an Address from a hex string
 * @param hex Hex string with or without 0x prefix
 * @returns Address instance
 * @throws Error if the hex string is invalid
 */
export function addressFromHex(hex) {
    const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
    return new Address(hexToBytes(cleanHex));
}
/**
 * Converts a hex string to a byte array
 * @param s Hex string (with or without 0x prefix)
 * @returns Byte array representation of the hex string, or undefined if the string is not valid hex
 */
export function bytecodeFromHex(s) {
    try {
        const cleanHex = s.startsWith('0x') ? s.slice(2) : s;
        return hexToBytes(`0x${cleanHex}`);
    }
    catch {
        return undefined;
    }
}
/**
 * Converts a Radius Address to an Ethereum Address
 * @param address Radius Address
 * @returns Ethereum Address, or undefined if the input is undefined
 */
export function ethAddressFromRadiusAddress(address) {
    if (!address) {
        return undefined;
    }
    return address.ethAddress();
}
/**
 * Converts Ethereum logs to Radius events
 * @param logs Ethereum logs
 * @returns Array of Radius events
 */
// biome-ignore lint/suspicious/noExplicitAny: Viem does not export a single Log type that works for all cases
export function eventsFromEthLogs(logs) {
    return logs.map((log) => new Event(log.topics[0], {}, log.data));
}
/**
 * Creates a Hash from a hexadecimal string
 * @param hex The hexadecimal string (with or without 0x prefix)
 * @returns A new Hash instance
 * @throws Error if the hex string is invalid
 */
export function hashFromHex(hex) {
    const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
    return new Hash(hexToBytes(cleanHex));
}
/**
 * Creates a new Radius receipt from an Ethereum receipt
 * @param receipt Ethereum receipt
 * @param from Sender address
 * @param to Recipient address
 * @param value Transaction value
 * @returns Radius receipt
 */
export function receiptFromEthReceipt(
// biome-ignore lint/suspicious/noExplicitAny: Viem receipt types vary by context
receipt, from, to = new Address(zeroAddress()), value) {
    return new Receipt(from, to, new Address(receipt.contractAddress ?? zeroAddress()), new Hash(receipt.transactionHash ?? receipt.hash), receipt.gasUsed, receipt.status === 'success' ? 1 : receipt.status ?? 0, eventsFromEthLogs(receipt.logs ?? []), value);
}
/**
 * Creates a zero address (0x0000000000000000000000000000000000000000)
 * Used as a default value or to represent the zero address in the Ethereum ecosystem
 * @returns An Address instance representing the zero address
 */
export function zeroAddress() {
    return new Address('0x0000000000000000000000000000000000000000');
}
//# sourceMappingURL=utils.js.map