'use client';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ERC20_ABI } from '../../contracts/index.js';
export function useERC20Balance({ token, address }) {
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
export function useERC20Allowance({ token, owner, spender }) {
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
export function useERC20Metadata({ token }) {
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
        refetch: () => Promise.all([name.refetch(), symbol.refetch(), decimals.refetch(), totalSupply.refetch()]),
    };
}
export function useERC20Transfer({ token }) {
    const { data: hash, error, isPending, writeContract, reset } = useWriteContract();
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, } = useWaitForTransactionReceipt({
        hash,
    });
    const transfer = (to, amount) => {
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
export function useERC20Approve({ token }) {
    const { data: hash, error, isPending, writeContract, reset } = useWriteContract();
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, } = useWaitForTransactionReceipt({
        hash,
    });
    const approve = (spender, amount) => {
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
//# sourceMappingURL=useERC20.js.map