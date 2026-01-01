import { describe, test, expect, beforeAll } from 'vitest';
import { createPublicClient, http, formatEther } from 'viem';
import { radiusTestnet } from '../../packages/core/src/chains';
import { skipIfNoTestnet, RADIUS_ENDPOINT, TEST_PRIVATE_KEY } from '../fixtures/radius-testnet';
import { privateKeyToAccount } from 'viem/accounts';

describe('Client Integration Tests', () => {
  const shouldSkip = skipIfNoTestnet();

  let publicClient: ReturnType<typeof createPublicClient>;
  let testAccount: ReturnType<typeof privateKeyToAccount>;

  beforeAll(() => {
    if (shouldSkip) return;

    publicClient = createPublicClient({
      chain: radiusTestnet,
      transport: http(RADIUS_ENDPOINT),
    });

    if (TEST_PRIVATE_KEY) {
      testAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`);
    }
  });

  test.skipIf(shouldSkip)('should get chain ID', async () => {
    const chainId = await publicClient.getChainId();
    expect(chainId).toBe(radiusTestnet.id);
  });

  test.skipIf(shouldSkip)('should get block number', async () => {
    const blockNumber = await publicClient.getBlockNumber();
    expect(typeof blockNumber).toBe('bigint');
    expect(blockNumber).toBeGreaterThan(0n);
    console.log(`Current block: ${blockNumber}`);
  });

  test.skipIf(shouldSkip)('should get balance of test account', async () => {
    const balance = await publicClient.getBalance({ address: testAccount.address });
    expect(typeof balance).toBe('bigint');
    console.log(`Test account balance: ${formatEther(balance)} USD`);
  });

  test.skipIf(shouldSkip)('should get transaction count (nonce)', async () => {
    const nonce = await publicClient.getTransactionCount({ address: testAccount.address });
    expect(typeof nonce).toBe('number');
    console.log(`Test account nonce: ${nonce}`);
  });

  test.skipIf(shouldSkip)('should estimate gas for simple transfer', async () => {
    const gasEstimate = await publicClient.estimateGas({
      account: testAccount.address,
      to: '0x0000000000000000000000000000000000000001',
      value: 0n,
    });
    expect(typeof gasEstimate).toBe('bigint');
    expect(gasEstimate).toBeGreaterThan(0n);
    console.log(`Gas estimate: ${gasEstimate}`);
  });
});
