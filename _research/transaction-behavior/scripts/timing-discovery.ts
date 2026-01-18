/**
 * Timing Discovery Script
 *
 * Finds the minimum delay between transaction submissions required for
 * 100% success rate on Radius testnet.
 *
 * Tests TWO submission patterns:
 * 1. TRUE PARALLEL: All transactions fired simultaneously via Promise.all
 * 2. STAGGERED: Transactions sent with delays, but not awaited until all fired
 *
 * Run with: RADIUS_PRIVATE_KEY=0x... npx tsx research/timing-discovery.ts
 */

import { createPublicClient, http, createWalletClient, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import * as fs from 'fs';

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

// Configuration
const TX_COUNT = 3;
const ITERATIONS_PER_TEST = 5;
const SETTLE_TIME_MS = 3000;
const MAX_DELAY_MS = 500;
const DELAY_INCREMENT_MS = 50;

interface TxResult {
  index: number;
  nonce: number;
  success: boolean;
  hash?: string;
  error?: string;
  durationMs: number;
}

interface TestRun {
  pattern: string;
  delayMs: number;
  iteration: number;
  results: TxResult[];
  successCount: number;
  totalDurationMs: number;
}

interface PatternStats {
  pattern: string;
  delayMs: number;
  runs: TestRun[];
  successRate: number;
  allRunsFullySucceeded: boolean;
}

const allStats: PatternStats[] = [];

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * TRUE PARALLEL: Fire all transactions at once with explicit nonces
 */
async function testTrueParallel(
  walletClient: ReturnType<typeof createWalletClient>,
  client: ReturnType<typeof createPublicClient>,
  iteration: number
): Promise<TestRun> {
  const startNonce = await client.getTransactionCount({ address: account.address });
  const testStart = Date.now();

  // Fire all transactions simultaneously
  const promises = Array.from({ length: TX_COUNT }, (_, i) => {
    const txNonce = Number(startNonce) + i;
    const txStart = Date.now();

    return walletClient
      .sendTransaction({
        to: account.address,
        value: BigInt(i + 1),
        nonce: txNonce,
      })
      .then(hash => ({
        index: i,
        nonce: txNonce,
        success: true as const,
        hash,
        durationMs: Date.now() - txStart,
      }))
      .catch(err => ({
        index: i,
        nonce: txNonce,
        success: false as const,
        error: err instanceof Error && err.message.includes('Exec Failed')
          ? 'Exec Failed'
          : (err instanceof Error ? err.message.slice(0, 80) : String(err)),
        durationMs: Date.now() - txStart,
      }));
  });

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;

  return {
    pattern: 'TRUE_PARALLEL',
    delayMs: 0,
    iteration,
    results: results.sort((a, b) => a.index - b.index),
    successCount,
    totalDurationMs: Date.now() - testStart,
  };
}

/**
 * STAGGERED PARALLEL: Fire transactions with delays between them,
 * but don't await each one - collect all promises and await at end
 */
async function testStaggeredParallel(
  walletClient: ReturnType<typeof createWalletClient>,
  client: ReturnType<typeof createPublicClient>,
  delayMs: number,
  iteration: number
): Promise<TestRun> {
  const startNonce = await client.getTransactionCount({ address: account.address });
  const testStart = Date.now();
  const promises: Promise<TxResult>[] = [];

  for (let i = 0; i < TX_COUNT; i++) {
    const txNonce = Number(startNonce) + i;
    const txStart = Date.now();

    // Fire the transaction (don't await)
    const promise = walletClient
      .sendTransaction({
        to: account.address,
        value: BigInt(i + 1),
        nonce: txNonce,
      })
      .then(hash => ({
        index: i,
        nonce: txNonce,
        success: true as const,
        hash,
        durationMs: Date.now() - txStart,
      }))
      .catch(err => ({
        index: i,
        nonce: txNonce,
        success: false as const,
        error: err instanceof Error && err.message.includes('Exec Failed')
          ? 'Exec Failed'
          : (err instanceof Error ? err.message.slice(0, 80) : String(err)),
        durationMs: Date.now() - txStart,
      }));

    promises.push(promise);

    // Delay before firing next (except after last)
    if (i < TX_COUNT - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  // Now await all
  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;

  return {
    pattern: 'STAGGERED_PARALLEL',
    delayMs,
    iteration,
    results: results.sort((a, b) => a.index - b.index),
    successCount,
    totalDurationMs: Date.now() - testStart,
  };
}

/**
 * SEQUENTIAL: Await each transaction before sending next (baseline)
 */
async function testSequential(
  walletClient: ReturnType<typeof createWalletClient>,
  _client: ReturnType<typeof createPublicClient>,
  iteration: number
): Promise<TestRun> {
  const testStart = Date.now();
  const results: TxResult[] = [];

  for (let i = 0; i < TX_COUNT; i++) {
    const txStart = Date.now();

    try {
      const hash = await walletClient.sendTransaction({
        to: account.address,
        value: BigInt(i + 1),
      });
      results.push({
        index: i,
        nonce: -1, // auto
        success: true,
        hash,
        durationMs: Date.now() - txStart,
      });
    } catch (err) {
      results.push({
        index: i,
        nonce: -1,
        success: false,
        error: err instanceof Error && err.message.includes('Exec Failed')
          ? 'Exec Failed'
          : (err instanceof Error ? err.message.slice(0, 80) : String(err)),
        durationMs: Date.now() - txStart,
      });
    }
  }

  return {
    pattern: 'SEQUENTIAL',
    delayMs: 0,
    iteration,
    results,
    successCount: results.filter(r => r.success).length,
    totalDurationMs: Date.now() - testStart,
  };
}

async function runPatternTest(
  name: string,
  delayMs: number,
  testFn: (iteration: number) => Promise<TestRun>
): Promise<PatternStats> {
  console.log(`\n  ${name} (delay: ${delayMs}ms)...`);
  const runs: TestRun[] = [];

  for (let i = 0; i < ITERATIONS_PER_TEST; i++) {
    const run = await testFn(i + 1);
    runs.push(run);

    const status = run.successCount === TX_COUNT ? '✓' : '✗';
    const failures = run.results.filter(r => !r.success);
    const failInfo = failures.length > 0 ? ` [${failures.map(f => f.error).join(', ')}]` : '';
    console.log(
      `    Run ${i + 1}: ${run.successCount}/${TX_COUNT} ${status} (${run.totalDurationMs}ms)${failInfo}`
    );

    await sleep(SETTLE_TIME_MS);
  }

  const totalTx = runs.length * TX_COUNT;
  const totalSuccess = runs.reduce((sum, r) => sum + r.successCount, 0);
  const successRate = totalSuccess / totalTx;
  const allRunsFullySucceeded = runs.every(r => r.successCount === TX_COUNT);

  const stats: PatternStats = {
    pattern: name,
    delayMs,
    runs,
    successRate,
    allRunsFullySucceeded,
  };
  allStats.push(stats);

  console.log(`    => ${(successRate * 100).toFixed(0)}% success rate, all runs passed: ${allRunsFullySucceeded ? 'YES' : 'NO'}`);

  return stats;
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
  console.log('║       RADIUS TESTNET TIMING DISCOVERY v2                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Account: ${account.address}`);
  console.log(`Configuration:`);
  console.log(`  - Transactions per test: ${TX_COUNT}`);
  console.log(`  - Iterations per pattern: ${ITERATIONS_PER_TEST}`);
  console.log(`  - Settle time between runs: ${SETTLE_TIME_MS}ms`);

  const startingNonce = await client.getTransactionCount({ address: account.address });
  console.log(`\nStarting Nonce: ${startingNonce}`);

  // ============================================================
  // TEST 1: Sequential baseline (should always work)
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 1: SEQUENTIAL (baseline - await each tx)');
  console.log('═'.repeat(60));

  await runPatternTest('SEQUENTIAL', 0, (iter) => testSequential(walletClient, client, iter));

  // ============================================================
  // TEST 2: True parallel (all at once)
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 2: TRUE PARALLEL (all fired simultaneously)');
  console.log('═'.repeat(60));

  await runPatternTest('TRUE_PARALLEL', 0, (iter) => testTrueParallel(walletClient, client, iter));

  // ============================================================
  // TEST 3: Staggered parallel with increasing delays
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 3: STAGGERED PARALLEL (find optimal delay)');
  console.log('═'.repeat(60));

  let optimalDelay: number | null = null;

  for (let delay = DELAY_INCREMENT_MS; delay <= MAX_DELAY_MS; delay += DELAY_INCREMENT_MS) {
    const stats = await runPatternTest(
      `STAGGERED_${delay}ms`,
      delay,
      (iter) => testStaggeredParallel(walletClient, client, delay, iter)
    );

    if (stats.allRunsFullySucceeded && optimalDelay === null) {
      optimalDelay = delay;
      console.log(`    ✓ FOUND OPTIMAL: ${delay}ms`);

      // Run a few more iterations to confirm
      console.log(`    Confirming with 3 more runs...`);
      let confirmations = 0;
      for (let i = 0; i < 3; i++) {
        const run = await testStaggeredParallel(walletClient, client, delay, 100 + i);
        if (run.successCount === TX_COUNT) confirmations++;
        await sleep(SETTLE_TIME_MS);
      }
      console.log(`    Confirmation: ${confirmations}/3 passed`);
      if (confirmations === 3) {
        break; // Confirmed, stop testing higher delays
      } else {
        optimalDelay = null; // Not reliable, continue
        console.log(`    Not reliable, continuing...`);
      }
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n\n' + '═'.repeat(60));
  console.log('                         SUMMARY');
  console.log('═'.repeat(60));

  const finalNonce = await client.getTransactionCount({ address: account.address });
  console.log(`\nFinal Nonce: ${finalNonce} (started at ${startingNonce})`);
  console.log(`Total transactions: ${Number(finalNonce) - Number(startingNonce)}`);

  console.log('\nResults by pattern:');
  console.log('─'.repeat(60));
  console.log('Pattern                    | Delay | Success | All Passed?');
  console.log('─'.repeat(60));

  allStats.forEach(stats => {
    const pattern = stats.pattern.padEnd(26);
    const delay = `${stats.delayMs}ms`.padStart(5);
    const rate = `${(stats.successRate * 100).toFixed(0)}%`.padStart(4);
    const allPassed = stats.allRunsFullySucceeded ? '✓ Yes' : '✗ No';
    console.log(`${pattern} | ${delay} |   ${rate}   | ${allPassed}`);
  });

  console.log('─'.repeat(60));

  // Analysis
  console.log('\nANALYSIS:');

  const seqStats = allStats.find(s => s.pattern === 'SEQUENTIAL');
  const parallelStats = allStats.find(s => s.pattern === 'TRUE_PARALLEL');

  if (seqStats) {
    console.log(`  Sequential: ${(seqStats.successRate * 100).toFixed(0)}% success`);
  }
  if (parallelStats) {
    console.log(`  True Parallel: ${(parallelStats.successRate * 100).toFixed(0)}% success`);
  }

  if (optimalDelay !== null) {
    console.log(`\n  OPTIMAL STAGGER DELAY: ${optimalDelay}ms`);
  } else {
    const bestStaggered = allStats
      .filter(s => s.pattern.startsWith('STAGGERED_'))
      .sort((a, b) => b.successRate - a.successRate)[0];
    if (bestStaggered) {
      console.log(`\n  Best staggered delay found: ${bestStaggered.delayMs}ms (${(bestStaggered.successRate * 100).toFixed(0)}% success, but not 100% reliable)`);
    }
  }

  // Write results
  const outputPath = './research/timing-results.json';
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        account: account.address,
        startingNonce: Number(startingNonce),
        finalNonce: Number(finalNonce),
        optimalDelayMs: optimalDelay,
        stats: allStats,
      },
      null,
      2
    )
  );
  console.log(`\nDetailed results written to: ${outputPath}`);
}

main().catch(console.error);
