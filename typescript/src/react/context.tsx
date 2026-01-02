'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { Chain } from 'viem';
import { radiusTestnet } from '../chains/index.js';

export type RadiusContextValue = {
	chain: Chain;
};

const RadiusContext = createContext<RadiusContextValue | null>(null);

export type RadiusContextProviderProps = {
	chain?: Chain;
	children: ReactNode;
};

export function RadiusContextProvider({
	chain = radiusTestnet,
	children,
}: RadiusContextProviderProps) {
	return <RadiusContext.Provider value={{ chain }}>{children}</RadiusContext.Provider>;
}

export function useRadiusContext() {
	const context = useContext(RadiusContext);
	if (!context) {
		throw new Error('useRadiusContext must be used within a RadiusProvider');
	}
	return context;
}
