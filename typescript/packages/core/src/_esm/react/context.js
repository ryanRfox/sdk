'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { radiusTestnet } from '../chains/index.js';
const RadiusContext = createContext(null);
export function RadiusContextProvider({ chain = radiusTestnet, children, }) {
    return (_jsx(RadiusContext.Provider, { value: { chain }, children: children }));
}
export function useRadiusContext() {
    const context = useContext(RadiusContext);
    if (!context) {
        throw new Error('useRadiusContext must be used within a RadiusProvider');
    }
    return context;
}
//# sourceMappingURL=context.js.map