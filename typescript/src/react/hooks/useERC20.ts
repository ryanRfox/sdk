'use client';

import type { Address, Hash, TransactionReceipt } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ERC20_ABI } from '../../contracts/index.js';

// ============================================================================
// useERC20Balance
// ============================================================================

export type UseERC20BalanceParams = {
	token: Address;
	address?: Address;
};

export function useERC20Balance({ token, address }: UseERC20BalanceParams) {
	const { address: connectedAddress } = useAccount();
	const owner = address ?? connectedAddress;

	return useReadContract({
		address: token,
		abi: ERC20_ABI,
		functionName: 'balanceOf',
		args: owner ? [owner] : undefined,
		query: {
			enabled: !!owner,
		},
	});
}

// ============================================================================
// useERC20Allowance
// ============================================================================

export type UseERC20AllowanceParams = {
	token: Address;
	owner?: Address;
	spender: Address;
};

export function useERC20Allowance({ token, owner, spender }: UseERC20AllowanceParams) {
	const { address: connectedAddress } = useAccount();
	const ownerAddress = owner ?? connectedAddress;

	return useReadContract({
		address: token,
		abi: ERC20_ABI,
		functionName: 'allowance',
		args: ownerAddress ? [ownerAddress, spender] : undefined,
		query: {
			enabled: !!ownerAddress,
		},
	});
}

// ============================================================================
// useERC20Metadata
// ============================================================================

export type UseERC20MetadataParams = {
	token: Address;
};

export function useERC20Metadata({ token }: UseERC20MetadataParams) {
	const name = useReadContract({
		address: token,
		abi: ERC20_ABI,
		functionName: 'name',
	});

	const symbol = useReadContract({
		address: token,
		abi: ERC20_ABI,
		functionName: 'symbol',
	});

	const decimals = useReadContract({
		address: token,
		abi: ERC20_ABI,
		functionName: 'decimals',
	});

	const totalSupply = useReadContract({
		address: token,
		abi: ERC20_ABI,
		functionName: 'totalSupply',
	});

	return {
		name: name.data,
		symbol: symbol.data,
		decimals: decimals.data,
		totalSupply: totalSupply.data,
		isLoading: name.isLoading || symbol.isLoading || decimals.isLoading || totalSupply.isLoading,
		isError: name.isError || symbol.isError || decimals.isError || totalSupply.isError,
		refetch: () =>
			Promise.all([name.refetch(), symbol.refetch(), decimals.refetch(), totalSupply.refetch()]),
	};
}

// ============================================================================
// useERC20Transfer
// ============================================================================

export type UseERC20TransferParams = {
	token: Address;
};

export type UseERC20TransferReturn = {
	hash: Hash | undefined;
	receipt: TransactionReceipt | undefined;
	error: Error | null;
	isPending: boolean;
	isConfirming: boolean;
	isConfirmed: boolean;
	transfer: (to: Address, amount: bigint) => void;
	reset: () => void;
};

export function useERC20Transfer({ token }: UseERC20TransferParams): UseERC20TransferReturn {
	const { data: hash, error, isPending, writeContract, reset } = useWriteContract();

	const {
		data: receipt,
		isLoading: isConfirming,
		isSuccess: isConfirmed,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const transfer = (to: Address, amount: bigint) => {
		writeContract({
			address: token,
			abi: ERC20_ABI,
			functionName: 'transfer',
			args: [to, amount],
		});
	};

	return {
		hash,
		receipt,
		error,
		isPending,
		isConfirming,
		isConfirmed,
		transfer,
		reset,
	};
}

// ============================================================================
// useERC20Approve
// ============================================================================

export type UseERC20ApproveParams = {
	token: Address;
};

export type UseERC20ApproveReturn = {
	hash: Hash | undefined;
	receipt: TransactionReceipt | undefined;
	error: Error | null;
	isPending: boolean;
	isConfirming: boolean;
	isConfirmed: boolean;
	approve: (spender: Address, amount: bigint) => void;
	reset: () => void;
};

export function useERC20Approve({ token }: UseERC20ApproveParams): UseERC20ApproveReturn {
	const { data: hash, error, isPending, writeContract, reset } = useWriteContract();

	const {
		data: receipt,
		isLoading: isConfirming,
		isSuccess: isConfirmed,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const approve = (spender: Address, amount: bigint) => {
		writeContract({
			address: token,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [spender, amount],
		});
	};

	return {
		hash,
		receipt,
		error,
		isPending,
		isConfirming,
		isConfirmed,
		approve,
		reset,
	};
}
