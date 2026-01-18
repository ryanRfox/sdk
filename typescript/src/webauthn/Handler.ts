import {
  createRouter,
  type Middleware,
  type Router,
} from '@remix-run/fetch-router';
import type { Hex } from 'viem';
import type { Handler, HandlerOptions, KeyManagerOptions, ComposeOptions } from './types.js';
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
export function from(options: HandlerOptions = {}): Handler {
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
function normalizeHeaders(headers?: Headers | Record<string, string>): Headers {
  if (!headers) return new Headers();
  if (headers instanceof Headers) return headers;
  return new Headers(headers);
}

/** @internal */
function headers(headers?: Headers | Record<string, string>): Middleware {
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
function preflight(headers?: Headers | Record<string, string>): Middleware {
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
/** Default challenge TTL: 5 minutes */
const DEFAULT_CHALLENGE_TTL = 5 * 60 * 1000;

export function keyManager(options: KeyManagerOptions): Handler {
  const { kv, path = '', rp, challengeTTL = DEFAULT_CHALLENGE_TTL } = options;

  const rpConfig = (() => {
    if (typeof rp === 'string') return { id: rp, name: rp };
    if (rp) return { id: rp.id, name: rp.name ?? rp.id };
    return undefined;
  })();

  const router = from(options);

  // GET /challenge - Generate WebAuthn challenge
  router.get(`${path}/challenge`, async () => {
    const challenge = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}` as Hex;

    // Store challenge with expiration timestamp
    const expiresAt = challengeTTL > 0 ? Date.now() + challengeTTL : 0;
    await kv.set(`challenge:${challenge}`, JSON.stringify({ expiresAt }));

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
      return Response.json(
        { error: 'Invalid credential ID format' },
        { status: 400 }
      );
    }

    const publicKey = await kv.get<Hex>(`credential:${id}`);

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
      return Response.json(
        { error: 'Invalid credential ID format' },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    let body: unknown;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { credential, publicKey } = body as {
      credential?: {
        response?: {
          clientDataJSON?: string;
          authenticatorData?: string;
        };
      };
      publicKey?: Hex;
    };

    if (!credential) {
      return Response.json({ error: 'Missing credential' }, { status: 400 });
    }
    if (!publicKey) {
      return Response.json({ error: 'Missing publicKey' }, { status: 400 });
    }

    // Validate credential.response structure
    if (!credential.response?.clientDataJSON) {
      return Response.json({ error: 'Missing clientDataJSON' }, { status: 400 });
    }
    if (!credential.response?.authenticatorData) {
      return Response.json({ error: 'Missing authenticatorData' }, { status: 400 });
    }

    // 1. Decode and parse clientDataJSON (Base64URL encoded)
    let clientDataJSON: {
      challenge?: string;
      type?: string;
      origin?: string;
    };
    try {
      const decoded = base64UrlDecode(credential.response.clientDataJSON);
      clientDataJSON = JSON.parse(decoded);
    } catch (e) {
      return Response.json({ error: 'Invalid clientDataJSON' }, { status: 400 });
    }

    // 2. Verify challenge exists in KV and is not expired
    if (!clientDataJSON.challenge) {
      return Response.json({ error: 'Missing challenge in clientDataJSON' }, { status: 400 });
    }
    const challengeHex = base64UrlToHex(clientDataJSON.challenge);
    const challengeData = await kv.get<string>(`challenge:${challengeHex}`);
    if (!challengeData) {
      return Response.json({ error: 'Invalid or expired challenge' }, { status: 400 });
    }

    // Check if challenge has expired
    try {
      const { expiresAt } = JSON.parse(challengeData) as { expiresAt: number };
      if (expiresAt > 0 && Date.now() > expiresAt) {
        // Delete expired challenge and return error
        await kv.delete(`challenge:${challengeHex}`);
        return Response.json({ error: 'Challenge expired' }, { status: 400 });
      }
    } catch {
      // If we can't parse the challenge data, treat as legacy format (no expiration)
    }

    // 3. Verify type is 'webauthn.create'
    if (clientDataJSON.type !== 'webauthn.create') {
      return Response.json({ error: 'Invalid clientDataJSON type' }, { status: 400 });
    }

    // 4. Verify origin (if rp is configured and not localhost)
    if (rpConfig?.id && !rpConfig.id.includes('localhost')) {
      const expectedOrigin = `https://${rpConfig.id}`;
      if (clientDataJSON.origin !== expectedOrigin) {
        return Response.json({ error: 'Invalid origin' }, { status: 400 });
      }
    }

    // 5. Parse authenticatorData and check User Present flag
    let authenticatorData: Uint8Array;
    try {
      authenticatorData = base64UrlToBytes(credential.response.authenticatorData);
    } catch (e) {
      return Response.json({ error: 'Invalid authenticatorData' }, { status: 400 });
    }

    // Flags are at byte 32 (after 32-byte rpIdHash)
    const flags = authenticatorData[32];
    if (flags === undefined) {
      return Response.json({ error: 'Invalid authenticatorData structure' }, { status: 400 });
    }

    // Check User Present (UP) flag - bit 0
    const userPresent = (flags & 0x01) !== 0;
    if (!userPresent) {
      return Response.json({ error: 'User not present' }, { status: 400 });
    }

    // 6. CRITICAL: Consume the challenge (delete it to prevent replay attacks)
    await kv.delete(`challenge:${challengeHex}`);

    // 7. Store the public key
    await kv.set(`credential:${id}`, publicKey);

    return new Response(null, { status: 204 });
  });

  return router;
}

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
export function compose(handlers: Handler[], options: ComposeOptions = {}): Handler {
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

/**
 * Decodes a Base64URL encoded string to a UTF-8 string.
 * WebAuthn uses Base64URL encoding (RFC 4648 §5).
 * @internal
 */
function base64UrlDecode(base64url: string): string {
  // Convert Base64URL to standard Base64
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding if needed
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

  // Decode using atob and handle UTF-8
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Converts a Base64URL encoded string to a hex string with 0x prefix.
 * @internal
 */
function base64UrlToHex(base64url: string): `0x${string}` {
  const bytes = base64UrlToBytes(base64url);
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

/**
 * Decodes a Base64URL encoded string to a Uint8Array.
 * @internal
 */
function base64UrlToBytes(base64url: string): Uint8Array {
  // Convert Base64URL to standard Base64
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding if needed
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

  // Decode
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
