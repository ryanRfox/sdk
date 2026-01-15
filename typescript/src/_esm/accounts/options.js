import { createPrivateKeySigner } from '../auth';
/**
 * Create an AccountOption that sets the account address and signer using a private key.
 * The private key will be stored in memory, so for production systems with high security
 * requirements, consider using withAccount instead, along with a hardware security module
 * or key management service.
 *
 * @param key Private key as a hex string
 * @returns An AccountOption function that configures an Account with the provided private key
 */
export function withPrivateKey(key) {
    return async (options) => {
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
export function withAccount(account) {
    return async (options) => {
        options.account = account;
    };
}
//# sourceMappingURL=options.js.map