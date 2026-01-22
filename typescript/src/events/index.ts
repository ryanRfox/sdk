/**
 * Event subscription and log querying utilities for Radius SDK.
 *
 * This module provides WebSocket-based event subscriptions and historical log queries
 * with Radius-specific optimizations and limitations handling.
 *
 * @packageDocumentation
 * @module events
 */

// WebSocket transport
export {
	createWebSocketTransport,
	type WebSocketTransportConfig,
} from '../transport/websocket.js';
// Event decoding utilities
export {
	type DecodedEventLog,
	type DecodeEventLogsParameters,
	type DecodeEventLogsResult,
	decodeEventLogs,
	type FilterEventLogsParameters,
	filterEventLogs,
} from './decodeEventLogs.js';
// Historical log queries
export {
	type GetLogsAdaptiveParams,
	type GetLogsParams,
	getLogs,
	getLogsAdaptive,
} from './getLogs.js';
// ERC-20 Approval events
export {
	type ApprovalEvent,
	type WatchApprovalForAddressParameters,
	type WatchApprovalParameters,
	watchApproval,
	watchApprovalForAddress,
} from './watchApproval.js';
// Block watching
export {
	DEFAULT_POLLING_INTERVAL_MS,
	type WatchBlockNumberParams,
	type WatchBlocksParams,
	type WatchPendingTransactionsParams,
	watchBlockNumber,
	watchBlocks,
	watchPendingTransactions,
} from './watchBlock.js';
// Generic log watching
export {
	type WatchRawLogsParameters,
	watchLogs,
	watchRawLogs,
} from './watchLogs.js';
// ERC-20 Transfer events
export {
	type TransferEvent,
	type WatchTransferForAddressParameters,
	type WatchTransferParameters,
	watchTransfer,
	watchTransferForAddress,
} from './watchTransfer.js';
