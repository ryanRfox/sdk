/**
 * Unit tests for Radius chain configurations
 * Tests chain definitions: radiusTestnet and radiusMainnet
 */

import { describe, expect, test } from 'vitest';
import { radiusMainnet, radiusTestnet } from '../../packages/core/src/chains/radius';

describe('Chain Configurations', () => {
  describe('radiusTestnet', () => {
    test('should have correct chain ID', () => {
      expect(radiusTestnet.id).toBe(1223953);
    });

    test('should have correct name', () => {
      expect(radiusTestnet.name).toBe('Radius Testnet');
    });

    test('should be marked as testnet', () => {
      expect(radiusTestnet.testnet).toBe(true);
    });

    test('should have native currency configuration', () => {
      expect(radiusTestnet.nativeCurrency).toBeDefined();
      expect(radiusTestnet.nativeCurrency.name).toBe('Ether');
      expect(radiusTestnet.nativeCurrency.symbol).toBe('ETH');
      expect(radiusTestnet.nativeCurrency.decimals).toBe(18);
    });

    test('should have correct RPC URL', () => {
      expect(radiusTestnet.rpcUrls).toBeDefined();
      expect(radiusTestnet.rpcUrls.default).toBeDefined();
      expect(radiusTestnet.rpcUrls.default.http).toBeDefined();
      expect(radiusTestnet.rpcUrls.default.http.length).toBeGreaterThan(0);
      expect(radiusTestnet.rpcUrls.default.http[0]).toBe('https://rpc.testnet.radiustech.xyz');
    });

    test('should have block explorer configuration', () => {
      expect(radiusTestnet.blockExplorers).toBeDefined();
      expect(radiusTestnet.blockExplorers.default).toBeDefined();
      expect(radiusTestnet.blockExplorers.default.name).toBe('Radius Explorer');
      expect(radiusTestnet.blockExplorers.default.url).toBe(
        'https://explorer.testnet.radiustech.xyz'
      );
    });
  });

  describe('radiusMainnet', () => {
    test('should have correct chain ID (placeholder)', () => {
      // Note: These are placeholder values until mainnet launches
      expect(radiusMainnet.id).toBe(1223954);
    });

    test('should have correct name', () => {
      expect(radiusMainnet.name).toBe('Radius');
    });

    test('should not be marked as testnet', () => {
      expect(radiusMainnet.testnet).toBe(false);
    });

    test('should have native currency configuration', () => {
      expect(radiusMainnet.nativeCurrency).toBeDefined();
      expect(radiusMainnet.nativeCurrency.name).toBe('Ether');
      expect(radiusMainnet.nativeCurrency.symbol).toBe('ETH');
      expect(radiusMainnet.nativeCurrency.decimals).toBe(18);
    });

    test('should have RPC URL (placeholder)', () => {
      expect(radiusMainnet.rpcUrls).toBeDefined();
      expect(radiusMainnet.rpcUrls.default).toBeDefined();
      expect(radiusMainnet.rpcUrls.default.http).toBeDefined();
      expect(radiusMainnet.rpcUrls.default.http.length).toBeGreaterThan(0);
      expect(radiusMainnet.rpcUrls.default.http[0]).toBe('https://rpc.radiustech.xyz');
    });

    test('should have block explorer configuration (placeholder)', () => {
      expect(radiusMainnet.blockExplorers).toBeDefined();
      expect(radiusMainnet.blockExplorers.default).toBeDefined();
      expect(radiusMainnet.blockExplorers.default.name).toBe('Radius Explorer');
      expect(radiusMainnet.blockExplorers.default.url).toBe('https://explorer.radiustech.xyz');
    });
  });

  describe('Chain Comparison', () => {
    test('testnet and mainnet should have different chain IDs', () => {
      expect(radiusTestnet.id).not.toBe(radiusMainnet.id);
    });

    test('testnet and mainnet should have different names', () => {
      expect(radiusTestnet.name).not.toBe(radiusMainnet.name);
    });

    test('testnet should have testnet flag while mainnet should not', () => {
      expect(radiusTestnet.testnet).toBe(true);
      expect(radiusMainnet.testnet).toBe(false);
    });

    test('both chains should have the same native currency', () => {
      expect(radiusTestnet.nativeCurrency.symbol).toBe(radiusMainnet.nativeCurrency.symbol);
      expect(radiusTestnet.nativeCurrency.decimals).toBe(radiusMainnet.nativeCurrency.decimals);
      expect(radiusTestnet.nativeCurrency.name).toBe(radiusMainnet.nativeCurrency.name);
    });

    test('both chains should have different RPC URLs', () => {
      const testnetRpc = radiusTestnet.rpcUrls.default.http[0];
      const mainnetRpc = radiusMainnet.rpcUrls.default.http[0];
      expect(testnetRpc).not.toBe(mainnetRpc);
    });
  });

  describe('Chain Object Structure', () => {
    test('radiusTestnet should be a valid viem chain object', () => {
      expect(radiusTestnet).toHaveProperty('id');
      expect(radiusTestnet).toHaveProperty('name');
      expect(radiusTestnet).toHaveProperty('nativeCurrency');
      expect(radiusTestnet).toHaveProperty('rpcUrls');
      expect(radiusTestnet).toHaveProperty('blockExplorers');
      expect(radiusTestnet).toHaveProperty('testnet');
    });

    test('radiusMainnet should be a valid viem chain object', () => {
      expect(radiusMainnet).toHaveProperty('id');
      expect(radiusMainnet).toHaveProperty('name');
      expect(radiusMainnet).toHaveProperty('nativeCurrency');
      expect(radiusMainnet).toHaveProperty('rpcUrls');
      expect(radiusMainnet).toHaveProperty('blockExplorers');
      expect(radiusMainnet).toHaveProperty('testnet');
    });

    test('RPC URLs should be arrays with at least one entry', () => {
      expect(Array.isArray(radiusTestnet.rpcUrls.default.http)).toBe(true);
      expect(radiusTestnet.rpcUrls.default.http.length).toBeGreaterThan(0);
      expect(Array.isArray(radiusMainnet.rpcUrls.default.http)).toBe(true);
      expect(radiusMainnet.rpcUrls.default.http.length).toBeGreaterThan(0);
    });

    test('all RPC URLs should be valid HTTPS URLs', () => {
      const testnetRpc = radiusTestnet.rpcUrls.default.http[0];
      const mainnetRpc = radiusMainnet.rpcUrls.default.http[0];
      expect(testnetRpc.startsWith('https://')).toBe(true);
      expect(mainnetRpc.startsWith('https://')).toBe(true);
    });

    test('all block explorer URLs should be valid HTTPS URLs', () => {
      const testnetExplorer = radiusTestnet.blockExplorers.default.url;
      const mainnetExplorer = radiusMainnet.blockExplorers.default.url;
      expect(testnetExplorer.startsWith('https://')).toBe(true);
      expect(mainnetExplorer.startsWith('https://')).toBe(true);
    });
  });
});
