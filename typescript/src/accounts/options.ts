import type { Hex } from 'viem';
import { PrivateKeySigner, type RadiusSigner } from '../auth';

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
	 * The signer to use with this account
	 */
	signer?: RadiusSigner;
}

/**
 * Create an AccountOption that sets the account address and signer using a private key.
 * The private key will be stored in memory, so for production systems with high security
 * requirements, consider using withSigner instead, along with a hardware security module
 * or key management service.
 *
 * @param key Private key as a hex string
 * @param chainId The chain ID for signing transactions
 * @returns An AccountOption function that configures an Account with the provided private key
 */
export function withPrivateKey(key: Hex, chainId: number): AccountOption {
	return async (options: AccountOptions) => {
		options.signer = new PrivateKeySigner(key, chainId);
	};
}

/**
 * Create an AccountOption that sets the account address and signer using a custom Signer implementation.
 * This is useful when you want to use a custom signing implementation, such as a hardware
 * security module or key management service.
 *
 * @param signer Signer instance for signing transactions and messages
 * @returns An AccountOption function that configures an Account with the provided signer
 */
export function withSigner(signer: RadiusSigner): AccountOption {
	return async (options: AccountOptions) => {
		options.signer = signer;
	};
}
