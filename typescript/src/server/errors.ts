import { RadiusError, type RadiusErrorOptions } from '../errors/base';

/**
 * Base class for all server-related errors.
 *
 * Extends RadiusError to provide consistent error handling across
 * the Radius server implementation.
 */
export class ServerError extends RadiusError {
	constructor(message: string, options?: RadiusErrorOptions) {
		super(message, options);
		this.name = 'ServerError';
	}
}

/**
 * Error thrown when a request is malformed or invalid.
 *
 * Indicates that the incoming request does not conform to the
 * expected format or contains invalid parameters.
 *
 * @example
 * ```typescript
 * if (!isValidRequest(request)) {
 *   throw new InvalidRequestError('Missing required field: address');
 * }
 * ```
 */
export class InvalidRequestError extends ServerError {
	constructor(message: string, options?: RadiusErrorOptions) {
		super(message, {
			shortMessage: 'Invalid request',
			...options,
		});
		this.name = 'InvalidRequestError';
	}
}

/**
 * Error thrown when an RPC method is not supported.
 *
 * Indicates that the server does not support the requested RPC method.
 *
 * @example
 * ```typescript
 * if (!supportedMethods.includes(method)) {
 *   throw new MethodNotSupportedError(method);
 * }
 * ```
 */
export class MethodNotSupportedError extends ServerError {
	constructor(method: string, options?: RadiusErrorOptions) {
		super(`Method not supported: ${method}`, {
			shortMessage: `Method not supported: ${method}`,
			...options,
		});
		this.name = 'MethodNotSupportedError';
	}
}

/**
 * Error thrown when a WebAuthn challenge has expired.
 *
 * Indicates that the challenge used for authentication is no longer valid,
 * either because it has expired or was invalidated.
 *
 * @example
 * ```typescript
 * if (isExpired(challenge)) {
 *   throw new ChallengeExpiredError();
 * }
 * ```
 */
export class ChallengeExpiredError extends ServerError {
	constructor(options?: RadiusErrorOptions) {
		super('Challenge expired or invalid', {
			shortMessage: 'Challenge expired',
			...options,
		});
		this.name = 'ChallengeExpiredError';
	}
}

/**
 * Error thrown when a credential cannot be found.
 *
 * Indicates that the requested WebAuthn credential does not exist
 * or is not registered with the server.
 *
 * @example
 * ```typescript
 * const credential = await findCredential(credentialId);
 * if (!credential) {
 *   throw new CredentialNotFoundError(credentialId);
 * }
 * ```
 */
export class CredentialNotFoundError extends ServerError {
	constructor(credentialId: string, options?: RadiusErrorOptions) {
		super(`Credential not found: ${credentialId}`, {
			shortMessage: 'Credential not found',
			...options,
		});
		this.name = 'CredentialNotFoundError';
	}
}
