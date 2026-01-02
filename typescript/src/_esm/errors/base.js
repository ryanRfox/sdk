/**
 * Radius SDK Error Hierarchy
 *
 * Provides rich error context for better debugging and error handling.
 * Based on viem's BaseError pattern for ecosystem compatibility.
 */
/**
 * Base error class for all Radius SDK errors.
 *
 * Provides rich error context including:
 * - Short message for quick understanding
 * - Detailed error information
 * - Documentation links
 * - Error cause chain traversal
 *
 * @example
 * ```typescript
 * try {
 *   await client.sendAndWait(signer, to, value);
 * } catch (error) {
 *   if (error instanceof RadiusError) {
 *     console.log(error.shortMessage); // Quick description
 *     console.log(error.details);      // Full details
 *     console.log(error.docsPath);     // Link to docs
 *   }
 * }
 * ```
 */
export class RadiusError extends Error {
    /** Short, human-readable error description */
    shortMessage;
    /** Detailed error information */
    details;
    /** Documentation path for this error type */
    docsPath;
    /** The underlying cause of this error */
    cause;
    /** Additional metadata */
    meta;
    constructor(message, options = {}) {
        super(message);
        this.name = 'RadiusError';
        this.shortMessage = options.shortMessage ?? message;
        this.details = options.details;
        this.docsPath = options.docsPath;
        this.cause = options.cause;
        this.meta = options.meta;
        // Maintain proper prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
    /**
     * Walk the error cause chain.
     *
     * @param fn - Optional predicate function. If provided, returns the first error
     *             that matches the predicate. If not provided, returns the deepest cause.
     * @returns The matched error, or null if no match found
     *
     * @example
     * ```typescript
     * // Get deepest cause
     * const root = error.walk();
     *
     * // Find specific error type
     * const txError = error.walk(e => e instanceof TransactionFailedError);
     * ```
     */
    walk(fn) {
        return walk(this, fn);
    }
}
/**
 * Walk an error chain, optionally finding a specific error.
 */
function walk(err, fn) {
    if (fn?.(err)) {
        return err;
    }
    if (err instanceof Error && err.cause) {
        if (fn?.(err.cause)) {
            return err.cause;
        }
        if (err.cause instanceof Error) {
            return walk(err.cause, fn);
        }
        return err.cause;
    }
    return fn ? null : err;
}
//# sourceMappingURL=base.js.map