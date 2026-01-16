/**
 * Integration tests for ERC20 contract interactions on Radius testnet.
 *
 * These tests validate real ERC20 token interactions with deployed contracts
 * on the Radius testnet. They require:
 * - A deployed ERC20 token contract on testnet
 * - RADIUS_PRIVATE_KEY environment variable for write operations
 *
 * @module test/integration/erc20.integration.test
 */

import {
	createERC20,
	createPrivateKeySigner,
	createRadiusClient,
	ERC20,
	type RadiusClient,
	radiusTestnet,
} from '@radiustechsystems/sdk';
import type { LocalAccount } from 'viem';
import { createWalletClient, defineChain, http } from 'viem';
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
 * If this address changes, update it to a known ERC20 token on testnet.
 */
const TESTNET_ERC20_ADDRESS = '0x4635f5a14a97e7F175e6Aa0B0729F8Ed16fB2D4e' as const;

/**
 * Alternative test addresses if the primary token doesn't exist.
 * These are common token addresses that might be available.
 */
const FALLBACK_ERC20_ADDRESSES = [
	'0x4635f5a14a97e7F175e6Aa0B0729F8Ed16fB2D4e', // SBC Token
] as const;

/**
 * Check if we have the required environment for write tests.
 */
const hasPrivateKey = !!RADIUS_PRIVATE_KEY;

/**
 * Helper to assert a value is defined and return it typed.
 */
function assertDefined<T>(value: T | undefined | null, message = 'Value is undefined'): T {
	if (value === undefined || value === null) throw new Error(message);
	return value;
}

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

