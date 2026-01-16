import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getContract } from '../../src/contracts/typedContract.js';
import type { RadiusClient, RadiusReceipt } from '../../src/client/client.js';

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
		name: 'totalSupply',
		stateMutability: 'view',
		inputs: [],
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
	{
		type: 'function',
		name: 'approve',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ type: 'bool' }],
	},
] as const;

const mockAddress = '0x1234567890123456789012345678901234567890' as const;
const mockOwnerAddress = '0x0987654321098765432109876543210987654321' as const;

describe('getContract', () => {
	let mockClient: RadiusClient;
	let mockReceipt: RadiusReceipt;

	beforeEach(() => {
		mockReceipt = {
			transactionHash: '0x123',
			from: mockAddress,
			to: mockOwnerAddress,
			contractAddress: null,
			gasUsed: 21000n,
			status: 'success',
			blockNumber: 1n,
			blockHash: '0x456',
			logs: [],
		};

		mockClient = {
			call: vi.fn(),
			execute: vi.fn(),
			executeAndWait: vi.fn(),
		} as unknown as RadiusClient;
	});

	describe('read namespace', () => {
		it('should call client.call with correct parameters for function with args', async () => {
			const mockBalance = 1000000n;
			vi.mocked(mockClient.call).mockResolvedValue(mockBalance);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const result = await contract.read.balanceOf([mockOwnerAddress]);

			expect(mockClient.call).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				'balanceOf',
				mockOwnerAddress,
			);
			expect(result).toBe(mockBalance);
		});

		it('should call client.call with correct parameters for function without args', async () => {
			const mockSupply = 1000000000n;
			vi.mocked(mockClient.call).mockResolvedValue(mockSupply);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const result = await contract.read.totalSupply();

			expect(mockClient.call).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				'totalSupply',
			);
			expect(result).toBe(mockSupply);
		});
	});

	describe('write namespace', () => {
		const mockSigner = { address: mockOwnerAddress } as any;

		it('should call client.executeAndWait by default', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const result = await contract.write.transfer({
				args: [mockAddress, 1000n],
				signer: mockSigner,
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				mockSigner,
				'transfer',
				mockAddress,
				1000n,
			);
			expect(result).toBe(mockReceipt);
		});

		it('should call client.execute when wait: false', async () => {
			const mockHash = '0xabc123';
			vi.mocked(mockClient.execute).mockResolvedValue(mockHash as any);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const result = await contract.write.transfer({
				args: [mockAddress, 1000n],
				signer: mockSigner,
				options: { wait: false },
			});

			expect(mockClient.execute).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				mockSigner,
				'transfer',
				mockAddress,
				1000n,
			);
			expect(result).toBe(mockHash);
		});

		it('should call client.executeAndWait when wait: true', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const result = await contract.write.approve({
				args: [mockAddress, 1000n],
				signer: mockSigner,
				options: { wait: true },
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				mockSigner,
				'approve',
				mockAddress,
				1000n,
			);
			expect(result).toBe(mockReceipt);
		});
	});

	describe('contract properties', () => {
		it('should expose address and abi', () => {
			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			expect(contract.address).toBe(mockAddress);
			expect(contract.abi).toBe(mockErc20Abi);
		});
	});
});
