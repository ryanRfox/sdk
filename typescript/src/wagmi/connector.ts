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

import { type Address, type Chain, createClient, type EIP1193Provider, getAddress } from 'viem';
import { generatePrivateKey, type LocalAccount, privateKeyToAccount } from 'viem/accounts';
import { ChainNotConfiguredError, type CreateConnectorFn, createConnector } from 'wagmi';

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
export function privateKeyConnector(options: PrivateKeyConnectorOptions = {}): CreateConnectorFn {
	let account: LocalAccount | undefined;
	let currentChainId: number | undefined;

	type Provider = Pick<EIP1193Provider, 'request'>;
	type StorageItem = {
		'radius.activeAddress': Address;
		'radius.lastActiveAddress': Address;
		[key: `radius.${string}.privateKey`]: `0x${string}`;
	};

	return createConnector<Provider, Record<string, unknown>, StorageItem>((config) => ({
		id: 'radius-private-key',
		name: 'Radius Private Key',
		type: 'radius-private-key',

		async setup() {
			const address = await config.storage?.getItem('radius.activeAddress');
			if (address) {
				const privateKey = await config.storage?.getItem(`radius.${address}.privateKey`);
				if (privateKey) {
					account = privateKeyToAccount(privateKey as `0x${string}`);
				} else if (
					options.account &&
					getAddress(address as Address) === getAddress(options.account.address)
				) {
					account = options.account;
				}
			}
		},

		async connect(parameters = {}) {
			const { chainId: requestedChainId, isReconnecting } = parameters as {
				chainId?: number;
				isReconnecting?: boolean;
			};

			const connectedAddress = await (async (): Promise<Address> => {
				// If reconnecting, try to load from storage
				if (isReconnecting) {
					const storedAddress = await config.storage?.getItem('radius.lastActiveAddress');
					if (storedAddress) {
						const privateKey = await config.storage?.getItem(`radius.${storedAddress}.privateKey`);
						if (privateKey) {
							account = privateKeyToAccount(privateKey as `0x${string}`);
							await config.storage?.setItem('radius.activeAddress', account.address as Address);
							return account.address;
						}
					}
				}

				// If account provided in options, use it
				if (options.account) {
					account = options.account;
					await config.storage?.setItem('radius.lastActiveAddress', account.address as Address);
					await config.storage?.setItem('radius.activeAddress', account.address as Address);
					return account.address;
				}

				// Generate new account for development
				if (options.generateOnConnect) {
					const privateKey = generatePrivateKey();
					account = privateKeyToAccount(privateKey);
					await config.storage?.setItem(
						`radius.${account.address}.privateKey` as `radius.${string}.privateKey`,
						privateKey,
					);
					await config.storage?.setItem('radius.activeAddress', account.address as Address);
					await config.storage?.setItem('radius.lastActiveAddress', account.address as Address);
					return account.address;
				}

				throw new Error('No account available. Provide an account or enable generateOnConnect.');
			})();

			const chainId = requestedChainId ?? config.chains[0]?.id;
			if (!chainId) throw new ChainNotConfiguredError();

			// Store the current chain ID
			currentChainId = chainId;

			return {
				accounts: [getAddress(connectedAddress)],
				chainId,
			} as never;
		},

		async disconnect() {
			await config.storage?.removeItem('radius.activeAddress');
			account = undefined;
		},

		async getAccounts() {
			if (!account) return [];
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
			} catch {
				return false;
			}
		},

		async switchChain({ chainId }: { chainId: number }) {
			const chain = config.chains.find((c: Chain) => c.id === chainId);
			if (!chain) throw new ChainNotConfiguredError();
			// Update tracked chain ID
			currentChainId = chainId;
			config.emitter.emit('change', { chainId });
			return chain;
		},

		onAccountsChanged(accounts: string[]) {
			if (accounts.length === 0) {
				this.onDisconnect();
			} else {
				config.emitter.emit('change', {
					accounts: accounts.map((x) => getAddress(x as Address)),
				});
			}
		},

		onChainChanged(chain: string) {
			const chainId = Number(chain);
			config.emitter.emit('change', { chainId });
		},

		async onDisconnect() {
			config.emitter.emit('disconnect');
			account = undefined;
		},

		async getProvider({ chainId }: { chainId?: number } = {}) {
			const chain = config.chains.find((c: Chain) => c.id === chainId) ?? config.chains[0];
			if (!chain) throw new ChainNotConfiguredError();

			const transports = config.transports;
			if (!transports) throw new ChainNotConfiguredError();

			const transport = transports[chain.id];
			if (!transport) throw new ChainNotConfiguredError();

			if (!account) throw new Error('Account not found.');

			const client = createClient({
				account,
				chain,
				transport,
			});

			return { request: client.request };
		},
	}));
}

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
