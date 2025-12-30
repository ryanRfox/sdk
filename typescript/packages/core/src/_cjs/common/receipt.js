Object.defineProperty(exports, '__esModule', { value: true });
exports.Receipt = void 0;
class Receipt {
  constructor(from, to, contractAddress, txHash, gasUsed, status, logs = [], value) {
    Object.defineProperty(this, 'from', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: from,
    });
    Object.defineProperty(this, 'to', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: to,
    });
    Object.defineProperty(this, 'contractAddress', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: contractAddress,
    });
    Object.defineProperty(this, 'txHash', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: txHash,
    });
    Object.defineProperty(this, 'gasUsed', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: gasUsed,
    });
    Object.defineProperty(this, 'status', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: status,
    });
    Object.defineProperty(this, 'logs', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: logs,
    });
    Object.defineProperty(this, 'value', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: value,
    });
  }
}
exports.Receipt = Receipt;
//# sourceMappingURL=receipt.js.map
