import { QueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import type { Chain } from 'viem';
export type RadiusProviderProps = {
    chain?: Chain;
    children: ReactNode;
    queryClient?: QueryClient;
};
export declare function RadiusProvider({ chain, children, queryClient, }: RadiusProviderProps): import("react/jsx-runtime.js").JSX.Element;
//# sourceMappingURL=provider.d.ts.map