/**
 * Gas Consumption Test
 *
 * Determines whether failed transactions consume gas on Radius testnet.
 *
 * Key questions:
 * 1. Is gas consumed for "Exec Failed" rejections?
 * 2. Does the nonce increment for failed transactions?
 * 3. Is the rejection happening pre-execution (mempool) or during execution?
 *
 * Run with: RADIUS_PRIVATE_KEY=0x... npx tsx research/gas-consumption-test.ts
 */

import { createPublicClient, http, createWalletClient, formatEther, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

const radiusTestnet = defineChain({
  id: 1223953,
  name: 'Radius Testnet',
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.radiustech.xyz'] } },
});

const PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY as Hex | undefined;

if (!PRIVATE_KEY) {
  console.error('RADIUS_PRIVATE_KEY environment variable required');
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);

async function main() {
  const client = createPublicClient({
    chain: radiusTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: radiusTestnet,
    transport: http(),
  });

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       GAS CONSUMPTION TEST FOR FAILED TRANSACTIONS         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Account: ${account.address}`);

  // Get initial state
  const initialBalance = await client.getBalance({ address: account.address });
  const initialNonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nInitial State:`);
  console.log(`  Balance: ${formatEther(initialBalance)} ETH`);
  console.log(`  Nonce: ${initialNonce}`);

  // ============================================================
  // TEST 1: Single successful transaction (baseline)
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 1: Single successful transaction (baseline)');
  console.log('═'.repeat(60));

  const preTest1Balance = await client.getBalance({ address: account.address });
  const preTest1Nonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nBefore: Balance=${formatEther(preTest1Balance)}, Nonce=${preTest1Nonce}`);

  try {
    const hash = await walletClient.sendTransaction({
      to: account.address,
      value: 0n, // Self-transfer of 0
    });
    console.log(`Transaction hash: ${hash}`);

    // Wait for receipt
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log(`Receipt status: ${receipt.status}`);
    console.log(`Gas used: ${receipt.gasUsed}`);
    console.log(`Effective gas price: ${receipt.effectiveGasPrice}`);

    const gasSpent = receipt.gasUsed * receipt.effectiveGasPrice;
    console.log(`Gas cost: ${formatEther(gasSpent)} ETH`);
  } catch (err) {
    console.log(`Error: ${err instanceof Error ? err.message.slice(0, 100) : err}`);
  }

  const postTest1Balance = await client.getBalance({ address: account.address });
  const postTest1Nonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nAfter: Balance=${formatEther(postTest1Balance)}, Nonce=${postTest1Nonce}`);
  console.log(`Balance change: ${formatEther(postTest1Balance - preTest1Balance)} ETH`);
  console.log(`Nonce change: ${postTest1Nonce - preTest1Nonce}`);

  await new Promise(r => setTimeout(r, 2000));

  // ============================================================
  // TEST 2: Parallel transactions that will partially fail
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 2: Parallel transactions (some will fail)');
  console.log('═'.repeat(60));

  const preTest2Balance = await client.getBalance({ address: account.address });
  const preTest2Nonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nBefore: Balance=${formatEther(preTest2Balance)}, Nonce=${preTest2Nonce}`);

  // Fire 3 parallel transactions with explicit nonces
  const txPromises = [0, 1, 2].map(async (i) => {
    const txNonce = Number(preTest2Nonce) + i;
    try {
      const hash = await walletClient.sendTransaction({
        to: account.address,
        value: 0n,
        nonce: txNonce,
      });
      return { index: i, nonce: txNonce, success: true, hash };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isExecFailed = errorMsg.includes('Exec Failed');
      return { index: i, nonce: txNonce, success: false, error: isExecFailed ? 'Exec Failed' : errorMsg.slice(0, 80) };
    }
  });

  const results = await Promise.all(txPromises);

  console.log('\nTransaction results:');
  for (const r of results) {
    if (r.success) {
      console.log(`  TX ${r.index} (nonce ${r.nonce}): SUCCESS - ${r.hash}`);
    } else {
      console.log(`  TX ${r.index} (nonce ${r.nonce}): FAILED - ${r.error}`);
    }
  }

  // Wait for successful transactions to be mined
  const successfulTxs = results.filter(r => r.success);
  const failedTxs = results.filter(r => !r.success);

  console.log(`\nSuccessful: ${successfulTxs.length}, Failed: ${failedTxs.length}`);

  // Get receipts for successful transactions
  let totalGasUsed = 0n;
  for (const tx of successfulTxs) {
    if (tx.success && tx.hash) {
      try {
        const receipt = await client.waitForTransactionReceipt({ hash: tx.hash as Hex });
        const gasSpent = receipt.gasUsed * receipt.effectiveGasPrice;
        totalGasUsed += gasSpent;
        console.log(`  TX ${tx.index} gas cost: ${formatEther(gasSpent)} ETH (gas: ${receipt.gasUsed})`);
      } catch (e) {
        console.log(`  TX ${tx.index} receipt error: ${e}`);
      }
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  const postTest2Balance = await client.getBalance({ address: account.address });
  const postTest2Nonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nAfter: Balance=${formatEther(postTest2Balance)}, Nonce=${postTest2Nonce}`);
  console.log(`Balance change: ${formatEther(postTest2Balance - preTest2Balance)} ETH`);
  console.log(`Nonce change: ${postTest2Nonce - preTest2Nonce}`);
  console.log(`Expected gas cost (from receipts): ${formatEther(totalGasUsed)} ETH`);

  const actualBalanceChange = preTest2Balance - postTest2Balance;
  console.log(`Actual balance decrease: ${formatEther(actualBalanceChange)} ETH`);

  if (failedTxs.length > 0) {
    const extraGas = actualBalanceChange - totalGasUsed;
    console.log(`\nExtra gas consumed beyond successful txs: ${formatEther(extraGas)} ETH`);
    if (extraGas > 0n) {
      console.log(`⚠️  FAILED TRANSACTIONS MAY HAVE CONSUMED GAS`);
    } else {
      console.log(`✓  Failed transactions did NOT consume gas`);
    }
  }

  // ============================================================
  // TEST 3: Explicit out-of-order nonce test
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 3: Out-of-order nonce submission');
  console.log('═'.repeat(60));

  await new Promise(r => setTimeout(r, 2000));

  const preTest3Balance = await client.getBalance({ address: account.address });
  const preTest3Nonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nBefore: Balance=${formatEther(preTest3Balance)}, Nonce=${preTest3Nonce}`);
  console.log(`\nSending nonce ${Number(preTest3Nonce) + 1} BEFORE nonce ${preTest3Nonce}...`);

  // Send future nonce first
  const futureNonceResult = await walletClient.sendTransaction({
    to: account.address,
    value: 0n,
    nonce: Number(preTest3Nonce) + 1, // Future nonce
  }).then(hash => ({ success: true, hash }))
    .catch(err => ({ success: false, error: err instanceof Error ? err.message.slice(0, 100) : String(err) }));

  console.log(`Future nonce (${Number(preTest3Nonce) + 1}): ${futureNonceResult.success ? `SUCCESS - ${(futureNonceResult as {hash: string}).hash}` : `FAILED - ${(futureNonceResult as {error: string}).error}`}`);

  // Small delay
  await new Promise(r => setTimeout(r, 100));

  // Send current nonce
  const currentNonceResult = await walletClient.sendTransaction({
    to: account.address,
    value: 0n,
    nonce: Number(preTest3Nonce), // Current nonce
  }).then(hash => ({ success: true, hash }))
    .catch(err => ({ success: false, error: err instanceof Error ? err.message.slice(0, 100) : String(err) }));

  console.log(`Current nonce (${preTest3Nonce}): ${currentNonceResult.success ? `SUCCESS - ${(currentNonceResult as {hash: string}).hash}` : `FAILED - ${(currentNonceResult as {error: string}).error}`}`);

  await new Promise(r => setTimeout(r, 3000));

  const postTest3Balance = await client.getBalance({ address: account.address });
  const postTest3Nonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nAfter: Balance=${formatEther(postTest3Balance)}, Nonce=${postTest3Nonce}`);
  console.log(`Nonce change: ${postTest3Nonce - preTest3Nonce}`);
  console.log(`Balance change: ${formatEther(postTest3Balance - preTest3Balance)} ETH`);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n\n' + '═'.repeat(60));
  console.log('                         SUMMARY');
  console.log('═'.repeat(60));

  const finalBalance = await client.getBalance({ address: account.address });
  const finalNonce = await client.getTransactionCount({ address: account.address });

  console.log(`\nFinal State:`);
  console.log(`  Balance: ${formatEther(finalBalance)} ETH`);
  console.log(`  Nonce: ${finalNonce}`);
  console.log(`\nTotal balance change: ${formatEther(finalBalance - initialBalance)} ETH`);
  console.log(`Total nonce change: ${finalNonce - initialNonce}`);

  console.log('\nAnalysis:');
  console.log(`  If nonce only incremented for successful txs, failed txs were rejected pre-execution`);
  console.log(`  If balance decreased more than successful tx gas, failed txs consumed gas`);
}

main().catch(console.error);
