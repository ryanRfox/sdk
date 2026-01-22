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
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
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
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
            readonly blockCreated: 1768594222351;
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
//# sourceMappingURL=radiusTestnet.d.ts.map