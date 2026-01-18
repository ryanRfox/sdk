/**
 * RPC Behavior Test
 *
 * Comprehensive test of Radius testnet transaction submission patterns:
 * 1. Sequential (baseline)
 * 2. Parallel individual requests (Promise.all with separate HTTP requests)
 * 3. JSON-RPC batch (single HTTP request with multiple transactions)
 *
 * Run with: RADIUS_PRIVATE_KEY=0x... npx tsx research/rpc-behavior-test.ts
 */

import {
  createPublicClient,
  http,
  createWalletClient,
  type Hex,
  type TransactionSerializable,
  serializeTransaction,
  keccak256,
} from 'viem';
import { privateKeyToAccount, signTransaction } from 'viem/accounts';
import { defineChain } from 'viem';

const radiusTestnet = defineChain({
  id: 1223953,
  name: 'Radius Testnet',
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.radiustech.xyz'] } },
});

const RPC_URL = 'https://rpc.testnet.radiustech.xyz';
const PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY as Hex | undefined;

if (!PRIVATE_KEY) {
  console.error('RADIUS_PRIVATE_KEY environment variable required');
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);

const TX_COUNT = 3;
const ITERATIONS = 3;
const SETTLE_TIME = 3000;

interface TxResult {
  index: number;
  nonce: number;
  success: boolean;
  hash?: string;
  error?: string;
}

interface TestResult {
  name: string;
  method: string;
  iterations: Array<{
    results: TxResult[];
    successCount: number;
  }>;
  avgSuccessRate: number;
}

const allResults: TestResult[] = [];

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Sign a transaction and return the raw serialized hex
 */
async function signRawTransaction(
  nonce: number,
  value: bigint
): Promise<{ raw: Hex; hash: Hex }> {
  const tx: TransactionSerializable = {
    to: account.address,
    value,
    nonce,
    chainId: radiusTestnet.id,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    gas: 21000n,
    type: 'eip1559',
  };

  const signed = await signTransaction({ privateKey: PRIVATE_KEY!, transaction: tx });
  const hash = keccak256(signed);

  return { raw: signed, hash };
}

/**
 * Send a JSON-RPC request directly
 */
async function sendRpcRequest(body: unknown): Promise<unknown> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

/**
 * TEST 1: Sequential submission (baseline)
 */
async function testSequential(
  walletClient: ReturnType<typeof createWalletClient>
): Promise<TxResult[]> {
  const results: TxResult[] = [];

  for (let i = 0; i < TX_COUNT; i++) {
    try {
      const hash = await walletClient.sendTransaction({
        to: account.address,
        value: BigInt(i + 1),
      });
      results.push({ index: i, nonce: -1, success: true, hash });
    } catch (err) {
      results.push({
        index: i,
        nonce: -1,
        success: false,
        error: err instanceof Error ? err.message.slice(0, 50) : String(err),
      });
    }
  }

  return results;
}

/**
 * TEST 2: Parallel individual HTTP requests
 */
async function testParallelIndividual(
  walletClient: ReturnType<typeof createWalletClient>,
  client: ReturnType<typeof createPublicClient>
): Promise<TxResult[]> {
  const startNonce = await client.getTransactionCount({ address: account.address });

  const promises = Array.from({ length: TX_COUNT }, async (_, i) => {
    const nonce = Number(startNonce) + i;
    try {
      const hash = await walletClient.sendTransaction({
        to: account.address,
        value: BigInt(i + 1),
        nonce,
      });
      return { index: i, nonce, success: true, hash };
    } catch (err) {
      return {
        index: i,
        nonce,
        success: false,
        error: err instanceof Error && err.message.includes('Exec Failed')
          ? 'Exec Failed'
          : (err instanceof Error ? err.message.slice(0, 50) : String(err)),
      };
    }
  });

  return Promise.all(promises);
}

/**
 * TEST 3: JSON-RPC batch request (single HTTP request)
 */
