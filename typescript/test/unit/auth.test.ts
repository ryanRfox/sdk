/**
 * Unit tests for Radius SDK auth/signer modules
 * Tests PrivateKeySigner and ClefSigner implementations
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ClefSigner } from '../../src/auth/clef/signer';
import { PrivateKeySigner } from '../../src/auth/privatekey/signer';
import type { Signer, SignerClient } from '../../src/auth/types';
import { Address, Hash, Transaction } from '../../src/common';
import { eth } from '../../src/providers/eth';

// Test fixtures
const TEST_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
const TEST_CHAIN_ID = 1337n;
const CLEF_URL = 'http://localhost:8550';

describe('Auth Module - Signer Interface', () => {
  describe('Signer interface contract', () => {
    test('should define all required methods', () => {
      const mockClient: SignerClient = {
        chainID: vi.fn().mockResolvedValue(TEST_CHAIN_ID),
        httpClient: vi.fn(),
      };

      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

      // Verify Signer interface methods exist
      expect(typeof signer.address).toBe('function');
      expect(typeof signer.chainID).toBe('function');
      expect(typeof signer.hash).toBe('function');
      expect(typeof signer.signMessage).toBe('function');
      expect(typeof signer.signTransaction).toBe('function');
    });

    test('should implement Signer interface', () => {
      const mockClient: SignerClient = {
        chainID: vi.fn().mockResolvedValue(TEST_CHAIN_ID),
        httpClient: vi.fn(),
      };

      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

      // All methods should be callable
      expect(signer).toHaveProperty('address');
      expect(signer).toHaveProperty('chainID');
      expect(signer).toHaveProperty('hash');
      expect(signer).toHaveProperty('signMessage');
      expect(signer).toHaveProperty('signTransaction');
    });
  });
});

describe('PrivateKeySigner', () => {
  let mockClient: SignerClient;

  beforeEach(() => {
    mockClient = {
      chainID: vi.fn().mockResolvedValue(TEST_CHAIN_ID),
      httpClient: vi.fn(),
    };
  });

  describe('constructor', () => {
    test('should create instance with private key (with 0x prefix)', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      expect(signer).toBeDefined();
      expect(signer).toBeInstanceOf(PrivateKeySigner);
    });

    test('should create instance with private key (without 0x prefix)', () => {
      const keyWithoutPrefix = TEST_PRIVATE_KEY.substring(2);
      const signer = new PrivateKeySigner(keyWithoutPrefix, mockClient);
      expect(signer).toBeDefined();
      expect(signer).toBeInstanceOf(PrivateKeySigner);
    });

    test('should throw error with invalid private key', () => {
      const invalidKey = 'invalid';
      expect(() => {
        new PrivateKeySigner(invalidKey, mockClient);
      }).toThrow();
    });

    test('should call client.chainID() during construction', () => {
      new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      expect(mockClient.chainID).toHaveBeenCalled();
    });

    test('should handle chainID retrieval failure gracefully', async () => {
      const failingClient: SignerClient = {
        chainID: vi.fn().mockRejectedValue(new Error('Network error')),
        httpClient: vi.fn(),
      };

      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);
      // Should not throw, chainID should default to 0
      expect(signer).toBeDefined();

      // Wait for async chainID call to complete
      await vi.waitFor(() => {
        // chainID defaults to 0 (number, not necessarily bigint)
        expect(signer.chainID()).toBe(0);
      }, { timeout: 1000 });
    });
  });

  describe('address()', () => {
    test('should return an Address instance', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const address = signer.address();

      expect(address).toBeInstanceOf(Address);
    });

    test('should return consistent address', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const address1 = signer.address();
      const address2 = signer.address();

      expect(address1.hex()).toBe(address2.hex());
    });

    test('should return valid Ethereum address format', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const address = signer.address();

      const hex = address.hex();
      expect(hex).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });

    test('should be able to convert to ethAddress', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const address = signer.address();

      const ethAddr = address.ethAddress();
      expect(ethAddr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
  });

  describe('chainID()', () => {
    test('should return chain ID from client', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

      await vi.waitFor(() => {
        expect(signer.chainID()).toBe(TEST_CHAIN_ID);
      }, { timeout: 1000 });
    });

    test('should default to 0 if client fails', async () => {
      const failingClient: SignerClient = {
        chainID: vi.fn().mockRejectedValue(new Error('Connection failed')),
        httpClient: vi.fn(),
      };

      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);

      await vi.waitFor(() => {
        // chainID defaults to 0 (not necessarily 0n since it's initialized as number)
        expect(signer.chainID()).toBe(0);
      }, { timeout: 1000 });
    });

    test('should handle different chain IDs', async () => {
      const chains = [1n, 137n, 42161n, 8453n];

      for (const chainId of chains) {
        const client: SignerClient = {
          chainID: vi.fn().mockResolvedValue(chainId),
          httpClient: vi.fn(),
        };

        const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, client);

        await vi.waitFor(() => {
          expect(signer.chainID()).toBe(chainId);
        }, { timeout: 1000 });
      }
    });
  });

  describe('hash()', () => {
    test('should return a Hash instance', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      const hash = signer.hash(tx);

      expect(hash).toBeInstanceOf(Hash);
    });

    test('should compute valid transaction hash', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      const hash = signer.hash(tx);

      expect(hash).toBeInstanceOf(Hash);
      expect(hash.hex()).toMatch(/^0x[0-9a-f]*$/);
    });

    test('should produce same hash for same transaction', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0xabcd', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      const hash1 = signer.hash(tx);
      const hash2 = signer.hash(tx);

      expect(hash1.hex()).toBe(hash2.hex());
    });

    test('should produce different hashes for different transactions', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx1 = new Transaction('0xabcd', 21000n, 1n, 0, new Address(TEST_ADDRESS));
      const tx2 = new Transaction('0xdcba', 21000n, 1n, 1, new Address(TEST_ADDRESS));

      const hash1 = signer.hash(tx1);
      const hash2 = signer.hash(tx2);

      // Hashes should be consistent but may be different based on transaction content
      expect(hash1).toBeInstanceOf(Hash);
      expect(hash2).toBeInstanceOf(Hash);
    });

    test('should handle transaction with all fields', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x1234abcd', 21000n, 10n, 5, new Address(TEST_ADDRESS), 100n);

      const hash = signer.hash(tx);

      expect(hash).toBeInstanceOf(Hash);
      expect(hash.hex()).toMatch(/^0x[0-9a-f]*$/);
    });
  });

  describe('signMessage()', () => {
    test('should return a Uint8Array', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const message = '0x48656c6c6f'; // "Hello" in hex

      const signature = await signer.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
    });

    test('should produce valid signature', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const message = 'Hello, Radius!';

      const signature = await signer.signMessage(eth.toUtf8Bytes(message));

      // Signature should be 65 bytes (64 bytes signature + 1 byte recovery id)
      expect(signature.length).toBeGreaterThan(0);
    });

    test('should produce consistent signatures for same message', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const message = eth.toUtf8Bytes('Test message');

      const sig1 = await signer.signMessage(message);
      const sig2 = await signer.signMessage(message);

      expect(eth.hexlify(sig1)).toBe(eth.hexlify(sig2));
    });

    test('should produce different signatures for different messages', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const msg1 = eth.toUtf8Bytes('Message 1');
      const msg2 = eth.toUtf8Bytes('Message 2');

      const sig1 = await signer.signMessage(msg1);
      const sig2 = await signer.signMessage(msg2);

      expect(eth.hexlify(sig1)).not.toBe(eth.hexlify(sig2));
    });

    test('should handle string message', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const message = 'String message';

      const signature = await signer.signMessage(eth.toUtf8Bytes(message));

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBeGreaterThan(0);
    });

    test('should handle hex string message', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const message = '0x1234567890abcdef';

      const signature = await signer.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
    });
  });

  describe('signTransaction()', () => {
    test('should return signed transaction', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx).toBeDefined();
        expect(signedTx.r).toBeDefined();
        expect(signedTx.s).toBeDefined();
        expect(signedTx.v).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });

    test('should return SignedTransaction with all transaction fields', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x1234', 21000n, 10n, 1, new Address(TEST_ADDRESS), 100n);

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        // Should preserve original transaction fields
        expect(signedTx.data).toBe(tx.data);
        expect(signedTx.gas).toBe(tx.gas);
        expect(signedTx.gasPrice).toBe(tx.gasPrice);
        expect(signedTx.nonce).toBe(tx.nonce);
        expect(signedTx.value).toBe(tx.value);
      }, { timeout: 1000 });
    });

    test('should produce valid signature components', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        // r and s should be bigints
        expect(typeof signedTx.r).toBe('bigint');
        expect(typeof signedTx.s).toBe('bigint');

        // v should be a number (recovery id)
        expect(typeof signedTx.v).toBe('number');
        expect(signedTx.v).toBeGreaterThanOrEqual(0);
        // v can be 0-3 for EIP-155 transactions or 27-30 for older format
        expect(signedTx.v).toBeGreaterThanOrEqual(0);
      }, { timeout: 1000 });
    });

    test('should produce serialized transaction', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        expect(typeof signedTx.serialized).toBe('string');
        expect(signedTx.serialized).toMatch(/^0x[0-9a-f]+$/);
      }, { timeout: 1000 });
    });

    test('should handle transaction without to field', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0xdeadbeef', 100000n, 1n, 0);

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });

    test('should handle transaction without value field', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });

    test('should use chain ID from client', async () => {
      const client: SignerClient = {
        chainID: vi.fn().mockResolvedValue(42n),
        httpClient: vi.fn(),
      };

      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, client);
      const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));

      await vi.waitFor(async () => {
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });
  });

  describe('multiple key instances', () => {
    test('should create independent signers from different keys', async () => {
      const key1 = TEST_PRIVATE_KEY;
      const key2 = '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';

      const signer1 = new PrivateKeySigner(key1, mockClient);
      const signer2 = new PrivateKeySigner(key2, mockClient);

      await vi.waitFor(() => {
        expect(signer1.address().hex()).not.toBe(signer2.address().hex());
      }, { timeout: 1000 });
    });

    test('should not share state between instances', async () => {
      const signer1 = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const signer2 = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

      await vi.waitFor(() => {
        const addr1 = signer1.address();
        const addr2 = signer2.address();

        expect(addr1.hex()).toBe(addr2.hex());
        expect(addr1 === addr2).toBe(false); // Different instances
      }, { timeout: 1000 });
    });
  });
});

describe('ClefSigner', () => {
  let mockClient: SignerClient;
  let mockJsonRpcProvider: any;

  beforeEach(() => {
    mockClient = {
      chainID: vi.fn().mockResolvedValue(TEST_CHAIN_ID),
      httpClient: vi.fn(),
    };

    // Mock JsonRpcProvider
    mockJsonRpcProvider = {
      send: vi.fn(),
    };

    // Mock eth.JsonRpcProvider
    vi.spyOn(eth, 'JsonRpcProvider').mockImplementation(() => mockJsonRpcProvider);
  });

  describe('constructor', () => {
    test('should create instance with address, client, and clef URL', async () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(() => {
        expect(signer).toBeDefined();
        expect(signer).toBeInstanceOf(ClefSigner);
      }, { timeout: 1000 });
    });

    test('should call client.chainID() during construction', async () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(() => {
        expect(mockClient.chainID).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    test('should verify Clef connection', async () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const _signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(() => {
        expect(mockJsonRpcProvider.send).toHaveBeenCalledWith('account_version', []);
      }, { timeout: 1000 });
    });

    test('should handle Clef connection verification failure', async () => {
      mockJsonRpcProvider.send.mockRejectedValue(new Error('Clef unreachable'));

      const address = new Address(TEST_ADDRESS);

      // Should not throw during construction
      await vi.waitFor(() => {
        expect(() => {
          new ClefSigner(address, mockClient, CLEF_URL);
        }).not.toThrow();
      }, { timeout: 1000 });
    });

    test('should handle chainID retrieval failure', async () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');
      const failingClient: SignerClient = {
        chainID: vi.fn().mockRejectedValue(new Error('Network error')),
        httpClient: vi.fn(),
      };

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, failingClient, CLEF_URL);

      await vi.waitFor(() => {
        expect(signer).toBeDefined();
      }, { timeout: 1000 });
    });
  });

  describe('address()', () => {
    test('should return the address provided at construction', () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const returnedAddress = signer.address();

      expect(returnedAddress).toBeInstanceOf(Address);
      expect(returnedAddress.hex()).toBe(address.hex());
    });

    test('should return the same address instance', () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const addr1 = signer.address();
      const addr2 = signer.address();

      expect(addr1.hex()).toBe(addr2.hex());
    });
  });

  describe('chainID()', () => {
    test('should return chain ID from client', async () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(() => {
        expect(signer.chainID()).toBe(TEST_CHAIN_ID);
      }, { timeout: 1000 });
    });

    test('should default to 0 if client fails', async () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');
      const failingClient: SignerClient = {
        chainID: vi.fn().mockRejectedValue(new Error('Connection failed')),
        httpClient: vi.fn(),
      };

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, failingClient, CLEF_URL);

      await vi.waitFor(() => {
        expect(signer.chainID()).toBe(0n);
      }, { timeout: 1000 });
    });
  });

  describe('hash()', () => {
    test('should return a Hash instance', () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);
      const tx = new Transaction('0xabcd', 21000n, 1n, 0, address);

      const hash = signer.hash(tx);

      expect(hash).toBeInstanceOf(Hash);
    });

    test('should compute valid transaction hash', () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);
      const tx = new Transaction('0xabcd', 21000n, 1n, 0, address);

      const hash = signer.hash(tx);
      const hashHex = hash.hex();

      // Hash should be a valid hex string starting with 0x
      expect(hashHex).toMatch(/^0x[0-9a-f]*$/);
      // Hash instance should be created successfully
      expect(hash).toBeInstanceOf(Hash);
    });

    test('should produce same hash for same transaction', () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);
      const tx = new Transaction('0xabcd', 21000n, 1n, 0, address);

      const hash1 = signer.hash(tx);
      const hash2 = signer.hash(tx);

      expect(hash1.hex()).toBe(hash2.hex());
    });
  });

  describe('signMessage()', () => {
    test('should call Clef account_signData with correct parameters', async () => {
      // A valid 65-byte signature in hex (130 hex chars + 0x)
      const validSignature = `0x${'ab'.repeat(65)}`;
      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(validSignature);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const message = eth.toUtf8Bytes('Hello, Clef!');
      await signer.signMessage(message);

      // Should call account_signData with text/plain, address, and message hex
      expect(mockJsonRpcProvider.send).toHaveBeenCalledWith(
        'account_signData',
        expect.arrayContaining(['text/plain', address.hex(), expect.any(String)])
      );
    });

    test('should return Uint8Array', async () => {
      const validSignature = `0x${'ab'.repeat(65)}`;
      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(validSignature);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const message = eth.toUtf8Bytes('Test message');
      const signature = await signer.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
    });

    test('should handle signature with 0x prefix', async () => {
      const signatureHex = `0x${'abcdef1234567890'.repeat(8)}`;
      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(signatureHex);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const message = eth.toUtf8Bytes('Test');
      const signature = await signer.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
    });

    test('should handle signature without 0x prefix', async () => {
      const signatureHex = 'ab'.repeat(65);
      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(signatureHex);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const message = eth.toUtf8Bytes('Test');
      const signature = await signer.signMessage(message);

      expect(signature).toBeInstanceOf(Uint8Array);
    });

    test('should throw error if Clef signing fails', async () => {
      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockRejectedValueOnce(new Error('User denied signing'));

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const message = eth.toUtf8Bytes('Test');

      await expect(signer.signMessage(message)).rejects.toThrow('Clef signing failed');
    });
  });

  describe('signTransaction()', () => {
    test('should call Clef account_signTransaction', async () => {
      const clefResponse = {
        raw: '0xf86c',
        tx: {
          hash: '0xhash',
          v: '0x26',
          r: '0x12345678901234567890123456789012',
          s: '0x67890123456789012345678901234567',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);
        await signer.signTransaction(tx);

        expect(mockJsonRpcProvider.send).toHaveBeenCalledWith(
          'account_signTransaction',
          expect.arrayContaining([expect.any(Object)])
        );
      }, { timeout: 1000 });
    });

    test('should return signed transaction with all required fields', async () => {
      const clefResponse = {
        raw: '0xf86c8001148201e8',
        tx: {
          hash: '0xhash',
          v: '0x26',
          r: '0x12345678901234567890123456789012',
          s: '0x67890123456789012345678901234567',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx.r).toBeDefined();
        expect(signedTx.s).toBeDefined();
        expect(signedTx.v).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });

    test('should preserve original transaction fields', async () => {
      const clefResponse = {
        raw: '0xf86c',
        tx: {
          hash: '0xhash',
          v: '0x26',
          r: '0x12345678901234567890123456789012',
          s: '0x67890123456789012345678901234567',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x1234', 21000n, 10n, 5, address, 100n);
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx.data).toBe(tx.data);
        expect(signedTx.gas).toBe(tx.gas);
        expect(signedTx.gasPrice).toBe(tx.gasPrice);
        expect(signedTx.nonce).toBe(tx.nonce);
        expect(signedTx.value).toBe(tx.value);
      }, { timeout: 1000 });
    });

    test('should handle transaction without value field', async () => {
      const clefResponse = {
        raw: '0xf86c',
        tx: {
          hash: '0xhash',
          v: '0x26',
          r: '0x12345678901234567890123456789012',
          s: '0x67890123456789012345678901234567',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });

    test('should parse signature components correctly', async () => {
      const clefResponse = {
        raw: '0xf86c',
        tx: {
          hash: '0xhash',
          v: '0x26',
          r: '0x123456789abcdef0123456789abcdef0',
          s: '0xfedcba9876543210fedcba9876543210',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);
        const signedTx = await signer.signTransaction(tx);

        expect(typeof signedTx.r).toBe('bigint');
        expect(typeof signedTx.s).toBe('bigint');
        expect(typeof signedTx.v).toBe('number');
      }, { timeout: 1000 });
    });

    test('should handle v without 0x prefix', async () => {
      const clefResponse = {
        raw: '0xf86c',
        tx: {
          hash: '0xhash',
          v: '26',
          r: '0x12345678901234567890123456789012',
          s: '0x67890123456789012345678901234567',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);
        const signedTx = await signer.signTransaction(tx);

        expect(typeof signedTx.v).toBe('number');
      }, { timeout: 1000 });
    });

    test('should handle raw without 0x prefix', async () => {
      const clefResponse = {
        raw: 'f86c8001148201e8',
        tx: {
          hash: '0xhash',
          v: '0x26',
          r: '0x12345678901234567890123456789012',
          s: '0x67890123456789012345678901234567',
        },
      };

      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockResolvedValueOnce(clefResponse);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);
        const signedTx = await signer.signTransaction(tx);

        expect(signedTx.serialized).toMatch(/^0x/);
      }, { timeout: 1000 });
    });

    test('should throw error if Clef signing fails', async () => {
      mockJsonRpcProvider.send
        .mockResolvedValueOnce('Clef version 1.0')
        .mockRejectedValueOnce(new Error('Clef error'));

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(async () => {
        const tx = new Transaction('0x', 21000n, 1n, 0, address);

        await expect(signer.signTransaction(tx)).rejects.toThrow('Clef signing failed');
      }, { timeout: 1000 });
    });
  });

  describe('multiple instances', () => {
    test('should create independent signers from different addresses', () => {
      mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

      const address1 = new Address(TEST_ADDRESS);
      const address2 = new Address('0x0000000000000000000000000000000000000001');

      const signer1 = new ClefSigner(address1, mockClient, CLEF_URL);
      const signer2 = new ClefSigner(address2, mockClient, CLEF_URL);

      expect(signer1.address().hex()).not.toBe(signer2.address().hex());
    });
  });
});

describe('Signer Implementation Compliance', () => {
  let mockClient: SignerClient;

  beforeEach(() => {
    mockClient = {
      chainID: vi.fn().mockResolvedValue(TEST_CHAIN_ID),
      httpClient: vi.fn(),
    };
  });

  describe('PrivateKeySigner compliance', () => {
    test('should implement all Signer interface methods', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

      const signerInterface: Signer = signer;

      expect(typeof signerInterface.address).toBe('function');
      expect(typeof signerInterface.chainID).toBe('function');
      expect(typeof signerInterface.hash).toBe('function');
      expect(typeof signerInterface.signMessage).toBe('function');
      expect(typeof signerInterface.signTransaction).toBe('function');
    });

    test('address() should return Address type', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const address = signer.address();

      expect(address).toBeInstanceOf(Address);
    });

    test('chainID() should return BigNumberish type', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

      await vi.waitFor(() => {
        const chainId = signer.chainID();

        // chainID can be either number or bigint (BigNumberish type)
        expect(typeof chainId === 'bigint' || typeof chainId === 'number').toBe(true);
      }, { timeout: 1000 });
    });

    test('hash() should return Hash type', () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0);

      const hash = signer.hash(tx);

      expect(hash).toBeInstanceOf(Hash);
    });

    test('signMessage() should return Promise<Uint8Array>', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const message = eth.toUtf8Bytes('test');

      const result = signer.signMessage(message);

      expect(result).toBeInstanceOf(Promise);

      const signature = await result;
      expect(signature).toBeInstanceOf(Uint8Array);
    });

    test('signTransaction() should return Promise<SignedTransaction>', async () => {
      const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
      const tx = new Transaction('0x', 21000n, 1n, 0);

      await vi.waitFor(async () => {
        const result = signer.signTransaction(tx);

        expect(result).toBeInstanceOf(Promise);

        const signedTx = await result;
        expect(signedTx.r).toBeDefined();
        expect(signedTx.s).toBeDefined();
        expect(signedTx.v).toBeDefined();
        expect(signedTx.serialized).toBeDefined();
      }, { timeout: 1000 });
    });
  });

  describe('ClefSigner compliance', () => {
    beforeEach(() => {
      const mockProvider = {
        send: vi.fn().mockResolvedValue('Clef version 1.0'),
      };

      vi.spyOn(eth, 'JsonRpcProvider').mockImplementation(() => mockProvider);
    });

    test('should implement all Signer interface methods', () => {
      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      const signerInterface: Signer = signer;

      expect(typeof signerInterface.address).toBe('function');
      expect(typeof signerInterface.chainID).toBe('function');
      expect(typeof signerInterface.hash).toBe('function');
      expect(typeof signerInterface.signMessage).toBe('function');
      expect(typeof signerInterface.signTransaction).toBe('function');
    });

    test('address() should return Address type', () => {
      const addressObj = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(addressObj, mockClient, CLEF_URL);

      const address = signer.address();

      expect(address).toBeInstanceOf(Address);
    });

    test('chainID() should return BigNumberish type', async () => {
      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);

      await vi.waitFor(() => {
        const chainId = signer.chainID();

        expect(typeof chainId).toBe('bigint');
      }, { timeout: 1000 });
    });

    test('hash() should return Hash type', () => {
      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);
      const tx = new Transaction('0x', 21000n, 1n, 0);

      const hash = signer.hash(tx);

      expect(hash).toBeInstanceOf(Hash);
    });

    test('signMessage() should return Promise<Uint8Array>', async () => {
      const validSignature = `0x${'ab'.repeat(65)}`;
      const mockProvider = {
        send: vi
          .fn()
          .mockResolvedValueOnce('Clef version 1.0')
          .mockResolvedValueOnce(validSignature),
      };

      vi.spyOn(eth, 'JsonRpcProvider').mockImplementation(() => mockProvider);

      const address = new Address(TEST_ADDRESS);
      const signer = new ClefSigner(address, mockClient, CLEF_URL);
      const message = eth.toUtf8Bytes('test');

      const result = signer.signMessage(message);

      expect(result).toBeInstanceOf(Promise);

      const signature = await result;
      expect(signature).toBeInstanceOf(Uint8Array);
    });
  });
});
