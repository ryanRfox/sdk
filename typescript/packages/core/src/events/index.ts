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

// Generic log watching
export {
  watchLogs,
  watchRawLogs,
  type WatchRawLogsParameters,
} from './watchLogs';

// ERC-20 Transfer events
export {
  watchTransfer,
  watchTransferForAddress,
  type TransferEvent,
  type WatchTransferParameters,
  type WatchTransferForAddressParameters,
} from './watchTransfer';

// ERC-20 Approval events
export {
  watchApproval,
  watchApprovalForAddress,
  type ApprovalEvent,
  type WatchApprovalParameters,
  type WatchApprovalForAddressParameters,
} from './watchApproval';

// Block watching
export {
  watchBlockNumber,
  watchBlocks,
  watchPendingTransactions,
  DEFAULT_POLLING_INTERVAL_MS,
  type WatchBlockNumberParams,
  type WatchBlocksParams,
  type WatchPendingTransactionsParams,
} from './watchBlock';

// Historical log queries
export {
  getLogs,
  getLogsAdaptive,
  type GetLogsParams,
  type GetLogsAdaptiveParams,
} from './getLogs';