async function testJsonRpcBatch(
  client: ReturnType<typeof createPublicClient>
): Promise<TxResult[]> {
  const startNonce = await client.getTransactionCount({ address: account.address });

  // Sign all transactions first
  const signedTxs = await Promise.all(
    Array.from({ length: TX_COUNT }, (_, i) =>
      signRawTransaction(Number(startNonce) + i, BigInt(i + 1))
    )
  );

  // Build batch request
  const batchRequest = signedTxs.map((tx, i) => ({
    jsonrpc: '2.0',
    id: i + 1,
    method: 'eth_sendRawTransaction',
    params: [tx.raw],
  }));

  console.log(`    Sending batch request with ${batchRequest.length} transactions...`);

  // Send single HTTP request with all transactions
  const response = (await sendRpcRequest(batchRequest)) as Array<{
    id: number;
    result?: string;
    error?: { message: string; data?: string };
  }>;

  // Parse results
  const results: TxResult[] = response.map((r, i) => {
    const nonce = Number(startNonce) + i;
    if (r.result) {
      return { index: i, nonce, success: true, hash: r.result };
    } else {
      const errorMsg = r.error?.data || r.error?.message || 'Unknown error';
      return {
        index: i,
        nonce,
        success: false,
        error: errorMsg.includes('Exec Failed') ? 'Exec Failed' : errorMsg.slice(0, 50),
      };
    }
  });

  return results;
}

/**
 * TEST 4: JSON-RPC batch with staggered signing (test if order matters)
 */
async function testJsonRpcBatchReverseOrder(
  client: ReturnType<typeof createPublicClient>
): Promise<TxResult[]> {
  const startNonce = await client.getTransactionCount({ address: account.address });

  // Sign transactions in REVERSE nonce order
  const signedTxs: Array<{ raw: Hex; hash: Hex; nonce: number; index: number }> = [];
  for (let i = TX_COUNT - 1; i >= 0; i--) {
    const nonce = Number(startNonce) + i;
    const signed = await signRawTransaction(nonce, BigInt(i + 1));
    signedTxs.push({ ...signed, nonce, index: i });
  }

  // Build batch request (reverse order: highest nonce first)
  const batchRequest = signedTxs.map((tx, i) => ({
    jsonrpc: '2.0',
    id: i + 1,
    method: 'eth_sendRawTransaction',
    params: [tx.raw],
  }));

  console.log(`    Sending batch (reverse order): nonces ${signedTxs.map(t => t.nonce).join(', ')}...`);

  const response = (await sendRpcRequest(batchRequest)) as Array<{
    id: number;
    result?: string;
    error?: { message: string; data?: string };
  }>;

  // Parse results (map back to original index)
  const results: TxResult[] = response.map((r, i) => {
    const tx = signedTxs[i];
    if (r.result) {
      return { index: tx.index, nonce: tx.nonce, success: true, hash: r.result };
    } else {
      const errorMsg = r.error?.data || r.error?.message || 'Unknown error';
      return {
        index: tx.index,
        nonce: tx.nonce,
        success: false,
        error: errorMsg.includes('Exec Failed') ? 'Exec Failed' : errorMsg.slice(0, 50),
      };
    }
  });

  return results.sort((a, b) => a.index - b.index);
}

