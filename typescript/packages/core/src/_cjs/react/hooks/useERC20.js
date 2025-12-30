"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useERC20Balance = useERC20Balance;
exports.useERC20Allowance = useERC20Allowance;
exports.useERC20Metadata = useERC20Metadata;
exports.useERC20Transfer = useERC20Transfer;
exports.useERC20Approve = useERC20Approve;
const wagmi_1 = require("wagmi");
const index_js_1 = require("../../contracts/index.js");
function useERC20Balance({ token, address }) {
    const { address: connectedAddress } = (0, wagmi_1.useAccount)();
    const owner = address ?? connectedAddress;
    return (0, wagmi_1.useReadContract)({
        address: token,
        abi: index_js_1.ERC20_ABI,
        functionName: 'balanceOf',
        args: owner ? [owner] : undefined,
        query: {
            enabled: !!owner,
        },
    });
}
function useERC20Allowance({ token, owner, spender, }) {
    const { address: connectedAddress } = (0, wagmi_1.useAccount)();
    const ownerAddress = owner ?? connectedAddress;
    return (0, wagmi_1.useReadContract)({
        address: token,
        abi: index_js_1.ERC20_ABI,
        functionName: 'allowance',
        args: ownerAddress ? [ownerAddress, spender] : undefined,
        query: {
            enabled: !!ownerAddress,
        },
    });
}
function useERC20Metadata({ token }) {
    const name = (0, wagmi_1.useReadContract)({
        address: token,
        abi: index_js_1.ERC20_ABI,
        functionName: 'name',
    });
    const symbol = (0, wagmi_1.useReadContract)({
        address: token,
        abi: index_js_1.ERC20_ABI,
        functionName: 'symbol',
    });
    const decimals = (0, wagmi_1.useReadContract)({
        address: token,
        abi: index_js_1.ERC20_ABI,
        functionName: 'decimals',
    });
    const totalSupply = (0, wagmi_1.useReadContract)({
        address: token,
        abi: index_js_1.ERC20_ABI,
        functionName: 'totalSupply',
    });
    return {
        name: name.data,
        symbol: symbol.data,
        decimals: decimals.data,
        totalSupply: totalSupply.data,
        isLoading: name.isLoading ||
            symbol.isLoading ||
            decimals.isLoading ||
            totalSupply.isLoading,
        isError: name.isError || symbol.isError || decimals.isError || totalSupply.isError,
        refetch: () => Promise.all([
            name.refetch(),
            symbol.refetch(),
            decimals.refetch(),
            totalSupply.refetch(),
        ]),
    };
}
function useERC20Transfer({ token, }) {
    const { data: hash, error, isPending, writeContract, reset, } = (0, wagmi_1.useWriteContract)();
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, } = (0, wagmi_1.useWaitForTransactionReceipt)({
        hash,
    });
    const transfer = (to, amount) => {
        writeContract({
            address: token,
            abi: index_js_1.ERC20_ABI,
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
function useERC20Approve({ token, }) {
    const { data: hash, error, isPending, writeContract, reset, } = (0, wagmi_1.useWriteContract)();
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed, } = (0, wagmi_1.useWaitForTransactionReceipt)({
        hash,
    });
    const approve = (spender, amount) => {
        writeContract({
            address: token,
            abi: index_js_1.ERC20_ABI,
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