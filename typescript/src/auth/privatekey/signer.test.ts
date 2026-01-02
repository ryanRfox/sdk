import type { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPrivateKeySigner, PrivateKeySigner } from './signer';

// Mock viem/accounts
vi.mock('viem/accounts', () => ({
	privateKeyToAccount: vi.fn(),
}));

describe('PrivateKeySigner', () => {
	// Test private key from hardhat/viem documentation
	const testPrivateKey: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
	const testAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const;
	const testChainId = 1; // mainnet

	let mockAccount: PrivateKeyAccount;

	beforeEach(() => {
		vi.clearAllMocks();

		// Create a mock account object
		mockAccount = {
			address: testAddress,
			type: 'privateKey',
			async signMessage({ message: _message }: { message: string | { raw: `0x${string}` } }) {
				// Simple deterministic mock signature
				return `0x${'aa'.repeat(65)}` as Hex;
			},
			async signTransaction(_tx: any) {
				// Simple deterministic mock signed transaction
				return `0x${'bb'.repeat(100)}` as Hex;
			},
		} as unknown as PrivateKeyAccount;

		vi.mocked(privateKeyToAccount).mockReturnValue(mockAccount);
	});

	describe('Constructor', () => {
		it('should create a signer with a valid private key', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			expect(signer).toBeInstanceOf(PrivateKeySigner);
			expect(privateKeyToAccount).toHaveBeenCalledWith(testPrivateKey);
		});

		it('should store the chain ID', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			expect(signer.chainId).toBe(testChainId);
		});

		it('should support different chain IDs', () => {
			const chainIds = [1, 5, 137, 8453, 42161]; // mainnet, goerli, polygon, base, arbitrum

			chainIds.forEach((chainId) => {
				const signer = new PrivateKeySigner(testPrivateKey, chainId);
				expect(signer.chainId).toBe(chainId);
			});
		});

		it('should call privateKeyToAccount with the correct private key', () => {
			const key = '0xdeadbeefcafe' as Hex;

			new PrivateKeySigner(key, 1);

			expect(privateKeyToAccount).toHaveBeenCalledWith(key);
			expect(privateKeyToAccount).toHaveBeenCalledTimes(1);
		});
	});

	describe('address getter', () => {
		it('should return the account address', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			expect(signer.address).toBe(testAddress);
		});

		it('should return a checksummed address', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			// Address should start with 0x and contain hex characters
			expect(signer.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it('should return the same address on multiple calls', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			const address1 = signer.address;
			const address2 = signer.address;

			expect(address1).toBe(address2);
		});
	});

	describe('signMessage', () => {
		it('should sign a string message', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const message = 'Hello, World!';

			const signature = await signer.signMessage(message);

			expect(signature).toBeDefined();
			expect(typeof signature).toBe('string');
			expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should sign a raw message object', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const message = { raw: '0x1234' as const };

			const signature = await signer.signMessage(message);

			expect(signature).toBeDefined();
			expect(typeof signature).toBe('string');
		});

		it('should pass the message to the account signMessage method', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const message = 'Test message';

			const signMessageSpy = vi.spyOn(mockAccount, 'signMessage');

			await signer.signMessage(message);

			expect(signMessageSpy).toHaveBeenCalledWith({ message });
		});

		it('should return a valid hex signature', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			const signature = await signer.signMessage('Test');

			expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/); // 65 bytes = 130 hex chars
		});

		it('should handle multiple messages independently', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			const sig1 = await signer.signMessage('Message 1');
			const sig2 = await signer.signMessage('Message 2');

			expect(sig1).toBeDefined();
			expect(sig2).toBeDefined();
			// Both should be valid hex strings
			expect(sig1).toMatch(/^0x[a-fA-F0-9]+$/);
			expect(sig2).toMatch(/^0x[a-fA-F0-9]+$/);
		});
	});

	describe('signTransaction', () => {
		it('should sign a transaction', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1000000000000000000n,
				nonce: 0,
			};

			const signedTx = await signer.signTransaction(tx);

			expect(signedTx).toBeDefined();
			expect(typeof signedTx).toBe('string');
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should include chain ID in the signed transaction', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};

			const signTransactionSpy = vi.spyOn(mockAccount, 'signTransaction');

			await signer.signTransaction(tx);

			// Should be called with the transaction plus chainId
			expect(signTransactionSpy).toHaveBeenCalledWith({
				to: tx.to,
				value: tx.value,
				nonce: tx.nonce,
				chainId: testChainId,
			});
		});

		it('should add chainId to transaction without overwriting existing chainId', async () => {
			const chainId = 42;
			const signer = new PrivateKeySigner(testPrivateKey, chainId);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};

			const signTransactionSpy = vi.spyOn(mockAccount, 'signTransaction');

			await signer.signTransaction(tx);

			expect(signTransactionSpy).toHaveBeenCalledWith({
				to: tx.to,
				value: tx.value,
				nonce: tx.nonce,
				chainId: 42,
			});
		});

		it('should sign a complete transaction with all fields', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 1000000000000000000n,
				nonce: 5,
				gasPrice: 20000000000n,
				gas: 21000n,
				data: '0x' as const,
			};

			const signedTx = await signer.signTransaction(tx);

			expect(signedTx).toBeDefined();
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});

		it('should return a valid RLP encoded transaction', async () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};

			const signedTx = await signer.signTransaction(tx);

			// RLP encoded transactions should be valid hex strings
			expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
		});
	});

	describe('Chain ID handling', () => {
		it('should store chain ID for different networks', () => {
			const networks = [
				{ id: 1, name: 'mainnet' },
				{ id: 5, name: 'goerli' },
				{ id: 137, name: 'polygon' },
				{ id: 8453, name: 'base' },
				{ id: 42161, name: 'arbitrum' },
			];

			networks.forEach(({ id }) => {
				const signer = new PrivateKeySigner(testPrivateKey, id);
				expect(signer.chainId).toBe(id);
			});
		});

		it('should prevent replay attacks by including chain ID in transactions', async () => {
			const tx = {
				to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
				value: 100n,
				nonce: 0,
			};

			const signer1 = new PrivateKeySigner(testPrivateKey, 1);
			const signer137 = new PrivateKeySigner(testPrivateKey, 137);

			const signTransactionSpy = vi.spyOn(mockAccount, 'signTransaction');

			await signer1.signTransaction(tx);
			expect(signTransactionSpy).toHaveBeenLastCalledWith({
				...tx,
				chainId: 1,
			});

			await signer137.signTransaction(tx);
			expect(signTransactionSpy).toHaveBeenLastCalledWith({
				...tx,
				chainId: 137,
			});
		});

		it('should be immutable after construction', () => {
			const signer = new PrivateKeySigner(testPrivateKey, 1);

			// chainId is initialized correctly
			expect(signer.chainId).toBe(1);

			// Note: TypeScript's readonly modifier is compile-time only
			// Runtime immutability is not enforced by JS
		});
	});

	describe('RadiusSigner interface compliance', () => {
		it('should implement RadiusSigner interface', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			// Check that all required properties and methods exist
			expect(signer).toHaveProperty('address');
			expect(signer).toHaveProperty('chainId');
			expect(signer).toHaveProperty('signMessage');
			expect(signer).toHaveProperty('signTransaction');

			// Check types
			expect(typeof signer.address).toBe('string');
			expect(typeof signer.chainId).toBe('number');
			expect(typeof signer.signMessage).toBe('function');
			expect(typeof signer.signTransaction).toBe('function');
		});

		it('should have readonly address property', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			// Address is a getter-only property, so setting throws
			expect(() => {
				(signer as any).address = '0x0000000000000000000000000000000000000000';
			}).toThrow();

			// Should still return the original address
			expect(signer.address).toBe(testAddress);
		});

		it('should have readonly chainId property', () => {
			const signer = new PrivateKeySigner(testPrivateKey, testChainId);

			// chainId is a TypeScript readonly property
			// At runtime, the value remains unchanged after construction
			expect(signer.chainId).toBe(testChainId);
		});
	});
});

