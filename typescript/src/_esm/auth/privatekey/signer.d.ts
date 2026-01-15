/**
 * Create a local account from a private key for signing transactions.
 *
 * @param privateKey - The private key as a hex string (must include 0x prefix)
 * @returns A viem LocalAccount that can sign transactions
 *
 * @example
 * ```typescript
 * import { createPrivateKeySigner } from '@radiustechsystems/sdk';
 *
 * const account = createPrivateKeySigner('0x...');
 * console.log(account.address);
 * ```
 */
import type { Hex, LocalAccount } from 'viem';
export declare function createPrivateKeySigner(privateKey: Hex): LocalAccount;
//# sourceMappingURL=signer.d.ts.map