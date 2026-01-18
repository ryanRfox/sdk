import { type Transport } from 'viem';
import type { Interceptor, Logf, RoundTripper } from './types';
/**
 * A RoundTripper implementation that intercepts HTTP requests and responses.
 * Provides request logging and response modification capabilities.
 */
export declare class InterceptingRoundTripper implements RoundTripper {
    private readonly interceptor?;
    private readonly logf?;
    private readonly proxied;
    /**
     * Creates a new InterceptingRoundTripper.
     * @param interceptor Optional function to intercept and modify responses
     * @param logf Optional logging function to record requests and responses
     * @param proxied Underlying RoundTripper implementation (defaults to fetch-based implementation)
     */
    constructor(interceptor?: Interceptor | undefined, logf?: Logf | undefined, proxied?: RoundTripper);
    /**
     * Sends a request and handles interception and logging of the response.
     * @param request The HTTP request to send
     * @returns The HTTP response, potentially modified by the interceptor
     */
    roundTrip(request: Request): Promise<Response>;
    /**
     * Parse the body of a request, cloning the request to avoid modifying the original.
     * @private
     */
    private parseRequestBody;
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
    logger?: Logf;
    /** Request timeout in milliseconds. Default: 10000 (10 seconds) */
    timeout?: number;
    /** Number of retry attempts. Default: 3 */
    retryCount?: number;
    /** Base delay between retries in milliseconds. Default: 150 */
    retryDelay?: number;
}
export declare function createInterceptingTransport(options: InterceptingTransportOptions): Transport;
//# sourceMappingURL=interceptor.d.ts.map