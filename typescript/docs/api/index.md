[**@radiustechsystems/sdk**](README.md)

***

[@radiustechsystems/sdk](README.md) / index

# index

Radius TypeScript SDK v2

A viem-based SDK for interacting with the Radius platform.

## Classes

### SignerNotFoundError

Defined in: [src/errors/account.ts:22](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L22)

Error thrown when a signer is required but not available.

#### Example

```typescript
try {
  // Attempting to send without an account configured
  await walletClient.sendTransaction({ to, value });
} catch (error) {
  if (error instanceof SignerNotFoundError) {
    console.log('Please connect a wallet');
  }
}
```

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new SignerNotFoundError(message: string, options: RadiusErrorOptions): SignerNotFoundError;
```

Defined in: [src/errors/account.ts:25](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L25)

###### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `'Signer is required'` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) | `{}` |

###### Returns

[`SignerNotFoundError`](#signernotfounderror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-2"></a> `name` | `readonly` | `"SignerNotFoundError"` | `'SignerNotFoundError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/account.ts:23](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L23) |
| <a id="meta"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |

***

### InsufficientBalanceError

Defined in: [src/errors/account.ts:47](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L47)

Error thrown when account balance is insufficient for an operation.

#### Example

```typescript
try {
  await walletClient.sendTransaction({ to, value });
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.log(`Need ${error.required}, have ${error.balance}`);
  }
}
```

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new InsufficientBalanceError(message: string, options: RadiusErrorOptions & {
  address?: `0x${string}`;
  balance?: bigint;
  required?: bigint;
}): InsufficientBalanceError;
```

Defined in: [src/errors/account.ts:57](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L57)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `address?`: `` `0x${string}` ``; `balance?`: `bigint`; `required?`: `bigint`; \} |

###### Returns

[`InsufficientBalanceError`](#insufficientbalanceerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-3"></a> `name` | `readonly` | `"InsufficientBalanceError"` | `'InsufficientBalanceError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/account.ts:48](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L48) |
| <a id="address"></a> `address?` | `readonly` | `` `0x${string}` `` | `undefined` | The account address | - | - | [src/errors/account.ts:51](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L51) |
| <a id="balance"></a> `balance?` | `readonly` | `bigint` | `undefined` | Current balance (in wei) | - | - | [src/errors/account.ts:53](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L53) |
| <a id="required"></a> `required?` | `readonly` | `bigint` | `undefined` | Required balance (in wei) | - | - | [src/errors/account.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L55) |
| <a id="meta-1"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |

***

### SigningError

Defined in: [src/errors/account.ts:78](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L78)

Error thrown when signing a message or transaction fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new SigningError(message: string, options: RadiusErrorOptions): SigningError;
```

Defined in: [src/errors/account.ts:81](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L81)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`SigningError`](#signingerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-4"></a> `name` | `readonly` | `"SigningError"` | `'SigningError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/account.ts:79](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L79) |
| <a id="meta-2"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |

***

### InvalidPrivateKeyError

Defined in: [src/errors/account.ts:92](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L92)

Error thrown when an invalid private key is provided.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new InvalidPrivateKeyError(message: string, options: RadiusErrorOptions): InvalidPrivateKeyError;
```

Defined in: [src/errors/account.ts:95](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L95)

###### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `'Invalid private key'` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) | `{}` |

###### Returns

[`InvalidPrivateKeyError`](#invalidprivatekeyerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-5"></a> `name` | `readonly` | `"InvalidPrivateKeyError"` | `'InvalidPrivateKeyError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/account.ts:93](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L93) |
| <a id="meta-3"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |

***

### InvalidAddressError

Defined in: [src/errors/account.ts:106](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L106)

