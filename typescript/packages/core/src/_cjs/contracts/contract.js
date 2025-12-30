Object.defineProperty(exports, '__esModule', { value: true });
exports.Contract = void 0;
class Contract {
  constructor(address, abi) {
    Object.defineProperty(this, 'abi', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, '_address', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.abi = abi;
    this._address = address;
  }
  address() {
    return this._address;
  }
  async call(client, method, ...args) {
    return client.call(this, method, ...args);
  }
  async execute(client, signer, method, ...args) {
    return client.execute(this, signer, method, ...args);
  }
}
exports.Contract = Contract;
//# sourceMappingURL=contract.js.map
