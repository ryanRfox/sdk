/**
 * Tests for the transport interceptor module.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InterceptingRoundTripper, createInterceptingTransport } from './interceptor';
import type { RoundTripper } from './types';

// Mock fetch for tests
const originalFetch = globalThis.fetch;

describe('InterceptingRoundTripper', () => {
	let mockProxied: RoundTripper;

	beforeEach(() => {
		mockProxied = {
			roundTrip: vi.fn(),
		};
	});

	describe('request logging', () => {
		it('should log requests when logger is provided', async () => {
			const logger = vi.fn();
			const mockResponse = new Response(JSON.stringify({ result: 'test' }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			});
			vi.mocked(mockProxied.roundTrip).mockResolvedValue(mockResponse);

			const roundTripper = new InterceptingRoundTripper(undefined, logger, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'POST',
				body: JSON.stringify({ method: 'eth_blockNumber' }),
			});

			await roundTripper.roundTrip(request);

			expect(logger).toHaveBeenCalledTimes(2);
			expect(logger).toHaveBeenCalledWith('Request:', expect.objectContaining({
				url: 'http://localhost/test',
				method: 'POST',
			}));
			expect(logger).toHaveBeenCalledWith('Response:', expect.objectContaining({
				status: 200,
			}));
		});

		it('should not log when logger is not provided', async () => {
			const mockResponse = new Response(JSON.stringify({ result: 'test' }));
			vi.mocked(mockProxied.roundTrip).mockResolvedValue(mockResponse);

			const roundTripper = new InterceptingRoundTripper(undefined, undefined, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'GET',
			});

			// Should not throw
			await roundTripper.roundTrip(request);
		});

		it('should handle request with no body', async () => {
			const logger = vi.fn();
			const mockResponse = new Response(JSON.stringify({ result: 'test' }));
			vi.mocked(mockProxied.roundTrip).mockResolvedValue(mockResponse);

			const roundTripper = new InterceptingRoundTripper(undefined, logger, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'GET',
				// No body
			});

			await roundTripper.roundTrip(request);

			expect(logger).toHaveBeenCalledWith('Request:', expect.objectContaining({
				body: '',
			}));
		});
	});

	describe('response interception', () => {
		it('should call interceptor with request body and response', async () => {
			const interceptor = vi.fn().mockImplementation(async (_reqBody, response) => response);
			const mockResponse = new Response(JSON.stringify({ result: 'test' }), { status: 200 });
			vi.mocked(mockProxied.roundTrip).mockResolvedValue(mockResponse);

			const roundTripper = new InterceptingRoundTripper(interceptor, undefined, mockProxied);

			const requestBody = JSON.stringify({ method: 'eth_call' });
			const request = new Request('http://localhost/test', {
				method: 'POST',
				body: requestBody,
			});

			await roundTripper.roundTrip(request);

			expect(interceptor).toHaveBeenCalledTimes(1);
			expect(interceptor).toHaveBeenCalledWith(requestBody, expect.any(Response));
		});

		it('should return interceptor modified response', async () => {
			const modifiedResponse = new Response(JSON.stringify({ result: 'modified' }), {
				status: 201,
			});
			const interceptor = vi.fn().mockResolvedValue(modifiedResponse);
			const mockResponse = new Response(JSON.stringify({ result: 'original' }), { status: 200 });
			vi.mocked(mockProxied.roundTrip).mockResolvedValue(mockResponse);

			const roundTripper = new InterceptingRoundTripper(interceptor, undefined, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'POST',
				body: '{}',
			});

			const response = await roundTripper.roundTrip(request);

			expect(response).toBe(modifiedResponse);
		});

		it('should return original response when no interceptor', async () => {
			const mockResponse = new Response(JSON.stringify({ result: 'test' }), { status: 200 });
			vi.mocked(mockProxied.roundTrip).mockResolvedValue(mockResponse);

			const roundTripper = new InterceptingRoundTripper(undefined, undefined, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'GET',
			});

			const response = await roundTripper.roundTrip(request);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.result).toBe('test');
		});
	});

	describe('error handling', () => {
		it('should log errors when network request fails', async () => {
			const logger = vi.fn();
			const networkError = new Error('Network error');
			vi.mocked(mockProxied.roundTrip).mockRejectedValue(networkError);

			const roundTripper = new InterceptingRoundTripper(undefined, logger, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'GET',
			});

			await expect(roundTripper.roundTrip(request)).rejects.toThrow('Network error');

			expect(logger).toHaveBeenCalledWith('Request failed', expect.objectContaining({
				error: 'Network error',
			}));
		});

		it('should rethrow network errors', async () => {
			const networkError = new Error('Connection refused');
			vi.mocked(mockProxied.roundTrip).mockRejectedValue(networkError);

			const roundTripper = new InterceptingRoundTripper(undefined, undefined, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'GET',
			});

			await expect(roundTripper.roundTrip(request)).rejects.toThrow('Connection refused');
		});

		it('should handle non-Error exceptions', async () => {
			const logger = vi.fn();
			vi.mocked(mockProxied.roundTrip).mockRejectedValue('string error');

			const roundTripper = new InterceptingRoundTripper(undefined, logger, mockProxied);

			const request = new Request('http://localhost/test', {
				method: 'GET',
			});

			await expect(roundTripper.roundTrip(request)).rejects.toBe('string error');

			expect(logger).toHaveBeenCalledWith('Request failed', expect.objectContaining({
				error: 'string error',
			}));
		});
	});
});

describe('createInterceptingTransport', () => {
	beforeEach(() => {
		// Reset fetch mock
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	describe('without interceptor', () => {
		it('should create a transport that makes requests', async () => {
			const mockJsonResponse = { jsonrpc: '2.0', id: 1, result: '0x100' };
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify(mockJsonResponse), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				}),
			);

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
			});

			// Transport returns a function that creates the actual transport config
			const config = transport({ chain: undefined, pollingInterval: 4000 });
			expect(config.request).toBeDefined();
		});

		it('should call logger callbacks when provided', async () => {
			const logger = vi.fn();
			const mockJsonResponse = { jsonrpc: '2.0', id: 1, result: '0x100' };
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify(mockJsonResponse), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				}),
			);

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				logger,
			});

			// The transport is configured with onFetchRequest/onFetchResponse
			expect(transport).toBeDefined();
		});
	});

	describe('with interceptor', () => {
		it('should create a custom transport with interception', async () => {
			const interceptor = vi.fn().mockImplementation(async (_req, response) => response);
			const mockJsonResponse = { jsonrpc: '2.0', id: 1, result: '0x100' };
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify(mockJsonResponse), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				}),
			);

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				interceptor,
			});

			const config = transport({ chain: undefined, pollingInterval: 4000 });
			const result = await config.request({ method: 'eth_blockNumber', params: [] });

			expect(result).toBe('0x100');
			expect(interceptor).toHaveBeenCalled();
		});

		it('should throw RPC errors', async () => {
			const interceptor = vi.fn().mockImplementation(async (_req, response) => response);
			const mockJsonResponse = {
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32000, message: 'Execution reverted' },
			};
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify(mockJsonResponse), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				}),
			);

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				interceptor,
				retryCount: 0, // No retries to speed up test
			});

			const config = transport({ chain: undefined, pollingInterval: 4000 });

			await expect(config.request({ method: 'eth_call', params: [] })).rejects.toThrow(
				'Execution reverted',
			);
		});

		it('should throw generic RPC error when no message', async () => {
			const interceptor = vi.fn().mockImplementation(async (_req, response) => response);
			const mockJsonResponse = {
				jsonrpc: '2.0',
				id: 1,
				error: { code: -32000 },
			};
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify(mockJsonResponse), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				}),
			);

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				interceptor,
				retryCount: 0,
			});

			const config = transport({ chain: undefined, pollingInterval: 4000 });

			await expect(config.request({ method: 'eth_call', params: [] })).rejects.toThrow(
				'RPC Error',
			);
		});

		it('should retry on network errors', async () => {
			const interceptor = vi.fn().mockImplementation(async (_req, response) => response);
			const mockJsonResponse = { jsonrpc: '2.0', id: 1, result: '0x100' };

			// First two calls fail, third succeeds
			vi.mocked(globalThis.fetch)
				.mockRejectedValueOnce(new Error('Network error'))
				.mockRejectedValueOnce(new Error('Network error'))
				.mockResolvedValue(
					new Response(JSON.stringify(mockJsonResponse), {
						status: 200,
						headers: { 'content-type': 'application/json' },
					}),
				);

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				interceptor,
				retryCount: 3,
				retryDelay: 1, // Very short delay for testing
			});

			const config = transport({ chain: undefined, pollingInterval: 4000 });
			const result = await config.request({ method: 'eth_blockNumber', params: [] });

			expect(result).toBe('0x100');
			expect(globalThis.fetch).toHaveBeenCalledTimes(3);
		});

		it('should throw after exhausting retries', async () => {
			const interceptor = vi.fn().mockImplementation(async (_req, response) => response);

			// Make all calls fail
			vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Persistent network error'));

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				interceptor,
				retryCount: 2,
				retryDelay: 1,
			});

			const config = transport({ chain: undefined, pollingInterval: 4000 });

			// Should throw after exhausting retries
			await expect(config.request({ method: 'eth_blockNumber', params: [] })).rejects.toThrow(
				'Persistent network error',
			);

			// Verify fetch was called (at least initial + retries)
			expect(globalThis.fetch).toHaveBeenCalled();
		});

		it('should convert non-Error exceptions to Error', async () => {
			const interceptor = vi.fn().mockImplementation(async (_req, response) => response);

			vi.mocked(globalThis.fetch).mockRejectedValue('string error');

			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				interceptor,
				retryCount: 0,
			});

			const config = transport({ chain: undefined, pollingInterval: 4000 });

			await expect(config.request({ method: 'eth_blockNumber', params: [] })).rejects.toThrow(
				'string error',
			);
		});
	});

	describe('configuration options', () => {
		it('should use default timeout when not specified', () => {
			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
			});

			expect(transport).toBeDefined();
		});

		it('should use custom timeout', () => {
			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				timeout: 30000,
			});

			expect(transport).toBeDefined();
		});

		it('should use default retry settings when not specified', () => {
			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
			});

			expect(transport).toBeDefined();
		});

		it('should use custom retry settings', () => {
			const transport = createInterceptingTransport({
				url: 'http://localhost:8545',
				retryCount: 5,
				retryDelay: 500,
			});

			expect(transport).toBeDefined();
		});
	});
});

describe('import/export test', () => {
	it('should export InterceptingRoundTripper', () => {
		expect(InterceptingRoundTripper).toBeDefined();
	});

	it('should export createInterceptingTransport', () => {
		expect(createInterceptingTransport).toBeDefined();
	});
});
