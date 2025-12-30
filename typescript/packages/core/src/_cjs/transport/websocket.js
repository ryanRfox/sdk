Object.defineProperty(exports, '__esModule', { value: true });
exports.createWebSocketTransport = createWebSocketTransport;
const viem_1 = require('viem');
function createWebSocketTransport(chain, config) {
  let wsUrl = config?.url;
  if (!wsUrl) {
    const chainWsUrl = chain.rpcUrls.default.webSocket?.[0];
    if (chainWsUrl) {
      wsUrl = chainWsUrl;
    } else {
      const httpUrl = chain.rpcUrls.default.http[0];
      if (!httpUrl) {
        throw new Error('No RPC URL configured for chain');
      }
      wsUrl = httpUrl.replace(/^http/, 'ws');
    }
  }
  return (0, viem_1.webSocket)(wsUrl, {
    reconnect: {
      attempts: config?.reconnectAttempts ?? 3,
      delay: config?.reconnectDelay ?? 1000,
    },
    keepAlive: config?.keepAlive
      ? {
          interval: config.keepAlive,
        }
      : false,
  });
}
//# sourceMappingURL=websocket.js.map
