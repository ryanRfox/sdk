Object.defineProperty(exports, '__esModule', { value: true });
exports.InterceptingRoundTripper = void 0;
exports.createInterceptingTransport = createInterceptingTransport;
const viem_1 = require('viem');
class InterceptingRoundTripper {
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
exports.InterceptingRoundTripper = InterceptingRoundTripper;
class DefaultRoundTripper {
  async roundTrip(request) {
    return fetch(request);
  }
}
function createInterceptingTransport(options) {
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
  return (0, viem_1.custom)({ request });
}
//# sourceMappingURL=interceptor.js.map
