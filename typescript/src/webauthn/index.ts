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

// Types
export type {
  HandlerOptions,
  KeyManagerOptions,
  ComposeOptions,
} from './types.js';

// Errors
export {
  ServerError,
  InvalidRequestError,
  MethodNotSupportedError,
  ChallengeExpiredError,
  CredentialNotFoundError,
} from './errors.js';

// Handler
export * as Handler from './Handler.js';

// KV Store
export * as Kv from './Kv.js';
