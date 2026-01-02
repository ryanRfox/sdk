/**
 * Well-known contract addresses on Radius Testnet
 */
export declare const RADIUS_TESTNET_CONTRACTS: {
    /** SBC token contract */
    readonly sbc: "0xF966020a30946A64B39E2e243049036367590858";
};
/**
 * Radius Testnet chain configuration.
 *
 * Chain ID: 1223953 (0x12ad11)
 * RPC: https://rpc.testnet.radiustech.xyz
 *
 * @example
 * ```typescript
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * // Access well-known contract addresses
 * const sbcAddress = radiusTestnet.contracts?.sbc?.address;
 * ```
 */
export declare const radiusTestnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Radius Explorer";
            readonly url: "https://explorer.testnet.radiustech.xyz";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts: {
        /** SBC token contract address */
        readonly sbc: {
            readonly address: "0xF966020a30946A64B39E2e243049036367590858";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 1223953;
    name: "Radius Testnet";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "USD";
        readonly symbol: "USD";
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.testnet.radiustech.xyz"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
/**
 * Well-known contract addresses on Radius Mainnet
 * Note: These are placeholder values until mainnet launches
 */
export declare const RADIUS_MAINNET_CONTRACTS: {
    /** SBC token contract (placeholder) */
    readonly sbc: "0x0000000000000000000000000000000000000000";
};
/**
 * Radius Mainnet chain configuration.
 *
 * Note: Mainnet chain ID and RPC URL TBD - using placeholder values.
 * Update these when mainnet launches.
 */
export declare const radiusMainnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Radius Explorer";
            readonly url: "https://explorer.radiustech.xyz";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts: {
        /** SBC token contract address (placeholder) */
        readonly sbc: {
            readonly address: "0x0000000000000000000000000000000000000000";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 1223954;
    name: "Radius";
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "USD";
        readonly symbol: "USD";
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.radiustech.xyz"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: false;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
//# sourceMappingURL=radius.d.ts.map