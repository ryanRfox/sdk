import type { LocalAccount } from 'viem';
import { type Address, type BytesLike, type Receipt, SignedTransaction, type Transaction } from '../common';
import type { AccountOption } from './options';
import type { AccountClient } from './types';
/**
 * Account represents a Radius account that can be used to sign transactions.
 * This class provides methods for checking balance, retrieving nonce, and
 * signing messages and transactions.
 */
export declare class Account {
    /**
     * The local account used to cryptographically sign messages and transactions
     */
    account?: LocalAccount;
    /**
     * Creates a new Account instance
     * @param account Optional local account to use with this account
     */
    constructor(account?: LocalAccount);
    /**
     * Creates a new Account with the given options
     * @param opts Functional options to configure the account (e.g., withAccount, withPrivateKey)
     * @returns A new Account instance configured with the provided options
     */
    static New(...opts: AccountOption[]): Promise<Account>;
    /**
     * Returns the address of the account
     * @returns The account address, or zero address if no account is available
     */
    address(): Address;
    /**
     * Returns the balance of the account in wei
     * @param client Radius client instance used to query the balance
     * @returns The account balance in wei
     * @throws Error if the balance cannot be retrieved from the network
     */
    balance(client: AccountClient): Promise<bigint>;
    /**
     * Returns the next nonce (transaction count) of the account
     * @param client Radius client instance used to query the nonce
     * @returns The next nonce to use for transactions
     * @throws Error if the nonce cannot be retrieved from the network
     */
    nonce(client: AccountClient): Promise<number>;
    /**
     * Sends native currency to a recipient address
     * @param client Radius client instance used to send the transaction
     * @param recipient Destination address to receive the funds
     * @param value Amount of native currency to send in wei
     * @returns Receipt of the completed transaction
     * @throws Error if no account is available
     * @throws Error if the transaction fails
     */
    send(client: AccountClient, recipient: Address, value: bigint): Promise<Receipt>;
    /**
     * Signs a message using the EIP-191 standard
     * @param message Message bytes to sign
     * @returns The signature bytes
     * @throws Error if no account is available
     * @throws Error if signing fails
     */
    signMessage(message: BytesLike): Promise<Uint8Array>;
    /**
     * Signs a transaction using the EIP-155 standard
     * @param transaction Transaction to sign
     * @param chainId The chain ID for signing the transaction
     * @returns The signed transaction ready to be sent to the network
     * @throws Error if no account is available
     * @throws Error if signing fails
     */
    signTransaction(transaction: Transaction, chainId: number): Promise<SignedTransaction>;
}
//# sourceMappingURL=account.d.ts.map