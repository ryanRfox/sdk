"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateKeyConnector = privateKeyConnector;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const wagmi_1 = require("wagmi");
function privateKeyConnector(options = {}) {
    let account;
    return (0, wagmi_1.createConnector)((config) => ({
        id: 'radius-private-key',
        name: 'Radius Private Key',
        type: 'radius-private-key',
        async setup() {
            const address = await config.storage?.getItem('radius.activeAddress');
            if (address) {
                const privateKey = await config.storage?.getItem(`radius.${address}.privateKey`);
                if (privateKey) {
                    account = (0, accounts_1.privateKeyToAccount)(privateKey);
                }
                else if (options.account &&
                    (0, viem_1.getAddress)(address) === (0, viem_1.getAddress)(options.account.address)) {
                    account = options.account;
                }
            }
        },
        async connect(parameters = {}) {
            const { chainId: requestedChainId, isReconnecting } = parameters;
            const connectedAddress = await (async () => {
                if (isReconnecting) {
                    const storedAddress = await config.storage?.getItem('radius.lastActiveAddress');
                    if (storedAddress) {
                        const privateKey = await config.storage?.getItem(`radius.${storedAddress}.privateKey`);
                        if (privateKey) {
                            account = (0, accounts_1.privateKeyToAccount)(privateKey);
                            await config.storage?.setItem('radius.activeAddress', account.address);
                            return account.address;
                        }
                    }
                }
                if (options.account) {
                    account = options.account;
                    await config.storage?.setItem('radius.lastActiveAddress', account.address);
                    await config.storage?.setItem('radius.activeAddress', account.address);
                    return account.address;
                }
                if (options.generateOnConnect) {
                    const privateKey = (0, accounts_1.generatePrivateKey)();
                    account = (0, accounts_1.privateKeyToAccount)(privateKey);
                    await config.storage?.setItem(`radius.${account.address}.privateKey`, privateKey);
                    await config.storage?.setItem('radius.activeAddress', account.address);
                    await config.storage?.setItem('radius.lastActiveAddress', account.address);
                    return account.address;
                }
                throw new Error('No account available. Provide an account or enable generateOnConnect.');
            })();
            const chainId = requestedChainId ?? config.chains[0]?.id;
            if (!chainId)
                throw new wagmi_1.ChainNotConfiguredError();
            return {
                accounts: [(0, viem_1.getAddress)(connectedAddress)],
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
            return [(0, viem_1.getAddress)(account.address)];
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
                throw new wagmi_1.ChainNotConfiguredError();
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
                throw new wagmi_1.ChainNotConfiguredError();
            const transports = config.transports;
            if (!transports)
                throw new wagmi_1.ChainNotConfiguredError();
            const transport = transports[chain.id];
            if (!transport)
                throw new wagmi_1.ChainNotConfiguredError();
            if (!account)
                throw new Error('Account not found.');
            const client = (0, viem_1.createClient)({
                account,
                chain,
                transport,
            });
            return { request: client.request };
        },
    }));
}
//# sourceMappingURL=connector.js.map