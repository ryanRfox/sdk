"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrivateKeySigner = createPrivateKeySigner;
const accounts_1 = require("viem/accounts");
function createPrivateKeySigner(privateKey) {
    return (0, accounts_1.privateKeyToAccount)(privateKey);
}
//# sourceMappingURL=signer.js.map