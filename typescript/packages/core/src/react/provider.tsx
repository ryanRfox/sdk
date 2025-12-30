'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useMemo } from 'react'
import type { Chain } from 'viem'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { radiusTestnet } from '../chains/index.js'
import { RadiusContextProvider } from './context.js'

export type RadiusProviderProps = {
  chain?: Chain
  children: ReactNode
  queryClient?: QueryClient
}

export function RadiusProvider({
  chain = radiusTestnet,
  children,
  queryClient,
}: RadiusProviderProps) {
  const config = useMemo(
    () =>
      createConfig({
        chains: [chain],
        transports: {
          [chain.id]: http(),
        },
      }),
    [chain],
  )

  const client = useMemo(() => queryClient ?? new QueryClient(), [queryClient])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RadiusContextProvider chain={chain}>{children}</RadiusContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
