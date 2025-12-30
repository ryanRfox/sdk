import { PrivateKeySigner } from '../auth';
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
export function withPrivateKey(key, chainId) {
  return async (options) => {
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
export function withSigner(signer) {
  return async (options) => {
    options.signer = signer;
  };
}
//# sourceMappingURL=options.js.map
