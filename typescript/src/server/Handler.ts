import {
  createRouter,
  type Middleware,
  type Router,
} from '@remix-run/fetch-router';
import type { Handler, HandlerOptions } from './types.js';
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
