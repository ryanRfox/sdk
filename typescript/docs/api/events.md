[**@radiustechsystems/sdk**](README.md)

***

[@radiustechsystems/sdk](README.md) / events

# events

Event subscription and log querying utilities for Radius SDK.

This module provides WebSocket-based event subscriptions and historical log queries
with Radius-specific optimizations and limitations handling.

## Interfaces

### GetLogsParams

Defined in: [src/events/getLogs.ts:10](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L10)

Parameters for paginated log retrieval.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="address"></a> `address` | `` `0x${string}` `` \| `` `0x${string}` ``[] | The contract address(es) to query logs from (required on Radius) | [src/events/getLogs.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L12) |
| <a id="fromblock"></a> `fromBlock` | `bigint` | Starting block number (inclusive) | [src/events/getLogs.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L14) |
| <a id="toblock"></a> `toBlock` | `bigint` | Ending block number (inclusive) | [src/events/getLogs.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L16) |
| <a id="chunksize"></a> `chunkSize?` | `number` | Maximum number of blocks to query per request (default: 1000) | [src/events/getLogs.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L18) |
| <a id="onprogress"></a> `onProgress?` | (`params`: \{ `currentBlock`: `bigint`; `totalBlocks`: `bigint`; `chunksProcessed`: `number`; `logsFetched`: `number`; \}) => `void` | Callback invoked after each chunk is fetched (for progress tracking) | [src/events/getLogs.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L20) |

***

### GetLogsAdaptiveParams

Defined in: [src/events/getLogs.ts:146](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L146)

Parameters for fetching logs with automatic chunk size detection.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="address-1"></a> `address` | `` `0x${string}` `` \| `` `0x${string}` ``[] | The contract address(es) to query logs from (required on Radius) | [src/events/getLogs.ts:148](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L148) |
| <a id="fromblock-1"></a> `fromBlock` | `bigint` | Starting block number (inclusive) | [src/events/getLogs.ts:150](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L150) |
| <a id="toblock-1"></a> `toBlock` | `bigint` | Ending block number (inclusive) | [src/events/getLogs.ts:152](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L152) |
| <a id="initialchunksize"></a> `initialChunkSize?` | `number` | Initial chunk size to try (default: 1000) | [src/events/getLogs.ts:154](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L154) |
| <a id="minchunksize"></a> `minChunkSize?` | `number` | Minimum chunk size (default: 10) | [src/events/getLogs.ts:156](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L156) |
| <a id="onprogress-1"></a> `onProgress?` | (`params`: \{ `currentBlock`: `bigint`; `totalBlocks`: `bigint`; `chunksProcessed`: `number`; `logsFetched`: `number`; `currentChunkSize`: `number`; \}) => `void` | Callback invoked after each chunk is fetched (for progress tracking) | [src/events/getLogs.ts:158](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L158) |

***

### ApprovalEvent

Defined in: [src/events/watchApproval.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L12)

Decoded Approval event data.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="owner"></a> `owner` | `` `0x${string}` `` | The address that owns the tokens | [src/events/watchApproval.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L14) |
| <a id="spender"></a> `spender` | `` `0x${string}` `` | The address that is approved to spend the tokens | [src/events/watchApproval.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L16) |
| <a id="value"></a> `value` | `bigint` | The amount of tokens approved (in smallest unit) | [src/events/watchApproval.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L18) |
| <a id="log"></a> `log` | `Log` | The raw log data | [src/events/watchApproval.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L20) |

***

### WatchApprovalParameters

Defined in: [src/events/watchApproval.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L26)

