/**
 * Radius wallet actions decorator.
 *
 * Extends viem wallet clients with Radius-specific functionality.
 * Follows viem's decorator pattern (see: viem/src/zksync/decorators/walletL2.ts)
 */
import type { Account, Chain, Client, Transport } from 'viem';
import { type SendTransactionBatchParameters, type SendTransactionBatchReturnType } from '../actions/sendTransactionBatch.js';
/**
 * Radius-specific wallet actions added by the radiusWalletActions decorator.
 */
export type RadiusWalletActions<_chain extends Chain | undefined = Chain | undefined, _account extends Account | undefined = Account | undefined> = {
    /**
     * Send multiple transactions in a single JSON-RPC batch request.
     * Transactions are automatically assigned sequential nonces and sent atomically.
     *
     * @remarks
     * Radius does not queue future-nonce transactions like Ethereum.
     * This method ensures all transactions arrive in nonce order by using JSON-RPC batching.
     *
     * @param params - The batch transaction parameters
     * @returns Array of transaction hashes in the same order as input
     *
     * @example
     * ```typescript
     * const hashes = await client.sendTransactionBatch({
     *   transactions: [
     *     { to: '0x...', value: 1000000000000000000n },
     *     { to: '0x...', data: '0x...' },
     *   ],
     * });
     * ```
     */
    sendTransactionBatch: (params: SendTransactionBatchParameters) => Promise<SendTransactionBatchReturnType>;
};
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
export declare function radiusWalletActions(): <transport extends Transport, chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined>(client: Client<transport, chain, account>) => RadiusWalletActions<chain, account>;
//# sourceMappingURL=radius.d.ts.map