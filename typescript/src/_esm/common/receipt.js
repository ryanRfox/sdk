/**
 * Creates a Receipt object.
 *
 * @deprecated Use RadiusReceipt from '@radiustechsystems/sdk/client' instead.
 */
export function createReceipt(from, to, contractAddress, txHash, gasUsed, status, logs = [], value) {
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