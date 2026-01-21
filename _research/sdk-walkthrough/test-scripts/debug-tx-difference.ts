/**
 * Debug: What's different between WalletClient and RadiusClient transactions?
 *
 * Previous test showed:
 * - WalletClient transactions REVERT
 * - RadiusClient transactions SUCCEED
 * - Both use gasPrice: 0n
 *
 * This test inspects the actual transaction parameters to find the difference.
 */

import { createPublicClient, createWalletClient, http, formatEther, parseEther, serializeTransaction, type TransactionSerializable } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '../src/chains/index.js';

// Anvil Account #1
const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  console.log('='.repeat(60));
  console.log('Transaction Difference Debug');
  console.log('='.repeat(60));

  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY);
  console.log('Account:', account.address);

  const publicClient = createPublicClient({
    chain: radiusTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: radiusTestnet,
    transport: http(),
  });

  const testRecipient = '0x0000000000000000000000000000000000000001';
  const testValue = parseEther('0.0001');

  // Get nonce
  const nonce = await publicClient.getTransactionCount({ address: account.address, blockTag: 'pending' });
  console.log('Current nonce:', nonce);

  // Get gas estimate
  const gasEstimate = await publicClient.estimateGas({
    account: account.address,
    to: testRecipient,
    value: testValue,
  });
  console.log('Gas estimate:', gasEstimate);

  // Get gas price
  const gasPrice = await publicClient.getGasPrice();
  console.log('Gas price from RPC:', gasPrice);

  // Check what viem's WalletClient prepares
  console.log('\n--- WalletClient transaction preparation ---');

  // Prepare a transaction request to see what viem builds
  const txRequest = await walletClient.prepareTransactionRequest({
    to: testRecipient,
    value: testValue,
  });
  console.log('WalletClient prepareTransactionRequest:');
  console.log(JSON.stringify(txRequest, (key, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  , 2));

  // Now let's manually build what RadiusClient does
  console.log('\n--- RadiusClient approach ---');

  // RadiusClient builds transaction like this (from client.ts):
  const radiusStyleTx: TransactionSerializable = {
    to: testRecipient,
    value: testValue,
    nonce: nonce,
    gas: gasEstimate + (gasEstimate / 5n), // 20% margin
    gasPrice: 0n, // Hardcoded
    chainId: radiusTestnet.id,
    type: 'legacy', // RadiusClient doesn't specify type, so it defaults to legacy
  };
  console.log('RadiusClient style tx:');
  console.log(JSON.stringify(radiusStyleTx, (key, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  , 2));

  // Key question: What transaction TYPE does WalletClient use?
  console.log('\n--- Transaction Type Analysis ---');
  console.log('txRequest.type:', (txRequest as any).type);
  console.log('txRequest has maxFeePerGas:', 'maxFeePerGas' in txRequest);
  console.log('txRequest has maxPriorityFeePerGas:', 'maxPriorityFeePerGas' in txRequest);
  console.log('txRequest has gasPrice:', 'gasPrice' in txRequest);

  // Sign both transactions and compare
  console.log('\n--- Signed Transaction Comparison ---');

  // Sign WalletClient style
  const signedWallet = await account.signTransaction(txRequest as any);
  console.log('WalletClient signed tx (first 100 chars):', signedWallet.slice(0, 100) + '...');
  console.log('WalletClient signed tx prefix:', signedWallet.slice(0, 4));

  // Sign RadiusClient style
  const signedRadius = await account.signTransaction(radiusStyleTx);
  console.log('RadiusClient signed tx (first 100 chars):', signedRadius.slice(0, 100) + '...');
  console.log('RadiusClient signed tx prefix:', signedRadius.slice(0, 4));

  // EIP-1559 transactions start with 0x02
  // EIP-2930 transactions start with 0x01
  // Legacy transactions start with 0xf8 or similar (RLP encoded)
  console.log('\n--- Analysis ---');
  if (signedWallet.startsWith('0x02')) {
    console.log('WalletClient uses EIP-1559 (type 2) transaction');
  } else if (signedWallet.startsWith('0x01')) {
    console.log('WalletClient uses EIP-2930 (type 1) transaction');
  } else {
    console.log('WalletClient uses legacy transaction');
  }

  if (signedRadius.startsWith('0x02')) {
    console.log('RadiusClient uses EIP-1559 (type 2) transaction');
  } else if (signedRadius.startsWith('0x01')) {
    console.log('RadiusClient uses EIP-2930 (type 1) transaction');
  } else {
    console.log('RadiusClient uses legacy transaction');
  }

  // TEST: Send legacy transaction via raw method
  console.log('\n--- Test: Send legacy transaction via WalletClient ---');
  try {
    const hash = await walletClient.sendTransaction({
      to: testRecipient,
      value: testValue,
      gasPrice: 0n,
      type: 'legacy', // Force legacy type
    });
    console.log('✓ Legacy tx sent:', hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✓ Receipt status:', receipt.status);
  } catch (error) {
    console.log('✗ Legacy tx failed:', (error as Error).message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Debug Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
