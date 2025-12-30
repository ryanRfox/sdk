/**
 * Transaction represents an unsigned Radius EVM transaction
 * Contains all the data needed to execute a Radius transaction
 */
export class Transaction {
  /**
   * Creates a new unsigned transaction
   * @param data The calldata for the transaction
   * @param gas Maximum amount of gas units the transaction can consume
   * @param gasPrice Price per gas unit in wei
   * @param nonce Sequential transaction number for the sending account
   * @param to Destination address (undefined for contract creation)
   * @param value Amount of native currency to send in wei
   */
  constructor(data, gas, gasPrice, nonce, to, value) {
    /**
     * The call data for the transaction (bytecode for contract creation, or method call data)
     */
    Object.defineProperty(this, 'data', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    /**
     * Maximum amount of gas units the transaction can consume
     */
    Object.defineProperty(this, 'gas', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    /**
     * Price per gas unit in wei
     */
    Object.defineProperty(this, 'gasPrice', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    /**
     * Sequential transaction number for the sending account
     */
    Object.defineProperty(this, 'nonce', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    /**
     * Destination address (undefined for contract creation)
     */
    Object.defineProperty(this, 'to', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    /**
     * Amount of native currency to send in wei
     */
    Object.defineProperty(this, 'value', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
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
   * Creates a new SignedTransaction
   * @param serialized The RLP-encoded signed transaction as hex string
   */
  constructor(serialized) {
    /**
     * RLP-encoded signed transaction bytes as hex string
     */
    Object.defineProperty(this, 'serialized', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
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
