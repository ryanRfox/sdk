/**
 * The privatekey package provides a RadiusSigner implementation using ECDSA private keys.
 * This is the simplest approach for signing but requires careful key management.
 */
import { privateKeyToAccount } from 'viem/accounts';
/**
 * A RadiusSigner implementation that uses a private key to sign messages and transactions.
 * This is the simplest way to sign messages and transactions, but it requires keeping
 * the private key in memory.
 *
 * For production systems with high security requirements, consider using a hardware
 * security module, key management service, or the ClefSigner.
 *
 * @implements {RadiusSigner}
 *
 * @example
 * ```typescript
 * import { PrivateKeySigner, createPrivateKeySigner } from '@aspect/radius-sdk';
 *
 * // Using the class directly
 * const signer = new PrivateKeySigner('0x...privateKey', 1);
 *
 * // Using the factory function
 * const signer = createPrivateKeySigner('0x...privateKey', 1);
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
export class PrivateKeySigner {
    /**
     * Creates a new PrivateKeySigner instance.
     *
     * @param privateKey - The private key as a hex string (must include 0x prefix)
     * @param chainId - The chain ID used for transaction signing
     * @throws Error if the private key is invalid
     *
     * @example
     * ```typescript
     * const signer = new PrivateKeySigner(
     *   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
     *   1 // mainnet
     * );
     * ```
     */
    constructor(privateKey, chainId) {
        /**
         * The viem PrivateKeyAccount used for signing operations.
         * @private
         */
        Object.defineProperty(this, "account", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * The chain ID used for EIP-155 transaction signing.
         */
        Object.defineProperty(this, "chainId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.account = privateKeyToAccount(privateKey);
        this.chainId = chainId;
    }
    /**
     * Get the account address of the signer.
     * @returns The checksummed Ethereum address
     */
    get address() {
        return this.account.address;
    }
    /**
     * Sign a message using the EIP-191 standard.
     *
     * @param message - The message to sign. Can be a string, hex bytes, or raw bytes.
     * @returns The signature as a hex string
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
        return this.account.signMessage({ message });
    }
    /**
     * Sign a transaction using the EIP-155 standard.
     *
     * The chainId from the signer will be included in the transaction
     * to prevent replay attacks across different chains.
     *
     * @param tx - The transaction to sign
     * @returns The signed transaction as a hex string (RLP encoded)
     *
     * @example
     * ```typescript
     * const signedTx = await signer.signTransaction({
     *   to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
     *   value: 1000000000000000000n, // 1 ETH
     *   nonce: 0,
     *   gasPrice: 20000000000n,
     *   gas: 21000n,
     * });
     * ```
     */
    async signTransaction(tx) {
        return this.account.signTransaction({ ...tx, chainId: this.chainId });
    }
}
/**
 * Factory function to create a PrivateKeySigner instance.
 *
 * @param privateKey - The private key as a hex string (must include 0x prefix)
 * @param chainId - The chain ID used for transaction signing
 * @returns A new PrivateKeySigner instance
 *
 * @example
 * ```typescript
 * import { createPrivateKeySigner } from '@aspect/radius-sdk';
 *
 * const signer = createPrivateKeySigner(
 *   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
 *   1 // mainnet
 * );
 *
 * console.log(signer.address); // '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
 * ```
 */
export function createPrivateKeySigner(privateKey, chainId) {
    return new PrivateKeySigner(privateKey, chainId);
}
//# sourceMappingURL=signer.js.map