Parameters for watching Approval events.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="address-2"></a> `address` | `` `0x${string}` `` | The ERC-20 token contract address to watch | [src/events/watchApproval.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L28) |
| <a id="owner-1"></a> `owner?` | `` `0x${string}` `` | Optional: Filter by owner address | [src/events/watchApproval.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L30) |
| <a id="spender-1"></a> `spender?` | `` `0x${string}` `` | Optional: Filter by spender address | [src/events/watchApproval.ts:32](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L32) |
| <a id="onapproval"></a> `onApproval` | (`events`: [`ApprovalEvent`](#approvalevent)[]) => `void` | Callback function invoked when Approval events are received | [src/events/watchApproval.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L34) |
| <a id="onerror"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchApproval.ts:36](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L36) |
| <a id="sync"></a> `sync?` | `boolean` | Whether to emit logs from the latest block on subscription start | [src/events/watchApproval.ts:38](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L38) |
| <a id="pollinginterval"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (for HTTP transport fallback) | [src/events/watchApproval.ts:40](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L40) |

***

### WatchApprovalForAddressParameters

Defined in: [src/events/watchApproval.ts:157](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L157)

Parameters for watching Approval events for a specific address (as owner or spender).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="tokenaddress"></a> `tokenAddress` | `` `0x${string}` `` | The ERC-20 token contract address to watch | [src/events/watchApproval.ts:159](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L159) |
| <a id="watchaddress"></a> `watchAddress` | `` `0x${string}` `` | The address to watch (as owner or spender) | [src/events/watchApproval.ts:161](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L161) |
| <a id="owneronly"></a> `ownerOnly?` | `boolean` | Whether to watch as owner only (default: false, watches both owner and spender) | [src/events/watchApproval.ts:163](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L163) |
| <a id="spenderonly"></a> `spenderOnly?` | `boolean` | Whether to watch as spender only (default: false, watches both owner and spender) | [src/events/watchApproval.ts:165](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L165) |
| <a id="onapproval-1"></a> `onApproval` | (`events`: [`ApprovalEvent`](#approvalevent)[]) => `void` | Callback function invoked when Approval events are received | [src/events/watchApproval.ts:167](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L167) |
| <a id="onerror-1"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchApproval.ts:169](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L169) |
| <a id="sync-1"></a> `sync?` | `boolean` | Whether to emit logs from the latest block on subscription start | [src/events/watchApproval.ts:171](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L171) |
| <a id="pollinginterval-1"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (for HTTP transport fallback) | [src/events/watchApproval.ts:173](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L173) |

***

### WatchBlockNumberParams

Defined in: [src/events/watchBlock.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L30)

Parameters for watching new block numbers.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="onblocknumber"></a> `onBlockNumber` | (`blockNumber`: `bigint`) => `void` | Callback function invoked when a new block number is detected | [src/events/watchBlock.ts:32](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L32) |
| <a id="onerror-2"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchBlock.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L34) |
| <a id="emitonbegin"></a> `emitOnBegin?` | `boolean` | Whether to emit the current block number on subscription start | [src/events/watchBlock.ts:36](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L36) |
| <a id="pollinginterval-2"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (default: 1000ms for HTTP, real-time for WebSocket) | [src/events/watchBlock.ts:38](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L38) |

***

### WatchBlocksParams

Defined in: [src/events/watchBlock.ts:95](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L95)

Parameters for watching new blocks (full block data).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="onblock"></a> `onBlock` | (`block`: `Block`) => `void` | Callback function invoked when a new block is detected | [src/events/watchBlock.ts:97](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L97) |
| <a id="onerror-3"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchBlock.ts:99](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L99) |
| <a id="emitonbegin-1"></a> `emitOnBegin?` | `boolean` | Whether to emit the current block on subscription start | [src/events/watchBlock.ts:101](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L101) |
| <a id="includetransactions"></a> `includeTransactions?` | `boolean` | Whether to include transactions in the block (default: false) | [src/events/watchBlock.ts:103](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L103) |
| <a id="pollinginterval-3"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (default: 1000ms for HTTP, real-time for WebSocket) | [src/events/watchBlock.ts:105](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L105) |

***

### WatchPendingTransactionsParams

Defined in: [src/events/watchBlock.ts:177](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L177)

Parameters for watching pending transactions.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ontransactions"></a> `onTransactions` | (`hashes`: `` `0x${string}` ``[]) => `void` | Callback function invoked when new pending transactions are detected | [src/events/watchBlock.ts:179](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L179) |
| <a id="onerror-4"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchBlock.ts:181](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L181) |
| <a id="pollinginterval-4"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (required for HTTP transport) | [src/events/watchBlock.ts:183](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L183) |

***

### WatchRawLogsParameters

Defined in: [src/events/watchLogs.ts:77](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L77)

