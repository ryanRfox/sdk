/**
 * Radius SDK Error Hierarchy
 *
 * Extends viem's BaseError for ecosystem compatibility.
 * All Radius errors can be caught using `instanceof BaseError` from viem.
 */
import { BaseError } from 'viem';
/**
 * Options for creating a RadiusError
 */
export interface RadiusErrorOptions {
    /** Detailed error information */
    details?: string;
    /** URL path to relevant documentation */
    docsPath?: string;
    /** The underlying cause of this error */
    cause?: BaseError | Error | undefined;
    /** Additional hint messages to help resolve the error */
    metaMessages?: string[];
    /** Additional metadata about the error (Radius-specific extension) */
    meta?: Record<string, unknown>;
}
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
export declare class RadiusError extends BaseError {
    /** Additional metadata (Radius-specific extension) */
    readonly meta?: Record<string, unknown>;
    name: string;
    constructor(shortMessage: string, options?: RadiusErrorOptions);
}
//# sourceMappingURL=base.d.ts.map