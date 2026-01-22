/**
 * WebSocket transport for Radius SDK.
 * Provides a wrapper around viem's WebSocket transport with Radius-specific configuration.
 */
import { type Chain, type Transport, webSocket } from 'viem';

/**
 * Configuration for creating a WebSocket transport.
 */
export interface WebSocketTransportConfig {
	/** The WebSocket URL (defaults to chain's WebSocket RPC URL) */
	url?: string;
	/** Maximum number of reconnection attempts (defaults to 3) */
	reconnectAttempts?: number;
	/** Reconnection delay in milliseconds (defaults to 1000) */
	reconnectDelay?: number;
	/** Keep-alive interval in milliseconds (optional) */
	keepAlive?: number;
}

/**
 * Creates a WebSocket transport for use with Radius clients.
 * Uses viem's webSocket transport under the hood with Radius-specific defaults.
 *
 * @param chain - The chain configuration (used to determine default WebSocket URL)
 * @param config - Optional configuration for the WebSocket transport
 * @returns A viem Transport configured for WebSocket connections
 *
 * @example
 * ```typescript
 * import { createPublicClient } from 'viem';
 * import { createWebSocketTransport } from '@radiustechsystems/sdk/transport';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const transport = createWebSocketTransport(radiusTestnet, {
 *   reconnectAttempts: 5,
 *   reconnectDelay: 2000,
 * });
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport,
 * });
 * ```
 *
 * @remarks
 * - The default WebSocket URL is derived from the chain configuration
 * - For Radius Testnet, the default is: wss://rpc.testnet.radiustech.xyz
 * - WebSocket connections are automatically managed by viem
 * - Subscriptions are cleaned up automatically on disconnect
 */
export function createWebSocketTransport(
	chain: Chain,
	config?: WebSocketTransportConfig,
): Transport {
	// Determine WebSocket URL
	let wsUrl = config?.url;

	if (!wsUrl) {
		// Try to get WebSocket URL from chain config
		const chainWsUrl = chain.rpcUrls.default.webSocket?.[0];
		if (chainWsUrl) {
			wsUrl = chainWsUrl;
		} else {
			// Fallback: convert HTTP URL to WebSocket URL
			const httpUrl = chain.rpcUrls.default.http[0];
			if (!httpUrl) {
				throw new Error('No RPC URL configured for chain');
			}
			// Simple http(s) -> ws(s) conversion
			wsUrl = httpUrl.replace(/^http/, 'ws');
		}
	}

	// Create viem WebSocket transport with configuration
	return webSocket(wsUrl, {
		// Viem's webSocket transport accepts these options
		reconnect: {
			attempts: config?.reconnectAttempts ?? 3,
			delay: config?.reconnectDelay ?? 1000,
		},
		keepAlive: config?.keepAlive
			? {
					interval: config.keepAlive,
				}
			: false,
	});
}