Parameters for watching raw logs without ABI decoding.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="address-3"></a> `address` | `` `0x${string}` `` \| `` `0x${string}` ``[] | The contract address to watch | [src/events/watchLogs.ts:79](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L79) |
| <a id="topics"></a> `topics?` | `` `0x${string}` ``[][] | Optional event signature hashes to filter by | [src/events/watchLogs.ts:81](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L81) |
| <a id="onlogs"></a> `onLogs` | (`logs`: `Log`[]) => `void` | Callback function invoked when logs are received | [src/events/watchLogs.ts:83](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L83) |
| <a id="onerror-5"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchLogs.ts:85](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L85) |
| <a id="sync-2"></a> `sync?` | `boolean` | Whether to emit logs from the latest block on subscription start | [src/events/watchLogs.ts:87](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L87) |
| <a id="pollinginterval-5"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (for HTTP transport fallback) | [src/events/watchLogs.ts:89](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L89) |

***

### TransferEvent

Defined in: [src/events/watchTransfer.ts:12](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L12)

Decoded Transfer event data.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="from"></a> `from` | `` `0x${string}` `` | The address that sent the tokens | [src/events/watchTransfer.ts:14](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L14) |
| <a id="to"></a> `to` | `` `0x${string}` `` | The address that received the tokens | [src/events/watchTransfer.ts:16](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L16) |
| <a id="value-1"></a> `value` | `bigint` | The amount of tokens transferred (in smallest unit) | [src/events/watchTransfer.ts:18](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L18) |
| <a id="log-1"></a> `log` | `Log` | The raw log data | [src/events/watchTransfer.ts:20](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L20) |

***

### WatchTransferParameters

Defined in: [src/events/watchTransfer.ts:26](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L26)

