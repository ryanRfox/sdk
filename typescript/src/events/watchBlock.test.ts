/**
 * Tests for watchBlockNumber, watchBlocks, and watchPendingTransactions functions.
 */

import type { Block, PublicClient } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_POLLING_INTERVAL_MS,
	watchBlockNumber,
	watchBlocks,
	watchPendingTransactions,
} from './watchBlock';

describe('watchBlockNumber', () => {
	it('should call client.watchBlockNumber with correct parameters', () => {
		const mockUnwatch = vi.fn();
		const mockWatchBlockNumber = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchBlockNumber: mockWatchBlockNumber,
		} as unknown as PublicClient;

		const onBlockNumber = vi.fn();
		const onError = vi.fn();

		const unwatch = watchBlockNumber(mockClient, {
			onBlockNumber,
			onError,
			emitOnBegin: true,
			pollingInterval: 2000,
		});

		expect(mockWatchBlockNumber).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchBlockNumber.mock.calls[0][0];
		expect(callArgs.onBlockNumber).toBe(onBlockNumber);
		expect(callArgs.onError).toBe(onError);
		expect(callArgs.emitOnBegin).toBe(true);
		expect(callArgs.pollingInterval).toBe(2000);

		expect(unwatch).toBe(mockUnwatch);
	});

	it('should use default polling interval when not provided', () => {
		const mockWatchBlockNumber = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchBlockNumber: mockWatchBlockNumber,
		} as unknown as PublicClient;

		watchBlockNumber(mockClient, {
			onBlockNumber: vi.fn(),
		});

		const callArgs = mockWatchBlockNumber.mock.calls[0][0];
		expect(callArgs.pollingInterval).toBe(DEFAULT_POLLING_INTERVAL_MS);
	});

	it('should export DEFAULT_POLLING_INTERVAL_MS as 1000', () => {
		expect(DEFAULT_POLLING_INTERVAL_MS).toBe(1000);
	});

	it('should pass undefined for optional parameters when not provided', () => {
		const mockWatchBlockNumber = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchBlockNumber: mockWatchBlockNumber,
		} as unknown as PublicClient;

		watchBlockNumber(mockClient, {
			onBlockNumber: vi.fn(),
		});

		const callArgs = mockWatchBlockNumber.mock.calls[0][0];
		expect(callArgs.onError).toBeUndefined();
		expect(callArgs.emitOnBegin).toBeUndefined();
	});

	it('should return unwatch function that stops watching', () => {
		const mockUnwatch = vi.fn();
		const mockWatchBlockNumber = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchBlockNumber: mockWatchBlockNumber,
		} as unknown as PublicClient;

		const unwatch = watchBlockNumber(mockClient, {
			onBlockNumber: vi.fn(),
		});

		unwatch();

		expect(mockUnwatch).toHaveBeenCalledTimes(1);
	});

	it('should invoke onBlockNumber callback with block number', () => {
		let capturedCallback: ((blockNumber: bigint) => void) | undefined;
		const mockWatchBlockNumber = vi.fn().mockImplementation((params) => {
			capturedCallback = params.onBlockNumber;
			return vi.fn();
		});
		const mockClient = {
			watchBlockNumber: mockWatchBlockNumber,
		} as unknown as PublicClient;

		const onBlockNumber = vi.fn();
		watchBlockNumber(mockClient, {
			onBlockNumber,
		});

		// Simulate block number callback
		capturedCallback?.(12345n);

		expect(onBlockNumber).toHaveBeenCalledTimes(1);
		expect(onBlockNumber).toHaveBeenCalledWith(12345n);
	});

	it('should invoke onError callback on error', () => {
		let capturedOnError: ((error: Error) => void) | undefined;
		const mockWatchBlockNumber = vi.fn().mockImplementation((params) => {
			capturedOnError = params.onError;
			return vi.fn();
		});
		const mockClient = {
			watchBlockNumber: mockWatchBlockNumber,
		} as unknown as PublicClient;

		const onError = vi.fn();
		watchBlockNumber(mockClient, {
			onBlockNumber: vi.fn(),
			onError,
		});

		// Simulate error callback
		const testError = new Error('Test error');
		capturedOnError?.(testError);

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(testError);
	});
});

