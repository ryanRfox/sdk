/**
 * Radius wagmi integration
 *
 * Provides wagmi connectors and utilities for Radius chain.
 *
 * @example
 * ```typescript
 * import { createConfig, http } from 'wagmi';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';
 *
 * const config = createConfig({
 *   chains: [radiusTestnet],
 *   connectors: [privateKeyConnector()],
 *   transports: {
 *     [radiusTestnet.id]: http(),
 *   },
 * });
 * ```
 *
 * @packageDocumentation
 */
export { privateKeyConnector } from './connector.js';
//# sourceMappingURL=index.js.map