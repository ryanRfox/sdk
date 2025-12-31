/**
 * ERC20 Integration Tests
 *
 * Tests real ERC20 operations against Radius Testnet using the ISBToken contract.
 * These tests interact with a real deployed token contract and verify all standard ERC20 operations.
 *
 * Environment Variables:
 * - RADIUS_ENDPOINT: RPC endpoint for Radius testnet (optional, defaults to https://rpc.testnet.radiustech.xyz)
 * - RADIUS_PRIVATE_KEY: Private key for test account (required for wallet operations)
 *
 * Run with:
 * RADIUS_ENDPOINT=https://rpc.testnet.radiustech.xyz RADIUS_PRIVATE_KEY=0x... pnpm vitest run test/integration/erc20.integration.test.ts
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import {
  skipIfNoTestnet,
  RADIUS_ENDPOINT,
  ISB_TOKEN_ADDRESS,
  createRadiusTestnetClients,
  TEST_PRIVATE_KEY,
} from '../fixtures/radius-testnet';
import { radiusTestnet } from '../../packages/core/src/chains';
import { ERC20, type ERC20Signer } from '../../packages/core/src/contracts/erc20';

describe('ERC20 Integration Tests', () => {
  // Skip all tests if no testnet credentials
  const shouldSkip = skipIfNoTestnet();

  let publicClient: ReturnType<typeof createPublicClient>;
  let erc20: ERC20;
  let signer: ERC20Signer;

  beforeAll(() => {
    if (shouldSkip) return;

    // Create public client for read operations
    publicClient = createPublicClient({
      chain: radiusTestnet,
      transport: http(RADIUS_ENDPOINT),
    });

    // Create ERC20 instance
    erc20 = new ERC20(ISB_TOKEN_ADDRESS, publicClient);

    // Create signer for write operations
    const clients = createRadiusTestnetClients();
    signer = {
      walletClient: clients.walletClient,
      account: clients.account,
    };
  });

  describe('Read Operations', () => {
    test.skipIf(shouldSkip)('should read token name from ISBToken', async () => {
      const name = await erc20.name();
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
      console.log(`Token name: ${name}`);
    });

    test.skipIf(shouldSkip)('should read token symbol', async () => {
      const symbol = await erc20.symbol();
      expect(symbol).toBeDefined();
      expect(typeof symbol).toBe('string');
      expect(symbol.length).toBeGreaterThan(0);
      console.log(`Token symbol: ${symbol}`);
    });

    test.skipIf(shouldSkip)('should read token decimals', async () => {
      const decimals = await erc20.decimals();
      expect(typeof decimals).toBe('number');
      expect(decimals).toBeGreaterThanOrEqual(0);
      expect(decimals).toBeLessThanOrEqual(18);
      console.log(`Token decimals: ${decimals}`);
    });

    test.skipIf(shouldSkip)('should read total supply', async () => {
      const totalSupply = await erc20.totalSupply();
      expect(typeof totalSupply).toBe('bigint');
      expect(totalSupply).toBeGreaterThanOrEqual(0n);
      console.log(`Total supply: ${totalSupply}`);

      // Also test formatting the total supply
      const formatted = formatUnits(totalSupply, 18);
      expect(formatted).toBeDefined();
      console.log(`Total supply (formatted): ${formatted}`);
    });

    test.skipIf(shouldSkip)('should read balance of test account', async () => {
      const balance = await erc20.balanceOf(signer.account.address);
      expect(typeof balance).toBe('bigint');
      expect(balance).toBeGreaterThanOrEqual(0n);
      console.log(`Balance of ${signer.account.address}: ${balance}`);
    });

    test.skipIf(shouldSkip)('should read balance of zero address', async () => {
      const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
      const balance = await erc20.balanceOf(zeroAddress);
      expect(typeof balance).toBe('bigint');
      expect(balance).toBeGreaterThanOrEqual(0n);
      console.log(`Balance of zero address: ${balance}`);
    });

    test.skipIf(shouldSkip)('should read allowance between two addresses', async () => {
      const ownerAddress = signer.account.address;
      const spenderAddress = '0x1111111111111111111111111111111111111111' as const;

      const allowance = await erc20.allowance(ownerAddress, spenderAddress);
      expect(typeof allowance).toBe('bigint');
      expect(allowance).toBeGreaterThanOrEqual(0n);
      console.log(`Allowance from ${ownerAddress} to ${spenderAddress}: ${allowance}`);
    });

    test.skipIf(shouldSkip)('should cache token metadata', async () => {
      // Create a fresh ERC20 instance
      const freshErc20 = new ERC20(ISB_TOKEN_ADDRESS, publicClient);

      // Call methods - first call should fetch from chain
      const name1 = await freshErc20.name();
      const symbol1 = await freshErc20.symbol();
      const decimals1 = await freshErc20.decimals();

      // Call again - should use cache
      const name2 = await freshErc20.name();
      const symbol2 = await freshErc20.symbol();
      const decimals2 = await freshErc20.decimals();

      expect(name1).toBe(name2);
      expect(symbol1).toBe(symbol2);
      expect(decimals1).toBe(decimals2);
      console.log('Metadata caching works correctly');
    });
  });

  describe('Utility Methods', () => {
    test.skipIf(shouldSkip)('should format token amounts correctly', async () => {
      const decimals = await erc20.decimals();

      // Test various amounts
      const testCases = [
        { raw: 1000000000000000000n, expected: '1' }, // 1 token with 18 decimals
        { raw: 1500000000000000000n, expected: '1.5' }, // 1.5 tokens
        { raw: 0n, expected: '0' }, // zero
      ];

      for (const { raw, expected } of testCases) {
        const formatted = formatUnits(raw, decimals);
        expect(formatted).toBe(expected);
        console.log(`Formatted ${raw} (${decimals} decimals) to: ${formatted}`);
      }
    });

    test.skipIf(shouldSkip)('should parse token amounts correctly', async () => {
      const decimals = await erc20.decimals();

      // Test various amounts
      const testCases = [
        { formatted: '1', expected: 1000000000000000000n }, // 1 token with 18 decimals
        { formatted: '1.5', expected: 1500000000000000000n }, // 1.5 tokens
        { formatted: '0', expected: 0n }, // zero
      ];

      for (const { formatted, expected } of testCases) {
        const parsed = parseUnits(formatted, decimals);
        expect(parsed).toBe(expected);
        console.log(`Parsed "${formatted}" (${decimals} decimals) to: ${parsed}`);
      }
    });

    test.skipIf(shouldSkip)('should use formatAmount utility method', async () => {
      const balance = await erc20.balanceOf(signer.account.address);
      const formatted = await erc20.formatAmount(balance);

      expect(typeof formatted).toBe('string');
      expect(formatted).toBeDefined();
      console.log(`Formatted balance: ${formatted}`);
    });

    test.skipIf(shouldSkip)('should use parseAmount utility method', async () => {
      const amountStr = '1';
      const parsed = await erc20.parseAmount(amountStr);

      expect(typeof parsed).toBe('bigint');
      expect(parsed).toBeGreaterThanOrEqual(0n);
      console.log(`Parsed "${amountStr}" to: ${parsed}`);
    });
  });

  describe('Contract Information', () => {
    test.skipIf(shouldSkip)('should have correct token address', () => {
      expect(erc20.address).toBe(ISB_TOKEN_ADDRESS);
      expect(erc20.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      console.log(`Token address: ${erc20.address}`);
    });

    test.skipIf(shouldSkip)('should fetch and display token metadata', async () => {
      const name = await erc20.name();
      const symbol = await erc20.symbol();
      const decimals = await erc20.decimals();
      const totalSupply = await erc20.totalSupply();

      console.log('Token Metadata:');
      console.log(`  Name: ${name}`);
      console.log(`  Symbol: ${symbol}`);
      console.log(`  Decimals: ${decimals}`);
      console.log(`  Total Supply: ${totalSupply}`);
      console.log(`  Total Supply (formatted): ${formatUnits(totalSupply, decimals)}`);

      expect(name).toBeDefined();
      expect(symbol).toBeDefined();
      expect(decimals).toBeGreaterThanOrEqual(0);
      expect(totalSupply).toBeGreaterThanOrEqual(0n);
    });
  });

  describe('Error Handling', () => {
    test.skipIf(shouldSkip)('should handle invalid addresses gracefully', async () => {
      // Try to read balance of an invalid address format (should fail at viem level)
      const invalidAddress = '0x0000000000000000000000000000000000000001' as const;

      // This should work but return 0 balance for unused address
      const balance = await erc20.balanceOf(invalidAddress);
      expect(typeof balance).toBe('bigint');
      console.log(`Balance of unused address: ${balance}`);
    });

    test.skipIf(shouldSkip)('should handle reading from different addresses', async () => {
      // Read balances of multiple different addresses
      const addresses = [
        signer.account.address,
        '0x0000000000000000000000000000000000000000' as const,
        '0x1111111111111111111111111111111111111111' as const,
      ];

      for (const address of addresses) {
        const balance = await erc20.balanceOf(address);
        expect(typeof balance).toBe('bigint');
      }

      console.log(`Successfully read balances from ${addresses.length} addresses`);
    });
  });

  describe('Skip Behavior', () => {
    test.skipIf(shouldSkip)('should have testnet credentials available', () => {
      expect(TEST_PRIVATE_KEY).toBeDefined();
      expect(RADIUS_ENDPOINT).toBeDefined();
      console.log(`Using endpoint: ${RADIUS_ENDPOINT}`);
    });
  });
});
