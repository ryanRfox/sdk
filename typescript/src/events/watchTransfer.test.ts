/**
 * Tests for watchTransfer and watchTransferForAddress functions.
 */

import type { Address, Log, PublicClient } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import { type TransferEvent, watchTransfer, watchTransferForAddress } from './watchTransfer';

// Test addresses
const TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890' as Address;
const FROM_ADDRESS = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const TO_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;

// Mock log that matches ERC-20 Transfer event structure
const createMockTransferLog = (
	from: Address,
	to: Address,
	value: bigint,
	txHash = '0x1234' as `0x${string}`,
	logIndex = 0,
): Log => ({
	address: TOKEN_ADDRESS,
	blockHash: '0xblockhash' as `0x${string}`,
	blockNumber: 100n,
	data: `0x${value.toString(16).padStart(64, '0')}` as `0x${string}`,
	logIndex,
	transactionHash: txHash,
	transactionIndex: 0,
	removed: false,
	// Transfer(address indexed from, address indexed to, uint256 value)
	topics: [
		'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
		`0x000000000000000000000000${from.slice(2)}` as `0x${string}`,
		`0x000000000000000000000000${to.slice(2)}` as `0x${string}`,
	],
});

describe('watchTransfer', () => {
	it('should call client.watchContractEvent with correct parameters', () => {
		const mockUnwatch = vi.fn();
		const mockWatchContractEvent = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		const onError = vi.fn();

		const unwatch = watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
			onError,
			pollingInterval: 1000,
		});

		expect(mockWatchContractEvent).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.address).toBe(TOKEN_ADDRESS);
		expect(callArgs.eventName).toBe('Transfer');
		expect(callArgs.onError).toBe(onError);
		expect(callArgs.pollingInterval).toBe(1000);
		expect(typeof callArgs.onLogs).toBe('function');

		// Verify unwatch returns the mock
		expect(unwatch).toBe(mockUnwatch);
	});

	it('should pass from filter when provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			from: FROM_ADDRESS,
			onTransfer: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ from: FROM_ADDRESS });
	});

	it('should pass to filter when provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			to: TO_ADDRESS,
			onTransfer: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ to: TO_ADDRESS });
	});

	it('should pass both from and to filters when provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			from: FROM_ADDRESS,
			to: TO_ADDRESS,
			onTransfer: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ from: FROM_ADDRESS, to: TO_ADDRESS });
	});

	it('should not pass args when no filters provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toBeUndefined();
	});

	it('should decode logs and call onTransfer with TransferEvent array', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
		});

		// Simulate logs being received
		const mockLog = createMockTransferLog(FROM_ADDRESS, TO_ADDRESS, 1000n);
		capturedOnLogs?.([mockLog]);

		expect(onTransfer).toHaveBeenCalledTimes(1);
		const events: TransferEvent[] = onTransfer.mock.calls[0][0];
		expect(events).toHaveLength(1);
		expect(events[0].from.toLowerCase()).toBe(FROM_ADDRESS.toLowerCase());
		expect(events[0].to.toLowerCase()).toBe(TO_ADDRESS.toLowerCase());
		expect(events[0].value).toBe(1000n);
		expect(events[0].log).toBe(mockLog);
	});

	it('should handle multiple logs in single callback', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
		});

		const log1 = createMockTransferLog(FROM_ADDRESS, TO_ADDRESS, 100n, '0xhash1', 0);
		const log2 = createMockTransferLog(FROM_ADDRESS, TO_ADDRESS, 200n, '0xhash2', 1);

		capturedOnLogs?.([log1, log2]);

		expect(onTransfer).toHaveBeenCalledTimes(1);
		const events: TransferEvent[] = onTransfer.mock.calls[0][0];
		expect(events).toHaveLength(2);
		expect(events[0].value).toBe(100n);
		expect(events[1].value).toBe(200n);
	});

	it('should not call onTransfer when no valid events decoded', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
		});

		// Simulate empty logs
		capturedOnLogs?.([]);

		expect(onTransfer).not.toHaveBeenCalled();
	});

	it('should call onError when log decoding fails', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		const onError = vi.fn();
		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
			onError,
		});

		// Simulate a malformed log that can't be decoded
		const malformedLog: Log = {
			address: TOKEN_ADDRESS,
			blockHash: '0xblockhash' as `0x${string}`,
			blockNumber: 100n,
			data: '0x' as `0x${string}`,
			logIndex: 0,
			transactionHash: '0x1234' as `0x${string}`,
			transactionIndex: 0,
			removed: false,
			topics: ['0xbadtopic' as `0x${string}`], // Invalid topic
		};

		capturedOnLogs?.([malformedLog]);

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(onTransfer).not.toHaveBeenCalled();
	});

	it('should handle mix of valid and invalid logs', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		const onError = vi.fn();
		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
			onError,
		});

		const validLog = createMockTransferLog(FROM_ADDRESS, TO_ADDRESS, 500n);
		const malformedLog: Log = {
			address: TOKEN_ADDRESS,
			blockHash: '0xblockhash' as `0x${string}`,
			blockNumber: 100n,
			data: '0x' as `0x${string}`,
			logIndex: 1,
			transactionHash: '0x1234' as `0x${string}`,
			transactionIndex: 0,
			removed: false,
			topics: ['0xbadtopic' as `0x${string}`],
		};

		capturedOnLogs?.([validLog, malformedLog]);

		// Should call onError for the bad log
		expect(onError).toHaveBeenCalledTimes(1);
		// Should still call onTransfer with the valid event
		expect(onTransfer).toHaveBeenCalledTimes(1);
		const events: TransferEvent[] = onTransfer.mock.calls[0][0];
		expect(events).toHaveLength(1);
		expect(events[0].value).toBe(500n);
	});

	it('should wrap non-Error exceptions in Error object', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		const onError = vi.fn();
		watchTransfer(mockClient, {
			address: TOKEN_ADDRESS,
			onTransfer,
			onError,
		});

		// Simulate a log that will cause a decoding error
		const badLog: Log = {
			address: TOKEN_ADDRESS,
			blockHash: '0xblockhash' as `0x${string}`,
			blockNumber: 100n,
			data: '0xinvalid' as `0x${string}`,
			logIndex: 0,
			transactionHash: '0x1234' as `0x${string}`,
			transactionIndex: 0,
			removed: false,
			topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'] as [
				`0x${string}`,
			],
		};

		capturedOnLogs?.([badLog]);

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
	});
});

