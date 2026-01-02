import {
	type Address as ViemAddress,
	getAddress,
	type Hex,
	hexToBytes,
	isAddressEqual as viemIsAddressEqual,
} from 'viem';

/**
 * Re-export viem's Address type as the standard address format.
 * This is a template literal type: `0x${string}`
 */
export type { ViemAddress as Address };

/**
 * BytesLike represents data that can be converted to bytes
 */
export type BytesLike = Uint8Array | Hex | string;

/**
 * Converts an address to a byte array.
 *
 * @param address - The address to convert (hex string with 0x prefix)
 * @returns Byte array representation of the 20-byte address
 *
 * @example
 * ```typescript
 * const bytes = addressToBytes('0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1');
 * console.log(bytes.length); // 20
 * ```
 */
export function addressToBytes(address: ViemAddress): Uint8Array {
	return hexToBytes(address);
}

/**
 * Compares two addresses for equality (case-insensitive).
 *
 * @param a - First address to compare
 * @param b - Second address to compare
 * @returns True if addresses are equal, false otherwise
 *
 * @example
 * ```typescript
 * const isEqual = isAddressEqual(
 *   '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1',
 *   '0x742d35cc6634c0532925a3b844bc9e7595f7e9f1'
 * );
 * console.log(isEqual); // true
 * ```
 */
export function isAddressEqual(a: ViemAddress, b: ViemAddress): boolean {
	return viemIsAddressEqual(a, b);
}

/**
 * Converts an address to checksummed format.
 *
 * @param address - The address to checksum
 * @returns Checksummed address string
 *
 * @example
 * ```typescript
 * const checksummed = toChecksumAddress('0x742d35cc6634c0532925a3b844bc9e7595f7e9f1');
 * console.log(checksummed); // '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1'
 * ```
 */
export function toChecksumAddress(address: ViemAddress): ViemAddress {
	return getAddress(address);
}

/**
 * Zero address constant (0x0000000000000000000000000000000000000000)
 */
export const ZERO_ADDRESS: ViemAddress = '0x0000000000000000000000000000000000000000';
