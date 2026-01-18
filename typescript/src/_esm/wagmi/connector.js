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
import { createClient, getAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { ChainNotConfiguredError, createConnector } from 'wagmi';
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
export function privateKeyConnector(options = {}) {
    let account;
    let currentChainId;
    return createConnector((config) => ({
        id: 'radius-private-key',
        name: 'Radius Private Key',
        type: 'radius-private-key',
        async setup() {
            const address = await config.storage?.getItem('radius.activeAddress');
            if (address) {
                const privateKey = await config.storage?.getItem(`radius.${address}.privateKey`);
                if (privateKey) {
                    account = privateKeyToAccount(privateKey);
                }
                else if (options.account &&
                    getAddress(address) === getAddress(options.account.address)) {
                    account = options.account;
                }
            }
        },
        async connect(parameters = {}) {
            const { chainId: requestedChainId, isReconnecting } = parameters;
            const connectedAddress = await (async () => {
                // If reconnecting, try to load from storage
                if (isReconnecting) {
                    const storedAddress = await config.storage?.getItem('radius.lastActiveAddress');
                    if (storedAddress) {
                        const privateKey = await config.storage?.getItem(`radius.${storedAddress}.privateKey`);
                        if (privateKey) {
                            account = privateKeyToAccount(privateKey);
                            await config.storage?.setItem('radius.activeAddress', account.address);
                            return account.address;
                        }
                    }
                }
                // If account provided in options, use it
                if (options.account) {
                    account = options.account;
                    await config.storage?.setItem('radius.lastActiveAddress', account.address);
                    await config.storage?.setItem('radius.activeAddress', account.address);
                    return account.address;
                }
                // Generate new account for development
                if (options.generateOnConnect) {
                    const privateKey = generatePrivateKey();
                    account = privateKeyToAccount(privateKey);
                    await config.storage?.setItem(`radius.${account.address}.privateKey`, privateKey);
                    await config.storage?.setItem('radius.activeAddress', account.address);
                    await config.storage?.setItem('radius.lastActiveAddress', account.address);
                    return account.address;
                }
                throw new Error('No account available. Provide an account or enable generateOnConnect.');
            })();
            const chainId = requestedChainId ?? config.chains[0]?.id;
            if (!chainId)
                throw new ChainNotConfiguredError();
            // Store the current chain ID
            currentChainId = chainId;
            return {
                accounts: [getAddress(connectedAddress)],
                chainId,
            };
        },
        async disconnect() {
            await config.storage?.removeItem('radius.activeAddress');
            account = undefined;
        },
        async getAccounts() {
            if (!account)
                return [];
            return [getAddress(account.address)];
        },
        async getChainId() {
            // Return tracked chain ID, falling back to first configured chain
            return currentChainId ?? config.chains[0]?.id ?? 0;
        },
        async isAuthorized() {
            try {
                const accounts = await this.getAccounts();
                return accounts.length > 0;
            }
            catch {
                return false;
            }
        },
        async switchChain({ chainId }) {
            const chain = config.chains.find((c) => c.id === chainId);
            if (!chain)
                throw new ChainNotConfiguredError();
            // Update tracked chain ID
            currentChainId = chainId;
            config.emitter.emit('change', { chainId });
            return chain;
        },
        onAccountsChanged(accounts) {
            if (accounts.length === 0) {
                this.onDisconnect();
            }
            else {
                config.emitter.emit('change', {
                    accounts: accounts.map((x) => getAddress(x)),
                });
            }
        },
        onChainChanged(chain) {
            const chainId = Number(chain);
            config.emitter.emit('change', { chainId });
        },
        async onDisconnect() {
            config.emitter.emit('disconnect');
            account = undefined;
        },
        async getProvider({ chainId } = {}) {
            const chain = config.chains.find((c) => c.id === chainId) ?? config.chains[0];
            if (!chain)
                throw new ChainNotConfiguredError();
            const transports = config.transports;
            if (!transports)
                throw new ChainNotConfiguredError();
            const transport = transports[chain.id];
            if (!transport)
                throw new ChainNotConfiguredError();
            if (!account)
                throw new Error('Account not found.');
            const client = createClient({
                account,
                chain,
                transport,
            });
            return { request: client.request };
        },
    }));
}
//# sourceMappingURL=connector.js.map