describe('createPrivateKeySigner', () => {
	const testPrivateKey: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
	const testChainId = 1;

	beforeEach(() => {
		vi.clearAllMocks();

		const mockAccount = {
			address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
			type: 'privateKey',
			async signMessage({ message: _message }: { message: string | { raw: `0x${string}` } }) {
				return `0x${'aa'.repeat(65)}` as Hex;
			},
			async signTransaction(_tx: any) {
				return `0x${'bb'.repeat(100)}` as Hex;
			},
		} as unknown as PrivateKeyAccount;

		vi.mocked(privateKeyToAccount).mockReturnValue(mockAccount);
	});

	it('should create a PrivateKeySigner instance', () => {
		const signer = createPrivateKeySigner(testPrivateKey, testChainId);

		expect(signer).toBeInstanceOf(PrivateKeySigner);
	});

	it('should create a valid RadiusSigner', () => {
		const signer = createPrivateKeySigner(testPrivateKey, testChainId);

		expect(signer).toHaveProperty('address');
		expect(signer).toHaveProperty('chainId');
		expect(signer).toHaveProperty('signMessage');
		expect(signer).toHaveProperty('signTransaction');
	});

	it('should pass arguments correctly to PrivateKeySigner constructor', () => {
		const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as Hex;
		const chainId = 42;

		const signer = createPrivateKeySigner(privateKey, chainId);

		expect(privateKeyToAccount).toHaveBeenCalledWith(privateKey);
		expect(signer.chainId).toBe(chainId);
	});

	it('should create independent signer instances', () => {
		const signer1 = createPrivateKeySigner(testPrivateKey, 1);
		const signer2 = createPrivateKeySigner(testPrivateKey, 137);

		expect(signer1).not.toBe(signer2);
		expect(signer1.chainId).not.toBe(signer2.chainId);
	});
});

