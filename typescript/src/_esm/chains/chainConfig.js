/**
 * Shared chain configuration constants for Radius.
 */
/**
 * Maximum gas limit for transactions on Radius.
 *
 * IMPORTANT: This constant is required because:
 * - Radius returns gasLimit: 0 for all blocks (intentionally)
 * - This differs from Ethereum where block.gasLimit is ~30,000,000
 * - Dynamic fetching from blocks is not possible
 *
 * This value (0x13333333332) is a Radius protocol constant used to:
 * 1. Cap gas estimates to prevent unexpectedly high values
 * 2. Provide a safety bound for transaction gas limits
 *
 * Similar to how Arbitrum and zkSync SDKs use custom gas handling
 * rather than relying on block.gasLimit.
 *
 * @see _research/sdk-walkthrough/GASLIMIT-ECOSYSTEM.md for full ecosystem impact analysis
 *
 * @example
 * ```typescript
 * import { MAX_GAS } from '@radiustechsystems/sdk';
 *
 * // Cap gas estimate at MAX_GAS
 * const cappedGas = estimatedGas > MAX_GAS ? MAX_GAS : estimatedGas;
 * ```
 */
export const MAX_GAS = 1319413953330n;
//# sourceMappingURL=chainConfig.js.map