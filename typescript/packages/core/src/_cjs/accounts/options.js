"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPrivateKey = withPrivateKey;
exports.withSigner = withSigner;
const auth_1 = require("../auth");
function withPrivateKey(key, chainId) {
    return async (options) => {
        options.signer = new auth_1.PrivateKeySigner(key, chainId);
    };
}
function withSigner(signer) {
    return async (options) => {
        options.signer = signer;
    };
}
//# sourceMappingURL=options.js.map