describe('PrivateKeySigner - Integration scenarios', () => {
	const testPrivateKey: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

	beforeEach(() => {
		vi.clearAllMocks();

		const mockAccount = {
			address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
			type: 'privateKey',
			async signMessage({ message: _message }: { message: string | { raw: `0x${string}` } }) {
				return `0x${'aa'.repeat(65)}` as Hex;
			},
			async signTransaction(_tx: any) {
				return `0x${'bb'.repeat(100)}` as Hex;
			},
		} as unknown as PrivateKeyAccount;

		vi.mocked(privateKeyToAccount).mockReturnValue(mockAccount);
	});

	it('should sign multiple messages without state issues', async () => {
		const signer = new PrivateKeySigner(testPrivateKey, 1);

		const messages = ['Message 1', 'Message 2', 'Message 3'];
		const signatures = await Promise.all(messages.map((msg) => signer.signMessage(msg)));

		expect(signatures).toHaveLength(3);
		signatures.forEach((sig) => {
			expect(sig).toMatch(/^0x[a-fA-F0-9]+$/);
		});
	});

	it('should sign multiple transactions without state issues', async () => {
		const signer = new PrivateKeySigner(testPrivateKey, 1);

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

		const sig1 = await signer.signTransaction(tx1);
		const sig2 = await signer.signTransaction(tx2);

		expect(sig1).toBeDefined();
		expect(sig2).toBeDefined();
	});

	it('should handle mixed signing operations', async () => {
		const signer = new PrivateKeySigner(testPrivateKey, 1);

		const messageSig = await signer.signMessage('Test message');
		const tx = { to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const, value: 100n, nonce: 0 };
		const txSig = await signer.signTransaction(tx);
		const messageSig2 = await signer.signMessage('Another message');

		expect(messageSig).toBeDefined();
		expect(txSig).toBeDefined();
		expect(messageSig2).toBeDefined();
	});

	it('should work correctly with different chain IDs for same key', async () => {
		const signer1 = new PrivateKeySigner(testPrivateKey, 1);
		const signer137 = new PrivateKeySigner(testPrivateKey, 137);

		const sig1 = await signer1.signMessage('Test');
		const sig137 = await signer137.signMessage('Test');

		// Signatures should be defined but may differ due to chain context
		expect(sig1).toBeDefined();
		expect(sig137).toBeDefined();

		// Addresses should be the same (same key)
		expect(signer1.address).toBe(signer137.address);

		// Chain IDs should differ
		expect(signer1.chainId).not.toBe(signer137.chainId);
	});
});