describe('watchBlocks', () => {
	it('should call client.watchBlocks with correct parameters', () => {
		const mockUnwatch = vi.fn();
		const mockWatchBlocks = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		const onBlock = vi.fn();
		const onError = vi.fn();

		const unwatch = watchBlocks(mockClient, {
			onBlock,
			onError,
			emitOnBegin: true,
			pollingInterval: 3000,
		});

		expect(mockWatchBlocks).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchBlocks.mock.calls[0][0];
		expect(callArgs.onBlock).toBe(onBlock);
		expect(callArgs.onError).toBe(onError);
		expect(callArgs.emitOnBegin).toBe(true);
		expect(callArgs.pollingInterval).toBe(3000);

		expect(unwatch).toBe(mockUnwatch);
	});

	it('should use default polling interval when not provided', () => {
		const mockWatchBlocks = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		watchBlocks(mockClient, {
			onBlock: vi.fn(),
		});

		const callArgs = mockWatchBlocks.mock.calls[0][0];
		expect(callArgs.pollingInterval).toBe(DEFAULT_POLLING_INTERVAL_MS);
	});

	it('should pass includeTransactions when set to true', () => {
		const mockWatchBlocks = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		watchBlocks(mockClient, {
			onBlock: vi.fn(),
			includeTransactions: true,
		});

		const callArgs = mockWatchBlocks.mock.calls[0][0];
		expect(callArgs.includeTransactions).toBe(true);
	});

	it('should not pass includeTransactions when set to false', () => {
		const mockWatchBlocks = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		watchBlocks(mockClient, {
			onBlock: vi.fn(),
			includeTransactions: false,
		});

		const callArgs = mockWatchBlocks.mock.calls[0][0];
		expect(callArgs.includeTransactions).toBeUndefined();
	});

	it('should not pass includeTransactions when not provided', () => {
		const mockWatchBlocks = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		watchBlocks(mockClient, {
			onBlock: vi.fn(),
		});

		const callArgs = mockWatchBlocks.mock.calls[0][0];
		expect(callArgs.includeTransactions).toBeUndefined();
	});

	it('should return unwatch function that stops watching', () => {
		const mockUnwatch = vi.fn();
		const mockWatchBlocks = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		const unwatch = watchBlocks(mockClient, {
			onBlock: vi.fn(),
		});

		unwatch();

		expect(mockUnwatch).toHaveBeenCalledTimes(1);
	});

	it('should invoke onBlock callback with block data', () => {
		let capturedCallback: ((block: Block) => void) | undefined;
		const mockWatchBlocks = vi.fn().mockImplementation((params) => {
			capturedCallback = params.onBlock;
			return vi.fn();
		});
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		const onBlock = vi.fn();
		watchBlocks(mockClient, {
			onBlock,
		});

		// Simulate block callback
		const mockBlock = {
			number: 12345n,
			hash: '0xblockhash',
			timestamp: 1234567890n,
			transactions: [],
		} as unknown as Block;

		capturedCallback?.(mockBlock);

		expect(onBlock).toHaveBeenCalledTimes(1);
		expect(onBlock).toHaveBeenCalledWith(mockBlock);
	});

	it('should invoke onError callback on error', () => {
		let capturedOnError: ((error: Error) => void) | undefined;
		const mockWatchBlocks = vi.fn().mockImplementation((params) => {
			capturedOnError = params.onError;
			return vi.fn();
		});
		const mockClient = {
			watchBlocks: mockWatchBlocks,
		} as unknown as PublicClient;

		const onError = vi.fn();
		watchBlocks(mockClient, {
			onBlock: vi.fn(),
			onError,
		});

		// Simulate error callback
		const testError = new Error('Block fetch error');
		capturedOnError?.(testError);

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(testError);
	});
});

describe('watchPendingTransactions', () => {
	it('should call client.watchPendingTransactions with correct parameters', () => {
		const mockUnwatch = vi.fn();
		const mockWatchPendingTransactions = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchPendingTransactions: mockWatchPendingTransactions,
		} as unknown as PublicClient;

		const onTransactions = vi.fn();
		const onError = vi.fn();

		const unwatch = watchPendingTransactions(mockClient, {
			onTransactions,
			onError,
			pollingInterval: 500,
		});

		expect(mockWatchPendingTransactions).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchPendingTransactions.mock.calls[0][0];
		expect(callArgs.onTransactions).toBe(onTransactions);
		expect(callArgs.onError).toBe(onError);
		expect(callArgs.pollingInterval).toBe(500);

		expect(unwatch).toBe(mockUnwatch);
	});

	it('should not require pollingInterval', () => {
		const mockWatchPendingTransactions = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchPendingTransactions: mockWatchPendingTransactions,
		} as unknown as PublicClient;

		watchPendingTransactions(mockClient, {
			onTransactions: vi.fn(),
		});

		const callArgs = mockWatchPendingTransactions.mock.calls[0][0];
		expect(callArgs.pollingInterval).toBeUndefined();
	});

	it('should return unwatch function that stops watching', () => {
		const mockUnwatch = vi.fn();
		const mockWatchPendingTransactions = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchPendingTransactions: mockWatchPendingTransactions,
		} as unknown as PublicClient;

		const unwatch = watchPendingTransactions(mockClient, {
			onTransactions: vi.fn(),
		});

		unwatch();

		expect(mockUnwatch).toHaveBeenCalledTimes(1);
	});

	it('should invoke onTransactions callback with transaction hashes', () => {
		let capturedCallback: ((hashes: `0x${string}`[]) => void) | undefined;
		const mockWatchPendingTransactions = vi.fn().mockImplementation((params) => {
			capturedCallback = params.onTransactions;
			return vi.fn();
		});
		const mockClient = {
			watchPendingTransactions: mockWatchPendingTransactions,
		} as unknown as PublicClient;

		const onTransactions = vi.fn();
		watchPendingTransactions(mockClient, {
			onTransactions,
		});

		// Simulate pending transactions callback
		const hashes: `0x${string}`[] = [
			'0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
			'0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
		];

		capturedCallback?.(hashes);

		expect(onTransactions).toHaveBeenCalledTimes(1);
		expect(onTransactions).toHaveBeenCalledWith(hashes);
	});

	it('should invoke onError callback on error', () => {
		let capturedOnError: ((error: Error) => void) | undefined;
		const mockWatchPendingTransactions = vi.fn().mockImplementation((params) => {
			capturedOnError = params.onError;
			return vi.fn();
		});
		const mockClient = {
			watchPendingTransactions: mockWatchPendingTransactions,
		} as unknown as PublicClient;

		const onError = vi.fn();
		watchPendingTransactions(mockClient, {
			onTransactions: vi.fn(),
			onError,
		});

		// Simulate error callback
		const testError = new Error('Pending transactions error');
		capturedOnError?.(testError);

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(testError);
	});
});
