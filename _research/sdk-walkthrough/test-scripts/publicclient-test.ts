/**
 * Test: PublicClient vs RadiusClient
 *
 * Purpose: Understand what breaks when using viem's PublicClient directly
 * instead of RadiusClient on Radius testnet.
 *
 * Questions to answer:
 * 1. Does PublicClient work for reading data?
 * 2. Does sending a transaction fail due to gasPrice: 0?
 * 3. What specific error do we get?
 *
 * Uses Anvil Account #1 (well-known test key)
 *
 * Run with: cd typescript && npx tsx scripts/publicclient-test.ts
 */

import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '../src/chains/index.js';
import { createRadiusClient } from '../src/client/index.js';

// Anvil Account #1 - well-known test private key
const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  console.log('='.repeat(60));
  console.log('PublicClient vs RadiusClient Test');
  console.log('='.repeat(60));
  console.log('');
  console.log('Chain:', radiusTestnet.name);
  console.log('RPC:', radiusTestnet.rpcUrls.default.http[0]);
  console.log('');

  // Create account from Anvil key
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY);
  console.log('Test Account:', account.address);

  // ============================================
  // TEST 1: Reading with PublicClient (should work)
  // ============================================
  console.log('\n--- Test 1: Reading with PublicClient ---');

  const publicClient = createPublicClient({
    chain: radiusTestnet,
    transport: http(),
  });

  try {
    const balance = await publicClient.getBalance({ address: account.address });
    console.log('✓ getBalance works:', formatEther(balance), 'USD');
  } catch (error) {
    console.log('✗ getBalance failed:', (error as Error).message);
  }

  try {
    const chainId = await publicClient.getChainId();
    console.log('✓ getChainId works:', chainId);
  } catch (error) {
    console.log('✗ getChainId failed:', (error as Error).message);
  }

  try {
    const gasPrice = await publicClient.getGasPrice();
    console.log('✓ getGasPrice returns:', gasPrice, '(0n expected for Radius)');
  } catch (error) {
    console.log('✗ getGasPrice failed:', (error as Error).message);
  }

  try {
    const blockNumber = await publicClient.getBlockNumber();
    console.log('✓ getBlockNumber works:', blockNumber);
  } catch (error) {
    console.log('✗ getBlockNumber failed:', (error as Error).message);
  }

  // ============================================
  // TEST 2: Sending with WalletClient (what breaks?)
  // ============================================
  console.log('\n--- Test 2: Sending with WalletClient (no gasPrice override) ---');

  const walletClient = createWalletClient({
    account,
    chain: radiusTestnet,
    transport: http(),
  });

  // Check if we have enough balance to test
  const balance = await publicClient.getBalance({ address: account.address });
  if (balance === 0n) {
    console.log('⚠ Account has 0 balance - cannot test transactions');
    console.log('  Fund this address on Radius testnet:', account.address);
    console.log('');
    console.log('Skipping transaction tests...');
    console.log('\n' + '='.repeat(60));
    console.log('Test Complete (partial - no funds for tx tests)');
    console.log('='.repeat(60));
    return;
  }

  console.log('Account balance:', formatEther(balance), 'USD');

  const testValue = parseEther('0.0001'); // Very small test amount
  const testRecipient = '0x0000000000000000000000000000000000000001'; // Burn address

  // Test 2a: Without gasPrice override (what viem does by default)
  console.log('\nTest 2a: sendTransaction without gasPrice override');
  try {
    const hash = await walletClient.sendTransaction({
      to: testRecipient,
      value: testValue,
      // No gasPrice specified - viem will fetch from network
    });
    console.log('✓ Transaction sent:', hash);

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✓ Receipt received, status:', receipt.status);
  } catch (error) {
    console.log('✗ Transaction failed:', (error as Error).message);
    if ((error as Error).message.length < 500) {
      console.log('  Full error:', error);
    }
  }

  // Test 2b: With explicit gasPrice: 0n
  console.log('\nTest 2b: sendTransaction with gasPrice: 0n');
  try {
    const hash = await walletClient.sendTransaction({
      to: testRecipient,
      value: testValue,
      gasPrice: 0n, // Explicit zero gas price
    });
    console.log('✓ Transaction sent:', hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✓ Receipt received, status:', receipt.status);
  } catch (error) {
    console.log('✗ Transaction failed:', (error as Error).message);
  }

  // ============================================
  // TEST 3: Sending with RadiusClient (should work)
  // ============================================
  console.log('\n--- Test 3: Sending with RadiusClient ---');

  const radiusClient = createRadiusClient({
    chain: radiusTestnet,
  });

  try {
    const hash = await radiusClient.send(account, testRecipient, testValue);
    console.log('✓ Transaction sent:', hash);

    const receipt = await radiusClient.waitForTransactionReceipt({ hash });
    console.log('✓ Receipt received, status:', receipt.status);
  } catch (error) {
    console.log('✗ Transaction failed:', (error as Error).message);
  }

  // ============================================
  // TEST 4: Gas estimation behavior
  // ============================================
  console.log('\n--- Test 4: Gas Estimation ---');

  try {
    const gasEstimate = await publicClient.estimateGas({
      account: account.address,
      to: testRecipient,
      value: testValue,
    });
    console.log('✓ estimateGas works:', gasEstimate);
  } catch (error) {
    console.log('✗ estimateGas failed:', (error as Error).message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
