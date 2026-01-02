/**
 * Radius SDK Error Hierarchy
 *
 * Provides rich error context for better debugging and error handling.
 * Based on viem's BaseError pattern for ecosystem compatibility.
 */

/**
 * Options for creating a RadiusError
 */
export interface RadiusErrorOptions {
	/** Short description of what went wrong */
	shortMessage?: string;
	/** Detailed error information */
	details?: string;
	/** URL path to relevant documentation */
	docsPath?: string;
	/** The underlying cause of this error */
	cause?: Error | unknown;
	/** Additional metadata about the error */
	meta?: Record<string, unknown>;
}

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
	readonly shortMessage: string;
	/** Detailed error information */
	readonly details?: string;
	/** Documentation path for this error type */
	readonly docsPath?: string;
	/** The underlying cause of this error */
	override readonly cause?: Error | unknown;
	/** Additional metadata */
	readonly meta?: Record<string, unknown>;

	constructor(message: string, options: RadiusErrorOptions = {}) {
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
	walk(fn?: (err: unknown) => boolean): Error | unknown | null {
		return walk(this, fn);
	}
}

/**
 * Walk an error chain, optionally finding a specific error.
 */
function walk(
	err: Error | unknown,
	fn?: (err: unknown) => boolean,
): Error | unknown | null {
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
