/**
 * Final test: Isolate what exactly causes revert
 *
 * Previous tests showed both EIP-1559 and legacy WalletClient transactions revert.
 * RadiusClient succeeds.
 *
 * Theories:
 * 1. The burn address 0x01 is a precompile - maybe that's the issue?
 * 2. Gas margin matters?
 * 3. Something else in the signing?
 */

import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '../src/chains/index.js';
import { createRadiusClient } from '../src/client/index.js';

const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  console.log('='.repeat(60));
  console.log('Final Transaction Test');
  console.log('='.repeat(60));

  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY);
  const publicClient = createPublicClient({ chain: radiusTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: radiusTestnet, transport: http() });
  const radiusClient = createRadiusClient({ chain: radiusTestnet });

  // Use a regular address, not a precompile
  const regularAddress = '0x000000000000000000000000000000000000dEaD'; // Common burn address
  const testValue = parseEther('0.0001');

  // Get nonce and gas
  const nonce = await publicClient.getTransactionCount({ address: account.address, blockTag: 'pending' });
  const gas = 21000n + (21000n / 5n); // Match RadiusClient's 20% margin

  console.log('Test recipient:', regularAddress);
  console.log('Nonce:', nonce);
  console.log('Gas (with margin):', gas);

  // Test 1: WalletClient with exact RadiusClient params
  console.log('\n--- Test 1: WalletClient with RadiusClient-like params ---');
  try {
    const hash = await walletClient.sendTransaction({
      to: regularAddress,
      value: testValue,
      gasPrice: 0n,
      gas: gas,
      nonce: nonce,
      type: 'legacy',
    });
    console.log('✓ Sent:', hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('  Status:', receipt.status);
  } catch (error) {
    console.log('✗ Failed:', (error as Error).message);
  }

  // Test 2: RadiusClient to same address
  console.log('\n--- Test 2: RadiusClient to same address ---');
  try {
    const hash = await radiusClient.send(account, regularAddress, testValue);
    console.log('✓ Sent:', hash);
    const receipt = await radiusClient.waitForTransactionReceipt({ hash });
    console.log('  Status:', receipt.status);
  } catch (error) {
    console.log('✗ Failed:', (error as Error).message);
  }

  // Test 3: Use sendRawTransaction to bypass WalletClient entirely
  console.log('\n--- Test 3: Manual sign + sendRawTransaction ---');
  const newNonce = await publicClient.getTransactionCount({ address: account.address, blockTag: 'pending' });
  try {
    const signedTx = await account.signTransaction({
      to: regularAddress,
      value: testValue,
      nonce: newNonce,
      gas: gas,
      gasPrice: 0n,
      chainId: radiusTestnet.id,
      type: 'legacy',
    });
    console.log('Signed tx prefix:', signedTx.slice(0, 4));

    const hash = await publicClient.sendRawTransaction({ serializedTransaction: signedTx });
    console.log('✓ Sent:', hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('  Status:', receipt.status);
  } catch (error) {
    console.log('✗ Failed:', (error as Error).message);
  }

  // Test 4: Compare signed bytes
  console.log('\n--- Test 4: Compare what RadiusClient signs ---');
  const finalNonce = await publicClient.getTransactionCount({ address: account.address, blockTag: 'pending' });

  // What RadiusClient internally does
  const radiusSignedTx = await account.signTransaction({
    to: regularAddress,
    value: testValue,
    nonce: finalNonce,
    gas: gas,
    gasPrice: 0n,
    chainId: radiusTestnet.id,
    // Note: RadiusClient does NOT specify type
  });
  console.log('RadiusClient-style signed (no type):', radiusSignedTx.slice(0, 4));

  // With explicit legacy type
  const legacySignedTx = await account.signTransaction({
    to: regularAddress,
    value: testValue,
    nonce: finalNonce,
    gas: gas,
    gasPrice: 0n,
    chainId: radiusTestnet.id,
    type: 'legacy',
  });
  console.log('Explicit legacy type signed:', legacySignedTx.slice(0, 4));

  // Are they the same?
  console.log('Same signature?', radiusSignedTx === legacySignedTx);

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
