[**@radiustechsystems/sdk**](README.md)

***

[@radiustechsystems/sdk](README.md) / react

# react

## Type Aliases

### RadiusContextValue

```ts
type RadiusContextValue = {
  chain: Chain;
};
```

Defined in: [src/react/context.tsx:7](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L7)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="chain"></a> `chain` | `Chain` | [src/react/context.tsx:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L8) |

***

### RadiusContextProviderProps

```ts
type RadiusContextProviderProps = {
  chain?: Chain;
  children: ReactNode;
};
```

Defined in: [src/react/context.tsx:13](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L13)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="chain-1"></a> `chain?` | `Chain` | [src/react/context.tsx:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L14) |
| <a id="children"></a> `children` | `ReactNode` | [src/react/context.tsx:15](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L15) |

***

### UseERC20BalanceParams

```ts
type UseERC20BalanceParams = {
  token: Address;
  address?: Address;
};
```

Defined in: [src/react/hooks/useERC20.ts:11](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L11)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="token"></a> `token` | `Address` | [src/react/hooks/useERC20.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L12) |
| <a id="address"></a> `address?` | `Address` | [src/react/hooks/useERC20.ts:13](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L13) |

***

### UseERC20AllowanceParams

```ts
type UseERC20AllowanceParams = {
  token: Address;
  owner?: Address;
  spender: Address;
};
```

Defined in: [src/react/hooks/useERC20.ts:35](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L35)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="token-1"></a> `token` | `Address` | [src/react/hooks/useERC20.ts:36](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L36) |
| <a id="owner"></a> `owner?` | `Address` | [src/react/hooks/useERC20.ts:37](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L37) |
| <a id="spender"></a> `spender` | `Address` | [src/react/hooks/useERC20.ts:38](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L38) |

***

### UseERC20MetadataParams

```ts
type UseERC20MetadataParams = {
  token: Address;
};
```

Defined in: [src/react/hooks/useERC20.ts:60](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L60)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="token-2"></a> `token` | `Address` | [src/react/hooks/useERC20.ts:61](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L61) |

***

### UseERC20TransferParams

```ts
type UseERC20TransferParams = {
  token: Address;
};
```

Defined in: [src/react/hooks/useERC20.ts:105](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L105)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="token-3"></a> `token` | `Address` | [src/react/hooks/useERC20.ts:106](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L106) |

***

### UseERC20TransferReturn

```ts
type UseERC20TransferReturn = {
  hash: Hash | undefined;
  receipt: TransactionReceipt | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  transfer: (to: Address, amount: bigint) => void;
  reset: () => void;
};
```

Defined in: [src/react/hooks/useERC20.ts:109](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L109)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="hash"></a> `hash` | `Hash` \| `undefined` | [src/react/hooks/useERC20.ts:110](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L110) |
| <a id="receipt"></a> `receipt` | `TransactionReceipt` \| `undefined` | [src/react/hooks/useERC20.ts:111](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L111) |
| <a id="error"></a> `error` | `Error` \| `null` | [src/react/hooks/useERC20.ts:112](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L112) |
| <a id="ispending"></a> `isPending` | `boolean` | [src/react/hooks/useERC20.ts:113](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L113) |
| <a id="isconfirming"></a> `isConfirming` | `boolean` | [src/react/hooks/useERC20.ts:114](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L114) |
| <a id="isconfirmed"></a> `isConfirmed` | `boolean` | [src/react/hooks/useERC20.ts:115](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L115) |
| <a id="transfer"></a> `transfer` | (`to`: `Address`, `amount`: `bigint`) => `void` | [src/react/hooks/useERC20.ts:116](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L116) |
| <a id="reset"></a> `reset` | () => `void` | [src/react/hooks/useERC20.ts:117](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L117) |

***

### UseERC20ApproveParams

```ts
type UseERC20ApproveParams = {
  token: Address;
};
```

Defined in: [src/react/hooks/useERC20.ts:156](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L156)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="token-4"></a> `token` | `Address` | [src/react/hooks/useERC20.ts:157](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L157) |

***

### UseERC20ApproveReturn

```ts
type UseERC20ApproveReturn = {
  hash: Hash | undefined;
  receipt: TransactionReceipt | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  approve: (spender: Address, amount: bigint) => void;
  reset: () => void;
};
```

