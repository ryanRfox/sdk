import { SignedTransaction, ZERO_ADDRESS, } from '../common';
/**
 * Account represents a Radius account that can be used to sign transactions.
 * This class provides methods for checking balance, retrieving nonce, and
 * signing messages and transactions.
 */
export class Account {
    /**
     * The local account used to cryptographically sign messages and transactions
     */
    account;
    /**
     * Creates a new Account instance
     * @param account Optional local account to use with this account
     */
    constructor(account) {
        this.account = account;
    }
    /**
     * Creates a new Account with the given options
     * @param opts Functional options to configure the account (e.g., withAccount, withPrivateKey)
     * @returns A new Account instance configured with the provided options
     */
    static async New(...opts) {
        const options = {};
        for (const opt of opts) {
            await opt(options);
        }
        return new Account(options.account);
    }
    /**
     * Returns the address of the account
     * @returns The account address, or zero address if no account is available
     */
    address() {
        return this.account?.address ?? ZERO_ADDRESS;
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
     * @throws Error if no account is available
     * @throws Error if the transaction fails
     */
    async send(client, recipient, value) {
        if (!this.account) {
            throw new Error('Account is required for sending transactions');
        }
        return client.send(this.account, recipient, value);
    }
    /**
     * Signs a message using the EIP-191 standard
     * @param message Message bytes to sign
     * @returns The signature bytes
     * @throws Error if no account is available
     * @throws Error if signing fails
     */
    async signMessage(message) {
        if (!this.account) {
            throw new Error('Account is required for signing messages');
        }
        // Convert message to the format expected by viem LocalAccount
        const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
        const signature = await this.account.signMessage({ message: messageStr });
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
     * @param chainId The chain ID for signing the transaction
     * @returns The signed transaction ready to be sent to the network
     * @throws Error if no account is available
     * @throws Error if signing fails
     */
    async signTransaction(transaction, chainId) {
        if (!this.account) {
            throw new Error('Account is required for signing transactions');
        }
        // Helper to convert BigNumberish to bigint
        const toBigInt = (value) => {
            if (value === undefined)
                return undefined;
            return typeof value === 'bigint' ? value : BigInt(value);
        };
        // Convert to viem transaction format
        // transaction.to is already a viem Address type (`0x${string}`)
        const signedTx = await this.account.signTransaction({
            to: transaction.to,
            value: toBigInt(transaction.value) ?? 0n,
            data: transaction.data,
            nonce: transaction.nonce,
            gas: toBigInt(transaction.gas),
            gasPrice: toBigInt(transaction.gasPrice) ?? 0n,
            chainId,
        });
        return new SignedTransaction(signedTx);
    }
}
//# sourceMappingURL=account.js.map