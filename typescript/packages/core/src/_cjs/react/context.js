"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadiusContextProvider = RadiusContextProvider;
exports.useRadiusContext = useRadiusContext;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const index_js_1 = require("../chains/index.js");
const RadiusContext = (0, react_1.createContext)(null);
function RadiusContextProvider({ chain = index_js_1.radiusTestnet, children, }) {
    return ((0, jsx_runtime_1.jsx)(RadiusContext.Provider, { value: { chain }, children: children }));
}
function useRadiusContext() {
    const context = (0, react_1.useContext)(RadiusContext);
    if (!context) {
        throw new Error('useRadiusContext must be used within a RadiusProvider');
    }
    return context;
}
//# sourceMappingURL=context.js.map