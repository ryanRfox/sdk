import { createRouter, } from '@remix-run/fetch-router';
import { createClient } from 'viem';
import * as RequestListener from './internal/requestListener.js';
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
export function from(options = {}) {
    const router = createRouter({
        ...options,
        middleware: [headers(options.headers), preflight(options.headers)],
    });
    return {
        ...router,
        listener: RequestListener.fromFetchHandler((request) => {
            return router.fetch(request);
        }),
    };
}
/** @internal */
function normalizeHeaders(headers) {
    if (!headers)
        return new Headers();
    if (headers instanceof Headers)
        return headers;
    return new Headers(headers);
}
/** @internal */
function headers(headers) {
    const normalizedHeaders = normalizeHeaders(headers);
    return async (_, next) => {
        const response = await next();
        const responseHeaders = new Headers(response.headers);
        normalizedHeaders.forEach((value, key) => {
            responseHeaders.set(key, value);
        });
        return new Response(response.body, {
            headers: responseHeaders,
            status: response.status,
            statusText: response.statusText,
        });
    };
}
/** @internal */
function preflight(headers) {
    const normalizedHeaders = normalizeHeaders(headers);
    return async (context) => {
        if (context.request.method === 'OPTIONS') {
            return new Response(null, { headers: normalizedHeaders });
        }
    };
}
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
export function keyManager(options) {
    const { kv, path = '', rp } = options;
    const rpConfig = (() => {
        if (typeof rp === 'string')
            return { id: rp, name: rp };
        if (rp)
            return { id: rp.id, name: rp.name ?? rp.id };
        return undefined;
    })();
    const router = from(options);
    // GET /challenge - Generate WebAuthn challenge
    router.get(`${path}/challenge`, async () => {
        const challenge = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')}`;
        await kv.set(`challenge:${challenge}`, '1');
        return Response.json({
            challenge,
            ...(rpConfig ? { rp: rpConfig } : {}),
        });
    });
    // GET /:id - Get public key for credential
    router.get(`${path}/:id`, async ({ params }) => {
        const { id } = params;
        // Validate credential ID (alphanumeric, reasonable length, no path traversal)
        if (!id || !/^[a-zA-Z0-9_-]{1,255}$/.test(id)) {
            return Response.json({ error: 'Invalid credential ID format' }, { status: 400 });
        }
        const publicKey = await kv.get(`credential:${id}`);
        if (!publicKey) {
            return Response.json({ error: 'Credential not found' }, { status: 404 });
        }
        return Response.json({ publicKey });
    });
    // POST /:id - Store public key for credential
    router.post(`${path}/:id`, async ({ params, request }) => {
        const { id } = params;
        // Validate credential ID (alphanumeric, reasonable length, no path traversal)
        if (!id || !/^[a-zA-Z0-9_-]{1,255}$/.test(id)) {
            return Response.json({ error: 'Invalid credential ID format' }, { status: 400 });
        }
        // Handle JSON parsing errors
        let body;
        try {
            body = await request.json();
        }
        catch (e) {
            return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }
        const { credential, publicKey } = body;
        if (!credential) {
            return Response.json({ error: 'Missing credential' }, { status: 400 });
        }
        if (!publicKey) {
            return Response.json({ error: 'Missing publicKey' }, { status: 400 });
        }
        // Store the public key
        await kv.set(`credential:${id}`, publicKey);
        return new Response(null, { status: 204 });
    });
    return router;
}
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
export function feePayer(options) {
    const { account, onRequest, path = '/' } = options;
    const client = (() => {
        if ('client' in options)
            return options.client;
        if ('chain' in options && 'transport' in options) {
            return createClient({
                chain: options.chain,
                transport: options.transport,
            });
        }
        throw new Error('feePayer requires either client or chain+transport');
    })();
    const router = from(options);
    router.post(path, async ({ request: req }) => {
        let body;
        // Handle JSON parsing errors
        try {
            body = await req.json();
        }
        catch (e) {
            return Response.json({
                jsonrpc: '2.0',
                id: null,
                error: { code: -32700, message: 'Parse error: Invalid JSON' },
            });
        }
        try {
            // Validate JSON-RPC request structure
            if (typeof body.method !== 'string') {
                return Response.json({
                    jsonrpc: '2.0',
                    id: body.id ?? null,
                    error: { code: -32600, message: 'Invalid Request: missing method' },
                });
            }
            await onRequest?.(body);
            if (body.method === 'eth_sendRawTransaction') {
                // Validate params is a non-empty array with a valid hex string
                if (!Array.isArray(body.params) || body.params.length === 0) {
                    return Response.json({
                        jsonrpc: '2.0',
                        id: body.id,
                        error: { code: -32602, message: 'Invalid params: expected array with transaction data' },
                    });
                }
                const serializedTx = body.params[0];
                if (typeof serializedTx !== 'string' || !serializedTx.startsWith('0x')) {
                    return Response.json({
                        jsonrpc: '2.0',
                        id: body.id,
                        error: { code: -32602, message: 'Invalid params: transaction must be a hex string' },
                    });
                }
                // Sign as fee payer and submit
                const result = await client.request({
                    method: 'eth_sendRawTransaction',
                    params: [serializedTx],
                });
                return Response.json({
                    jsonrpc: '2.0',
                    id: body.id,
                    result,
                });
            }
            return Response.json({
                jsonrpc: '2.0',
                id: body.id,
                error: { code: -32601, message: `Method not supported: ${body.method}` },
            });
        }
        catch (error) {
            // Log full error server-side, return generic message to client
            console.error('feePayer handler error:', error);
            return Response.json({
                jsonrpc: '2.0',
                id: body?.id ?? null,
                error: { code: -32603, message: 'Internal error: transaction processing failed' },
            });
        }
    });
    return router;
}
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
export function compose(handlers, options = {}) {
    const path = options.path ?? '/';
    return from({
        ...options,
        async defaultHandler(context) {
            const url = new URL(context.request.url);
            if (!url.pathname.startsWith(path)) {
                return new Response('Not Found', { status: 404 });
            }
            url.pathname = url.pathname.replace(path, '') || '/';
            for (const handler of handlers) {
                const request = new Request(url, context.request.clone());
                const response = await handler.fetch(request);
                if (response.status !== 404) {
                    return response;
                }
            }
            return new Response('Not Found', { status: 404 });
        },
    });
}
//# sourceMappingURL=Handler.js.map