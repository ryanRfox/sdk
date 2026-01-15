import { describe, expect, it } from 'vitest';
import { Handler } from './index.js';
import { Kv } from './index.js';

/**
 * Creates test WebAuthn credential data for testing.
 * @param challenge - The challenge hex string (with 0x prefix)
 * @param options - Override options for testing error cases
 */
function createTestWebAuthnCredential(
  challenge: string,
  options: {
    type?: string;
    origin?: string;
    userPresent?: boolean;
  } = {}
) {
  const {
    type = 'webauthn.create',
    origin = 'http://localhost',
    userPresent = true,
  } = options;

  // Convert hex challenge to base64url (remove 0x prefix, convert hex to bytes, then base64url)
  const challengeBytes = hexToBytes(challenge.slice(2));
  const challengeBase64Url = bytesToBase64Url(challengeBytes);

  // Create clientDataJSON
  const clientDataJSON = JSON.stringify({
    type,
    challenge: challengeBase64Url,
    origin,
    crossOrigin: false,
  });
  const clientDataJSONBase64Url = stringToBase64Url(clientDataJSON);

  // Create authenticatorData (37 bytes minimum: 32 byte rpIdHash + 1 byte flags + 4 byte counter)
  const authenticatorData = new Uint8Array(37);
  // rpIdHash (32 bytes) - just zeros for test
  // flags (byte 32): bit 0 = User Present (UP)
  authenticatorData[32] = userPresent ? 0x01 : 0x00;
  // signCount (4 bytes) - zeros
  const authenticatorDataBase64Url = bytesToBase64Url(authenticatorData);

  return {
    response: {
      clientDataJSON: clientDataJSONBase64Url,
      authenticatorData: authenticatorDataBase64Url,
    },
  };
}

/** Convert hex string to Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/** Convert Uint8Array to base64url string */
function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Convert string to base64url string */
function stringToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64Url(bytes);
}

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

  it('should store and retrieve credential with valid WebAuthn data', async () => {
    const kv = Kv.memory();
    const handler = Handler.keyManager({ kv });

    // 1. Get a challenge first
    const challengeResponse = await handler.fetch(
      new Request('http://localhost/challenge', { method: 'GET' })
    );
    const { challenge } = await challengeResponse.json();

    // 2. Create valid WebAuthn credential data
    const credential = createTestWebAuthnCredential(challenge);

    // 3. Store credential
    const storeRequest = new Request('http://localhost/test-cred', {
      method: 'POST',
      body: JSON.stringify({
        credential,
        publicKey: '0x1234',
      }),
    });

    const storeResponse = await handler.fetch(storeRequest);
    expect(storeResponse.status).toBe(204);

    // 4. Retrieve credential
    const getRequest = new Request('http://localhost/test-cred', {
      method: 'GET',
    });

    const getResponse = await handler.fetch(getRequest);
    const json = await getResponse.json();
    expect(json.publicKey).toBe('0x1234');
  });

  it('should reject credential with invalid challenge', async () => {
    const kv = Kv.memory();
    const handler = Handler.keyManager({ kv });

    // Create credential with a challenge that was never issued
    const fakeChallenge = '0x' + '00'.repeat(32);
    const credential = createTestWebAuthnCredential(fakeChallenge);

    const storeRequest = new Request('http://localhost/test-cred', {
      method: 'POST',
      body: JSON.stringify({
        credential,
        publicKey: '0x1234',
      }),
    });

    const storeResponse = await handler.fetch(storeRequest);
    expect(storeResponse.status).toBe(400);
    const json = await storeResponse.json();
    expect(json.error).toContain('challenge');
  });

  it('should reject replayed challenge', async () => {
    const kv = Kv.memory();
    const handler = Handler.keyManager({ kv });

    // Get a challenge
    const challengeResponse = await handler.fetch(
      new Request('http://localhost/challenge', { method: 'GET' })
    );
    const { challenge } = await challengeResponse.json();

    const credential = createTestWebAuthnCredential(challenge);

    // First use - should succeed
    const firstStore = await handler.fetch(new Request('http://localhost/cred-1', {
      method: 'POST',
      body: JSON.stringify({ credential, publicKey: '0x1234' }),
    }));
    expect(firstStore.status).toBe(204);

    // Second use of same challenge - should fail (replay attack)
    const secondStore = await handler.fetch(new Request('http://localhost/cred-2', {
      method: 'POST',
      body: JSON.stringify({ credential, publicKey: '0x5678' }),
    }));
    expect(secondStore.status).toBe(400);
    const json = await secondStore.json();
    expect(json.error).toContain('challenge');
  });

  it('should reject credential with wrong type', async () => {
    const kv = Kv.memory();
    const handler = Handler.keyManager({ kv });

    const challengeResponse = await handler.fetch(
      new Request('http://localhost/challenge', { method: 'GET' })
    );
    const { challenge } = await challengeResponse.json();

    // Create credential with wrong type
    const credential = createTestWebAuthnCredential(challenge, { type: 'webauthn.get' });

    const storeResponse = await handler.fetch(new Request('http://localhost/test-cred', {
      method: 'POST',
      body: JSON.stringify({ credential, publicKey: '0x1234' }),
    }));
    expect(storeResponse.status).toBe(400);
    const json = await storeResponse.json();
    expect(json.error).toContain('type');
  });

  it('should reject credential without User Present flag', async () => {
    const kv = Kv.memory();
    const handler = Handler.keyManager({ kv });

    const challengeResponse = await handler.fetch(
      new Request('http://localhost/challenge', { method: 'GET' })
    );
    const { challenge } = await challengeResponse.json();

    // Create credential with User Present flag cleared
    const credential = createTestWebAuthnCredential(challenge, { userPresent: false });

    const storeResponse = await handler.fetch(new Request('http://localhost/test-cred', {
      method: 'POST',
      body: JSON.stringify({ credential, publicKey: '0x1234' }),
    }));
    expect(storeResponse.status).toBe(400);
    const json = await storeResponse.json();
    expect(json.error).toContain('User not present');
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