Error thrown when address validation fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new InvalidAddressError(message: string, options: RadiusErrorOptions & {
  invalidAddress?: string;
}): InvalidAddressError;
```

Defined in: [src/errors/account.ts:112](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L112)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `invalidAddress?`: `string`; \} |

###### Returns

[`InvalidAddressError`](#invalidaddresserror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-6"></a> `name` | `readonly` | `"InvalidAddressError"` | `'InvalidAddressError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/account.ts:107](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L107) |
| <a id="invalidaddress"></a> `invalidAddress?` | `readonly` | `string` | `undefined` | The invalid address value | - | - | [src/errors/account.ts:110](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/account.ts#L110) |
| <a id="meta-4"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |

***

### RadiusError

Defined in: [src/errors/base.ts:53](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L53)

Base error class for all Radius SDK errors.

Extends viem's BaseError for ecosystem compatibility. This means:
- `error instanceof BaseError` from viem will catch Radius errors
- Compatible with wagmi error handling
- Inherits viem's error formatting and walk() method

#### Example

```typescript
import { BaseError } from 'viem';

try {
  await walletClient.sendTransaction({ to, value });
} catch (error) {
  if (error instanceof RadiusError) {
    console.log(error.shortMessage); // Quick description
    console.log(error.details);      // Full details
    console.log(error.docsPath);     // Link to docs
  }
  // Also works with viem's BaseError check
  if (error instanceof BaseError) {
    console.log('Caught viem-compatible error');
  }
}
```

#### Extends

- `BaseError`

#### Extended by

- [`InsufficientBalanceError`](#insufficientbalanceerror)
- [`InvalidAddressError`](#invalidaddresserror)
- [`InvalidPrivateKeyError`](#invalidprivatekeyerror)
- [`SignerNotFoundError`](#signernotfounderror)
- [`SigningError`](#signingerror)
- [`AbiError`](#abierror)
- [`ContractCallError`](#contractcallerror)
- [`ContractDeploymentError`](#contractdeploymenterror)
- [`MissingAbiError`](#missingabierror)
- [`BatchTransactionError`](#batchtransactionerror)
- [`GasEstimationError`](#gasestimationerror)
- [`NonceError`](#nonceerror)
- [`TransactionFailedError`](#transactionfailederror)
- [`TransactionRevertedError`](#transactionrevertederror)
- [`TransactionTimeoutError`](#transactiontimeouterror)

#### Constructors

##### Constructor

```ts
new RadiusError(shortMessage: string, options: RadiusErrorOptions): RadiusError;
```

Defined in: [src/errors/base.ts:59](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L59)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `shortMessage` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`RadiusError`](#radiuserror)

###### Overrides

```ts
BaseError.constructor
```

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-6"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-7"></a> `name` | `public` | `string` | `'RadiusError'` | - | `BaseError.name` | [src/errors/base.ts:57](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L57) |

***

### ContractCallError

Defined in: [src/errors/contract.ts:10](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L10)

Error thrown when a contract call fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new ContractCallError(message: string, options: RadiusErrorOptions & {
  contractAddress?: `0x${string}`;
  functionName?: string;
  args?: readonly unknown[];
}): ContractCallError;
```

Defined in: [src/errors/contract.ts:20](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L20)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `contractAddress?`: `` `0x${string}` ``; `functionName?`: `string`; `args?`: readonly `unknown`[]; \} |

###### Returns

[`ContractCallError`](#contractcallerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-7"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-8"></a> `name` | `readonly` | `"ContractCallError"` | `'ContractCallError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/contract.ts:11](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L11) |
| <a id="contractaddress"></a> `contractAddress?` | `readonly` | `` `0x${string}` `` | `undefined` | The contract address | - | - | [src/errors/contract.ts:14](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L14) |
| <a id="functionname"></a> `functionName?` | `readonly` | `string` | `undefined` | The function name that was called | - | - | [src/errors/contract.ts:16](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L16) |
| <a id="args"></a> `args?` | `readonly` | readonly `unknown`[] | `undefined` | The arguments passed to the function | - | - | [src/errors/contract.ts:18](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L18) |

***

### ContractDeploymentError

Defined in: [src/errors/contract.ts:41](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L41)

Error thrown when contract deployment fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new ContractDeploymentError(message: string, options: RadiusErrorOptions & {
  bytecode?: `0x${string}`;
  constructorArgs?: readonly unknown[];
}): ContractDeploymentError;
```

Defined in: [src/errors/contract.ts:49](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L49)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `bytecode?`: `` `0x${string}` ``; `constructorArgs?`: readonly `unknown`[]; \} |

###### Returns

[`ContractDeploymentError`](#contractdeploymenterror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-8"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-9"></a> `name` | `readonly` | `"ContractDeploymentError"` | `'ContractDeploymentError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/contract.ts:42](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L42) |
| <a id="bytecode"></a> `bytecode?` | `readonly` | `` `0x${string}` `` | `undefined` | The contract bytecode | - | - | [src/errors/contract.ts:45](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L45) |
| <a id="constructorargs"></a> `constructorArgs?` | `readonly` | readonly `unknown`[] | `undefined` | The constructor arguments | - | - | [src/errors/contract.ts:47](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L47) |

***

### AbiError

Defined in: [src/errors/contract.ts:68](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L68)

Error thrown when ABI encoding/decoding fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new AbiError(message: string, options: RadiusErrorOptions): AbiError;
```

Defined in: [src/errors/contract.ts:71](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L71)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`AbiError`](#abierror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-9"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-10"></a> `name` | `readonly` | `"AbiError"` | `'AbiError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/contract.ts:69](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L69) |

***

### MissingAbiError

Defined in: [src/errors/contract.ts:82](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L82)

Error thrown when a required contract ABI is missing.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new MissingAbiError(message: string, options: RadiusErrorOptions): MissingAbiError;
```

Defined in: [src/errors/contract.ts:85](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L85)

###### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `'Contract ABI is required'` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) | `{}` |

###### Returns

[`MissingAbiError`](#missingabierror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-10"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-11"></a> `name` | `readonly` | `"MissingAbiError"` | `'MissingAbiError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/contract.ts:83](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/contract.ts#L83) |

***

### TransactionFailedError

Defined in: [src/errors/transaction.ts:22](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L22)

Error thrown when a transaction fails to execute.

#### Example

```typescript
try {
  await walletClient.sendTransaction({ to, value });
} catch (error) {
  if (error instanceof TransactionFailedError) {
    console.log('Transaction failed:', error.transactionHash);
    console.log('Reason:', error.shortMessage);
  }
}
```

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new TransactionFailedError(message: string, options: RadiusErrorOptions & {
  transactionHash?: `0x${string}`;
  reason?: string;
}): TransactionFailedError;
```

Defined in: [src/errors/transaction.ts:30](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L30)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `transactionHash?`: `` `0x${string}` ``; `reason?`: `string`; \} |

###### Returns

[`TransactionFailedError`](#transactionfailederror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-11"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-12"></a> `name` | `readonly` | `"TransactionFailedError"` | `'TransactionFailedError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/transaction.ts:23](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L23) |
| <a id="transactionhash"></a> `transactionHash?` | `readonly` | `` `0x${string}` `` | `undefined` | The transaction hash (if available) | - | - | [src/errors/transaction.ts:26](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L26) |
| <a id="reason"></a> `reason?` | `readonly` | `string` | `undefined` | The reason for failure | - | - | [src/errors/transaction.ts:28](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L28) |

***

### TransactionRevertedError

Defined in: [src/errors/transaction.ts:49](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L49)

Error thrown when a transaction reverts on-chain.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new TransactionRevertedError(message: string, options: RadiusErrorOptions & {
  transactionHash?: `0x${string}`;
  reason?: string;
  revertReason?: string;
  revertData?: `0x${string}`;
}): TransactionRevertedError;
```

Defined in: [src/errors/transaction.ts:61](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L61)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `transactionHash?`: `` `0x${string}` ``; `reason?`: `string`; `revertReason?`: `string`; `revertData?`: `` `0x${string}` ``; \} |

###### Returns

[`TransactionRevertedError`](#transactionrevertederror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-12"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-13"></a> `name` | `readonly` | `"TransactionRevertedError"` | `'TransactionRevertedError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/transaction.ts:50](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L50) |
| <a id="transactionhash-1"></a> `transactionHash?` | `readonly` | `` `0x${string}` `` | `undefined` | The transaction hash (if available) | - | - | [src/errors/transaction.ts:53](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L53) |
| <a id="reason-1"></a> `reason?` | `readonly` | `string` | `undefined` | The reason for failure | - | - | [src/errors/transaction.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L55) |
| <a id="revertreason"></a> `revertReason?` | `readonly` | `string` | `undefined` | The revert reason (decoded if available) | - | - | [src/errors/transaction.ts:57](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L57) |
| <a id="revertdata"></a> `revertData?` | `readonly` | `` `0x${string}` `` | `undefined` | The raw revert data | - | - | [src/errors/transaction.ts:59](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L59) |

***

### GasEstimationError

Defined in: [src/errors/transaction.ts:84](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L84)

Error thrown when gas estimation fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new GasEstimationError(message: string, options: RadiusErrorOptions & {
  to?: `0x${string}`;
  data?: `0x${string}`;
}): GasEstimationError;
```

Defined in: [src/errors/transaction.ts:92](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L92)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `to?`: `` `0x${string}` ``; `data?`: `` `0x${string}` ``; \} |

###### Returns

[`GasEstimationError`](#gasestimationerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-13"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-14"></a> `name` | `readonly` | `"GasEstimationError"` | `'GasEstimationError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/transaction.ts:85](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L85) |
| <a id="to"></a> `to?` | `readonly` | `` `0x${string}` `` | `undefined` | The address being called | - | - | [src/errors/transaction.ts:88](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L88) |
| <a id="data"></a> `data?` | `readonly` | `` `0x${string}` `` | `undefined` | The call data | - | - | [src/errors/transaction.ts:90](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L90) |

***

### NonceError

Defined in: [src/errors/transaction.ts:111](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L111)

Error thrown when transaction nonce is invalid.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new NonceError(message: string, options: RadiusErrorOptions & {
  nonce?: number;
  expectedNonce?: number;
}): NonceError;
```

Defined in: [src/errors/transaction.ts:119](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L119)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `nonce?`: `number`; `expectedNonce?`: `number`; \} |

###### Returns

[`NonceError`](#nonceerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-14"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-15"></a> `name` | `readonly` | `"NonceError"` | `'NonceError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/transaction.ts:112](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L112) |
| <a id="nonce"></a> `nonce?` | `readonly` | `number` | `undefined` | The nonce that was used | - | - | [src/errors/transaction.ts:115](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L115) |
| <a id="expectednonce"></a> `expectedNonce?` | `readonly` | `number` | `undefined` | The expected nonce | - | - | [src/errors/transaction.ts:117](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L117) |

***

### TransactionTimeoutError

Defined in: [src/errors/transaction.ts:138](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L138)

Error thrown when a transaction times out waiting for confirmation.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new TransactionTimeoutError(message: string, options: RadiusErrorOptions & {
  transactionHash?: `0x${string}`;
  timeout?: number;
}): TransactionTimeoutError;
```

Defined in: [src/errors/transaction.ts:146](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L146)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `transactionHash?`: `` `0x${string}` ``; `timeout?`: `number`; \} |

###### Returns

[`TransactionTimeoutError`](#transactiontimeouterror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-15"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-16"></a> `name` | `readonly` | `"TransactionTimeoutError"` | `'TransactionTimeoutError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/transaction.ts:139](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L139) |
| <a id="transactionhash-2"></a> `transactionHash?` | `readonly` | `` `0x${string}` `` | `undefined` | The transaction hash | - | - | [src/errors/transaction.ts:142](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L142) |
| <a id="timeout-1"></a> `timeout?` | `readonly` | `number` | `undefined` | How long we waited (in ms) | - | - | [src/errors/transaction.ts:144](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L144) |

***

### BatchTransactionError

Defined in: [src/errors/transaction.ts:195](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L195)

Error thrown when one or more transactions in a batch fail.

#### Example

```typescript
try {
  await walletClient.sendTransactionBatch({ transactions });
} catch (error) {
  if (error instanceof BatchTransactionError) {
    console.log('Batch failed:', error.message);
    error.results.forEach((r, i) => {
      if (r.error) {
        console.log(`  Transaction ${i} failed: ${r.error}`);
      } else {
        console.log(`  Transaction ${i} succeeded: ${r.hash}`);
      }
    });
  }
}
```

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new BatchTransactionError(
   message: string, 
   results: BatchTransactionResult[], 
   options: RadiusErrorOptions): BatchTransactionError;
```

Defined in: [src/errors/transaction.ts:201](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L201)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `results` | [`BatchTransactionResult`](#batchtransactionresult)[] |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`BatchTransactionError`](#batchtransactionerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-5)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="meta-16"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata (Radius-specific extension) | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:55](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L55) |
| <a id="name-17"></a> `name` | `readonly` | `"BatchTransactionError"` | `'BatchTransactionError'` | - | [`RadiusError`](#radiuserror).[`name`](#name-7) | - | [src/errors/transaction.ts:196](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L196) |
| <a id="results"></a> `results` | `readonly` | [`BatchTransactionResult`](#batchtransactionresult)[] | `undefined` | Results for each transaction in the batch | - | - | [src/errors/transaction.ts:199](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L199) |

***

### InterceptingRequestHandler

Defined in: [src/transport/interceptor.ts:8](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L8)

A RequestHandler implementation that intercepts HTTP requests and responses.
Provides request logging and response modification capabilities.

#### Implements

- [`RequestHandler`](#requesthandler)

#### Constructors

##### Constructor

```ts
new InterceptingRequestHandler(
   interceptor?: Interceptor, 
   logger?: Logger, 
   proxied?: RequestHandler): InterceptingRequestHandler;
```

Defined in: [src/transport/interceptor.ts:15](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L15)

Creates a new InterceptingRequestHandler.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `interceptor?` | [`Interceptor`](#interceptor-1) | Optional function to intercept and modify responses |
| `logger?` | [`Logger`](#logger-1) | Optional logging function to record requests and responses |
| `proxied?` | [`RequestHandler`](#requesthandler) | Underlying RequestHandler implementation (defaults to fetch-based implementation) |

###### Returns

[`InterceptingRequestHandler`](#interceptingrequesthandler)

#### Methods

##### handle()

```ts
handle(request: Request): Promise<Response>;
```

Defined in: [src/transport/interceptor.ts:26](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L26)

Sends a request and handles interception and logging of the response.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `request` | `Request` | The HTTP request to send |

###### Returns

`Promise`\<`Response`\>

The HTTP response, potentially modified by the interceptor

###### Implementation of

[`RequestHandler`](#requesthandler).[`handle`](#handle-2)

## Interfaces

### SendTransactionBatchParameters

Defined in: [src/actions/sendTransactionBatch.ts:25](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/actions/sendTransactionBatch.ts#L25)

Transaction request for batch submission.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="transactions"></a> `transactions` | \{ `to`: `` `0x${string}` ``; `value?`: `bigint`; `data?`: `` `0x${string}` ``; `gas?`: `bigint`; \}[] | Array of transactions to send in the batch | [src/actions/sendTransactionBatch.ts:27](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/actions/sendTransactionBatch.ts#L27) |
| <a id="maxbatchsize"></a> `maxBatchSize?` | `number` | Maximum number of transactions allowed in the batch (default: 100) | [src/actions/sendTransactionBatch.ts:38](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/actions/sendTransactionBatch.ts#L38) |
| <a id="timeout"></a> `timeout?` | `number` | Timeout in milliseconds for the batch fetch request (default: 30000) | [src/actions/sendTransactionBatch.ts:40](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/actions/sendTransactionBatch.ts#L40) |

***

### RadiusErrorOptions

Defined in: [src/errors/base.ts:13](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L13)

Options for creating a RadiusError

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="details"></a> `details?` | `string` | Detailed error information | [src/errors/base.ts:15](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L15) |
| <a id="docspath"></a> `docsPath?` | `string` | URL path to relevant documentation | [src/errors/base.ts:17](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L17) |
| <a id="cause"></a> `cause?` | `BaseError` \| `Error` | The underlying cause of this error | [src/errors/base.ts:19](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L19) |
| <a id="metamessages"></a> `metaMessages?` | `string`[] | Additional hint messages to help resolve the error | [src/errors/base.ts:21](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L21) |
| <a id="meta-5"></a> `meta?` | `Record`\<`string`, `unknown`\> | Additional metadata about the error (Radius-specific extension) | [src/errors/base.ts:23](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/base.ts#L23) |

***

### BatchTransactionResult

Defined in: [src/errors/transaction.ts:165](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L165)

Result of a single transaction in a batch.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="index"></a> `index` | `number` | The index of this transaction in the batch | [src/errors/transaction.ts:167](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L167) |
| <a id="hash"></a> `hash?` | `` `0x${string}` `` | The transaction hash (if successful) | [src/errors/transaction.ts:169](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L169) |
| <a id="error"></a> `error?` | `string` | The error message (if failed) | [src/errors/transaction.ts:171](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/transaction.ts#L171) |

***

### InterceptingTransportOptions

Defined in: [src/transport/interceptor.ts:111](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L111)

Options for creating an intercepting transport.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url"></a> `url` | `string` | The RPC URL to connect to | [src/transport/interceptor.ts:113](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L113) |
| <a id="interceptor"></a> `interceptor?` | [`Interceptor`](#interceptor-1) | Optional function to intercept and modify responses | [src/transport/interceptor.ts:115](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L115) |
| <a id="logger"></a> `logger?` | [`Logger`](#logger-1) | Optional logging function | [src/transport/interceptor.ts:117](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L117) |
| <a id="timeout-2"></a> `timeout?` | `number` | Request timeout in milliseconds. Default: 10000 (10 seconds) | [src/transport/interceptor.ts:119](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L119) |
| <a id="retrycount"></a> `retryCount?` | `number` | Number of retry attempts. Default: 3 | [src/transport/interceptor.ts:121](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L121) |
| <a id="retrydelay"></a> `retryDelay?` | `number` | Base delay between retries in milliseconds. Default: 150 | [src/transport/interceptor.ts:123](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L123) |

***

### RequestHandler

Defined in: [src/transport/types.ts:22](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/types.ts#L22)

An interface for making HTTP requests and receiving responses
Handles the actual HTTP round-trip for JSON-RPC requests

#### Methods

##### handle()

```ts
handle(request: Request): Promise<Response>;
```

Defined in: [src/transport/types.ts:29](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/types.ts#L29)

Sends an HTTP request and returns the response

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `request` | `Request` | The HTTP request to send |

###### Returns

`Promise`\<`Response`\>

A Promise that resolves to the HTTP response

###### Throws

Error if the request fails

***

### WebSocketTransportConfig

Defined in: [src/transport/websocket.ts:10](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/websocket.ts#L10)

Configuration for creating a WebSocket transport.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url-1"></a> `url?` | `string` | The WebSocket URL (defaults to chain's WebSocket RPC URL) | [src/transport/websocket.ts:12](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/websocket.ts#L12) |
| <a id="reconnectattempts"></a> `reconnectAttempts?` | `number` | Maximum number of reconnection attempts (defaults to 3) | [src/transport/websocket.ts:14](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/websocket.ts#L14) |
| <a id="reconnectdelay"></a> `reconnectDelay?` | `number` | Reconnection delay in milliseconds (defaults to 1000) | [src/transport/websocket.ts:16](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/websocket.ts#L16) |
| <a id="keepalive"></a> `keepAlive?` | `number` | Keep-alive interval in milliseconds (optional) | [src/transport/websocket.ts:18](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/websocket.ts#L18) |

## Type Aliases

### SendTransactionBatchReturnType

```ts
type SendTransactionBatchReturnType = Hash[];
```

Defined in: [src/actions/sendTransactionBatch.ts:46](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/actions/sendTransactionBatch.ts#L46)

Return type for sendTransactionBatch action.

***

### RadiusWalletActions

```ts
type RadiusWalletActions<_chain, _account> = {
  sendTransactionBatch: (params: SendTransactionBatchParameters) => Promise<SendTransactionBatchReturnType>;
};
```

Defined in: [src/decorators/radius.ts:17](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/decorators/radius.ts#L17)

Radius-specific wallet actions added by the radiusWalletActions decorator.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `_chain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |
| `_account` *extends* `Account` \| `undefined` | `Account` \| `undefined` |

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sendtransactionbatch-3"></a> `sendTransactionBatch` | (`params`: [`SendTransactionBatchParameters`](#sendtransactionbatchparameters)) => `Promise`\<[`SendTransactionBatchReturnType`](#sendtransactionbatchreturntype)\> | Send multiple transactions in a single JSON-RPC batch request. Transactions are automatically assigned sequential nonces and sent atomically. **Remarks** Radius does not queue future-nonce transactions like Ethereum. This method ensures all transactions arrive in nonce order by using JSON-RPC batching. **Example** `const hashes = await client.sendTransactionBatch({ transactions: [ { to: '0x...', value: 1000000000000000000n }, { to: '0x...', data: '0x...' }, ], });` | [src/decorators/radius.ts:42](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/decorators/radius.ts#L42) |

***

### SendTransactionErrorType

```ts
type SendTransactionErrorType = 
  | InsufficientBalanceError
  | TransactionFailedError
  | TransactionRevertedError
  | TransactionTimeoutError
  | SignerNotFoundError
  | GasEstimationError
  | NonceError;
```

Defined in: [src/errors/index.ts:67](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/index.ts#L67)

Error types that can be thrown by sendTransaction operations.

***

### BatchTransactionErrorType

```ts
type BatchTransactionErrorType = 
  | BatchTransactionError
  | GasEstimationError
  | NonceError;
```

Defined in: [src/errors/index.ts:79](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/index.ts#L79)

Error types that can be thrown by batch transaction operations.

***

### CallContractErrorType

```ts
type CallContractErrorType = 
  | ContractCallError
  | MissingAbiError
  | AbiError;
```

Defined in: [src/errors/index.ts:84](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/index.ts#L84)

Error types that can be thrown by contract call operations.

***

### ExecuteContractErrorType

```ts
type ExecuteContractErrorType = 
  | ContractCallError
  | TransactionFailedError
  | TransactionRevertedError
  | SignerNotFoundError
  | GasEstimationError
  | MissingAbiError
  | AbiError;
```

Defined in: [src/errors/index.ts:89](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/index.ts#L89)

Error types that can be thrown by contract execution operations.

***

### DeployContractErrorType

```ts
type DeployContractErrorType = 
  | ContractDeploymentError
  | TransactionFailedError
  | TransactionRevertedError
  | SignerNotFoundError
  | GasEstimationError
  | AbiError;
```

Defined in: [src/errors/index.ts:101](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/index.ts#L101)

Error types that can be thrown by contract deployment operations.

***

### SigningErrorType

```ts
type SigningErrorType = 
  | SigningError
  | SignerNotFoundError
  | InvalidPrivateKeyError;
```

Defined in: [src/errors/index.ts:112](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/errors/index.ts#L112)

Error types that can be thrown by signing operations.

***

### Logger()

```ts
type Logger = (message: string, data?: Record<string, unknown>) => void;
```

Defined in: [src/transport/types.ts:7](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/types.ts#L7)

A logger function interface that matches the console.log function signature
Used for logging JSON-RPC requests and responses

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `message` | `string` | The log message to display |
| `data?` | `Record`\<`string`, `unknown`\> | Optional structured data to include in the log |

#### Returns

`void`

***

### Interceptor()

```ts
type Interceptor = (reqBody: string, response: Response) => Promise<Response>;
```

Defined in: [src/transport/types.ts:16](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/types.ts#L16)

An interceptor function for modifying JSON-RPC HTTP requests and responses
This allows for custom handling, validation, or manipulation of RPC calls

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reqBody` | `string` | The stringified JSON-RPC request body |
| `response` | `Response` | The HTTP response from the JSON-RPC server |

#### Returns

`Promise`\<`Response`\>

A potentially modified response or the original response

## Variables

### MAX\_GAS

```ts
const MAX_GAS: 1319413953330n = 1319413953330n;
```

Defined in: [src/chains/chainConfig.ts:30](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/chainConfig.ts#L30)

Maximum gas limit for transactions on Radius.

IMPORTANT: This constant is required because:
- Radius returns gasLimit: 0 for all blocks (intentionally)
- This differs from Ethereum where block.gasLimit is ~30,000,000
- Dynamic fetching from blocks is not possible

This value (0x13333333332) is a Radius protocol constant used to:
1. Cap gas estimates to prevent unexpectedly high values
2. Provide a safety bound for transaction gas limits

Similar to how Arbitrum and zkSync SDKs use custom gas handling
rather than relying on block.gasLimit.

#### See

_research/sdk-walkthrough/GASLIMIT-ECOSYSTEM.md for full ecosystem impact analysis

#### Example

```typescript
import { MAX_GAS } from '@radiustechsystems/sdk';

// Cap gas estimate at MAX_GAS
const cappedGas = estimatedGas > MAX_GAS ? MAX_GAS : estimatedGas;
```

***

### radius

```ts
const radius: {
  blockExplorers: {
     default: {
        name: "Radius Explorer";
        url: "https://explorer.radiustech.xyz";
     };
  };
  id: 723;
  name: "Radius";
  nativeCurrency: {
     decimals: 18;
     name: "USD";
     symbol: "USD";
  };
  rpcUrls: {
     default: {
        http: readonly ["https://rpc.radiustech.xyz"];
     };
  };
  testnet: false;
};
```

Defined in: [src/chains/radius.ts:19](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L19)

Radius Mainnet chain configuration.

Chain ID: 723
RPC: https://rpc.radiustech.xyz

#### Type Declaration

| Name | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="blockexplorers"></a> `blockExplorers` | \{ `default`: \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.radiustech.xyz"`; \}; \} | - | Collection of block explorers | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:15 |
| `blockExplorers.default` | \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.radiustech.xyz"`; \} | - | - | [src/chains/radius.ts:33](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L33) |
| `blockExplorers.default.name` | `"Radius Explorer"` | `'Radius Explorer'` | - | [src/chains/radius.ts:34](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L34) |
| `blockExplorers.default.url` | `"https://explorer.radiustech.xyz"` | `'https://explorer.radiustech.xyz'` | - | [src/chains/radius.ts:35](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L35) |
| <a id="id"></a> `id` | `723` | - | ID in number form | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:35 |
| <a id="name"></a> `name` | `"Radius"` | - | Human-readable name | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:37 |
| <a id="nativecurrency"></a> `nativeCurrency` | \{ `decimals`: `18`; `name`: `"USD"`; `symbol`: `"USD"`; \} | - | Currency used by chain | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:39 |
| `nativeCurrency.decimals` | `18` | `18` | - | [src/chains/radius.ts:23](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L23) |
| `nativeCurrency.name` | `"USD"` | `'USD'` | - | [src/chains/radius.ts:24](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L24) |
| `nativeCurrency.symbol` | `"USD"` | `'USD'` | - | [src/chains/radius.ts:25](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L25) |
| <a id="rpcurls"></a> `rpcUrls` | \{ `default`: \{ `http`: readonly \[`"https://rpc.radiustech.xyz"`\]; \}; \} | - | Collection of RPC endpoints | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:43 |
| `rpcUrls.default` | \{ `http`: readonly \[`"https://rpc.radiustech.xyz"`\]; \} | - | - | [src/chains/radius.ts:28](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L28) |
| `rpcUrls.default.http` | readonly \[`"https://rpc.radiustech.xyz"`\] | - | - | [src/chains/radius.ts:29](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radius.ts#L29) |
| <a id="testnet"></a> `testnet` | `false` | - | Flag for test networks | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:50 |

#### Example

```typescript
import { radius } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radius,
  transport: http(),
});
```

***

### radiusTestnet

```ts
const radiusTestnet: {
  blockExplorers: {
     default: {
        name: "Radius Explorer";
        url: "https://explorer.testnet.radiustech.xyz";
     };
  };
  contracts: {
     multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        blockCreated: 1768594222351;
     };
  };
  id: 1223953;
  name: "Radius Testnet";
  nativeCurrency: {
     decimals: 18;
     name: "USD";
     symbol: "USD";
  };
  rpcUrls: {
     default: {
        http: readonly ["https://rpc.testnet.radiustech.xyz"];
     };
  };
  testnet: true;
};
```

Defined in: [src/chains/radiusTestnet.ts:19](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L19)

Radius Testnet chain configuration.

Chain ID: 1223953 (0x12ad11)
RPC: https://rpc.testnet.radiustech.xyz

#### Type Declaration

| Name | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="blockexplorers-1"></a> `blockExplorers` | \{ `default`: \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.testnet.radiustech.xyz"`; \}; \} | - | Collection of block explorers | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:15 |
| `blockExplorers.default` | \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.testnet.radiustech.xyz"`; \} | - | - | [src/chains/radiusTestnet.ts:33](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L33) |
| `blockExplorers.default.name` | `"Radius Explorer"` | `'Radius Explorer'` | - | [src/chains/radiusTestnet.ts:34](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L34) |
| `blockExplorers.default.url` | `"https://explorer.testnet.radiustech.xyz"` | `'https://explorer.testnet.radiustech.xyz'` | - | [src/chains/radiusTestnet.ts:35](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L35) |
| <a id="contracts"></a> `contracts` | \{ `multicall3`: \{ `address`: `"0xcA11bde05977b3631167028862bE2a173976CA11"`; `blockCreated`: `1768594222351`; \}; \} | - | Collection of contracts | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:22 |
| `contracts.multicall3` | \{ `address`: `"0xcA11bde05977b3631167028862bE2a173976CA11"`; `blockCreated`: `1768594222351`; \} | - | - | [src/chains/radiusTestnet.ts:39](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L39) |
| `contracts.multicall3.address` | `"0xcA11bde05977b3631167028862bE2a173976CA11"` | `'0xcA11bde05977b3631167028862bE2a173976CA11'` | - | [src/chains/radiusTestnet.ts:40](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L40) |
| `contracts.multicall3.blockCreated` | `1768594222351` | `1768594222351` | - | [src/chains/radiusTestnet.ts:41](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L41) |
| <a id="id-1"></a> `id` | `1223953` | - | ID in number form | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:35 |
| <a id="name-1"></a> `name` | `"Radius Testnet"` | - | Human-readable name | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:37 |
| <a id="nativecurrency-1"></a> `nativeCurrency` | \{ `decimals`: `18`; `name`: `"USD"`; `symbol`: `"USD"`; \} | - | Currency used by chain | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:39 |
| `nativeCurrency.decimals` | `18` | `18` | - | [src/chains/radiusTestnet.ts:23](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L23) |
| `nativeCurrency.name` | `"USD"` | `'USD'` | - | [src/chains/radiusTestnet.ts:24](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L24) |
| `nativeCurrency.symbol` | `"USD"` | `'USD'` | - | [src/chains/radiusTestnet.ts:25](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L25) |
| <a id="rpcurls-1"></a> `rpcUrls` | \{ `default`: \{ `http`: readonly \[`"https://rpc.testnet.radiustech.xyz"`\]; \}; \} | - | Collection of RPC endpoints | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:43 |
| `rpcUrls.default` | \{ `http`: readonly \[`"https://rpc.testnet.radiustech.xyz"`\]; \} | - | - | [src/chains/radiusTestnet.ts:28](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L28) |
| `rpcUrls.default.http` | readonly \[`"https://rpc.testnet.radiustech.xyz"`\] | - | - | [src/chains/radiusTestnet.ts:29](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/chains/radiusTestnet.ts#L29) |
| <a id="testnet-1"></a> `testnet` | `true` | - | Flag for test networks | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:50 |

#### Example

```typescript
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});
```

## Functions

### sendTransactionBatch()

```ts
function sendTransactionBatch<chain, account>(client: Client<Transport, chain, account>, params: SendTransactionBatchParameters): Promise<SendTransactionBatchReturnType>;
```

Defined in: [src/actions/sendTransactionBatch.ts:88](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/actions/sendTransactionBatch.ts#L88)

Send multiple transactions in a single JSON-RPC batch request.
Transactions are automatically assigned sequential nonces and sent atomically.

#### Type Parameters

| Type Parameter |
| ------ |
| `chain` *extends* `Chain` \| `undefined` |
| `account` *extends* `Account` \| `undefined` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | `Client`\<`Transport`, `chain`, `account`\> | The viem client (must have an account attached) |
| `params` | [`SendTransactionBatchParameters`](#sendtransactionbatchparameters) | The batch transaction parameters |

#### Returns

`Promise`\<[`SendTransactionBatchReturnType`](#sendtransactionbatchreturntype)\>

Array of transaction hashes in the same order as input

#### Throws

If any transaction in the batch fails

#### Throws

If gas estimation fails for any transaction

#### Throws

If input validation fails, HTTP request fails, or request times out

#### Remarks

**Transport Note:** This function uses a direct `fetch()` call rather than
the client's configured transport. Custom transport interceptors, retry logic,
or middleware will not be applied to batch requests. This is necessary because
viem's transport layer does not expose batch JSON-RPC capabilities.

#### Example

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

const client = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

const hashes = await client.sendTransactionBatch({
  transactions: [
    { to: '0x...', value: 1000000000000000000n },
    { to: '0x...', data: '0x...' },
  ],
});
```

***

### radiusWalletActions()

```ts
function radiusWalletActions(): <transport, chain, account>(client: Client<transport, chain, account>) => RadiusWalletActions<chain, account>;
```

Defined in: [src/decorators/radius.ts:76](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/decorators/radius.ts#L76)

Decorator that extends a viem wallet client with Radius-specific actions.

#### Returns

A decorator function that adds Radius wallet actions to a client

```ts
<transport, chain, account>(client: Client<transport, chain, account>): RadiusWalletActions<chain, account>;
```

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `transport` *extends* `Transport` | - |
| `chain` *extends* `Chain` \| `undefined` | `Chain` \| `undefined` |
| `account` *extends* `Account` \| `undefined` | `Account` \| `undefined` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | `Client`\<`transport`, `chain`, `account`\> |

##### Returns

[`RadiusWalletActions`](#radiuswalletactions)\<`chain`, `account`\>

#### Example

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

const client = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

// Standard viem for simple operations
const hash = await client.sendTransaction({ to, value });

// Radius-specific for batching
const hashes = await client.sendTransactionBatch({
  transactions: [
    { to: addr1, value: 1n },
    { to: addr2, value: 2n },
  ],
});
```

***

### createInterceptingTransport()

```ts
function createInterceptingTransport(options: InterceptingTransportOptions): Transport;
```

Defined in: [src/transport/interceptor.ts:168](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/interceptor.ts#L168)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`InterceptingTransportOptions`](#interceptingtransportoptions) |

#### Returns

`Transport`

***

### createWebSocketTransport()

```ts
function createWebSocketTransport(chain: Chain, config?: WebSocketTransportConfig): Transport;
```

Defined in: [src/transport/websocket.ts:52](https://github.com/ryanRfox/sdk/blob/6b9acabd13e0f67a48abcd896b53de4aa802d65d/typescript/src/transport/websocket.ts#L52)

Creates a WebSocket transport for use with Radius clients.
Uses viem's webSocket transport under the hood with Radius-specific defaults.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `chain` | `Chain` | The chain configuration (used to determine default WebSocket URL) |
| `config?` | [`WebSocketTransportConfig`](#websockettransportconfig) | Optional configuration for the WebSocket transport |

#### Returns

`Transport`

A viem Transport configured for WebSocket connections

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport } from '@radiustechsystems/sdk/transport';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const transport = createWebSocketTransport(radiusTestnet, {
  reconnectAttempts: 5,
  reconnectDelay: 2000,
});

const client = createPublicClient({
  chain: radiusTestnet,
  transport,
});
```

#### Remarks

- The default WebSocket URL is derived from the chain configuration
- For Radius Testnet, the default is: wss://rpc.testnet.radiustech.xyz
- WebSocket connections are automatically managed by viem
- Subscriptions are cleaned up automatically on disconnect
