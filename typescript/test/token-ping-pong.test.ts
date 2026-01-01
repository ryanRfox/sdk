/**
 * Token Ping-Pong Integration Test for Radius SDK
 * Tests bidirectional ERC20 token transfers between two accounts
 *
 * This test demonstrates the complete lifecycle of token transfers:
 * 1. Connect to Radius testnet
 * 2. Get initial balances of both accounts
 * 3. Transfer ISBToken from Account A → Account B
 * 4. Wait for transaction confirmation
 * 5. Verify balances changed correctly
 * 6. Transfer ISBToken from Account B → Account A
 * 7. Wait for transaction confirmation
 * 8. Verify balances returned to original
 *
 * Run with:
 *   cd /Users/fox/Getting\ Started/radius-sdk/typescript
 *   RADIUS_ENDPOINT=https://rpc.testnet.radiustech.xyz \
 *   RADIUS_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
 *   pnpm vitest run test/token-ping-pong.test.ts
 *
 * Environment Variables:
 *   RADIUS_ENDPOINT - RPC endpoint (default: https://rpc.testnet.radiustech.xyz)
 *   RADIUS_PRIVATE_KEY - Primary funded account private key (required)
 *   RADIUS_PRIVATE_KEY_2 - Secondary account private key (optional, derived from primary if not provided)
 *
 * Token Configuration:
 *   ISBToken Address: 0xF966020a30946A64B39E2e243049036367590858
 *   Chain: Radius Testnet (1223953)
 *
 * Note: The test account must have ISBToken balance for this test to succeed.
 */

