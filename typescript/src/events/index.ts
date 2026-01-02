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
} from '../transport/websocket';
// Historical log queries
export {
	type GetLogsAdaptiveParams,
	type GetLogsParams,
	getLogs,
	getLogsAdaptive,
} from './getLogs';
// ERC-20 Approval events
export {
	type ApprovalEvent,
	type WatchApprovalForAddressParameters,
	type WatchApprovalParameters,
	watchApproval,
	watchApprovalForAddress,
} from './watchApproval';
// Block watching
export {
	DEFAULT_POLLING_INTERVAL_MS,
	type WatchBlockNumberParams,
	type WatchBlocksParams,
	type WatchPendingTransactionsParams,
	watchBlockNumber,
	watchBlocks,
	watchPendingTransactions,
} from './watchBlock';
// Generic log watching
export {
	type WatchRawLogsParameters,
	watchLogs,
	watchRawLogs,
} from './watchLogs';
// ERC-20 Transfer events
export {
	type TransferEvent,
	type WatchTransferForAddressParameters,
	type WatchTransferParameters,
	watchTransfer,
	watchTransferForAddress,
} from './watchTransfer';
