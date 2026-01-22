import { sendTransactionBatch, } from '../actions/sendTransactionBatch.js';
/**
 * Decorator that extends a viem wallet client with Radius-specific actions.
 *
 * @returns A decorator function that adds Radius wallet actions to a client
 *
 * @example
 * ```typescript
 * import { createWalletClient, http } from 'viem';
 * import { privateKeyToAccount } from 'viem/accounts';
 * import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: radiusTestnet,
 *   transport: http(),
 * }).extend(radiusWalletActions());
 *
 * // Standard viem for simple operations
 * const hash = await client.sendTransaction({ to, value });
 *
 * // Radius-specific for batching
 * const hashes = await client.sendTransactionBatch({
 *   transactions: [
 *     { to: addr1, value: 1n },
 *     { to: addr2, value: 2n },
 *   ],
 * });
 * ```
 */
export function radiusWalletActions() {
    return (client) => ({
        sendTransactionBatch: (params) => sendTransactionBatch(client, params),
    });
}
//# sourceMappingURL=radius.js.map