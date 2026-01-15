import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Handler } from './index.js';
import { Kv } from './index.js';
import type { LocalAccount } from 'viem/accounts';

describe('Handler.compose', () => {
  it('should create a composed handler', () => {
    const handler = Handler.compose([
      Handler.from(),
      Handler.from(),
    ]);

    expect(handler).toBeDefined();
    expect(handler.fetch).toBeDefined();
    expect(handler.listener).toBeDefined();
  });

  it('should route to first matching handler', async () => {
    const kv = Kv.memory();

    const handler = Handler.compose([
      Handler.keyManager({ kv, path: '/keys' }),
    ]);

    const request = new Request('http://localhost/keys/challenge', {
      method: 'GET',
    });

    const response = await handler.fetch(request);
    expect(response.status).toBe(200);
  });

  it('should return 404 when no handler matches', async () => {
    const handler = Handler.compose([
      Handler.keyManager({ kv: Kv.memory(), path: '/keys' }),
    ]);

    const request = new Request('http://localhost/other/path', {
      method: 'GET',
    });

    const response = await handler.fetch(request);
    expect(response.status).toBe(404);
  });

  it('should support path prefix', async () => {
    const kv = Kv.memory();

    const handler = Handler.compose([
      Handler.keyManager({ kv }),
    ], { path: '/api' });

    const request = new Request('http://localhost/api/challenge', {
      method: 'GET',
    });

    const response = await handler.fetch(request);
    expect(response.status).toBe(200);
  });
});

describe('Handler.from', () => {
  it('should create a basic handler', () => {
    const handler = Handler.from();

    expect(handler).toBeDefined();
    expect(handler.fetch).toBeDefined();
    expect(handler.listener).toBeDefined();
  });

  it('should handle OPTIONS requests', async () => {
    const handler = Handler.from({
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

    const request = new Request('http://localhost/', {
      method: 'OPTIONS',
    });

    const response = await handler.fetch(request);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});

describe('Handler.keyManager', () => {
  it('should create a handler with listener', () => {
    const handler = Handler.keyManager({
      kv: Kv.memory(),
    });

    expect(handler).toBeDefined();
    expect(handler.fetch).toBeDefined();
    expect(handler.listener).toBeDefined();
  });

  it('should return challenge on GET /challenge', async () => {
    const handler = Handler.keyManager({
      kv: Kv.memory(),
    });

    const request = new Request('http://localhost/challenge', {
      method: 'GET',
    });

    const response = await handler.fetch(request);
    const json = await response.json();

    expect(json.challenge).toBeDefined();
    expect(json.challenge).toMatch(/^0x[a-f0-9]+$/i);
  });

  it('should return 404 for unknown credential', async () => {
    const handler = Handler.keyManager({
      kv: Kv.memory(),
    });

    const request = new Request('http://localhost/unknown-id', {
      method: 'GET',
    });

    const response = await handler.fetch(request);
    expect(response.status).toBe(404);
  });

  it('should store and retrieve credential', async () => {
    const kv = Kv.memory();
    const handler = Handler.keyManager({ kv });

    // Store credential
    const storeRequest = new Request('http://localhost/test-cred', {
      method: 'POST',
      body: JSON.stringify({
        credential: { response: { clientDataJSON: 'test' } },
        publicKey: '0x1234',
      }),
    });

    const storeResponse = await handler.fetch(storeRequest);
    expect(storeResponse.status).toBe(204);

    // Retrieve credential
    const getRequest = new Request('http://localhost/test-cred', {
      method: 'GET',
    });

    const getResponse = await handler.fetch(getRequest);
    const json = await getResponse.json();
    expect(json.publicKey).toBe('0x1234');
  });

  it('should return error for missing credential', async () => {
    const handler = Handler.keyManager({
      kv: Kv.memory(),
    });

    const request = new Request('http://localhost/test-cred', {
      method: 'POST',
      body: JSON.stringify({ publicKey: '0x1234' }),
    });

    const response = await handler.fetch(request);
    expect(response.status).toBe(400);
  });

  it('should include rp config when provided', async () => {
    const handler = Handler.keyManager({
      kv: Kv.memory(),
      rp: 'example.com',
    });

    const request = new Request('http://localhost/challenge', {
      method: 'GET',
    });

    const response = await handler.fetch(request);
    const json = await response.json();

    expect(json.rp).toBeDefined();
    expect(json.rp.id).toBe('example.com');
  });
});

describe('Handler.feePayer', () => {
	// Mock account
	const mockAccount = {
		address: '0x1234567890123456789012345678901234567890',
		publicKey: '0x04...',
		type: 'local',
		source: 'privateKey',
		sign: vi.fn(),
		signAuthorization: vi.fn(),
		signMessage: vi.fn(),
		signTransaction: vi.fn(),
		signTypedData: vi.fn(),
	} as unknown as LocalAccount;

	// Mock client
	const mockClient = {
		request: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create a handler with listener', () => {
		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
		});

		expect(handler).toBeDefined();
		expect(handler.fetch).toBeDefined();
		expect(handler.listener).toBeDefined();
	});

	it('should handle eth_sendRawTransaction', async () => {
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(json.result).toBe('0xtxhash');
		expect(json.id).toBe(1);
	});

	it('should return error for unsupported method', async () => {
		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'unsupported_method',
				params: [],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(json.error).toBeDefined();
		expect(json.error.code).toBe(-32601);
	});

	it('should call onRequest callback', async () => {
		const onRequest = vi.fn();
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
			onRequest,
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		await handler.fetch(request);
		expect(onRequest).toHaveBeenCalled();
	});

	it('should use custom path', async () => {
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
			path: '/custom-path',
		});

		const request = new Request('http://localhost/custom-path', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(json.result).toBe('0xtxhash');
	});

	it('should handle errors in request processing', async () => {
		mockClient.request.mockRejectedValueOnce(new Error('Network error'));

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(json.error).toBeDefined();
		expect(json.error.code).toBe(-32603);
		expect(json.error.message).toBe('Internal error: transaction processing failed');
	});

	it('should pass correct parameters to client.request', async () => {
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
		});

		const serializedTx = '0xf86a0485a4e3b14d82520894...';
		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 42,
				method: 'eth_sendRawTransaction',
				params: [serializedTx],
			}),
		});

		await handler.fetch(request);

		expect(mockClient.request).toHaveBeenCalledWith({
			method: 'eth_sendRawTransaction',
			params: [serializedTx],
		});
	});

	it('should preserve jsonrpc version in response', async () => {
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(json.jsonrpc).toBe('2.0');
	});

	it('should handle request with custom headers', async () => {
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
			headers: {
				'X-Custom-Header': 'test-value',
			},
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(response.headers.get('X-Custom-Header')).toBe('test-value');
		expect(json.result).toBe('0xtxhash');
	});

	it('should handle onRequest callback errors gracefully', async () => {
		const onRequest = vi.fn().mockRejectedValueOnce(new Error('Callback error'));
		mockClient.request.mockResolvedValueOnce('0xtxhash');

		const handler = Handler.feePayer({
			account: mockAccount,
			client: mockClient as any,
			onRequest,
		});

		const request = new Request('http://localhost/', {
			method: 'POST',
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_sendRawTransaction',
				params: ['0xserialized'],
			}),
		});

		const response = await handler.fetch(request);
		const json = await response.json();

		expect(json.error).toBeDefined();
		expect(json.error.code).toBe(-32603);
	});
});
