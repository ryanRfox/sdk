"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = void 0;
class Receipt {
    from;
    to;
    contractAddress;
    txHash;
    gasUsed;
    status;
    logs;
    value;
    constructor(from, to, contractAddress, txHash, gasUsed, status, logs = [], value) {
        this.from = from;
        this.to = to;
        this.contractAddress = contractAddress;
        this.txHash = txHash;
        this.gasUsed = gasUsed;
        this.status = status;
        this.logs = logs;
        this.value = value;
    }
}
exports.Receipt = Receipt;
//# sourceMappingURL=receipt.js.map