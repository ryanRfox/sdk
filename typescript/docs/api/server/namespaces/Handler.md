[**@radiustechsystems/sdk**](../../README.md)

***

[@radiustechsystems/sdk](../../README.md) / [server](../README.md) / Handler

# Handler

## Functions

### from()

```ts
function from(options: HandlerOptions): Handler;
```

Defined in: [src/server/Handler.ts:37](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Handler.ts#L37)

Creates a base request handler with routing and request handling capabilities.

This is the foundation for all handler types. It provides:
- HTTP routing via an internal router
- Support for middleware (headers, CORS preflight)
- Both fetch-based and listener-based request handling
- Custom header configuration

For most use cases, use the specialized handlers like `keyManager()`
instead of calling this directly.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`HandlerOptions`](../README.md#handleroptions) | Configuration options for the base handler |

#### Returns

`Handler`

A Handler instance with fetch() and listener() methods

#### Example

```typescript
import { Handler } from '@radiustechsystems/sdk/server';

const handler = Handler.from({
  headers: { 'X-Custom-Header': 'value' }
});

handler.get('/api/test', () => Response.json({ ok: true }));
```

***

### keyManager()

```ts
function keyManager(options: KeyManagerOptions): Handler;
```

Defined in: [src/server/Handler.ts:116](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Handler.ts#L116)

Creates a key manager handler for WebAuthn credential storage and management.

This handler manages WebAuthn credentials through a key-value store, providing:
- Challenge generation for WebAuthn authentication flows
- Storage and retrieval of public keys for registered credentials
- Support for relying party configuration

Endpoints:
- `GET {path}/challenge` - Generate a new WebAuthn challenge
- `GET {path}/:id` - Retrieve public key for a credential
- `POST {path}/:id` - Store a new credential's public key

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`KeyManagerOptions`](../README.md#keymanageroptions) | Configuration options for the key manager handler |

#### Returns

`Handler`

A Handler instance for the key manager service

#### Example

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const handler = Handler.keyManager({
  kv: Kv.memory(),
  path: '/api/credentials',
  rp: { id: 'example.com', name: 'Example App' },
});
```

***

### compose()

```ts
function compose(handlers: Handler[], options: ComposeOptions): Handler;
```

Defined in: [src/server/Handler.ts:309](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Handler.ts#L309)

Composes multiple handlers into a single unified handler.

This function allows you to combine multiple specialized handlers (keyManager, custom handlers, etc.)
into a single handler. Requests are routed to each handler in order until one returns a
non-404 response. This enables building complex server setups with multiple services.

Handlers are tried in the order provided. The first handler that returns a response
with a status other than 404 is used. If all handlers return 404, the composed handler
also returns 404.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `handlers` | `Handler`[] | Array of Handler instances to compose |
| `options` | [`ComposeOptions`](../README.md#composeoptions) | Configuration options for the composed handler |

#### Returns

`Handler`

A single Handler instance that routes to the provided handlers

#### Example

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const keyManager = Handler.keyManager({ kv: Kv.memory() });
const customHandler = Handler.from();
customHandler.get('/health', () => Response.json({ status: 'ok' }));

const handler = Handler.compose([keyManager, customHandler], {
  path: '/api',
  headers: { 'X-API-Version': '1.0' }
});

// In Express.js:
app.use(handler.listener);
```