describe('watchTransferForAddress', () => {
	it('should throw error when both senderOnly and receiverOnly are true', () => {
		const mockClient = {
			watchContractEvent: vi.fn(),
		} as unknown as PublicClient;

		expect(() => {
			watchTransferForAddress(mockClient, {
				tokenAddress: TOKEN_ADDRESS,
				watchAddress: FROM_ADDRESS,
				senderOnly: true,
				receiverOnly: true,
				onTransfer: vi.fn(),
			});
		}).toThrow('Cannot set both senderOnly and receiverOnly to true');
	});

	it('should watch as sender when senderOnly is true', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			senderOnly: true,
			onTransfer: vi.fn(),
		});

		expect(mockWatchContractEvent).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ from: FROM_ADDRESS });
	});

	it('should watch as receiver when receiverOnly is true', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: TO_ADDRESS,
			receiverOnly: true,
			onTransfer: vi.fn(),
		});

		expect(mockWatchContractEvent).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ to: TO_ADDRESS });
	});

	it('should create two subscriptions when watching both sender and receiver', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			onTransfer: vi.fn(),
		});

		// Should create two subscriptions - one for from, one for to
		expect(mockWatchContractEvent).toHaveBeenCalledTimes(2);

		const firstCallArgs = mockWatchContractEvent.mock.calls[0][0];
		const secondCallArgs = mockWatchContractEvent.mock.calls[1][0];

		expect(firstCallArgs.args).toEqual({ from: FROM_ADDRESS });
		expect(secondCallArgs.args).toEqual({ to: FROM_ADDRESS });
	});

	it('should return combined unwatch function that stops both subscriptions', () => {
		const mockUnwatch1 = vi.fn();
		const mockUnwatch2 = vi.fn();
		let callCount = 0;
		const mockWatchContractEvent = vi.fn().mockImplementation(() => {
			callCount++;
			return callCount === 1 ? mockUnwatch1 : mockUnwatch2;
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const unwatch = watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			onTransfer: vi.fn(),
		});

		// Call the combined unwatch
		unwatch();

		expect(mockUnwatch1).toHaveBeenCalledTimes(1);
		expect(mockUnwatch2).toHaveBeenCalledTimes(1);
	});

	it('should deduplicate events when watching both sender and receiver', () => {
		const capturedCallbacks: Array<(logs: Log[]) => void> = [];
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedCallbacks.push(params.onLogs);
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			onTransfer,
		});

		// Same event received by both subscriptions (address sends to itself)
		const duplicateLog = createMockTransferLog(FROM_ADDRESS, FROM_ADDRESS, 1000n, '0xsamehash', 0);

		// First subscription receives the log
		capturedCallbacks[0]([duplicateLog]);
		// Second subscription receives the same log
		capturedCallbacks[1]([duplicateLog]);

		// Should only call onTransfer once due to deduplication
		expect(onTransfer).toHaveBeenCalledTimes(1);
		const events: TransferEvent[] = onTransfer.mock.calls[0][0];
		expect(events).toHaveLength(1);
	});

	it('should not deduplicate different events', () => {
		const capturedCallbacks: Array<(logs: Log[]) => void> = [];
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedCallbacks.push(params.onLogs);
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			onTransfer,
		});

		// Different events
		const log1 = createMockTransferLog(FROM_ADDRESS, TO_ADDRESS, 1000n, '0xhash1', 0);
		const log2 = createMockTransferLog(TO_ADDRESS, FROM_ADDRESS, 2000n, '0xhash2', 0);

		// First subscription receives sender event
		capturedCallbacks[0]([log1]);
		// Second subscription receives receiver event
		capturedCallbacks[1]([log2]);

		// Should call onTransfer twice with different events
		expect(onTransfer).toHaveBeenCalledTimes(2);
	});

	it('should handle pending transactions without txHash', () => {
		const capturedCallbacks: Array<(logs: Log[]) => void> = [];
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedCallbacks.push(params.onLogs);
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onTransfer = vi.fn();
		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			onTransfer,
		});

		// Log without transactionHash (pending)
		const pendingLog: Log = {
			...createMockTransferLog(FROM_ADDRESS, TO_ADDRESS, 1000n),
			transactionHash: null,
		};

		capturedCallbacks[0]([pendingLog]);

		expect(onTransfer).toHaveBeenCalledTimes(1);
	});

	it('should pass pollingInterval to underlying watchTransfer', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			senderOnly: true,
			pollingInterval: 5000,
			onTransfer: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.pollingInterval).toBe(5000);
	});

	it('should pass onError to underlying watchTransfer', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onError = vi.fn();
		watchTransferForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: FROM_ADDRESS,
			senderOnly: true,
			onTransfer: vi.fn(),
			onError,
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.onError).toBe(onError);
	});
});
