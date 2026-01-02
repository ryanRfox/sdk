/**
 * Transaction represents an unsigned Radius EVM transaction.
 * Contains all the data needed to execute a Radius transaction.
 *
 * @deprecated Use TransactionParams interface instead for cleaner types.
 */
export class Transaction {
    /** The call data for the transaction */
    data;
    /** Maximum amount of gas units */
    gas;
    /** Price per gas unit in wei */
    gasPrice;
    /** Sequential transaction number */
    nonce;
    /** Destination address */
    to;
    /** Amount of native currency in wei */
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
/**
 * SignedTransaction represents a cryptographically signed transaction
 * ready to be sent to Radius
 */
export class SignedTransaction {
    /**
     * RLP-encoded signed transaction bytes as hex string
     */
    serialized;
    /**
     * Creates a new SignedTransaction
     * @param serialized The RLP-encoded signed transaction as hex string
     */
    constructor(serialized) {
        this.serialized = serialized;
    }
    /**
     * Returns the serialized transaction as a hex string
     */
    toString() {
        return this.serialized;
    }
}
//# sourceMappingURL=transaction.js.map