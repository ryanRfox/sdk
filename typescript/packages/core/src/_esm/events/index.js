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
export { createWebSocketTransport, } from '../transport/websocket';
// Generic log watching
export { watchLogs, watchRawLogs, } from './watchLogs';
// ERC-20 Transfer events
export { watchTransfer, watchTransferForAddress, } from './watchTransfer';
// ERC-20 Approval events
export { watchApproval, watchApprovalForAddress, } from './watchApproval';
// Block watching
export { watchBlockNumber, watchBlocks, watchPendingTransactions, DEFAULT_POLLING_INTERVAL_MS, } from './watchBlock';
// Historical log queries
export { getLogs, getLogsAdaptive, } from './getLogs';
//# sourceMappingURL=index.js.map