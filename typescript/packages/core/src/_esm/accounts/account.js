import { Address, SignedTransaction, zeroAddress, } from '../common';
/**
 * Account represents a Radius account that can be used to sign transactions.
 * This class provides methods for checking balance, retrieving nonce, and
 * signing messages and transactions.
 */
export class Account {
    /**
     * Creates a new Account instance
     * @param signer Optional signer to use with this account
     */
    constructor(signer) {
        /**
         * The signer used to cryptographically sign messages and transactions
         */
        Object.defineProperty(this, "signer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.signer = signer;
    }
    /**
     * Creates a new Account with the given options
     * @param opts Functional options to configure the account (e.g., WithSigner)
     * @returns A new Account instance configured with the provided options
     */
    static async New(...opts) {
        const options = {};
        for (const opt of opts) {
            await opt(options);
        }
        return new Account(options.signer);
    }
    /**
     * Returns the address of the account
     * @returns The account address, or zero address if no signer is available
     */
    address() {
        return this.signer ? new Address(this.signer.address) : zeroAddress();
    }
    /**
     * Returns the balance of the account in wei
     * @param client Radius client instance used to query the balance
     * @returns The account balance in wei
     * @throws Error if the balance cannot be retrieved from the network
     */
    async balance(client) {
        return client.balanceAt(this.address());
    }
    /**
     * Returns the next nonce (transaction count) of the account
     * @param client Radius client instance used to query the nonce
     * @returns The next nonce to use for transactions
     * @throws Error if the nonce cannot be retrieved from the network
     */
    async nonce(client) {
        return client.pendingNonceAt(this.address());
    }
    /**
     * Sends native currency to a recipient address
     * @param client Radius client instance used to send the transaction
     * @param recipient Destination address to receive the funds
     * @param value Amount of native currency to send in wei
     * @returns Receipt of the completed transaction
     * @throws Error if no signer is available
     * @throws Error if the transaction fails
     */
    async send(client, recipient, value) {
        if (!this.signer) {
            throw new Error('Signer is required for sending transactions');
        }
        return client.send(this.signer, recipient, value);
    }
    /**
     * Signs a message using the EIP-191 standard
     * @param message Message bytes to sign
     * @returns The signature bytes
     * @throws Error if no signer is available
     * @throws Error if signing fails
     */
    async signMessage(message) {
        if (!this.signer) {
            throw new Error('Signer is required for signing messages');
        }
        // Convert message to the format expected by viem signer
        const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
        const signature = await this.signer.signMessage(messageStr);
        // Convert hex signature to Uint8Array
        const hexStr = signature.startsWith('0x') ? signature.slice(2) : signature;
        const bytes = new Uint8Array(hexStr.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }
    /**
     * Signs a transaction using the EIP-155 standard
     * @param transaction Transaction to sign
     * @returns The signed transaction ready to be sent to the network
     * @throws Error if no signer is available
     * @throws Error if signing fails
     */
    async signTransaction(transaction) {
        if (!this.signer) {
            throw new Error('Signer is required for sending transactions');
        }
        // Helper to convert BigNumberish to bigint
        const toBigInt = (value) => {
            if (value === undefined)
                return undefined;
            return typeof value === 'bigint' ? value : BigInt(value);
        };
        // Convert to viem transaction format
        const signedTx = await this.signer.signTransaction({
            to: transaction.to?.hex(),
            value: toBigInt(transaction.value) ?? 0n,
            data: transaction.data,
            nonce: transaction.nonce,
            gas: toBigInt(transaction.gas),
            gasPrice: toBigInt(transaction.gasPrice) ?? 0n,
            chainId: this.signer.chainId,
        });
        return new SignedTransaction(signedTx);
    }
}
//# sourceMappingURL=account.js.map