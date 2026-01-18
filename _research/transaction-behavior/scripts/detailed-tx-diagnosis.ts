/**
 * Detailed Transaction Failure Diagnosis
 *
 * This script performs systematic testing to diagnose the root cause of
 * "Exec Failed" errors on Radius testnet.
 *
 * Hypotheses to test:
 * 1. Nonce race condition - parallel requests without explicit nonces get same nonce
 * 2. RPC rejects concurrent requests regardless of nonce correctness
 * 3. Timing/ordering issue in mempool
 *
 * Run with: RADIUS_PRIVATE_KEY=0x... npx tsx research/detailed-tx-diagnosis.ts
 */

import { createPublicClient, http, createWalletClient, type Hex } from 'viem';
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

interface TestResult {
  testName: string;
  hypothesis: string;
  transactions: Array<{
    index: number;
    nonce: number | 'auto';
    success: boolean;
    hash?: string;
    error?: {
      name: string;
      message: string;
      details?: unknown;
      cause?: unknown;
    };
    durationMs: number;
  }>;
  conclusion: string;
}

const results: TestResult[] = [];

async function captureError(err: unknown): Promise<{
  name: string;
  message: string;
  details?: unknown;
  cause?: unknown;
}> {
  if (err instanceof Error) {
    const errorObj: ReturnType<typeof captureError> extends Promise<infer T> ? T : never = {
      name: err.name,
      message: err.message,
    };

    // Capture additional properties that viem errors might have
    if ('details' in err) errorObj.details = (err as Record<string, unknown>).details;
    if ('cause' in err) {
      const cause = (err as Record<string, unknown>).cause;
      if (cause instanceof Error) {
        errorObj.cause = {
          name: cause.name,
          message: cause.message,
          ...(('details' in cause) ? { details: (cause as Record<string, unknown>).details } : {}),
        };
      } else {
        errorObj.cause = cause;
      }
    }

    return errorObj;
  }
  return { name: 'Unknown', message: String(err) };
}

