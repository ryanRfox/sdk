import { custom, type EIP1193RequestFn, type Transport } from 'viem'
import type { Interceptor, Logf, RoundTripper } from './types'

/**
 * A RoundTripper implementation that intercepts HTTP requests and responses.
 * Provides request logging and response modification capabilities.
 */
export class InterceptingRoundTripper implements RoundTripper {
  /**
   * Creates a new InterceptingRoundTripper.
   * @param interceptor Optional function to intercept and modify responses
   * @param logf Optional logging function to record requests and responses
   * @param proxied Underlying RoundTripper implementation (defaults to fetch-based implementation)
   */
  constructor(
    private readonly interceptor?: Interceptor,
    private readonly logf?: Logf,
    private readonly proxied: RoundTripper = new DefaultRoundTripper(),
  ) {}

  /**
   * Sends a request and handles interception and logging of the response.
   * @param request The HTTP request to send
   * @returns The HTTP response, potentially modified by the interceptor
   */
  async roundTrip(request: Request): Promise<Response> {
    const reqBody = await this.parseRequestBody(request)

    if (this.logf) {
      this.logf('Request:', {
        url: request.url,
        method: request.method,
        body: reqBody,
      })
    }

    let response: Response
    try {
      response = await this.proxied.roundTrip(request)
      const body = await response.clone().text()

      if (this.logf) {
        this.logf('Response:', {
          status: response.status,
          body,
        })
      }

      response = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    } catch (err) {
      if (this.logf) {
        this.logf('Request failed', {
          error: err instanceof Error ? err.message : String(err),
        })
      }
      throw err
    }

    if (this.interceptor) {
      return this.interceptor(reqBody, response)
    }

    return response
  }

  /**
   * Parse the body of a request, cloning the request to avoid modifying the original.
   * @private
   */
  private async parseRequestBody(request: Request): Promise<string> {
    if (!request.body) {
      return ''
    }

    try {
      const clone = request.clone()
      return await clone.text()
    } catch (err) {
      throw new Error(`Failed to parse request body: ${err}`)
    }
  }
}

/**
 * A simple implementation of RoundTripper that uses the Fetch API.
 * @private
 */
class DefaultRoundTripper implements RoundTripper {
  async roundTrip(request: Request): Promise<Response> {
    return fetch(request)
  }
}

/**
 * Options for creating an intercepting transport.
 */
export interface InterceptingTransportOptions {
  /** The RPC URL to connect to */
  url: string
  /** Optional function to intercept and modify responses */
  interceptor?: Interceptor
  /** Optional logging function */
  logger?: Logf
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
export function createInterceptingTransport(
  options: InterceptingTransportOptions,
): Transport {
  const roundTripper = new InterceptingRoundTripper(
    options.interceptor,
    options.logger,
  )

  const request: EIP1193RequestFn = async ({ method, params }) => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    })

    const httpRequest = new Request(options.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body,
    })

    const response = await roundTripper.roundTrip(httpRequest)
    const result = await response.json()

    if (result.error) {
      throw new Error(result.error.message || 'RPC Error')
    }

    return result.result
  }

  return custom({ request })
}
