/**
 * Tests for watchApproval and watchApprovalForAddress functions.
 */

import type { Address, Log, PublicClient } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import { type ApprovalEvent, watchApproval, watchApprovalForAddress } from './watchApproval';

// Test addresses
const TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890' as Address;
const OWNER_ADDRESS = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const SPENDER_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;

// Mock log that matches ERC-20 Approval event structure
const createMockApprovalLog = (
	owner: Address,
	spender: Address,
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
	// Approval(address indexed owner, address indexed spender, uint256 value)
	topics: [
		'0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event signature
		`0x000000000000000000000000${owner.slice(2)}` as `0x${string}`,
		`0x000000000000000000000000${spender.slice(2)}` as `0x${string}`,
	],
});

describe('watchApproval', () => {
	it('should call client.watchContractEvent with correct parameters', () => {
		const mockUnwatch = vi.fn();
		const mockWatchContractEvent = vi.fn().mockReturnValue(mockUnwatch);
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onApproval = vi.fn();
		const onError = vi.fn();

		const unwatch = watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			onApproval,
			onError,
			pollingInterval: 1000,
		});

		expect(mockWatchContractEvent).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.address).toBe(TOKEN_ADDRESS);
		expect(callArgs.eventName).toBe('Approval');
		expect(callArgs.onError).toBe(onError);
		expect(callArgs.pollingInterval).toBe(1000);
		expect(typeof callArgs.onLogs).toBe('function');

		// Verify unwatch returns the mock
		expect(unwatch).toBe(mockUnwatch);
	});

	it('should pass owner filter when provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			owner: OWNER_ADDRESS,
			onApproval: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ owner: OWNER_ADDRESS });
	});

	it('should pass spender filter when provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			spender: SPENDER_ADDRESS,
			onApproval: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ spender: SPENDER_ADDRESS });
	});

	it('should pass both owner and spender filters when provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			owner: OWNER_ADDRESS,
			spender: SPENDER_ADDRESS,
			onApproval: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ owner: OWNER_ADDRESS, spender: SPENDER_ADDRESS });
	});

	it('should not pass args when no filters provided', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			onApproval: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toBeUndefined();
	});

	it('should decode logs and call onApproval with ApprovalEvent array', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onApproval = vi.fn();
		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			onApproval,
		});

		// Simulate logs being received
		const mockLog = createMockApprovalLog(OWNER_ADDRESS, SPENDER_ADDRESS, 1000n);
		capturedOnLogs?.([mockLog]);

		expect(onApproval).toHaveBeenCalledTimes(1);
		const events: ApprovalEvent[] = onApproval.mock.calls[0][0];
		expect(events).toHaveLength(1);
		expect(events[0].owner.toLowerCase()).toBe(OWNER_ADDRESS.toLowerCase());
		expect(events[0].spender.toLowerCase()).toBe(SPENDER_ADDRESS.toLowerCase());
		expect(events[0].value).toBe(1000n);
		expect(events[0].log).toBe(mockLog);
	});

	it('should not call onApproval when no valid events decoded', () => {
		let capturedOnLogs: ((logs: Log[]) => void) | undefined;
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedOnLogs = params.onLogs;
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onApproval = vi.fn();
		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			onApproval,
		});

		// Simulate empty logs
		capturedOnLogs?.([]);

		expect(onApproval).not.toHaveBeenCalled();
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

		const onApproval = vi.fn();
		const onError = vi.fn();
		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			onApproval,
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
		expect(onApproval).not.toHaveBeenCalled();
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

		const onApproval = vi.fn();
		const onError = vi.fn();
		watchApproval(mockClient, {
			address: TOKEN_ADDRESS,
			onApproval,
			onError,
		});

		const validLog = createMockApprovalLog(OWNER_ADDRESS, SPENDER_ADDRESS, 500n);
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
		// Should still call onApproval with the valid event
		expect(onApproval).toHaveBeenCalledTimes(1);
		const events: ApprovalEvent[] = onApproval.mock.calls[0][0];
		expect(events).toHaveLength(1);
		expect(events[0].value).toBe(500n);
	});
});

