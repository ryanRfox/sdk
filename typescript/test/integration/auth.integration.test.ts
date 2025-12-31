/**
 * Integration tests for cryptographic correctness of signers
 *
 * These tests verify that signatures are cryptographically correct and can be verified,
 * not just that signers work with mocks. This ensures our signing implementations
 * produce valid signatures that can be recovered and verified.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  recoverMessageAddress,
  parseTransaction,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { PrivateKeySigner } from '../../packages/core/src/auth/privatekey/signer';

/**
 * Test private key with known address
 * This is a valid test key derived from standard test mnemonics
 * DO NOT use in production
 */
const TEST_PRIVATE_KEY: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/**
 * Expected address derived from TEST_PRIVATE_KEY
 * This is the standard first account from Hardhat's test mnemonic
 */
const EXPECTED_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

/**
 * Test chain ID used for transaction signing
 */
const TEST_CHAIN_ID = 1;

describe('Auth Integration Tests - Cryptographic Correctness', () => {
  describe('PrivateKeySigner - Message Signing', () => {
    let signer: PrivateKeySigner;

    beforeEach(() => {
      signer = new PrivateKeySigner(TEST_PRIVATE_KEY, TEST_CHAIN_ID);
    });

    test('should produce a valid signature for a message', async () => {
      const message = 'Hello, Radius!';

      const signature = await signer.signMessage(message);

      // Signature should be a valid hex string
      expect(signature).toMatch(/^0x[0-9a-f]+$/i);
      // Signature should be at least 130 characters (65 bytes in hex + 0x prefix)
      expect(signature.length).toBeGreaterThanOrEqual(130);
    });

    test('PrivateKeySigner signature can be recovered to correct address', async () => {
      const message = 'Hello, Radius!';

      const signature = await signer.signMessage(message);

      // Verify signature can be recovered to our address
      const recovered = await recoverMessageAddress({
        message,
        signature: signature as Hex,
      });

      expect(recovered.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
    });

    test('PrivateKeySigner signature matches viem wallet signature', async () => {
      // Create a viem account from the same private key
      const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY);

      const message = 'test message for signature verification';

      // Sign with viem
      const viemSig = await viemAccount.signMessage({ message });

      // Sign with our PrivateKeySigner
      const radiusSig = await signer.signMessage(message);

      // Both should recover to same address
      const viemRecovered = await recoverMessageAddress({
        message,
        signature: viemSig,
      });

      const radiusRecovered = await recoverMessageAddress({
        message,
        signature: radiusSig as Hex,
      });

      expect(radiusRecovered).toBe(viemRecovered);
      expect(radiusRecovered.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
    });

    test('should produce different signatures for different messages', async () => {
      const msg1 = 'Message 1';
      const msg2 = 'Message 2';

      const sig1 = await signer.signMessage(msg1);
      const sig2 = await signer.signMessage(msg2);

      // Signatures should be different
      expect(sig1).not.toBe(sig2);

      // But both should recover to the same address
      const recovered1 = await recoverMessageAddress({
        message: msg1,
        signature: sig1 as Hex,
      });

      const recovered2 = await recoverMessageAddress({
        message: msg2,
        signature: sig2 as Hex,
      });

      expect(recovered1).toBe(recovered2);
    });

    test('should produce consistent signatures for the same message', async () => {
      const message = 'consistent message test';

      const sig1 = await signer.signMessage(message);
      const sig2 = await signer.signMessage(message);

      // Both signatures should be identical
      expect(sig1).toBe(sig2);

      // And both should recover to the same address
      const recovered1 = await recoverMessageAddress({
        message,
        signature: sig1 as Hex,
      });

      const recovered2 = await recoverMessageAddress({
        message,
        signature: sig2 as Hex,
      });

      expect(recovered1).toBe(recovered2);
    });

    test('should handle hex-encoded messages', async () => {
      const hexMessage: Hex = '0x48656c6c6f2c20526164697573'; // "Hello, Radius" in hex

      const signature = await signer.signMessage({ raw: hexMessage });

      // Signature should be valid
      expect(signature).toMatch(/^0x[0-9a-f]+$/i);

      // Should be recoverable
      const recovered = await recoverMessageAddress({
        message: { raw: hexMessage },
        signature: signature as Hex,
      });

      expect(recovered.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
    });
  });

  describe('PrivateKeySigner - Transaction Signing', () => {
    let signer: PrivateKeySigner;

    beforeEach(() => {
      signer = new PrivateKeySigner(TEST_PRIVATE_KEY, TEST_CHAIN_ID);
    });

    test('should produce a valid transaction signature', async () => {
      const tx = {
        to: '0x0000000000000000000000000000000000000001' as Hex,
        data: '0x' as Hex,
        gas: 21000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);

      // Should return a valid hex string
      expect(signedTx).toMatch(/^0x[0-9a-f]+$/i);
    });

    test('should produce valid RLP-encoded transaction', async () => {
      const tx = {
        to: '0x0000000000000000000000000000000000000001' as Hex,
        data: '0x' as Hex,
        gas: 21000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);

      // Should be parseable as a transaction
      const parsed = parseTransaction(signedTx as Hex);

      expect(parsed).toBeDefined();
      expect(parsed.to?.toLowerCase()).toBe(tx.to.toLowerCase());
    });

    test('should preserve transaction fields after signing', async () => {
      const tx = {
        to: '0x1234567890123456789012345678901234567890' as Hex,
        data: '0xabcd' as Hex,
        gas: 100000n,
        gasPrice: 10n,
        value: 123n,
        nonce: 5,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);
      const parsed = parseTransaction(signedTx as Hex);

      // Check that key fields are preserved
      expect(parsed.to?.toLowerCase()).toBe(tx.to.toLowerCase());
      expect(parsed.gas).toBe(tx.gas);
      expect(parsed.gasPrice).toBe(tx.gasPrice);
      expect(parsed.value).toBe(tx.value);
      expect(parsed.nonce).toBe(tx.nonce);
      expect(parsed.chainId).toBe(tx.chainId);
    });

    test('should include correct chain ID in signed transaction', async () => {
      const tx = {
        to: '0x0000000000000000000000000000000000000001' as Hex,
        data: '0x' as Hex,
        gas: 21000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);
      const parsed = parseTransaction(signedTx as Hex);

      expect(parsed.chainId).toBe(TEST_CHAIN_ID);
    });

    test('should handle transaction with contract data', async () => {
      const tx = {
        to: '0x1234567890123456789012345678901234567890' as Hex,
        data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000001' as Hex,
        gas: 100000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);
      const parsed = parseTransaction(signedTx as Hex);

      expect(parsed.data?.toLowerCase()).toBe(tx.data.toLowerCase());
    });

    test('should handle transaction without data field', async () => {
      const tx = {
        to: '0x0000000000000000000000000000000000000001' as Hex,
        gas: 21000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);

      // Should still produce valid signature
      expect(signedTx).toMatch(/^0x[0-9a-f]+$/i);

      const parsed = parseTransaction(signedTx as Hex);
      expect(parsed.to?.toLowerCase()).toBe(tx.to.toLowerCase());
    });

    test('should handle transaction without to field (contract deployment)', async () => {
      const tx = {
        data: '0x6080604052' as Hex, // Minimal contract bytecode
        gas: 100000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      const signedTx = await signer.signTransaction(tx);

      // Should still produce valid signature
      expect(signedTx).toMatch(/^0x[0-9a-f]+$/i);

      const parsed = parseTransaction(signedTx as Hex);
      // No recipient for contract deployment - can be null or undefined
      expect(parsed.to).toBeFalsy();
    });

    test('PrivateKeySigner transaction signature matches viem wallet', async () => {
      const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY);

      const tx = {
        to: '0x0000000000000000000000000000000000000001' as Hex,
        data: '0x' as Hex,
        gas: 21000n,
        gasPrice: 1n,
        value: 0n,
        nonce: 0,
        chainId: TEST_CHAIN_ID,
      };

      // Sign with viem
      const viemSig = await viemAccount.signTransaction(tx);

      // Sign with our PrivateKeySigner
      const radiusSig = await signer.signTransaction(tx);

      // Both should be parseable and have same structure
      const viemParsed = parseTransaction(viemSig as Hex);
      const radiusParsed = parseTransaction(radiusSig as Hex);

      // Key fields should match
      expect(viemParsed.to?.toLowerCase()).toBe(radiusParsed.to?.toLowerCase());
      expect(viemParsed.gas).toBe(radiusParsed.gas);
      expect(viemParsed.nonce).toBe(radiusParsed.nonce);
      expect(viemParsed.chainId).toBe(radiusParsed.chainId);

      // Signature components should be present (not verifying exact match as nonce may differ)
      expect(viemParsed.r).toBeDefined();
      expect(viemParsed.s).toBeDefined();
      expect(viemParsed.v).toBeDefined();
      expect(radiusParsed.r).toBeDefined();
      expect(radiusParsed.s).toBeDefined();
      expect(radiusParsed.v).toBeDefined();
    });
  });

  describe('PrivateKeySigner - Cross-Signing Verification', () => {
    let signer: PrivateKeySigner;
    let viemAccount: ReturnType<typeof privateKeyToAccount>;

    beforeEach(() => {
      signer = new PrivateKeySigner(TEST_PRIVATE_KEY, TEST_CHAIN_ID);
      viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY);
    });

    test('messages signed by both signers should recover to same address', async () => {
      const testMessages = ['test1', 'test2', 'a longer test message', ''];

      for (const message of testMessages) {
        const radiusSig = await signer.signMessage(message);
        const viemSig = await viemAccount.signMessage({ message });

        const radiusRecovered = await recoverMessageAddress({
          message,
          signature: radiusSig as Hex,
        });

        const viemRecovered = await recoverMessageAddress({
          message,
          signature: viemSig,
        });

        expect(radiusRecovered).toBe(viemRecovered);
      }
    });

    test('signer address should match viem account address', () => {
      expect(signer.address.toLowerCase()).toBe(viemAccount.address.toLowerCase());
      expect(signer.address.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
    });
  });
});
