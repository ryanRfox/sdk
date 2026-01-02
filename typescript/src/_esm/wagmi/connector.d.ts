/**
 * Radius wagmi connector
 *
 * Provides custom wagmi connectors for Radius chain authentication.
 * Based on Tempo SDK patterns.
 */
import { type LocalAccount } from 'viem/accounts';
import { type CreateConnectorFn } from 'wagmi';
/**
 * Development-only connector for EOA with private key.
 *
 * WARNING: NOT RECOMMENDED FOR PRODUCTION USAGE.
 * This connector stores private keys in browser storage.
 * Use only for development and testing.
 *
 * @example
 * ```typescript
 * import { createConfig, http } from 'wagmi';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';
 *
 * const config = createConfig({
 *   chains: [radiusTestnet],
 *   connectors: [privateKeyConnector()],
 *   transports: {
 *     [radiusTestnet.id]: http(),
 *   },
 * });
 * ```
 */
export declare function privateKeyConnector(options?: PrivateKeyConnectorOptions): CreateConnectorFn;
export interface PrivateKeyConnectorOptions {
    /**
     * Pre-configured account to use
     */
    account?: LocalAccount;
    /**
     * Generate a new account on connect if none exists
     * WARNING: Only use for development
     */
    generateOnConnect?: boolean;
}
//# sourceMappingURL=connector.d.ts.map