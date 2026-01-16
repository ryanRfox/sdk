import { type Address, type Hash, type TransactionReceipt } from 'viem';
export type UseERC20BalanceParams = {
    token: Address;
    address?: Address;
};
export declare function useERC20Balance({ token, address }: UseERC20BalanceParams): import("wagmi").UseReadContractReturnType<readonly [{
    readonly type: "event";
    readonly name: "Approval";
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "value";
        readonly type: "uint256";
    }];
}, {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "value";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "approve";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly type: "function";
    readonly name: "balanceOf";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "decimals";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly type: "function";
    readonly name: "name";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly type: "function";
    readonly name: "symbol";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly type: "function";
    readonly name: "totalSupply";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "transfer";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly type: "function";
    readonly name: "transferFrom";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}], "balanceOf", readonly [account: `0x${string}`], bigint>;
export type UseERC20AllowanceParams = {
    token: Address;
    owner?: Address;
    spender: Address;
};
export declare function useERC20Allowance({ token, owner, spender }: UseERC20AllowanceParams): import("wagmi").UseReadContractReturnType<readonly [{
    readonly type: "event";
    readonly name: "Approval";
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "value";
        readonly type: "uint256";
    }];
}, {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly indexed: true;
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly indexed: true;
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly indexed: false;
        readonly name: "value";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "approve";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly type: "function";
    readonly name: "balanceOf";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "decimals";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly type: "function";
    readonly name: "name";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly type: "function";
    readonly name: "symbol";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly type: "function";
    readonly name: "totalSupply";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "transfer";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly type: "function";
    readonly name: "transferFrom";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "sender";
        readonly type: "address";
    }, {
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}], "allowance", readonly [owner: `0x${string}`, spender: `0x${string}`], bigint>;
export type UseERC20MetadataParams = {
    token: Address;
};
export declare function useERC20Metadata({ token }: UseERC20MetadataParams): {
    name: string | undefined;
    symbol: string | undefined;
    decimals: number | undefined;
    totalSupply: bigint | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<[import("@tanstack/react-query").QueryObserverResult<string, import("viem").ReadContractErrorType>, import("@tanstack/react-query").QueryObserverResult<string, import("viem").ReadContractErrorType>, import("@tanstack/react-query").QueryObserverResult<number, import("viem").ReadContractErrorType>, import("@tanstack/react-query").QueryObserverResult<bigint, import("viem").ReadContractErrorType>]>;
};
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
export declare function useERC20Transfer({ token }: UseERC20TransferParams): UseERC20TransferReturn;
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
export declare function useERC20Approve({ token }: UseERC20ApproveParams): UseERC20ApproveReturn;
//# sourceMappingURL=useERC20.d.ts.map