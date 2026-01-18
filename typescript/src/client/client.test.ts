/**
 * Tests for RadiusClient validation and error paths.
 */

import type { Address, Chain, Hex, PublicClient } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import {
	AbiError,
	ContractCallError,
	ContractDeploymentError,
	MissingAbiError,
	RadiusError,
	TransactionRevertedError,
} from '../errors';
import { createRadiusClient, MAX_GAS } from './client';

// Mock chain configuration
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
};

// Test addresses
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890' as Address;

// Mock ABI
const mockErc20Abi = [
	{
		type: 'function',
		name: 'balanceOf',
		stateMutability: 'view',
		inputs: [{ name: 'owner', type: 'address' }],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'transfer',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ type: 'bool' }],
	},
	{
		type: 'constructor',
		inputs: [{ name: 'initialSupply', type: 'uint256' }],
		stateMutability: 'nonpayable',
	},
] as const;

describe('RadiusClient validation errors', () => {
	describe('getBalance', () => {
		it('should throw when passed a string instead of object', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getBalance('0x1234567890123456789012345678901234567890'),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.getBalance('0x1234567890123456789012345678901234567890');
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an object parameter');
				expect((error as RadiusError).metaMessages).toContain(
					'Use client.getBalance({ address }) instead of client.getBalance(address)',
				);
			}
		});

		it('should throw when passed null', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getBalance(null),
			).rejects.toThrow(RadiusError);
		});

		it('should throw when passed undefined', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getBalance(undefined),
			).rejects.toThrow(RadiusError);
		});

		it('should throw when passed object without address', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getBalance({ blockTag: 'latest' }),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.getBalance({ blockTag: 'latest' });
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an object with an address property');
			}
		});
	});

	describe('getCode', () => {
		it('should throw when passed a string instead of object', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getCode('0x1234567890123456789012345678901234567890'),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.getCode('0x1234567890123456789012345678901234567890');
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an object parameter');
				expect((error as RadiusError).metaMessages).toContain(
					'Use client.getCode({ address }) instead of client.getCode(address)',
				);
			}
		});

		it('should throw when passed object without address', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getCode({}),
			).rejects.toThrow(RadiusError);
		});
	});

	describe('getTransactionCount', () => {
		it('should throw when passed a string instead of object', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getTransactionCount('0x1234567890123456789012345678901234567890'),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.getTransactionCount('0x1234567890123456789012345678901234567890');
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an object parameter');
				expect((error as RadiusError).metaMessages).toContain(
					'Use client.getTransactionCount({ address }) instead of client.getTransactionCount(address)',
				);
			}
		});

		it('should throw when passed object without address', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.getTransactionCount({ blockTag: 'pending' }),
			).rejects.toThrow(RadiusError);
		});
	});

	describe('sendRawTransaction', () => {
		it('should throw when passed a string instead of object', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.sendRawTransaction('0xf86c'),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.sendRawTransaction('0xf86c');
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an object parameter');
				expect((error as RadiusError).metaMessages).toContain(
					'Use client.sendRawTransaction({ serializedTransaction }) instead of client.sendRawTransaction(signedTx)',
				);
			}
		});

		it('should throw when passed object without serializedTransaction', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.sendRawTransaction({}),
			).rejects.toThrow(RadiusError);
		});
	});

	describe('waitForTransactionReceipt', () => {
		it('should throw when passed a string instead of object', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.waitForTransactionReceipt('0x1234'),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.waitForTransactionReceipt('0x1234');
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an object parameter');
				expect((error as RadiusError).metaMessages).toContain(
					'Use client.waitForTransactionReceipt({ hash }) instead of client.waitForTransactionReceipt(hash)',
				);
			}
		});

		it('should throw when passed object without hash', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.waitForTransactionReceipt({}),
			).rejects.toThrow(RadiusError);
		});
	});
});

