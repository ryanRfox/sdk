/**
 * Unit tests for the Radius wagmi connector
 *
 * Tests the privateKeyConnector function with comprehensive coverage of:
 * - Connector initialization and properties
 * - Setup from storage
 * - Connect with various options
 * - Disconnect functionality
 * - Account management
 * - Chain management
 * - Authorization checks
 * - Provider creation
 */

import type { Address, Chain } from 'viem';
import { getAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it, vi } from 'vitest';
import { ChainNotConfiguredError } from 'wagmi';
import { type PrivateKeyConnectorOptions, privateKeyConnector } from './connector';

// ============================================================================
// Test Types and Helpers
// ============================================================================

interface MockStorage {
	getItem: (key: string) => Promise<string | undefined>;
	setItem: (key: string, value: string) => Promise<void>;
	removeItem: (key: string) => Promise<void>;
}

interface MockEmitter {
	emit: (event: string, data?: unknown) => void;
	on: (event: string, handler: (data?: unknown) => void) => void;
	off: (event: string, handler: (data?: unknown) => void) => void;
}

interface MockConfig {
	chains: Chain[];
	storage: MockStorage;
	transports: Record<number, unknown>;
	emitter: MockEmitter;
}

// ============================================================================
// Test Setup
// ============================================================================

const mockChain: Chain = {
	id: 1223953,
	name: 'Radius Testnet',
	nativeCurrency: {
		name: 'USD',
		symbol: 'USD',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ['https://rpc.testnet.radiustech.xyz'],
		},
	},
} as Chain;

const createMockStorage = (): MockStorage => ({
	getItem: vi.fn().mockResolvedValue(undefined),
	setItem: vi.fn().mockResolvedValue(undefined),
	removeItem: vi.fn().mockResolvedValue(undefined),
});

const createMockEmitter = (): MockEmitter => ({
	emit: vi.fn(),
	on: vi.fn(),
	off: vi.fn(),
});

const createMockConfig = (): MockConfig => {
	const mockTransport = () => ({
		request: vi.fn().mockResolvedValue(null),
		mode: 'http',
	});

	return {
		chains: [mockChain],
		storage: createMockStorage(),
		transports: {
			[mockChain.id]: mockTransport,
		},
		emitter: createMockEmitter(),
	};
};

// ============================================================================
// Tests
// ============================================================================

