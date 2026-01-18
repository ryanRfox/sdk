import type { Handler, HandlerOptions, KeyManagerOptions, ComposeOptions } from './types.js';
/**
 * Creates a base request handler with routing and request handling capabilities.
 *
 * This is the foundation for all handler types. It provides:
 * - HTTP routing via an internal router
 * - Support for middleware (headers, CORS preflight)
 * - Both fetch-based and listener-based request handling
 * - Custom header configuration
 *
 * For most use cases, use the specialized handlers like `keyManager()`
 * instead of calling this directly.
 *
 * @param options - Configuration options for the base handler
 * @param options.headers - Optional headers to add to all responses
 * @returns A Handler instance with fetch() and listener() methods
 *
 * @example
 * ```typescript
 * import { Handler } from '@radiustechsystems/sdk/webauthn';
 *
 * const handler = Handler.from({
 *   headers: { 'X-Custom-Header': 'value' }
 * });
 *
 * handler.get('/api/test', () => Response.json({ ok: true }));
 * ```
 */
export declare function from(options?: HandlerOptions): Handler;
export declare function keyManager(options: KeyManagerOptions): Handler;
/**
 * Composes multiple handlers into a single unified handler.
 *
 * This function allows you to combine multiple specialized handlers (keyManager, custom handlers, etc.)
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
 *
 * const keyManager = Handler.keyManager({ kv: Kv.memory() });
 * const customHandler = Handler.from();
 * customHandler.get('/health', () => Response.json({ status: 'ok' }));
 *
 * const handler = Handler.compose([keyManager, customHandler], {
 *   path: '/api',
 *   headers: { 'X-API-Version': '1.0' }
 * });
 *
 * // In Express.js:
 * app.use(handler.listener);
 * ```
 */
export declare function compose(handlers: Handler[], options?: ComposeOptions): Handler;
//# sourceMappingURL=Handler.d.ts.map