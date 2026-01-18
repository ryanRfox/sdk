/**
 * Radius SDK Error Hierarchy
 *
 * Extends viem's BaseError for ecosystem compatibility.
 * All Radius errors can be caught using `instanceof BaseError` from viem.
 */
import { BaseError } from 'viem';
/**
 * Base error class for all Radius SDK errors.
 *
 * Extends viem's BaseError for ecosystem compatibility. This means:
 * - `error instanceof BaseError` from viem will catch Radius errors
 * - Compatible with wagmi error handling
 * - Inherits viem's error formatting and walk() method
 *
 * @example
 * ```typescript
 * import { BaseError } from 'viem';
 *
 * try {
 *   await client.sendAndWait(signer, to, value);
 * } catch (error) {
 *   if (error instanceof RadiusError) {
 *     console.log(error.shortMessage); // Quick description
 *     console.log(error.details);      // Full details
 *     console.log(error.docsPath);     // Link to docs
 *   }
 *   // Also works with viem's BaseError check
 *   if (error instanceof BaseError) {
 *     console.log('Caught viem-compatible error');
 *   }
 * }
 * ```
 */
export class RadiusError extends BaseError {
    /** Additional metadata (Radius-specific extension) */
    meta;
    name = 'RadiusError';
    constructor(shortMessage, options = {}) {
        super(shortMessage, {
            cause: options.cause,
            details: options.details,
            docsPath: options.docsPath,
            docsBaseUrl: 'https://docs.radiustech.xyz',
            metaMessages: options.metaMessages,
            name: 'RadiusError',
        });
        this.meta = options.meta;
    }
}
//# sourceMappingURL=base.js.map