Object.defineProperty(exports, '__esModule', { value: true });
exports.watchLogs = watchLogs;
exports.watchRawLogs = watchRawLogs;
const actions_1 = require('viem/actions');
function watchLogs(client, params) {
  return (0, actions_1.watchContractEvent)(client, params);
}
function watchRawLogs(client, params) {
  return client.watchEvent({
    address: params.address,
    onLogs: params.onLogs,
    onError: params.onError,
    pollingInterval: params.pollingInterval,
  });
}
//# sourceMappingURL=watchLogs.js.map
