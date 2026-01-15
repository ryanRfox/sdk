[**@radiustechsystems/sdk**](../../../../README.md)

***

[@radiustechsystems/sdk](../../../../README.md) / [server](../../../README.md) / [Kv](../README.md) / cloudflare

# cloudflare

Cloudflare Workers KV namespace interface.

Represents the API of a Cloudflare Workers KV namespace binding, which is what you
receive when binding a KV namespace in your Cloudflare Worker environment.

The `cloudflare()` adapter function converts this interface to the standard Kv interface
by mapping `put` to `set`.

## Type Aliases

### Parameters

```ts
type Parameters = {
  get: <value>(key: string) => Promise<value>;
  put: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
};
```

Defined in: [src/server/Kv.ts:160](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L160)

The Cloudflare KV namespace binding interface.

#### Template

The type of values stored

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="get"></a> `get` | \<`value`\>(`key`: `string`) => `Promise`\<`value`\> | Retrieve a value from the KV store. | [src/server/Kv.ts:165](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L165) |
| <a id="put"></a> `put` | (`key`: `string`, `value`: `any`) => `Promise`\<`void`\> | Store a value in the KV store. Called `put` in the native Cloudflare API. | [src/server/Kv.ts:170](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L170) |
| <a id="delete"></a> `delete` | (`key`: `string`) => `Promise`\<`void`\> | Delete a value from the KV store. | [src/server/Kv.ts:174](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/server/Kv.ts#L174) |