describe('ERC20 Integration Tests', () => {
	let client: RadiusClient;
	let signer: LocalAccount | undefined;
	let erc20: ERC20 | undefined;
	let tokenAddress: `0x${string}` | undefined;
	const testChain = createTestChain();

	beforeAll(async () => {
		// Create the client
		client = createRadiusClient({
			chain: testChain,
		});

		// Create signer if private key is available
		if (hasPrivateKey && RADIUS_PRIVATE_KEY) {
			signer = createPrivateKeySigner(RADIUS_PRIVATE_KEY);
		}

		// Try to find a valid ERC20 token on the network
		const addresses = [TESTNET_ERC20_ADDRESS, ...FALLBACK_ERC20_ADDRESSES];

		for (const addr of addresses) {
			try {
				// Check if contract has code
				const code = await client.getCode({ address: addr });
				if (code && code !== '0x' && code.length > 2) {
					// Try to instantiate and call a view function
					const testToken = createERC20(addr, client.publicClient);
					await testToken.name(); // Will throw if not a valid ERC20
					tokenAddress = addr;
					erc20 = testToken;
					console.log(`Found valid ERC20 token at ${addr}`);
					break;
				}
			} catch (_error) {
				console.log(`Token at ${addr} is not available or not a valid ERC20`);
			}
		}

		if (!tokenAddress) {
			console.log('Warning: No valid ERC20 token found on testnet');
		}
	});

	describe('ERC20 Read Operations', () => {
		it.skipIf(!tokenAddress)('should read token name', async () => {
			const name = assertDefined(await erc20?.name(), 'Token name not found');

			expect(name).toBeDefined();
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);

			console.log(`Token name: ${name}`);
		});

		it.skipIf(!tokenAddress)('should read token symbol', async () => {
			const symbol = assertDefined(await erc20?.symbol(), 'Token symbol not found');

			expect(symbol).toBeDefined();
			expect(typeof symbol).toBe('string');
			expect(symbol.length).toBeGreaterThan(0);

			console.log(`Token symbol: ${symbol}`);
		});

		it.skipIf(!tokenAddress)('should read token decimals', async () => {
			const decimals = await erc20?.decimals();

			expect(decimals).toBeDefined();
			expect(typeof decimals).toBe('number');
			// Most tokens have 18 decimals, but some have 6 (USDC) or others
			expect(decimals).toBeGreaterThanOrEqual(0);
			expect(decimals).toBeLessThanOrEqual(18);

			console.log(`Token decimals: ${decimals}`);
		});

		it.skipIf(!tokenAddress)('should read total supply', async () => {
			const totalSupply = assertDefined(await erc20?.totalSupply(), 'Total supply not found');

			expect(totalSupply).toBeDefined();
			expect(typeof totalSupply).toBe('bigint');
			expect(totalSupply).toBeGreaterThanOrEqual(0n);

			console.log(`Total supply: ${totalSupply.toString()}`);
		});

		it.skipIf(!tokenAddress)('should read balance of zero address', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const balance = assertDefined(await erc20?.balanceOf(zeroAddress), 'Balance not found');

			expect(balance).toBeDefined();
			expect(typeof balance).toBe('bigint');
			expect(balance).toBeGreaterThanOrEqual(0n);

			console.log(`Zero address balance: ${balance.toString()}`);
		});

		it.skipIf(!tokenAddress || !hasPrivateKey)(
			'should read balance of signer address',
			async () => {
				if (!signer) throw new Error('Signer not initialized');
				const balance = assertDefined(await erc20?.balanceOf(signer.address), 'Balance not found');

				expect(balance).toBeDefined();
				expect(typeof balance).toBe('bigint');
				expect(balance).toBeGreaterThanOrEqual(0n);

				// Format the balance for display
				const formatted = await erc20?.formatAmount(balance);
				console.log(`Signer token balance: ${formatted} ${await erc20?.symbol()}`);
			},
		);

		it.skipIf(!tokenAddress)('should read allowance', async () => {
			const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
			const allowance = assertDefined(
				await erc20?.allowance(zeroAddress, zeroAddress),
				'Allowance not found',
			);

			expect(allowance).toBeDefined();
			expect(typeof allowance).toBe('bigint');
			expect(allowance).toBeGreaterThanOrEqual(0n);

			console.log(`Zero-to-zero allowance: ${allowance.toString()}`);
		});

		it.skipIf(!tokenAddress)('should cache metadata after first call', async () => {
			// First call should fetch from network
			const name1 = await erc20?.name();
			const symbol1 = await erc20?.symbol();
			const decimals1 = await erc20?.decimals();

			// Second calls should use cache (no network request)
			const name2 = await erc20?.name();
			const symbol2 = await erc20?.symbol();
			const decimals2 = await erc20?.decimals();

			expect(name1).toBe(name2);
			expect(symbol1).toBe(symbol2);
			expect(decimals1).toBe(decimals2);
		});

		it.skipIf(!tokenAddress)('should clear cache properly', async () => {
			// Get cached values
			await erc20?.name();
			await erc20?.symbol();
			await erc20?.decimals();

			// Clear cache
			erc20?.clearCache();

			// Values should still be readable (will fetch fresh from network)
			const name = await erc20?.name();
			expect(name).toBeDefined();
		});
	});

	describe('ERC20 Utility Methods', () => {
		it.skipIf(!tokenAddress)('should format token amounts correctly', async () => {
			const decimals = assertDefined(await erc20?.decimals(), 'Decimals not found');

			// Test formatting various amounts
			const oneToken = 10n ** BigInt(decimals);
			const formatted = await erc20?.formatAmount(oneToken);

			expect(formatted).toBe('1');
		});

		it.skipIf(!tokenAddress)('should parse token amounts correctly', async () => {
			const decimals = assertDefined(await erc20?.decimals(), 'Decimals not found');

			// Test parsing various amounts
			const parsed = await erc20?.parseAmount('1');
			const expected = 10n ** BigInt(decimals);

			expect(parsed).toBe(expected);
		});

		it.skipIf(!tokenAddress)('should handle fractional amounts', async () => {
			// Parse and format should be inverse operations
			const original = '1.5';
			const parsed = assertDefined(await erc20?.parseAmount(original), 'Parsed amount not found');
			const formatted = await erc20?.formatAmount(parsed);

			expect(formatted).toBe(original);
		});
	});

	describe('ERC20 Write Operations', () => {
		describe.skipIf(!hasPrivateKey || !tokenAddress)('Transfer Tests', () => {
			let walletClient: ReturnType<typeof createWalletClient>;
			let account: ReturnType<typeof privateKeyToAccount>;

			beforeAll(() => {
				if (hasPrivateKey && RADIUS_PRIVATE_KEY) {
					account = privateKeyToAccount(RADIUS_PRIVATE_KEY);
					walletClient = createWalletClient({
						chain: testChain,
						transport: http(RADIUS_ENDPOINT),
						account,
					});
				}
			});

			it('should check if signer has token balance for transfer', async () => {
				if (!signer) throw new Error('Signer not initialized');
				const balance = assertDefined(await erc20?.balanceOf(signer.address), 'Balance not found');
				const formatted = await erc20?.formatAmount(balance);

				console.log(`Signer has ${formatted} ${await erc20?.symbol()} tokens`);
				console.log(
					balance > 0n
						? 'Transfer tests can proceed'
						: 'Transfer tests will be skipped (no balance)',
				);
			});

			it('should perform a self-transfer if balance allows', async () => {
				if (!signer) throw new Error('Signer not initialized');
				const balance = assertDefined(await erc20?.balanceOf(signer.address), 'Balance not found');

				// Skip if no balance
				if (balance === 0n) {
					console.log('Skipping transfer test: no token balance');
					return;
				}

				// Transfer 1 unit (smallest amount) to self
				const transferAmount = 1n;

				// Skip if balance is less than transfer amount
				if (balance < transferAmount) {
					console.log('Skipping transfer test: insufficient balance');
					return;
				}

				// Create the signer object for ERC20 write operations
				const erc20Signer = {
					walletClient,
					account,
				};

				// Perform transfer
				const hash = assertDefined(
					await erc20?.transfer(erc20Signer, signer.address, transferAmount),
					'Transfer hash not returned',
				);

				expect(hash).toBeDefined();
				expect(typeof hash).toBe('string');
				expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

				console.log(`Transfer transaction hash: ${hash}`);

				// Wait for receipt
				const receipt = await client.publicClient.waitForTransactionReceipt({ hash });

				expect(receipt.status).toBe('success');
				console.log(`Transfer confirmed in block ${receipt.blockNumber}`);
			}, 60000);

			it('should perform transferSync if balance allows', async () => {
				if (!signer) throw new Error('Signer not initialized');
				const balance = assertDefined(await erc20?.balanceOf(signer.address), 'Balance not found');

				// Skip if no balance
				if (balance < 1n) {
					console.log('Skipping transferSync test: insufficient balance');
					return;
				}

				// Create the signer object for ERC20 write operations
				const erc20Signer = {
					walletClient,
					account,
				};

				// Perform transfer and wait
				const receipt = assertDefined(
					await erc20?.transferSync(erc20Signer, signer.address, 1n),
					'Receipt not returned',
				);

				expect(receipt).toBeDefined();
				expect(receipt.status).toBe('success');

				console.log(`TransferSync completed in block ${receipt.blockNumber}`);
			}, 60000);
		});
	});
});

