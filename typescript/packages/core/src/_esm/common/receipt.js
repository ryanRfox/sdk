/**
 * Receipt represents the result of a successfully mined transaction
 * Contains information about the transaction execution including gas usage,
 * emitted events, and contract creation if applicable
 */
export class Receipt {
    /**
     * Creates a new receipt
     * @param from The sender address
     * @param to The recipient address
     * @param contractAddress The created contract address (if any)
     * @param txHash The transaction hash
     * @param gasUsed The amount of gas used
     * @param status The transaction status (1 for success, 0 for failure)
     * @param logs The transaction logs/events
     * @param value The amount of ETH transferred
     */
    constructor(from, to, contractAddress, txHash, gasUsed, status, logs = [], value) {
        Object.defineProperty(this, "from", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: from
        });
        Object.defineProperty(this, "to", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: to
        });
        Object.defineProperty(this, "contractAddress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: contractAddress
        });
        Object.defineProperty(this, "txHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: txHash
        });
        Object.defineProperty(this, "gasUsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: gasUsed
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
        Object.defineProperty(this, "logs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: logs
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
        });
    }
}
//# sourceMappingURL=receipt.js.map