async function runTest(
  testName: string,
  hypothesis: string,
  testFn: () => Promise<TestResult['transactions']>
): Promise<TestResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`HYPOTHESIS: ${hypothesis}`);
  console.log('='.repeat(60));

  const transactions = await testFn();

  const successes = transactions.filter(t => t.success).length;
  const failures = transactions.filter(t => !t.success).length;

  let conclusion: string;
  if (failures === 0) {
    conclusion = 'ALL PASSED - Hypothesis may be incorrect';
  } else if (successes === 0) {
    conclusion = 'ALL FAILED - Need to examine errors';
  } else {
    conclusion = `PARTIAL: ${successes} passed, ${failures} failed - Mixed results`;
  }

  console.log(`\nRESULT: ${conclusion}`);

  // Print transaction details
  transactions.forEach((tx, i) => {
    console.log(`\n  TX ${i + 1} (nonce=${tx.nonce}):`);
    console.log(`    Status: ${tx.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`    Duration: ${tx.durationMs}ms`);
    if (tx.hash) console.log(`    Hash: ${tx.hash}`);
    if (tx.error) {
      console.log(`    Error Name: ${tx.error.name}`);
      console.log(`    Error Message: ${tx.error.message}`);
      if (tx.error.details) console.log(`    Error Details: ${JSON.stringify(tx.error.details)}`);
      if (tx.error.cause) console.log(`    Error Cause: ${JSON.stringify(tx.error.cause)}`);
    }
  });

  const result: TestResult = { testName, hypothesis, transactions, conclusion };
  results.push(result);
  return result;
}

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
  console.log('║     RADIUS TESTNET TRANSACTION FAILURE DIAGNOSIS           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Account: ${account.address}`);
  console.log(`RPC: https://rpc.testnet.radiustech.xyz`);

  const startingNonce = await client.getTransactionCount({ address: account.address });
  console.log(`Starting Nonce: ${startingNonce}`);

  // ============================================================
  // TEST 1: Parallel without explicit nonces (baseline)
  // ============================================================
  await runTest(
    'Parallel WITHOUT explicit nonces',
    'viem fetches nonce for each tx, causing race condition where multiple txs get same nonce',
    async () => {
      const txResults: TestResult['transactions'] = [];

      const promises = [0, 1, 2].map(async (i) => {
        const start = Date.now();
        try {
          const hash = await walletClient.sendTransaction({
            to: account.address,
            value: BigInt(i + 1),
          });
          txResults.push({
            index: i,
            nonce: 'auto',
            success: true,
            hash,
            durationMs: Date.now() - start,
          });
        } catch (err) {
          txResults.push({
            index: i,
            nonce: 'auto',
            success: false,
            error: await captureError(err),
            durationMs: Date.now() - start,
          });
        }
      });

      await Promise.all(promises);
      return txResults.sort((a, b) => a.index - b.index);
    }
  );

  // Wait for any pending txs to settle
  await new Promise(r => setTimeout(r, 2000));

  // ============================================================
  // TEST 2: Parallel WITH explicit sequential nonces
  // ============================================================
  const nonce2 = await client.getTransactionCount({ address: account.address });
  console.log(`\nFetched nonce for Test 2: ${nonce2}`);

  await runTest(
    'Parallel WITH explicit sequential nonces',
    'If this still fails, the issue is NOT nonce-related but RPC concurrency handling',
    async () => {
      const txResults: TestResult['transactions'] = [];

      const promises = [0, 1, 2].map(async (i) => {
        const txNonce = Number(nonce2) + i;
        const start = Date.now();
        try {
          const hash = await walletClient.sendTransaction({
            to: account.address,
            value: BigInt(i + 1),
            nonce: txNonce,
          });
          txResults.push({
            index: i,
            nonce: txNonce,
            success: true,
            hash,
            durationMs: Date.now() - start,
          });
        } catch (err) {
          txResults.push({
            index: i,
            nonce: txNonce,
            success: false,
            error: await captureError(err),
            durationMs: Date.now() - start,
          });
        }
      });

      await Promise.all(promises);
      return txResults.sort((a, b) => a.index - b.index);
    }
  );

  // Wait for any pending txs to settle
  await new Promise(r => setTimeout(r, 2000));

  // ============================================================
  // TEST 3: Staggered parallel with explicit nonces (small delays)
  // ============================================================
  const nonce3 = await client.getTransactionCount({ address: account.address });
  console.log(`\nFetched nonce for Test 3: ${nonce3}`);

  await runTest(
    'Staggered parallel (10ms delays) WITH explicit nonces',
    'If small delays help, the RPC may have ordering sensitivity',
    async () => {
      const txResults: TestResult['transactions'] = [];

      const promises = [0, 1, 2].map(async (i) => {
        // Small stagger: 0ms, 10ms, 20ms
        await new Promise(r => setTimeout(r, i * 10));

        const txNonce = Number(nonce3) + i;
        const start = Date.now();
        try {
          const hash = await walletClient.sendTransaction({
            to: account.address,
            value: BigInt(i + 1),
            nonce: txNonce,
          });
          txResults.push({
            index: i,
            nonce: txNonce,
            success: true,
            hash,
            durationMs: Date.now() - start,
          });
        } catch (err) {
          txResults.push({
            index: i,
            nonce: txNonce,
            success: false,
            error: await captureError(err),
            durationMs: Date.now() - start,
          });
        }
      });

      await Promise.all(promises);
      return txResults.sort((a, b) => a.index - b.index);
    }
  );

  // Wait for any pending txs to settle
  await new Promise(r => setTimeout(r, 2000));

  // ============================================================
  // TEST 4: Sequential baseline (should always work)
  // ============================================================
  await runTest(
    'Sequential (awaited) transactions',
    'Baseline - sequential should always work',
    async () => {
      const txResults: TestResult['transactions'] = [];

      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        try {
          const hash = await walletClient.sendTransaction({
            to: account.address,
            value: BigInt(i + 1),
          });
          txResults.push({
            index: i,
            nonce: 'auto',
            success: true,
            hash,
            durationMs: Date.now() - start,
          });
        } catch (err) {
          txResults.push({
            index: i,
            nonce: 'auto',
            success: false,
            error: await captureError(err),
            durationMs: Date.now() - start,
          });
        }
      }

      return txResults;
    }
  );

  // Wait for any pending txs to settle
  await new Promise(r => setTimeout(r, 2000));

  // ============================================================
  // TEST 5: Parallel with nonces sent in REVERSE order
  // ============================================================
  const nonce5 = await client.getTransactionCount({ address: account.address });
  console.log(`\nFetched nonce for Test 5: ${nonce5}`);

  await runTest(
    'Parallel with nonces in REVERSE order (n+2, n+1, n)',
    'Tests if RPC requires nonces to arrive in order',
    async () => {
      const txResults: TestResult['transactions'] = [];

      // Send in reverse order: nonce+2 first, then nonce+1, then nonce
      const indices = [2, 1, 0];

      const promises = indices.map(async (i, arrIdx) => {
        // Small stagger to ensure ordering
        await new Promise(r => setTimeout(r, arrIdx * 5));

        const txNonce = Number(nonce5) + i;
        const start = Date.now();
        try {
          const hash = await walletClient.sendTransaction({
            to: account.address,
            value: BigInt(i + 1),
            nonce: txNonce,
          });
          txResults.push({
            index: i,
            nonce: txNonce,
            success: true,
            hash,
            durationMs: Date.now() - start,
          });
        } catch (err) {
          txResults.push({
            index: i,
            nonce: txNonce,
            success: false,
            error: await captureError(err),
            durationMs: Date.now() - start,
          });
        }
      });

      await Promise.all(promises);
      return txResults.sort((a, b) => a.index - b.index);
    }
  );

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n\n' + '═'.repeat(60));
  console.log('                         SUMMARY');
  console.log('═'.repeat(60));

  const finalNonce = await client.getTransactionCount({ address: account.address });
  console.log(`\nFinal Nonce: ${finalNonce} (started at ${startingNonce})`);
  console.log(`Total successful transactions: ${Number(finalNonce) - Number(startingNonce)}`);

  console.log('\nTest Results:');
  results.forEach((r, i) => {
    const passed = r.transactions.filter(t => t.success).length;
    const total = r.transactions.length;
    console.log(`  ${i + 1}. ${r.testName}: ${passed}/${total} passed`);
  });

  // Analyze error patterns
  console.log('\nError Analysis:');
  const allErrors = results.flatMap(r => r.transactions.filter(t => !t.success));
  if (allErrors.length === 0) {
    console.log('  No errors to analyze');
  } else {
    const errorTypes = new Map<string, number>();
    allErrors.forEach(t => {
      const key = t.error?.details ? String(t.error.details) : t.error?.message || 'unknown';
      errorTypes.set(key, (errorTypes.get(key) || 0) + 1);
    });
    errorTypes.forEach((count, type) => {
      console.log(`  "${type}": ${count} occurrences`);
    });
  }

  // Write detailed results to file
  const outputPath = './research/diagnosis-results.json';
  const fs = await import('fs');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    account: account.address,
    startingNonce: Number(startingNonce),
    finalNonce: Number(finalNonce),
    results,
  }, null, 2));
  console.log(`\nDetailed results written to: ${outputPath}`);
}

main().catch(console.error);
