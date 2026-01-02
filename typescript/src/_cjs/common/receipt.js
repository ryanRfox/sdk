"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReceipt = createReceipt;
function createReceipt(from, to, contractAddress, txHash, gasUsed, status, logs = [], value) {
    return {
        from,
        to,
        contractAddress,
        txHash,
        gasUsed,
        status,
        logs,
        value,
    };
}
//# sourceMappingURL=receipt.js.map