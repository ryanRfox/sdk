/**
 * Integration tests for RadiusClient against the Radius testnet.
 *
 * These tests validate real interactions with the Radius testnet RPC endpoint.
 * They require environment variables to be set:
 * - RADIUS_ENDPOINT: The RPC endpoint URL (defaults to https://rpc.testnet.radiustech.xyz)
 * - RADIUS_PRIVATE_KEY: A private key with testnet funds for transaction tests
 *
 * Tests are skipped when RADIUS_PRIVATE_KEY is not available.
 *
 * @module test/integration/client.integration.test
 */

import {
	createPrivateKeySigner,
	createRadiusClient,
	type RadiusClient,
	type RadiusSigner,
	radiusTestnet,
} from '@radiustechsystems/sdk';
import { defineChain } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Environment configuration for integration tests.
 */
const RADIUS_ENDPOINT = process.env.RADIUS_ENDPOINT || 'https://rpc.testnet.radiustech.xyz';
const RADIUS_PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY as `0x${string}` | undefined;

/**
 * Check if we have the required environment for full integration tests.
 */
const hasPrivateKey = !!RADIUS_PRIVATE_KEY;

/**
 * Create a chain configuration using the environment's RPC endpoint.
 */
function createTestChain() {
	return defineChain({
		...radiusTestnet,
		rpcUrls: {
			default: {
				http: [RADIUS_ENDPOINT],
			},
		},
	});
}