describe('ERC20 Factory Function', () => {
	it('should create ERC20 instance with factory function', async () => {
		const testChain = createTestChain();
		const client = createRadiusClient({ chain: testChain });

		// Check if token exists before creating instance
		const code = await client.getCode({ address: TESTNET_ERC20_ADDRESS });

		if (!code || code === '0x') {
			console.log('Skipping factory test: no contract at test address');
			return;
		}

		const erc20 = createERC20(TESTNET_ERC20_ADDRESS, client.publicClient);

		expect(erc20).toBeDefined();
		expect(erc20).toBeInstanceOf(ERC20);
		expect(erc20.address).toBe(TESTNET_ERC20_ADDRESS);
	});
});

describe('ERC20 with RadiusClient.call', () => {
	it.skipIf(!hasPrivateKey)('should call ERC20 methods via RadiusClient.call', async () => {
		const testChain = createTestChain();
		const client = createRadiusClient({ chain: testChain });

		// Check if token exists
		const code = await client.getCode({ address: TESTNET_ERC20_ADDRESS });

		if (!code || code === '0x') {
			console.log('Skipping RadiusClient.call test: no contract at test address');
			return;
		}

		// Use the ERC20 ABI directly with RadiusClient
		const { ERC20_ABI } = await import('@radiustechsystems/sdk');

		const contract = {
			abi: ERC20_ABI,
			address: TESTNET_ERC20_ADDRESS,
		};

		// Call name() method via RadiusClient
		const name = await client.call<string>(contract, 'name');

		expect(name).toBeDefined();
		expect(typeof name).toBe('string');

		console.log(`Token name via RadiusClient.call: ${name}`);
	});
});
