# Server Handlers Guide

This guide covers the server handlers API in the Radius SDK, which provides request handling capabilities for building backend services with transaction fee sponsorship and WebAuthn credential management.

## Overview

Server handlers are factory functions that create HTTP request handlers for specific server tasks. The Radius SDK provides handlers for:

- **Fee Payer** - Sponsor transaction fees for users
- **Key Manager** - Store and manage WebAuthn credentials
- **Compose** - Combine multiple handlers into a single service

Each handler returns a unified `Handler` instance that works with any JavaScript runtime supporting the Fetch API or Node.js request listeners.

## Installation

Import from the `@radiustechsystems/sdk/server` module:

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';
```

The server module exports:
- `Handler` namespace with factory functions
- `Kv` namespace for key-value store implementations
- Error classes for server-side error handling

## Handler.from()

The base handler factory creates a foundation handler with routing and request handling capabilities.

### Basic Usage

```typescript
import { Handler } from '@radiustechsystems/sdk/server';

const handler = Handler.from({
  headers: {
    'X-Custom-Header': 'value'
  }
});

// Add routes
handler.get('/api/test', () => Response.json({ ok: true }));
handler.post('/api/data', async ({ request }) => {
  const body = await request.json();
  return Response.json({ received: body });
});
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `headers` | `Headers \| Record<string, string>` | HTTP headers to add to all responses |
| `path` | `string` | Base path prefix for routes |

### CORS Support

Add CORS headers automatically to all responses:

```typescript
const handler = Handler.from({
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
});
```

The handler automatically responds to `OPTIONS` requests with these headers.

## Handler.feePayer()

Creates a handler that sponsors transaction fees using a configured account. The fee payer account is used to submit transactions on behalf of users.

### Purpose

The fee payer handler accepts JSON-RPC requests to submit raw transactions. Instead of the user paying transaction fees, the application's fee payer account covers the cost. This enables gasless or subsidized transactions for users.

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `account` | `LocalAccount` | viem LocalAccount to use as the fee payer |
| `client` OR `chain` + `transport` | | viem Client, or chain + transport to create one |

### Optional Options

| Option | Type | Description |
|--------|------|-------------|
| `path` | `string` | Path prefix for the endpoint (default: `'/'`) |
| `headers` | `Headers \| Record<string, string>` | HTTP headers for all responses |
| `onRequest` | `(request: any) => Promise<void>` | Callback before processing requests |

### Example: Basic Fee Payer

```typescript
import { Handler } from '@radiustechsystems/sdk/server';
import { createClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');

const handler = Handler.feePayer({
  account,
  client: createClient({
    chain: mainnet,
    transport: http(),
  }),
});
```

### Example: With Validation Callback

```typescript
const handler = Handler.feePayer({
  account,
  client,
  path: '/api/feepayer',
  onRequest: async (request) => {
    // Validate request before processing
    if (!request.id) {
      throw new Error('Missing request ID');
    }

    // Log or monitor requests
    console.log('Processing fee payer request:', request.method);

    // Could add rate limiting, user validation, etc.
  },
});
```

### API Endpoint

The handler exposes a single endpoint accepting JSON-RPC requests:

```
POST /api/feepayer
```

Request format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendRawTransaction",
  "params": ["0x...serialized transaction..."]
}
```

Response format (success):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x...transaction hash..."
}
```

Response format (error):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not supported"
  }
}
```

### Security Considerations

1. **Private Key Protection** - The fee payer's private key should never be exposed. Use environment variables and secure key management.

2. **Request Validation** - Use the `onRequest` callback to validate incoming requests:
   ```typescript
   onRequest: async (request) => {
     // Check user authorization
     // Validate transaction parameters
     // Implement rate limiting
   }
   ```

3. **Fee Limits** - Consider implementing limits on transaction fees or gas amounts to prevent abuse.

4. **Endpoint Security** - Use authentication middleware to protect the fee payer endpoint from unauthorized access.

## Handler.keyManager()

Creates a handler for managing WebAuthn credentials through secure storage and retrieval.

### Purpose

The key manager handler provides endpoints for WebAuthn authentication flows:
- Generate challenges for registration and authentication
- Store public keys for registered credentials
- Retrieve public keys for verification

This enables passwordless authentication with WebAuthn.

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `kv` | `Kv` | Key-value store for credential storage |

### Optional Options

| Option | Type | Description |
|--------|------|-------------|
| `path` | `string` | Path prefix for endpoints (default: `''`) |
| `headers` | `Headers \| Record<string, string>` | HTTP headers for all responses |
| `rp` | `string \| { id: string, name?: string }` | Relying party configuration |

### HTTP Endpoints

The key manager exposes three endpoints:

#### GET `{path}/challenge`

Generates a new WebAuthn challenge for registration or authentication.

Response:
```json
{
  "challenge": "0x...",
  "rp": {
    "id": "example.com",
    "name": "Example App"
  }
}
```

#### GET `{path}/:id`

Retrieves the public key for a credential.

Response (success):
```json
{
  "publicKey": "0x..."
}
```

Response (404):
```
Credential not found
```

#### POST `{path}/:id`

Stores a public key for a credential.

Request body:
```json
{
  "credential": {
    "response": {
      "clientDataJSON": "..."
    }
  },
  "publicKey": "0x..."
}
```

Response: `204 No Content`

### Example: Basic Key Manager

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const handler = Handler.keyManager({
  kv: Kv.memory(),
  path: '/api/credentials',
});
```

