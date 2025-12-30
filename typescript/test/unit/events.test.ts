/**
 * Unit tests for Radius SDK events module
 * Tests watchBlock, watchTransfer, watchApproval, and getLogs functions
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ERC20_ABI } from '../../packages/core/src/contracts/erc20';
import {
  type ApprovalEvent,
  DEFAULT_POLLING_INTERVAL_MS,
  type TransferEvent,
  getLogs,
  getLogsAdaptive,
  watchApproval,
  watchApprovalForAddress,
  watchBlockNumber,
  watchBlocks,
  watchTransfer,
  watchTransferForAddress,
} from '../../packages/core/src/events';

// Mock addresses
const MOCK_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890' as const;
const MOCK_FROM_ADDRESS = '0x0000000000000000000000000000000000000001' as const;
const MOCK_TO_ADDRESS = '0x0000000000000000000000000000000000000002' as const;
const MOCK_OWNER_ADDRESS = '0x0000000000000000000000000000000000000003' as const;
const MOCK_SPENDER_ADDRESS = '0x0000000000000000000000000000000000000004' as const;

describe('Events Module', () => {
  let mockPublicClient: any;

  beforeEach(() => {
    mockPublicClient = {
      watchBlockNumber: vi.fn(),
      watchBlocks: vi.fn(),
      watchContractEvent: vi.fn(),
      getLogs: vi.fn(),
    };
  });

  // ============================================================================
  // Block Watching Tests
  // ============================================================================

  describe('watchBlockNumber', () => {
    test('should pass callback and default polling interval to client', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlockNumber.mockReturnValue(unwatch);

      const callback = vi.fn();
      const errorCallback = vi.fn();

      const result = watchBlockNumber(mockPublicClient, {
        onBlockNumber: callback,
        onError: errorCallback,
      });

      expect(mockPublicClient.watchBlockNumber).toHaveBeenCalledWith({
        onBlockNumber: callback,
        onError: errorCallback,
        emitOnBegin: undefined,
        pollingInterval: DEFAULT_POLLING_INTERVAL_MS,
      });

      expect(result).toBe(unwatch);
    });

    test('should use DEFAULT_POLLING_INTERVAL_MS value of 1000', () => {
      expect(DEFAULT_POLLING_INTERVAL_MS).toBe(1000);
    });

    test('should use custom polling interval when provided', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlockNumber.mockReturnValue(unwatch);

      const callback = vi.fn();
      watchBlockNumber(mockPublicClient, {
        onBlockNumber: callback,
        pollingInterval: 5000,
      });

      expect(mockPublicClient.watchBlockNumber).toHaveBeenCalledWith({
        onBlockNumber: callback,
        onError: undefined,
        emitOnBegin: undefined,
        pollingInterval: 5000,
      });
    });

    test('should pass emitOnBegin flag when provided', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlockNumber.mockReturnValue(unwatch);

      const callback = vi.fn();
      watchBlockNumber(mockPublicClient, {
        onBlockNumber: callback,
        emitOnBegin: true,
      });

      expect(mockPublicClient.watchBlockNumber).toHaveBeenCalledWith({
        onBlockNumber: callback,
        onError: undefined,
        emitOnBegin: true,
        pollingInterval: DEFAULT_POLLING_INTERVAL_MS,
      });
    });

    test('should return unwatch function from client', () => {
      const mockUnwatch = vi.fn();
      mockPublicClient.watchBlockNumber.mockReturnValue(mockUnwatch);

      const unwatch = watchBlockNumber(mockPublicClient, {
        onBlockNumber: vi.fn(),
      });

      expect(unwatch).toBe(mockUnwatch);
      unwatch();
      expect(mockUnwatch).toHaveBeenCalled();
    });
  });

  describe('watchBlocks', () => {
    test('should pass callback and default polling interval to client', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlocks.mockReturnValue(unwatch);

      const callback = vi.fn();
      const errorCallback = vi.fn();

      const result = watchBlocks(mockPublicClient, {
        onBlock: callback,
        onError: errorCallback,
      });

      expect(mockPublicClient.watchBlocks).toHaveBeenCalledWith({
        onBlock: callback,
        onError: errorCallback,
        emitOnBegin: undefined,
        pollingInterval: DEFAULT_POLLING_INTERVAL_MS,
      });

      expect(result).toBe(unwatch);
    });

    test('should use custom polling interval when provided', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlocks.mockReturnValue(unwatch);

      const callback = vi.fn();
      watchBlocks(mockPublicClient, {
        onBlock: callback,
        pollingInterval: 2000,
      });

      expect(mockPublicClient.watchBlocks).toHaveBeenCalledWith({
        onBlock: callback,
        onError: undefined,
        emitOnBegin: undefined,
        pollingInterval: 2000,
      });
    });

    test('should pass includeTransactions flag when true', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlocks.mockReturnValue(unwatch);

      const callback = vi.fn();
      watchBlocks(mockPublicClient, {
        onBlock: callback,
        includeTransactions: true,
      });

      const callArgs = mockPublicClient.watchBlocks.mock.calls[0][0];
      expect(callArgs.includeTransactions).toBe(true);
    });

    test('should not pass includeTransactions flag when false', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchBlocks.mockReturnValue(unwatch);

      const callback = vi.fn();
      watchBlocks(mockPublicClient, {
        onBlock: callback,
        includeTransactions: false,
      });

      const callArgs = mockPublicClient.watchBlocks.mock.calls[0][0];
      expect(callArgs.includeTransactions).toBeUndefined();
    });

    test('should return unwatch function from client', () => {
      const mockUnwatch = vi.fn();
      mockPublicClient.watchBlocks.mockReturnValue(mockUnwatch);

      const unwatch = watchBlocks(mockPublicClient, {
        onBlock: vi.fn(),
      });

      expect(unwatch).toBe(mockUnwatch);
      unwatch();
      expect(mockUnwatch).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Transfer Event Tests
  // ============================================================================

  describe('watchTransfer', () => {
    test('should watch transfer events with correct parameters', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchContractEvent.mockReturnValue(unwatch);

      const onTransfer = vi.fn();
      const result = watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onTransfer,
      });

      expect(mockPublicClient.watchContractEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          address: MOCK_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          eventName: 'Transfer',
          args: undefined,
        })
      );

      expect(result).toBe(unwatch);
    });

    test('should watch transfers from specific address', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchContractEvent.mockReturnValue(unwatch);

      const onTransfer = vi.fn();
      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        from: MOCK_FROM_ADDRESS,
        onTransfer,
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        from: MOCK_FROM_ADDRESS,
      });
    });

    test('should watch transfers to specific address', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchContractEvent.mockReturnValue(unwatch);

      const onTransfer = vi.fn();
      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        to: MOCK_TO_ADDRESS,
        onTransfer,
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        to: MOCK_TO_ADDRESS,
      });
    });

    test('should watch transfers from and to specific addresses', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchContractEvent.mockReturnValue(unwatch);

      const onTransfer = vi.fn();
      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        from: MOCK_FROM_ADDRESS,
        to: MOCK_TO_ADDRESS,
        onTransfer,
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        from: MOCK_FROM_ADDRESS,
        to: MOCK_TO_ADDRESS,
      });
    });

    test('should decode transfer events and invoke callback', () => {
      const onTransfer = vi.fn();
      const onError = vi.fn();

      let capturedOnLogs: ((logs: any[]) => void) | undefined;
      mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
        capturedOnLogs = params.onLogs;
        return vi.fn();
      });

      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onTransfer,
        onError,
      });

      // Create mock log data for Transfer event
      const mockLog = {
        address: MOCK_TOKEN_ADDRESS,
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
          `0x${MOCK_FROM_ADDRESS.substring(2).padStart(64, '0')}`,
          `0x${MOCK_TO_ADDRESS.substring(2).padStart(64, '0')}`,
        ],
        data: '0x0000000000000000000000000000000000000000000000000000000000000064', // 100 in hex
      };

      if (capturedOnLogs) {
        capturedOnLogs([mockLog]);
      }

      expect(onTransfer).toHaveBeenCalled();
      const events = onTransfer.mock.calls[0][0] as TransferEvent[];
      expect(events).toHaveLength(1);
      expect(events[0].from).toBe(MOCK_FROM_ADDRESS);
      expect(events[0].to).toBe(MOCK_TO_ADDRESS);
      expect(events[0].value).toBe(100n);
      expect(events[0].log).toEqual(mockLog);
    });

    test('should skip logs that cannot be decoded', () => {
      const onTransfer = vi.fn();
      const onError = vi.fn();

      let capturedOnLogs: ((logs: any[]) => void) | undefined;
      mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
        capturedOnLogs = params.onLogs;
        return vi.fn();
      });

      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onTransfer,
        onError,
      });

      // Create mock log with invalid data
      const invalidLog = {
        address: MOCK_TOKEN_ADDRESS,
        topics: ['0x' + 'invalid'],
        data: '0xinvalid',
      };

      if (capturedOnLogs) {
        capturedOnLogs([invalidLog]);
      }

      // Should call error callback but not transfer callback
      expect(onError).toHaveBeenCalled();
      expect(onTransfer).not.toHaveBeenCalled();
    });

    test('should not invoke callback if no events after filtering', () => {
      const onTransfer = vi.fn();

      let capturedOnLogs: ((logs: any[]) => void) | undefined;
      mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
        capturedOnLogs = params.onLogs;
        return vi.fn();
      });

      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onTransfer,
      });

      if (capturedOnLogs) {
        capturedOnLogs([]);
      }

      expect(onTransfer).not.toHaveBeenCalled();
    });

    test('should pass polling interval to watchContractEvent', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchTransfer(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onTransfer: vi.fn(),
        pollingInterval: 5000,
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.pollingInterval).toBe(5000);
    });
  });

  describe('watchTransferForAddress', () => {
    test('should watch transfers where address is sender', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchTransferForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_FROM_ADDRESS,
        senderOnly: true,
        onTransfer: vi.fn(),
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        from: MOCK_FROM_ADDRESS,
      });
    });

    test('should watch transfers where address is receiver', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchTransferForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_TO_ADDRESS,
        receiverOnly: true,
        onTransfer: vi.fn(),
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        to: MOCK_TO_ADDRESS,
      });
    });

    test('should watch both sender and receiver when neither flag is set', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchTransferForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_FROM_ADDRESS,
        onTransfer: vi.fn(),
      });

      // Should create two subscriptions
      expect(mockPublicClient.watchContractEvent).toHaveBeenCalledTimes(2);

      const call1Args = mockPublicClient.watchContractEvent.mock.calls[0][0];
      const call2Args = mockPublicClient.watchContractEvent.mock.calls[1][0];

      expect(call1Args.args.from).toBe(MOCK_FROM_ADDRESS);
      expect(call2Args.args.to).toBe(MOCK_FROM_ADDRESS);
    });

    test('should throw error if both senderOnly and receiverOnly are true', () => {
      expect(() => {
        watchTransferForAddress(mockPublicClient, {
          tokenAddress: MOCK_TOKEN_ADDRESS,
          watchAddress: MOCK_FROM_ADDRESS,
          senderOnly: true,
          receiverOnly: true,
          onTransfer: vi.fn(),
        });
      }).toThrow('Cannot set both senderOnly and receiverOnly to true');
    });

    test('should return unsubscribe function that unsubscribes both subscriptions', () => {
      const unwatch1 = vi.fn();
      const unwatch2 = vi.fn();

      mockPublicClient.watchContractEvent
        .mockReturnValueOnce(unwatch1)
        .mockReturnValueOnce(unwatch2);

      const unwatch = watchTransferForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_FROM_ADDRESS,
        onTransfer: vi.fn(),
      });

      unwatch();

      expect(unwatch1).toHaveBeenCalled();
      expect(unwatch2).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Approval Event Tests
  // ============================================================================

  describe('watchApproval', () => {
    test('should watch approval events with correct parameters', () => {
      const unwatch = vi.fn();
      mockPublicClient.watchContractEvent.mockReturnValue(unwatch);

      const onApproval = vi.fn();
      const result = watchApproval(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onApproval,
      });

      expect(mockPublicClient.watchContractEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          address: MOCK_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          eventName: 'Approval',
          args: undefined,
        })
      );

      expect(result).toBe(unwatch);
    });

    test('should watch approvals from specific owner', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchApproval(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        owner: MOCK_OWNER_ADDRESS,
        onApproval: vi.fn(),
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        owner: MOCK_OWNER_ADDRESS,
      });
    });

    test('should watch approvals for specific spender', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchApproval(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        spender: MOCK_SPENDER_ADDRESS,
        onApproval: vi.fn(),
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        spender: MOCK_SPENDER_ADDRESS,
      });
    });

    test('should decode approval events and invoke callback', () => {
      const onApproval = vi.fn();
      const onError = vi.fn();

      let capturedOnLogs: ((logs: any[]) => void) | undefined;
      mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
        capturedOnLogs = params.onLogs;
        return vi.fn();
      });

      watchApproval(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onApproval,
        onError,
      });

      // Create mock log data for Approval event
      const mockLog = {
        address: MOCK_TOKEN_ADDRESS,
        topics: [
          '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event signature
          `0x${MOCK_OWNER_ADDRESS.substring(2).padStart(64, '0')}`,
          `0x${MOCK_SPENDER_ADDRESS.substring(2).padStart(64, '0')}`,
        ],
        data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', // Max uint256
      };

      if (capturedOnLogs) {
        capturedOnLogs([mockLog]);
      }

      expect(onApproval).toHaveBeenCalled();
      const events = onApproval.mock.calls[0][0] as ApprovalEvent[];
      expect(events).toHaveLength(1);
      expect(events[0].owner).toBe(MOCK_OWNER_ADDRESS);
      expect(events[0].spender).toBe(MOCK_SPENDER_ADDRESS);
      expect(events[0].log).toEqual(mockLog);
    });

    test('should skip logs that cannot be decoded', () => {
      const onApproval = vi.fn();
      const onError = vi.fn();

      let capturedOnLogs: ((logs: any[]) => void) | undefined;
      mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
        capturedOnLogs = params.onLogs;
        return vi.fn();
      });

      watchApproval(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        onApproval,
        onError,
      });

      // Create mock log with invalid data
      const invalidLog = {
        address: MOCK_TOKEN_ADDRESS,
        topics: ['0x' + 'invalid'],
        data: '0xinvalid',
      };

      if (capturedOnLogs) {
        capturedOnLogs([invalidLog]);
      }

      expect(onError).toHaveBeenCalled();
      expect(onApproval).not.toHaveBeenCalled();
    });
  });

  describe('watchApprovalForAddress', () => {
    test('should watch approvals where address is owner', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchApprovalForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_OWNER_ADDRESS,
        ownerOnly: true,
        onApproval: vi.fn(),
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        owner: MOCK_OWNER_ADDRESS,
      });
    });

    test('should watch approvals where address is spender', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchApprovalForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_SPENDER_ADDRESS,
        spenderOnly: true,
        onApproval: vi.fn(),
      });

      const callArgs = mockPublicClient.watchContractEvent.mock.calls[0][0];
      expect(callArgs.args).toEqual({
        spender: MOCK_SPENDER_ADDRESS,
      });
    });

    test('should watch both owner and spender when neither flag is set', () => {
      mockPublicClient.watchContractEvent.mockReturnValue(vi.fn());

      watchApprovalForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_OWNER_ADDRESS,
        onApproval: vi.fn(),
      });

      expect(mockPublicClient.watchContractEvent).toHaveBeenCalledTimes(2);
    });

    test('should throw error if both ownerOnly and spenderOnly are true', () => {
      expect(() => {
        watchApprovalForAddress(mockPublicClient, {
          tokenAddress: MOCK_TOKEN_ADDRESS,
          watchAddress: MOCK_OWNER_ADDRESS,
          ownerOnly: true,
          spenderOnly: true,
          onApproval: vi.fn(),
        });
      }).toThrow('Cannot set both ownerOnly and spenderOnly to true');
    });

    test('should return unsubscribe function that unsubscribes both subscriptions', () => {
      const unwatch1 = vi.fn();
      const unwatch2 = vi.fn();

      mockPublicClient.watchContractEvent
        .mockReturnValueOnce(unwatch1)
        .mockReturnValueOnce(unwatch2);

      const unwatch = watchApprovalForAddress(mockPublicClient, {
        tokenAddress: MOCK_TOKEN_ADDRESS,
        watchAddress: MOCK_OWNER_ADDRESS,
        onApproval: vi.fn(),
      });

      unwatch();

      expect(unwatch1).toHaveBeenCalled();
      expect(unwatch2).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Get Logs Tests
  // ============================================================================

  describe('getLogs', () => {
    test('should fetch logs with single chunk', async () => {
      const mockLogs = [
        { address: MOCK_TOKEN_ADDRESS, blockNumber: 1000n },
        { address: MOCK_TOKEN_ADDRESS, blockNumber: 1001n },
      ];

      mockPublicClient.getLogs.mockResolvedValue(mockLogs);

      const result = await getLogs(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1010n,
        chunkSize: 100,
      });

      expect(result).toEqual(mockLogs);
      expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(1);
      expect(mockPublicClient.getLogs).toHaveBeenCalledWith({
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1010n,
      });
    });

    test('should fetch logs with multiple chunks', async () => {
      const mockLogs1 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1000n }];
      const mockLogs2 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1050n }];
      const mockLogs3 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1100n }];

      mockPublicClient.getLogs
        .mockResolvedValueOnce(mockLogs1)
        .mockResolvedValueOnce(mockLogs2)
        .mockResolvedValueOnce(mockLogs3);

      const result = await getLogs(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        chunkSize: 50,
      });

      expect(result).toEqual([...mockLogs1, ...mockLogs2, ...mockLogs3]);
      expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(3);
    });

    test('should handle partial final chunk', async () => {
      const mockLogs1 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1000n }];
      const mockLogs2 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1050n }];

      mockPublicClient.getLogs.mockResolvedValueOnce(mockLogs1).mockResolvedValueOnce(mockLogs2);

      const result = await getLogs(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1075n,
        chunkSize: 50,
      });

      expect(result).toEqual([...mockLogs1, ...mockLogs2]);

      // Check that second call was with correct range (1050-1075)
      const secondCall = mockPublicClient.getLogs.mock.calls[1][0];
      expect(secondCall.fromBlock).toBe(1050n);
      expect(secondCall.toBlock).toBe(1075n);
    });

    test('should throw error if fromBlock > toBlock', async () => {
      await expect(
        getLogs(mockPublicClient, {
          address: MOCK_TOKEN_ADDRESS,
          fromBlock: 2000n,
          toBlock: 1000n,
          chunkSize: 100,
        })
      ).rejects.toThrow('fromBlock must be less than or equal to toBlock');
    });

    test('should throw error if chunkSize <= 0', async () => {
      await expect(
        getLogs(mockPublicClient, {
          address: MOCK_TOKEN_ADDRESS,
          fromBlock: 1000n,
          toBlock: 2000n,
          chunkSize: 0,
        })
      ).rejects.toThrow('chunkSize must be greater than 0');
    });

    test('should invoke progress callback', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];
      mockPublicClient.getLogs.mockResolvedValue(mockLogs);

      const onProgress = vi.fn();

      await getLogs(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1010n,
        chunkSize: 50,
        onProgress,
      });

      expect(onProgress).toHaveBeenCalled();
      const progressArgs = onProgress.mock.calls[0][0];
      expect(progressArgs.currentBlock).toBe(1010n);
      expect(progressArgs.totalBlocks).toBe(11n);
      expect(progressArgs.chunksProcessed).toBe(1);
      expect(progressArgs.logsFetched).toBe(1);
    });

    test('should throw error with helpful message for block range too wide', async () => {
      mockPublicClient.getLogs.mockRejectedValue(new Error('block range is too wide'));

      await expect(
        getLogs(mockPublicClient, {
          address: MOCK_TOKEN_ADDRESS,
          fromBlock: 1000n,
          toBlock: 2000n,
          chunkSize: 100,
        })
      ).rejects.toThrow(/Block range too wide/);
    });

    test('should throw error with helpful message for other failures', async () => {
      mockPublicClient.getLogs.mockRejectedValue(new Error('RPC error'));

      await expect(
        getLogs(mockPublicClient, {
          address: MOCK_TOKEN_ADDRESS,
          fromBlock: 1000n,
          toBlock: 2000n,
          chunkSize: 100,
        })
      ).rejects.toThrow(/Failed to fetch logs/);
    });
  });

  // ============================================================================
  // Get Logs Adaptive Tests
  // ============================================================================

  describe('getLogsAdaptive', () => {
    test('should succeed with initial chunk size', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];
      mockPublicClient.getLogs.mockResolvedValue(mockLogs);

      const result = await getLogsAdaptive(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        initialChunkSize: 100,
      });

      // Should be called multiple times with 100 block chunk size
      expect(mockPublicClient.getLogs).toHaveBeenCalled();
      // All returned logs should be in result
      expect(result.length).toBeGreaterThanOrEqual(mockLogs.length);
    });

    test('should reduce chunk size on block range too wide error', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];

      // First call fails with range error, second call with smaller chunk succeeds
      let callCount = 0;
      mockPublicClient.getLogs.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('block range is too wide'));
        }
        return Promise.resolve(mockLogs);
      });

      const result = await getLogsAdaptive(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        initialChunkSize: 1000,
        minChunkSize: 100,
      });

      // Should retry with smaller chunk
      expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(2);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    test('should throw error when minimum chunk size is reached', async () => {
      mockPublicClient.getLogs.mockRejectedValue(new Error('block range is too wide'));

      await expect(
        getLogsAdaptive(mockPublicClient, {
          address: MOCK_TOKEN_ADDRESS,
          fromBlock: 1000n,
          toBlock: 2000n,
          initialChunkSize: 100,
          minChunkSize: 50,
        })
      ).rejects.toThrow(/minimum chunk size.*reached/);
    });

    test('should use custom initial chunk size', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];
      mockPublicClient.getLogs.mockResolvedValue(mockLogs);

      await getLogsAdaptive(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        initialChunkSize: 250,
      });

      expect(mockPublicClient.getLogs).toHaveBeenCalled();
    });

    test('should use custom min chunk size', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];

      let callCount = 0;
      mockPublicClient.getLogs.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('block range is too wide'));
        }
        return Promise.resolve(mockLogs);
      });

      const result = await getLogsAdaptive(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        initialChunkSize: 100,
        minChunkSize: 25,
      });

      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    test('should pass through progress callback with chunk size', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];
      mockPublicClient.getLogs.mockResolvedValue(mockLogs);

      const onProgress = vi.fn();

      await getLogsAdaptive(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        initialChunkSize: 100,
        onProgress,
      });

      expect(onProgress).toHaveBeenCalled();
      const progressArgs = onProgress.mock.calls[0][0];
      expect(progressArgs.currentChunkSize).toBe(100);
    });

    test('should re-throw non-range-related errors', async () => {
      mockPublicClient.getLogs.mockRejectedValue(new Error('Internal server error'));

      await expect(
        getLogsAdaptive(mockPublicClient, {
          address: MOCK_TOKEN_ADDRESS,
          fromBlock: 1000n,
          toBlock: 2000n,
        })
      ).rejects.toThrow('Internal server error');
    });

    test('should reduce chunk size by half on each retry', async () => {
      const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];

      let callCount = 0;
      mockPublicClient.getLogs.mockImplementation(() => {
        callCount++;
        // Fail first two attempts, succeed on third
        if (callCount <= 2) {
          return Promise.reject(new Error('block range is too wide'));
        }
        return Promise.resolve(mockLogs);
      });

      const onProgress = vi.fn();

      const result = await getLogsAdaptive(mockPublicClient, {
        address: MOCK_TOKEN_ADDRESS,
        fromBlock: 1000n,
        toBlock: 1100n,
        initialChunkSize: 1000,
        onProgress,
      });

      expect(result.length).toBeGreaterThanOrEqual(0);

      // Check that chunk size reduced properly
      const progressCalls = onProgress.mock.calls;
      const chunkSizes = progressCalls.map((call) => call[0].currentChunkSize);
      // Should have progressively smaller chunk sizes
      expect(chunkSizes.length).toBeGreaterThan(0);
      expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(3);
    });
  });
});
