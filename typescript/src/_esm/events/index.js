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
// Event decoding utilities
export { decodeEventLogs, filterEventLogs, } from './decodeEventLogs';
// Historical log queries
export { getLogs, getLogsAdaptive, } from './getLogs';
// ERC-20 Approval events
export { watchApproval, watchApprovalForAddress, } from './watchApproval';
// Block watching
export { DEFAULT_POLLING_INTERVAL_MS, watchBlockNumber, watchBlocks, watchPendingTransactions, } from './watchBlock';
// Generic log watching
export { watchLogs, watchRawLogs, } from './watchLogs';
// ERC-20 Transfer events
export { watchTransfer, watchTransferForAddress, } from './watchTransfer';
//# sourceMappingURL=index.js.map