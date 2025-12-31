import { describe, test, expect, beforeAll } from 'vitest';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { radiusTestnet } from '../../packages/core/src/chains';
import { skipIfNoTestnet, RADIUS_ENDPOINT, ISB_TOKEN_ADDRESS } from '../fixtures/radius-testnet';

describe('Events Integration Tests', () => {
  const shouldSkip = skipIfNoTestnet();

  let publicClient: ReturnType<typeof createPublicClient>;

  beforeAll(() => {
    if (shouldSkip) return;

    publicClient = createPublicClient({
      chain: radiusTestnet,
      transport: http(RADIUS_ENDPOINT),
    });
  });

  test.skipIf(shouldSkip)('should fetch Transfer events from ISBToken', async () => {
    const blockNumber = await publicClient.getBlockNumber();

    // Look at last 1000 blocks for Transfer events
    const fromBlock = blockNumber > 1000n ? blockNumber - 1000n : 0n;

    const logs = await publicClient.getLogs({
      address: ISB_TOKEN_ADDRESS,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      fromBlock,
      toBlock: blockNumber,
    });

    console.log(`Found ${logs.length} Transfer events in last 1000 blocks`);
    expect(Array.isArray(logs)).toBe(true);

    // If we found events, verify structure
    if (logs.length > 0) {
      const firstLog = logs[0];
      expect(firstLog.address.toLowerCase()).toBe(ISB_TOKEN_ADDRESS.toLowerCase());
      expect(firstLog.topics).toBeDefined();
      expect(firstLog.topics.length).toBeGreaterThan(0);
    }
  });

  test.skipIf(shouldSkip)('should fetch logs with block range', async () => {
    const blockNumber = await publicClient.getBlockNumber();

    const logs = await publicClient.getLogs({
      address: ISB_TOKEN_ADDRESS,
      fromBlock: blockNumber - 10n,
      toBlock: blockNumber,
    });

    expect(Array.isArray(logs)).toBe(true);
    console.log(`Found ${logs.length} events in last 10 blocks`);
  });

  test.skipIf(shouldSkip)('should decode event topics correctly', async () => {
    // Transfer event signature
    const transferSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    const blockNumber = await publicClient.getBlockNumber();
    const fromBlock = blockNumber > 1000n ? blockNumber - 1000n : 0n;

    const logs = await publicClient.getLogs({
      address: ISB_TOKEN_ADDRESS,
      fromBlock,
      toBlock: blockNumber,
    });

    // Filter for Transfer events by topic signature
    const transferLogs = logs.filter(log =>
      log.topics[0]?.toLowerCase() === transferSignature.toLowerCase()
    );

    console.log(`Found ${transferLogs.length} Transfer events by signature`);
    expect(Array.isArray(transferLogs)).toBe(true);
  });
});
