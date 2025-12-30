"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignedTransaction = exports.Transaction = void 0;
class Transaction {
    constructor(data, gas, gasPrice, nonce, to, value) {
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gasPrice", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nonce", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "to", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    constructor(serialized) {
        Object.defineProperty(this, "serialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.serialized = serialized;
    }
    toString() {
        return this.serialized;
    }
}
exports.SignedTransaction = SignedTransaction;
//# sourceMappingURL=transaction.js.map