import { defineChain } from 'viem';

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
export const radiusTestnet = /*#__PURE__*/ defineChain({
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
		multicall3: {
			address: '0xcA11bde05977b3631167028862bE2a173976CA11',
			blockCreated: 1768594222351,
		},
	},
	testnet: true,
});
