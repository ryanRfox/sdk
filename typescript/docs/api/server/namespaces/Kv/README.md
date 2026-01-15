[**@radiustechsystems/sdk**](../../../README.md)

***

[@radiustechsystems/sdk](../../../README.md) / [server](../../README.md) / Kv

# Kv

## Namespaces

| Namespace | Description |
| ------ | ------ |
| [cloudflare](namespaces/cloudflare.md) | Cloudflare Workers KV namespace interface. |

## Type Aliases

### Kv

```ts
type Kv = {
  get: <value>(key: string) => Promise<value>;
  set: (key: string, value: unknown) => Promise<void>;
  delete: (key: string) => Promise<void>;
};
```

Defined in: [src/server/Kv.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L12)

A key-value store interface used by server handlers.

This type provides a unified abstraction for different KV store implementations,
allowing handlers to work with various storage backends. Implementations include:
- `Kv.memory()` - In-memory JavaScript Map
- `Kv.cloudflare()` - Cloudflare Workers KV namespace
- Custom implementations via `Kv.from()`

All operations are asynchronous and return Promises.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="get"></a> `get` | \<`value`\>(`key`: `string`) => `Promise`\<`value`\> | Retrieve a value from the store. | [src/server/Kv.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L20) |
| <a id="set"></a> `set` | (`key`: `string`, `value`: `unknown`) => `Promise`\<`void`\> | Set a value in the store. | [src/server/Kv.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L28) |
| <a id="delete"></a> `delete` | (`key`: `string`) => `Promise`\<`void`\> | Delete a value from the store. | [src/server/Kv.ts:35](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L35) |

## Functions

### from()

```ts
function from<T>(kv: T): T;
```

Defined in: [src/server/Kv.ts:64](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L64)

Wraps a KV store that already implements the Kv interface.

This is an identity/type-assertion function useful for:
- Wrapping custom KV implementations to ensure type safety
- Creating type-safe adapters for third-party KV stores
- Explicitly marking a store as implementing the Kv interface

The function simply returns its input after type validation.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* [`Kv`](#kv) | The KV store type (must extend Kv) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `kv` | `T` | The KV store instance implementing the Kv interface |

#### Returns

`T`

The same KV store instance, typed as T

#### Example

```typescript
import { Kv } from '@radiustechsystems/sdk/server';

// Wrap a custom KV implementation
const myStore = Kv.from({
  get: async (key) => myBackend.retrieve(key),
  set: async (key, value) => myBackend.store(key, value),
  delete: async (key) => myBackend.remove(key),
});
```

***

### memory()

```ts
function memory(): Kv;
```

Defined in: [src/server/Kv.ts:94](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L94)

Creates an in-memory KV store backed by a JavaScript Map.

Useful for development, testing, and applications that don't require persistent storage.
All data is stored in the Node.js process memory and will be cleared on restart.

Use this for:
- Local development and testing
- Temporary credential storage in short-lived processes
- Single-instance deployments without persistence requirements

For production deployments requiring persistent storage, use `Kv.cloudflare()` or
implement a custom adapter with a persistent backend.

#### Returns

[`Kv`](#kv)

A new in-memory KV store instance

#### Example

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const keyManager = Handler.keyManager({
  kv: Kv.memory(),
  path: '/api/credentials',
});
```

***

### cloudflare()

```ts
function cloudflare(kv: Parameters): Kv;
```

Defined in: [src/server/Kv.ts:137](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L137)

Creates a Cloudflare Workers KV store adapter.

Wraps a Cloudflare Workers KV namespace binding to conform to the standard Kv interface.
The adapter normalizes the Cloudflare API (which uses `put`) to the standard interface (which uses `set`).

Use this in Cloudflare Workers environments where you have access to a KV namespace binding.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `kv` | [`Parameters`](namespaces/cloudflare.md#parameters) | A Cloudflare KV namespace binding (typically passed via environment variables) |

#### Returns

[`Kv`](#kv)

A KV store instance that uses the Cloudflare KV namespace

#### Example

```typescript
// In a Cloudflare Worker:
import { Handler, Kv } from '@radiustechsystems/sdk/server';

export default {
  fetch: async (request, env) => {
    const keyManager = Handler.keyManager({
      kv: Kv.cloudflare(env.RADIUS_KV),
      path: '/api/credentials',
    });

    return keyManager.fetch(request);
  },
};
```
