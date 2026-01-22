import { custom, type EIP1193RequestFn, http, type Transport } from 'viem';
import type { Interceptor, Logger, RequestHandler } from './types';

/**
 * A RequestHandler implementation that intercepts HTTP requests and responses.
 * Provides request logging and response modification capabilities.
 */
export class InterceptingRequestHandler implements RequestHandler {
	/**
	 * Creates a new InterceptingRequestHandler.
	 * @param interceptor Optional function to intercept and modify responses
	 * @param logger Optional logging function to record requests and responses
	 * @param proxied Underlying RequestHandler implementation (defaults to fetch-based implementation)
	 */
	constructor(
		private readonly interceptor?: Interceptor,
		private readonly logger?: Logger,
		private readonly proxied: RequestHandler = new DefaultRequestHandler(),
	) {}

	/**
	 * Sends a request and handles interception and logging of the response.
	 * @param request The HTTP request to send
	 * @returns The HTTP response, potentially modified by the interceptor
	 */
	async handle(request: Request): Promise<Response> {
		const reqBody = await this.parseRequestBody(request);

		if (this.logger) {
			this.logger('Request:', {
				url: request.url,
				method: request.method,
				body: reqBody,
			});
		}

		let response: Response;
		try {
			response = await this.proxied.handle(request);
			const body = await response.clone().text();

			if (this.logger) {
				this.logger('Response:', {
					status: response.status,
					body,
				});
			}

			response = new Response(body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		} catch (error) {
			if (this.logger) {
				this.logger('Request failed', {
					error: error instanceof Error ? error.message : String(error),
				});
			}
			throw error;
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
	private async parseRequestBody(request: Request): Promise<string> {
		if (!request.body) {
			return '';
		}

		try {
			const clone = request.clone();
			return await clone.text();
		} catch (error) {
			throw new Error(`Failed to parse request body: ${error}`);
		}
	}
}

/**
 * A simple implementation of RequestHandler that uses the Fetch API with timeout.
 * @private
 */
class DefaultRequestHandler implements RequestHandler {
	constructor(private readonly timeout: number = 10000) {}

	async handle(request: Request): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(request, { signal: controller.signal });
			return response;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}

/**
 * Options for creating an intercepting transport.
 */
export interface InterceptingTransportOptions {
	/** The RPC URL to connect to */
	url: string;
	/** Optional function to intercept and modify responses */
	interceptor?: Interceptor;
	/** Optional logging function */
	logger?: Logger;
	/** Request timeout in milliseconds. Default: 10000 (10 seconds) */
	timeout?: number;
	/** Number of retry attempts. Default: 3 */
	retryCount?: number;
	/** Base delay between retries in milliseconds. Default: 150 */
	retryDelay?: number;
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

export function createInterceptingTransport(options: InterceptingTransportOptions): Transport {
	const { url, interceptor, logger, timeout = 10000, retryCount = 3, retryDelay = 150 } = options;

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
	const defaultHandler = new DefaultRequestHandler(timeout);
	const requestHandler = new InterceptingRequestHandler(interceptor, logger, defaultHandler);

	const request: EIP1193RequestFn = async ({ method, params }) => {
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
		let lastError: Error | undefined;
		for (let attempt = 0; attempt <= retryCount; attempt++) {
			try {
				const response = await requestHandler.handle(httpRequest.clone());
				const result = await response.json();

				if (result.error) {
					throw new Error(result.error.message || 'RPC Error');
				}

				return result.result;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
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