Defined in: [src/react/hooks/useERC20.ts:160](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L160)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="hash-1"></a> `hash` | `Hash` \| `undefined` | [src/react/hooks/useERC20.ts:161](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L161) |
| <a id="receipt-1"></a> `receipt` | `TransactionReceipt` \| `undefined` | [src/react/hooks/useERC20.ts:162](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L162) |
| <a id="error-1"></a> `error` | `Error` \| `null` | [src/react/hooks/useERC20.ts:163](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L163) |
| <a id="ispending-1"></a> `isPending` | `boolean` | [src/react/hooks/useERC20.ts:164](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L164) |
| <a id="isconfirming-1"></a> `isConfirming` | `boolean` | [src/react/hooks/useERC20.ts:165](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L165) |
| <a id="isconfirmed-1"></a> `isConfirmed` | `boolean` | [src/react/hooks/useERC20.ts:166](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L166) |
| <a id="approve"></a> `approve` | (`spender`: `Address`, `amount`: `bigint`) => `void` | [src/react/hooks/useERC20.ts:167](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L167) |
| <a id="reset-1"></a> `reset` | () => `void` | [src/react/hooks/useERC20.ts:168](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L168) |

***

### UseRadiusBalanceParams

```ts
type UseRadiusBalanceParams = {
  address?: Address;
};
```

