Object.defineProperty(exports, '__esModule', { value: true });
exports.radiusMainnet = exports.radiusTestnet = void 0;
const viem_1 = require('viem');
exports.radiusTestnet = (0, viem_1.defineChain)({
  id: 1223953,
  name: 'Radius Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://explorer.testnet.radiustech.xyz',
    },
  },
  testnet: true,
});
exports.radiusMainnet = (0, viem_1.defineChain)({
  id: 1223954,
  name: 'Radius',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://explorer.radiustech.xyz',
    },
  },
  testnet: false,
});
//# sourceMappingURL=radius.js.map
