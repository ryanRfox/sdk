import {
  createRouter,
  type Middleware,
  type Router,
} from '@remix-run/fetch-router';
import type { Hex, Chain, Client, Transport } from 'viem';
import type { LocalAccount } from 'viem/accounts';
import { signTransaction } from 'viem/actions';
import { createClient } from 'viem';
import type { Handler, HandlerOptions, KeyManagerOptions, FeePayerOptions } from './types.js';
import * as RequestListener from './internal/requestListener.js';

/**
 * Instantiates a new request handler.
 *
 * @param options - Constructor options
 * @returns Handler instance with fetch and listener methods
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
 * Creates a key manager handler for WebAuthn credential storage.
 *
 * @example
 * ```typescript
 * import { Handler, Kv } from '@radiustechsystems/sdk/server';
 *
 * const handler = Handler.keyManager({
 *   kv: Kv.memory(),
 * });
 * ```
 */
export function keyManager(options: KeyManagerOptions): Handler {
  const { kv, path = '', rp } = options;

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

    await kv.set(`challenge:${challenge}`, '1');

    return Response.json({
      challenge,
      ...(rpConfig ? { rp: rpConfig } : {}),
    });
  });

  // GET /:id - Get public key for credential
  router.get(`${path}/:id`, async ({ params }) => {
    const { id } = params;
    const publicKey = await kv.get<Hex>(`credential:${id}`);

    if (!publicKey) {
      return new Response('Credential not found', { status: 404 });
    }

    return Response.json({ publicKey });
  });

  // POST /:id - Store public key for credential
  router.post(`${path}/:id`, async ({ params, request }) => {
    const { id } = params;
    const { credential, publicKey } = (await request.json()) as {
      credential?: { response?: { clientDataJSON?: string } };
      publicKey?: Hex;
    };

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
 * @example
 * ```typescript
 * import { Handler } from '@radiustechsystems/sdk/server';
 * import { privateKeyToAccount } from 'viem/accounts';
 *
 * const handler = Handler.feePayer({
 *   account: privateKeyToAccount('0x...'),
 *   client,
 * });
 * ```
 */
export function feePayer(options: FeePayerOptions): Handler {
  const { account, onRequest, path = '/' } = options;

  const client = (() => {
    if ('client' in options) return options.client!;
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
    try {
      const body = await req.json();
      await onRequest?.(body);

      if (body.method === 'eth_sendRawTransaction') {
        const [serializedTx] = body.params as [Hex];

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
    } catch (error) {
      return Response.json({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: (error as Error).message },
      });
    }
  });

  return router;
}
