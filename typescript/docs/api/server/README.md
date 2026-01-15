[**@radiustechsystems/sdk**](../README.md)

***

[@radiustechsystems/sdk](../README.md) / server

# server

## Namespaces

| Namespace | Description |
| ------ | ------ |
| [Handler](namespaces/Handler.md) | - |
| [Kv](namespaces/Kv/README.md) | - |

## Classes

### ServerError

Defined in: [src/server/errors.ts:24](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L24)

Base class for all server-related errors.

All server errors inherit from this class, providing consistent error handling
and metadata across the Radius server implementation. Extends the base RadiusError.

#### Example

```typescript
import { ServerError } from '@radiustechsystems/sdk/server';

try {
  // handler logic
} catch (error) {
  if (error instanceof ServerError) {
    console.error('Server error:', error.message);
  }
}
```

#### Extends

- [`RadiusError`](../index.md#radiuserror)

#### Extended by

- [`InvalidRequestError`](#invalidrequesterror)
- [`MethodNotSupportedError`](#methodnotsupportederror)
- [`ChallengeExpiredError`](#challengeexpirederror)
- [`CredentialNotFoundError`](#credentialnotfounderror)

#### Constructors

##### Constructor

```ts
new ServerError(message: string, options?: RadiusErrorOptions): ServerError;
```

Defined in: [src/server/errors.ts:25](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L25)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options?` | [`RadiusErrorOptions`](../index.md#radiuserroroptions) |

###### Returns

[`ServerError`](#servererror)

###### Overrides

[`RadiusError`](../index.md#radiuserror).[`constructor`](../index.md#constructor-12)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage"></a> `shortMessage` | `readonly` | `string` | Short, human-readable error description | [`RadiusError`](../index.md#radiuserror).[`shortMessage`](../index.md#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details"></a> `details?` | `readonly` | `string` | Detailed error information | [`RadiusError`](../index.md#radiuserror).[`details`](../index.md#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath"></a> `docsPath?` | `readonly` | `string` | Documentation path for this error type | [`RadiusError`](../index.md#radiuserror).[`docsPath`](../index.md#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause"></a> `cause?` | `readonly` | `unknown` | The underlying cause of this error | [`RadiusError`](../index.md#radiuserror).[`cause`](../index.md#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional metadata | [`RadiusError`](../index.md#radiuserror).[`meta`](../index.md#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

#### Methods

##### walk()

```ts
walk(fn?: (err: unknown) => boolean): unknown;
```

Defined in: [src/errors/base.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L87)

Walk the error cause chain.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn?` | (`err`: `unknown`) => `boolean` | Optional predicate function. If provided, returns the first error that matches the predicate. If not provided, returns the deepest cause. |

###### Returns

`unknown`

The matched error, or null if no match found

###### Example

```typescript
// Get deepest cause
const root = error.walk();

// Find specific error type
const txError = error.walk(e => e instanceof TransactionFailedError);
```

###### Inherited from

[`RadiusError`](../index.md#radiuserror).[`walk`](../index.md#walk-10)

***

### InvalidRequestError

Defined in: [src/server/errors.ts:55](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L55)

Error thrown when a request is malformed or invalid.

Indicates that the incoming HTTP request does not conform to the expected format,
is missing required fields, or contains invalid parameter values. This error is typically
returned as an HTTP 400 Bad Request.

#### Param

A detailed error message describing what is invalid

#### Param

Additional error options and metadata

#### Example

```typescript
import { InvalidRequestError } from '@radiustechsystems/sdk/server';

if (!request.body.credential) {
  throw new InvalidRequestError('Missing required field: credential');
}

// Returns to client as:
// { error: 'Invalid request: Missing required field: credential' }
```

#### Extends

- [`ServerError`](#servererror)

#### Constructors

##### Constructor

```ts
new InvalidRequestError(message: string, options?: RadiusErrorOptions): InvalidRequestError;
```

Defined in: [src/server/errors.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L56)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options?` | [`RadiusErrorOptions`](../index.md#radiuserroroptions) |

###### Returns

[`InvalidRequestError`](#invalidrequesterror)

###### Overrides

[`ServerError`](#servererror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-1"></a> `shortMessage` | `readonly` | `string` | Short, human-readable error description | [`ServerError`](#servererror).[`shortMessage`](#shortmessage) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-1"></a> `details?` | `readonly` | `string` | Detailed error information | [`ServerError`](#servererror).[`details`](#details) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-1"></a> `docsPath?` | `readonly` | `string` | Documentation path for this error type | [`ServerError`](#servererror).[`docsPath`](#docspath) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-1"></a> `cause?` | `readonly` | `unknown` | The underlying cause of this error | [`ServerError`](#servererror).[`cause`](#cause) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-1"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional metadata | [`ServerError`](#servererror).[`meta`](#meta) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

#### Methods

##### walk()

```ts
walk(fn?: (err: unknown) => boolean): unknown;
```

Defined in: [src/errors/base.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L87)

Walk the error cause chain.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn?` | (`err`: `unknown`) => `boolean` | Optional predicate function. If provided, returns the first error that matches the predicate. If not provided, returns the deepest cause. |

###### Returns

`unknown`

The matched error, or null if no match found

###### Example

```typescript
// Get deepest cause
const root = error.walk();

// Find specific error type
const txError = error.walk(e => e instanceof TransactionFailedError);
```

###### Inherited from

[`ServerError`](#servererror).[`walk`](#walk)

***

### MethodNotSupportedError

Defined in: [src/server/errors.ts:90](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L90)

Error thrown when a requested RPC or HTTP method is not supported.

Indicates that the server does not implement the requested RPC method or HTTP verb.
This error is typically returned as an HTTP 405 Method Not Allowed or JSON-RPC -32601.

#### Param

The name of the unsupported method (e.g., 'eth_call', 'DELETE')

#### Param

Additional error options and metadata

#### Example

```typescript
import { MethodNotSupportedError } from '@radiustechsystems/sdk/server';

const supportedMethods = ['eth_sendRawTransaction'];

if (!supportedMethods.includes(jsonRpcRequest.method)) {
  throw new MethodNotSupportedError(jsonRpcRequest.method);
}

// Returns to client as:
// { error: { code: -32601, message: 'Method not supported: eth_call' } }
```

#### Extends

- [`ServerError`](#servererror)

#### Constructors

##### Constructor

```ts
new MethodNotSupportedError(method: string, options?: RadiusErrorOptions): MethodNotSupportedError;
```

Defined in: [src/server/errors.ts:91](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L91)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `method` | `string` |
| `options?` | [`RadiusErrorOptions`](../index.md#radiuserroroptions) |

###### Returns

[`MethodNotSupportedError`](#methodnotsupportederror)

###### Overrides

[`ServerError`](#servererror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-2"></a> `shortMessage` | `readonly` | `string` | Short, human-readable error description | [`ServerError`](#servererror).[`shortMessage`](#shortmessage) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-2"></a> `details?` | `readonly` | `string` | Detailed error information | [`ServerError`](#servererror).[`details`](#details) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-2"></a> `docsPath?` | `readonly` | `string` | Documentation path for this error type | [`ServerError`](#servererror).[`docsPath`](#docspath) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-2"></a> `cause?` | `readonly` | `unknown` | The underlying cause of this error | [`ServerError`](#servererror).[`cause`](#cause) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-2"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional metadata | [`ServerError`](#servererror).[`meta`](#meta) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

#### Methods

##### walk()

```ts
walk(fn?: (err: unknown) => boolean): unknown;
```

Defined in: [src/errors/base.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L87)

Walk the error cause chain.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn?` | (`err`: `unknown`) => `boolean` | Optional predicate function. If provided, returns the first error that matches the predicate. If not provided, returns the deepest cause. |

###### Returns

`unknown`

The matched error, or null if no match found

###### Example

```typescript
// Get deepest cause
const root = error.walk();

// Find specific error type
const txError = error.walk(e => e instanceof TransactionFailedError);
```

###### Inherited from

[`ServerError`](#servererror).[`walk`](#walk)

***

### ChallengeExpiredError

Defined in: [src/server/errors.ts:126](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L126)

Error thrown when a WebAuthn challenge has expired or is invalid.

Indicates that the challenge used for authentication is no longer valid. This can happen when:
- The challenge was issued but has passed its TTL
- The challenge was already consumed in a previous authentication
- The challenge was revoked by the server

The client should obtain a new challenge from the server.

#### Param

Additional error options and metadata

#### Example

```typescript
import { ChallengeExpiredError } from '@radiustechsystems/sdk/server';

const challenge = await kv.get(`challenge:${challengeId}`);
if (!challenge) {
  throw new ChallengeExpiredError();
}

// Returns to client as:
// { error: 'Challenge expired: Challenge expired or invalid' }
```

#### Extends

- [`ServerError`](#servererror)

#### Constructors

##### Constructor

```ts
new ChallengeExpiredError(options?: RadiusErrorOptions): ChallengeExpiredError;
```

Defined in: [src/server/errors.ts:127](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L127)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | [`RadiusErrorOptions`](../index.md#radiuserroroptions) |

###### Returns

[`ChallengeExpiredError`](#challengeexpirederror)

###### Overrides

[`ServerError`](#servererror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-3"></a> `shortMessage` | `readonly` | `string` | Short, human-readable error description | [`ServerError`](#servererror).[`shortMessage`](#shortmessage) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-3"></a> `details?` | `readonly` | `string` | Detailed error information | [`ServerError`](#servererror).[`details`](#details) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-3"></a> `docsPath?` | `readonly` | `string` | Documentation path for this error type | [`ServerError`](#servererror).[`docsPath`](#docspath) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-3"></a> `cause?` | `readonly` | `unknown` | The underlying cause of this error | [`ServerError`](#servererror).[`cause`](#cause) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-3"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional metadata | [`ServerError`](#servererror).[`meta`](#meta) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

#### Methods

##### walk()

```ts
walk(fn?: (err: unknown) => boolean): unknown;
```

Defined in: [src/errors/base.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L87)

Walk the error cause chain.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn?` | (`err`: `unknown`) => `boolean` | Optional predicate function. If provided, returns the first error that matches the predicate. If not provided, returns the deepest cause. |

###### Returns

`unknown`

The matched error, or null if no match found

###### Example

```typescript
// Get deepest cause
const root = error.walk();

// Find specific error type
const txError = error.walk(e => e instanceof TransactionFailedError);
```

###### Inherited from

[`ServerError`](#servererror).[`walk`](#walk)

***

### CredentialNotFoundError

Defined in: [src/server/errors.ts:160](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L160)

Error thrown when a requested WebAuthn credential cannot be found.

Indicates that a credential with the requested ID does not exist in the system
or has been deleted. This error is typically returned as HTTP 404 Not Found.

#### Param

The ID of the credential that was not found

#### Param

Additional error options and metadata

#### Example

```typescript
import { CredentialNotFoundError } from '@radiustechsystems/sdk/server';

const publicKey = await kv.get(`credential:${credentialId}`);
if (!publicKey) {
  throw new CredentialNotFoundError(credentialId);
}

// Returns to client as:
// { error: 'Credential not found: abc123def456', status: 404 }
```

#### Extends

- [`ServerError`](#servererror)

#### Constructors

##### Constructor

```ts
new CredentialNotFoundError(credentialId: string, options?: RadiusErrorOptions): CredentialNotFoundError;
```

Defined in: [src/server/errors.ts:161](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/errors.ts#L161)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `credentialId` | `string` |
| `options?` | [`RadiusErrorOptions`](../index.md#radiuserroroptions) |

###### Returns

[`CredentialNotFoundError`](#credentialnotfounderror)

###### Overrides

[`ServerError`](#servererror).[`constructor`](#constructor)

#### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-4"></a> `shortMessage` | `readonly` | `string` | Short, human-readable error description | [`ServerError`](#servererror).[`shortMessage`](#shortmessage) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-4"></a> `details?` | `readonly` | `string` | Detailed error information | [`ServerError`](#servererror).[`details`](#details) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-4"></a> `docsPath?` | `readonly` | `string` | Documentation path for this error type | [`ServerError`](#servererror).[`docsPath`](#docspath) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-4"></a> `cause?` | `readonly` | `unknown` | The underlying cause of this error | [`ServerError`](#servererror).[`cause`](#cause) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-4"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional metadata | [`ServerError`](#servererror).[`meta`](#meta) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

#### Methods

##### walk()

```ts
walk(fn?: (err: unknown) => boolean): unknown;
```

Defined in: [src/errors/base.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L87)

Walk the error cause chain.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn?` | (`err`: `unknown`) => `boolean` | Optional predicate function. If provided, returns the first error that matches the predicate. If not provided, returns the deepest cause. |

###### Returns

`unknown`

The matched error, or null if no match found

###### Example

```typescript
// Get deepest cause
const root = error.walk();

// Find specific error type
const txError = error.walk(e => e instanceof TransactionFailedError);
```

###### Inherited from

[`ServerError`](#servererror).[`walk`](#walk)

## Type Aliases

### HandlerOptions

```ts
type HandlerOptions = RouterOptions & {
  headers?: Headers | Record<string, string>;
};
```

Defined in: [src/server/types.ts:41](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L41)

Base configuration options for all handler types.

Extends Remix RouterOptions with additional options for common HTTP needs.
These options are inherited by all specialized handler types (keyManager, etc.).

#### Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `headers?` | `Headers` \| `Record`\<`string`, `string`\> | Optional HTTP headers to add to all responses. Can be provided as a native Headers object or a plain object with string keys/values. Useful for adding CORS headers, custom API version headers, or other global headers. **Example** `const handler = Handler.from({ headers: { 'X-API-Version': '1.0', 'Access-Control-Allow-Origin': '*', } });` | [src/server/types.ts:58](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L58) |

***

### KeyManagerOptions

```ts
type KeyManagerOptions = HandlerOptions & {
  kv: Kv;
  path?: string;
  rp?:   | string
     | {
     id: string;
     name?: string;
   };
};
```

Defined in: [src/server/types.ts:67](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L67)

Configuration options for the keyManager handler.

Configures a WebAuthn-based credential management service for secure key storage and retrieval.
The handler manages WebAuthn challenges and public key credentials through a KV store.

#### Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `kv` | [`Kv`](namespaces/Kv/README.md#kv) | The KV store to use for persisting credentials and challenges. All WebAuthn credentials and one-time challenges are stored in this KV instance. For production, use a persistent store like Kv.cloudflare(). For development, Kv.memory() is sufficient. **Example** `import { Kv } from '@radiustechsystems/sdk/server'; const kv = Kv.memory(); // or Kv.cloudflare(env.RADIUS_KV)` | [src/server/types.ts:81](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L81) |
| `path?` | `string` | The path prefix for the key manager endpoints. Defaults to '' (empty string). All endpoints will be registered relative to this path. Example: with path='/api/creds', endpoints become /api/creds/challenge, /api/creds/:id | [src/server/types.ts:88](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L88) |
| `rp?` | \| `string` \| \{ `id`: `string`; `name?`: `string`; \} | The relying party configuration for WebAuthn. This is passed to clients during the WebAuthn challenge request. Can be: - A simple string (used as both id and name) - An object with `id` and optional `name` Should typically be your application's domain or identifier. **Example** `// Simple string form: rp: 'example.com' // Object form with explicit name: rp: { id: 'example.com', name: 'My App' }` | [src/server/types.ts:107](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L107) |

***

### ComposeOptions

```ts
type ComposeOptions = HandlerOptions & {
  path?: string;
};
```

Defined in: [src/server/types.ts:122](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L122)

Configuration options for composing multiple handlers.

Allows you to combine and mount multiple handler instances under a single base path,
creating a unified HTTP service from multiple specialized handlers.

#### Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `path?` | `string` | The base path prefix to mount all composed handlers under. Defaults to '/' (root). Requests must match this path prefix to be routed to the composed handlers. The path is stripped before routing to individual handlers. **Example** `// Mount handlers under /api: const handler = Handler.compose([keyManager, customHandler], { path: '/api' }); // Request to /api/challenge reaches the keyManager handler // Request to /api/health reaches the customHandler // Request to /other returns 404` | [src/server/types.ts:140](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/types.ts#L140) |
