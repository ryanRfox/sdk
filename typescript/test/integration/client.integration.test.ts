// @ts-nocheck - Integration tests use complex viem types that are validated at runtime
/**
 * Integration tests for Radius SDK V2 against the Radius testnet.
 *
 * These tests validate real interactions with the Radius testnet RPC endpoint
 * using the viem-based V2 API pattern.
 *
 * They require environment variables to be set:
 * - RADIUS_ENDPOINT: The RPC endpoint URL (defaults to https://rpc.testnet.radiustech.xyz)
 * - PRIVATE_KEY: A private key with testnet funds for transaction tests
 *
 * @module test/integration/client.integration.test
 */

import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
import { createPublicClient, createWalletClient, defineChain, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Environment configuration for integration tests.
 */
const RADIUS_ENDPOINT = process.env.RADIUS_ENDPOINT || 'https://rpc.testnet.radiustech.xyz';

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const SKIP_TESTS = !PRIVATE_KEY;

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

describe.skipIf(SKIP_TESTS)('Radius SDK V2 Integration Tests', () => {
	// biome-ignore lint/suspicious/noImplicitAnyLet: Integration tests use complex viem types validated at runtime
	let publicClient;
	// biome-ignore lint/suspicious/noImplicitAnyLet: Integration tests use complex viem types validated at runtime
	let walletClient;
	// biome-ignore lint/suspicious/noImplicitAnyLet: Integration tests use complex viem types validated at runtime
	let account;
	const testChain = createTestChain();

	beforeAll(() => {
		// Create public client for read operations
		publicClient = createPublicClient({
			chain: testChain,
			transport: http(),
		});

		// Create account from private key
		account = privateKeyToAccount(PRIVATE_KEY);

		// Create wallet client with Radius extensions for write operations
		walletClient = createWalletClient({
			account,
			chain: testChain,
			transport: http(),
		}).extend(radiusWalletActions());
	});

	describe('Read Operations (Public Client)', () => {
		it('should create clients successfully', () => {
			expect(publicClient).toBeDefined();
			expect(walletClient).toBeDefined();
		});

		it('should get the chain ID', async () => {
			const chainId = await publicClient.getChainId();

			expect(chainId).toBeDefined();
			expect(typeof chainId).toBe('number');
			// Radius testnet chain ID is 1223953
			expect(chainId).toBe(testChain.id);
		});

		it('should get the current block number', async () => {
			const blockNumber = await publicClient.getBlockNumber();

			expect(blockNumber).toBeDefined();
			expect(typeof blockNumber).toBe('bigint');
			expect(blockNumber).toBeGreaterThan(0n);
		});

		it('should get a block by number', async () => {
			const blockNumber = await publicClient.getBlockNumber();
			const block = await publicClient.getBlock({ blockNumber });

			expect(block).toBeDefined();
			expect(block.number).toBe(blockNumber);
			expect(block.hash).toBeDefined();
			expect(typeof block.hash).toBe('string');
			expect(block.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
		});

		it('should get balance of a known address', async () => {
			// Use a well-known address (zero address for simplicity)
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const balance = await publicClient.getBalance({ address: zeroAddress });

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
			// Balance should be non-negative
			expect(balance).toBeGreaterThanOrEqual(0n);
		});

		it('should get code at an address', async () => {
			// Query code at zero address (should be empty)
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const code = await publicClient.getCode({ address: zeroAddress });

			// Zero address should not have code - returns undefined or '0x'
			expect(code === undefined || code === '0x').toBe(true);
		});

		it('should get nonce for an address', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const nonce = await publicClient.getTransactionCount({ address: zeroAddress });

			expect(nonce).toBeDefined();
			expect(typeof nonce).toBe('number');
			expect(nonce).toBeGreaterThanOrEqual(0);
		});

		it('should estimate gas for a simple transfer', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const gasEstimate = await publicClient.estimateGas({
				to: zeroAddress,
				value: 1n, // 1 wei
			});

			expect(gasEstimate).toBeDefined();
			expect(typeof gasEstimate).toBe('bigint');
			// Simple transfer should be around 21000 gas, with margin ~25200
			expect(gasEstimate).toBeGreaterThanOrEqual(21000n);
		});
	});

	describe('Write Operations (Wallet Client)', () => {
		it('should have a valid account address', () => {
			expect(account).toBeDefined();
			expect(account.address).toBeDefined();
			expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should get balance of account address', async () => {
			const balance = await publicClient.getBalance({ address: account.address });

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
			console.log(`Account address: ${account.address}`);
			console.log(`Account balance: ${balance} wei`);
		});

		it('should get nonce for account address', async () => {
			const nonce = await publicClient.getTransactionCount({ address: account.address });

			expect(nonce).toBeDefined();
			expect(typeof nonce).toBe('number');
			console.log(`Account nonce: ${nonce}`);
		});

		it('should send a self-transfer transaction', async () => {
			// Check balance first
			const balance = await publicClient.getBalance({ address: account.address });

			// Skip if balance is too low (need at least 1 wei)
			if (balance < 1n) {
				console.log('Skipping transaction test: insufficient balance');
				return;
			}

			// Send 1 wei to self using standard viem API
			const hash = await walletClient.sendTransaction({
				to: account.address,
				value: 1n,
			});

			expect(hash).toBeDefined();
			expect(typeof hash).toBe('string');
			expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

			console.log(`Transaction hash: ${hash}`);
		});

		it('should send a self-transfer and wait for receipt', async () => {
			// Check balance first
			const balance = await publicClient.getBalance({ address: account.address });

			// Skip if balance is too low
			if (balance < 1n) {
				console.log('Skipping transaction test: insufficient balance');
				return;
			}

			// Send 1 wei to self
			const hash = await walletClient.sendTransaction({
				to: account.address,
				value: 1n,
			});

			// Wait for receipt
			const receipt = await publicClient.waitForTransactionReceipt({ hash });

			expect(receipt).toBeDefined();
			expect(receipt.transactionHash).toBeDefined();
			expect(receipt.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
			expect(receipt.status).toBe('success');
			expect(receipt.from.toLowerCase()).toBe(account.address.toLowerCase());
			expect(receipt.to?.toLowerCase()).toBe(account.address.toLowerCase());
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
			// First send a transaction
			const balance = await publicClient.getBalance({ address: account.address });

			if (balance < 1n) {
				console.log('Skipping transaction test: insufficient balance');
				return;
			}

			// Send transaction
			const hash = await walletClient.sendTransaction({
				to: account.address,
				value: 1n,
			});

			// Wait for receipt separately
			const receipt = await publicClient.waitForTransactionReceipt({ hash });

			expect(receipt).toBeDefined();
			expect(receipt.transactionHash).toBe(hash);
			expect(receipt.status).toBe('success');
		}, 60000);
	});

	describe('Batch Transactions (Radius Extension)', () => {
		it('should send batch transactions', async () => {
			// Check balance first
			const balance = await publicClient.getBalance({ address: account.address });

			// Skip if balance is too low
			if (balance < 2n) {
				console.log('Skipping batch transaction test: insufficient balance');
				return;
			}

			// Send batch of 2 transactions using Radius extension
			const hashes = await walletClient.sendTransactionBatch({
				transactions: [
					{ to: account.address, value: 1n },
					{ to: account.address, value: 1n },
				],
			});

			expect(hashes).toBeDefined();
			expect(Array.isArray(hashes)).toBe(true);
			expect(hashes.length).toBe(2);
			for (const hash of hashes) {
				expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
			}

			console.log(`Batch transaction hashes:`, hashes);

			// Wait for all receipts
			const receipts = await Promise.all(
				hashes.map((hash) => publicClient.waitForTransactionReceipt({ hash })),
			);

			for (const receipt of receipts) {
				expect(receipt.status).toBe('success');
			}
		}, 60000);
	});

	describe('Error Handling', () => {
		it('should handle invalid address gracefully in getBalance', async () => {
			// Note: viem validates addresses, so this should throw
			await expect(async () => {
				await publicClient.getBalance({ address: 'invalid-address' as `0x${string}` });
			}).rejects.toThrow();
		});

		it('should handle connection to valid endpoint', async () => {
			// This test validates that our client can successfully connect
			const chainId = await publicClient.getChainId();
			expect(chainId).toBeDefined();
		});
	});
});

describe.skipIf(SKIP_TESTS)('Radius SDK V2 Connection Tests', () => {
	it('should connect to default testnet RPC', async () => {
		const client = createPublicClient({
			chain: radiusTestnet,
			transport: http(),
		});

		const chainId = await client.getChainId();
		expect(chainId).toBe(radiusTestnet.id);
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

		const client = createPublicClient({
			chain: customChain,
			transport: http(),
		});

		const chainId = await client.getChainId();
		expect(chainId).toBe(radiusTestnet.id);
	});
});
