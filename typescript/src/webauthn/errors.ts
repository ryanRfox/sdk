import { RadiusError, type RadiusErrorOptions } from '../errors/base';

/**
 * Base class for all server-related errors.
 *
 * These error classes are provided as utilities for user code that builds on the SDK.
 * The SDK's Handler itself returns HTTP responses with JSON error messages rather than
 * throwing these errors - this is the standard pattern for server handlers.
 *
 * Use these classes in your own error handling code when you want typed, structured errors.
 *
 * @extends RadiusError
 *
 * @example
 * ```typescript
 * import { ServerError } from '@radiustechsystems/sdk/webauthn';
 *
 * // In your custom validation code:
 * if (!isValid(input)) {
 *   throw new ServerError('Validation failed');
 * }
 * ```
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
 * Indicates that the incoming HTTP request does not conform to the expected format,
 * is missing required fields, or contains invalid parameter values. This error is typically
 * returned as an HTTP 400 Bad Request.
 *
 * @extends ServerError
 *
 * @param message - A detailed error message describing what is invalid
 * @param options - Additional error options and metadata
 *
 * @example
 * ```typescript
 * import { InvalidRequestError } from '@radiustechsystems/sdk/webauthn';
 *
 * if (!request.body.credential) {
 *   throw new InvalidRequestError('Missing required field: credential');
 * }
 *
 * // Returns to client as:
 * // { error: 'Invalid request: Missing required field: credential' }
 * ```
 */
export class InvalidRequestError extends ServerError {
	constructor(message: string, options?: RadiusErrorOptions) {
		super(message, options);
		this.name = 'InvalidRequestError';
	}
}

/**
 * Error thrown when a requested RPC or HTTP method is not supported.
 *
 * Indicates that the server does not implement the requested RPC method or HTTP verb.
 * This error is typically returned as an HTTP 405 Method Not Allowed or JSON-RPC -32601.
 *
 * @extends ServerError
 *
 * @param method - The name of the unsupported method (e.g., 'eth_call', 'DELETE')
 * @param options - Additional error options and metadata
 *
 * @example
 * ```typescript
 * import { MethodNotSupportedError } from '@radiustechsystems/sdk/webauthn';
 *
 * const supportedMethods = ['eth_sendRawTransaction'];
 *
 * if (!supportedMethods.includes(jsonRpcRequest.method)) {
 *   throw new MethodNotSupportedError(jsonRpcRequest.method);
 * }
 *
 * // Returns to client as:
 * // { error: { code: -32601, message: 'Method not supported: eth_call' } }
 * ```
 */
export class MethodNotSupportedError extends ServerError {
	constructor(method: string, options?: RadiusErrorOptions) {
		super(`Method not supported: ${method}`, options);
		this.name = 'MethodNotSupportedError';
	}
}

/**
 * Error thrown when a WebAuthn challenge has expired or is invalid.
 *
 * Indicates that the challenge used for authentication is no longer valid. This can happen when:
 * - The challenge was issued but has passed its TTL
 * - The challenge was already consumed in a previous authentication
 * - The challenge was revoked by the server
 *
 * The client should obtain a new challenge from the server.
 *
 * @extends ServerError
 * @param options - Additional error options and metadata
 *
 * @example
 * ```typescript
 * import { ChallengeExpiredError } from '@radiustechsystems/sdk/webauthn';
 *
 * const challenge = await kv.get(`challenge:${challengeId}`);
 * if (!challenge) {
 *   throw new ChallengeExpiredError();
 * }
 *
 * // Returns to client as:
 * // { error: 'Challenge expired: Challenge expired or invalid' }
 * ```
 */
export class ChallengeExpiredError extends ServerError {
	constructor(options?: RadiusErrorOptions) {
		super('Challenge expired or invalid', options);
		this.name = 'ChallengeExpiredError';
	}
}

/**
 * Error thrown when a requested WebAuthn credential cannot be found.
 *
 * Indicates that a credential with the requested ID does not exist in the system
 * or has been deleted. This error is typically returned as HTTP 404 Not Found.
 *
 * @extends ServerError
 *
 * @param credentialId - The ID of the credential that was not found
 * @param options - Additional error options and metadata
 *
 * @example
 * ```typescript
 * import { CredentialNotFoundError } from '@radiustechsystems/sdk/webauthn';
 *
 * const publicKey = await kv.get(`credential:${credentialId}`);
 * if (!publicKey) {
 *   throw new CredentialNotFoundError(credentialId);
 * }
 *
 * // Returns to client as:
 * // { error: 'Credential not found: abc123def456', status: 404 }
 * ```
 */
export class CredentialNotFoundError extends ServerError {
	constructor(credentialId: string, options?: RadiusErrorOptions) {
		super(`Credential not found: ${credentialId}`, options);
		this.name = 'CredentialNotFoundError';
	}
}
