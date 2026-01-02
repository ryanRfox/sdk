/**
 * Receipt represents the result of a successfully mined transaction
 * Contains information about the transaction execution including gas usage,
 * emitted events, and contract creation if applicable
 */
export class Receipt {
    from;
    to;
    contractAddress;
    txHash;
    gasUsed;
    status;
    logs;
    value;
    /**
     * Creates a new receipt
     * @param from The sender address
     * @param to The recipient address
     * @param contractAddress The created contract address (if any)
     * @param txHash The transaction hash
     * @param gasUsed The amount of gas used
     * @param status The transaction status (1 for success, 0 for failure)
     * @param logs The transaction logs/events
     * @param value The amount of native currency (USD) transferred
     */
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
//# sourceMappingURL=receipt.js.map