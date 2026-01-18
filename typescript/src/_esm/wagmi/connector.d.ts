/**
 * Radius wagmi connector
 *
 * Provides a development-only wagmi connector for Radius chain.
 *
 * @experimental DEVELOPMENT USE ONLY - NOT FOR PRODUCTION
 *
 * For production dApps, use standard wagmi connectors (MetaMask, WalletConnect)
 * with Radius chain configuration from `@radiustechsystems/sdk/chains`.
 */
import { type LocalAccount } from 'viem/accounts';
import { type CreateConnectorFn } from 'wagmi';
/**
 * Development-only connector for EOA with private key.
 *
 * @experimental This connector is for development and testing ONLY.
 *
 * **DO NOT USE IN PRODUCTION** - This connector has critical limitations:
 *
 * 1. **Security risk**: Stores private keys in browser storage
 * 2. **No wallet support**: Cannot connect to MetaMask, WalletConnect, etc.
 * 3. **Limited functionality**: Designed for development/testing scenarios only
 *
 * For production dApps, use standard wagmi connectors (MetaMask, WalletConnect, etc.)
 * with Radius chain configuration.
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