"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.radiusMainnet = exports.RADIUS_MAINNET_CONTRACTS = exports.radiusTestnet = exports.RADIUS_TESTNET_CONTRACTS = void 0;
const viem_1 = require("viem");
exports.RADIUS_TESTNET_CONTRACTS = {
    sbc: '0xF966020a30946A64B39E2e243049036367590858',
};
exports.radiusTestnet = (0, viem_1.defineChain)({
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
        sbc: {
            address: exports.RADIUS_TESTNET_CONTRACTS.sbc,
        },
    },
    testnet: true,
});
exports.RADIUS_MAINNET_CONTRACTS = {
    sbc: '0x0000000000000000000000000000000000000000',
};
exports.radiusMainnet = (0, viem_1.defineChain)({
    id: 1223954,
    name: 'Radius',
    nativeCurrency: {
        decimals: 18,
        name: 'USD',
        symbol: 'USD',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.radiustech.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Radius Explorer',
            url: 'https://explorer.radiustech.xyz',
        },
    },
    contracts: {
        sbc: {
            address: exports.RADIUS_MAINNET_CONTRACTS.sbc,
        },
    },
    testnet: false,
});
//# sourceMappingURL=radius.js.map