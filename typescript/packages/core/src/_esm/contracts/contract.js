/**
 * Contract class for interacting with smart contracts on Radius.
 * Provides methods to call read-only methods and execute state-changing methods.
 * The class handles method encoding, parameter serialization, and result decoding
 * according to the contract's ABI specification.
 */
export class Contract {
  /**
   * Create a new Contract instance.
   * @param address Contract address
   * @param abi Contract ABI
   */
  constructor(address, abi) {
    /**
     * The contract's ABI (Application Binary Interface)
     * Used for encoding and decoding method calls and return values
     */
    Object.defineProperty(this, 'abi', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    /**
     * The contract's address on Radius
     * @private
     */
    Object.defineProperty(this, '_address', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.abi = abi;
    this._address = address;
  }
  /**
   * Get the contract address.
   * @returns The contract address
   */
  address() {
    return this._address;
  }
  /**
   * Calls a read-only contract method without creating a transaction
   * @param client Radius client instance used to make the call
   * @param method Name of the method to call on the contract
   * @param args Arguments to pass to the contract method
   * @returns Array of decoded return values from the contract method
   * @throws Error if the contract ABI is missing
   * @throws Error if the contract address is missing or zero
   * @throws Error if the contract method call fails
   */
  async call(client, method, ...args) {
    return client.call(this, method, ...args);
  }
  /**
   * Executes a contract method that modifies Radius state
   * @param client Radius client instance used to execute the transaction
   * @param signer The signer used to sign the transaction
   * @param method Name of the method to execute on the contract
   * @param args Arguments to pass to the contract method
   * @returns Transaction receipt after the method execution
   * @throws Error if the contract ABI is missing
   * @throws Error if the contract address is missing or zero
   * @throws Error if the transaction fails or is reverted
   * @throws Error if the transaction receipt is not returned
   */
  async execute(client, signer, method, ...args) {
    return client.execute(this, signer, method, ...args);
  }
}
//# sourceMappingURL=contract.js.map