### Example: With Cloudflare KV

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

export default {
  fetch: async (request, env) => {
    const handler = Handler.keyManager({
      kv: Kv.cloudflare(env.RADIUS_KV),
      path: '/credentials',
      rp: { id: 'example.com', name: 'My App' },
    });

    return handler.fetch(request);
  },
};
```

### Example: WebAuthn Flow

```typescript
// Client-side: Get challenge for registration
const challengeResponse = await fetch('/api/credentials/challenge');
const { challenge, rp } = await challengeResponse.json();

// Use challenge with WebAuthn API
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: Buffer.from(challenge.slice(2), 'hex'),
    rp,
    user: {
      id: new Uint8Array(16),
      name: 'user@example.com',
      displayName: 'User',
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
  },
});

// Extract public key from credential
const publicKey = extractPublicKey(credential);

// Store credential on server
await fetch('/api/credentials/cred-id', {
  method: 'POST',
  body: JSON.stringify({
    credential,
    publicKey,
  }),
});
```

## Handler.compose()

Combines multiple handlers into a single unified handler.

### Purpose

Composing handlers allows you to build complex services by combining specialized handlers (fee payer, key manager, etc.) under a single entry point. Requests are routed to each handler in order until one returns a non-404 response.

### How Routing Works

1. Requests are checked against the base path
2. The path is stripped and remaining path is routed to each handler in order
3. The first handler returning a non-404 status is used
4. If all handlers return 404, the composed handler returns 404

### Options

| Option | Type | Description |
|--------|------|-------------|
| `path` | `string` | Base path prefix for all handlers (default: `'/'`) |
| `headers` | `Headers \| Record<string, string>` | HTTP headers for all responses |

### Example: Composing Fee Payer and Key Manager

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';
import { createClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');
const client = createClient({
  chain: mainnet,
  transport: http(),
});

// Create individual handlers
const keyManager = Handler.keyManager({
  kv: Kv.memory(),
  path: '/credentials',
  rp: 'example.com',
});

const feePayer = Handler.feePayer({
  account,
  client,
  path: '/feepayer',
});

// Compose them
const handler = Handler.compose([keyManager, feePayer], {
  path: '/api/radius',
  headers: {
    'X-API-Version': '1.0',
  },
});
```

### Routing Example

With the above configuration:

| Request | Handled By | Result |
|---------|-----------|--------|
| `GET /api/radius/credentials/challenge` | keyManager | 200 with challenge |
| `POST /api/radius/credentials/cred-id` | keyManager | 204 No Content |
| `POST /api/radius/feepayer` | feePayer | 200 with tx hash |
| `GET /api/radius/other` | — | 404 Not Found |
| `GET /other/path` | — | 404 Not Found |

## KV Storage

The KV (key-value) store provides a simple async interface for persisting data. Handlers use KV for storing WebAuthn challenges and credentials.

### Kv Interface

All KV implementations follow this interface:

```typescript
type Kv = {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
};
```

### Kv.memory()

Creates an in-memory store backed by a JavaScript `Map`. Useful for development, testing, and single-instance deployments without persistence.

```typescript
import { Kv } from '@radiustechsystems/sdk/server';

const kv = Kv.memory();
```

Use cases:
- Local development
- Unit and integration tests
- Single-instance deployments without persistence requirements

Limitations:
- Data is cleared when the process restarts
- Not suitable for multi-instance deployments
- No persistence across server restarts

### Kv.cloudflare()

Creates an adapter for Cloudflare Workers KV namespace. Use this in Cloudflare Worker environments.

```typescript
import { Kv } from '@radiustechsystems/sdk/server';

export default {
  fetch: async (request, env) => {
    const kv = Kv.cloudflare(env.RADIUS_KV);

    const handler = Handler.keyManager({
      kv,
      path: '/credentials',
    });

    return handler.fetch(request);
  },
};
```

The adapter normalizes the Cloudflare API by mapping `put` to `set`.

### Kv.from()

Wraps a custom KV implementation to ensure type safety.

```typescript
import { Kv } from '@radiustechsystems/sdk/server';

const customKv = Kv.from({
  async get(key) {
    return await myBackend.retrieve(key);
  },
  async set(key, value) {
    await myBackend.store(key, value);
  },
  async delete(key) {
    await myBackend.remove(key);
  },
});
```

### Custom KV Implementation

Implement a custom KV adapter for any backend:

```typescript
import { Kv } from '@radiustechsystems/sdk/server';
import Redis from 'redis';

const redisClient = Redis.createClient();

const kvRedis = Kv.from({
  get: async (key) => {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : undefined;
  },
  set: async (key, value) => {
    await redisClient.set(key, JSON.stringify(value));
  },
  delete: async (key) => {
    await redisClient.del(key);
  },
});

const handler = Handler.keyManager({
  kv: kvRedis,
});
```

