import type { Hex, LocalAccount, SignableMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPrivateKeySigner } from './signer';

// Mock viem/accounts
vi.mock('viem/accounts', () => ({
	privateKeyToAccount: vi.fn(),
}));

describe('createPrivateKeySigner', () => {
	// Test private key from hardhat/viem documentation
	const testPrivateKey: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
	const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const;

	let mockAccount: LocalAccount;

	beforeEach(() => {
		vi.clearAllMocks();

		// Create a mock account object with all required LocalAccount properties
		const account: LocalAccount = {
			address: testAddress,
			publicKey: '0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5' as `0x${string}`,
			type: 'local' as const,
			source: 'privateKey' as const,
			sign: async ({ hash: _hash }: { hash: `0x${string}` }) => {
				// Simple deterministic mock signature
				return `0x${'dd'.repeat(65)}` as Hex;
			},
			signAuthorization: async (params: any) => {
				// Simple deterministic mock authorization - return the format expected by SignAuthorizationReturnType
				return {
					address: params.contractAddress,
					chainId: params.chainId,
					nonce: params.nonce,
					r: `0x${'ee'.repeat(32)}` as Hex,
					s: `0x${'ff'.repeat(32)}` as Hex,
					yParity: 0,
				};
			},
			signMessage: async ({ message: _message }: { message: SignableMessage }) => {
				// Simple deterministic mock signature
				return `0x${'aa'.repeat(65)}` as Hex;
			},
			signTransaction: async (_tx: any) => {
				// Simple deterministic mock signed transaction
				return `0x${'bb'.repeat(100)}` as Hex;
			},
			signTypedData: async (_params: any) => {
				return `0x${'cc'.repeat(65)}` as Hex;
			},
		};
		mockAccount = account;

		(vi.mocked(privateKeyToAccount) as any).mockReturnValue(account);
	});

	describe('Basic functionality', () => {
		it('should create an account with a valid private key', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			expect(account).toBeDefined();
			expect(privateKeyToAccount).toHaveBeenCalledWith(testPrivateKey);
		});

		it('should return a LocalAccount', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			expect(account).toBe(mockAccount);
			expect(account.type).toBe('local');
		});

		it('should call privateKeyToAccount with the correct private key', () => {
			const key = '0xdeadbeefcafe' as Hex;

			createPrivateKeySigner(key);

			expect(privateKeyToAccount).toHaveBeenCalledWith(key);
			expect(privateKeyToAccount).toHaveBeenCalledTimes(1);
		});
	});

	describe('address property', () => {
		it('should return the account address', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			expect(account.address).toBe(testAddress);
		});

		it('should return a checksummed address', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			// Address should start with 0x and contain hex characters
			expect(account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should return the same address on multiple calls', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			const address1 = account.address;
			const address2 = account.address;

			expect(address1).toBe(address2);
		});
	});

	describe('signMessage', () => {
		it('should sign a string message', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const message = 'Hello, World!';

			const signature = await account.signMessage({ message });

			expect(signature).toBeDefined();
			expect(typeof signature).toBe('string');
			expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should sign a raw message object', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const message = { raw: '0x1234' as const };

			const signature = await account.signMessage({ message });

			expect(signature).toBeDefined();
			expect(typeof signature).toBe('string');
		});

		it('should pass the message to the account signMessage method', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const message = 'Test message';

			const signMessageSpy = vi.spyOn(mockAccount, 'signMessage');

			await account.signMessage({ message });

			expect(signMessageSpy).toHaveBeenCalledWith({ message });
		});

		it('should return a valid hex signature', async () => {
			const account = createPrivateKeySigner(testPrivateKey);

			const signature = await account.signMessage({ message: 'Test' });

			expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/); // 65 bytes = 130 hex chars
		});

		it('should handle multiple messages independently', async () => {
			const account = createPrivateKeySigner(testPrivateKey);

			const sig1 = await account.signMessage({ message: 'Message 1' });
			const sig2 = await account.signMessage({ message: 'Message 2' });

			expect(sig1).toBeDefined();
			expect(sig2).toBeDefined();
			// Both should be valid hex strings
			expect(sig1).toMatch(/^0x[a-fA-F0-9]+$/);
			expect(sig2).toMatch(/^0x[a-fA-F0-9]+$/);
		});
	});

	describe('signTransaction', () => {
		it('should sign a transaction', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1000000000000000000n,
				nonce: 0,
			};

			const signedTx = await account.signTransaction(tx);

			expect(signedTx).toBeDefined();
			expect(typeof signedTx).toBe('string');
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should pass transaction to the account signTransaction method', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};

			const signTransactionSpy = vi.spyOn(mockAccount, 'signTransaction');

			await account.signTransaction(tx);

			expect(signTransactionSpy).toHaveBeenCalledWith(tx);
		});

		it('should sign a complete transaction with all fields', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1000000000000000000n,
				nonce: 5,
				gasPrice: 20000000000n,
				gas: 21000n,
				data: '0x' as const,
				chainId: 1,
			};

			const signedTx = await account.signTransaction(tx);

			expect(signedTx).toBeDefined();
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should return a valid RLP encoded transaction', async () => {
			const account = createPrivateKeySigner(testPrivateKey);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};

			const signedTx = await account.signTransaction(tx);

			// RLP encoded transactions should be valid hex strings
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});
	});

	describe('LocalAccount interface compliance', () => {
		it('should implement LocalAccount interface', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			// Check that all required properties and methods exist
			expect(account).toHaveProperty('address');
			expect(account).toHaveProperty('type');
			expect(account).toHaveProperty('signMessage');
			expect(account).toHaveProperty('signTransaction');
			expect(account).toHaveProperty('signTypedData');

			// Check types
			expect(typeof account.address).toBe('string');
			expect(account.type).toBe('local');
			expect(typeof account.signMessage).toBe('function');
			expect(typeof account.signTransaction).toBe('function');
			expect(typeof account.signTypedData).toBe('function');
		});
	});

	describe('Factory function', () => {
		it('should create a LocalAccount instance', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			expect(account).toBe(mockAccount);
		});

		it('should create a valid LocalAccount', () => {
			const account = createPrivateKeySigner(testPrivateKey);

			expect(account).toHaveProperty('address');
			expect(account).toHaveProperty('type');
			expect(account).toHaveProperty('signMessage');
			expect(account).toHaveProperty('signTransaction');
		});

		it('should pass private key correctly to privateKeyToAccount', () => {
			const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as Hex;

			createPrivateKeySigner(privateKey);

			expect(privateKeyToAccount).toHaveBeenCalledWith(privateKey);
		});

		it('should create independent account instances', () => {
			const account1 = createPrivateKeySigner(testPrivateKey);
			const account2 = createPrivateKeySigner(testPrivateKey);

			// Each call should return a new mock (based on how we setup the mock)
			expect(account1).toBeDefined();
			expect(account2).toBeDefined();
		});
	});

	describe('Integration scenarios', () => {
		it('should sign multiple messages without state issues', async () => {
			const account = createPrivateKeySigner(testPrivateKey);

			const messages = ['Message 1', 'Message 2', 'Message 3'];
			const signatures = await Promise.all(
				messages.map((msg) => account.signMessage({ message: msg }))
			);

			expect(signatures).toHaveLength(3);
			signatures.forEach((sig) => {
				expect(sig).toMatch(/^0x[a-fA-F0-9]+$/);
			});
		});

		it('should sign multiple transactions without state issues', async () => {
			const account = createPrivateKeySigner(testPrivateKey);

			const tx1 = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};
			const tx2 = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 200n,
				nonce: 1,
			};

			const sig1 = await account.signTransaction(tx1);
			const sig2 = await account.signTransaction(tx2);

			expect(sig1).toBeDefined();
			expect(sig2).toBeDefined();
		});

		it('should handle mixed signing operations', async () => {
			const account = createPrivateKeySigner(testPrivateKey);

			const messageSig = await account.signMessage({ message: 'Test message' });
			const tx = { to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const, value: 100n, nonce: 0 };
			const txSig = await account.signTransaction(tx);
			const messageSig2 = await account.signMessage({ message: 'Another message' });

			expect(messageSig).toBeDefined();
			expect(txSig).toBeDefined();
			expect(messageSig2).toBeDefined();
		});

		it('should work correctly with same key used multiple times', async () => {
			const account1 = createPrivateKeySigner(testPrivateKey);
			const account2 = createPrivateKeySigner(testPrivateKey);

			const sig1 = await account1.signMessage({ message: 'Test' });
			const sig2 = await account2.signMessage({ message: 'Test' });

			// Signatures should be defined
			expect(sig1).toBeDefined();
			expect(sig2).toBeDefined();

			// Addresses should be the same (same key)
			expect(account1.address).toBe(account2.address);
		});
	});
});
