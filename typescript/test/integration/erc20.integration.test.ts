/**
 * Integration tests for ERC20 contract interactions on Radius testnet.
 *
 * These tests validate ERC20 token interactions using the standard viem pattern:
 * - client.getContract() with erc20Abi
 * - Standard viem read/write operations
 *
 * @module test/integration/erc20.integration.test
 */

import { createRadiusClient, type RadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { defineChain, erc20Abi, formatUnits, type LocalAccount, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Environment configuration for integration tests.
 */
const RADIUS_ENDPOINT = process.env.RADIUS_ENDPOINT || 'https://rpc.testnet.radiustech.xyz';
const RADIUS_PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY as `0x${string}` | undefined;

/**
 * Known ERC20 token address on Radius testnet.
 * This is the SBC (Stablecoin) token deployed on testnet.
 */
const TESTNET_ERC20_ADDRESS = '0x4635f5a14a97e7F175e6Aa0B0729F8Ed16fB2D4e' as const;

/**
 * Check if we have the required environment for write tests.
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

describe('ERC20 Integration Tests (Standard viem Pattern)', () => {
	let client: RadiusClient;
	let signer: LocalAccount | undefined;
	let tokenAddress: `0x${string}` | undefined;
	const testChain = createTestChain();

	beforeAll(async () => {
		// Create the client
		client = createRadiusClient({
			chain: testChain,
		});

		// Create signer if private key is available
		if (hasPrivateKey && RADIUS_PRIVATE_KEY) {
			signer = privateKeyToAccount(RADIUS_PRIVATE_KEY);
		}

		// Check if the token contract exists
		const code = await client.getCode({ address: TESTNET_ERC20_ADDRESS });
		if (code && code !== '0x' && code.length > 2) {
			tokenAddress = TESTNET_ERC20_ADDRESS;
			console.log(`Found ERC20 token at ${tokenAddress}`);
		} else {
			console.log('Warning: No valid ERC20 token found on testnet');
		}
	});

	describe('ERC20 Read Operations (using client.getContract)', () => {
		it.skipIf(!tokenAddress)('should read token name using getContract', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const name = await token.read.name();

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);

			console.log(`Token name: ${name}`);
		});

		it.skipIf(!tokenAddress)('should read token symbol', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const symbol = await token.read.symbol();

			expect(symbol).toBeDefined();
			expect(typeof symbol).toBe('string');

			console.log(`Token symbol: ${symbol}`);
		});

		it.skipIf(!tokenAddress)('should read token decimals', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const decimals = await token.read.decimals();

			expect(decimals).toBeDefined();
			expect(typeof decimals).toBe('number');
			expect(decimals).toBeGreaterThanOrEqual(0);
			expect(decimals).toBeLessThanOrEqual(18);

			console.log(`Token decimals: ${decimals}`);
		});

		it.skipIf(!tokenAddress)('should read total supply', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const totalSupply = await token.read.totalSupply();

			expect(totalSupply).toBeDefined();
			expect(typeof totalSupply).toBe('bigint');
			expect(totalSupply).toBeGreaterThanOrEqual(0n);

			console.log(`Total supply: ${totalSupply.toString()}`);
		});

		it.skipIf(!tokenAddress)('should read balance of address', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const balance = await token.read.balanceOf([zeroAddress]);

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
			expect(balance).toBeGreaterThanOrEqual(0n);

			console.log(`Zero address balance: ${balance.toString()}`);
		});

		it.skipIf(!tokenAddress || !hasPrivateKey)('should read balance of signer', async () => {
			if (!signer) throw new Error('Signer not initialized');

			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const balance = await token.read.balanceOf([signer.address]);
			const decimals = await token.read.decimals();
			const symbol = await token.read.symbol();

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');

			const formatted = formatUnits(balance, decimals);
			console.log(`Signer token balance: ${formatted} ${symbol}`);
		});

		it.skipIf(!tokenAddress)('should read allowance', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const allowance = await token.read.allowance([zeroAddress, zeroAddress]);

			expect(allowance).toBeDefined();
			expect(typeof allowance).toBe('bigint');
			expect(allowance).toBeGreaterThanOrEqual(0n);
		});
	});

	describe('ERC20 Read Operations (using client.readContract)', () => {
		it.skipIf(!tokenAddress)('should read token name using readContract', async () => {
			const name = await client.readContract({
				address: tokenAddress!,
				abi: erc20Abi,
				functionName: 'name',
			});

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
		});

		it.skipIf(!tokenAddress)('should read balance using readContract', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;

			const balance = await client.readContract({
				address: tokenAddress!,
				abi: erc20Abi,
				functionName: 'balanceOf',
				args: [zeroAddress],
			});

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
		});
	});

	describe('ERC20 Write Operations', () => {
		it.skipIf(!hasPrivateKey || !tokenAddress)(
			'should perform self-transfer using getContract.write',
			async () => {
				if (!signer) throw new Error('Signer not initialized');

				const token = client.getContract({
					address: tokenAddress!,
					abi: erc20Abi,
				});

				// Check balance first
				const balance = await token.read.balanceOf([signer.address]);

				if (balance < 1n) {
					console.log('Skipping transfer test: no token balance');
					return;
				}

				// Transfer 1 unit to self using the typed contract
				const receipt = await token.write.transfer({
					args: [signer.address, 1n],
					signer,
				});

				expect(receipt).toBeDefined();
				expect(receipt.status).toBe('success');

				console.log(`Transfer confirmed in block ${receipt.blockNumber}`);
			},
			60000,
		);

		it.skipIf(!hasPrivateKey || !tokenAddress)(
			'should perform self-transfer using writeContract',
			async () => {
				if (!signer) throw new Error('Signer not initialized');

				const token = client.getContract({
					address: tokenAddress!,
					abi: erc20Abi,
				});

				// Check balance first
				const balance = await token.read.balanceOf([signer.address]);

				if (balance < 1n) {
					console.log('Skipping transfer test: no token balance');
					return;
				}

				// Transfer using writeContract directly
				const hash = await client.writeContract({
					address: tokenAddress!,
					abi: erc20Abi,
					functionName: 'transfer',
					args: [signer.address, 1n],
					account: signer,
				});

				expect(hash).toBeDefined();
				expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

				// Wait for confirmation
				const receipt = await client.waitForTransactionReceipt({ hash });
				expect(receipt.status).toBe('success');

				console.log(`Transfer confirmed in block ${receipt.blockNumber}`);
			},
			60000,
		);
	});

	describe('Utility Functions (using viem directly)', () => {
		it.skipIf(!tokenAddress)('should format token amounts correctly', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const decimals = await token.read.decimals();
			const oneToken = 10n ** BigInt(decimals);

			// Use viem's formatUnits directly
			const formatted = formatUnits(oneToken, decimals);

			expect(formatted).toBe('1');
		});

		it.skipIf(!tokenAddress)('should parse token amounts correctly', async () => {
			const token = client.getContract({
				address: tokenAddress!,
				abi: erc20Abi,
			});

			const decimals = await token.read.decimals();

			// Use viem's parseUnits directly
			const parsed = parseUnits('1', decimals);
			const expected = 10n ** BigInt(decimals);

			expect(parsed).toBe(expected);
		});
	});
});
