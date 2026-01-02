import { defineChain } from 'viem';
/**
 * Radius Testnet chain configuration.
 *
 * Chain ID: 1223953 (0x12ad11)
 * RPC: https://rpc.testnet.radiustech.xyz
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
    testnet: true,
});
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
    testnet: false,
});
//# sourceMappingURL=radius.js.map