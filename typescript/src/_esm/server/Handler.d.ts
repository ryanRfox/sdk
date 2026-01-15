import type { Handler, HandlerOptions, KeyManagerOptions, FeePayerOptions, ComposeOptions } from './types.js';
/**
 * Creates a base request handler with routing and request handling capabilities.
 *
 * This is the foundation for all handler types. It provides:
 * - HTTP routing via an internal router
 * - Support for middleware (headers, CORS preflight)
 * - Both fetch-based and listener-based request handling
 * - Custom header configuration
 *
 * For most use cases, use the specialized handlers like `feePayer()` or `keyManager()`
 * instead of calling this directly.
 *
 * @param options - Configuration options for the base handler
 * @param options.headers - Optional headers to add to all responses
 * @returns A Handler instance with fetch() and listener() methods
 *
 * @example
 * ```typescript
 * import { Handler } from '@radiustechsystems/sdk/server';
 *
 * const handler = Handler.from({
 *   headers: { 'X-Custom-Header': 'value' }
 * });
 *
 * handler.get('/api/test', () => Response.json({ ok: true }));
 * ```
 */
export declare function from(options?: HandlerOptions): Handler;
/**
 * Creates a key manager handler for WebAuthn credential storage and management.
 *
 * This handler manages WebAuthn credentials through a key-value store, providing:
 * - Challenge generation for WebAuthn authentication flows
 * - Storage and retrieval of public keys for registered credentials
 * - Support for relying party configuration
 *
 * Endpoints:
 * - `GET {path}/challenge` - Generate a new WebAuthn challenge
 * - `GET {path}/:id` - Retrieve public key for a credential
 * - `POST {path}/:id` - Store a new credential's public key
 *
 * @param options - Configuration options for the key manager handler
 * @param options.kv - A KV store instance (e.g., from Kv.memory() or Kv.cloudflare())
 * @param options.path - The path prefix for the key manager endpoints (default: '')
 * @param options.rp - Relying party config: either a string ID or {id, name} object
 * @param options.headers - Optional headers to add to all responses
 * @returns A Handler instance for the key manager service
 *
 * @example
 * ```typescript
 * import { Handler, Kv } from '@radiustechsystems/sdk/server';
 *
 * const handler = Handler.keyManager({
 *   kv: Kv.memory(),
 *   path: '/api/credentials',
 *   rp: { id: 'example.com', name: 'Example App' },
 * });
 * ```
 */
export declare function keyManager(options: KeyManagerOptions): Handler;
/**
 * Creates a fee payer handler that sponsors transaction fees.
 *
 * This handler accepts raw transactions via JSON-RPC and submits them on behalf of
 * the application, allowing fee sponsorship for user transactions. The account is used
 * as the fee payer for all transactions processed through this handler.
 *
 * @param options - Configuration options for the fee payer handler
 * @param options.account - The viem LocalAccount to use as the fee payer
 * @param options.client - Pre-configured viem Client, OR provide chain and transport
 * @param options.chain - The blockchain chain (used with transport)
 * @param options.transport - The viem transport configuration (used with chain)
 * @param options.path - The path prefix for the fee payer endpoint (default: '/')
 * @param options.onRequest - Optional callback invoked before processing each request
 * @param options.headers - Optional headers to add to all responses
 * @returns A Handler instance for the fee payer service
 * @throws Error if neither client nor (chain + transport) are provided
 *
 * @example
 * ```typescript
 * import { Handler } from '@radiustechsystems/sdk/server';
 * import { createClient, http } from 'viem';
 * import { mainnet } from 'viem/chains';
 * import { privateKeyToAccount } from 'viem/accounts';
 *
 * const handler = Handler.feePayer({
 *   account: privateKeyToAccount('0x...'),
 *   client: createClient({ chain: mainnet, transport: http() }),
 *   path: '/api/feepayer',
 * });
 * ```
 */
export declare function feePayer(options: FeePayerOptions): Handler;
/**
 * Composes multiple handlers into a single unified handler.
 *
 * This function allows you to combine multiple specialized handlers (feePayer, keyManager, etc.)
 * into a single handler. Requests are routed to each handler in order until one returns a
 * non-404 response. This enables building complex server setups with multiple services.
 *
 * Handlers are tried in the order provided. The first handler that returns a response
 * with a status other than 404 is used. If all handlers return 404, the composed handler
 * also returns 404.
 *
 * @param handlers - Array of Handler instances to compose
 * @param options - Configuration options for the composed handler
 * @param options.path - The base path prefix for all composed handlers (default: '/')
 * @param options.headers - Optional headers to add to all responses
 * @returns A single Handler instance that routes to the provided handlers
 *
 * @example
 * ```typescript
 * import { Handler, Kv } from '@radiustechsystems/sdk/server';
 * import { createClient } from 'viem';
 *
 * const keyManager = Handler.keyManager({ kv: Kv.memory() });
 * const feePayer = Handler.feePayer({ account, client });
 *
 * const handler = Handler.compose([keyManager, feePayer], {
 *   path: '/api/radius',
 *   headers: { 'X-API-Version': '1.0' }
 * });
 *
 * // In Express.js:
 * app.use(handler.listener);
 * ```
 */
export declare function compose(handlers: Handler[], options?: ComposeOptions): Handler;
//# sourceMappingURL=Handler.d.ts.map