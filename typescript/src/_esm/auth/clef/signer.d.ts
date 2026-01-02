/**
 * Implementation of the RadiusSigner interface using the Clef external signing tool.
 * This module provides a way to sign transactions and messages with Clef,
 * which manages keys securely outside the application.
 */
import { type Hex, type SignableMessage, type TransactionSerializable } from 'viem';
import type { RadiusSigner } from '../types';
/**
 * A RadiusSigner implementation that uses the Clef JSON-RPC API.
 *
 * Clef is a secure key management service that can be used to sign transactions
 * without exposing the private key to the application. This is useful for securing
 * private keys in production systems.
 *
 * Clef must be running and accessible to the application in order to use this signer.
 * Learn more about Clef here: https://geth.ethereum.org/docs/tools/clef/introduction
 *
 * @implements {RadiusSigner}
 *
 * @example
 * ```typescript
 * import { ClefSigner, createClefSigner } from '@aspect/radius-sdk';
 *
 * // Using the class directly
 * const signer = new ClefSigner(
 *   '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
 *   1,
 *   'http://localhost:8550'
 * );
 *
 * // Using the factory function
 * const signer = createClefSigner(
 *   '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
 *   1,
 *   'http://localhost:8550'
 * );
 *
 * // Sign a message
 * const signature = await signer.signMessage('Hello, World!');
 *
 * // Sign a transaction
 * const signedTx = await signer.signTransaction({
 *   to: '0x...',
 *   value: 1000000000000000000n,
 *   nonce: 0,
 * });
 * ```
 */
export declare class ClefSigner implements RadiusSigner {
    /**
     * The address associated with this signer.
     */
    readonly address: `0x${string}`;
    /**
     * The chain ID used for EIP-155 transaction signing.
     */
    readonly chainId: number;
    /**
     * The URL of the Clef JSON-RPC server.
     * @private
     */
    private readonly clefUrl;
    /**
     * Create a new ClefSigner instance.
     *
     * @param address - The address to use for signing (must be managed by Clef)
     * @param chainId - The chain ID used for transaction signing
     * @param clefUrl - The URL of the Clef server (e.g. "http://localhost:8550")
     *
     * @example
     * ```typescript
     * const signer = new ClefSigner(
     *   '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
     *   1, // mainnet
     *   'http://localhost:8550'
     * );
     * ```
     */
    constructor(address: `0x${string}`, chainId: number, clefUrl: string);
    /**
     * Sign a message using the EIP-191 standard via Clef.
     *
     * @param message - The message to sign. Can be a string, hex bytes, or raw bytes.
     * @returns The signature as a hex string
     * @throws Error if signing fails or Clef is unavailable
     *
     * @example
     * ```typescript
     * // Sign a string message
     * const sig1 = await signer.signMessage('Hello, World!');
     *
     * // Sign hex data
     * const sig2 = await signer.signMessage({ raw: '0x1234' });
     * ```
     */
    signMessage(message: SignableMessage): Promise<Hex>;
    /**
     * Sign a transaction using the EIP-155 standard via Clef.
     *
     * The chainId from the signer will be included in the transaction
     * to prevent replay attacks across different chains.
     *
     * @param tx - The transaction to sign
     * @returns The signed transaction as a hex string (RLP encoded)
     * @throws Error if signing fails or Clef is unavailable
     *
     * @example
     * ```typescript
     * const signedTx = await signer.signTransaction({
     *   to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
     *   value: 1000000000000000000n, // 1 USD
     *   nonce: 0,
     *   gasPrice: 20000000000n,
     *   gas: 21000n,
     * });
     * ```
     */
    signTransaction(tx: TransactionSerializable): Promise<Hex>;
    /**
     * Verify that the Clef server is accessible and the address is available.
     *
     * @returns A promise that resolves to true if verification succeeds
     * @throws Error if verification fails
     *
     * @example
     * ```typescript
     * const signer = new ClefSigner(address, chainId, clefUrl);
     * await signer.verifyConnection();
     * console.log('Clef connection verified');
     * ```
     */
    verifyConnection(): Promise<boolean>;
    /**
     * Make a JSON-RPC call to the Clef server.
     *
     * @param method - The RPC method name
     * @param params - The method parameters
     * @returns The RPC result
     * @throws Error if the RPC call fails
     * @private
     */
    private rpcCall;
    /**
     * Convert a number or bigint to a hex string.
     *
     * @param value - The value to convert
     * @returns The hex string with 0x prefix
     * @private
     */
    private toHex;
    /**
     * Normalize a hex string to ensure it has the 0x prefix.
     *
     * @param hex - The hex string to normalize
     * @returns The normalized hex string
     * @private
     */
    private normalizeHex;
}
/**
 * Factory function to create a ClefSigner instance.
 *
 * @param address - The address to use for signing (must be managed by Clef)
 * @param chainId - The chain ID used for transaction signing
 * @param clefUrl - The URL of the Clef server (e.g. "http://localhost:8550")
 * @returns A new ClefSigner instance
 *
 * @example
 * ```typescript
 * import { createClefSigner } from '@aspect/radius-sdk';
 *
 * const signer = createClefSigner(
 *   '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
 *   1, // mainnet
 *   'http://localhost:8550'
 * );
 *
 * // Optionally verify the connection
 * await signer.verifyConnection();
 * ```
 */
export declare function createClefSigner(address: `0x${string}`, chainId: number, clefUrl: string): ClefSigner;
//# sourceMappingURL=signer.d.ts.map