Defined in: [src/react/hooks/useRadiusBalance.ts:6](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusBalance.ts#L6)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="address-1"></a> `address?` | `Address` | [src/react/hooks/useRadiusBalance.ts:7](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusBalance.ts#L7) |

***

### UseRadiusSendParams

```ts
type UseRadiusSendParams = {
  to: Address;
  value: string | bigint;
};
```

Defined in: [src/react/hooks/useRadiusSend.ts:7](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L7)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="to"></a> `to` | `Address` | [src/react/hooks/useRadiusSend.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L8) |
| <a id="value"></a> `value` | `string` \| `bigint` | [src/react/hooks/useRadiusSend.ts:9](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L9) |

***

### UseRadiusSendReturn

```ts
type UseRadiusSendReturn = {
  hash: Hash | undefined;
  receipt: TransactionReceipt | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  send: (params: UseRadiusSendParams) => void;
  reset: () => void;
};
```

Defined in: [src/react/hooks/useRadiusSend.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L12)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="hash-2"></a> `hash` | `Hash` \| `undefined` | [src/react/hooks/useRadiusSend.ts:13](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L13) |
| <a id="receipt-2"></a> `receipt` | `TransactionReceipt` \| `undefined` | [src/react/hooks/useRadiusSend.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L14) |
| <a id="error-2"></a> `error` | `Error` \| `null` | [src/react/hooks/useRadiusSend.ts:15](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L15) |
| <a id="ispending-2"></a> `isPending` | `boolean` | [src/react/hooks/useRadiusSend.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L16) |
| <a id="isconfirming-2"></a> `isConfirming` | `boolean` | [src/react/hooks/useRadiusSend.ts:17](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L17) |
| <a id="isconfirmed-2"></a> `isConfirmed` | `boolean` | [src/react/hooks/useRadiusSend.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L18) |
| <a id="send"></a> `send` | (`params`: [`UseRadiusSendParams`](#useradiussendparams)) => `void` | [src/react/hooks/useRadiusSend.ts:19](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L19) |
| <a id="reset-2"></a> `reset` | () => `void` | [src/react/hooks/useRadiusSend.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L20) |

***

### RadiusProviderProps

```ts
type RadiusProviderProps = {
  chain?: Chain;
  children: ReactNode;
  queryClient?: QueryClient;
};
```

Defined in: [src/react/provider.tsx:10](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/provider.tsx#L10)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="chain-2"></a> `chain?` | `Chain` | [src/react/provider.tsx:11](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/provider.tsx#L11) |
| <a id="children-1"></a> `children` | `ReactNode` | [src/react/provider.tsx:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/provider.tsx#L12) |
| <a id="queryclient"></a> `queryClient?` | `QueryClient` | [src/react/provider.tsx:13](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/provider.tsx#L13) |

## Functions

### RadiusContextProvider()

```ts
function RadiusContextProvider(__namedParameters: RadiusContextProviderProps): Element;
```

Defined in: [src/react/context.tsx:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L18)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`RadiusContextProviderProps`](#radiuscontextproviderprops) |

#### Returns

`Element`

***

### useRadiusContext()

```ts
function useRadiusContext(): RadiusContextValue;
```

Defined in: [src/react/context.tsx:25](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/context.tsx#L25)

#### Returns

[`RadiusContextValue`](#radiuscontextvalue)

***

### useERC20Balance()

```ts
function useERC20Balance(__namedParameters: UseERC20BalanceParams): UseReadContractReturnType<readonly [{
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}], "balanceOf", readonly [`0x${string}`], bigint>;
```

Defined in: [src/react/hooks/useERC20.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L16)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`UseERC20BalanceParams`](#useerc20balanceparams) |

#### Returns

`UseReadContractReturnType`\<readonly \[\{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}\], `"balanceOf"`, readonly \[`` `0x${string}` ``\], `bigint`\>

***

### useERC20Allowance()

```ts
function useERC20Allowance(__namedParameters: UseERC20AllowanceParams): UseReadContractReturnType<readonly [{
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}, {
}], "allowance", readonly [`0x${string}`, `0x${string}`], bigint>;
```

Defined in: [src/react/hooks/useERC20.ts:41](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L41)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`UseERC20AllowanceParams`](#useerc20allowanceparams) |

#### Returns

`UseReadContractReturnType`\<readonly \[\{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}, \{
\}\], `"allowance"`, readonly \[`` `0x${string}` ``, `` `0x${string}` ``\], `bigint`\>

***

### useERC20Metadata()

```ts
function useERC20Metadata(__namedParameters: UseERC20MetadataParams): {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  totalSupply: bigint | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<[QueryObserverResult<string, ReadContractErrorType>, QueryObserverResult<string, ReadContractErrorType>, QueryObserverResult<number, ReadContractErrorType>, QueryObserverResult<bigint, ReadContractErrorType>]>;
};
```

Defined in: [src/react/hooks/useERC20.ts:64](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L64)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`UseERC20MetadataParams`](#useerc20metadataparams) |

#### Returns

```ts
{
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  totalSupply: bigint | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<[QueryObserverResult<string, ReadContractErrorType>, QueryObserverResult<string, ReadContractErrorType>, QueryObserverResult<number, ReadContractErrorType>, QueryObserverResult<bigint, ReadContractErrorType>]>;
}
```

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| `name` | `string` \| `undefined` | `name.data` | [src/react/hooks/useERC20.ts:90](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L90) |
| `symbol` | `string` \| `undefined` | `symbol.data` | [src/react/hooks/useERC20.ts:91](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L91) |
| `decimals` | `number` \| `undefined` | `decimals.data` | [src/react/hooks/useERC20.ts:92](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L92) |
| `totalSupply` | `bigint` \| `undefined` | `totalSupply.data` | [src/react/hooks/useERC20.ts:93](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L93) |
| `isLoading` | `boolean` | - | [src/react/hooks/useERC20.ts:94](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L94) |
| `isError` | `boolean` | - | [src/react/hooks/useERC20.ts:95](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L95) |
| `refetch()` | () => `Promise`\<\[`QueryObserverResult`\<`string`, `ReadContractErrorType`\>, `QueryObserverResult`\<`string`, `ReadContractErrorType`\>, `QueryObserverResult`\<`number`, `ReadContractErrorType`\>, `QueryObserverResult`\<`bigint`, `ReadContractErrorType`\>\]\> | - | [src/react/hooks/useERC20.ts:96](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L96) |

***

### useERC20Transfer()

```ts
function useERC20Transfer(__namedParameters: UseERC20TransferParams): UseERC20TransferReturn;
```

Defined in: [src/react/hooks/useERC20.ts:120](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L120)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`UseERC20TransferParams`](#useerc20transferparams) |

#### Returns

[`UseERC20TransferReturn`](#useerc20transferreturn)

***

### useERC20Approve()

```ts
function useERC20Approve(__namedParameters: UseERC20ApproveParams): UseERC20ApproveReturn;
```

Defined in: [src/react/hooks/useERC20.ts:171](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useERC20.ts#L171)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`UseERC20ApproveParams`](#useerc20approveparams) |

#### Returns

[`UseERC20ApproveReturn`](#useerc20approvereturn)

***

### useRadiusBalance()

```ts
function useRadiusBalance(params: UseRadiusBalanceParams): UseBalanceReturnType<{
}>;
```

Defined in: [src/react/hooks/useRadiusBalance.ts:10](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusBalance.ts#L10)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`UseRadiusBalanceParams`](#useradiusbalanceparams) |

#### Returns

`UseBalanceReturnType`\<\{
\}\>

***

### useRadiusSend()

```ts
function useRadiusSend(): UseRadiusSendReturn;
```

Defined in: [src/react/hooks/useRadiusSend.ts:23](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/hooks/useRadiusSend.ts#L23)

#### Returns

[`UseRadiusSendReturn`](#useradiussendreturn)

***

### RadiusProvider()

```ts
function RadiusProvider(__namedParameters: RadiusProviderProps): Element;
```

Defined in: [src/react/provider.tsx:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/react/provider.tsx#L16)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | [`RadiusProviderProps`](#radiusproviderprops) |

#### Returns

`Element`

## References

### radiusMainnet

Re-exports [radiusMainnet](index.md#radiusmainnet)

***

### radiusTestnet

Re-exports [radiusTestnet](index.md#radiustestnet)
