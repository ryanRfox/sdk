import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Handler from '../../src/server/Handler.js';
import * as Kv from '../../src/server/Kv.js';
import type { LocalAccount } from 'viem/accounts';

describe('Server Handler Integration', () => {
  // Mock account for feePayer
  const mockAccount = {
    address: '0x1234567890123456789012345678901234567890',
    publicKey: '0x04abcd',
    type: 'local',
    source: 'privateKey',
    sign: vi.fn(),
    signAuthorization: vi.fn(),
    signMessage: vi.fn(),
    signTransaction: vi.fn(),
    signTypedData: vi.fn(),
  } as unknown as LocalAccount;

  const mockClient = {
    request: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Composed Handler', () => {
    it('should route to feePayer for POST /', async () => {
      mockClient.request.mockResolvedValueOnce('0xtxhash');

      const handler = Handler.compose([
        Handler.feePayer({
          account: mockAccount,
          client: mockClient as any,
          path: '/',
        }),
        Handler.keyManager({
          kv: Kv.memory(),
          path: '/keys',
        }),
      ]);

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

      expect(response.status).toBe(200);
      expect(json.result).toBe('0xtxhash');
    });

    it('should route to keyManager for GET /keys/challenge', async () => {
      const handler = Handler.compose([
        Handler.feePayer({
          account: mockAccount,
          client: mockClient as any,
          path: '/',
        }),
        Handler.keyManager({
          kv: Kv.memory(),
          path: '/keys',
        }),
      ]);

      const request = new Request('http://localhost/keys/challenge', {
        method: 'GET',
      });

      const response = await handler.fetch(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.challenge).toBeDefined();
    });

    it('should return 404 for unmatched routes', async () => {
      const handler = Handler.compose([
        Handler.feePayer({
          account: mockAccount,
          client: mockClient as any,
          path: '/tx',
        }),
        Handler.keyManager({
          kv: Kv.memory(),
          path: '/keys',
        }),
      ]);

      const request = new Request('http://localhost/unknown', {
        method: 'GET',
      });

      const response = await handler.fetch(request);
      expect(response.status).toBe(404);
    });
  });

  describe('KV Store Integration', () => {
    it('should persist credentials across requests', async () => {
      const kv = Kv.memory();
      const handler = Handler.keyManager({ kv });

      // Store credential
      const storeRequest = new Request('http://localhost/cred-123', {
        method: 'POST',
        body: JSON.stringify({
          credential: { response: {} },
          publicKey: '0xpubkey',
        }),
      });
      await handler.fetch(storeRequest);

      // Retrieve with new handler using same KV
      const handler2 = Handler.keyManager({ kv });
      const getRequest = new Request('http://localhost/cred-123', {
        method: 'GET',
      });
      const response = await handler2.fetch(getRequest);
      const json = await response.json();

      expect(json.publicKey).toBe('0xpubkey');
    });
  });

  describe('Error Handling', () => {
    it('should handle client errors gracefully', async () => {
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
    });
  });
});