describe('RadiusClient Integration Tests', () => {
	let client: RadiusClient;
	let signer: RadiusSigner | undefined;
	const testChain = createTestChain();

	beforeAll(() => {
		// Create the client for all tests
		client = createRadiusClient({
			chain: testChain,
		});

		// Create signer only if private key is available
		if (hasPrivateKey && RADIUS_PRIVATE_KEY) {
			signer = createPrivateKeySigner(RADIUS_PRIVATE_KEY, testChain.id);
		}
	});

	describe('Read Operations (No Private Key Required)', () => {
		it('should create a client successfully', () => {
			expect(client).toBeDefined();
			expect(client.publicClient).toBeDefined();
		});

		it('should get the chain ID', async () => {
			const chainId = await client.getChainId();

			expect(chainId).toBeDefined();
			expect(typeof chainId).toBe('bigint');
			// Radius testnet chain ID is 1223953
			expect(chainId).toBe(BigInt(testChain.id));
		});

		it('should get the current block number via publicClient', async () => {
			const blockNumber = await client.publicClient.getBlockNumber();

			expect(blockNumber).toBeDefined();
			expect(typeof blockNumber).toBe('bigint');
			expect(blockNumber).toBeGreaterThan(0n);
		});

		it('should get a block by number via publicClient', async () => {
			const blockNumber = await client.publicClient.getBlockNumber();
			const block = await client.publicClient.getBlock({ blockNumber });

			expect(block).toBeDefined();
			expect(block.number).toBe(blockNumber);
			expect(block.hash).toBeDefined();
			expect(typeof block.hash).toBe('string');
			expect(block.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
		});

		it('should get balance of a known address', async () => {
			// Use a well-known address (zero address for simplicity)
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const balance = await client.getBalance(zeroAddress);

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
			// Balance should be non-negative
			expect(balance).toBeGreaterThanOrEqual(0n);
		});

		it('should get code at an address', async () => {
			// Query code at zero address (should be empty)
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const code = await client.getCode(zeroAddress);

			expect(code).toBeDefined();
			expect(typeof code).toBe('string');
			// Zero address should not have code
			expect(code).toBe('0x');
		});

		it('should get nonce for an address', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const nonce = await client.getNonce(zeroAddress);

			expect(nonce).toBeDefined();
			expect(typeof nonce).toBe('number');
			expect(nonce).toBeGreaterThanOrEqual(0);
		});

		it('should estimate gas for a simple transfer', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const gasEstimate = await client.estimateGas({
				to: zeroAddress,
				value: 1n, // 1 wei
			});

			expect(gasEstimate).toBeDefined();
			expect(typeof gasEstimate).toBe('bigint');
			// Simple transfer should be around 21000 gas, with margin ~25200
			expect(gasEstimate).toBeGreaterThanOrEqual(21000n);
		});
	});

	describe('Write Operations (Private Key Required)', () => {
		// Helper to get signer with type guard
		const getSigner = (): NonNullable<typeof signer> => {
			if (!signer) throw new Error('Signer not initialized');
			return signer;
		};

		describe.skipIf(!hasPrivateKey)('Transaction Tests', () => {
			it('should have a valid signer address', () => {
				const s = getSigner();
				expect(s).toBeDefined();
				expect(s.address).toBeDefined();
				expect(s.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
			});

			it('should get balance of signer address', async () => {
				const s = getSigner();
				const balance = await client.getBalance(s.address);

				expect(balance).toBeDefined();
				expect(typeof balance).toBe('bigint');
				console.log(`Signer address: ${s.address}`);
				console.log(`Signer balance: ${balance} wei`);
			});

			it('should get nonce for signer address', async () => {
				const s = getSigner();
				const nonce = await client.getNonce(s.address);

				expect(nonce).toBeDefined();
				expect(typeof nonce).toBe('number');
				console.log(`Signer nonce: ${nonce}`);
			});

			it('should send a self-transfer transaction', async () => {
				const s = getSigner();
				// Check balance first
				const balance = await client.getBalance(s.address);

				// Skip if balance is too low (need at least 1 wei)
				if (balance < 1n) {
					console.log('Skipping transaction test: insufficient balance');
					return;
				}

				// Send 1 wei to self
				const hash = await client.send(s, s.address, 1n);

				expect(hash).toBeDefined();
				expect(typeof hash).toBe('string');
				expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

				console.log(`Transaction hash: ${hash}`);
			});

			it('should send a self-transfer and wait for receipt', async () => {
				const s = getSigner();
				// Check balance first
				const balance = await client.getBalance(s.address);

				// Skip if balance is too low
				if (balance < 1n) {
					console.log('Skipping transaction test: insufficient balance');
					return;
				}

				// Send 1 wei to self and wait for receipt
				const receipt = await client.sendSync(s, s.address, 1n);

				expect(receipt).toBeDefined();
				expect(receipt.transactionHash).toBeDefined();
				expect(receipt.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
				expect(receipt.status).toBe('success');
				expect(receipt.from.toLowerCase()).toBe(s.address.toLowerCase());
				expect(receipt.to?.toLowerCase()).toBe(s.address.toLowerCase());
				expect(receipt.blockNumber).toBeGreaterThan(0n);
				expect(receipt.gasUsed).toBeGreaterThan(0n);

				console.log(`Transaction receipt:`, {
					hash: receipt.transactionHash,
					status: receipt.status,
					blockNumber: receipt.blockNumber.toString(),
					gasUsed: receipt.gasUsed.toString(),
				});
			}, 60000); // Extended timeout for transaction confirmation

			it('should wait for an existing transaction receipt', async () => {
				const s = getSigner();
				// First send a transaction
				const balance = await client.getBalance(s.address);

				if (balance < 1n) {
					console.log('Skipping transaction test: insufficient balance');
					return;
				}

				// Send transaction (async)
				const hash = await client.send(s, s.address, 1n);

				// Wait for receipt separately
				const receipt = await client.waitForReceipt(hash);

				expect(receipt).toBeDefined();
				expect(receipt.transactionHash).toBe(hash);
				expect(receipt.status).toBe('success');
			}, 60000);
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid address gracefully in getBalance', async () => {
			// Note: viem validates addresses, so this should throw
			await expect(async () => {
				await client.getBalance('invalid-address' as `0x${string}`);
			}).rejects.toThrow();
		});

		it('should handle connection to valid endpoint', async () => {
			// This test validates that our client can successfully connect
			const chainId = await client.getChainId();
			expect(chainId).toBeDefined();
		});
	});

	describe('Logger and Interceptor', () => {
		it('should support logger option', async () => {
			const logs: string[] = [];
			const loggerClient = createRadiusClient({
				chain: testChain,
				logger: (msg: string) => logs.push(msg),
			});

			// Make a request that requires network call
			// getChainId() may use cached value, so use getBlockNumber instead
			await loggerClient.publicClient.getBlockNumber();

			// Logger should have captured something
			expect(logs.length).toBeGreaterThan(0);
		});

		it('should support interceptor option', async () => {
			let intercepted = false;

			const interceptorClient = createRadiusClient({
				chain: testChain,
				interceptor: async (_reqBody, response) => {
					intercepted = true;
					return response;
				},
			});

			// Make a request that requires network call
			// getChainId() may use cached value, so use getBlockNumber instead
			await interceptorClient.publicClient.getBlockNumber();

			// Interceptor should have been called
			expect(intercepted).toBe(true);
		});
	});
});

describe('RadiusClient Connection Tests', () => {
	it('should connect to default testnet RPC', async () => {
		const client = createRadiusClient({
			chain: radiusTestnet,
		});

		const chainId = await client.getChainId();
		expect(chainId).toBe(BigInt(radiusTestnet.id));
	});

	it('should connect to custom RPC endpoint', async () => {
		const customChain = defineChain({
			...radiusTestnet,
			rpcUrls: {
				default: {
					http: [RADIUS_ENDPOINT],
				},
			},
		});

		const client = createRadiusClient({
			chain: customChain,
		});

		const chainId = await client.getChainId();
		expect(chainId).toBe(BigInt(radiusTestnet.id));
	});
});
