'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RadiusProvider = RadiusProvider;
const jsx_runtime_1 = require('react/jsx-runtime');
const react_query_1 = require('@tanstack/react-query');
const react_1 = require('react');
const wagmi_1 = require('wagmi');
const index_js_1 = require('../chains/index.js');
const context_js_1 = require('./context.js');
function RadiusProvider({ chain = index_js_1.radiusTestnet, children, queryClient }) {
  const config = (0, react_1.useMemo)(
    () =>
      (0, wagmi_1.createConfig)({
        chains: [chain],
        transports: {
          [chain.id]: (0, wagmi_1.http)(),
        },
      }),
    [chain]
  );
  const client = (0, react_1.useMemo)(
    () => queryClient ?? new react_query_1.QueryClient(),
    [queryClient]
  );
  return (0, jsx_runtime_1.jsx)(wagmi_1.WagmiProvider, {
    config: config,
    children: (0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, {
      client: client,
      children: (0, jsx_runtime_1.jsx)(context_js_1.RadiusContextProvider, {
        chain: chain,
        children: children,
      }),
    }),
  });
}
//# sourceMappingURL=provider.js.map