import { http, createPublicClient, createWalletClient, parseEther } from 'viem';
import type { Account, PublicClient, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';
import { radiusTestnet } from '../packages/core/src/chains/index';
import { ERC20 } from '../packages/core/src/contracts/erc20';
import { skipIfNoTestnet } from './fixtures/radius-testnet';

/**
 * Global state for token ping-pong test
 * Stores balances and transaction hashes across test cases
 */
interface TokenPingPongGlobalState {
  __initialBalance1?: bigint;
  __initialBalance2?: bigint;
  __transfer1TxHash?: string;
  __afterTransfer1Balance1?: bigint;
  __afterTransfer1Balance2?: bigint;
  __transfer2TxHash?: string;
}

// Extend globalThis with our test state
declare global {
  // biome-ignore lint/style/noVar: Required for TypeScript global declarations
  var __tokenPingPongState: TokenPingPongGlobalState;
}

// Initialize global state
if (!globalThis.__tokenPingPongState) {
  globalThis.__tokenPingPongState = {};
}

/**
 * Test configuration
 */
const RADIUS_ENDPOINT = process.env.RADIUS_ENDPOINT || 'https://rpc.testnet.radiustech.xyz';
const RADIUS_PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY;
const RADIUS_PRIVATE_KEY_2 = process.env.RADIUS_PRIVATE_KEY_2;

// ISBToken contract address on Radius Testnet
const ISB_TOKEN_ADDRESS = '0xF966020a30946A64B39E2e243049036367590858' as `0x${string}`;

// Transfer amount: 1 token (assuming 18 decimals)
// Note: Set this to an amount your test account actually has for full test execution
const TRANSFER_AMOUNT = parseEther('1');

// Test timeout
const TEST_TIMEOUT = 60000; // 60 seconds for blockchain confirmations

/**
 * Helper function to derive a secondary account from the primary one
 * This creates a deterministic secondary address for testing
 */
function deriveSecondaryAccount(primaryKey: `0x${string}`): `0x${string}` {
  // For testing purposes, we create a deterministic secondary key
  // by XORing the last byte of the primary key
  const keyBuffer = Buffer.from(primaryKey.slice(2), 'hex');
  const lastByte = keyBuffer[keyBuffer.length - 1];
  keyBuffer[keyBuffer.length - 1] = lastByte ^ 0x01;

  return `0x${keyBuffer.toString('hex')}`;
}

// Skip entire test suite if no testnet credentials
const shouldSkip = skipIfNoTestnet();

describe.skipIf(shouldSkip)('Token Ping-Pong Integration Tests', () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let account1: Account;
  let account2: Account;
  let token: ERC20;

  /**
   * Setup: Initialize clients and accounts
   */
  beforeAll(async () => {
    // Guard clause - shouldn't be reached if skipIf works, but just in case
    if (!RADIUS_PRIVATE_KEY) {
      return;
    }

    // Create clients
    publicClient = createPublicClient({
      chain: radiusTestnet,
      transport: http(RADIUS_ENDPOINT),
    });

    walletClient = createWalletClient({
      chain: radiusTestnet,
      transport: http(RADIUS_ENDPOINT),
    });

    // Create account objects
    account1 = privateKeyToAccount(RADIUS_PRIVATE_KEY as `0x${string}`);

    // Derive or use provided secondary account
    const secondaryKey =
      RADIUS_PRIVATE_KEY_2 || deriveSecondaryAccount(RADIUS_PRIVATE_KEY as `0x${string}`);
    account2 = privateKeyToAccount(secondaryKey as `0x${string}`);

    // Initialize token contract wrapper
    token = new ERC20(ISB_TOKEN_ADDRESS, publicClient);

    console.log('\n=== Token Ping-Pong Test Setup ===');
    console.log(`RPC Endpoint: ${RADIUS_ENDPOINT}`);
    console.log(`Chain: ${radiusTestnet.name} (ID: ${radiusTestnet.id})`);
    console.log(`Token Address: ${ISB_TOKEN_ADDRESS}`);
    console.log(`Account 1: ${account1.address}`);
    console.log(`Account 2: ${account2.address}`);
    console.log(`Transfer Amount: ${TRANSFER_AMOUNT.toString()} wei (1 token)`);
  });

  /**
   * Test 1: Get initial token balances
   */
  it(
    'should fetch initial token balances',
    async () => {
      try {
        // Get token metadata
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const name = await token.name();

        console.log('\n[TEST 1] Token Information');
        console.log(`  Name: ${name}`);
        console.log(`  Symbol: ${symbol}`);
        console.log(`  Decimals: ${decimals}`);

        // Get balances
        const balance1 = await token.balanceOf(account1.address);
        const balance2 = await token.balanceOf(account2.address);

        console.log('\n[INITIAL BALANCES]');
        console.log(`  Account 1 (${account1.address}):`);
        console.log(`    Balance: ${balance1.toString()} wei`);
        const formatted1 = await token.formatAmount(balance1);
        console.log(`    Formatted: ${formatted1} ${symbol}`);

        console.log(`  Account 2 (${account2.address}):`);
        console.log(`    Balance: ${balance2.toString()} wei`);
        const formatted2 = await token.formatAmount(balance2);
        console.log(`    Formatted: ${formatted2} ${symbol}`);

        // Verify both accounts exist (have been queried successfully)
        expect(typeof balance1).toBe('bigint');
        expect(typeof balance2).toBe('bigint');

        // Store initial balances for later verification
        globalThis.__tokenPingPongState.__initialBalance1 = balance1;
        globalThis.__tokenPingPongState.__initialBalance2 = balance2;

        console.log('\n[PASS] Successfully retrieved initial balances');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[FAIL] Failed to fetch balances: ${errorMsg}`);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  /**
   * Test 2: Transfer tokens from Account 1 to Account 2
   */
  it(
    'should transfer tokens from Account 1 to Account 2',
    async () => {
      try {
        console.log('\n[TEST 2] Transfer from Account 1 → Account 2');
        console.log(`  Transferring: ${TRANSFER_AMOUNT.toString()} wei`);

        // Check if Account 1 has sufficient balance
        const balance1 = await token.balanceOf(account1.address);
        if (balance1 < TRANSFER_AMOUNT) {
          throw new Error(
            `Insufficient balance in Account 1. Have: ${balance1.toString()}, Need: ${TRANSFER_AMOUNT.toString()}`
          );
        }

        console.log(`  Account 1 balance: ${balance1.toString()} wei`);
        console.log('  Sufficient balance: YES');

        // Execute transfer
        console.log('  Submitting transfer transaction...');
        const txHash = await token.transfer(
          {
            walletClient,
            account: account1,
          },
          account2.address,
          TRANSFER_AMOUNT
        );

        console.log(`  Transaction submitted: ${txHash}`);

        // Wait for transaction receipt
        console.log('  Waiting for transaction confirmation...');
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(receipt).toBeDefined();
        expect(receipt.status).toBe('success');

        console.log('  Transaction confirmed!');
        console.log(`  Block: ${receipt.blockNumber}`);
        console.log(`  Gas Used: ${receipt.gasUsed}`);

        // Store transaction info for reference
        globalThis.__tokenPingPongState.__transfer1TxHash = txHash;

        console.log('\n[PASS] Transfer from Account 1 → Account 2 completed');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[FAIL] Transfer failed: ${errorMsg}`);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  /**
   * Test 3: Verify balances after first transfer
   */
  it(
    'should verify balances after Account 1 → Account 2 transfer',
    async () => {
      try {
        console.log('\n[TEST 3] Verify Balances After Transfer 1');

        const initialBalance1 = globalThis.__tokenPingPongState.__initialBalance1 ?? 0n;
        const initialBalance2 = globalThis.__tokenPingPongState.__initialBalance2 ?? 0n;

        const newBalance1 = await token.balanceOf(account1.address);
        const newBalance2 = await token.balanceOf(account2.address);

        const _symbol = await token.symbol();

        console.log('\n  Account 1:');
        console.log(`    Before: ${initialBalance1.toString()} wei`);
        console.log(`    After:  ${newBalance1.toString()} wei`);
        console.log(`    Change: -${(initialBalance1 - newBalance1).toString()} wei`);

        console.log('\n  Account 2:');
        console.log(`    Before: ${initialBalance2.toString()} wei`);
        console.log(`    After:  ${newBalance2.toString()} wei`);
        console.log(`    Change: +${(newBalance2 - initialBalance2).toString()} wei`);

        // Verify Account 1 decreased by transfer amount
        expect(initialBalance1 - newBalance1).toBe(TRANSFER_AMOUNT);
        console.log(`  ✓ Account 1 decreased by exactly ${TRANSFER_AMOUNT.toString()} wei`);

        // Verify Account 2 increased by transfer amount
        expect(newBalance2 - initialBalance2).toBe(TRANSFER_AMOUNT);
        console.log(`  ✓ Account 2 increased by exactly ${TRANSFER_AMOUNT.toString()} wei`);

        // Store new balances for next test
        globalThis.__tokenPingPongState.__afterTransfer1Balance1 = newBalance1;
        globalThis.__tokenPingPongState.__afterTransfer1Balance2 = newBalance2;

        console.log('\n[PASS] Balances verified after first transfer');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[FAIL] Balance verification failed: ${errorMsg}`);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  /**
   * Test 4: Transfer tokens from Account 2 back to Account 1
   */
  it(
    'should transfer tokens from Account 2 back to Account 1',
    async () => {
      try {
        console.log('\n[TEST 4] Transfer from Account 2 → Account 1 (Ping-Pong Back)');
        console.log(`  Transferring: ${TRANSFER_AMOUNT.toString()} wei`);

        // Check if Account 2 has sufficient balance
        const balance2 = await token.balanceOf(account2.address);
        if (balance2 < TRANSFER_AMOUNT) {
          throw new Error(
            `Insufficient balance in Account 2. Have: ${balance2.toString()}, Need: ${TRANSFER_AMOUNT.toString()}`
          );
        }

        console.log(`  Account 2 balance: ${balance2.toString()} wei`);
        console.log('  Sufficient balance: YES');

        // Execute transfer
        console.log('  Submitting transfer transaction...');
        const txHash = await token.transfer(
          {
            walletClient,
            account: account2,
          },
          account1.address,
          TRANSFER_AMOUNT
        );

        console.log(`  Transaction submitted: ${txHash}`);

        // Wait for transaction receipt
        console.log('  Waiting for transaction confirmation...');
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        expect(receipt).toBeDefined();
        expect(receipt.status).toBe('success');

        console.log('  Transaction confirmed!');
        console.log(`  Block: ${receipt.blockNumber}`);
        console.log(`  Gas Used: ${receipt.gasUsed}`);

        // Store transaction info for reference
        globalThis.__tokenPingPongState.__transfer2TxHash = txHash;

        console.log('\n[PASS] Transfer from Account 2 → Account 1 completed');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[FAIL] Transfer failed: ${errorMsg}`);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  /**
   * Test 5: Verify final balances match original
   */
  it(
    'should verify final balances match original balances',
    async () => {
      try {
        console.log('\n[TEST 5] Verify Final Balances (Should Match Original)');

        const initialBalance1 = globalThis.__tokenPingPongState.__initialBalance1 ?? 0n;
        const initialBalance2 = globalThis.__tokenPingPongState.__initialBalance2 ?? 0n;

        const finalBalance1 = await token.balanceOf(account1.address);
        const finalBalance2 = await token.balanceOf(account2.address);

        console.log('\n  Account 1:');
        console.log(`    Initial: ${initialBalance1.toString()} wei`);
        console.log(`    Final:   ${finalBalance1.toString()} wei`);
        console.log(`    Match:   ${initialBalance1 === finalBalance1 ? 'YES' : 'NO'}`);

        console.log('\n  Account 2:');
        console.log(`    Initial: ${initialBalance2.toString()} wei`);
        console.log(`    Final:   ${finalBalance2.toString()} wei`);
        console.log(`    Match:   ${initialBalance2 === finalBalance2 ? 'YES' : 'NO'}`);

        // Verify Account 1 returned to original balance
        expect(finalBalance1).toBe(initialBalance1);
        console.log('  ✓ Account 1 balance returned to original');

        // Verify Account 2 returned to original balance
        expect(finalBalance2).toBe(initialBalance2);
        console.log('  ✓ Account 2 balance returned to original');

        console.log('\n[PASS] Ping-pong cycle completed successfully!');
        console.log('\n=== Test Summary ===');
        console.log('✓ Initial balances captured');
        console.log(`✓ Transfer 1: Account 1 → Account 2 (${TRANSFER_AMOUNT.toString()} wei)`);
        console.log('✓ Balances verified after Transfer 1');
        console.log(`✓ Transfer 2: Account 2 → Account 1 (${TRANSFER_AMOUNT.toString()} wei)`);
        console.log('✓ Final balances match original');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[FAIL] Final balance verification failed: ${errorMsg}`);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

/**
 * INTEGRATION TEST SUMMARY
 * ========================
 *
 * This test suite validates the following aspects of the Radius SDK:
 *
 * 1. ERC20 Token Interactions
 *    - Reading token metadata (name, symbol, decimals)
 *    - Querying token balances for specific addresses
 *    - Executing token transfers via the SDK
 *
 * 2. Transaction Management
 *    - Submitting transactions to Radius testnet
 *    - Waiting for transaction confirmation
 *    - Verifying transaction receipts
 *
 * 3. Balance Verification
 *    - Initial balance snapshot
 *    - Balance changes after transfers
 *    - Final balance verification (complete cycle)
 *
 * 4. Multi-Account Operations
 *    - Managing multiple accounts with different private keys
 *    - Deriving secondary accounts deterministically
 *    - Switching between account signers
 *
 * 5. Radius Testnet Integration
 *    - HTTP RPC communication
 *    - Chain configuration (chain ID, network settings)
 *    - Gas estimation and usage tracking
 *
 * EXPECTED OUTCOMES:
 * - All tests should pass if:
 *   1. RADIUS_ENDPOINT is accessible
 *   2. RADIUS_PRIVATE_KEY is valid and funded
 *   3. Account has sufficient ISBToken balance
 *   4. Network confirmations complete within TEST_TIMEOUT
 *
 * KNOWN LIMITATIONS:
 * - Test requires ISBToken balance in the primary account
 * - Transfer amounts are fixed (100 tokens in wei)
 * - Secondary account derivation is deterministic but may lack balance
 *
 * NOTES:
 * - All tests use WRITE operations (actual token transfers)
 * - Test uses real token transfers on testnet
 * - Balances may be affected by concurrent tests or network issues
 * - Gas costs will be deducted from account's native ETH balance
 */
