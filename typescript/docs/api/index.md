[**@radiustechsystems/sdk**](README.md)

***

[@radiustechsystems/sdk](README.md) / index

# index

Radius TypeScript SDK v2

A viem-based SDK for interacting with the Radius platform.

## Classes

### Account

Defined in: [src/accounts/account.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L18)

Account represents a Radius account that can be used to sign transactions.
This class provides methods for checking balance, retrieving nonce, and
signing messages and transactions.

#### Constructors

##### Constructor

```ts
new Account(account?: {
}): Account;
```

Defined in: [src/accounts/account.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L28)

Creates a new Account instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `account?` | \{ \} | Optional local account to use with this account |

###### Returns

[`Account`](#account)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="account-1"></a> `account?` | \{ \} | The local account used to cryptographically sign messages and transactions | [src/accounts/account.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L22) |

#### Methods

##### New()

```ts
static New(...opts: AccountOption[]): Promise<Account>;
```

Defined in: [src/accounts/account.ts:37](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L37)

Creates a new Account with the given options

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`opts` | [`AccountOption`](#accountoption)[] | Functional options to configure the account (e.g., withAccount, withPrivateKey) |

###### Returns

`Promise`\<[`Account`](#account)\>

A new Account instance configured with the provided options

##### address()

```ts
address(): `0x${string}`;
```

Defined in: [src/accounts/account.ts:49](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L49)

Returns the address of the account

###### Returns

`` `0x${string}` ``

The account address, or zero address if no account is available

##### balance()

```ts
balance(client: AccountClient): Promise<bigint>;
```

Defined in: [src/accounts/account.ts:59](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L59)

Returns the balance of the account in wei

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`AccountClient`](#accountclient) | Radius client instance used to query the balance |

###### Returns

`Promise`\<`bigint`\>

The account balance in wei

###### Throws

Error if the balance cannot be retrieved from the network

##### nonce()

```ts
nonce(client: AccountClient): Promise<number>;
```

Defined in: [src/accounts/account.ts:69](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L69)

Returns the next nonce (transaction count) of the account

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`AccountClient`](#accountclient) | Radius client instance used to query the nonce |

###### Returns

`Promise`\<`number`\>

The next nonce to use for transactions

###### Throws

Error if the nonce cannot be retrieved from the network

##### send()

```ts
send(
   client: AccountClient, 
   recipient: `0x${string}`, 
value: bigint): Promise<Receipt>;
```

Defined in: [src/accounts/account.ts:82](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L82)

Sends native currency to a recipient address

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`AccountClient`](#accountclient) | Radius client instance used to send the transaction |
| `recipient` | `` `0x${string}` `` | Destination address to receive the funds |
| `value` | `bigint` | Amount of native currency to send in wei |

###### Returns

`Promise`\<[`Receipt`](#receipt)\>

Receipt of the completed transaction

###### Throws

Error if no account is available

###### Throws

Error if the transaction fails

##### signMessage()

```ts
signMessage(message: BytesLike): Promise<Uint8Array<ArrayBufferLike>>;
```

Defined in: [src/accounts/account.ts:96](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L96)

Signs a message using the EIP-191 standard

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `message` | [`BytesLike`](#byteslike) | Message bytes to sign |

###### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

The signature bytes

###### Throws

Error if no account is available

###### Throws

Error if signing fails

##### signTransaction()

```ts
signTransaction(transaction: Transaction, chainId: number): Promise<SignedTransaction>;
```

Defined in: [src/accounts/account.ts:120](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/account.ts#L120)

Signs a transaction using the EIP-155 standard

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `transaction` | [`Transaction`](#transaction) | Transaction to sign |
| `chainId` | `number` | The chain ID for signing the transaction |

###### Returns

`Promise`\<[`SignedTransaction`](#signedtransaction)\>

The signed transaction ready to be sent to the network

###### Throws

Error if no account is available

###### Throws

Error if signing fails

***

### ABI

Defined in: [src/common/abi.ts:17](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/abi.ts#L17)

ABI represents an Application Binary Interface for smart contracts.

It provides methods for encoding and decoding contract method calls and return values,
which are essential for interacting with smart contracts deployed on Radius.

#### Constructors

##### Constructor

```ts
new ABI(abiJSON: string): ABI;
```

Defined in: [src/common/abi.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/abi.ts#L30)

Creates a new ABI instance from a JSON string representation.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `abiJSON` | `string` | String representing the ABI in JSON format |

###### Returns

[`ABI`](#abi-1)

###### Throws

Error if the JSON string is empty or invalid

#### Methods

##### pack()

```ts
pack(name: string, ...args: unknown[]): Uint8Array;
```

Defined in: [src/common/abi.ts:46](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/abi.ts#L46)

Pack encodes contract input data for method calls or constructor invocations.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | Name of the method to call, or an empty string for constructor |
| ...`args` | `unknown`[] | Variadic list of arguments for the method |

###### Returns

`Uint8Array`

Encoded binary data ready for contract interaction

###### Throws

Error if the method is not found or encoding fails

##### unpack()

```ts
unpack(name: string, data: BytesLike): unknown[];
```

Defined in: [src/common/abi.ts:77](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/abi.ts#L77)

Unpack decodes contract output data returned from a method call.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | Name of the method that produced the output, or an empty string for constructor |
| `data` | [`BytesLike`](#byteslike) | Encoded binary data received from the contract |

###### Returns

`unknown`[]

Array of decoded values representing the method's return values

###### Throws

Error if the method is not found or decoding fails

***

### Event

Defined in: [src/common/event.ts:7](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/event.ts#L7)

Event represents an EVM contract event emitted during transaction execution
Contains decoded event data and the raw event payload

#### Constructors

##### Constructor

```ts
new Event(
   name: string, 
   data: Record<string, unknown>, 
   raw: BytesLike): Event;
```

Defined in: [src/common/event.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/event.ts#L14)

Creates a new Event with the given name, data, and raw bytes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the event |
| `data` | `Record`\<`string`, `unknown`\> | The decoded data of the event as key-value pairs |
| `raw` | [`BytesLike`](#byteslike) | The raw bytes of the event |

###### Returns

[`Event`](#event)

#### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="name-2"></a> `name` | `public` | `string` | The name of the event | [src/common/event.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/event.ts#L18) |
| <a id="data"></a> `data` | `public` | `Record`\<`string`, `unknown`\> | The data of the event as key-value pairs | [src/common/event.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/event.ts#L22) |
| <a id="raw"></a> `raw` | `public` | [`BytesLike`](#byteslike) | The raw bytes of the event | [src/common/event.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/event.ts#L26) |

***

### ~~Transaction~~

Defined in: [src/common/transaction.ts:37](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L37)

Transaction represents an unsigned Radius EVM transaction.
Contains all the data needed to execute a Radius transaction.

#### Deprecated

Use TransactionParams interface instead for cleaner types.

#### Constructors

##### Constructor

```ts
new Transaction(
   data: BytesLike, 
   gas: BigNumberish, 
   gasPrice: BigNumberish, 
   nonce?: number, 
   to?: `0x${string}`, 
   value?: BigNumberish): Transaction;
```

Defined in: [src/common/transaction.ts:51](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L51)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | [`BytesLike`](#byteslike) |
| `gas` | [`BigNumberish`](#bignumberish) |
| `gasPrice` | [`BigNumberish`](#bignumberish) |
| `nonce?` | `number` |
| `to?` | `` `0x${string}` `` |
| `value?` | [`BigNumberish`](#bignumberish) |

###### Returns

[`Transaction`](#transaction)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data-2"></a> ~~`data`~~ | [`BytesLike`](#byteslike) | The call data for the transaction | [src/common/transaction.ts:39](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L39) |
| <a id="gas-1"></a> ~~`gas`~~ | [`BigNumberish`](#bignumberish) | Maximum amount of gas units | [src/common/transaction.ts:41](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L41) |
| <a id="gasprice-1"></a> ~~`gasPrice`~~ | [`BigNumberish`](#bignumberish) | Price per gas unit in wei | [src/common/transaction.ts:43](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L43) |
| <a id="nonce-3"></a> ~~`nonce?`~~ | `number` | Sequential transaction number | [src/common/transaction.ts:45](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L45) |
| <a id="to-3"></a> ~~`to?`~~ | `` `0x${string}` `` | Destination address | [src/common/transaction.ts:47](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L47) |
| <a id="value-2"></a> ~~`value?`~~ | [`BigNumberish`](#bignumberish) | Amount of native currency in wei | [src/common/transaction.ts:49](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L49) |

***

### SignedTransaction

Defined in: [src/common/transaction.ts:72](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L72)

SignedTransaction represents a cryptographically signed transaction
ready to be sent to Radius

#### Constructors

##### Constructor

```ts
new SignedTransaction(serialized: `0x${string}`): SignedTransaction;
```

Defined in: [src/common/transaction.ts:82](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L82)

Creates a new SignedTransaction

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `` `0x${string}` `` | The RLP-encoded signed transaction as hex string |

###### Returns

[`SignedTransaction`](#signedtransaction)

#### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="serialized"></a> `serialized` | `readonly` | `` `0x${string}` `` | RLP-encoded signed transaction bytes as hex string | [src/common/transaction.ts:76](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L76) |

#### Methods

##### toString()

```ts
toString(): string;
```

Defined in: [src/common/transaction.ts:89](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L89)

Returns the serialized transaction as a hex string

###### Returns

`string`

***

### Contract

Defined in: [src/contracts/contract.ts:11](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/contract.ts#L11)

Contract class for interacting with smart contracts on Radius.
Provides methods to call read-only methods and execute state-changing methods.
The class handles method encoding, parameter serialization, and result decoding
according to the contract's ABI specification.

#### Constructors

##### Constructor

```ts
new Contract(address: `0x${string}`, abi: ABI): Contract;
```

Defined in: [src/contracts/contract.ts:29](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/contract.ts#L29)

Create a new Contract instance.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | Contract address |
| `abi` | [`ABI`](#abi-1) | Contract ABI |

###### Returns

[`Contract`](#contract)

#### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="abi-2"></a> `abi` | `readonly` | [`ABI`](#abi-1) | The contract's ABI (Application Binary Interface) Used for encoding and decoding method calls and return values | [src/contracts/contract.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/contract.ts#L16) |

#### Methods

##### address()

```ts
address(): `0x${string}`;
```

Defined in: [src/contracts/contract.ts:38](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/contract.ts#L38)

Get the contract address.

###### Returns

`` `0x${string}` ``

The contract address

##### call()

```ts
call(
   client: ContractClient, 
   method: string, ...
args: unknown[]): Promise<unknown[]>;
```

Defined in: [src/contracts/contract.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/contract.ts#L52)

Calls a read-only contract method without creating a transaction

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`ContractClient`](#contractclient) | Radius client instance used to make the call |
| `method` | `string` | Name of the method to call on the contract |
| ...`args` | `unknown`[] | Arguments to pass to the contract method |

###### Returns

`Promise`\<`unknown`[]\>

Array of decoded return values from the contract method

###### Throws

Error if the contract ABI is missing

###### Throws

Error if the contract address is missing or zero

###### Throws

Error if the contract method call fails

##### execute()

```ts
execute(
   client: ContractClient, 
   account: {
}, 
   method: string, ...
args: unknown[]): Promise<Receipt>;
```

Defined in: [src/contracts/contract.ts:68](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/contract.ts#L68)

Executes a contract method that modifies Radius state

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`ContractClient`](#contractclient) | Radius client instance used to execute the transaction |
| `account` | \{ \} | The local account used to sign the transaction |
| `method` | `string` | Name of the method to execute on the contract |
| ...`args` | `unknown`[] | Arguments to pass to the contract method |

###### Returns

`Promise`\<[`Receipt`](#receipt)\>

Transaction receipt after the method execution

###### Throws

Error if the contract ABI is missing

###### Throws

Error if the contract address is missing or zero

###### Throws

Error if the transaction fails or is reverted

###### Throws

Error if the transaction receipt is not returned

***

### ERC20

Defined in: [src/contracts/erc20.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L48)

ERC20 class for interacting with ERC-20 token contracts on Radius.
Provides convenient methods for all standard ERC-20 operations including
reading token metadata, checking balances and allowances, and executing
transfers and approvals.

Read operations use the provided PublicClient, while write operations
require an ERC20Signer with a WalletClient and Account.

#### Constructors

##### Constructor

```ts
new ERC20(address: `0x${string}`, publicClient: {
}): ERC20;
```

Defined in: [src/contracts/erc20.ts:84](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L84)

Creates a new ERC20 instance for interacting with a token contract.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The token contract address (must be a valid 0x-prefixed hex string) |
| `publicClient` | \{ \} | The viem PublicClient to use for read operations |

###### Returns

[`ERC20`](#erc20)

#### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="address-5"></a> `address` | `readonly` | `` `0x${string}` `` | The token contract address | [src/contracts/erc20.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L52) |

#### Methods

##### name()

```ts
name(): Promise<string>;
```

Defined in: [src/contracts/erc20.ts:100](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L100)

Gets the token name.
The result is cached after the first call.

###### Returns

`Promise`\<`string`\>

The token name (e.g., "Wrapped Ether")

###### Throws

Error if the contract call fails

##### symbol()

```ts
symbol(): Promise<string>;
```

Defined in: [src/contracts/erc20.ts:122](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L122)

Gets the token symbol.
The result is cached after the first call.

###### Returns

`Promise`\<`string`\>

The token symbol (e.g., "WETH")

###### Throws

Error if the contract call fails

##### decimals()

```ts
decimals(): Promise<number>;
```

Defined in: [src/contracts/erc20.ts:144](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L144)

Gets the number of decimals the token uses.
The result is cached after the first call.

###### Returns

`Promise`\<`number`\>

The number of decimals (e.g., 18 for most tokens)

###### Throws

Error if the contract call fails

##### totalSupply()

```ts
totalSupply(): Promise<bigint>;
```

Defined in: [src/contracts/erc20.ts:165](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L165)

Gets the total token supply.

###### Returns

`Promise`\<`bigint`\>

The total supply as a bigint (in the smallest unit)

###### Throws

Error if the contract call fails

##### balanceOf()

```ts
balanceOf(owner: `0x${string}`): Promise<bigint>;
```

Defined in: [src/contracts/erc20.ts:180](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L180)

Gets the token balance of an address.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `owner` | `` `0x${string}` `` | The address to check the balance for |

###### Returns

`Promise`\<`bigint`\>

The balance as a bigint (in the smallest unit)

###### Throws

Error if the contract call fails

##### allowance()

```ts
allowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
```

Defined in: [src/contracts/erc20.ts:197](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L197)

Gets the allowance that an owner has granted to a spender.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `owner` | `` `0x${string}` `` | The address that owns the tokens |
| `spender` | `` `0x${string}` `` | The address that is allowed to spend the tokens |

###### Returns

`Promise`\<`bigint`\>

The allowance as a bigint (in the smallest unit)

###### Throws

Error if the contract call fails

##### transfer()

```ts
transfer(
   signer: ERC20Signer, 
   to: `0x${string}`, 
amount: bigint): Promise<`0x${string}`>;
```

Defined in: [src/contracts/erc20.ts:220](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L220)

Transfers tokens to another address.
Returns immediately with the transaction hash without waiting for confirmation.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | [`ERC20Signer`](#erc20signer) | The signer containing the wallet client and account |
| `to` | `` `0x${string}` `` | The recipient address |
| `amount` | `bigint` | The amount to transfer (in the smallest unit) |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The transaction hash

###### Throws

Error if the transaction fails to submit

##### transferSync()

```ts
transferSync(
   signer: ERC20Signer, 
   to: `0x${string}`, 
amount: bigint): Promise<TransactionReceipt>;
```

Defined in: [src/contracts/erc20.ts:243](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L243)

Transfers tokens to another address and waits for the transaction receipt.
Blocks until the transaction is confirmed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | [`ERC20Signer`](#erc20signer) | The signer containing the wallet client and account |
| `to` | `` `0x${string}` `` | The recipient address |
| `amount` | `bigint` | The amount to transfer (in the smallest unit) |

###### Returns

`Promise`\<`TransactionReceipt`\>

The transaction receipt

###### Throws

Error if the transaction fails

##### approve()

```ts
approve(
   signer: ERC20Signer, 
   spender: `0x${string}`, 
amount: bigint): Promise<`0x${string}`>;
```

Defined in: [src/contracts/erc20.ts:262](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L262)

Approves a spender to transfer tokens on behalf of the owner.
Returns immediately with the transaction hash without waiting for confirmation.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | [`ERC20Signer`](#erc20signer) | The signer containing the wallet client and account |
| `spender` | `` `0x${string}` `` | The address to approve |
| `amount` | `bigint` | The amount to approve (in the smallest unit) |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The transaction hash

###### Throws

Error if the transaction fails to submit

##### approveSync()

```ts
approveSync(
   signer: ERC20Signer, 
   spender: `0x${string}`, 
amount: bigint): Promise<TransactionReceipt>;
```

Defined in: [src/contracts/erc20.ts:285](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L285)

Approves a spender to transfer tokens and waits for the transaction receipt.
Blocks until the transaction is confirmed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | [`ERC20Signer`](#erc20signer) | The signer containing the wallet client and account |
| `spender` | `` `0x${string}` `` | The address to approve |
| `amount` | `bigint` | The amount to approve (in the smallest unit) |

###### Returns

`Promise`\<`TransactionReceipt`\>

The transaction receipt

###### Throws

Error if the transaction fails

##### transferFrom()

```ts
transferFrom(
   signer: ERC20Signer, 
   from: `0x${string}`, 
   to: `0x${string}`, 
amount: bigint): Promise<`0x${string}`>;
```

Defined in: [src/contracts/erc20.ts:306](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L306)

Transfers tokens from one address to another using an allowance.
The caller must have been approved by the `from` address.
Returns immediately with the transaction hash without waiting for confirmation.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | [`ERC20Signer`](#erc20signer) | The signer containing the wallet client and account |
| `from` | `` `0x${string}` `` | The address to transfer from |
| `to` | `` `0x${string}` `` | The address to transfer to |
| `amount` | `bigint` | The amount to transfer (in the smallest unit) |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The transaction hash

###### Throws

Error if the transaction fails to submit

##### transferFromSync()

```ts
transferFromSync(
   signer: ERC20Signer, 
   from: `0x${string}`, 
   to: `0x${string}`, 
amount: bigint): Promise<TransactionReceipt>;
```

Defined in: [src/contracts/erc20.ts:336](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L336)

Transfers tokens from one address to another and waits for the transaction receipt.
The caller must have been approved by the `from` address.
Blocks until the transaction is confirmed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | [`ERC20Signer`](#erc20signer) | The signer containing the wallet client and account |
| `from` | `` `0x${string}` `` | The address to transfer from |
| `to` | `` `0x${string}` `` | The address to transfer to |
| `amount` | `bigint` | The amount to transfer (in the smallest unit) |

###### Returns

`Promise`\<`TransactionReceipt`\>

The transaction receipt

###### Throws

Error if the transaction fails

##### formatAmount()

```ts
formatAmount(amount: bigint): Promise<string>;
```

Defined in: [src/contracts/erc20.ts:363](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L363)

Formats a token amount from the smallest unit to a human-readable string.
Uses the token's decimals for formatting.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `bigint` | The amount in the smallest unit (e.g., wei for 18-decimal tokens) |

###### Returns

`Promise`\<`string`\>

The formatted amount as a string (e.g., "1.5" for 1.5 tokens)

###### Throws

Error if decimals cannot be fetched

###### Example

```ts
// For a token with 18 decimals:
const formatted = await erc20.formatAmount(1500000000000000000n);
// Returns "1.5"
```

##### parseAmount()

```ts
parseAmount(amount: string): Promise<bigint>;
```

Defined in: [src/contracts/erc20.ts:382](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L382)

Parses a human-readable token amount to the smallest unit.
Uses the token's decimals for parsing.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `string` | The human-readable amount as a string (e.g., "1.5") |

###### Returns

`Promise`\<`bigint`\>

The amount in the smallest unit as a bigint

###### Throws

Error if decimals cannot be fetched

###### Throws

Error if the amount string is invalid

###### Example

```ts
// For a token with 18 decimals:
const parsed = await erc20.parseAmount("1.5");
// Returns 1500000000000000000n
```

##### clearCache()

```ts
clearCache(): void;
```

Defined in: [src/contracts/erc20.ts:391](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L391)

Clears the cached metadata (name, symbol, decimals).
Call this if the token contract has been upgraded or if you need fresh data.

###### Returns

`void`

***

### SignerNotFoundError

Defined in: [src/errors/account.ts:21](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L21)

Error thrown when a signer is required but not available.

#### Example

```typescript
try {
  await client.sendAndWait(undefined, to, value);
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

Defined in: [src/errors/account.ts:24](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L24)

###### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `'Signer is required'` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) | `{}` |

###### Returns

[`SignerNotFoundError`](#signernotfounderror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-5"></a> `name` | `readonly` | `"SignerNotFoundError"` | `'SignerNotFoundError'` | - | `RadiusError.name` | - | [src/errors/account.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L22) |
| <a id="shortmessage"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### InsufficientBalanceError

Defined in: [src/errors/account.ts:47](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L47)

Error thrown when account balance is insufficient for an operation.

#### Example

```typescript
try {
  await client.sendAndWait(signer, to, value);
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

Defined in: [src/errors/account.ts:57](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L57)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `address?`: `` `0x${string}` ``; `balance?`: `bigint`; `required?`: `bigint`; \} |

###### Returns

[`InsufficientBalanceError`](#insufficientbalanceerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-6"></a> `name` | `readonly` | `"InsufficientBalanceError"` | `'InsufficientBalanceError'` | - | `RadiusError.name` | - | [src/errors/account.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L48) |
| <a id="address-6"></a> `address?` | `readonly` | `` `0x${string}` `` | `undefined` | The account address | - | - | [src/errors/account.ts:51](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L51) |
| <a id="balance-2"></a> `balance?` | `readonly` | `bigint` | `undefined` | Current balance (in wei) | - | - | [src/errors/account.ts:53](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L53) |
| <a id="required"></a> `required?` | `readonly` | `bigint` | `undefined` | Required balance (in wei) | - | - | [src/errors/account.ts:55](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L55) |
| <a id="shortmessage-1"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-1"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-1"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-1"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-1"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### SigningError

Defined in: [src/errors/account.ts:79](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L79)

Error thrown when signing a message or transaction fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new SigningError(message: string, options: RadiusErrorOptions): SigningError;
```

Defined in: [src/errors/account.ts:82](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L82)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`SigningError`](#signingerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-7"></a> `name` | `readonly` | `"SigningError"` | `'SigningError'` | - | `RadiusError.name` | - | [src/errors/account.ts:80](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L80) |
| <a id="shortmessage-2"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-2"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-2"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-2"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-2"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### InvalidPrivateKeyError

Defined in: [src/errors/account.ts:94](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L94)

Error thrown when an invalid private key is provided.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new InvalidPrivateKeyError(message: string, options: RadiusErrorOptions): InvalidPrivateKeyError;
```

Defined in: [src/errors/account.ts:97](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L97)

###### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `'Invalid private key'` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) | `{}` |

###### Returns

[`InvalidPrivateKeyError`](#invalidprivatekeyerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-8"></a> `name` | `readonly` | `"InvalidPrivateKeyError"` | `'InvalidPrivateKeyError'` | - | `RadiusError.name` | - | [src/errors/account.ts:95](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L95) |
| <a id="shortmessage-3"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-3"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-3"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-3"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-3"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### InvalidAddressError

Defined in: [src/errors/account.ts:109](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L109)

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

Defined in: [src/errors/account.ts:115](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L115)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `invalidAddress?`: `string`; \} |

###### Returns

[`InvalidAddressError`](#invalidaddresserror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name-9"></a> `name` | `readonly` | `"InvalidAddressError"` | `'InvalidAddressError'` | - | `RadiusError.name` | - | [src/errors/account.ts:110](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L110) |
| <a id="invalidaddress"></a> `invalidAddress?` | `readonly` | `string` | `undefined` | The invalid address value | - | - | [src/errors/account.ts:113](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/account.ts#L113) |
| <a id="shortmessage-4"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-4"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-4"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-4"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-4"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### RadiusError

Defined in: [src/errors/base.ts:46](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L46)

Base error class for all Radius SDK errors.

Provides rich error context including:
- Short message for quick understanding
- Detailed error information
- Documentation links
- Error cause chain traversal

#### Example

```typescript
try {
  await client.sendAndWait(signer, to, value);
} catch (error) {
  if (error instanceof RadiusError) {
    console.log(error.shortMessage); // Quick description
    console.log(error.details);      // Full details
    console.log(error.docsPath);     // Link to docs
  }
}
```

#### Extends

- `Error`

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
- [`GasEstimationError`](#gasestimationerror)
- [`NonceError`](#nonceerror)
- [`TransactionFailedError`](#transactionfailederror)
- [`TransactionRevertedError`](#transactionrevertederror)
- [`TransactionTimeoutError`](#transactiontimeouterror)
- [`ServerError`](server/README.md#servererror)

#### Constructors

##### Constructor

```ts
new RadiusError(message: string, options: RadiusErrorOptions): RadiusError;
```

Defined in: [src/errors/base.ts:58](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L58)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`RadiusError`](#radiuserror)

###### Overrides

```ts
Error.constructor
```

#### Properties

| Property | Modifier | Type | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-6"></a> `shortMessage` | `readonly` | `string` | Short, human-readable error description | - | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-6"></a> `details?` | `readonly` | `string` | Detailed error information | - | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-6"></a> `docsPath?` | `readonly` | `string` | Documentation path for this error type | - | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-6"></a> `cause?` | `readonly` | `unknown` | The underlying cause of this error | `Error.cause` | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-6"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | Additional metadata | - | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |

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

***

### ContractCallError

Defined in: [src/errors/contract.ts:10](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L10)

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

Defined in: [src/errors/contract.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L20)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `contractAddress?`: `` `0x${string}` ``; `functionName?`: `string`; `args?`: readonly `unknown`[]; \} |

###### Returns

[`ContractCallError`](#contractcallerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-7"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-7"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-7"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-7"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-7"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-10"></a> `name` | `readonly` | `"ContractCallError"` | `'ContractCallError'` | - | `RadiusError.name` | - | [src/errors/contract.ts:11](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L11) |
| <a id="contractaddress-4"></a> `contractAddress?` | `readonly` | `` `0x${string}` `` | `undefined` | The contract address | - | - | [src/errors/contract.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L14) |
| <a id="functionname"></a> `functionName?` | `readonly` | `string` | `undefined` | The function name that was called | - | - | [src/errors/contract.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L16) |
| <a id="args"></a> `args?` | `readonly` | readonly `unknown`[] | `undefined` | The arguments passed to the function | - | - | [src/errors/contract.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L18) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### ContractDeploymentError

Defined in: [src/errors/contract.ts:42](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L42)

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

Defined in: [src/errors/contract.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L50)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `bytecode?`: `` `0x${string}` ``; `constructorArgs?`: readonly `unknown`[]; \} |

###### Returns

[`ContractDeploymentError`](#contractdeploymenterror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-8"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-8"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-8"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-8"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-8"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-11"></a> `name` | `readonly` | `"ContractDeploymentError"` | `'ContractDeploymentError'` | - | `RadiusError.name` | - | [src/errors/contract.ts:43](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L43) |
| <a id="bytecode"></a> `bytecode?` | `readonly` | `` `0x${string}` `` | `undefined` | The contract bytecode | - | - | [src/errors/contract.ts:46](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L46) |
| <a id="constructorargs"></a> `constructorArgs?` | `readonly` | readonly `unknown`[] | `undefined` | The constructor arguments | - | - | [src/errors/contract.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L48) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### AbiError

Defined in: [src/errors/contract.ts:70](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L70)

Error thrown when ABI encoding/decoding fails.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new AbiError(message: string, options: RadiusErrorOptions): AbiError;
```

Defined in: [src/errors/contract.ts:73](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L73)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) |

###### Returns

[`AbiError`](#abierror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-9"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-9"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-9"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-9"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-9"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-12"></a> `name` | `readonly` | `"AbiError"` | `'AbiError'` | - | `RadiusError.name` | - | [src/errors/contract.ts:71](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L71) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### MissingAbiError

Defined in: [src/errors/contract.ts:85](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L85)

Error thrown when a required contract ABI is missing.

#### Extends

- [`RadiusError`](#radiuserror)

#### Constructors

##### Constructor

```ts
new MissingAbiError(message: string, options: RadiusErrorOptions): MissingAbiError;
```

Defined in: [src/errors/contract.ts:88](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L88)

###### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `message` | `string` | `'Contract ABI is required'` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) | `{}` |

###### Returns

[`MissingAbiError`](#missingabierror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-10"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-10"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-10"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-10"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-10"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-13"></a> `name` | `readonly` | `"MissingAbiError"` | `'MissingAbiError'` | - | `RadiusError.name` | - | [src/errors/contract.ts:86](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/contract.ts#L86) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### TransactionFailedError

Defined in: [src/errors/transaction.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L22)

Error thrown when a transaction fails to execute.

#### Example

```typescript
try {
  await client.sendAndWait(signer, to, value);
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

Defined in: [src/errors/transaction.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L30)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `transactionHash?`: `` `0x${string}` ``; `reason?`: `string`; \} |

###### Returns

[`TransactionFailedError`](#transactionfailederror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-11"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-11"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-11"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-11"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-11"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-14"></a> `name` | `readonly` | `"TransactionFailedError"` | `'TransactionFailedError'` | - | `RadiusError.name` | - | [src/errors/transaction.ts:23](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L23) |
| <a id="transactionhash-1"></a> `transactionHash?` | `readonly` | `` `0x${string}` `` | `undefined` | The transaction hash (if available) | - | - | [src/errors/transaction.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L26) |
| <a id="reason"></a> `reason?` | `readonly` | `string` | `undefined` | The reason for failure | - | - | [src/errors/transaction.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L28) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### TransactionRevertedError

Defined in: [src/errors/transaction.ts:49](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L49)

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

Defined in: [src/errors/transaction.ts:61](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L61)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `transactionHash?`: `` `0x${string}` ``; `reason?`: `string`; `revertReason?`: `string`; `revertData?`: `` `0x${string}` ``; \} |

###### Returns

[`TransactionRevertedError`](#transactionrevertederror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-12"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-12"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-12"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-12"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-12"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-15"></a> `name` | `readonly` | `"TransactionRevertedError"` | `'TransactionRevertedError'` | - | `RadiusError.name` | - | [src/errors/transaction.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L50) |
| <a id="transactionhash-2"></a> `transactionHash?` | `readonly` | `` `0x${string}` `` | `undefined` | The transaction hash (if available) | - | - | [src/errors/transaction.ts:53](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L53) |
| <a id="reason-1"></a> `reason?` | `readonly` | `string` | `undefined` | The reason for failure | - | - | [src/errors/transaction.ts:55](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L55) |
| <a id="revertreason"></a> `revertReason?` | `readonly` | `string` | `undefined` | The revert reason (decoded if available) | - | - | [src/errors/transaction.ts:57](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L57) |
| <a id="revertdata"></a> `revertData?` | `readonly` | `` `0x${string}` `` | `undefined` | The raw revert data | - | - | [src/errors/transaction.ts:59](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L59) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### GasEstimationError

Defined in: [src/errors/transaction.ts:84](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L84)

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

Defined in: [src/errors/transaction.ts:92](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L92)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `to?`: `` `0x${string}` ``; `data?`: `` `0x${string}` ``; \} |

###### Returns

[`GasEstimationError`](#gasestimationerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-13"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-13"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-13"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-13"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-13"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-16"></a> `name` | `readonly` | `"GasEstimationError"` | `'GasEstimationError'` | - | `RadiusError.name` | - | [src/errors/transaction.ts:85](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L85) |
| <a id="to-4"></a> `to?` | `readonly` | `` `0x${string}` `` | `undefined` | The address being called | - | - | [src/errors/transaction.ts:88](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L88) |
| <a id="data-3"></a> `data?` | `readonly` | `` `0x${string}` `` | `undefined` | The call data | - | - | [src/errors/transaction.ts:90](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L90) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### NonceError

Defined in: [src/errors/transaction.ts:111](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L111)

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

Defined in: [src/errors/transaction.ts:119](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L119)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `nonce?`: `number`; `expectedNonce?`: `number`; \} |

###### Returns

[`NonceError`](#nonceerror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-14"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-14"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-14"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-14"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-14"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-17"></a> `name` | `readonly` | `"NonceError"` | `'NonceError'` | - | `RadiusError.name` | - | [src/errors/transaction.ts:112](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L112) |
| <a id="nonce-4"></a> `nonce?` | `readonly` | `number` | `undefined` | The nonce that was used | - | - | [src/errors/transaction.ts:115](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L115) |
| <a id="expectednonce"></a> `expectedNonce?` | `readonly` | `number` | `undefined` | The expected nonce | - | - | [src/errors/transaction.ts:117](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L117) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### TransactionTimeoutError

Defined in: [src/errors/transaction.ts:138](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L138)

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

Defined in: [src/errors/transaction.ts:146](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L146)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `options` | [`RadiusErrorOptions`](#radiuserroroptions) & \{ `transactionHash?`: `` `0x${string}` ``; `timeout?`: `number`; \} |

###### Returns

[`TransactionTimeoutError`](#transactiontimeouterror)

###### Overrides

[`RadiusError`](#radiuserror).[`constructor`](#constructor-12)

#### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="shortmessage-15"></a> `shortMessage` | `readonly` | `string` | `undefined` | Short, human-readable error description | - | [`RadiusError`](#radiuserror).[`shortMessage`](#shortmessage-6) | [src/errors/base.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L48) |
| <a id="details-15"></a> `details?` | `readonly` | `string` | `undefined` | Detailed error information | - | [`RadiusError`](#radiuserror).[`details`](#details-6) | [src/errors/base.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L50) |
| <a id="docspath-15"></a> `docsPath?` | `readonly` | `string` | `undefined` | Documentation path for this error type | - | [`RadiusError`](#radiuserror).[`docsPath`](#docspath-6) | [src/errors/base.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L52) |
| <a id="cause-15"></a> `cause?` | `readonly` | `unknown` | `undefined` | The underlying cause of this error | - | [`RadiusError`](#radiuserror).[`cause`](#cause-6) | [src/errors/base.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L54) |
| <a id="meta-15"></a> `meta?` | `readonly` | `Record`\<`string`, `unknown`\> | `undefined` | Additional metadata | - | [`RadiusError`](#radiuserror).[`meta`](#meta-6) | [src/errors/base.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L56) |
| <a id="name-18"></a> `name` | `readonly` | `"TransactionTimeoutError"` | `'TransactionTimeoutError'` | - | `RadiusError.name` | - | [src/errors/transaction.ts:139](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L139) |
| <a id="transactionhash-3"></a> `transactionHash?` | `readonly` | `` `0x${string}` `` | `undefined` | The transaction hash | - | - | [src/errors/transaction.ts:142](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L142) |
| <a id="timeout"></a> `timeout?` | `readonly` | `number` | `undefined` | How long we waited (in ms) | - | - | [src/errors/transaction.ts:144](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/transaction.ts#L144) |

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

[`RadiusError`](#radiuserror).[`walk`](#walk-10)

***

### InterceptingRoundTripper

Defined in: [src/transport/interceptor.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L8)

A RoundTripper implementation that intercepts HTTP requests and responses.
Provides request logging and response modification capabilities.

#### Implements

- [`RoundTripper`](#roundtripper)

#### Constructors

##### Constructor

```ts
new InterceptingRoundTripper(
   interceptor?: Interceptor, 
   logf?: Logf, 
   proxied?: RoundTripper): InterceptingRoundTripper;
```

Defined in: [src/transport/interceptor.ts:15](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L15)

Creates a new InterceptingRoundTripper.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `interceptor?` | [`Interceptor`](#interceptor-2) | Optional function to intercept and modify responses |
| `logf?` | [`Logf`](#logf) | Optional logging function to record requests and responses |
| `proxied?` | [`RoundTripper`](#roundtripper) | Underlying RoundTripper implementation (defaults to fetch-based implementation) |

###### Returns

[`InterceptingRoundTripper`](#interceptingroundtripper)

#### Methods

##### roundTrip()

```ts
roundTrip(request: Request): Promise<Response>;
```

Defined in: [src/transport/interceptor.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L26)

Sends a request and handles interception and logging of the response.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `request` | `Request` | The HTTP request to send |

###### Returns

`Promise`\<`Response`\>

The HTTP response, potentially modified by the interceptor

###### Implementation of

[`RoundTripper`](#roundtripper).[`roundTrip`](#roundtrip-2)

## Interfaces

### AccountOptions

Defined in: [src/accounts/options.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/options.ts#L14)

Options for creating an account.
Contains configuration values that can be set using functional options.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="account-2"></a> `account?` | \{ \} | The local account to use with this account | [src/accounts/options.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/options.ts#L18) |

***

### AccountClient

Defined in: [src/accounts/types.ts:9](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L9)

Client interface for account operations.
This interface is implemented by the main Radius Client and provides
core functionality for interacting with Radius accounts.

#### Methods

##### balanceAt()

```ts
balanceAt(address: `0x${string}`): Promise<bigint>;
```

Defined in: [src/accounts/types.ts:17](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L17)

Gets the balance of an account in wei.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | Address to check the balance for |

###### Returns

`Promise`\<`bigint`\>

The account balance in wei

###### Throws

Error if the balance cannot be retrieved from the network

##### chainID()

```ts
chainID(): Promise<bigint>;
```

Defined in: [src/accounts/types.ts:25](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L25)

Returns the Radius chain ID, which is used to sign transactions.

###### Returns

`Promise`\<`bigint`\>

The chain ID of the connected network

###### Throws

Error if the chain ID cannot be retrieved

##### estimateGas()

```ts
estimateGas(tx: Transaction): Promise<bigint>;
```

Defined in: [src/accounts/types.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L34)

Estimates the gas cost of a transaction with a safety margin.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tx` | [`Transaction`](#transaction) | Transaction to estimate gas for |

###### Returns

`Promise`\<`bigint`\>

The estimated gas cost in gas units

###### Throws

Error if the gas estimation fails

##### httpClient()

```ts
httpClient(): HttpClient;
```

Defined in: [src/accounts/types.ts:41](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L41)

Returns the HTTP client used by the client to make requests.

###### Returns

[`HttpClient`](#httpclient-2)

The HTTP client used for API requests

##### pendingNonceAt()

```ts
pendingNonceAt(address: `0x${string}`): Promise<number>;
```

Defined in: [src/accounts/types.ts:50](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L50)

Returns the next nonce (transaction count) for an account.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | Address to check the nonce for |

###### Returns

`Promise`\<`number`\>

The next nonce to use for transactions

###### Throws

Error if the nonce cannot be retrieved from the network

##### send()

```ts
send(
   account: {
}, 
   recipient: `0x${string}`, 
value: bigint): Promise<Receipt>;
```

Defined in: [src/accounts/types.ts:62](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/types.ts#L62)

Sends native currency to a recipient address.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `account` | \{ \} | The local account used to sign the transaction |
| `recipient` | `` `0x${string}` `` | Destination address to receive the funds |
| `value` | `bigint` | Amount of native currency to send in wei |

###### Returns

`Promise`\<[`Receipt`](#receipt)\>

Receipt of the completed transaction

###### Throws

Error if the transaction fails

###### Throws

Error if the transaction receipt is not returned

***

### RadiusReceipt

Defined in: [src/client/client.ts:54](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L54)

Receipt returned from transaction execution.
Contains information about the transaction result.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="transactionhash"></a> `transactionHash` | `` `0x${string}` `` | The transaction hash | [src/client/client.ts:56](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L56) |
| <a id="from"></a> `from` | `` `0x${string}` `` | The sender address | [src/client/client.ts:58](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L58) |
| <a id="to"></a> `to` | `` `0x${string}` `` \| `null` | The recipient address (or null for contract creation) | [src/client/client.ts:60](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L60) |
| <a id="contractaddress"></a> `contractAddress` | `` `0x${string}` `` \| `null` | The created contract address (if any) | [src/client/client.ts:62](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L62) |
| <a id="gasused"></a> `gasUsed` | `bigint` | The amount of gas used | [src/client/client.ts:64](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L64) |
| <a id="status"></a> `status` | `"success"` \| `"reverted"` | The transaction status (1 for success, 0 for failure) | [src/client/client.ts:66](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L66) |
| <a id="blocknumber"></a> `blockNumber` | `bigint` | The block number the transaction was included in | [src/client/client.ts:68](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L68) |
| <a id="blockhash"></a> `blockHash` | `` `0x${string}` `` | The block hash | [src/client/client.ts:70](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L70) |
| <a id="logs"></a> `logs` | `Log`\<`bigint`, `number`, `false`\>[] | Transaction logs | [src/client/client.ts:72](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L72) |

***

### RadiusClientConfig

Defined in: [src/client/client.ts:78](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L78)

Configuration options for creating a RadiusClient.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="chain"></a> `chain` | `Chain` | The chain configuration (use radiusTestnet or radiusMainnet from @radiustechsystems/sdk/chains) | [src/client/client.ts:80](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L80) |
| <a id="transport"></a> `transport?` | `Transport` | The viem transport to use (defaults to http transport based on chain config) | [src/client/client.ts:82](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L82) |
| <a id="interceptor"></a> `interceptor?` | [`Interceptor`](#interceptor-2) | Optional response interceptor for modifying or monitoring JSON-RPC responses | [src/client/client.ts:84](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L84) |
| <a id="logger"></a> `logger?` | [`Logf`](#logf) | Optional logger function for debugging request/response cycles | [src/client/client.ts:86](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L86) |

***

### ContractInstance

Defined in: [src/client/client.ts:93](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L93)

Contract interface for the client's call and execute methods.
Must have an ABI and address for contract interactions.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="abi"></a> `abi` | `Abi` | The contract's ABI | [src/client/client.ts:95](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L95) |
| <a id="address-2"></a> `address` | `` `0x${string}` `` | The contract's deployed address | [src/client/client.ts:97](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L97) |

***

### RadiusClient

Defined in: [src/client/client.ts:127](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L127)

The RadiusClient provides methods for interacting with the Radius platform.

This is the main entry point for:
- Reading blockchain state (balances, contract data, chain info)
- Sending transactions (native transfers, contract calls)
- Deploying smart contracts

#### Example

```typescript
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { http } from 'viem';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});

// Get balance
const balance = await client.getBalance('0x...');

// Send transaction and wait for receipt
const account = createPrivateKeySigner('0x...privateKey');
const receipt = await client.sendAndWait(account, '0x...recipient', 1000000000000000000n);
```

#### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="publicclient"></a> `publicClient` | `readonly` | \{ \} | The underlying viem PublicClient for advanced operations. | [src/client/client.ts:131](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L131) |

#### Methods

##### getChainId()

```ts
getChainId(): Promise<bigint>;
```

Defined in: [src/client/client.ts:137](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L137)

Get the chain ID of the connected network.

###### Returns

`Promise`\<`bigint`\>

The chain ID as a bigint

##### getBalance()

```ts
getBalance(address: `0x${string}`): Promise<bigint>;
```

Defined in: [src/client/client.ts:144](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L144)

Get the balance of an address in wei.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The address to check |

###### Returns

`Promise`\<`bigint`\>

The balance in wei

##### getCode()

```ts
getCode(address: `0x${string}`): Promise<`0x${string}`>;
```

Defined in: [src/client/client.ts:151](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L151)

Get the bytecode deployed at an address.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The contract address |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The bytecode as a hex string, or '0x' if no code

##### getNonce()

```ts
getNonce(address: `0x${string}`): Promise<number>;
```

Defined in: [src/client/client.ts:158](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L158)

Get the pending nonce for an address.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The address to check |

###### Returns

`Promise`\<`number`\>

The next nonce to use

##### estimateGas()

```ts
estimateGas(tx: TransactionRequest): Promise<bigint>;
```

Defined in: [src/client/client.ts:166](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L166)

Estimate gas for a transaction.
Applies a 20% safety margin and caps at MAX_GAS.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tx` | `TransactionRequest` | The transaction parameters |

###### Returns

`Promise`\<`bigint`\>

The estimated gas with safety margin

##### call()

```ts
call<T>(
   contract: ContractInstance, 
   method: string, ...
args: unknown[]): Promise<T>;
```

Defined in: [src/client/client.ts:175](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L175)

Call a read-only contract method (does not create a transaction).

###### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contract` | [`ContractInstance`](#contractinstance) | The contract instance with ABI and address |
| `method` | `string` | The method name to call |
| ...`args` | `unknown`[] | Arguments to pass to the method |

###### Returns

`Promise`\<`T`\>

The decoded return value(s) from the contract

##### execute()

```ts
execute(
   contract: ContractInstance, 
   signer: {
}, 
   method: string, ...
args: unknown[]): Promise<`0x${string}`>;
```

Defined in: [src/client/client.ts:186](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L186)

Execute a state-changing contract method.
Returns immediately after the transaction is sent (does not wait for receipt).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contract` | [`ContractInstance`](#contractinstance) | The contract instance with ABI and address |
| `signer` | \{ \} | The signer to sign the transaction |
| `method` | `string` | The method name to execute |
| ...`args` | `unknown`[] | Arguments to pass to the method |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The transaction hash

##### executeAndWait()

```ts
executeAndWait(
   contract: ContractInstance, 
   signer: {
}, 
   method: string, ...
args: unknown[]): Promise<RadiusReceipt>;
```

Defined in: [src/client/client.ts:201](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L201)

Execute a state-changing contract method and wait for the receipt.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contract` | [`ContractInstance`](#contractinstance) | The contract instance with ABI and address |
| `signer` | \{ \} | The signer to sign the transaction |
| `method` | `string` | The method name to execute |
| ...`args` | `unknown`[] | Arguments to pass to the method |

###### Returns

`Promise`\<[`RadiusReceipt`](#radiusreceipt)\>

The transaction receipt

##### ~~executeSync()~~

```ts
executeSync(
   contract: ContractInstance, 
   signer: {
}, 
   method: string, ...
args: unknown[]): Promise<RadiusReceipt>;
```

Defined in: [src/client/client.ts:211](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L211)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `contract` | [`ContractInstance`](#contractinstance) |
| `signer` | \{ \} |
| `method` | `string` |
| ...`args` | `unknown`[] |

###### Returns

`Promise`\<[`RadiusReceipt`](#radiusreceipt)\>

###### Deprecated

Use executeAndWait instead

##### send()

```ts
send(
   signer: {
}, 
   to: `0x${string}`, 
value: bigint): Promise<`0x${string}`>;
```

Defined in: [src/client/client.ts:226](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L226)

Send native currency to an address.
Returns immediately after the transaction is sent (does not wait for receipt).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | \{ \} | The signer to sign the transaction |
| `to` | `` `0x${string}` `` | The recipient address |
| `value` | `bigint` | The amount to send in wei |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The transaction hash

##### sendAndWait()

```ts
sendAndWait(
   signer: {
}, 
   to: `0x${string}`, 
value: bigint): Promise<RadiusReceipt>;
```

Defined in: [src/client/client.ts:235](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L235)

Send native currency to an address and wait for the receipt.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | \{ \} | The signer to sign the transaction |
| `to` | `` `0x${string}` `` | The recipient address |
| `value` | `bigint` | The amount to send in wei |

###### Returns

`Promise`\<[`RadiusReceipt`](#radiusreceipt)\>

The transaction receipt

##### ~~sendSync()~~

```ts
sendSync(
   signer: {
}, 
   to: `0x${string}`, 
value: bigint): Promise<RadiusReceipt>;
```

Defined in: [src/client/client.ts:240](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L240)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `signer` | \{ \} |
| `to` | `` `0x${string}` `` |
| `value` | `bigint` |

###### Returns

`Promise`\<[`RadiusReceipt`](#radiusreceipt)\>

###### Deprecated

Use sendAndWait instead

##### deployContract()

```ts
deployContract(
   signer: {
}, 
   bytecode: `0x${string}`, 
   abi: Abi, ...
   args: unknown[]): Promise<{
  address: `0x${string}`;
  receipt: RadiusReceipt;
}>;
```

Defined in: [src/client/client.ts:250](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L250)

Deploy a smart contract.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signer` | \{ \} | The signer to sign the deployment transaction |
| `bytecode` | `` `0x${string}` `` | The contract bytecode |
| `abi` | `Abi` | The contract ABI |
| ...`args` | `unknown`[] | Constructor arguments (if any) |

###### Returns

`Promise`\<\{
  `address`: `` `0x${string}` ``;
  `receipt`: [`RadiusReceipt`](#radiusreceipt);
\}\>

The deployed contract address and transaction receipt

##### sendRawTransaction()

```ts
sendRawTransaction(signedTx: `0x${string}`): Promise<`0x${string}`>;
```

Defined in: [src/client/client.ts:263](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L263)

Send a raw signed transaction.
Returns immediately after the transaction is sent.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `signedTx` | `` `0x${string}` `` | The signed transaction as a hex string |

###### Returns

`Promise`\<`` `0x${string}` ``\>

The transaction hash

##### waitForReceipt()

```ts
waitForReceipt(hash: `0x${string}`): Promise<RadiusReceipt>;
```

Defined in: [src/client/client.ts:270](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L270)

Wait for a transaction receipt.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hash` | `` `0x${string}` `` | The transaction hash to wait for |

###### Returns

`Promise`\<[`RadiusReceipt`](#radiusreceipt)\>

The transaction receipt

##### extend()

```ts
extend<TExtension>(extender: (client: RadiusClient) => TExtension): RadiusClient & TExtension;
```

Defined in: [src/client/client.ts:290](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L290)

Extend the client with custom actions.

###### Type Parameters

| Type Parameter |
| ------ |
| `TExtension` *extends* `Record`\<`string`, `unknown`\> |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `extender` | (`client`: [`RadiusClient`](#radiusclient)) => `TExtension` | A function that receives the base client and returns custom actions |

###### Returns

[`RadiusClient`](#radiusclient) & `TExtension`

A new client with the custom actions added

###### Example

```typescript
const client = createRadiusClient({ chain: radiusTestnet }).extend((base) => ({
  async getBalanceFormatted(address: Address) {
    const balance = await base.getBalance(address);
    return formatEther(balance);
  },
}));

const formatted = await client.getBalanceFormatted('0x...');
```

***

### ~~Receipt~~

Defined in: [src/common/receipt.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L18)

Receipt represents the result of a successfully mined transaction.
Contains information about the transaction execution including gas usage,
emitted events, and contract creation if applicable.

#### Deprecated

Use RadiusReceipt from '@radiustechsystems/sdk/client' instead.
This type is kept for backwards compatibility but will be removed in v3.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="from-1"></a> ~~`from`~~ | `` `0x${string}` `` | The sender address | [src/common/receipt.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L20) |
| <a id="to-1"></a> ~~`to`~~ | `` `0x${string}` `` \| `null` | The recipient address (or null for contract creation) | [src/common/receipt.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L22) |
| <a id="contractaddress-1"></a> ~~`contractAddress`~~ | `` `0x${string}` `` \| `null` | The created contract address (if any) | [src/common/receipt.ts:24](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L24) |
| <a id="txhash"></a> ~~`txHash`~~ | `` `0x${string}` `` | The transaction hash | [src/common/receipt.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L26) |
| <a id="gasused-1"></a> ~~`gasUsed`~~ | `bigint` | The amount of gas used | [src/common/receipt.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L28) |
| <a id="status-1"></a> ~~`status`~~ | [`TransactionStatus`](#transactionstatus) | The transaction status - 'success' or 'reverted' | [src/common/receipt.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L30) |
| <a id="logs-1"></a> ~~`logs`~~ | [`Event`](#event)[] | The transaction logs/events | [src/common/receipt.ts:32](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L32) |
| <a id="value"></a> ~~`value?`~~ | `bigint` | The amount of native currency (USD) transferred | [src/common/receipt.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L34) |

***

### TransactionParams

Defined in: [src/common/transaction.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L14)

Transaction parameters for building unsigned transactions.
This interface represents the data needed to construct a Radius transaction.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="data-1"></a> `data?` | `` `0x${string}` `` | The call data for the transaction (bytecode for contract creation, or method call data) | [src/common/transaction.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L16) |
| <a id="gas"></a> `gas?` | `bigint` | Maximum amount of gas units the transaction can consume | [src/common/transaction.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L18) |
| <a id="gasprice"></a> `gasPrice?` | `bigint` | Price per gas unit in wei (typically 0n on Radius) | [src/common/transaction.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L20) |
| <a id="nonce-2"></a> `nonce?` | `number` | Sequential transaction number for the sending account | [src/common/transaction.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L22) |
| <a id="to-2"></a> `to?` | `` `0x${string}` `` | Destination address (undefined for contract creation) | [src/common/transaction.ts:24](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L24) |
| <a id="value-1"></a> `value?` | `bigint` | Amount of native currency to send in wei | [src/common/transaction.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L26) |
| <a id="chainid-2"></a> `chainId?` | `number` | Chain ID for EIP-155 replay protection | [src/common/transaction.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L28) |

***

### ContractClient

Defined in: [src/contracts/types.ts:9](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/types.ts#L9)

Client interface for interacting with smart contracts on the Radius platform.
Implemented by the main Radius Client.

#### Methods

##### call()

```ts
call(
   contract: Contract, 
   method: string, ...
args: unknown[]): Promise<unknown[]>;
```

Defined in: [src/contracts/types.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/types.ts#L20)

Calls a read-only contract method without creating a transaction

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contract` | [`Contract`](#contract) | Contract instance to interact with |
| `method` | `string` | Name of the method to call on the contract |
| ...`args` | `unknown`[] | Arguments to pass to the contract method |

###### Returns

`Promise`\<`unknown`[]\>

Array of decoded return values from the contract method

###### Throws

Error if the contract ABI is missing

###### Throws

Error if the contract address is missing or zero

###### Throws

Error if the contract method call fails

##### execute()

```ts
execute(
   contract: Contract, 
   account: {
}, 
   method: string, ...
args: unknown[]): Promise<Receipt>;
```

Defined in: [src/contracts/types.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/types.ts#L34)

Executes a contract method that modifies Radius state

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contract` | [`Contract`](#contract) | Contract instance to interact with |
| `account` | \{ \} | The local account used to sign the transaction |
| `method` | `string` | Name of the method to execute on the contract |
| ...`args` | `unknown`[] | Arguments to pass to the contract method |

###### Returns

`Promise`\<[`Receipt`](#receipt)\>

Transaction receipt after the method execution

###### Throws

Error if the contract ABI is missing

###### Throws

Error if the contract address is missing or zero

###### Throws

Error if the transaction fails or is reverted

###### Throws

Error if the transaction receipt is not returned

***

### SigningKey

Defined in: [src/crypto/types.ts:6](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/types.ts#L6)

A key pair used for signing and verifying messages.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="publickey"></a> `publicKey` | `Uint8Array` | Public key | [src/crypto/types.ts:7](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/types.ts#L7) |
| <a id="privatekey"></a> `privateKey` | `Uint8Array` | Private key | [src/crypto/types.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/types.ts#L8) |

***

### RadiusErrorOptions

Defined in: [src/errors/base.ts:11](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L11)

Options for creating a RadiusError

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="shortmessage-5"></a> `shortMessage?` | `string` | Short description of what went wrong | [src/errors/base.ts:13](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L13) |
| <a id="details-5"></a> `details?` | `string` | Detailed error information | [src/errors/base.ts:15](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L15) |
| <a id="docspath-5"></a> `docsPath?` | `string` | URL path to relevant documentation | [src/errors/base.ts:17](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L17) |
| <a id="cause-5"></a> `cause?` | `unknown` | The underlying cause of this error | [src/errors/base.ts:19](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L19) |
| <a id="meta-5"></a> `meta?` | `Record`\<`string`, `unknown`\> | Additional metadata about the error | [src/errors/base.ts:21](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/base.ts#L21) |

***

### InterceptingTransportOptions

Defined in: [src/transport/interceptor.ts:101](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L101)

Options for creating an intercepting transport.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url"></a> `url` | `string` | The RPC URL to connect to | [src/transport/interceptor.ts:103](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L103) |
| <a id="interceptor-1"></a> `interceptor?` | [`Interceptor`](#interceptor-2) | Optional function to intercept and modify responses | [src/transport/interceptor.ts:105](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L105) |
| <a id="logger-1"></a> `logger?` | [`Logf`](#logf) | Optional logging function | [src/transport/interceptor.ts:107](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L107) |

***

### RoundTripper

Defined in: [src/transport/types.ts:22](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/types.ts#L22)

An interface for making HTTP requests and receiving responses
Based on the concept of http.RoundTripper from Go's standard library

#### Methods

##### roundTrip()

```ts
roundTrip(request: Request): Promise<Response>;
```

Defined in: [src/transport/types.ts:29](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/types.ts#L29)

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

Defined in: [src/transport/websocket.ts:10](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/websocket.ts#L10)

Configuration for creating a WebSocket transport.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="url-1"></a> `url?` | `string` | The WebSocket URL (defaults to chain's WebSocket RPC URL) | [src/transport/websocket.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/websocket.ts#L12) |
| <a id="reconnectattempts"></a> `reconnectAttempts?` | `number` | Maximum number of reconnection attempts (defaults to 3) | [src/transport/websocket.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/websocket.ts#L14) |
| <a id="reconnectdelay"></a> `reconnectDelay?` | `number` | Reconnection delay in milliseconds (defaults to 1000) | [src/transport/websocket.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/websocket.ts#L16) |
| <a id="keepalive"></a> `keepAlive?` | `number` | Keep-alive interval in milliseconds (optional) | [src/transport/websocket.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/websocket.ts#L18) |

## Type Aliases

### AccountOption()

```ts
type AccountOption = (options: AccountOptions) => Promise<void>;
```

Defined in: [src/accounts/options.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/options.ts#L8)

A function that configures a Radius account.
This is used as a functional option pattern for creating new accounts.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`AccountOptions`](#accountoptions) |

#### Returns

`Promise`\<`void`\>

***

### BytesLike

```ts
type BytesLike = Uint8Array | Hex | string;
```

Defined in: [src/common/address.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/address.ts#L18)

BytesLike represents data that can be converted to bytes

***

### HttpClient()

```ts
type HttpClient = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
```

Defined in: [src/common/http.ts:4](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/http.ts#L4)

A function interface that matches the Fetch API, for making HTTP requests.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` \| `URL` \| `Request` |
| `init?` | `RequestInit` |

#### Returns

`Promise`\<`Response`\>

***

### TransactionStatus

```ts
type TransactionStatus = "success" | "reverted";
```

Defined in: [src/common/receipt.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L8)

Transaction status as returned by viem

***

### ~~BigNumberish~~

```ts
type BigNumberish = bigint | number | string;
```

Defined in: [src/common/transaction.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/transaction.ts#L8)

BigNumberish represents values that can be converted to bigint

#### Deprecated

Prefer using `bigint` directly for cleaner types

***

### ERC20Signer

```ts
type ERC20Signer = {
  walletClient: WalletClient;
  account: Account;
};
```

Defined in: [src/contracts/erc20.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L34)

Signer type that can be used for write operations.
Combines a WalletClient with an Account for transaction signing.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="walletclient"></a> `walletClient` | `WalletClient` | [src/contracts/erc20.ts:35](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L35) |
| <a id="account-3"></a> `account` | `Account` | [src/contracts/erc20.ts:36](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L36) |

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

Defined in: [src/errors/index.ts:66](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/index.ts#L66)

Error types that can be thrown by sendTransaction operations.

***

### CallContractErrorType

```ts
type CallContractErrorType = 
  | ContractCallError
  | MissingAbiError
  | AbiError;
```

Defined in: [src/errors/index.ts:78](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/index.ts#L78)

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

Defined in: [src/errors/index.ts:86](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/index.ts#L86)

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

Defined in: [src/errors/index.ts:98](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/index.ts#L98)

Error types that can be thrown by contract deployment operations.

***

### SigningErrorType

```ts
type SigningErrorType = 
  | SigningError
  | SignerNotFoundError
  | InvalidPrivateKeyError;
```

Defined in: [src/errors/index.ts:109](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/errors/index.ts#L109)

Error types that can be thrown by signing operations.

***

### Logf()

```ts
type Logf = (message: string, data?: Record<string, unknown>) => void;
```

Defined in: [src/transport/types.ts:7](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/types.ts#L7)

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

Defined in: [src/transport/types.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/types.ts#L16)

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

### RADIUS\_TESTNET\_CONTRACTS

```ts
const RADIUS_TESTNET_CONTRACTS: {
  sbc: "0xF966020a30946A64B39E2e243049036367590858";
};
```

Defined in: [src/chains/radius.ts:6](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L6)

Well-known contract addresses on Radius Testnet

#### Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sbc"></a> `sbc` | `"0xF966020a30946A64B39E2e243049036367590858"` | SBC token contract | [src/chains/radius.ts:8](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L8) |

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
     sbc: {
        address: "0xF966020a30946A64B39E2e243049036367590858";
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

Defined in: [src/chains/radius.ts:25](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L25)

Radius Testnet chain configuration.

Chain ID: 1223953 (0x12ad11)
RPC: https://rpc.testnet.radiustech.xyz

#### Type Declaration

| Name | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="blockexplorers"></a> `blockExplorers` | \{ `default`: \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.testnet.radiustech.xyz"`; \}; \} | - | Collection of block explorers | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:15 |
| `blockExplorers.default` | \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.testnet.radiustech.xyz"`; \} | - | - | [src/chains/radius.ts:39](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L39) |
| `blockExplorers.default.name` | `"Radius Explorer"` | `'Radius Explorer'` | - | [src/chains/radius.ts:40](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L40) |
| `blockExplorers.default.url` | `"https://explorer.testnet.radiustech.xyz"` | `'https://explorer.testnet.radiustech.xyz'` | - | [src/chains/radius.ts:41](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L41) |
| <a id="contracts"></a> `contracts` | \{ `sbc`: \{ `address`: `"0xF966020a30946A64B39E2e243049036367590858"`; \}; \} | - | Collection of contracts | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:22 |
| `contracts.sbc` | \{ `address`: `"0xF966020a30946A64B39E2e243049036367590858"`; \} | - | SBC token contract address | [src/chains/radius.ts:46](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L46) |
| `contracts.sbc.address` | `"0xF966020a30946A64B39E2e243049036367590858"` | `RADIUS_TESTNET_CONTRACTS.sbc` | - | [src/chains/radius.ts:47](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L47) |
| <a id="id"></a> `id` | `1223953` | - | ID in number form | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:35 |
| <a id="name"></a> `name` | `"Radius Testnet"` | - | Human-readable name | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:37 |
| <a id="nativecurrency"></a> `nativeCurrency` | \{ `decimals`: `18`; `name`: `"USD"`; `symbol`: `"USD"`; \} | - | Currency used by chain | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:39 |
| `nativeCurrency.decimals` | `18` | `18` | - | [src/chains/radius.ts:29](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L29) |
| `nativeCurrency.name` | `"USD"` | `'USD'` | - | [src/chains/radius.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L30) |
| `nativeCurrency.symbol` | `"USD"` | `'USD'` | - | [src/chains/radius.ts:31](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L31) |
| <a id="rpcurls"></a> `rpcUrls` | \{ `default`: \{ `http`: readonly \[`"https://rpc.testnet.radiustech.xyz"`\]; \}; \} | - | Collection of RPC endpoints | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:43 |
| `rpcUrls.default` | \{ `http`: readonly \[`"https://rpc.testnet.radiustech.xyz"`\]; \} | - | - | [src/chains/radius.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L34) |
| `rpcUrls.default.http` | readonly \[`"https://rpc.testnet.radiustech.xyz"`\] | - | - | [src/chains/radius.ts:35](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L35) |
| <a id="testnet"></a> `testnet` | `true` | - | Flag for test networks | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:50 |

#### Example

```typescript
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

// Access well-known contract addresses
const sbcAddress = radiusTestnet.contracts?.sbc?.address;
```

***

### RADIUS\_MAINNET\_CONTRACTS

```ts
const RADIUS_MAINNET_CONTRACTS: {
  sbc: "0x0000000000000000000000000000000000000000";
};
```

Defined in: [src/chains/radius.ts:57](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L57)

Well-known contract addresses on Radius Mainnet
Note: These are placeholder values until mainnet launches

#### Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sbc-1"></a> `sbc` | `"0x0000000000000000000000000000000000000000"` | SBC token contract (placeholder) | [src/chains/radius.ts:59](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L59) |

***

### radiusMainnet

```ts
const radiusMainnet: {
  blockExplorers: {
     default: {
        name: "Radius Explorer";
        url: "https://explorer.radiustech.xyz";
     };
  };
  contracts: {
     sbc: {
        address: "0x0000000000000000000000000000000000000000";
     };
  };
  id: 1223954;
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

Defined in: [src/chains/radius.ts:68](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L68)

Radius Mainnet chain configuration.

Note: Mainnet chain ID and RPC URL TBD - using placeholder values.
Update these when mainnet launches.

#### Type Declaration

| Name | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="blockexplorers-1"></a> `blockExplorers` | \{ `default`: \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.radiustech.xyz"`; \}; \} | - | Collection of block explorers | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:15 |
| `blockExplorers.default` | \{ `name`: `"Radius Explorer"`; `url`: `"https://explorer.radiustech.xyz"`; \} | - | - | [src/chains/radius.ts:82](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L82) |
| `blockExplorers.default.name` | `"Radius Explorer"` | `'Radius Explorer'` | - | [src/chains/radius.ts:83](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L83) |
| `blockExplorers.default.url` | `"https://explorer.radiustech.xyz"` | `'https://explorer.radiustech.xyz'` | - | [src/chains/radius.ts:84](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L84) |
| <a id="contracts-1"></a> `contracts` | \{ `sbc`: \{ `address`: `"0x0000000000000000000000000000000000000000"`; \}; \} | - | Collection of contracts | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:22 |
| `contracts.sbc` | \{ `address`: `"0x0000000000000000000000000000000000000000"`; \} | - | SBC token contract address (placeholder) | [src/chains/radius.ts:89](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L89) |
| `contracts.sbc.address` | `"0x0000000000000000000000000000000000000000"` | `RADIUS_MAINNET_CONTRACTS.sbc` | - | [src/chains/radius.ts:90](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L90) |
| <a id="id-1"></a> `id` | `1223954` | - | ID in number form | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:35 |
| <a id="name-1"></a> `name` | `"Radius"` | - | Human-readable name | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:37 |
| <a id="nativecurrency-1"></a> `nativeCurrency` | \{ `decimals`: `18`; `name`: `"USD"`; `symbol`: `"USD"`; \} | - | Currency used by chain | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:39 |
| `nativeCurrency.decimals` | `18` | `18` | - | [src/chains/radius.ts:72](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L72) |
| `nativeCurrency.name` | `"USD"` | `'USD'` | - | [src/chains/radius.ts:73](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L73) |
| `nativeCurrency.symbol` | `"USD"` | `'USD'` | - | [src/chains/radius.ts:74](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L74) |
| <a id="rpcurls-1"></a> `rpcUrls` | \{ `default`: \{ `http`: readonly \[`"https://rpc.radiustech.xyz"`\]; \}; \} | - | Collection of RPC endpoints | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:43 |
| `rpcUrls.default` | \{ `http`: readonly \[`"https://rpc.radiustech.xyz"`\]; \} | - | - | [src/chains/radius.ts:77](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L77) |
| `rpcUrls.default.http` | readonly \[`"https://rpc.radiustech.xyz"`\] | - | - | [src/chains/radius.ts:78](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/chains/radius.ts#L78) |
| <a id="testnet-1"></a> `testnet` | `false` | - | Flag for test networks | node\_modules/.pnpm/viem@2.43.4\_typescript@5.9.3/node\_modules/viem/\_types/types/chain.d.ts:50 |

***

### MAX\_GAS

```ts
const MAX_GAS: 1319413953330n = 1319413953330n;
```

Defined in: [src/client/client.ts:48](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L48)

Maximum gas limit for transactions.
Used to cap gas estimates to prevent unexpectedly high costs.

***

### ZERO\_ADDRESS

```ts
const ZERO_ADDRESS: ViemAddress = '0x0000000000000000000000000000000000000000';
```

Defined in: [src/common/address.ts:75](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/address.ts#L75)

Zero address constant (0x0000000000000000000000000000000000000000)

***

### ERC20\_ABI

```ts
const ERC20_ABI: readonly [{
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
}];
```

Defined in: [src/contracts/erc20.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L16)

Standard ERC-20 ABI definition using viem's parseAbi.
Includes all standard ERC-20 functions and events.

## Functions

### withPrivateKey()

```ts
function withPrivateKey(key: `0x${string}`): AccountOption;
```

Defined in: [src/accounts/options.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/options.ts#L30)

Create an AccountOption that sets the account address and signer using a private key.
The private key will be stored in memory, so for production systems with high security
requirements, consider using withAccount instead, along with a hardware security module
or key management service.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `` `0x${string}` `` | Private key as a hex string |

#### Returns

[`AccountOption`](#accountoption)

An AccountOption function that configures an Account with the provided private key

***

### withAccount()

```ts
function withAccount(account: {
}): AccountOption;
```

Defined in: [src/accounts/options.ts:44](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/accounts/options.ts#L44)

Create an AccountOption that sets the account address and signer using a custom LocalAccount.
This is useful when you want to use a custom signing implementation, such as a hardware
security module or key management service.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `account` | \{ \} | LocalAccount instance for signing transactions and messages |

#### Returns

[`AccountOption`](#accountoption)

An AccountOption function that configures an Account with the provided account

***

### createPrivateKeySigner()

```ts
function createPrivateKeySigner(privateKey: `0x${string}`): {
};
```

Defined in: [src/auth/privatekey/signer.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/auth/privatekey/signer.ts#L18)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `privateKey` | `` `0x${string}` `` |

#### Returns

```ts
{
}
```

***

### createRadiusClient()

```ts
function createRadiusClient(config: RadiusClientConfig): RadiusClient;
```

Defined in: [src/client/client.ts:355](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/client/client.ts#L355)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`RadiusClientConfig`](#radiusclientconfig) |

#### Returns

[`RadiusClient`](#radiusclient)

***

### addressToBytes()

```ts
function addressToBytes(address: `0x${string}`): Uint8Array;
```

Defined in: [src/common/address.ts:32](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/address.ts#L32)

Converts an address to a byte array.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The address to convert (hex string with 0x prefix) |

#### Returns

`Uint8Array`

Byte array representation of the 20-byte address

#### Example

```typescript
const bytes = addressToBytes('0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1');
console.log(bytes.length); // 20
```

***

### isAddressEqual()

```ts
function isAddressEqual(a: `0x${string}`, b: `0x${string}`): boolean;
```

Defined in: [src/common/address.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/address.ts#L52)

Compares two addresses for equality (case-insensitive).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | `` `0x${string}` `` | First address to compare |
| `b` | `` `0x${string}` `` | Second address to compare |

#### Returns

`boolean`

True if addresses are equal, false otherwise

#### Example

```typescript
const isEqual = isAddressEqual(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1',
  '0x742d35cc6634c0532925a3b844bc9e7595f7e9f1'
);
console.log(isEqual); // true
```

***

### toChecksumAddress()

```ts
function toChecksumAddress(address: `0x${string}`): `0x${string}`;
```

Defined in: [src/common/address.ts:68](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/address.ts#L68)

Converts an address to checksummed format.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The address to checksum |

#### Returns

`` `0x${string}` ``

Checksummed address string

#### Example

```typescript
const checksummed = toChecksumAddress('0x742d35cc6634c0532925a3b844bc9e7595f7e9f1');
console.log(checksummed); // '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1'
```

***

### ~~createReceipt()~~

```ts
function createReceipt(
   from: `0x${string}`, 
   to: `0x${string}` | null, 
   contractAddress: `0x${string}` | null, 
   txHash: `0x${string}`, 
   gasUsed: bigint, 
   status: TransactionStatus, 
   logs: Event[], 
   value?: bigint): Receipt;
```

Defined in: [src/common/receipt.ts:42](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/receipt.ts#L42)

Creates a Receipt object.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `from` | `` `0x${string}` `` | `undefined` |
| `to` | `` `0x${string}` `` \| `null` | `undefined` |
| `contractAddress` | `` `0x${string}` `` \| `null` | `undefined` |
| `txHash` | `` `0x${string}` `` | `undefined` |
| `gasUsed` | `bigint` | `undefined` |
| `status` | [`TransactionStatus`](#transactionstatus) | `undefined` |
| `logs` | [`Event`](#event)[] | `[]` |
| `value?` | `bigint` | `undefined` |

#### Returns

[`Receipt`](#receipt)

#### Deprecated

Use RadiusReceipt from '@radiustechsystems/sdk/client' instead.

***

### abiFromJSON()

```ts
function abiFromJSON(json: string): ABI | undefined;
```

Defined in: [src/common/utils.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L20)

Creates a new ABI (Application Binary Interface) from a JSON string

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `json` | `string` | ABI definition in JSON string format |

#### Returns

[`ABI`](#abi-1) \| `undefined`

A new ABI instance, or undefined if the JSON is invalid

***

### addressFromHex()

```ts
function addressFromHex(hex: string): `0x${string}`;
```

Defined in: [src/common/utils.ts:42](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L42)

Normalizes and validates an address string.
Returns a checksummed viem Address type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hex` | `string` | Hex string with or without 0x prefix |

#### Returns

`` `0x${string}` ``

Checksummed address

#### Throws

Error if the hex string is invalid

#### Example

```typescript
const address = addressFromHex('742d35cc6634c0532925a3b844bc9e7595f7e9f1');
// Returns: '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1'
```

***

### bytecodeFromHex()

```ts
function bytecodeFromHex(s: string): Uint8Array<ArrayBufferLike> | undefined;
```

Defined in: [src/common/utils.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L52)

Converts a hex string to a byte array

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `s` | `string` | Hex string (with or without 0x prefix) |

#### Returns

`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

Byte array representation of the hex string, or undefined if the string is not valid hex

***

### eventsFromEthLogs()

```ts
function eventsFromEthLogs(logs: Log[]): Event[];
```

Defined in: [src/common/utils.ts:66](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L66)

Converts Ethereum logs to Radius events

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `logs` | `Log`[] | Ethereum logs |

#### Returns

[`Event`](#event)[]

Array of Radius events

***

### hashFromHex()

```ts
function hashFromHex(hex: string): Hash;
```

Defined in: [src/common/utils.ts:77](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L77)

Normalizes a hash string to proper hex format.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hex` | `string` | The hexadecimal string (with or without 0x prefix) |

#### Returns

`Hash`

Normalized hash with 0x prefix

#### Throws

Error if the hex string is invalid

***

### ~~receiptFromEthReceipt()~~

```ts
function receiptFromEthReceipt(
   receipt: TransactionReceipt, 
   from?: `0x${string}`, 
   to?: `0x${string}`, 
   value?: bigint): Receipt;
```

Defined in: [src/common/utils.ts:93](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L93)

Creates a new Radius receipt from an Ethereum/viem receipt.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `receipt` | `TransactionReceipt` | viem TransactionReceipt |
| `from?` | `` `0x${string}` `` | Sender address (optional, uses receipt.from) |
| `to?` | `` `0x${string}` `` | Recipient address (optional, uses receipt.to) |
| `value?` | `bigint` | Transaction value (optional) |

#### Returns

[`Receipt`](#receipt)

Radius Receipt

#### Deprecated

Use RadiusReceipt from client directly instead

***

### ~~zeroAddress()~~

```ts
function zeroAddress(): `0x${string}`;
```

Defined in: [src/common/utils.ts:119](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/common/utils.ts#L119)

Returns the zero address constant.

#### Returns

`` `0x${string}` ``

The zero address (0x0000000000000000000000000000000000000000)

#### Deprecated

Import ZERO_ADDRESS constant directly instead

***

### createERC20()

```ts
function createERC20(address: `0x${string}`, publicClient: {
}): ERC20;
```

Defined in: [src/contracts/erc20.ts:419](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/contracts/erc20.ts#L419)

Factory function to create an ERC20 instance.
Provides a convenient way to instantiate the ERC20 class.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `` `0x${string}` `` | The token contract address (must be a valid 0x-prefixed hex string) |
| `publicClient` | \{ \} | The viem PublicClient to use for read operations |

#### Returns

[`ERC20`](#erc20)

A new ERC20 instance

#### Example

```ts
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { createERC20 } from '@radiustechsystems/sdk';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const usdc = createERC20('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', publicClient);
const balance = await usdc.balanceOf('0x...');
```

***

### hexToSigningKey()

```ts
function hexToSigningKey(key: string): SigningKey;
```

Defined in: [src/crypto/utils.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/utils.ts#L26)

Convert a hex string private key to a SigningKey.
Creates an account from the private key to extract the public key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | Hex string of the private key (with or without 0x prefix) |

#### Returns

[`SigningKey`](#signingkey)

SigningKey containing both public and private keys

***

### keccak256()

```ts
function keccak256(data: BytesLike | BytesLike[]): Uint8Array;
```

Defined in: [src/crypto/utils.ts:45](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/utils.ts#L45)

Calculate the Keccak256 hash of the input data.
This is the hashing algorithm used by Ethereum for various cryptographic operations.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`BytesLike`](#byteslike) \| [`BytesLike`](#byteslike)[] | Input data as a single value or an array of values to be concatenated before hashing |

#### Returns

`Uint8Array`

Keccak256 hash as a Uint8Array

***

### pubkeyToAddress()

```ts
function pubkeyToAddress(publicKey: BytesLike): `0x${string}`;
```

Defined in: [src/crypto/utils.ts:70](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/utils.ts#L70)

Convert a public key to an account address.
The address is derived by taking the Keccak256 hash of the public key
(without the prefix byte) and keeping the last 20 bytes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `publicKey` | [`BytesLike`](#byteslike) | Public key as BytesLike |

#### Returns

`` `0x${string}` ``

Account address as a checksummed viem Address

***

### sign()

```ts
function sign(digestHash: BytesLike, key: SigningKey): Promise<Uint8Array<ArrayBufferLike>>;
```

Defined in: [src/crypto/utils.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/crypto/utils.ts#L87)

Sign a digest hash with a signing key.
The signature is in the Ethereum format: [R || S || V] where V is 0 or 1.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `digestHash` | [`BytesLike`](#byteslike) | Digest hash to sign (typically a Keccak256 hash) |
| `key` | [`SigningKey`](#signingkey) | Signing key containing the private key |

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

The signature as a Uint8Array

***

### createInterceptingTransport()

```ts
function createInterceptingTransport(options: InterceptingTransportOptions): Transport;
```

Defined in: [src/transport/interceptor.ts:129](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/interceptor.ts#L129)

Creates a viem-compatible transport that supports request interception and logging.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`InterceptingTransportOptions`](#interceptingtransportoptions) | Configuration options for the transport |

#### Returns

`Transport`

A viem Transport that can be used with createPublicClient

#### Example

```typescript
const transport = createInterceptingTransport({
  url: 'https://rpc.testnet.radiustech.xyz',
  logger: console.log,
});

const client = createPublicClient({
  chain: radiusTestnet,
  transport,
});
```

***

### createWebSocketTransport()

```ts
function createWebSocketTransport(chain: Chain, config?: WebSocketTransportConfig): Transport;
```

Defined in: [src/transport/websocket.ts:52](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/transport/websocket.ts#L52)

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
import { createRadiusClient } from '@radiustechsystems/sdk';
import { createWebSocketTransport } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const transport = createWebSocketTransport(radiusTestnet, {
  reconnectAttempts: 5,
  reconnectDelay: 2000,
});

const client = createRadiusClient({
  chain: radiusTestnet,
  transport,
});
```

#### Remarks

- The default WebSocket URL is derived from the chain configuration
- For Radius Testnet, the default is: wss://rpc.testnet.radiustech.xyz
- WebSocket connections are automatically managed by viem
- Subscriptions are cleaned up automatically on disconnect
