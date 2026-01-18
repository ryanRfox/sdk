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

	describe('error handling', () => {
		it('should propagate errors from client.call', async () => {
			const testError = new Error('Contract call failed');
			vi.mocked(mockClient.call).mockRejectedValue(testError);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			await expect(contract.read.balanceOf([mockOwnerAddress])).rejects.toThrow('Contract call failed');
		});

		it('should propagate errors from client.executeAndWait', async () => {
			const testError = new Error('Transaction reverted');
			vi.mocked(mockClient.executeAndWait).mockRejectedValue(testError);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const mockSigner = { address: mockOwnerAddress } as any;

			await expect(
				contract.write.transfer({
					args: [mockAddress, 1000n],
					signer: mockSigner,
				}),
			).rejects.toThrow('Transaction reverted');
		});

		it('should propagate errors from client.execute when wait: false', async () => {
			const testError = new Error('Failed to send transaction');
			vi.mocked(mockClient.execute).mockRejectedValue(testError);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const mockSigner = { address: mockOwnerAddress } as any;

			await expect(
				contract.write.transfer({
					args: [mockAddress, 1000n],
					signer: mockSigner,
					options: { wait: false },
				}),
			).rejects.toThrow('Failed to send transaction');
		});
	});

	describe('args handling', () => {
		it('should handle loose args (called directly)', async () => {
			const mockBalance = 1000000n;
			vi.mocked(mockClient.call).mockResolvedValue(mockBalance);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			// Call with loose args (not wrapped in array)
			// Note: The proxy handles both styles
			const result = await (contract.read as any).balanceOf(mockOwnerAddress);

			expect(mockClient.call).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				'balanceOf',
				mockOwnerAddress,
			);
			expect(result).toBe(mockBalance);
		});

		it('should handle array args (wrapped in array)', async () => {
			const mockBalance = 1000000n;
			vi.mocked(mockClient.call).mockResolvedValue(mockBalance);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			// Call with array args (wrapped in array) - the typed way
			const result = await contract.read.balanceOf([mockOwnerAddress]);

			expect(mockClient.call).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				'balanceOf',
				mockOwnerAddress,
			);
			expect(result).toBe(mockBalance);
		});

		it('should handle multiple args correctly', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const mockSigner = { address: mockOwnerAddress } as any;
			const toAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
			const amount = 5000n;

			await contract.write.transfer({
				args: [toAddress, amount],
				signer: mockSigner,
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockErc20Abi },
				mockSigner,
				'transfer',
				toAddress,
				amount,
			);
		});

		it('should handle write with no args (empty args array)', async () => {
			// Create a mock ABI with a function that takes no arguments
			const mockAbiWithNoArgFunction = [
				...mockErc20Abi,
				{
					type: 'function',
					name: 'pause',
					stateMutability: 'nonpayable',
					inputs: [],
					outputs: [],
				},
			] as const;

			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockAbiWithNoArgFunction,
			});

			const mockSigner = { address: mockOwnerAddress } as any;

			await (contract.write as any).pause({
				signer: mockSigner,
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockAbiWithNoArgFunction },
				mockSigner,
				'pause',
			);
		});

		it('should handle default empty args when args not provided', async () => {
			const mockAbiWithNoArgFunction = [
				{
					type: 'function',
					name: 'increment',
					stateMutability: 'nonpayable',
					inputs: [],
					outputs: [{ type: 'uint256' }],
				},
			] as const;

			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockAbiWithNoArgFunction,
			});

			const mockSigner = { address: mockOwnerAddress } as any;

			// Call without args property at all
			await (contract.write as any).increment({
				signer: mockSigner,
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockAbiWithNoArgFunction },
				mockSigner,
				'increment',
			);
		});
	});

	describe('tuple/struct parameters', () => {
		const mockAbiWithTuple = [
			{
				type: 'function',
				name: 'setConfig',
				stateMutability: 'nonpayable',
				inputs: [
					{
						name: 'config',
						type: 'tuple',
						components: [
							{ name: 'name', type: 'string' },
							{ name: 'value', type: 'uint256' },
							{ name: 'enabled', type: 'bool' },
						],
					},
				],
				outputs: [],
			},
			{
				type: 'function',
				name: 'getConfig',
				stateMutability: 'view',
				inputs: [],
				outputs: [
					{
						name: '',
						type: 'tuple',
						components: [
							{ name: 'name', type: 'string' },
							{ name: 'value', type: 'uint256' },
							{ name: 'enabled', type: 'bool' },
						],
					},
				],
			},
		] as const;

		it('should handle tuple parameters in write calls', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockAbiWithTuple,
			});

			const mockSigner = { address: mockOwnerAddress } as any;
			const configTuple = { name: 'test', value: 100n, enabled: true };

			await (contract.write as any).setConfig({
				args: [configTuple],
				signer: mockSigner,
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockAbiWithTuple },
				mockSigner,
				'setConfig',
				configTuple,
			);
		});

		it('should handle tuple return values in read calls', async () => {
			const mockConfigReturn = { name: 'test', value: 100n, enabled: true };
			vi.mocked(mockClient.call).mockResolvedValue(mockConfigReturn);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockAbiWithTuple,
			});

			const result = await (contract.read as any).getConfig();

			expect(mockClient.call).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockAbiWithTuple },
				'getConfig',
			);
			expect(result).toEqual(mockConfigReturn);
		});
	});

	describe('array parameters', () => {
		const mockAbiWithArrays = [
			{
				type: 'function',
				name: 'batchTransfer',
				stateMutability: 'nonpayable',
				inputs: [
					{ name: 'recipients', type: 'address[]' },
					{ name: 'amounts', type: 'uint256[]' },
				],
				outputs: [{ type: 'bool' }],
			},
		] as const;

		it('should handle array parameters correctly', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockAbiWithArrays,
			});

			const mockSigner = { address: mockOwnerAddress } as any;
			const recipients = [mockAddress, mockOwnerAddress];
			const amounts = [100n, 200n];

			await (contract.write as any).batchTransfer({
				args: [recipients, amounts],
				signer: mockSigner,
			});

			expect(mockClient.executeAndWait).toHaveBeenCalledWith(
				{ address: mockAddress, abi: mockAbiWithArrays },
				mockSigner,
				'batchTransfer',
				recipients,
				amounts,
			);
		});
	});

	describe('options handling', () => {
		it('should use default wait: true when options not provided', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const mockSigner = { address: mockOwnerAddress } as any;

			await contract.write.transfer({
				args: [mockAddress, 1000n],
				signer: mockSigner,
				// No options provided
			});

			expect(mockClient.executeAndWait).toHaveBeenCalled();
			expect(mockClient.execute).not.toHaveBeenCalled();
		});

		it('should use default wait: true when options is empty object', async () => {
			vi.mocked(mockClient.executeAndWait).mockResolvedValue(mockReceipt);

			const contract = getContract(mockClient, {
				address: mockAddress,
				abi: mockErc20Abi,
			});

			const mockSigner = { address: mockOwnerAddress } as any;

			await contract.write.transfer({
				args: [mockAddress, 1000n],
				signer: mockSigner,
				options: {}, // Empty options
			});

			expect(mockClient.executeAndWait).toHaveBeenCalled();
			expect(mockClient.execute).not.toHaveBeenCalled();
		});
	});
});
