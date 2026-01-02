/**
 * Radius wagmi connector
 *
 * Provides custom wagmi connectors for Radius chain authentication.
 * Based on Tempo SDK patterns.
 */
import { createClient, getAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { ChainNotConfiguredError, createConnector } from 'wagmi';
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
export function privateKeyConnector(options = {}) {
    let account;
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
            return config.chains[0]?.id ?? 0;
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
            config.emitter.emit('change', { chainId });
            return chain;
        },
        onAccountsChanged() { },
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