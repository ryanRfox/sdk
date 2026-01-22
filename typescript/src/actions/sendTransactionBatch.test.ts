/**
 * Tests for sendTransactionBatch action.
 */

import type { Address, Chain, Hash, Hex } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_GAS } from '../chains/chainConfig.js';
import { BatchTransactionError, RadiusError } from '../errors/index.js';
import { sendTransactionBatch } from './sendTransactionBatch.js';

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

// Create a mock client
function createMockClient(
	overrides: Partial<{
		account: any;
		chain: Chain | undefined;
		request: any;
	}> = {},
) {
	return {
		// Use 'in' check to handle explicit undefined values
		account:
			'account' in overrides
				? overrides.account
				: {
						address: TEST_ADDRESS,
						signTransaction: vi.fn(),
					},
		chain: 'chain' in overrides ? overrides.chain : mockChain,
		request: overrides.request ?? vi.fn(),
	} as any;
}

describe('sendTransactionBatch', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('fetch', mockFetch);
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('validation errors', () => {
		it('should throw when transactions is not an array', async () => {
			const client = createMockClient();

			await expect(
				// @ts-expect-error - intentionally passing wrong type
				sendTransactionBatch(client, { transactions: 'not-an-array' }),
			).rejects.toThrow(RadiusError);

			try {
				// @ts-expect-error - intentionally passing wrong type
				await sendTransactionBatch(client, { transactions: 'not-an-array' });
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('expects an array of transactions');
			}
		});

		it('should throw when transactions array is empty', async () => {
			const client = createMockClient();

			await expect(sendTransactionBatch(client, { transactions: [] })).rejects.toThrow(RadiusError);

			try {
				await sendTransactionBatch(client, { transactions: [] });
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('requires at least one transaction');
			}
		});

		it('should throw when client has no account', async () => {
			const client = createMockClient({ account: undefined });

			await expect(
				sendTransactionBatch(client, { transactions: [{ to: TEST_ADDRESS, value: 1n }] }),
			).rejects.toThrow(RadiusError);

			try {
				await sendTransactionBatch(client, { transactions: [{ to: TEST_ADDRESS, value: 1n }] });
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('requires an account');
			}
		});

		it('should throw when client has no chain', async () => {
			const client = createMockClient({ chain: undefined });

			await expect(
				sendTransactionBatch(client, { transactions: [{ to: TEST_ADDRESS, value: 1n }] }),
			).rejects.toThrow(RadiusError);

			try {
				await sendTransactionBatch(client, { transactions: [{ to: TEST_ADDRESS, value: 1n }] });
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('requires a chain');
			}
		});
	});

	describe('successful batch transactions', () => {
		it('should send multiple transactions with sequential nonces', async () => {
			const mockSignTransaction = vi.fn();
			const capturedNonces: number[] = [];
			mockSignTransaction.mockImplementation(async (tx: any) => {
				capturedNonces.push(tx.nonce);
				return `0xsigned${tx.nonce}` as Hex;
			});

			const mockRequest = vi.fn();
			mockRequest.mockImplementation(async ({ method }: { method: string }) => {
				if (method === 'eth_getTransactionCount') return '0x5'; // nonce 5
				if (method === 'eth_estimateGas') return '0x5208'; // 21000
				throw new Error(`Unexpected method: ${method}`);
			});

			const client = createMockClient({
				account: {
					address: TEST_ADDRESS,
					signTransaction: mockSignTransaction,
				},
				request: mockRequest,
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

			const hashes = await sendTransactionBatch(client, {
				transactions: [
					{ to: TEST_ADDRESS, value: 1n },
					{ to: TEST_ADDRESS, value: 2n },
					{ to: TEST_ADDRESS, value: 3n },
				],
			});

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

		it('should use provided gas instead of estimating', async () => {
			const mockSignTransaction = vi.fn();
			let capturedGas: bigint | undefined;
			mockSignTransaction.mockImplementation(async (tx: any) => {
				capturedGas = tx.gas;
				return '0xsigned' as Hex;
			});

			const mockRequest = vi.fn();
			mockRequest.mockImplementation(async ({ method }: { method: string }) => {
				if (method === 'eth_getTransactionCount') return '0x0';
				throw new Error(`Unexpected method: ${method}`);
			});

			const client = createMockClient({
				account: {
					address: TEST_ADDRESS,
					signTransaction: mockSignTransaction,
				},
				request: mockRequest,
			});

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [{ id: 0, result: '0xhash' as Hash }],
			});

			await sendTransactionBatch(client, {
				transactions: [{ to: TEST_ADDRESS, value: 1n, gas: 50000n }],
			});

			// Should use provided gas
			expect(capturedGas).toBe(50000n);

			// Should not call estimateGas when gas is provided
			const estimateCalls = mockRequest.mock.calls.filter(
				(call: any) => call[0].method === 'eth_estimateGas',
			);
			expect(estimateCalls).toHaveLength(0);
		});

		it('should apply 20% gas margin to estimated gas', async () => {
			const mockSignTransaction = vi.fn();
			let capturedGas: bigint | undefined;
			mockSignTransaction.mockImplementation(async (tx: any) => {
				capturedGas = tx.gas;
				return '0xsigned' as Hex;
			});

			const mockRequest = vi.fn();
			mockRequest.mockImplementation(async ({ method }: { method: string }) => {
				if (method === 'eth_getTransactionCount') return '0x0';
				if (method === 'eth_estimateGas') return '0x186a0'; // 100000
				throw new Error(`Unexpected method: ${method}`);
			});

			const client = createMockClient({
				account: {
					address: TEST_ADDRESS,
					signTransaction: mockSignTransaction,
				},
				request: mockRequest,
			});

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [{ id: 0, result: '0xhash' as Hash }],
			});

			await sendTransactionBatch(client, {
				transactions: [{ to: TEST_ADDRESS, value: 1n }],
			});

			// 100000 + 20% = 120000
			expect(capturedGas).toBe(120000n);
		});

		it('should handle responses in different order than requests', async () => {
			const mockSignTransaction = vi.fn().mockResolvedValue('0xsigned' as Hex);
			const mockRequest = vi.fn();
			mockRequest.mockImplementation(async ({ method }: { method: string }) => {
				if (method === 'eth_getTransactionCount') return '0x0';
				if (method === 'eth_estimateGas') return '0x5208';
				throw new Error(`Unexpected method: ${method}`);
			});

			const client = createMockClient({
				account: {
					address: TEST_ADDRESS,
					signTransaction: mockSignTransaction,
				},
				request: mockRequest,
			});

			// Return responses out of order
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [
					{ id: 2, result: '0xhash3' as Hash },
					{ id: 0, result: '0xhash1' as Hash },
					{ id: 1, result: '0xhash2' as Hash },
				],
			});

			const hashes = await sendTransactionBatch(client, {
				transactions: [
					{ to: TEST_ADDRESS, value: 1n },
					{ to: TEST_ADDRESS, value: 2n },
					{ to: TEST_ADDRESS, value: 3n },
				],
			});

			// Should return hashes in correct order (matching input)
			expect(hashes).toEqual(['0xhash1', '0xhash2', '0xhash3']);
		});
	});

	describe('error handling', () => {
		it('should throw BatchTransactionError when one transaction fails', async () => {
			const mockSignTransaction = vi.fn().mockResolvedValue('0xsigned' as Hex);
			const mockRequest = vi.fn();
			mockRequest.mockImplementation(async ({ method }: { method: string }) => {
				if (method === 'eth_getTransactionCount') return '0x0';
				if (method === 'eth_estimateGas') return '0x5208';
				throw new Error(`Unexpected method: ${method}`);
			});

			const client = createMockClient({
				account: {
					address: TEST_ADDRESS,
					signTransaction: mockSignTransaction,
				},
				request: mockRequest,
			});

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
				sendTransactionBatch(client, {
					transactions: [
						{ to: TEST_ADDRESS, value: 1n },
						{ to: TEST_ADDRESS, value: 2n },
						{ to: TEST_ADDRESS, value: 3n },
					],
				}),
			).rejects.toThrow(BatchTransactionError);

			try {
				await sendTransactionBatch(client, {
					transactions: [
						{ to: TEST_ADDRESS, value: 1n },
						{ to: TEST_ADDRESS, value: 2n },
						{ to: TEST_ADDRESS, value: 3n },
					],
				});
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

		it('should throw RadiusError when HTTP request fails', async () => {
			const mockSignTransaction = vi.fn().mockResolvedValue('0xsigned' as Hex);
			const mockRequest = vi.fn();
			mockRequest.mockImplementation(async ({ method }: { method: string }) => {
				if (method === 'eth_getTransactionCount') return '0x0';
				if (method === 'eth_estimateGas') return '0x5208';
				throw new Error(`Unexpected method: ${method}`);
			});

			const client = createMockClient({
				account: {
					address: TEST_ADDRESS,
					signTransaction: mockSignTransaction,
				},
				request: mockRequest,
			});

			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				text: async () => 'Internal Server Error',
			});

			await expect(
				sendTransactionBatch(client, {
					transactions: [{ to: TEST_ADDRESS, value: 1n }],
				}),
			).rejects.toThrow(RadiusError);

			try {
				await sendTransactionBatch(client, {
					transactions: [{ to: TEST_ADDRESS, value: 1n }],
				});
			} catch (error) {
				expect(error).toBeInstanceOf(RadiusError);
				expect((error as RadiusError).message).toContain('Batch request failed with status 500');
			}
		});
	});
});

describe('MAX_GAS constant', () => {
	it('should be exported and have expected value', () => {
		expect(MAX_GAS).toBe(1319413953330n);
	});
});
