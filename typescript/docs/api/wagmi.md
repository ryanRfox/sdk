[**@radiustechsystems/sdk**](README.md)

***

[@radiustechsystems/sdk](README.md) / wagmi

# wagmi

Radius wagmi integration

Provides wagmi connectors and utilities for Radius chain.

## Example

```typescript
import { createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';

const config = createConfig({
  chains: [radiusTestnet],
  connectors: [privateKeyConnector()],
  transports: {
    [radiusTestnet.id]: http(),
  },
});
```

## Interfaces

### PrivateKeyConnectorOptions

Defined in: [src/wagmi/connector.ts:182](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/wagmi/connector.ts#L182)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="account"></a> `account?` | \{ \} | Pre-configured account to use | [src/wagmi/connector.ts:186](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/wagmi/connector.ts#L186) |
| <a id="generateonconnect"></a> `generateOnConnect?` | `boolean` | Generate a new account on connect if none exists WARNING: Only use for development | [src/wagmi/connector.ts:192](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/wagmi/connector.ts#L192) |

## Functions

### privateKeyConnector()

```ts
function privateKeyConnector(options: PrivateKeyConnectorOptions): CreateConnectorFn;
```

Defined in: [src/wagmi/connector.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/wagmi/connector.ts#L34)

Development-only connector for EOA with private key.

WARNING: NOT RECOMMENDED FOR PRODUCTION USAGE.
This connector stores private keys in browser storage.
Use only for development and testing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`PrivateKeyConnectorOptions`](#privatekeyconnectoroptions) |

#### Returns

`CreateConnectorFn`

#### Example

```typescript
import { createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';

const config = createConfig({
  chains: [radiusTestnet],
  connectors: [privateKeyConnector()],
  transports: {
    [radiusTestnet.id]: http(),
  },
});
```
