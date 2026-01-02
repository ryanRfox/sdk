"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignedTransaction = exports.Transaction = void 0;
class Transaction {
    data;
    gas;
    gasPrice;
    nonce;
    to;
    value;
    constructor(data, gas, gasPrice, nonce, to, value) {
        this.data = data;
        this.gas = gas;
        this.gasPrice = gasPrice;
        this.nonce = nonce;
        this.to = to;
        this.value = value;
    }
}
exports.Transaction = Transaction;
class SignedTransaction {
    serialized;
    constructor(serialized) {
        this.serialized = serialized;
    }
    toString() {
        return this.serialized;
    }
}
exports.SignedTransaction = SignedTransaction;
//# sourceMappingURL=transaction.js.map