async function runTest(
  name: string,
  method: string,
  testFn: () => Promise<TxResult[]>
): Promise<TestResult> {
  console.log(`\n  ${name}`);
  console.log(`  Method: ${method}`);

  const iterations: TestResult['iterations'] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const results = await testFn();
    const successCount = results.filter((r) => r.success).length;
    iterations.push({ results, successCount });

    const status = successCount === TX_COUNT ? '✓' : '✗';
    const details = results.map((r) => (r.success ? '✓' : '✗')).join('');
    console.log(`    Run ${i + 1}: ${successCount}/${TX_COUNT} ${status} [${details}]`);

    if (results.some((r) => !r.success)) {
      const failures = results.filter((r) => !r.success);
      failures.forEach((f) => console.log(`      nonce ${f.nonce}: ${f.error}`));
    }

    await sleep(SETTLE_TIME);
  }

  const totalSuccess = iterations.reduce((sum, it) => sum + it.successCount, 0);
  const avgSuccessRate = totalSuccess / (iterations.length * TX_COUNT);

  console.log(`  Average: ${(avgSuccessRate * 100).toFixed(0)}% success`);

  const result: TestResult = { name, method, iterations, avgSuccessRate };
  allResults.push(result);
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
  console.log('║           RPC BEHAVIOR TEST - RADIUS TESTNET               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Account: ${account.address}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Config: ${TX_COUNT} txs × ${ITERATIONS} iterations`);

  const startNonce = await client.getTransactionCount({ address: account.address });
  console.log(`Starting Nonce: ${startNonce}`);

  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 1: SEQUENTIAL (baseline)');
  console.log('═'.repeat(60));

  await runTest(
    'Sequential Submission',
    'Await each tx before sending next',
    () => testSequential(walletClient)
  );

  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 2: PARALLEL INDIVIDUAL REQUESTS');
  console.log('═'.repeat(60));

  await runTest(
    'Parallel Individual HTTP Requests',
    'Promise.all() with separate HTTP POST per tx',
    () => testParallelIndividual(walletClient, client)
  );

  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 3: JSON-RPC BATCH (single HTTP request)');
  console.log('═'.repeat(60));

  await runTest(
    'JSON-RPC Batch Request',
    'Single HTTP POST with array of eth_sendRawTransaction',
    () => testJsonRpcBatch(client)
  );

  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 4: JSON-RPC BATCH (reverse nonce order)');
  console.log('═'.repeat(60));

  await runTest(
    'JSON-RPC Batch (Reverse Order)',
    'Single HTTP POST, highest nonce first in array',
    () => testJsonRpcBatchReverseOrder(client)
  );

  // ============================================================
  console.log('\n\n' + '═'.repeat(60));
  console.log('                         SUMMARY');
  console.log('═'.repeat(60));

  const finalNonce = await client.getTransactionCount({ address: account.address });
  console.log(`\nFinal Nonce: ${finalNonce} (started at ${startNonce})`);

  console.log('\nResults:');
  console.log('─'.repeat(60));
  console.log('Test                              | Method              | Success');
  console.log('─'.repeat(60));

  allResults.forEach((r) => {
    const name = r.name.padEnd(33);
    const method = r.method.slice(0, 19).padEnd(19);
    const rate = `${(r.avgSuccessRate * 100).toFixed(0)}%`.padStart(4);
    console.log(`${name} | ${method} | ${rate}`);
  });

  console.log('─'.repeat(60));

  // Analysis
  console.log('\nANALYSIS:');

  const sequential = allResults.find((r) => r.name.includes('Sequential'));
  const parallel = allResults.find((r) => r.name.includes('Parallel'));
  const batch = allResults.find((r) => r.name === 'JSON-RPC Batch Request');
  const batchReverse = allResults.find((r) => r.name.includes('Reverse'));

  if (sequential && parallel) {
    console.log(`  Sequential vs Parallel: ${(sequential.avgSuccessRate * 100).toFixed(0)}% vs ${(parallel.avgSuccessRate * 100).toFixed(0)}%`);
  }

  if (parallel && batch) {
    if (batch.avgSuccessRate > parallel.avgSuccessRate) {
      console.log(`  ✓ JSON-RPC batch IMPROVES success rate over parallel individual`);
    } else if (batch.avgSuccessRate === parallel.avgSuccessRate) {
      console.log(`  = JSON-RPC batch has SAME success rate as parallel individual`);
    } else {
      console.log(`  ✗ JSON-RPC batch is WORSE than parallel individual`);
    }
  }

  if (batch && batchReverse) {
    if (batch.avgSuccessRate === batchReverse.avgSuccessRate) {
      console.log(`  = Nonce order in batch does NOT affect success rate`);
    } else {
      console.log(`  ! Nonce order in batch DOES affect success rate`);
    }
  }

  // Write results
  const fs = await import('fs');
  fs.writeFileSync(
    './research/rpc-behavior-results.json',
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        account: account.address,
        startNonce: Number(startNonce),
        finalNonce: Number(finalNonce),
        results: allResults,
      },
      null,
      2
    )
  );
  console.log('\nResults written to: ./research/rpc-behavior-results.json');
}

main().catch(console.error);
