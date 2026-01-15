import { describe, it, expect } from 'vitest';
import * as Handler from '../../src/server/Handler.js';
import * as Kv from '../../src/server/Kv.js';

/**
 * Creates test WebAuthn credential data for testing.
 */
function createTestWebAuthnCredential(challenge: string) {
  const challengeBytes = hexToBytes(challenge.slice(2));
  const challengeBase64Url = bytesToBase64Url(challengeBytes);

  const clientDataJSON = JSON.stringify({
    type: 'webauthn.create',
    challenge: challengeBase64Url,
    origin: 'http://localhost',
    crossOrigin: false,
  });
  const clientDataJSONBase64Url = stringToBase64Url(clientDataJSON);

  const authenticatorData = new Uint8Array(37);
  authenticatorData[32] = 0x01; // User Present flag
  const authenticatorDataBase64Url = bytesToBase64Url(authenticatorData);

  return {
    response: {
      clientDataJSON: clientDataJSONBase64Url,
      authenticatorData: authenticatorDataBase64Url,
    },
  };
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function stringToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64Url(bytes);
}

describe('Server Handler Integration', () => {
  describe('Composed Handler', () => {
    it('should route to keyManager for GET /keys/challenge', async () => {
      const handler = Handler.compose([
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

    it('should support path prefix', async () => {
      const handler = Handler.compose([
        Handler.keyManager({
          kv: Kv.memory(),
        }),
      ], { path: '/api' });

      const request = new Request('http://localhost/api/challenge', {
        method: 'GET',
      });

      const response = await handler.fetch(request);
      expect(response.status).toBe(200);
    });
  });

  describe('KV Store Integration', () => {
    it('should persist credentials across requests', async () => {
      const kv = Kv.memory();
      const handler = Handler.keyManager({ kv });

      // Get challenge first
      const challengeResponse = await handler.fetch(
        new Request('http://localhost/challenge', { method: 'GET' })
      );
      const { challenge } = await challengeResponse.json();

      // Store credential with valid WebAuthn data
      const credential = createTestWebAuthnCredential(challenge);
      const storeRequest = new Request('http://localhost/cred-123', {
        method: 'POST',
        body: JSON.stringify({
          credential,
          publicKey: '0xpubkey',
        }),
      });
      const storeResponse = await handler.fetch(storeRequest);
      expect(storeResponse.status).toBe(204);

      // Retrieve with new handler using same KV
      const handler2 = Handler.keyManager({ kv });
      const getRequest = new Request('http://localhost/cred-123', {
        method: 'GET',
      });
      const response = await handler2.fetch(getRequest);
      const json = await response.json();

      expect(json.publicKey).toBe('0xpubkey');
    });

    it('should isolate data between KV instances', async () => {
      const kv1 = Kv.memory();
      const kv2 = Kv.memory();

      const handler1 = Handler.keyManager({ kv: kv1 });
      const handler2 = Handler.keyManager({ kv: kv2 });

      // Get challenge from handler1
      const challengeResponse = await handler1.fetch(
        new Request('http://localhost/challenge', { method: 'GET' })
      );
      const { challenge } = await challengeResponse.json();

      // Store in kv1 with valid WebAuthn data
      const credential = createTestWebAuthnCredential(challenge);
      await handler1.fetch(new Request('http://localhost/cred-abc', {
        method: 'POST',
        body: JSON.stringify({
          credential,
          publicKey: '0xkey1',
        }),
      }));

      // Should not exist in kv2
      const response = await handler2.fetch(new Request('http://localhost/cred-abc', {
        method: 'GET',
      }));

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid JSON', async () => {
      const handler = Handler.keyManager({ kv: Kv.memory() });

      const request = new Request('http://localhost/cred-123', {
        method: 'POST',
        body: 'not json',
      });

      const response = await handler.fetch(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing credential', async () => {
      const handler = Handler.keyManager({ kv: Kv.memory() });

      const request = new Request('http://localhost/cred-123', {
        method: 'POST',
        body: JSON.stringify({ publicKey: '0x123' }),
      });

      const response = await handler.fetch(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing publicKey', async () => {
      const handler = Handler.keyManager({ kv: Kv.memory() });

      const request = new Request('http://localhost/cred-123', {
        method: 'POST',
        body: JSON.stringify({ credential: { response: {} } }),
      });

      const response = await handler.fetch(request);
      expect(response.status).toBe(400);
    });
  });
});
