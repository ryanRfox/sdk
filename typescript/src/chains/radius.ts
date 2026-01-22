import { defineChain } from 'viem';

/**
 * Radius Mainnet chain configuration.
 *
 * Chain ID: 723
 * RPC: https://rpc.radiustech.xyz
 *
 * @example
 * ```typescript
 * import { radius } from '@radiustechsystems/sdk/chains';
 *
 * const client = createPublicClient({
 *   chain: radius,
 *   transport: http(),
 * });
 * ```
 */
export const radius = /*#__PURE__*/ defineChain({
	id: 723,
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
	testnet: false,
});
