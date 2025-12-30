/**
 * Event subscription and log querying utilities for Radius SDK.
 *
 * This module provides WebSocket-based event subscriptions and historical log queries
 * with Radius-specific optimizations and limitations handling.
 *
 * @packageDocumentation
 * @module events
 */
export { createWebSocketTransport, type WebSocketTransportConfig } from '../transport/websocket';
export { watchLogs, watchRawLogs, type WatchRawLogsParameters } from './watchLogs';
export {
  watchTransfer,
  watchTransferForAddress,
  type TransferEvent,
  type WatchTransferParameters,
  type WatchTransferForAddressParameters,
} from './watchTransfer';
export {
  watchApproval,
  watchApprovalForAddress,
  type ApprovalEvent,
  type WatchApprovalParameters,
  type WatchApprovalForAddressParameters,
} from './watchApproval';
export {
  watchBlockNumber,
  watchBlocks,
  watchPendingTransactions,
  DEFAULT_POLLING_INTERVAL_MS,
  type WatchBlockNumberParams,
  type WatchBlocksParams,
  type WatchPendingTransactionsParams,
} from './watchBlock';
export {
  getLogs,
  getLogsAdaptive,
  type GetLogsParams,
  type GetLogsAdaptiveParams,
} from './getLogs';
//# sourceMappingURL=index.d.ts.map
