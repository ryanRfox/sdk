"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPrivateKey = withPrivateKey;
exports.withAccount = withAccount;
const auth_1 = require("../auth");
function withPrivateKey(key) {
    return async (options) => {
        options.account = (0, auth_1.createPrivateKeySigner)(key);
    };
}
function withAccount(account) {
    return async (options) => {
        options.account = account;
    };
}
//# sourceMappingURL=options.js.map