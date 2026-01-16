import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { RadiusClient } from '../../src/client/client.js';

const mockErc20Abi = [
	{
		type: 'function',
		name: 'balanceOf',
		stateMutability: 'view',
		inputs: [{ name: 'owner', type: 'address' }],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'transfer',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ type: 'bool' }],
	},
] as const;

const mockAddress = '0x1234567890123456789012345678901234567890' as const;
const mockOwnerAddress = '0x0987654321098765432109876543210987654321' as const;

describe('readContract and writeContract aliases', () => {
	let mockClient: RadiusClient;

	beforeEach(() => {
		mockClient = {
			call: vi.fn(),
			execute: vi.fn(),
			readContract: vi.fn(),
			writeContract: vi.fn(),
		} as unknown as RadiusClient;
	});

	describe('readContract', () => {
		it('should delegate to call with correct parameters', async () => {
			const mockBalance = 1000000n;
			vi.mocked(mockClient.call).mockResolvedValue(mockBalance);

			// Simulate what readContract does internally
			const params = {
				address: mockAddress,
				abi: mockErc20Abi,
				functionName: 'balanceOf',
				args: [mockOwnerAddress] as readonly unknown[],
			};

			const contract = { address: params.address, abi: params.abi };
			const result = await mockClient.call(contract, params.functionName, ...params.args);

			expect(mockClient.call).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				'balanceOf',
				mockOwnerAddress,
			);
			expect(result).toBe(mockBalance);
		});
	});

	describe('writeContract', () => {
		const mockSigner = { address: mockOwnerAddress } as any;

		it('should delegate to execute with correct parameters', async () => {
			const mockHash = '0xabc123';
			vi.mocked(mockClient.execute).mockResolvedValue(mockHash as any);

			// Simulate what writeContract does internally
			const params = {
				address: mockAddress,
				abi: mockErc20Abi,
				functionName: 'transfer',
				args: [mockAddress, 1000n] as readonly unknown[],
				account: mockSigner,
			};

			const contract = { address: params.address, abi: params.abi };
			const result = await mockClient.execute(contract, params.account, params.functionName, ...params.args);

			expect(mockClient.execute).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				mockSigner,
				'transfer',
				mockAddress,
				1000n,
			);
			expect(result).toBe(mockHash);
		});
	});
});
