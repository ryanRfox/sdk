import { describe, expect, it } from 'vitest';
import { encodeEventTopics, encodeAbiParameters, type Log } from 'viem';
import { decodeEventLogs, filterEventLogs } from '../../src/events/decodeEventLogs.js';

const erc20Abi = [
	{
		type: 'event',
		name: 'Transfer',
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
	},
	{
		type: 'event',
		name: 'Approval',
		inputs: [
			{ indexed: true, name: 'owner', type: 'address' },
			{ indexed: true, name: 'spender', type: 'address' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
	},
] as const;

const mockAddress1 = '0x1234567890123456789012345678901234567890';
const mockAddress2 = '0x0987654321098765432109876543210987654321';
const mockContractAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

// Helper to create a mock Transfer log
function createTransferLog(from: string, to: string, value: bigint): Log {
	const topics = encodeEventTopics({
		abi: erc20Abi,
		eventName: 'Transfer',
		args: { from: from as `0x${string}`, to: to as `0x${string}` },
	}) as [`0x${string}`, ...`0x${string}`[]];
	const data = encodeAbiParameters([{ type: 'uint256' }], [value]);

	return {
		address: mockContractAddress as `0x${string}`,
		blockHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
		blockNumber: 1n,
		data,
		logIndex: 0,
		topics,
		transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
		transactionIndex: 0,
		removed: false,
	};
}

// Helper to create a mock Approval log
function createApprovalLog(owner: string, spender: string, value: bigint): Log {
	const topics = encodeEventTopics({
		abi: erc20Abi,
		eventName: 'Approval',
		args: { owner: owner as `0x${string}`, spender: spender as `0x${string}` },
	}) as [`0x${string}`, ...`0x${string}`[]];
	const data = encodeAbiParameters([{ type: 'uint256' }], [value]);

	return {
		address: mockContractAddress as `0x${string}`,
		blockHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
		blockNumber: 1n,
		data,
		logIndex: 1,
		topics,
		transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
		transactionIndex: 0,
		removed: false,
	};
}

describe('decodeEventLogs', () => {
	describe('strict mode (default)', () => {
		it('should decode a single Transfer log', () => {
			const logs = [createTransferLog(mockAddress1, mockAddress2, 1000n)];

			const decoded = decodeEventLogs({
				abi: erc20Abi,
				logs,
			});

			expect(decoded).toHaveLength(1);
			expect(decoded[0].eventName).toBe('Transfer');
			const args = decoded[0].args as { from: `0x${string}`; to: `0x${string}`; value: bigint };
			expect(args.from.toLowerCase()).toBe(mockAddress1.toLowerCase());
			expect(args.to.toLowerCase()).toBe(mockAddress2.toLowerCase());
			expect(args.value).toBe(1000n);
			expect(decoded[0].log).toBe(logs[0]);
		});

		it('should decode multiple logs of different types', () => {
			const logs = [
				createTransferLog(mockAddress1, mockAddress2, 1000n),
				createApprovalLog(mockAddress1, mockAddress2, 5000n),
			];

			const decoded = decodeEventLogs({
				abi: erc20Abi,
				logs,
			});

			expect(decoded).toHaveLength(2);
			expect(decoded[0].eventName).toBe('Transfer');
			expect(decoded[1].eventName).toBe('Approval');
		});

		it('should throw on invalid log in strict mode', () => {
			const invalidLog: Log = {
				address: mockContractAddress as `0x${string}`,
				blockHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
				blockNumber: 1n,
				data: '0x',
				logIndex: 0,
				topics: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
				transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
				transactionIndex: 0,
				removed: false,
			};

			expect(() =>
				decodeEventLogs({
					abi: erc20Abi,
					logs: [invalidLog],
				}),
			).toThrow();
		});
	});

	describe('non-strict mode', () => {
		it('should skip invalid logs when strict: false', () => {
			const validLog = createTransferLog(mockAddress1, mockAddress2, 1000n);
			const invalidLog: Log = {
				address: mockContractAddress as `0x${string}`,
				blockHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
				blockNumber: 1n,
				data: '0x',
				logIndex: 1,
				topics: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
				transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
				transactionIndex: 0,
				removed: false,
			};

			const result = decodeEventLogs({
				abi: erc20Abi,
				logs: [validLog, invalidLog],
				strict: false,
			});

			expect(result.decoded).toHaveLength(1);
			expect(result.decoded[0].eventName).toBe('Transfer');
			expect(result.failed).toHaveLength(1);
			expect(result.failed![0].log).toBe(invalidLog);
		});

		it('should not include failed array when all logs decode successfully', () => {
			const logs = [createTransferLog(mockAddress1, mockAddress2, 1000n)];

			const result = decodeEventLogs({
				abi: erc20Abi,
				logs,
				strict: false,
			});

			expect(result.decoded).toHaveLength(1);
			expect(result.failed).toBeUndefined();
		});
	});
});

describe('filterEventLogs', () => {
	it('should filter logs by event name', () => {
		const logs = [
			createTransferLog(mockAddress1, mockAddress2, 1000n),
			createApprovalLog(mockAddress1, mockAddress2, 5000n),
			createTransferLog(mockAddress2, mockAddress1, 2000n),
		];

		const transfers = filterEventLogs({
			abi: erc20Abi,
			logs,
			eventName: 'Transfer',
		});

		expect(transfers).toHaveLength(2);
		expect(transfers[0].eventName).toBe('Transfer');
		expect(transfers[0].args.value).toBe(1000n);
		expect(transfers[1].args.value).toBe(2000n);
	});

	it('should filter for Approval events', () => {
		const logs = [
			createTransferLog(mockAddress1, mockAddress2, 1000n),
			createApprovalLog(mockAddress1, mockAddress2, 5000n),
		];

		const approvals = filterEventLogs({
			abi: erc20Abi,
			logs,
			eventName: 'Approval',
		});

		expect(approvals).toHaveLength(1);
		expect(approvals[0].eventName).toBe('Approval');
		expect(approvals[0].args.value).toBe(5000n);
	});

	it('should return empty array when no matching events', () => {
		const logs = [createTransferLog(mockAddress1, mockAddress2, 1000n)];

		const approvals = filterEventLogs({
			abi: erc20Abi,
			logs,
			eventName: 'Approval',
		});

		expect(approvals).toHaveLength(0);
	});

	it('should throw if event name not in ABI', () => {
		const logs = [createTransferLog(mockAddress1, mockAddress2, 1000n)];

		expect(() =>
			filterEventLogs({
				abi: erc20Abi,
				logs,
				eventName: 'NonExistentEvent',
			}),
		).toThrow('Event "NonExistentEvent" not found in ABI');
	});

	it('should skip logs from other contracts', () => {
		const validLog = createTransferLog(mockAddress1, mockAddress2, 1000n);
		const otherContractLog: Log = {
			...createTransferLog(mockAddress1, mockAddress2, 2000n),
			topics: ['0x0000000000000000000000000000000000000000000000000000000000000000'], // Invalid topic
		};

		const transfers = filterEventLogs({
			abi: erc20Abi,
			logs: [validLog, otherContractLog],
			eventName: 'Transfer',
		});

		expect(transfers).toHaveLength(1);
		expect(transfers[0].args.value).toBe(1000n);
	});
});
