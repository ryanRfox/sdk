/**
 * The auth package provides utilities for creating signing accounts.
 * Uses viem's LocalAccount for all signing operations.
 *
 * @example
 * ```typescript
 * import { createPrivateKeySigner } from '@radiustechsystems/sdk';
 *
 * const account = createPrivateKeySigner('0x...');
 * console.log(account.address);
 * ```
 */
// Export the factory function
export { createPrivateKeySigner } from './privatekey/signer';
//# sourceMappingURL=index.js.map