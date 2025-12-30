import { custom } from 'viem';
/**
 * A RoundTripper implementation that intercepts HTTP requests and responses.
 * Provides request logging and response modification capabilities.
 */
export class InterceptingRoundTripper {
  /**
   * Creates a new InterceptingRoundTripper.
   * @param interceptor Optional function to intercept and modify responses
   * @param logf Optional logging function to record requests and responses
   * @param proxied Underlying RoundTripper implementation (defaults to fetch-based implementation)
   */
  constructor(interceptor, logf, proxied = new DefaultRoundTripper()) {
    Object.defineProperty(this, 'interceptor', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: interceptor,
    });
    Object.defineProperty(this, 'logf', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: logf,
    });
    Object.defineProperty(this, 'proxied', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: proxied,
    });
  }
  /**
   * Sends a request and handles interception and logging of the response.
   * @param request The HTTP request to send
   * @returns The HTTP response, potentially modified by the interceptor
   */
  async roundTrip(request) {
    const reqBody = await this.parseRequestBody(request);
    if (this.logf) {
      this.logf('Request:', {
        url: request.url,
        method: request.method,
        body: reqBody,
      });
    }
    let response;
    try {
      response = await this.proxied.roundTrip(request);
      const body = await response.clone().text();
      if (this.logf) {
        this.logf('Response:', {
          status: response.status,
          body,
        });
      }
      response = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (err) {
      if (this.logf) {
        this.logf('Request failed', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
      throw err;
    }
    if (this.interceptor) {
      return this.interceptor(reqBody, response);
    }
    return response;
  }
  /**
   * Parse the body of a request, cloning the request to avoid modifying the original.
   * @private
   */
  async parseRequestBody(request) {
    if (!request.body) {
      return '';
    }
    try {
      const clone = request.clone();
      return await clone.text();
    } catch (err) {
      throw new Error(`Failed to parse request body: ${err}`);
    }
  }
}
/**
 * A simple implementation of RoundTripper that uses the Fetch API.
 * @private
 */
class DefaultRoundTripper {
  async roundTrip(request) {
    return fetch(request);
  }
}
/**
 * Creates a viem-compatible transport that supports request interception and logging.
 *
 * @param options Configuration options for the transport
 * @returns A viem Transport that can be used with createPublicClient
 *
 * @example
 * ```typescript
 * const transport = createInterceptingTransport({
 *   url: 'https://rpc.testnet.radiustech.xyz',
 *   logger: console.log,
 * });
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport,
 * });
 * ```
 */
export function createInterceptingTransport(options) {
  const roundTripper = new InterceptingRoundTripper(options.interceptor, options.logger);
  const request = async ({ method, params }) => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    });
    const httpRequest = new Request(options.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body,
    });
    const response = await roundTripper.roundTrip(httpRequest);
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message || 'RPC Error');
    }
    return result.result;
  };
  return custom({ request });
}
//# sourceMappingURL=interceptor.js.map
