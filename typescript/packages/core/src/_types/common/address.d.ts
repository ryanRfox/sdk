import { type Hex } from 'viem';
/**
 * BytesLike represents data that can be converted to bytes
 */
export type BytesLike = Uint8Array | Hex | string;
/**
 * Represents a 20-byte Radius account or contract address.
 *
 * This class provides methods to convert between different address representations
 * and compare addresses. It serves as the core data structure for identifying
 * accounts and smart contracts in the Radius system.
 */
export declare class Address {
  /**
   * The address data as a byte array
   * @private
   */
  private readonly data;
  /**
   * Creates a new Address instance from various input formats.
   *
   * @param data Address data as Uint8Array, BytesLike, hex string, or another Address instance
   * @throws Error if the address is not exactly 20 bytes long
   */
  constructor(data: Address | BytesLike | string);
  /**
   * Returns the address as a byte array.
   *
   * @returns Byte array representation of the 20-byte address
   */
  bytes(): Uint8Array;
  /**
   * Converts a Radius Address to an Ethereum address format.
   * This method is used when Ethereum library functionality is needed.
   *
   * @returns Checksummed Ethereum address string
   */
  ethAddress(): string;
  /**
   * Returns the hexadecimal string representation of the address.
   *
   * @returns Hex string representation of the address with 0x prefix
   */
  hex(): Hex;
  /**
   * Compares this address with another address for equality.
   *
   * @param other Address to compare with this address
   * @returns True if addresses are equal (case-insensitive comparison), false otherwise
   */
  equals(other: Address): boolean;
}
//# sourceMappingURL=address.d.ts.map
