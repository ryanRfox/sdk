import type {
  Router,
  RouterOptions,
} from '@remix-run/fetch-router'
import type { LocalAccount } from 'viem/accounts'
import type { Chain, Client, Transport } from 'viem'
// Forward reference: Kv will be implemented in 1.5
import type { Kv } from './Kv.js'

/**
 * A request handler for processing HTTP requests.
 *
 * A Handler extends a Remix Router with additional listener capabilities for
 * adapting to different JavaScript runtimes. It provides:
 * - Standard router methods (get, post, put, delete, etc.)
 * - A `fetch()` method for Fetch API-based request handling
 * - A `listener()` method for Node.js/Express-style request handling
 *
 * The listener can be integrated into:
 * - Express.js applications
 * - Node.js HTTP servers
 * - Hono frameworks
 * - Bun.sh servers
 * - Cloudflare Workers
 * - Other runtimes with similar request/response APIs
 */
export type Handler = Router & {
  /**
   * A listener function compatible with Node.js server frameworks.
   *
   * @param req - The incoming request object
   * @param res - The response object for sending replies
   */
  listener: (req: any, res: any) => void
}

/**
 * Base configuration options for all handler types.
 *
 * Extends Remix RouterOptions with additional options for common HTTP needs.
 * These options are inherited by all specialized handler types (feePayer, keyManager, etc.).
 */
export type HandlerOptions = RouterOptions & {
  /**
   * Optional HTTP headers to add to all responses.
   *
   * Can be provided as a native Headers object or a plain object with string keys/values.
   * Useful for adding CORS headers, custom API version headers, or other global headers.
   *
   * @example
   * ```typescript
   * const handler = Handler.from({
   *   headers: {
   *     'X-API-Version': '1.0',
   *     'Access-Control-Allow-Origin': '*',
   *   }
   * });
   * ```
   */
  headers?: Headers | Record<string, string> | undefined
}

/**
 * Configuration options for the feePayer handler.
 *
 * Configures a handler that can sponsor transaction fees on behalf of users.
 * The fee payer account will be used to sign and submit transactions, allowing
 * application-level fee sponsorship.
 *
 * You must provide either:
 * - A pre-configured viem `client`, OR
 * - Both `chain` and `transport` (handler will create the client)
 */
export type FeePayerOptions = HandlerOptions & {
  /**
   * The viem LocalAccount to use as the fee payer.
   *
   * This account will sponsor fees for all transactions processed by this handler.
   *
   * @example
   * ```typescript
   * import { privateKeyToAccount } from 'viem/accounts';
   * const account = privateKeyToAccount('0x...');
   * ```
   */
  account: LocalAccount
  /**
   * Optional callback invoked before processing each request.
   *
   * Useful for logging, request validation, or triggering side effects.
   * If the callback throws, the request processing stops and an error is returned.
   */
  onRequest?: (request: unknown) => Promise<void>
  /**
   * The path prefix for the fee payer endpoints.
   * Defaults to '/' if not specified.
   */
  path?: string | undefined
} & (
  | {
      /**
       * A pre-configured viem Client.
       *
       * The client should be configured with the appropriate chain and transport
       * for submitting transactions.
       */
      client: Client
    }
  | {
      /**
       * The blockchain chain configuration.
       *
       * Used with `transport` to create an internal viem client.
       */
      chain: Chain
      /**
       * The viem transport configuration.
       *
       * Used with `chain` to create an internal viem client.
       * Examples: http(), websocket(), custom()
       */
      transport: Transport
    }
)

/**
 * Configuration options for the keyManager handler.
 *
 * Configures a WebAuthn-based credential management service for secure key storage and retrieval.
 * The handler manages WebAuthn challenges and public key credentials through a KV store.
 */
export type KeyManagerOptions = HandlerOptions & {
  /**
   * The KV store to use for persisting credentials and challenges.
   *
   * All WebAuthn credentials and one-time challenges are stored in this KV instance.
   * For production, use a persistent store like Kv.cloudflare().
   * For development, Kv.memory() is sufficient.
   *
   * @example
   * ```typescript
   * import { Kv } from '@radiustechsystems/sdk/server';
   * const kv = Kv.memory(); // or Kv.cloudflare(env.RADIUS_KV)
   * ```
   */
  kv: Kv
  /**
   * The path prefix for the key manager endpoints.
   *
   * Defaults to '' (empty string). All endpoints will be registered relative to this path.
   * Example: with path='/api/creds', endpoints become /api/creds/challenge, /api/creds/:id
   */
  path?: string | undefined
  /**
   * The relying party configuration for WebAuthn.
   *
   * This is passed to clients during the WebAuthn challenge request. Can be:
   * - A simple string (used as both id and name)
   * - An object with `id` and optional `name`
   *
   * Should typically be your application's domain or identifier.
   *
   * @example
   * ```typescript
   * // Simple string form:
   * rp: 'example.com'
   *
   * // Object form with explicit name:
   * rp: { id: 'example.com', name: 'My App' }
   * ```
   */
  rp?:
    | string
    | {
        id: string
        name?: string | undefined
      }
    | undefined
}

/**
 * Configuration options for composing multiple handlers.
 *
 * Allows you to combine and mount multiple handler instances under a single base path,
 * creating a unified HTTP service from multiple specialized handlers.
 */
export type ComposeOptions = HandlerOptions & {
  /**
   * The base path prefix to mount all composed handlers under.
   *
   * Defaults to '/' (root). Requests must match this path prefix to be routed to the
   * composed handlers. The path is stripped before routing to individual handlers.
   *
   * @example
   * ```typescript
   * // Mount handlers under /api/radius:
   * const handler = Handler.compose([keyManager, feePayer], {
   *   path: '/api/radius'
   * });
   * // Request to /api/radius/challenge reaches the keyManager handler
   * // Request to /api/radius/other reaches the feePayer handler
   * // Request to /other returns 404
   * ```
   */
  path?: string | undefined
}
