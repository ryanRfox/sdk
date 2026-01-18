/**
 * Tests for RadiusClient validation and error paths.
 */

import type { Address, Chain, Hash, Hex, PublicClient } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	AbiError,
	BatchTransactionError,
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
				abi: undefined,
				address: TEST_ADDRESS,
			} as any; // intentionally missing abi

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
				address: undefined,
			} as any; // intentionally missing address

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
				abi: undefined,
				address: TEST_ADDRESS,
			} as any; // intentionally missing abi
			const mockSigner = { address: TEST_ADDRESS } as any;

			await expect(
				client.execute(contract, mockSigner, 'transfer', TEST_ADDRESS, 1000n),
			).rejects.toThrow(MissingAbiError);
		});

		it('should throw ContractCallError when address is missing', async () => {
			const client = createRadiusClient({ chain: mockChain });
			const contract = {
				abi: mockErc20Abi,
				address: undefined,
			} as any; // intentionally missing address
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

describe('RadiusClient sendTransactionBatch', () => {
	const mockSigner = {
		address: TEST_ADDRESS,
		signTransaction: vi.fn(),
	} as any;

	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('fetch', mockFetch);
		mockSigner.signTransaction.mockReset();
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('validation errors', () => {
		it('should throw when transactions is not an array', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				client.sendTransactionBatch(mockSigner, 'not-an-array'),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await client.sendTransactionBatch(mockSigner, 'not-an-array');
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an array of transactions');
			}
		});

		it('should throw when transactions array is empty', async () => {
			const client = createRadiusClient({ chain: mockChain });

			await expect(client.sendTransactionBatch(mockSigner, [])).rejects.toThrow(RadiusError);

			try {
				await client.sendTransactionBatch(mockSigner, []);
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('requires at least one transaction');
			}
		});
	});

	describe('successful batch transactions', () => {
		it('should send multiple transactions with sequential nonces', async () => {
			const client = createRadiusClient({ chain: mockChain });

			// Mock publicClient methods
			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(5);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(21000n);

			// Mock signing - capture nonces
			const capturedNonces: number[] = [];
			mockSigner.signTransaction.mockImplementation(async (tx: any) => {
				capturedNonces.push(tx.nonce);
				return `0xsigned${tx.nonce}` as Hex;
			});

			// Mock fetch response
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [
					{ id: 0, result: '0xhash1' as Hash },
					{ id: 1, result: '0xhash2' as Hash },
					{ id: 2, result: '0xhash3' as Hash },
				],
			});

			const hashes = await client.sendTransactionBatch(mockSigner, [
				{ to: TEST_ADDRESS, value: 1n },
				{ to: TEST_ADDRESS, value: 2n },
				{ to: TEST_ADDRESS, value: 3n },
			]);

			// Verify sequential nonces starting from pending nonce
			expect(capturedNonces).toEqual([5, 6, 7]);

			// Verify returns all hashes
			expect(hashes).toEqual(['0xhash1', '0xhash2', '0xhash3']);

			// Verify single fetch call (batch request)
			expect(mockFetch).toHaveBeenCalledTimes(1);

			// Verify the batch request format
			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe('https://rpc.testnet.radiustech.xyz');
			expect(options.method).toBe('POST');
			expect(options.headers['Content-Type']).toBe('application/json');

			const body = JSON.parse(options.body);
			expect(body).toHaveLength(3);
			expect(body[0].method).toBe('eth_sendRawTransaction');
			expect(body[0].id).toBe(0);
			expect(body[1].id).toBe(1);
			expect(body[2].id).toBe(2);
		});

		it('should handle single transaction', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(10);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(21000n);

			mockSigner.signTransaction.mockResolvedValue('0xsigned' as Hex);

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [{ id: 0, result: '0xhash' as Hash }],
			});

			const hashes = await client.sendTransactionBatch(mockSigner, [
				{ to: TEST_ADDRESS, value: 1n },
			]);

			expect(hashes).toEqual(['0xhash']);
			expect(mockSigner.signTransaction).toHaveBeenCalledTimes(1);
		});

		it('should use provided gas instead of estimating', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(0);
			mockPublicClient.estimateGas = vi.fn();

			let capturedGas: bigint | undefined;
			mockSigner.signTransaction.mockImplementation(async (tx: any) => {
				capturedGas = tx.gas;
				return '0xsigned' as Hex;
			});

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [{ id: 0, result: '0xhash' as Hash }],
			});

			await client.sendTransactionBatch(mockSigner, [
				{ to: TEST_ADDRESS, value: 1n, gas: 50000n },
			]);

			// Should use provided gas
			expect(capturedGas).toBe(50000n);

			// Should not call estimateGas when gas is provided
			expect(mockPublicClient.estimateGas).not.toHaveBeenCalled();
		});

		it('should apply 20% gas margin to estimated gas', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(0);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(100000n);

			let capturedGas: bigint | undefined;
			mockSigner.signTransaction.mockImplementation(async (tx: any) => {
				capturedGas = tx.gas;
				return '0xsigned' as Hex;
			});

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [{ id: 0, result: '0xhash' as Hash }],
			});

			await client.sendTransactionBatch(mockSigner, [{ to: TEST_ADDRESS, value: 1n }]);

			// 100000 + 20% = 120000
			expect(capturedGas).toBe(120000n);
		});

		it('should handle responses in different order than requests', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(0);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(21000n);

			mockSigner.signTransaction.mockResolvedValue('0xsigned' as Hex);

			// Return responses out of order
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [
					{ id: 2, result: '0xhash3' as Hash },
					{ id: 0, result: '0xhash1' as Hash },
					{ id: 1, result: '0xhash2' as Hash },
				],
			});

			const hashes = await client.sendTransactionBatch(mockSigner, [
				{ to: TEST_ADDRESS, value: 1n },
				{ to: TEST_ADDRESS, value: 2n },
				{ to: TEST_ADDRESS, value: 3n },
			]);

			// Should return hashes in correct order (matching input)
			expect(hashes).toEqual(['0xhash1', '0xhash2', '0xhash3']);
		});
	});

	describe('error handling', () => {
		it('should throw BatchTransactionError when one transaction fails', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(0);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(21000n);

			mockSigner.signTransaction.mockResolvedValue('0xsigned' as Hex);

			// Second transaction fails
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [
					{ id: 0, result: '0xhash1' as Hash },
					{ id: 1, error: { code: -32000, message: 'nonce too high' } },
					{ id: 2, result: '0xhash3' as Hash },
				],
			});

			await expect(
				client.sendTransactionBatch(mockSigner, [
					{ to: TEST_ADDRESS, value: 1n },
					{ to: TEST_ADDRESS, value: 2n },
					{ to: TEST_ADDRESS, value: 3n },
				]),
			).rejects.toThrow(BatchTransactionError);

			try {
				await client.sendTransactionBatch(mockSigner, [
					{ to: TEST_ADDRESS, value: 1n },
					{ to: TEST_ADDRESS, value: 2n },
					{ to: TEST_ADDRESS, value: 3n },
				]);
			} catch (error) {
				expect(error).toBeInstanceOf(BatchTransactionError);
				const batchError = error as BatchTransactionError;
				expect(batchError.message).toContain('1 of 3 transactions failed');
				expect(batchError.results).toHaveLength(3);
				expect(batchError.results[0].hash).toBe('0xhash1');
				expect(batchError.results[1].error).toBe('nonce too high');
				expect(batchError.results[2].hash).toBe('0xhash3');
			}
		});

		it('should include error data in BatchTransactionError if available', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(0);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(21000n);

			mockSigner.signTransaction.mockResolvedValue('0xsigned' as Hex);

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [
					{
						id: 0,
						error: { code: -32000, message: 'execution reverted', data: 'Exec Failed: insufficient balance' },
					},
				],
			});

			try {
				await client.sendTransactionBatch(mockSigner, [{ to: TEST_ADDRESS, value: 1n }]);
			} catch (error) {
				expect(error).toBeInstanceOf(BatchTransactionError);
				const batchError = error as BatchTransactionError;
				// Should prefer error.data over error.message
				expect(batchError.results[0].error).toBe('Exec Failed: insufficient balance');
			}
		});

		it('should throw RadiusError when HTTP request fails', async () => {
			const client = createRadiusClient({ chain: mockChain });

			const mockPublicClient = client.publicClient as any;
			mockPublicClient.getTransactionCount = vi.fn().mockResolvedValue(0);
			mockPublicClient.estimateGas = vi.fn().mockResolvedValue(21000n);

			mockSigner.signTransaction.mockResolvedValue('0xsigned' as Hex);

			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				text: async () => 'Internal Server Error',
			});

			await expect(
				client.sendTransactionBatch(mockSigner, [{ to: TEST_ADDRESS, value: 1n }]),
			).rejects.toThrow(RadiusError);

			try {
				await client.sendTransactionBatch(mockSigner, [{ to: TEST_ADDRESS, value: 1n }]);
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('Batch request failed with status 500');
			}
		});
	});
});
