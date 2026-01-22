import type { Hash, PublicClient, WalletClient } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('readContract and writeContract', () => {
	let mockPublicClient: PublicClient;
	let mockWalletClient: WalletClient;

	beforeEach(() => {
		mockPublicClient = {
			readContract: vi.fn(),
		} as unknown as PublicClient;
		mockWalletClient = {
			writeContract: vi.fn(),
		} as unknown as WalletClient;
	});

	describe('readContract', () => {
		it('should accept viem-compatible parameters', async () => {
			const mockBalance = 1000000n;
			vi.mocked(mockPublicClient.readContract).mockResolvedValue(mockBalance);

			const params = {
				address: mockAddress,
				abi: mockErc20Abi,
				functionName: 'balanceOf' as const,
				args: [mockOwnerAddress] as const,
			};

			const result = await mockPublicClient.readContract(params);

			expect(mockPublicClient.readContract).toHaveBeenCalledWith({
				address: mockAddress,
				abi: mockErc20Abi,
				functionName: 'balanceOf',
				args: [mockOwnerAddress],
			});
			expect(result).toBe(mockBalance);
		});
	});

	describe('writeContract', () => {
		it('should accept viem-compatible parameters', async () => {
			const mockHash: Hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
			vi.mocked(mockWalletClient.writeContract).mockResolvedValue(mockHash);

			const params = {
				address: mockAddress,
				abi: mockErc20Abi,
				functionName: 'transfer' as const,
				args: [mockAddress, 1000n] as const,
				account: mockOwnerAddress,
				chain: null,
			};

			const result = await mockWalletClient.writeContract(params);

			expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
				address: mockAddress,
				abi: mockErc20Abi,
				functionName: 'transfer',
				args: [mockAddress, 1000n],
				account: mockOwnerAddress,
				chain: null,
			});
			expect(result).toBe(mockHash);
		});
	});
});
