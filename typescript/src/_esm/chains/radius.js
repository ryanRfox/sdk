import { defineChain } from 'viem';
/**
 * Well-known contract addresses on Radius Testnet
 */
export const RADIUS_TESTNET_CONTRACTS = {
    /** SBC token contract */
    sbc: '0xF966020a30946A64B39E2e243049036367590858',
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
export const radiusTestnet = defineChain({
    id: 1223953,
    name: 'Radius Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'USD',
        symbol: 'USD',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.radiustech.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Radius Explorer',
            url: 'https://explorer.testnet.radiustech.xyz',
        },
    },
    contracts: {
        /** SBC token contract address */
        sbc: {
            address: RADIUS_TESTNET_CONTRACTS.sbc,
        },
    },
    testnet: true,
});
/**
 * Well-known contract addresses on Radius Mainnet
 * Note: These are placeholder values until mainnet launches
 */
export const RADIUS_MAINNET_CONTRACTS = {
    /** SBC token contract (placeholder) */
    sbc: '0x0000000000000000000000000000000000000000',
};
/**
 * Radius Mainnet chain configuration.
 *
 * Note: Mainnet chain ID and RPC URL TBD - using placeholder values.
 * Update these when mainnet launches.
 */
export const radiusMainnet = defineChain({
    id: 1223954, // Placeholder - update when mainnet launches
    name: 'Radius',
    nativeCurrency: {
        decimals: 18,
        name: 'USD',
        symbol: 'USD',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.radiustech.xyz'], // Placeholder
        },
    },
    blockExplorers: {
        default: {
            name: 'Radius Explorer',
            url: 'https://explorer.radiustech.xyz', // Placeholder
        },
    },
    contracts: {
        /** SBC token contract address (placeholder) */
        sbc: {
            address: RADIUS_MAINNET_CONTRACTS.sbc,
        },
    },
    testnet: false,
});
//# sourceMappingURL=radius.js.map