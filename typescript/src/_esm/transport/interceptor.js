import { custom, http } from 'viem';
/**
 * A RoundTripper implementation that intercepts HTTP requests and responses.
 * Provides request logging and response modification capabilities.
 */
export class InterceptingRoundTripper {
    interceptor;
    logf;
    proxied;
    /**
     * Creates a new InterceptingRoundTripper.
     * @param interceptor Optional function to intercept and modify responses
     * @param logf Optional logging function to record requests and responses
     * @param proxied Underlying RoundTripper implementation (defaults to fetch-based implementation)
     */
    constructor(interceptor, logf, proxied = new DefaultRoundTripper()) {
        this.interceptor = interceptor;
        this.logf = logf;
        this.proxied = proxied;
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
        }
        catch (err) {
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
        }
        catch (err) {
            throw new Error(`Failed to parse request body: ${err}`);
        }
    }
}
/**
 * A simple implementation of RoundTripper that uses the Fetch API with timeout.
 * @private
 */
class DefaultRoundTripper {
    timeout;
    constructor(timeout = 10000) {
        this.timeout = timeout;
    }
    async roundTrip(request) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(request, { signal: controller.signal });
            return response;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
}
/**
 * Creates a viem-compatible transport that supports request interception and logging.
 *
 * When only logging is needed (no interceptor), this uses viem's native http() transport
 * with `onFetchRequest`/`onFetchResponse` callbacks, which provides:
 * - Built-in retry logic with exponential backoff
 * - Timeout enforcement
 * - Request batching support
 *
 * When response interception is needed, a custom transport is used with:
 * - Timeout support via AbortController
 * - Basic retry logic
 *
 * @param options Configuration options for the transport
 * @returns A viem Transport that can be used with createPublicClient
 *
 * @example
 * ```typescript
 * // Logging only - uses viem's http() for best performance
 * const transport = createInterceptingTransport({
 *   url: 'https://rpc.testnet.radiustech.xyz',
 *   logger: console.log,
 * });
 *
 * // With response interception
 * const transport = createInterceptingTransport({
 *   url: 'https://rpc.testnet.radiustech.xyz',
 *   interceptor: async (reqBody, response) => {
 *     // Modify response if needed
 *     return response;
 *   },
 * });
 *
 * const client = createPublicClient({
 *   chain: radiusTestnet,
 *   transport,
 * });
 * ```
 */
/** Counter for generating unique request IDs */
let requestIdCounter = 0;
export function createInterceptingTransport(options) {
    const { url, interceptor, logger, timeout = 10000, retryCount = 3, retryDelay = 150, } = options;
    // If no interceptor, use viem's native http() transport with callbacks
    // This provides retry logic, timeout, and better performance
    if (!interceptor) {
        return http(url, {
            timeout,
            retryCount,
            retryDelay,
            onFetchRequest: logger
                ? (request) => {
                    logger('Request:', {
                        url: request.url,
                        method: request.method,
                    });
                }
                : undefined,
            onFetchResponse: logger
                ? (response) => {
                    logger('Response:', {
                        status: response.status,
                    });
                }
                : undefined,
        });
    }
    // With interceptor, use custom transport that supports response modification
    const defaultRoundTripper = new DefaultRoundTripper(timeout);
    const roundTripper = new InterceptingRoundTripper(interceptor, logger, defaultRoundTripper);
    const request = async ({ method, params }) => {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            id: ++requestIdCounter,
            method,
            params,
        });
        const httpRequest = new Request(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body,
        });
        // Simple retry logic
        let lastError;
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                const response = await roundTripper.roundTrip(httpRequest.clone());
                const result = await response.json();
                if (result.error) {
                    throw new Error(result.error.message || 'RPC Error');
                }
                return result.result;
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                if (attempt < retryCount) {
                    // Wait before retrying with exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, retryDelay * 2 ** attempt));
                }
            }
        }
        throw lastError;
    };
    return custom({ request });
}
//# sourceMappingURL=interceptor.js.map