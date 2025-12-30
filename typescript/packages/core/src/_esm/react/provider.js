'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { jsx as _jsx } from 'react/jsx-runtime';
import { http, WagmiProvider, createConfig } from 'wagmi';
import { radiusTestnet } from '../chains/index.js';
import { RadiusContextProvider } from './context.js';
export function RadiusProvider({ chain = radiusTestnet, children, queryClient }) {
  const config = useMemo(
    () =>
      createConfig({
        chains: [chain],
        transports: {
          [chain.id]: http(),
        },
      }),
    [chain]
  );
  const client = useMemo(() => queryClient ?? new QueryClient(), [queryClient]);
  return _jsx(WagmiProvider, {
    config: config,
    children: _jsx(QueryClientProvider, {
      client: client,
      children: _jsx(RadiusContextProvider, { chain: chain, children: children }),
    }),
  });
}
//# sourceMappingURL=provider.js.map