Parameters for watching Transfer events.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="address-4"></a> `address` | `` `0x${string}` `` | The ERC-20 token contract address to watch | [src/events/watchTransfer.ts:28](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L28) |
| <a id="from-1"></a> `from?` | `` `0x${string}` `` | Optional: Filter by sender address | [src/events/watchTransfer.ts:30](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L30) |
| <a id="to-1"></a> `to?` | `` `0x${string}` `` | Optional: Filter by recipient address | [src/events/watchTransfer.ts:32](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L32) |
| <a id="ontransfer"></a> `onTransfer` | (`events`: [`TransferEvent`](#transferevent)[]) => `void` | Callback function invoked when Transfer events are received | [src/events/watchTransfer.ts:34](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L34) |
| <a id="onerror-6"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchTransfer.ts:36](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L36) |
| <a id="sync-3"></a> `sync?` | `boolean` | Whether to emit logs from the latest block on subscription start | [src/events/watchTransfer.ts:38](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L38) |
| <a id="pollinginterval-6"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (for HTTP transport fallback) | [src/events/watchTransfer.ts:40](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L40) |

***

### WatchTransferForAddressParameters

Defined in: [src/events/watchTransfer.ts:147](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L147)

Parameters for watching Transfer events for a specific address (as sender or receiver).

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="tokenaddress-1"></a> `tokenAddress` | `` `0x${string}` `` | The ERC-20 token contract address to watch | [src/events/watchTransfer.ts:149](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L149) |
| <a id="watchaddress-1"></a> `watchAddress` | `` `0x${string}` `` | The address to watch (as sender or receiver) | [src/events/watchTransfer.ts:151](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L151) |
| <a id="senderonly"></a> `senderOnly?` | `boolean` | Whether to watch as sender only (default: false, watches both sender and receiver) | [src/events/watchTransfer.ts:153](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L153) |
| <a id="receiveronly"></a> `receiverOnly?` | `boolean` | Whether to watch as receiver only (default: false, watches both sender and receiver) | [src/events/watchTransfer.ts:155](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L155) |
| <a id="ontransfer-1"></a> `onTransfer` | (`events`: [`TransferEvent`](#transferevent)[]) => `void` | Callback function invoked when Transfer events are received | [src/events/watchTransfer.ts:157](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L157) |
| <a id="onerror-7"></a> `onError?` | (`error`: `Error`) => `void` | Callback function invoked when an error occurs | [src/events/watchTransfer.ts:159](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L159) |
| <a id="sync-4"></a> `sync?` | `boolean` | Whether to emit logs from the latest block on subscription start | [src/events/watchTransfer.ts:161](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L161) |
| <a id="pollinginterval-7"></a> `pollingInterval?` | `number` | Polling interval in milliseconds (for HTTP transport fallback) | [src/events/watchTransfer.ts:163](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L163) |

## Variables

### DEFAULT\_POLLING\_INTERVAL\_MS

```ts
const DEFAULT_POLLING_INTERVAL_MS: 1000 = 1000;
```

Defined in: [src/events/watchBlock.ts:25](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L25)

Default polling interval for block watching in milliseconds.
Used when polling is required (e.g., HTTP transport fallback).
Can be overridden per watch call via pollingInterval parameter.

## Functions

### getLogs()

```ts
function getLogs(client: {
}, params: GetLogsParams): Promise<Log[]>;
```

Defined in: [src/events/getLogs.ts:77](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L77)

Fetches historical logs from Radius with automatic pagination.
Handles Radius's block range restrictions by splitting large queries into smaller chunks.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use |
| `params` | [`GetLogsParams`](#getlogsparams) | Log query parameters with pagination |

#### Returns

`Promise`\<`Log`[]\>

Array of all logs matching the query

#### Throws

Error if any chunk request fails

#### Example

```typescript
import { createPublicClient, http } from 'viem';
import { getLogs } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Fetch logs for a large block range
const logs = await getLogs(client, {
  address: '0x...', // Contract address (required)
  fromBlock: 1000000n,
  toBlock: 1010000n, // 10,000 blocks
  chunkSize: 1000, // Query 1000 blocks at a time
  onProgress: ({ currentBlock, totalBlocks, logsFetched }) => {
    const percent = (Number(currentBlock) / Number(totalBlocks) * 100).toFixed(1);
    console.log(`Progress: ${percent}% (${logsFetched} logs)`);
  },
});

console.log(`Found ${logs.length} total logs`);
```

#### Remarks

- Radius requires the address parameter (cannot query all contracts)
- Radius restricts eth_getLogs to narrow block ranges
- This function automatically splits large queries into smaller chunks
- Default chunk size is 1000 blocks (adjust based on your needs)
- If you get "block range is too wide" errors, reduce chunkSize
- Progress callback is optional but useful for long-running queries
- All requests are sequential to avoid rate limiting
- Consider using WebSocket subscriptions for real-time monitoring instead

***

### getLogsAdaptive()

```ts
function getLogsAdaptive(client: {
}, params: GetLogsAdaptiveParams): Promise<Log[]>;
```

Defined in: [src/events/getLogs.ts:204](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/getLogs.ts#L204)

Fetches historical logs with adaptive chunk sizing.
Automatically reduces chunk size if "block range too wide" errors occur.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use |
| `params` | [`GetLogsAdaptiveParams`](#getlogsadaptiveparams) | Log query parameters with adaptive sizing |

#### Returns

`Promise`\<`Log`[]\>

Array of all logs matching the query

#### Throws

Error if minimum chunk size is reached or other errors occur

#### Example

```typescript
import { createPublicClient, http } from 'viem';
import { getLogsAdaptive } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Fetch logs with automatic chunk size adjustment
const logs = await getLogsAdaptive(client, {
  address: '0x...',
  fromBlock: 1000000n,
  toBlock: 1010000n,
  onProgress: ({ currentBlock, totalBlocks, currentChunkSize }) => {
    console.log(`Block ${currentBlock}/${totalBlocks} (chunk: ${currentChunkSize})`);
  },
});
```

#### Remarks

- Starts with a large chunk size and reduces it if errors occur
- Useful when you don't know the optimal chunk size for a network
- Slower than getLogs with a known good chunk size
- Use getLogs directly if you know a reliable chunk size

***

### watchApproval()

```ts
function watchApproval(client: {
}, params: WatchApprovalParameters): WatchContractEventReturnType;
```

Defined in: [src/events/watchApproval.ts:102](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L102)

Watches for ERC-20 Approval events in real-time.
Automatically decodes Approval events and provides type-safe callbacks.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use (WebSocket transport recommended) |
| `params` | [`WatchApprovalParameters`](#watchapprovalparameters) | Approval event watching parameters |

#### Returns

`WatchContractEventReturnType`

An unwatch function to stop the subscription

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchApproval } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch all approvals for a token
const unwatch = watchApproval(client, {
  address: '0x...', // Token address
  onApproval: (events) => {
    events.forEach(event => {
      console.log(`Approval: ${event.owner} approved ${event.spender} for ${event.value}`);
    });
  },
});

// Watch approvals from a specific owner
const unwatchOwner = watchApproval(client, {
  address: '0x...', // Token address
  owner: '0x...', // Owner address
  onApproval: (events) => {
    console.log(`Owner granted ${events.length} approvals`);
  },
});

// Watch approvals for a specific spender
const unwatchSpender = watchApproval(client, {
  address: '0x...', // Token address
  spender: '0x...', // Spender address
  onApproval: (events) => {
    console.log(`Spender received ${events.length} approvals`);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- Requires WebSocket transport for real-time subscriptions
- Automatically decodes Approval events using ERC-20 ABI
- Filters by owner/spender addresses if provided
- Event signature: Approval(address indexed owner, address indexed spender, uint256 value)
- Subscriptions consume gas from your RPC key on Radius (10 GAS/sec)
- An approval value of 0 revokes the approval

***

### watchApprovalForAddress()

```ts
function watchApprovalForAddress(client: {
}, params: WatchApprovalForAddressParameters): WatchContractEventReturnType;
```

Defined in: [src/events/watchApproval.ts:240](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchApproval.ts#L240)

Watches for Approval events involving a specific address (as owner or spender).
Convenience wrapper around watchApproval for monitoring a single address.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use (WebSocket transport recommended) |
| `params` | [`WatchApprovalForAddressParameters`](#watchapprovalforaddressparameters) | Approval watching parameters for specific address |

#### Returns

`WatchContractEventReturnType`

An unwatch function to stop the subscription

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchApprovalForAddress } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch all approvals involving an address (as owner or spender)
const unwatch = watchApprovalForAddress(client, {
  tokenAddress: '0x...', // Token address
  watchAddress: '0x...', // Address to monitor
  onApproval: (events) => {
    events.forEach(event => {
      if (event.owner === watchAddress) {
        console.log(`Approved ${event.spender} for ${event.value}`);
      } else {
        console.log(`Received approval from ${event.owner} for ${event.value}`);
      }
    });
  },
});

// Watch only approvals granted by an address (as owner)
const unwatchAsOwner = watchApprovalForAddress(client, {
  tokenAddress: '0x...',
  watchAddress: '0x...',
  ownerOnly: true,
  onApproval: (events) => {
    console.log(`Granted ${events.length} approvals`);
  },
});

// Watch only approvals received by an address (as spender)
const unwatchAsSpender = watchApprovalForAddress(client, {
  tokenAddress: '0x...',
  watchAddress: '0x...',
  spenderOnly: true,
  onApproval: (events) => {
    console.log(`Received ${events.length} approvals`);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- If neither ownerOnly nor spenderOnly is set, watches both roles
- Cannot set both ownerOnly and spenderOnly to true
- More efficient than watching all approvals and filtering client-side
- Server-side filtering reduces network traffic and processing

***

### watchBlockNumber()

```ts
function watchBlockNumber(client: {
}, params: WatchBlockNumberParams): () => void;
```

Defined in: [src/events/watchBlock.ts:81](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L81)

Watches for new block numbers.
Uses WebSocket subscriptions when available, falls back to polling for HTTP transport.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use |
| `params` | [`WatchBlockNumberParams`](#watchblocknumberparams) | Block number watching parameters |

#### Returns

An unwatch function to stop watching

```ts
(): void;
```

##### Returns

`void`

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchBlockNumber } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch for new blocks
const unwatch = watchBlockNumber(client, {
  onBlockNumber: (blockNumber) => {
    console.log('New block:', blockNumber);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- WebSocket transport provides real-time block notifications
- HTTP transport falls back to polling (default 1s interval)
- Radius does not support eth_newBlockFilter (traditional filter API)
- WebSocket subscriptions are more efficient than polling
- For HTTP clients, consider increasing pollingInterval to reduce load

***

### watchBlocks()

```ts
function watchBlocks(client: {
}, params: WatchBlocksParams): () => void;
```

Defined in: [src/events/watchBlock.ts:157](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L157)

Watches for new blocks with full block data.
Uses WebSocket subscriptions when available, falls back to polling for HTTP transport.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use |
| `params` | [`WatchBlocksParams`](#watchblocksparams) | Block watching parameters |

#### Returns

An unwatch function to stop watching

```ts
(): void;
```

##### Returns

`void`

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchBlocks } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch for new blocks
const unwatch = watchBlocks(client, {
  onBlock: (block) => {
    console.log('New block:', block.number);
    console.log('Timestamp:', block.timestamp);
    console.log('Transactions:', block.transactions.length);
  },
});

// Watch blocks with full transaction data
const unwatchWithTxs = watchBlocks(client, {
  includeTransactions: true,
  onBlock: (block) => {
    console.log('New block with', block.transactions.length, 'transactions');
    // block.transactions contains full transaction objects
  },
});

// Stop watching
unwatch();
```

#### Remarks

- WebSocket transport provides real-time block notifications
- HTTP transport falls back to polling (default 1s interval)
- includeTransactions=true fetches full transaction data (slower)
- includeTransactions=false only includes transaction hashes (faster, default)
- WebSocket is recommended for real-time block monitoring
- Polling with includeTransactions=true can be expensive

***

### watchPendingTransactions()

```ts
function watchPendingTransactions(client: {
}, params: WatchPendingTransactionsParams): () => void;
```

Defined in: [src/events/watchBlock.ts:222](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchBlock.ts#L222)

Watches for pending transactions in the mempool.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use |
| `params` | [`WatchPendingTransactionsParams`](#watchpendingtransactionsparams) | Pending transaction watching parameters |

#### Returns

An unwatch function to stop watching

```ts
(): void;
```

##### Returns

`void`

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchPendingTransactions } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch for pending transactions
const unwatch = watchPendingTransactions(client, {
  onTransactions: (hashes) => {
    console.log('New pending transactions:', hashes);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- LIMITATION: Radius does not support eth_newPendingTransactionFilter
- This function may not work as expected on Radius
- WebSocket transport with "pendingTransactions" subscription is not supported
- Consider using block watching and filtering confirmed transactions instead
- This is provided for API completeness but may have limited functionality

***

### watchLogs()

```ts
function watchLogs(client: {
}, params: WatchContractEventParameters<Abi | readonly unknown[], string | undefined, boolean | undefined, Transport>): WatchContractEventReturnType;
```

Defined in: [src/events/watchLogs.ts:67](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L67)

Watches for contract events in real-time using WebSocket subscriptions.
Uses viem's watchContractEvent under the hood, which leverages eth_subscribe for "logs".

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use (must be configured with WebSocket transport) |
| `params` | `WatchContractEventParameters`\<`Abi` \| readonly `unknown`[], `string` \| `undefined`, `boolean` \| `undefined`, `Transport`\> | Event watching parameters including address, ABI, event name, and callback |

#### Returns

`WatchContractEventReturnType`

An unwatch function to stop the subscription

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchLogs } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

// Create client with WebSocket transport
const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch for events
const unwatch = watchLogs(client, {
  address: '0x...',
  abi: contractAbi,
  eventName: 'Transfer',
  onLogs: (logs) => {
    console.log('Transfer events:', logs);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- Requires WebSocket transport for real-time subscriptions
- Radius supports eth_subscribe with type "logs" only
- Address parameter is mandatory on Radius
- Subscriptions consume gas from your RPC key (10 GAS/sec)
- Automatically cleaned up on disconnect
- For HTTP transport, consider using getLogs with polling instead

***

### watchRawLogs()

```ts
function watchRawLogs(client: {
}, params: WatchRawLogsParameters): WatchContractEventReturnType;
```

Defined in: [src/events/watchLogs.ts:135](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchLogs.ts#L135)

Watches for raw logs without ABI decoding.
Useful when you want to receive raw log data or watch multiple event types.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use (WebSocket transport recommended) |
| `params` | [`WatchRawLogsParameters`](#watchrawlogsparameters) | Raw log watching parameters |

#### Returns

`WatchContractEventReturnType`

An unwatch function to stop the subscription

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchRawLogs } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch for all events from a contract
const unwatch = watchRawLogs(client, {
  address: '0x...',
  onLogs: (logs) => {
    logs.forEach(log => {
      console.log('Log:', log.topics, log.data);
    });
  },
  onError: (error) => {
    console.error('Subscription error:', error);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- Does not decode log data; returns raw topics and data
- Useful for monitoring multiple event types from same contract
- Requires address parameter (mandatory on Radius)
- WebSocket transport provides real-time updates
- HTTP transport falls back to polling (less efficient)

***

### watchTransfer()

```ts
function watchTransfer(client: {
}, params: WatchTransferParameters): WatchContractEventReturnType;
```

Defined in: [src/events/watchTransfer.ts:92](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L92)

Watches for ERC-20 Transfer events in real-time.
Automatically decodes Transfer events and provides type-safe callbacks.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use (WebSocket transport recommended) |
| `params` | [`WatchTransferParameters`](#watchtransferparameters) | Transfer event watching parameters |

#### Returns

`WatchContractEventReturnType`

An unwatch function to stop the subscription

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchTransfer } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch all transfers for a token
const unwatch = watchTransfer(client, {
  address: '0x...', // Token address
  onTransfer: (events) => {
    events.forEach(event => {
      console.log(`Transfer: ${event.value} from ${event.from} to ${event.to}`);
    });
  },
});

// Watch transfers to a specific address
const unwatchToAddress = watchTransfer(client, {
  address: '0x...', // Token address
  to: '0x...', // Recipient address
  onTransfer: (events) => {
    console.log(`Received ${events.length} transfers`);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- Requires WebSocket transport for real-time subscriptions
- Automatically decodes Transfer events using ERC-20 ABI
- Filters by from/to addresses if provided
- Event signature: Transfer(address indexed from, address indexed to, uint256 value)
- Subscriptions consume gas from your RPC key on Radius (10 GAS/sec)

***

### watchTransferForAddress()

```ts
function watchTransferForAddress(client: {
}, params: WatchTransferForAddressParameters): WatchContractEventReturnType;
```

Defined in: [src/events/watchTransfer.ts:220](https://github.com/ryanRfox/sdk/blob/b45f1c9c5f9d19e68ec260265e0522b09372ef68/typescript/src/events/watchTransfer.ts#L220)

Watches for Transfer events involving a specific address (as sender or receiver).
Convenience wrapper around watchTransfer for monitoring a single address.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | \{ \} | The PublicClient to use (WebSocket transport recommended) |
| `params` | [`WatchTransferForAddressParameters`](#watchtransferforaddressparameters) | Transfer watching parameters for specific address |

#### Returns

`WatchContractEventReturnType`

An unwatch function to stop the subscription

#### Example

```typescript
import { createPublicClient } from 'viem';
import { createWebSocketTransport, watchTransferForAddress } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport(radiusTestnet),
});

// Watch all transfers involving an address (sent or received)
const unwatch = watchTransferForAddress(client, {
  tokenAddress: '0x...', // Token address
  watchAddress: '0x...', // Address to monitor
  onTransfer: (events) => {
    events.forEach(event => {
      if (event.from === watchAddress) {
        console.log(`Sent ${event.value} to ${event.to}`);
      } else {
        console.log(`Received ${event.value} from ${event.from}`);
      }
    });
  },
});

// Watch only transfers sent from an address
const unwatchSent = watchTransferForAddress(client, {
  tokenAddress: '0x...',
  watchAddress: '0x...',
  senderOnly: true,
  onTransfer: (events) => {
    console.log(`Sent ${events.length} transfers`);
  },
});

// Stop watching
unwatch();
```

#### Remarks

- If neither senderOnly nor receiverOnly is set, watches both directions
- Cannot set both senderOnly and receiverOnly to true
- More efficient than watching all transfers and filtering client-side
- Server-side filtering reduces network traffic and processing

## References

### createWebSocketTransport

Re-exports [createWebSocketTransport](index.md#createwebsockettransport)

***

### WebSocketTransportConfig

Re-exports [WebSocketTransportConfig](index.md#websockettransportconfig)