## Runtime Compatibility

Handlers work with multiple JavaScript runtimes through the `handler.listener` property, which adapts the fetch-based handler to different request/response APIs.

### Node.js with http.createServer()

```typescript
import * as http from 'http';
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const handler = Handler.keyManager({
  kv: Kv.memory(),
});

const server = http.createServer(handler.listener);
server.listen(3000);
```

### Express.js

```typescript
import express from 'express';
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const app = express();

const handler = Handler.keyManager({
  kv: Kv.memory(),
  path: '/api/credentials',
});

// Use as Express middleware
app.use(handler.listener);

app.listen(3000);
```

### Hono

```typescript
import { Hono } from 'hono';
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const app = new Hono();

const handler = Handler.keyManager({
  kv: Kv.memory(),
});

// Hono supports fetch-based handlers directly
app.all('*', async (c) => {
  const response = await handler.fetch(c.req.raw);
  return response;
});

export default app;
```

### Cloudflare Workers

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

export default {
  fetch: async (request, env) => {
    const handler = Handler.keyManager({
      kv: Kv.cloudflare(env.RADIUS_KV),
    });

    return handler.fetch(request);
  },
};
```

### Bun

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const handler = Handler.keyManager({
  kv: Kv.memory(),
});

export default {
  fetch: handler.fetch,
  port: 3000,
};
```

## Error Handling

The SDK provides specialized error classes for server operations. All inherit from `ServerError`.

### ServerError Hierarchy

```
ServerError
├── InvalidRequestError
├── MethodNotSupportedError
├── ChallengeExpiredError
└── CredentialNotFoundError
```

### Catching Errors

```typescript
import {
  ServerError,
  InvalidRequestError,
  MethodNotSupportedError,
} from '@radiustechsystems/sdk/server';

try {
  // handler logic
} catch (error) {
  if (error instanceof InvalidRequestError) {
    console.error('Invalid request:', error.message);
  } else if (error instanceof MethodNotSupportedError) {
    console.error('Method not supported:', error.message);
  } else if (error instanceof ServerError) {
    console.error('Server error:', error.message);
  }
}
```

### JSON-RPC Error Codes

The feePayer handler returns JSON-RPC error codes:

| Code | Message | Description |
|------|---------|-------------|
| `-32601` | Method not supported | Unsupported RPC method |
| `-32603` | Internal error | Processing error |

Example error response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal Server Error"
  }
}
```

### InvalidRequestError

Thrown when a request is malformed or missing required fields.

```typescript
import { InvalidRequestError } from '@radiustechsystems/sdk/server';

if (!request.body.credential) {
  throw new InvalidRequestError('Missing required field: credential');
}
```

### MethodNotSupportedError

Thrown when an unsupported RPC method is requested.

```typescript
import { MethodNotSupportedError } from '@radiustechsystems/sdk/server';

const supportedMethods = ['eth_sendRawTransaction'];
if (!supportedMethods.includes(jsonRpcRequest.method)) {
  throw new MethodNotSupportedError(jsonRpcRequest.method);
}
```

### ChallengeExpiredError

Thrown when a WebAuthn challenge is no longer valid.

```typescript
import { ChallengeExpiredError } from '@radiustechsystems/sdk/server';

const challenge = await kv.get(`challenge:${challengeId}`);
if (!challenge) {
  throw new ChallengeExpiredError();
}
```

### CredentialNotFoundError

Thrown when a requested credential does not exist.

```typescript
import { CredentialNotFoundError } from '@radiustechsystems/sdk/server';

const publicKey = await kv.get(`credential:${credentialId}`);
if (!publicKey) {
  throw new CredentialNotFoundError(credentialId);
}
```

## Complete Example

Here's a complete example combining fee payer and key manager handlers in an Express.js application:

```typescript
import express from 'express';
import { Handler, Kv } from '@radiustechsystems/sdk/server';
import { createClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const app = express();

// Initialize fee payer
const account = privateKeyToAccount(process.env.FEE_PAYER_KEY!);
const client = createClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL),
});

// Create handlers
const keyManager = Handler.keyManager({
  kv: Kv.memory(), // Use Kv.cloudflare() in production
  path: '/credentials',
  rp: {
    id: 'example.com',
    name: 'Example App',
  },
});

const feePayer = Handler.feePayer({
  account,
  client,
  path: '/feepayer',
  onRequest: async (request) => {
    // Add request validation here
    console.log('Processing request:', request.method);
  },
});

// Compose handlers
const apiHandler = Handler.compose([keyManager, feePayer], {
  path: '/api/radius',
  headers: {
    'X-API-Version': '1.0',
  },
});

// Mount handler
app.use(apiHandler.listener);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Next Steps

- Review the [main SDK documentation](/docs/sdk-typescript.mdx) for client-side usage
- Check [viem documentation](https://viem.sh) for transaction signing and submission
- Explore [WebAuthn specifications](https://webauthn.io) for authentication details