describe('privateKeyConnector', () => {
	describe('connector properties', () => {
		it('should return a function that creates a connector', () => {
			const connector = privateKeyConnector();
			expect(typeof connector).toBe('function');
		});

		it('should create a connector with id "radius-private-key"', () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			// Call the returned function to get the connector implementation
			const connectorImpl = connectorFn(config as never);
			expect(connectorImpl.id).toBe('radius-private-key');
		});

		it('should have the correct name', () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();
			const connectorImpl = connectorFn(config as never);
			expect(connectorImpl.name).toBe('Radius Private Key');
		});

		it('should have type "radius-private-key"', () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();
			const connectorImpl = connectorFn(config as never);
			expect(connectorImpl.type).toBe('radius-private-key');
		});
	});

	describe('setup', () => {
		it('should load account from storage if activeAddress exists', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();
			const privateKey = generatePrivateKey();
			const account = privateKeyToAccount(privateKey);

			// Setup storage mocks
			const storageMock = config.storage as any;
			storageMock.getItem.mockImplementation((key: string) => {
				if (key === 'radius.activeAddress') {
					return Promise.resolve(account.address as Address);
				}
				if (key === `radius.${account.address}.privateKey`) {
					return Promise.resolve(privateKey);
				}
				return Promise.resolve(undefined);
			});

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.setup?.();

			const accounts = await connectorImpl.getAccounts();
			expect(accounts).toContain(getAddress(account.address));
		});

		it('should use provided account if stored address matches', async () => {
			const _connectorFn = privateKeyConnector();
			const account = privateKeyToAccount(generatePrivateKey());
			const options: PrivateKeyConnectorOptions = { account };
			const config = createMockConfig();

			const storageMock = config.storage as any;
			storageMock.getItem.mockImplementation((key: string) => {
				if (key === 'radius.activeAddress') {
					return Promise.resolve(account.address as Address);
				}
				return Promise.resolve(undefined);
			});

			const connectorFn2 = privateKeyConnector(options);
			const connectorImpl = connectorFn2(config as never);
			await connectorImpl.setup?.();

			const accounts = await connectorImpl.getAccounts();
			expect(accounts).toContain(getAddress(account.address));
		});

		it('should handle missing setup gracefully', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const storageMock = config.storage as any;
			storageMock.getItem.mockResolvedValue(undefined);

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.setup?.();

			const accounts = await connectorImpl.getAccounts();
			expect(accounts).toEqual([]);
		});
	});

	describe('connect', () => {
		it('should connect with provided account', async () => {
			const account = privateKeyToAccount(generatePrivateKey());
			const connectorFn = privateKeyConnector({ account });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const result = await connectorImpl.connect?.();

			expect(result).toBeDefined();
			expect(result?.accounts).toContain(getAddress(account.address));
			expect(result?.chainId).toBe(mockChain.id);
		});

		it('should store account address in storage on connect', async () => {
			const account = privateKeyToAccount(generatePrivateKey());
			const connectorFn = privateKeyConnector({ account });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();

			const storageMock = config.storage as any;
			expect(storageMock.setItem).toHaveBeenCalledWith(
				'radius.activeAddress',
				getAddress(account.address),
			);
			expect(storageMock.setItem).toHaveBeenCalledWith(
				'radius.lastActiveAddress',
				getAddress(account.address),
			);
		});

		it('should generate new account with generateOnConnect option', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const result = await connectorImpl.connect?.();

			expect(result).toBeDefined();
			expect(result?.accounts).toHaveLength(1);
			expect(result?.accounts[0]).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should throw error when no account available', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await expect(connectorImpl.connect?.()).rejects.toThrow(
				'No account available. Provide an account or enable generateOnConnect.',
			);
		});

		it('should use requested chainId if provided', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const result = await connectorImpl.connect?.({ chainId: mockChain.id });

			expect(result?.chainId).toBe(mockChain.id);
		});

		it('should throw ChainNotConfiguredError when no chains configured', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();
			config.chains = [];

			const connectorImpl = connectorFn(config as never);
			await expect(connectorImpl.connect?.()).rejects.toThrow(ChainNotConfiguredError);
		});

		it('should reconnect from storage when isReconnecting is true', async () => {
			const _account = privateKeyToAccount(generatePrivateKey());
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();
			const privateKey = generatePrivateKey();
			const storedAccount = privateKeyToAccount(privateKey);

			const storageMock = config.storage as any;
			storageMock.getItem.mockImplementation((key: string) => {
				if (key === 'radius.lastActiveAddress') {
					return Promise.resolve(storedAccount.address as Address);
				}
				if (key === `radius.${storedAccount.address}.privateKey`) {
					return Promise.resolve(privateKey);
				}
				return Promise.resolve(undefined);
			});

			const connectorImpl = connectorFn(config as never);
			const result = await connectorImpl.connect?.({ isReconnecting: true });

			expect(result).toBeDefined();
			expect(storageMock.setItem).toHaveBeenCalledWith('radius.activeAddress', expect.any(String));
		});
	});

	describe('disconnect', () => {
		it('should clear active address from storage', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			await connectorImpl.disconnect?.();

			const storageMock = config.storage as any;
			expect(storageMock.removeItem).toHaveBeenCalledWith('radius.activeAddress');
		});

		it('should clear account after disconnect', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			await connectorImpl.disconnect?.();

			const accounts = await connectorImpl.getAccounts();
			expect(accounts).toEqual([]);
		});

		it('should be able to reconnect after disconnect', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const account = privateKeyToAccount(generatePrivateKey());
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			await connectorImpl.disconnect?.();

			// Connect again with a new account
			const connectorFn2 = privateKeyConnector({ account });
			const connectorImpl2 = connectorFn2(config as never);
			const result = await connectorImpl2.connect?.();

			expect(result?.accounts).toContain(getAddress(account.address));
		});
	});

	describe('getAccounts', () => {
		it('should return empty array when no account connected', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const accounts = await connectorImpl.getAccounts();

			expect(accounts).toEqual([]);
		});

		it('should return connected account', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			const accounts = await connectorImpl.getAccounts();

			expect(accounts).toHaveLength(1);
			expect(accounts[0]).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should return checksummed address', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			const accounts = await connectorImpl.getAccounts();

			const address = accounts[0];
			expect(address).toBe(getAddress(address)); // getAddress returns checksummed address
		});
	});

	describe('getChainId', () => {
		it('should return first configured chain id', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const chainId = await connectorImpl.getChainId();

			expect(chainId).toBe(mockChain.id);
		});

		it('should return 0 when no chains configured', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();
			config.chains = [];

			const connectorImpl = connectorFn(config as never);
			const chainId = await connectorImpl.getChainId();

			expect(chainId).toBe(0);
		});

		it('should return consistent chain id across calls', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const chainId1 = await connectorImpl.getChainId();
			const chainId2 = await connectorImpl.getChainId();

			expect(chainId1).toBe(chainId2);
		});
	});

	describe('isAuthorized', () => {
		it('should return false when no account connected', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const authorized = await connectorImpl.isAuthorized();

			expect(authorized).toBe(false);
		});

		it('should return true when account is connected', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			const authorized = await connectorImpl.isAuthorized();

			expect(authorized).toBe(true);
		});

		it('should return false after disconnect', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			await connectorImpl.disconnect?.();
			const authorized = await connectorImpl.isAuthorized();

			expect(authorized).toBe(false);
		});

		it('should return false on getAccounts error', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			// Mock getAccounts to throw
			const originalGetAccounts = connectorImpl.getAccounts;
			connectorImpl.getAccounts = vi.fn().mockRejectedValue(new Error('Test error'));

			const authorized = await connectorImpl.isAuthorized();

			expect(authorized).toBe(false);
			connectorImpl.getAccounts = originalGetAccounts;
		});
	});

	describe('switchChain', () => {
		it('should emit change event with new chain id', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.switchChain?.({ chainId: mockChain.id });

			const emitterMock = config.emitter as any;
			expect(emitterMock.emit).toHaveBeenCalledWith('change', { chainId: mockChain.id });
		});

		it('should return the switched chain', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const chain = await connectorImpl.switchChain?.({ chainId: mockChain.id });

			expect(chain).toBeDefined();
			expect(chain?.id).toBe(mockChain.id);
		});

		it('should throw ChainNotConfiguredError for unknown chain', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await expect(connectorImpl.switchChain?.({ chainId: 999999 })).rejects.toThrow(
				ChainNotConfiguredError,
			);
		});

		it('should handle switching to same chain', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			const chain = await connectorImpl.switchChain?.({ chainId: mockChain.id });

			expect(chain?.id).toBe(mockChain.id);
		});
	});

	describe('onChainChanged', () => {
		it('should emit change event with parsed chain id', () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			connectorImpl.onChainChanged('1223953');

			const emitterMock = config.emitter as any;
			expect(emitterMock.emit).toHaveBeenCalledWith('change', { chainId: 1223953 });
		});

		it('should parse string chain id correctly', () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			connectorImpl.onChainChanged('42');

			const emitterMock = config.emitter as any;
			expect(emitterMock.emit).toHaveBeenCalledWith('change', { chainId: 42 });
		});
	});

	describe('onDisconnect', () => {
		it('should emit disconnect event', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			await connectorImpl.onDisconnect?.();

			const emitterMock = config.emitter as any;
			expect(emitterMock.emit).toHaveBeenCalledWith('disconnect');
		});

		it('should clear account on disconnect event', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();
			await connectorImpl.onDisconnect?.();

			const accounts = await connectorImpl.getAccounts();
			expect(accounts).toEqual([]);
		});
	});

	describe('getProvider', () => {
		it('should throw error when account not set', async () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await expect(connectorImpl.getProvider?.({ chainId: mockChain.id })).rejects.toThrow(
				'Account not found.',
			);
		});

		it('should throw ChainNotConfiguredError when no chains configured', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();
			config.chains = [];

			const connectorImpl = connectorFn(config as never);
			await expect(connectorImpl.getProvider?.({ chainId: mockChain.id })).rejects.toThrow(
				ChainNotConfiguredError,
			);
		});

		it('should throw ChainNotConfiguredError when transport not configured', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();
			config.transports = {}; // No transport for the chain

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();

			await expect(connectorImpl.getProvider?.({ chainId: mockChain.id })).rejects.toThrow(
				ChainNotConfiguredError,
			);
		});

		it('should throw ChainNotConfiguredError when transports is undefined', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();
			config.transports = undefined as any;

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();

			await expect(connectorImpl.getProvider?.({ chainId: mockChain.id })).rejects.toThrow(
				ChainNotConfiguredError,
			);
		});

		it('should return provider with request method', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();

			const provider = (await connectorImpl.getProvider?.({ chainId: mockChain.id })) as
				| { request: unknown }
				| undefined;

			expect(provider).toBeDefined();
			expect(provider?.request).toBeDefined();
			expect(typeof provider?.request).toBe('function');
		});

		it('should use first chain when no chainId provided', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			await connectorImpl.connect?.();

			const provider = (await connectorImpl.getProvider?.()) as { request: unknown } | undefined;

			expect(provider).toBeDefined();
			expect(provider?.request).toBeDefined();
		});
	});

	describe('onAccountsChanged', () => {
		it('should be a no-op function', () => {
			const connectorFn = privateKeyConnector();
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);
			// onAccountsChanged expects an array of accounts but is a no-op
			expect(() => connectorImpl.onAccountsChanged?.([])).not.toThrow();
		});
	});

	describe('integration scenarios', () => {
		it('should handle full connection lifecycle', async () => {
			const account = privateKeyToAccount(generatePrivateKey());
			const connectorFn = privateKeyConnector({ account });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);

			// Check initial state
			let accounts = await connectorImpl.getAccounts();
			expect(accounts).toEqual([]);

			// Connect
			const connectResult = await connectorImpl.connect?.();
			expect(connectResult?.accounts).toContain(getAddress(account.address));

			// Check connected state
			accounts = await connectorImpl.getAccounts();
			expect(accounts).toContain(getAddress(account.address));

			// Check authorization
			let authorized = await connectorImpl.isAuthorized();
			expect(authorized).toBe(true);

			// Disconnect
			await connectorImpl.disconnect?.();

			// Check disconnected state
			accounts = await connectorImpl.getAccounts();
			expect(accounts).toEqual([]);

			authorized = await connectorImpl.isAuthorized();
			expect(authorized).toBe(false);
		});

		it('should handle multiple chain setup', async () => {
			const connectorFn = privateKeyConnector({ generateOnConnect: true });
			const chain2 = { ...mockChain, id: 999 } as Chain;
			const config = createMockConfig();
			config.chains.push(chain2);
			const mockTransport = () => ({
				request: vi.fn().mockResolvedValue(null),
				mode: 'http',
			});
			config.transports[chain2.id] = mockTransport;

			const connectorImpl = connectorFn(config as never);

			// Connect to first chain
			const result1 = await connectorImpl.connect?.({ chainId: mockChain.id });
			expect(result1?.chainId).toBe(mockChain.id);

			// Switch to second chain
			await connectorImpl.switchChain?.({ chainId: chain2.id });

			const emitterMock = config.emitter as any;
			expect(emitterMock.emit).toHaveBeenCalledWith('change', { chainId: chain2.id });
		});

		it('should preserve account across setup calls', async () => {
			const account = privateKeyToAccount(generatePrivateKey());
			const connectorFn = privateKeyConnector({ account });
			const config = createMockConfig();

			const connectorImpl = connectorFn(config as never);

			await connectorImpl.setup?.();
			let accounts = await connectorImpl.getAccounts();
			expect(accounts).toEqual([]);

			await connectorImpl.connect?.();
			accounts = await connectorImpl.getAccounts();
			expect(accounts).toContain(getAddress(account.address));
		});
	});
});
