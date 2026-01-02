import { type ReactNode } from 'react';
import type { Chain } from 'viem';
export type RadiusContextValue = {
    chain: Chain;
};
export type RadiusContextProviderProps = {
    chain?: Chain;
    children: ReactNode;
};
export declare function RadiusContextProvider({ chain, children, }: RadiusContextProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useRadiusContext(): RadiusContextValue;
//# sourceMappingURL=context.d.ts.map