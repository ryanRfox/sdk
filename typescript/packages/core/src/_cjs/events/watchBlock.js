Object.defineProperty(exports, '__esModule', { value: true });
exports.DEFAULT_POLLING_INTERVAL_MS = void 0;
exports.watchBlockNumber = watchBlockNumber;
exports.watchBlocks = watchBlocks;
exports.watchPendingTransactions = watchPendingTransactions;
exports.DEFAULT_POLLING_INTERVAL_MS = 1000;
function watchBlockNumber(client, params) {
  const watchParams = {
    onBlockNumber: params.onBlockNumber,
    onError: params.onError,
    emitOnBegin: params.emitOnBegin,
    pollingInterval: params.pollingInterval ?? exports.DEFAULT_POLLING_INTERVAL_MS,
  };
  return client.watchBlockNumber(watchParams);
}
function watchBlocks(client, params) {
  const watchParams = {
    onBlock: params.onBlock,
    onError: params.onError,
    emitOnBegin: params.emitOnBegin,
    pollingInterval: params.pollingInterval ?? exports.DEFAULT_POLLING_INTERVAL_MS,
  };
  if (params.includeTransactions === true) {
    watchParams.includeTransactions = true;
  }
  return client.watchBlocks(watchParams);
}
function watchPendingTransactions(client, params) {
  return client.watchPendingTransactions({
    onTransactions: params.onTransactions,
    onError: params.onError,
    pollingInterval: params.pollingInterval,
  });
}
//# sourceMappingURL=watchBlock.js.map