describe('watchApprovalForAddress', () => {
	it('should throw error when both ownerOnly and spenderOnly are true', () => {
		const mockClient = {
			watchContractEvent: vi.fn(),
		} as unknown as PublicClient;

		expect(() => {
			watchApprovalForAddress(mockClient, {
				tokenAddress: TOKEN_ADDRESS,
				watchAddress: OWNER_ADDRESS,
				ownerOnly: true,
				spenderOnly: true,
				onApproval: vi.fn(),
			});
		}).toThrow('Cannot set both ownerOnly and spenderOnly to true');
	});

	it('should watch as owner when ownerOnly is true', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: OWNER_ADDRESS,
			ownerOnly: true,
			onApproval: vi.fn(),
		});

		expect(mockWatchContractEvent).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ owner: OWNER_ADDRESS });
	});

	it('should watch as spender when spenderOnly is true', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: SPENDER_ADDRESS,
			spenderOnly: true,
			onApproval: vi.fn(),
		});

		expect(mockWatchContractEvent).toHaveBeenCalledTimes(1);
		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.args).toEqual({ spender: SPENDER_ADDRESS });
	});

	it('should create two subscriptions when watching both owner and spender', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: OWNER_ADDRESS,
			onApproval: vi.fn(),
		});

		// Should create two subscriptions - one for owner, one for spender
		expect(mockWatchContractEvent).toHaveBeenCalledTimes(2);

		const firstCallArgs = mockWatchContractEvent.mock.calls[0][0];
		const secondCallArgs = mockWatchContractEvent.mock.calls[1][0];

		expect(firstCallArgs.args).toEqual({ owner: OWNER_ADDRESS });
		expect(secondCallArgs.args).toEqual({ spender: OWNER_ADDRESS });
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

		const unwatch = watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: OWNER_ADDRESS,
			onApproval: vi.fn(),
		});

		// Call the combined unwatch
		unwatch();

		expect(mockUnwatch1).toHaveBeenCalledTimes(1);
		expect(mockUnwatch2).toHaveBeenCalledTimes(1);
	});

	it('should deduplicate events when watching both owner and spender', () => {
		const capturedCallbacks: Array<(logs: Log[]) => void> = [];
		const mockWatchContractEvent = vi.fn().mockImplementation((params) => {
			capturedCallbacks.push(params.onLogs);
			return vi.fn();
		});
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		const onApproval = vi.fn();
		watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: OWNER_ADDRESS,
			onApproval,
		});

		// Same event received by both subscriptions (address is both owner and spender)
		const duplicateLog = createMockApprovalLog(
			OWNER_ADDRESS,
			OWNER_ADDRESS,
			1000n,
			'0xsamehash',
			0,
		);

		// First subscription receives the log
		capturedCallbacks[0]([duplicateLog]);
		// Second subscription receives the same log
		capturedCallbacks[1]([duplicateLog]);

		// Should only call onApproval once due to deduplication
		expect(onApproval).toHaveBeenCalledTimes(1);
		const events: ApprovalEvent[] = onApproval.mock.calls[0][0];
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

		const onApproval = vi.fn();
		watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: OWNER_ADDRESS,
			onApproval,
		});

		// Different events
		const log1 = createMockApprovalLog(OWNER_ADDRESS, SPENDER_ADDRESS, 1000n, '0xhash1', 0);
		const log2 = createMockApprovalLog(SPENDER_ADDRESS, OWNER_ADDRESS, 2000n, '0xhash2', 0);

		// First subscription receives owner event
		capturedCallbacks[0]([log1]);
		// Second subscription receives spender event
		capturedCallbacks[1]([log2]);

		// Should call onApproval twice with different events
		expect(onApproval).toHaveBeenCalledTimes(2);
	});

	it('should pass pollingInterval to underlying watchApproval', () => {
		const mockWatchContractEvent = vi.fn().mockReturnValue(vi.fn());
		const mockClient = {
			watchContractEvent: mockWatchContractEvent,
		} as unknown as PublicClient;

		watchApprovalForAddress(mockClient, {
			tokenAddress: TOKEN_ADDRESS,
			watchAddress: OWNER_ADDRESS,
			ownerOnly: true,
			pollingInterval: 5000,
			onApproval: vi.fn(),
		});

		const callArgs = mockWatchContractEvent.mock.calls[0][0];
		expect(callArgs.pollingInterval).toBe(5000);
	});
});
