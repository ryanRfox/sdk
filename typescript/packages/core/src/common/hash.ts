import { type Hex, bytesToHex, hexToBytes } from 'viem';
import type { BytesLike } from './address';

/**
 * Hash represents a 32-byte Keccak-256 hash used for transactions, blocks, and states
 * This class provides methods to access the hash in different formats
 */
export class Hash {
  /**
   * The internal byte representation of the hash
   * @private
   */
  private readonly data: Uint8Array;

  /**
   * Creates a new Hash with the given data
   * @param data The hash data as a BytesLike
   */
  constructor(data: BytesLike) {
    if (data instanceof Uint8Array) {
      this.data = data;
    } else if (typeof data === 'string') {
      const cleanHex = data.startsWith('0x') ? data : `0x${data}`;
      this.data = hexToBytes(cleanHex as Hex);
    } else {
      this.data = hexToBytes(data as Hex);
    }
  }

  /**
   * Returns the bytes of the Hash
   * @returns The byte representation of the hash
   */
  bytes(): Uint8Array {
    return this.data;
  }

  /**
   * Returns the hexadecimal string of the Hash with 0x prefix
   * @returns The hexadecimal string representation of the hash with 0x prefix
   */
  hex(): Hex {
    return bytesToHex(this.data);
  }

  /**
   * Returns the hexadecimal string of the Hash without 0x prefix
   * @returns The hexadecimal string representation of the hash without 0x prefix
   */
  hexWithoutPrefix(): string {
    return this.hex().substring(2);
  }
}
