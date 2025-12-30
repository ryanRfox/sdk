"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRadiusBalance = useRadiusBalance;
const wagmi_1 = require("wagmi");
function useRadiusBalance(params = {}) {
    const { address: connectedAddress } = (0, wagmi_1.useAccount)();
    const address = params.address ?? connectedAddress;
    return (0, wagmi_1.useBalance)({
        address,
    });
}
//# sourceMappingURL=useRadiusBalance.js.map