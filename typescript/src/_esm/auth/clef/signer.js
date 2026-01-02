/**
 * Implementation of the RadiusSigner interface using the Clef external signing tool.
 * This module provides a way to sign transactions and messages with Clef,
 * which manages keys securely outside the application.
 */
import { hashMessage } from 'viem';
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
 * import { ClefSigner, createClefSigner } from '@radiustechsystems/sdk';
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
export class ClefSigner {
    /**
     * The address associated with this signer.
     */
    address;
    /**
     * The chain ID used for EIP-155 transaction signing.
     */
    chainId;
    /**
     * The URL of the Clef JSON-RPC server.
     * @private
     */
    clefUrl;
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
    constructor(address, chainId, clefUrl) {
        this.address = address;
        this.chainId = chainId;
        this.clefUrl = clefUrl;
    }
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
    async signMessage(message) {
        // Compute the EIP-191 message hash
        const messageHash = hashMessage(message);
        try {
            // Use account_signData with the message hash
            // Clef expects: account_signData(contentType, address, data)
            const result = await this.rpcCall('account_signData', [
                'application/x-clique-header', // Use a content type Clef recognizes for raw data
                this.address,
                messageHash,
            ]);
            return this.normalizeHex(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Clef message signing failed: ${errorMessage}`);
        }
    }
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
    async signTransaction(tx) {
        // Prepare transaction data for Clef
        const clefTx = {
            from: this.address,
            chainId: this.toHex(this.chainId),
        };
        // Add transaction properties
        if (tx.to) {
            clefTx.to = tx.to;
        }
        if (tx.data) {
            clefTx.data = tx.data;
        }
        if (tx.value !== undefined && tx.value !== null) {
            clefTx.value = this.toHex(tx.value);
        }
        if (tx.gas !== undefined && tx.gas !== null) {
            clefTx.gas = this.toHex(tx.gas);
        }
        if (tx.gasPrice !== undefined && tx.gasPrice !== null) {
            clefTx.gasPrice = this.toHex(tx.gasPrice);
        }
        if (tx.nonce !== undefined && tx.nonce !== null) {
            clefTx.nonce = this.toHex(tx.nonce);
        }
        // Handle EIP-1559 transactions
        if (tx.maxFeePerGas !== undefined && tx.maxFeePerGas !== null) {
            clefTx.maxFeePerGas = this.toHex(tx.maxFeePerGas);
        }
        if (tx.maxPriorityFeePerGas !== undefined && tx.maxPriorityFeePerGas !== null) {
            clefTx.maxPriorityFeePerGas = this.toHex(tx.maxPriorityFeePerGas);
        }
        try {
            // Call Clef to sign the transaction
            const result = await this.rpcCall('account_signTransaction', [
                clefTx,
            ]);
            // Return the raw signed transaction
            return this.normalizeHex(result.raw);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Clef transaction signing failed: ${errorMessage}`);
        }
    }
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
    async verifyConnection() {
        try {
            // Check Clef version
            const version = await this.rpcCall('account_version', []);
            if (!version) {
                throw new Error('Failed to get Clef version');
            }
            // List accounts to verify our address is available
            const accounts = await this.rpcCall('account_list', []);
            const normalizedAddress = this.address.toLowerCase();
            const addressFound = accounts.some((account) => account.toLowerCase() === normalizedAddress);
            if (!addressFound) {
                throw new Error(`Address ${this.address} not found in Clef accounts`);
            }
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to verify Clef connection: ${errorMessage}`);
        }
    }
    /**
     * Make a JSON-RPC call to the Clef server.
     *
     * @param method - The RPC method name
     * @param params - The method parameters
     * @returns The RPC result
     * @throws Error if the RPC call fails
     * @private
     */
    async rpcCall(method, params) {
        const response = await fetch(this.clefUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method,
                params,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data.result;
    }
    /**
     * Convert a number or bigint to a hex string.
     *
     * @param value - The value to convert
     * @returns The hex string with 0x prefix
     * @private
     */
    toHex(value) {
        return `0x${value.toString(16)}`;
    }
    /**
     * Normalize a hex string to ensure it has the 0x prefix.
     *
     * @param hex - The hex string to normalize
     * @returns The normalized hex string
     * @private
     */
    normalizeHex(hex) {
        return (hex.startsWith('0x') ? hex : `0x${hex}`);
    }
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
 * import { createClefSigner } from '@radiustechsystems/sdk';
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
export function createClefSigner(address, chainId, clefUrl) {
    return new ClefSigner(address, chainId, clefUrl);
}
//# sourceMappingURL=signer.js.map