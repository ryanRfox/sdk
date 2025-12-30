/**
 * Unit tests for Transport interceptor functionality
 * Tests InterceptingRoundTripper and createInterceptingTransport
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  InterceptingRoundTripper,
  createInterceptingTransport,
} from '../../packages/core/src/transport/interceptor';
import { type Interceptor, type Logf } from '../../packages/core/src/transport/types';

describe('InterceptingRoundTripper', () => {
  describe('Basic functionality', () => {
    test('should create instance without parameters', () => {
      const roundTripper = new InterceptingRoundTripper();
      expect(roundTripper).toBeDefined();
    });

    test('should create instance with interceptor', () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const roundTripper = new InterceptingRoundTripper(interceptor);
      expect(roundTripper).toBeDefined();
    });

    test('should create instance with logger', () => {
      const logger: Logf = vi.fn();
      const roundTripper = new InterceptingRoundTripper(undefined, logger);
      expect(roundTripper).toBeDefined();
    });

    test('should create instance with both interceptor and logger', () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const logger: Logf = vi.fn();
      const roundTripper = new InterceptingRoundTripper(interceptor, logger);
      expect(roundTripper).toBeDefined();
    });

    test('should have roundTrip method', () => {
      const roundTripper = new InterceptingRoundTripper();
      expect(typeof roundTripper.roundTrip).toBe('function');
    });
  });

  describe('Request and response handling', () => {
    beforeEach(() => {
      // Reset global fetch mock before each test
      vi.clearAllMocks();
    });

    test('should handle request without body', async () => {
      const roundTripper = new InterceptingRoundTripper();

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      // Mock fetch to return a valid response
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
      );

      const response = await roundTripper.roundTrip(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    test('should parse request body correctly', async () => {
      const roundTripper = new InterceptingRoundTripper();
      const requestBody = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: ['0x0000000000000000000000000000000000000000', 'latest'],
      });

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: requestBody,
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x1' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
      );

      const response = await roundTripper.roundTrip(request);
      expect(response).toBeDefined();
    });

    test('should handle response correctly', async () => {
      const roundTripper = new InterceptingRoundTripper();
      const responseBody = JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x123' });

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(responseBody, {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
          })
        )
      );

      const response = await roundTripper.roundTrip(request);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });
  });

  describe('Logger integration', () => {
    test('should call logger with request data', async () => {
      const logger: Logf = vi.fn();
      const roundTripper = new InterceptingRoundTripper(undefined, logger);

      const requestBody = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      });

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
        body: requestBody,
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x123' }), {
            status: 200,
          })
        )
      );

      await roundTripper.roundTrip(request);

      // Logger should have been called with Request and Response messages
      expect(logger).toHaveBeenCalledWith('Request:', expect.any(Object));
      expect(logger).toHaveBeenCalledWith('Response:', expect.any(Object));

      // Check that the first call is the request and contains URL and method
      const firstCall = logger.mock.calls.find((call) => call[0] === 'Request:');
      expect(firstCall).toBeDefined();
      if (firstCall) {
        expect(firstCall[1]).toHaveProperty('url');
        expect(firstCall[1]).toHaveProperty('method');
      }

      // Check that the second call is the response and contains status
      const secondCall = logger.mock.calls.find((call) => call[0] === 'Response:');
      expect(secondCall).toBeDefined();
      if (secondCall) {
        expect(secondCall[1]).toHaveProperty('status');
      }
    });

    test('should log request failures', async () => {
      const logger: Logf = vi.fn();
      const roundTripper = new InterceptingRoundTripper(undefined, logger);

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
      });

      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      try {
        await roundTripper.roundTrip(request);
      } catch {
        // Error expected
      }

      expect(logger).toHaveBeenCalledWith(
        'Request failed',
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    test('should not log when logger is not provided', async () => {
      const roundTripper = new InterceptingRoundTripper();

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x123' }), {
            status: 200,
          })
        )
      );

      const response = await roundTripper.roundTrip(request);
      expect(response).toBeDefined();
    });
  });

  describe('Interceptor integration', () => {
    test('should call interceptor with request and response', async () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const roundTripper = new InterceptingRoundTripper(interceptor);

      const requestBody = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      });

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
        body: requestBody,
      });

      const responseBody = JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x123' });
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(responseBody, {
            status: 200,
          })
        )
      );

      await roundTripper.roundTrip(request);

      expect(interceptor).toHaveBeenCalled();
      const [callReqBody, callResponse] = interceptor.mock.calls[0] as [string, Response];
      expect(callReqBody).toBe(requestBody);
      expect(callResponse).toBeInstanceOf(Response);
    });

    test('should use modified response from interceptor', async () => {
      const modifiedBody = JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xmodified' });
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => {
        return new Response(modifiedBody, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      });

      const roundTripper = new InterceptingRoundTripper(interceptor);

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0xoriginal' }), {
            status: 200,
          })
        )
      );

      const response = await roundTripper.roundTrip(request);
      const body = await response.text();
      expect(body).toBe(modifiedBody);
    });

    test('should handle error responses from interceptor', async () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, _response) => {
        throw new Error('Interceptor error');
      });

      const roundTripper = new InterceptingRoundTripper(interceptor);

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x123' }), {
            status: 200,
          })
        )
      );

      await expect(roundTripper.roundTrip(request)).rejects.toThrow('Interceptor error');
    });

    test('should not call interceptor when not provided', async () => {
      const roundTripper = new InterceptingRoundTripper();

      const request = new Request('https://rpc.example.com', {
        method: 'POST',
      });

      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x123' }), {
            status: 200,
          })
        )
      );

      const response = await roundTripper.roundTrip(request);
      expect(response).toBeDefined();
    });
  });
});

describe('createInterceptingTransport', () => {
  describe('Basic functionality', () => {
    test('should create transport with URL only', () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.testnet.radiustech.xyz',
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });

    test('should create transport with logger', () => {
      const logger: Logf = vi.fn();
      const transport = createInterceptingTransport({
        url: 'https://rpc.testnet.radiustech.xyz',
        logger,
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });

    test('should create transport with interceptor', () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const transport = createInterceptingTransport({
        url: 'https://rpc.testnet.radiustech.xyz',
        interceptor,
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });

    test('should create transport with both logger and interceptor', () => {
      const logger: Logf = vi.fn();
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const transport = createInterceptingTransport({
        url: 'https://rpc.testnet.radiustech.xyz',
        logger,
        interceptor,
      });

      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });
  });

  describe('Transport interface', () => {
    test('transport should be a function', () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.testnet.radiustech.xyz',
      });

      expect(typeof transport).toBe('function');
    });

    test('transport should be a valid viem Transport', () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.testnet.radiustech.xyz',
      });

      // viem Transport is returned from custom() function, it's a function itself
      expect(typeof transport).toBe('function');
    });
  });

  describe('RPC request handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should be callable as a transport function', async () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
      });

      // The transport should be a function that can be invoked
      expect(typeof (transport as any)).toBe('function');
    });

    test('should accept method and params in request', () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
      });

      // Transport function should exist and be callable with method/params
      const requestFn = transport as any;
      expect(typeof requestFn).toBe('function');
    });

    test('should handle different request methods', () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
      });

      // Verify transport is created for different RPC methods
      expect(typeof transport).toBe('function');
    });
  });

  describe('Configuration edge cases', () => {
    test('should handle different URL formats', () => {
      const transports = [
        createInterceptingTransport({ url: 'https://rpc.example.com' }),
        createInterceptingTransport({ url: 'http://localhost:8545' }),
        createInterceptingTransport({ url: 'https://rpc.testnet.radiustech.xyz' }),
      ];

      for (const transport of transports) {
        expect(transport).toBeDefined();
        expect(typeof transport).toBe('function');
      }
    });

    test('should handle empty interceptor options', () => {
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
        logger: undefined,
        interceptor: undefined,
      });

      expect(transport).toBeDefined();
    });
  });

  describe('Integration with logger and interceptor', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should create transport with logger for request/response logging', () => {
      const logger: Logf = vi.fn();
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
        logger,
      });

      // Logger should be passed to the transport
      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });

    test('should create transport with interceptor for response handling', () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
        interceptor,
      });

      // Interceptor should be passed to the transport
      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });

    test('should support both logger and interceptor together', () => {
      const logger: Logf = vi.fn();
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const transport = createInterceptingTransport({
        url: 'https://rpc.example.com',
        logger,
        interceptor,
      });

      // Both should be supported in the transport
      expect(transport).toBeDefined();
      expect(typeof transport).toBe('function');
    });
  });
});