describe('RadiusClient call/execute errors', () => {
	describe('call method', () => {
		it('should throw MissingAbiError when ABI is missing', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				// @ts-expect-error - intentionally missing abi
				abi: undefined,
				address: TEST_ADDRESS,
			};

			await expect(client.call(contract, 'balanceOf', TEST_ADDRESS)).rejects.toThrow(
				MissingAbiError,
			);

			try {
				await client.call(contract, 'balanceOf', TEST_ADDRESS);
			} catch (error) {
				expect(error).toBeInstanceOf(MissingAbiError);
				expect((error as MissingAbiError).message).toContain('Contract ABI is required');
			}
		});

		it('should throw ContractCallError when address is missing', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				abi: mockErc20Abi,
				// @ts-expect-error - intentionally missing address
				address: undefined,
			};

			await expect(client.call(contract, 'balanceOf', TEST_ADDRESS)).rejects.toThrow(
				ContractCallError,
			);

			try {
				await client.call(contract, 'balanceOf', TEST_ADDRESS);
			} catch (error) {
				expect(error).toBeInstanceOf(ContractCallError);
				expect((error as ContractCallError).message).toContain('Contract address is required');
			}
		});

		it('should throw AbiError when encoding fails', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				abi: mockErc20Abi,
				address: TEST_ADDRESS,
			};

			// Call with invalid arguments
			await expect(
				client.call(contract, 'balanceOf', 'not-an-address'),
			).rejects.toThrow(AbiError);

			try {
				await client.call(contract, 'balanceOf', 'not-an-address');
			} catch (error) {
				expect(error).toBeInstanceOf(AbiError);
				expect((error as AbiError).message).toContain('Failed to encode function call');
			}
		});

		it('should throw AbiError when function name does not exist', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				abi: mockErc20Abi,
				address: TEST_ADDRESS,
			};

			await expect(
				client.call(contract, 'nonExistentFunction', TEST_ADDRESS),
			).rejects.toThrow(AbiError);
		});
	});

	describe('execute method', () => {
		it('should throw MissingAbiError when ABI is missing', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				// @ts-expect-error - intentionally missing abi
				abi: undefined,
				address: TEST_ADDRESS,
			};
			const mockSigner = { address: TEST_ADDRESS } as any;

			await expect(
				client.execute(contract, mockSigner, 'transfer', TEST_ADDRESS, 1000n),
			).rejects.toThrow(MissingAbiError);
		});

		it('should throw ContractCallError when address is missing', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				abi: mockErc20Abi,
				// @ts-expect-error - intentionally missing address
				address: undefined,
			};
			const mockSigner = { address: TEST_ADDRESS } as any;

			await expect(
				client.execute(contract, mockSigner, 'transfer', TEST_ADDRESS, 1000n),
			).rejects.toThrow(ContractCallError);
		});

		it('should throw AbiError when encoding fails', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				abi: mockErc20Abi,
				address: TEST_ADDRESS,
			};
			const mockSigner = { address: TEST_ADDRESS } as any;

			// Call with invalid arguments (string instead of bigint for amount)
			await expect(
				client.execute(contract, mockSigner, 'transfer', 'not-an-address', 'not-a-bigint'),
			).rejects.toThrow(AbiError);
		});
	});
});

describe('RadiusClient createRadiusClient', () => {
	it('should throw RadiusError when chain has no RPC URL configured', () => {
		const chainWithoutRpc: Chain = {
			id: 999,
			name: 'No RPC Chain',
			nativeCurrency: {
				name: 'ETH',
				symbol: 'ETH',
				decimals: 18,
			},
			rpcUrls: {
				default: {
					http: [],
				},
			},
		};

		expect(() => createRadiusClient({ chain: chainWithoutRpc })).toThrow(RadiusError);

		try {
			createRadiusClient({ chain: chainWithoutRpc });
		} catch (error) {
			expect(error).toBeInstanceOf(RadiusError);
			expect((error as RadiusError).message).toContain('Missing RPC URL configuration');
		}
	});

	it('should export MAX_GAS constant', () => {
		expect(MAX_GAS).toBe(1319413953330n);
	});

	it('should create client with custom transport', () => {
		const mockTransport = vi.fn().mockReturnValue({
			request: vi.fn(),
		}) as any;

		const client = createRadiusClient({
			chain: mockChain,
			transport: mockTransport,
		});

		expect(client.publicClient).toBeDefined();
	});

	it('should create client with logger', () => {
		const mockLogger = vi.fn();

		const client = createRadiusClient({
			chain: mockChain,
			logger: mockLogger,
		});

		expect(client.publicClient).toBeDefined();
	});

	it('should create client with interceptor', () => {
		const mockInterceptor = vi.fn().mockImplementation(async (_req, response) => response);

		const client = createRadiusClient({
			chain: mockChain,
			interceptor: mockInterceptor,
		});

		expect(client.publicClient).toBeDefined();
	});
});

describe('RadiusClient extend method', () => {
	it('should extend client with custom methods', () => {
		const client = createRadiusClient({ chain: mockChain });

		const extendedClient = client.extend((base) => ({
			customMethod: () => 'custom',
			async getDoubleBalance(address: Address) {
				// Just return 0 for testing - real impl would call base.getBalance
				return 0n;
			},
		}));

		expect(extendedClient.customMethod()).toBe('custom');
		expect(typeof extendedClient.getDoubleBalance).toBe('function');
		// Original methods should still exist
		expect(typeof extendedClient.getBalance).toBe('function');
	});
});
