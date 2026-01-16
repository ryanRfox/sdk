/**
 * WebAuthn module for Radius SDK
 *
 * Provides request handlers for WebAuthn credential and passkey management.
 *
 * @example
 * ```typescript
 * import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';
 *
 * const kv = Kv.memory();
 * const handler = Handler.keyManager({ kv });
 * ```
 */
export type { HandlerOptions, KeyManagerOptions, ComposeOptions, } from './types.js';
export { ServerError, InvalidRequestError, MethodNotSupportedError, ChallengeExpiredError, CredentialNotFoundError, } from './errors.js';
export * as Handler from './Handler.js';
export * as Kv from './Kv.js';
//# sourceMappingURL=index.d.ts.map