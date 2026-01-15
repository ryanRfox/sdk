import type { Hex, LocalAccount } from 'viem';
import { createPrivateKeySigner } from '../auth';

/**
 * A function that configures a Radius account.
 * This is used as a functional option pattern for creating new accounts.
 */
export type AccountOption = (options: AccountOptions) => Promise<void>;

/**
 * Options for creating an account.
 * Contains configuration values that can be set using functional options.
 */
export interface AccountOptions {
	/**
	 * The local account to use with this account
	 */
	account?: LocalAccount;
}

/**
 * Create an AccountOption that sets the account address and signer using a private key.
 * The private key will be stored in memory, so for production systems with high security
 * requirements, consider using withAccount instead, along with a hardware security module
 * or key management service.
 *
 * @param key Private key as a hex string
 * @returns An AccountOption function that configures an Account with the provided private key
 */
export function withPrivateKey(key: Hex): AccountOption {
	return async (options: AccountOptions) => {
		options.account = createPrivateKeySigner(key);
	};
}

/**
 * Create an AccountOption that sets the account address and signer using a custom LocalAccount.
 * This is useful when you want to use a custom signing implementation, such as a hardware
 * security module or key management service.
 *
 * @param account LocalAccount instance for signing transactions and messages
 * @returns An AccountOption function that configures an Account with the provided account
 */
export function withAccount(account: LocalAccount): AccountOption {
	return async (options: AccountOptions) => {
		options.account = account;
	};
}
