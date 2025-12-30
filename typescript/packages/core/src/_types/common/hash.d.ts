import { type Hex } from 'viem';
import type { BytesLike } from './address';
/**
 * Hash represents a 32-byte Keccak-256 hash used for transactions, blocks, and states
 * This class provides methods to access the hash in different formats
 */
export declare class Hash {
    /**
     * The internal byte representation of the hash
     * @private
     */
    private readonly data;
    /**
     * Creates a new Hash with the given data
     * @param data The hash data as a BytesLike
     */
    constructor(data: BytesLike);
    /**
     * Returns the bytes of the Hash
     * @returns The byte representation of the hash
     */
    bytes(): Uint8Array;
    /**
     * Returns the hexadecimal string of the Hash with 0x prefix
     * @returns The hexadecimal string representation of the hash with 0x prefix
     */
    hex(): Hex;
    /**
     * Returns the hexadecimal string of the Hash without 0x prefix
     * @returns The hexadecimal string representation of the hash without 0x prefix
     */
    hexWithoutPrefix(): string;
}
//# sourceMappingURL=hash.d.ts.map