import { type Account, type Hash, type PublicClient, type TransactionReceipt, type WalletClient } from 'viem';
export declare const ERC20_ABI: readonly [{
    readonly name: "name";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "symbol";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "decimals";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "transfer";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "approve";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "allowance";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "transferFrom";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "from";
    }, {
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "Transfer";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "from";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "to";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "value";
    }];
}, {
    readonly name: "Approval";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "spender";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "value";
    }];
}];
export type ERC20Signer = {
    walletClient: WalletClient;
    account: Account;
};
export declare class ERC20 {
    readonly address: `0x${string}`;
    private readonly publicClient;
    private _decimals?;
    private _symbol?;
    private _name?;
    constructor(address: `0x${string}`, publicClient: PublicClient);
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<number>;
    totalSupply(): Promise<bigint>;
    balanceOf(owner: `0x${string}`): Promise<bigint>;
    allowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
    transfer(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<Hash>;
    transferSync(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;
    approve(signer: ERC20Signer, spender: `0x${string}`, amount: bigint): Promise<Hash>;
    approveSync(signer: ERC20Signer, spender: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;
    transferFrom(signer: ERC20Signer, from: `0x${string}`, to: `0x${string}`, amount: bigint): Promise<Hash>;
    transferFromSync(signer: ERC20Signer, from: `0x${string}`, to: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;
    formatAmount(amount: bigint): Promise<string>;
    parseAmount(amount: string): Promise<bigint>;
    clearCache(): void;
}
export declare function createERC20(address: `0x${string}`, publicClient: PublicClient): ERC20;
//# sourceMappingURL=erc20.d.ts.map