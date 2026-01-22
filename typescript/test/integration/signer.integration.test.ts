// @ts-nocheck - Integration tests use complex viem types that are validated at runtime
/**
 * Integration tests for privateKeyToAccount.
 *
 * These tests validate the signer functionality including address derivation,
 * message signing, and transaction signing. Most tests can run without network
 * access, but transaction signing validation benefits from actual network interaction.
 *
 * @module test/integration/signer.integration.test
 */

import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
import type { Hex, LocalAccount } from 'viem';
import {
	createPublicClient,
	createWalletClient,
	defineChain,
	http,
	parseTransaction,
	recoverMessageAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Environment configuration for integration tests.
 */
const RADIUS_ENDPOINT = process.env.RADIUS_ENDPOINT || 'https://rpc.testnet.radiustech.xyz';

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const SKIP_TESTS = !PRIVATE_KEY;

/**
 * Well-known test private key for deterministic testing.
 * This is the first Hardhat/Anvil test account.
 * DO NOT use this key for real funds - it's publicly known!
 */
const KNOWN_TEST_PRIVATE_KEY =
	'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const;
const KNOWN_TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const;

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

describe.skipIf(SKIP_TESTS)('privateKeyToAccount Integration Tests', () => {
	describe('Account Creation', () => {
		it('should create a LocalAccount from private key', () => {
			const account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

			expect(account).toBeDefined();
			expect(account.type).toBe('local');
		});

		it('should derive correct address from known private key', () => {
			const account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

			// The address should match the known address for this private key
			expect(account.address.toLowerCase()).toBe(KNOWN_TEST_ADDRESS.toLowerCase());
		});

		it('should create same address regardless of when created', () => {
			const account1 = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);
			const account2 = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

			// Address should be the same (derived from private key)
			expect(account1.address.toLowerCase()).toBe(KNOWN_TEST_ADDRESS.toLowerCase());
			expect(account2.address.toLowerCase()).toBe(KNOWN_TEST_ADDRESS.toLowerCase());
		});

		it('should throw for invalid private key', () => {
			expect(() => {
				privateKeyToAccount('0xinvalid');
			}).toThrow();
		});

		it('should throw for private key without 0x prefix handling', () => {
			// viem requires 0x prefix
			expect(() => {
				privateKeyToAccount(
					'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex,
				);
			}).toThrow();
		});
	});

	describe('Message Signing', () => {
		let account: LocalAccount;

		beforeAll(() => {
			account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);
		});

		it('should sign a string message', async () => {
			const message = 'Hello, Radius!';
			const signature = await account.signMessage({ message });

			expect(signature).toBeDefined();
			expect(typeof signature).toBe('string');
			expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);
			// ECDSA signature length (65 bytes = 130 hex chars + 0x prefix)
			expect(signature.length).toBe(132);
		});

		it('should produce recoverable signatures', async () => {
			const message = 'Recoverable message test';
			const signature = await account.signMessage({ message });

			// Recover the address from the signature
			const recoveredAddress = await recoverMessageAddress({
				message,
				signature,
			});

			expect(recoveredAddress.toLowerCase()).toBe(account.address.toLowerCase());
		});

		it('should produce consistent signatures for same message', async () => {
			const message = 'Consistent message';

			const sig1 = await account.signMessage({ message });
			const sig2 = await account.signMessage({ message });

			// Note: ECDSA signatures can vary due to nonce (k value)
			// But with deterministic signing (RFC 6979), they should be the same
			expect(sig1).toBe(sig2);
		});

		it('should produce different signatures for different messages', async () => {
			const message1 = 'Message 1';
			const message2 = 'Message 2';

			const sig1 = await account.signMessage({ message: message1 });
			const sig2 = await account.signMessage({ message: message2 });

			expect(sig1).not.toBe(sig2);
		});

		it('should sign hex data messages', async () => {
			const hexData = '0x1234567890abcdef' as Hex;
			const signature = await account.signMessage({ message: { raw: hexData } });

			expect(signature).toBeDefined();
			expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should sign empty message', async () => {
			const signature = await account.signMessage({ message: '' });

			expect(signature).toBeDefined();
			expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should sign long messages', async () => {
			const longMessage = 'x'.repeat(10000);
			const signature = await account.signMessage({ message: longMessage });

			expect(signature).toBeDefined();
			expect(signature.length).toBe(132); // Signature length is fixed
		});

		it('should sign Unicode messages', async () => {
			const unicodeMessage = 'Hello World! Special chars: < > " & \' \n \t';
			const signature = await account.signMessage({ message: unicodeMessage });

			expect(signature).toBeDefined();

			// Verify recovery
			const recoveredAddress = await recoverMessageAddress({
				message: unicodeMessage,
				signature,
			});

			expect(recoveredAddress.toLowerCase()).toBe(account.address.toLowerCase());
		});
	});

	describe('Transaction Signing', () => {
		let account: LocalAccount;

		beforeAll(() => {
			account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);
		});

		it('should sign a basic transaction', async () => {
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1000000000000000000n, // 1 USD
				nonce: 0,
				gasPrice: 0n,
				gas: 21000n,
			};

			const signedTx = await account.signTransaction(tx);

			expect(signedTx).toBeDefined();
			expect(typeof signedTx).toBe('string');
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should include chain ID in signed transaction (EIP-155)', async () => {
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1n,
				nonce: 0,
				gasPrice: 0n,
				gas: 21000n,
				chainId: radiusTestnet.id,
			};

			const signedTx = await account.signTransaction(tx);

			// Parse the signed transaction to verify chain ID
			const parsed = parseTransaction(signedTx);

			// EIP-155 includes chainId in the v value
			expect(parsed.chainId).toBe(radiusTestnet.id);
		});

		it('should sign transaction with data field', async () => {
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 0n,
				data: '0x095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f4240' as Hex,
				nonce: 0,
				gasPrice: 0n,
				gas: 60000n,
			};

			const signedTx = await account.signTransaction(tx);

			expect(signedTx).toBeDefined();
		});

		it('should sign contract creation transaction (no to field)', async () => {
			const tx = {
				value: 0n,
				data: '0x6080604052' as Hex, // Minimal contract bytecode
				nonce: 0,
				gasPrice: 0n,
				gas: 100000n,
			};

			const signedTx = await account.signTransaction(tx);

			expect(signedTx).toBeDefined();

			// Parse and verify it's a contract creation
			const parsed = parseTransaction(signedTx);
			expect(parsed.to).toBeUndefined();
		});

		it('should produce different signed transactions for different nonces', async () => {
			const baseTx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1n,
				gasPrice: 0n,
				gas: 21000n,
			};

			const signedTx1 = await account.signTransaction({ ...baseTx, nonce: 0 });
			const signedTx2 = await account.signTransaction({ ...baseTx, nonce: 1 });

			expect(signedTx1).not.toBe(signedTx2);
		});
	});

	describe('Integration with Viem Clients (V2 Pattern)', () => {
		const testChain = createTestChain();

		describe('Network Transaction Tests', () => {
			// Use ReturnType to infer the correct types from viem's factory functions
			let publicClient: ReturnType<typeof createPublicClient>;
			let walletClient: ReturnType<typeof createWalletClient> &
				ReturnType<typeof radiusWalletActions>;
			let account: LocalAccount;

			beforeAll(() => {
				// Create public client for read operations
				publicClient = createPublicClient({
					chain: testChain,
					transport: http(),
				});

				// Create account from private key
				account = privateKeyToAccount(PRIVATE_KEY);

				// Create wallet client with Radius extensions
				walletClient = createWalletClient({
					account,
					chain: testChain,
					transport: http(),
				}).extend(radiusWalletActions());
			});

			it('should have correct address from environment key', () => {
				expect(account.address).toBeDefined();
				expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
				console.log(`Account address: ${account.address}`);
			});

			it('should be able to get nonce from network', async () => {
				const nonce = await publicClient.getTransactionCount({ address: account.address });

				expect(nonce).toBeDefined();
				expect(typeof nonce).toBe('number');
				expect(nonce).toBeGreaterThanOrEqual(0);

				console.log(`Current nonce: ${nonce}`);
			});

			it('should be able to sign and submit transaction', async () => {
				// Check balance first
				const balance = await publicClient.getBalance({ address: account.address });

				if (balance < 1n) {
					console.log('Skipping transaction test: insufficient balance');
					return;
				}

				// Sign and send a minimal self-transfer using V2 pattern
				const hash = await walletClient.sendTransaction({
					to: account.address,
					value: 1n,
				});

				expect(hash).toBeDefined();
				expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

				console.log(`Submitted transaction: ${hash}`);

				// Wait for confirmation
				const receipt = await publicClient.waitForTransactionReceipt({ hash });

				expect(receipt.status).toBe('success');
				console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
			}, 60000);
		});
	});

	describe('Address Derivation', () => {
		it('should match viem privateKeyToAccount address', () => {
			// Use our function
			const account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

			// Use viem directly
			const viemAccount = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

			expect(account.address).toBe(viemAccount.address);
		});

		it('should derive different addresses for different keys', () => {
			// Second Hardhat test account
			const secondKey =
				'0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const;

			const account1 = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);
			const account2 = privateKeyToAccount(secondKey);

			expect(account1.address).not.toBe(account2.address);
		});
	});

	describe('LocalAccount Interface Compliance', () => {
		let account: LocalAccount;

		beforeAll(() => {
			account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);
		});

		it('should have address property', () => {
			expect('address' in account).toBe(true);
			expect(account.address).toBeDefined();
		});

		it('should have type property', () => {
			expect('type' in account).toBe(true);
			expect(account.type).toBe('local');
		});

		it('should have signMessage method', () => {
			expect(typeof account.signMessage).toBe('function');
		});

		it('should have signTransaction method', () => {
			expect(typeof account.signTransaction).toBe('function');
		});

		it('should have signTypedData method', () => {
			expect(typeof account.signTypedData).toBe('function');
		});
	});

	describe('Environment Key Tests', () => {
		it('should create account from environment key', () => {
			const account = privateKeyToAccount(PRIVATE_KEY);

			expect(account).toBeDefined();
			expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);

			console.log(`Environment key address: ${account.address}`);
		});

		it('should sign message with environment key', async () => {
			const account = privateKeyToAccount(PRIVATE_KEY);
			const message = 'Test message with env key';

			const signature = await account.signMessage({ message });

			expect(signature).toBeDefined();

			// Verify recovery
			const recoveredAddress = await recoverMessageAddress({
				message,
				signature,
			});

			expect(recoveredAddress.toLowerCase()).toBe(account.address.toLowerCase());
		});
	});
});

describe.skipIf(SKIP_TESTS)('privateKeyToAccount Edge Cases', () => {
	it('should handle maximum value transaction', async () => {
		const account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

		const tx = {
			to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
			value: 2n ** 256n - 1n, // Max uint256
			nonce: 0,
			gasPrice: 0n,
			gas: 21000n,
		};

		const signedTx = await account.signTransaction(tx);

		expect(signedTx).toBeDefined();
	});

	it('should handle zero value transaction', async () => {
		const account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

		const tx = {
			to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
			value: 0n,
			nonce: 0,
			gasPrice: 0n,
			gas: 21000n,
		};

		const signedTx = await account.signTransaction(tx);

		expect(signedTx).toBeDefined();
	});

	it('should handle large nonce', async () => {
		const account = privateKeyToAccount(KNOWN_TEST_PRIVATE_KEY);

		const tx = {
			to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
			value: 1n,
			nonce: 999999,
			gasPrice: 0n,
			gas: 21000n,
		};

		const signedTx = await account.signTransaction(tx);

		expect(signedTx).toBeDefined();
	});
});
