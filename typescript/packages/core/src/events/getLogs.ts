/**
 * Historical log querying utilities for Radius SDK.
 * Provides pagination helpers for eth_getLogs with Radius-specific block range handling.
 */
import type { Address, GetLogsParameters, Log, PublicClient } from 'viem';

/**
 * Parameters for paginated log retrieval.
 */
export interface GetLogsParams {
  /** The contract address(es) to query logs from (required on Radius) */
  address: Address | Address[];
  /** Starting block number (inclusive) */
  fromBlock: bigint;
  /** Ending block number (inclusive) */
  toBlock: bigint;
  /** Maximum number of blocks to query per request (default: 1000) */
  chunkSize?: number;
  /** Callback invoked after each chunk is fetched (for progress tracking) */
  onProgress?: (params: {
    /** Current block being processed */
    currentBlock: bigint;
    /** Total blocks to process */
    totalBlocks: bigint;
    /** Number of chunks processed so far */
    chunksProcessed: number;
    /** Logs fetched so far */
    logsFetched: number;
  }) => void;
}

/**
 * Fetches historical logs from Radius with automatic pagination.
 * Handles Radius's block range restrictions by splitting large queries into smaller chunks.
 *
 * @param client - The PublicClient to use
 * @param params - Log query parameters with pagination
 * @returns Array of all logs matching the query
 * @throws Error if any chunk request fails
 *
 * @example
 * ```typescript
 * import { createPublicClient, http } from 'viem';
 * import { getLogs } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // Fetch logs for a large block range
 * const logs = await getLogs(client, {
 *   address: '0x...', // Contract address (required)
 *   fromBlock: 1000000n,
 *   toBlock: 1010000n, // 10,000 blocks
 *   chunkSize: 1000, // Query 1000 blocks at a time
 *   onProgress: ({ currentBlock, totalBlocks, logsFetched }) => {
 *     const percent = (Number(currentBlock) / Number(totalBlocks) * 100).toFixed(1);
 *     console.log(`Progress: ${percent}% (${logsFetched} logs)`);
 *   },
 * });
 *
 * console.log(`Found ${logs.length} total logs`);
 * ```
 *
 * @remarks
 * - Radius requires the address parameter (cannot query all contracts)
 * - Radius restricts eth_getLogs to narrow block ranges
 * - This function automatically splits large queries into smaller chunks
 * - Default chunk size is 1000 blocks (adjust based on your needs)
 * - If you get "block range is too wide" errors, reduce chunkSize
 * - Progress callback is optional but useful for long-running queries
 * - All requests are sequential to avoid rate limiting
 * - Consider using WebSocket subscriptions for real-time monitoring instead
 */
export async function getLogs(client: PublicClient, params: GetLogsParams): Promise<Log[]> {
  const { address, fromBlock, toBlock, chunkSize = 1000, onProgress } = params;

  // Validate parameters
  if (fromBlock > toBlock) {
    throw new Error('fromBlock must be less than or equal to toBlock');
  }

  if (chunkSize <= 0) {
    throw new Error('chunkSize must be greater than 0');
  }

  const allLogs: Log[] = [];
  const totalBlocks = toBlock - fromBlock + 1n;
  let chunksProcessed = 0;

  // Process in chunks
  for (let currentFrom = fromBlock; currentFrom <= toBlock; currentFrom += BigInt(chunkSize)) {
    const currentTo =
      currentFrom + BigInt(chunkSize) - 1n > toBlock
        ? toBlock
        : currentFrom + BigInt(chunkSize) - 1n;

    // Build filter parameters
    const filterParams: GetLogsParameters = {
      address,
      fromBlock: currentFrom,
      toBlock: currentTo,
    };

    try {
      // Fetch logs for this chunk
      const chunkLogs = await client.getLogs(filterParams);
      allLogs.push(...chunkLogs);

      chunksProcessed++;

      // Report progress
      if (onProgress) {
        onProgress({
          currentBlock: currentTo,
          totalBlocks,
          chunksProcessed,
          logsFetched: allLogs.length,
        });
      }
    } catch (error) {
      // Provide helpful error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('block range is too wide')) {
        throw new Error(
          `Block range too wide. Current chunk size: ${chunkSize}. ` +
            `Try reducing chunkSize. Range: ${currentFrom}-${currentTo}`
        );
      }

      throw new Error(
        `Failed to fetch logs for blocks ${currentFrom}-${currentTo}: ${errorMessage}`
      );
    }
  }

  return allLogs;
}

/**
 * Parameters for fetching logs with automatic chunk size detection.
 */
export interface GetLogsAdaptiveParams {
  /** The contract address(es) to query logs from (required on Radius) */
  address: Address | Address[];
  /** Starting block number (inclusive) */
  fromBlock: bigint;
  /** Ending block number (inclusive) */
  toBlock: bigint;
  /** Initial chunk size to try (default: 1000) */
  initialChunkSize?: number;
  /** Minimum chunk size (default: 10) */
  minChunkSize?: number;
  /** Callback invoked after each chunk is fetched (for progress tracking) */
  onProgress?: (params: {
    currentBlock: bigint;
    totalBlocks: bigint;
    chunksProcessed: number;
    logsFetched: number;
    currentChunkSize: number;
  }) => void;
}

/**
 * Fetches historical logs with adaptive chunk sizing.
 * Automatically reduces chunk size if "block range too wide" errors occur.
 *
 * @param client - The PublicClient to use
 * @param params - Log query parameters with adaptive sizing
 * @returns Array of all logs matching the query
 * @throws Error if minimum chunk size is reached or other errors occur
 *
 * @example
 * ```typescript
 * import { createPublicClient, http } from 'viem';
 * import { getLogsAdaptive } from '@radiustechsystems/sdk/events';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // Fetch logs with automatic chunk size adjustment
 * const logs = await getLogsAdaptive(client, {
 *   address: '0x...',
 *   fromBlock: 1000000n,
 *   toBlock: 1010000n,
 *   onProgress: ({ currentBlock, totalBlocks, currentChunkSize }) => {
 *     console.log(`Block ${currentBlock}/${totalBlocks} (chunk: ${currentChunkSize})`);
 *   },
 * });
 * ```
 *
 * @remarks
 * - Starts with a large chunk size and reduces it if errors occur
 * - Useful when you don't know the optimal chunk size for a network
 * - Slower than getLogs with a known good chunk size
 * - Use getLogs directly if you know a reliable chunk size
 */
export async function getLogsAdaptive(
  client: PublicClient,
  params: GetLogsAdaptiveParams
): Promise<Log[]> {
  let currentChunkSize = params.initialChunkSize ?? 1000;
  const minChunkSize = params.minChunkSize ?? 10;

  while (currentChunkSize >= minChunkSize) {
    try {
      return await getLogs(client, {
        address: params.address,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        chunkSize: currentChunkSize,
        onProgress: params.onProgress
          ? (progress) => {
              params.onProgress?.({
                ...progress,
                currentChunkSize,
              });
            }
          : undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';

      if (
        errorMessage.includes('block range is too wide') ||
        errorMessage.includes('Try reducing chunkSize')
      ) {
        // Reduce chunk size and retry
        currentChunkSize = Math.floor(currentChunkSize / 2);

        if (currentChunkSize < minChunkSize) {
          throw new Error(
            `Cannot fetch logs: minimum chunk size (${minChunkSize}) reached. Network requires smaller block ranges than supported.`
          );
        }

        // Continue loop with smaller chunk size
        continue;
      }

      // Re-throw non-range-related errors
      throw error;
    }
  }

  throw new Error('Failed to fetch logs: minimum chunk size reached');
}
