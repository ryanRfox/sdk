/**
 * Comprehensive Viem vs RadiusClient Testing on Radius Network
 *
 * This test determines what Radius SDK truly needs by testing:
 * 1. Read operations (PublicClient)
 * 2. All transaction types (Legacy, EIP-2930, EIP-1559)
 * 3. Batch transactions (critical for no-mempool)
 * 4. Contract interactions
 * 5. Gas estimation accuracy
 *
 * Run with: cd typescript && npx tsx scripts/viem-radius-comprehensive-test.ts
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  type Hash,
  type TransactionReceipt,
  encodeDeployData,
  type Abi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '../src/chains/index.js';
import { createRadiusClient } from '../src/client/index.js';

// ============================================
// Test Accounts (Anvil well-known keys)
// ============================================
const ACCOUNT_1_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const ACCOUNT_2_PK = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const ACCOUNT_3_PK = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

const account1 = privateKeyToAccount(ACCOUNT_1_PK);
const account2 = privateKeyToAccount(ACCOUNT_2_PK);
const account3 = privateKeyToAccount(ACCOUNT_3_PK);

// Simple counter contract - compiled with solc 0.8.20
// contract Counter {
//   uint256 public count;
//   function get() public view returns (uint256) { return count; }
//   function increment() public { count += 1; }
//   function set(uint256 _count) public { count = _count; }
// }
// Note: Using simpler storage contract for reliability

// ============================================
// Result tracking
// ============================================
interface TestResult {
  name: string;
  passed: boolean;
  hash?: string;
  error?: string;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const status = result.passed ? '  PASS' : '  FAIL';
  console.log(`${status}: ${result.name}`);
  if (result.hash) console.log(`        Hash: ${result.hash}`);
  if (result.error) console.log(`        Error: ${result.error}`);
  if (result.details) {
    for (const [key, value] of Object.entries(result.details)) {
      console.log(`        ${key}: ${value}`);
    }
  }
}

// ============================================
// Setup
// ============================================
const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient1 = createWalletClient({
  account: account1,
  chain: radiusTestnet,
  transport: http(),
});

const radiusClient = createRadiusClient({
  chain: radiusTestnet,
});

// ============================================
// SECTION 1: Read Operations
// ============================================
async function testReadOperations() {
  console.log('\n' + '='.repeat(60));
  console.log('SECTION 1: Read Operations (PublicClient)');
  console.log('='.repeat(60));

  // getBalance
  try {
    const balance = await publicClient.getBalance({ address: account1.address });
    logResult({
      name: 'getBalance()',
      passed: true,
      details: { balance: `${formatEther(balance)} USD` },
    });
  } catch (error) {
    logResult({
      name: 'getBalance()',
      passed: false,
      error: (error as Error).message,
    });
  }

  // getChainId
  try {
    const chainId = await publicClient.getChainId();
    logResult({
      name: 'getChainId()',
      passed: chainId === 1223953,
      details: { chainId },
    });
  } catch (error) {
    logResult({
      name: 'getChainId()',
      passed: false,
      error: (error as Error).message,
    });
  }

  // getBlockNumber
  try {
    const blockNumber = await publicClient.getBlockNumber();
    logResult({
      name: 'getBlockNumber()',
      passed: true,
      details: { blockNumber: blockNumber.toString() },
    });
  } catch (error) {
    logResult({
      name: 'getBlockNumber()',
      passed: false,
      error: (error as Error).message,
    });
  }

  // getGasPrice
  try {
    const gasPrice = await publicClient.getGasPrice();
    logResult({
      name: 'getGasPrice()',
      passed: true,
      details: { gasPrice: gasPrice.toString(), note: gasPrice === 0n ? 'Radius is gasless' : 'Non-zero gas price' },
    });
  } catch (error) {
    logResult({
      name: 'getGasPrice()',
      passed: false,
      error: (error as Error).message,
    });
  }

  // estimateGas - to EOA
  try {
    const gasEstimate = await publicClient.estimateGas({
      account: account1.address,
      to: account2.address,
      value: parseEther('0.0001'),
    });
    logResult({
      name: 'estimateGas() - EOA transfer',
      passed: true,
      details: { gasEstimate: gasEstimate.toString() },
    });
  } catch (error) {
    logResult({
      name: 'estimateGas() - EOA transfer',
      passed: false,
      error: (error as Error).message,
    });
  }

  // getBlock
  try {
    const block = await publicClient.getBlock();
    logResult({
      name: 'getBlock()',
      passed: true,
      details: {
        blockNumber: block.number?.toString(),
        timestamp: block.timestamp.toString(),
        txCount: block.transactions.length,
      },
    });
  } catch (error) {
    logResult({
      name: 'getBlock()',
      passed: false,
      error: (error as Error).message,
    });
  }
}

// ============================================
// SECTION 2: Transaction Types
// ============================================
async function testTransactionTypes() {
  console.log('\n' + '='.repeat(60));
  console.log('SECTION 2: Write Operations - Transaction Types');
  console.log('='.repeat(60));
  console.log(`Sender: ${account1.address}`);
  console.log(`Recipient: ${account2.address} (EOA, not precompile)`);

  const testValue = parseEther('0.00001');

  // Check balance first
  const balance = await publicClient.getBalance({ address: account1.address });
  console.log(`Sender balance: ${formatEther(balance)} USD`);

  if (balance < testValue * 10n) {
    console.log('WARNING: Low balance - some tests may fail');
  }

  // Test 2a: Legacy (Type 0)
  console.log('\n--- Test 2a: Legacy (Type 0) ---');
  try {
    const hash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      gasPrice: 0n,
      type: 'legacy',
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    logResult({
      name: 'Legacy (type: "legacy", gasPrice: 0n)',
      passed: receipt.status === 'success',
      hash,
      details: { status: receipt.status, gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'Legacy (type: "legacy", gasPrice: 0n)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 2b: EIP-2930 (Type 1)
  console.log('\n--- Test 2b: EIP-2930 (Type 1) ---');
  try {
    const hash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      type: 'eip2930',
      accessList: [],
      gasPrice: 0n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    logResult({
      name: 'EIP-2930 (type: "eip2930", accessList: [], gasPrice: 0n)',
      passed: receipt.status === 'success',
      hash,
      details: { status: receipt.status, gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'EIP-2930 (type: "eip2930", accessList: [], gasPrice: 0n)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 2c: EIP-1559 (Type 2)
  console.log('\n--- Test 2c: EIP-1559 (Type 2) ---');
  try {
    const hash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      type: 'eip1559',
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    logResult({
      name: 'EIP-1559 (type: "eip1559", maxFeePerGas: 0n, maxPriorityFeePerGas: 0n)',
      passed: receipt.status === 'success',
      hash,
      details: { status: receipt.status, gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'EIP-1559 (type: "eip1559", maxFeePerGas: 0n, maxPriorityFeePerGas: 0n)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 2d: Default (no type specified)
  console.log('\n--- Test 2d: Default (no type, let viem decide) ---');
  try {
    // First check what viem prepares
    const prepared = await walletClient1.prepareTransactionRequest({
      to: account2.address,
      value: testValue,
    });
    console.log(`  Viem prepared type: ${prepared.type || 'not specified'}`);

    const hash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      // No type, no gas params - pure default
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    logResult({
      name: 'Default (no type specified)',
      passed: receipt.status === 'success',
      hash,
      details: {
        status: receipt.status,
        preparedType: prepared.type,
        gasUsed: receipt.gasUsed.toString(),
      },
    });
  } catch (error) {
    logResult({
      name: 'Default (no type specified)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 2e: Legacy with just gasPrice: 0n (no explicit type)
  console.log('\n--- Test 2e: Just gasPrice: 0n (no explicit type) ---');
  try {
    const hash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      gasPrice: 0n,
      // No type specified - does gasPrice: 0n force legacy?
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    logResult({
      name: 'gasPrice: 0n only (no explicit type)',
      passed: receipt.status === 'success',
      hash,
      details: { status: receipt.status, gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'gasPrice: 0n only (no explicit type)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }
}

// ============================================
// SECTION 3: Batch Transactions
// ============================================
async function testBatchTransactions() {
  console.log('\n' + '='.repeat(60));
  console.log('SECTION 3: Batch Transaction Tests (Critical for No-Mempool)');
  console.log('='.repeat(60));

  const testValue = parseEther('0.00001');
  const recipients = [account2.address, account3.address, account2.address];

  // Test 3a: Sequential WalletClient sends
  console.log('\n--- Test 3a: Sequential WalletClient sends (await each) ---');
  const seqHashes: Hash[] = [];
  const seqStartTime = Date.now();
  try {
    for (let i = 0; i < 3; i++) {
      const hash = await walletClient1.sendTransaction({
        to: recipients[i],
        value: testValue,
        gasPrice: 0n,
        type: 'legacy',
      });
      seqHashes.push(hash);
    }
    const seqTime = Date.now() - seqStartTime;

    // Wait for all receipts
    const receipts = await Promise.all(
      seqHashes.map((h) => publicClient.waitForTransactionReceipt({ hash: h }))
    );
    const allSuccess = receipts.every((r) => r.status === 'success');

    logResult({
      name: 'Sequential WalletClient (3 txs)',
      passed: allSuccess,
      details: {
        count: seqHashes.length,
        timeMs: seqTime,
        hashes: seqHashes.join(', ').slice(0, 100) + '...',
      },
    });
  } catch (error) {
    logResult({
      name: 'Sequential WalletClient (3 txs)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 3b: Parallel WalletClient sends (Promise.all)
  console.log('\n--- Test 3b: Parallel WalletClient sends (Promise.all) ---');
  console.log('  Note: This tests if parallel sends cause nonce collision');
  const parallelStartTime = Date.now();
  try {
    const parallelHashes = await Promise.all(
      recipients.map((to) =>
        walletClient1.sendTransaction({
          to,
          value: testValue,
          gasPrice: 0n,
          type: 'legacy',
        })
      )
    );
    const parallelTime = Date.now() - parallelStartTime;

    // Wait for all receipts
    const receipts = await Promise.all(
      parallelHashes.map((h) => publicClient.waitForTransactionReceipt({ hash: h }))
    );
    const allSuccess = receipts.every((r) => r.status === 'success');

    logResult({
      name: 'Parallel WalletClient (Promise.all, 3 txs)',
      passed: allSuccess,
      details: {
        count: parallelHashes.length,
        timeMs: parallelTime,
        hashes: parallelHashes.join(', ').slice(0, 100) + '...',
      },
    });
  } catch (error) {
    logResult({
      name: 'Parallel WalletClient (Promise.all, 3 txs)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
      details: { note: 'This failure is expected if nonce collision occurs' },
    });
  }

  // Test 3c: RadiusClient.sendTransactionBatch
  console.log('\n--- Test 3c: RadiusClient.sendTransactionBatch ---');
  const batchStartTime = Date.now();
  try {
    const batchHashes = await radiusClient.sendTransactionBatch(account1, [
      { to: recipients[0], value: testValue },
      { to: recipients[1], value: testValue },
      { to: recipients[2], value: testValue },
    ]);
    const batchTime = Date.now() - batchStartTime;

    // Wait for all receipts
    const receipts = await Promise.all(
      batchHashes.map((h) => radiusClient.waitForTransactionReceipt({ hash: h }))
    );
    const allSuccess = receipts.every((r) => r.status === 'success');

    logResult({
      name: 'RadiusClient.sendTransactionBatch (3 txs)',
      passed: allSuccess,
      details: {
        count: batchHashes.length,
        timeMs: batchTime,
        hashes: batchHashes.join(', ').slice(0, 100) + '...',
      },
    });
  } catch (error) {
    logResult({
      name: 'RadiusClient.sendTransactionBatch (3 txs)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }
}

// ============================================
// SECTION 4: Contract Interactions
// ============================================
async function testContractInteractions() {
  console.log('\n' + '='.repeat(60));
  console.log('SECTION 4: Contract Interactions');
  console.log('='.repeat(60));

  // Minimal storage contract - stores and returns a uint256
  // Compiled with solc 0.8.20, optimizer enabled
  // contract Storage { uint256 public value; function set(uint256 v) public { value = v; } }
  const storageBytecode = '0x608060405234801561001057600080fd5b5060f78061001f6000396000f3fe6080604052348015600f57600080fd5b5060043610603c5760003560e01c80633fa4f2451460415780636057361d14605b575b600080fd5b60476071565b604051605291906099565b60405180910390f35b6070600480360381019060689190609a565b607a565b005b60005481565b8060008190555050565b6000819050919050565b6093816082565b82525050565b600060208201905060ac6000830184608c565b92915050565b600080fd5b60be816082565b811460c857600080fd5b50565b60008135905060d88160b7565b92915050565b60006020828403121560f05760ef60b2565b5b600060fc8482850160cb565b9150509291505056fea2646970667358221220c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c564736f6c63430008140033';

  const storageAbi = [
    {
      type: 'function',
      name: 'value',
      inputs: [],
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'set',
      inputs: [{ name: 'v', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ] as const;

  let contractAddress: `0x${string}` | null = null;

  // Test 4a: Deploy contract with RadiusClient
  console.log('\n--- Test 4a: Deploy contract (RadiusClient) ---');
  try {
    const { address, receipt } = await radiusClient.deployContract(
      account1,
      storageBytecode as `0x${string}`,
      storageAbi as unknown as Abi
    );
    contractAddress = address;
    logResult({
      name: 'Deploy contract (RadiusClient)',
      passed: receipt.status === 'success' && !!address,
      hash: receipt.transactionHash,
      details: { contractAddress: address, gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'Deploy contract (RadiusClient)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  if (!contractAddress) {
    console.log('  Skipping contract tests - deployment failed');
    return;
  }

  // Test 4b: Read contract (PublicClient)
  console.log('\n--- Test 4b: Read contract (publicClient.readContract) ---');
  try {
    const value = await publicClient.readContract({
      address: contractAddress,
      abi: storageAbi,
      functionName: 'value',
    });
    logResult({
      name: 'Read contract (publicClient)',
      passed: true,
      details: { value: value?.toString() },
    });
  } catch (error) {
    logResult({
      name: 'Read contract (publicClient)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 4c: Write contract (WalletClient)
  console.log('\n--- Test 4c: Write contract (walletClient.writeContract) ---');
  try {
    const hash = await walletClient1.writeContract({
      address: contractAddress,
      abi: storageAbi,
      functionName: 'set',
      args: [42n],
      gasPrice: 0n,
      type: 'legacy',
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Verify the write worked
    const newValue = await publicClient.readContract({
      address: contractAddress,
      abi: storageAbi,
      functionName: 'value',
    });

    logResult({
      name: 'Write contract (walletClient with gasPrice: 0n)',
      passed: receipt.status === 'success' && newValue === 42n,
      hash,
      details: { newValue: newValue?.toString(), gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'Write contract (walletClient with gasPrice: 0n)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 4d: Write contract (RadiusClient)
  console.log('\n--- Test 4d: Write contract (RadiusClient.writeContract) ---');
  try {
    const hash = await radiusClient.writeContract({
      address: contractAddress,
      abi: storageAbi as unknown as Abi,
      functionName: 'set',
      args: [100n],
      account: account1,
    });
    const receipt = await radiusClient.waitForTransactionReceipt({ hash });

    // Verify the write worked
    const newValue = await publicClient.readContract({
      address: contractAddress,
      abi: storageAbi,
      functionName: 'value',
    });

    logResult({
      name: 'Write contract (RadiusClient)',
      passed: receipt.status === 'success' && newValue === 100n,
      hash,
      details: { newValue: newValue?.toString(), gasUsed: receipt.gasUsed.toString() },
    });
  } catch (error) {
    logResult({
      name: 'Write contract (RadiusClient)',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }
}

// ============================================
// SECTION 5: Gas Estimation Accuracy
// ============================================
async function testGasEstimation() {
  console.log('\n' + '='.repeat(60));
  console.log('SECTION 5: Gas Estimation Accuracy');
  console.log('='.repeat(60));

  const testValue = parseEther('0.00001');

  // Test 5a: Simple transfer
  console.log('\n--- Test 5a: Gas estimation for EOA transfer ---');
  try {
    const estimate = await publicClient.estimateGas({
      account: account1.address,
      to: account2.address,
      value: testValue,
    });

    // Send the transaction and compare
    const hash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      gas: estimate,
      gasPrice: 0n,
      type: 'legacy',
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const accuracy = (Number(receipt.gasUsed) / Number(estimate)) * 100;

    logResult({
      name: 'Gas estimation - EOA transfer',
      passed: true,
      hash,
      details: {
        estimated: estimate.toString(),
        actual: receipt.gasUsed.toString(),
        accuracy: `${accuracy.toFixed(1)}%`,
      },
    });
  } catch (error) {
    logResult({
      name: 'Gas estimation - EOA transfer',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }
}

// ============================================
// SECTION 6: Get Transaction / Receipt
// ============================================
async function testGetTransaction() {
  console.log('\n' + '='.repeat(60));
  console.log('SECTION 6: Get Transaction / Receipt');
  console.log('='.repeat(60));

  // First send a transaction to have something to query
  const testValue = parseEther('0.00001');
  let txHash: Hash | null = null;

  try {
    txHash = await walletClient1.sendTransaction({
      to: account2.address,
      value: testValue,
      gasPrice: 0n,
      type: 'legacy',
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
  } catch {
    console.log('  Could not send test transaction');
    return;
  }

  // Test 6a: getTransaction
  console.log('\n--- Test 6a: getTransaction ---');
  try {
    const tx = await publicClient.getTransaction({ hash: txHash });
    logResult({
      name: 'getTransaction()',
      passed: !!tx && tx.hash === txHash,
      hash: txHash,
      details: {
        from: tx.from,
        to: tx.to,
        value: tx.value?.toString(),
        type: tx.type,
      },
    });
  } catch (error) {
    logResult({
      name: 'getTransaction()',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }

  // Test 6b: getTransactionReceipt
  console.log('\n--- Test 6b: getTransactionReceipt ---');
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    logResult({
      name: 'getTransactionReceipt()',
      passed: !!receipt && receipt.transactionHash === txHash,
      hash: txHash,
      details: {
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString(),
      },
    });
  } catch (error) {
    logResult({
      name: 'getTransactionReceipt()',
      passed: false,
      error: (error as Error).message.slice(0, 200),
    });
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('='.repeat(60));
  console.log('COMPREHENSIVE VIEM VS RADIUSCLIENT TEST');
  console.log('='.repeat(60));
  console.log('');
  console.log('Chain:', radiusTestnet.name);
  console.log('Chain ID:', radiusTestnet.id);
  console.log('RPC:', radiusTestnet.rpcUrls.default.http[0]);
  console.log('');
  console.log('Test Accounts:');
  console.log(`  Account #1: ${account1.address}`);
  console.log(`  Account #2: ${account2.address}`);
  console.log(`  Account #3: ${account3.address}`);

  // Check balances
  const [bal1, bal2, bal3] = await Promise.all([
    publicClient.getBalance({ address: account1.address }),
    publicClient.getBalance({ address: account2.address }),
    publicClient.getBalance({ address: account3.address }),
  ]);
  console.log('');
  console.log('Balances:');
  console.log(`  Account #1: ${formatEther(bal1)} USD`);
  console.log(`  Account #2: ${formatEther(bal2)} USD`);
  console.log(`  Account #3: ${formatEther(bal3)} USD`);

  if (bal1 < parseEther('0.001')) {
    console.log('');
    console.log('WARNING: Account #1 has low balance. Some tests may fail.');
    console.log('Fund with: https://faucet.testnet.radiustech.xyz');
  }

  // Run all test sections
  await testReadOperations();
  await testTransactionTypes();
  await testBatchTransactions();
  await testContractInteractions();
  await testGasEstimation();
  await testGetTransaction();

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log('');

  // Group by section
  const sections = [
    { name: 'Read Operations', prefix: 'get' },
    { name: 'Transaction Types', prefix: 'Legacy' },
    { name: 'Batch Transactions', prefix: 'Sequential' },
    { name: 'Contract Interactions', prefix: 'Deploy' },
    { name: 'Gas Estimation', prefix: 'Gas estimation' },
    { name: 'Get Transaction', prefix: 'getTransaction' },
  ];

  console.log('Results by Test:');
  for (const result of results) {
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`  [${status}] ${result.name}`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('END OF TEST');
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
