Object.defineProperty(exports, '__esModule', { value: true });
exports.PrivateKeySigner = void 0;
exports.createPrivateKeySigner = createPrivateKeySigner;
const accounts_1 = require('viem/accounts');
class PrivateKeySigner {
  constructor(privateKey, chainId) {
    Object.defineProperty(this, 'account', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, 'chainId', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.account = (0, accounts_1.privateKeyToAccount)(privateKey);
    this.chainId = chainId;
  }
  get address() {
    return this.account.address;
  }
  async signMessage(message) {
    return this.account.signMessage({ message });
  }
  async signTransaction(tx) {
    return this.account.signTransaction({ ...tx, chainId: this.chainId });
  }
}
exports.PrivateKeySigner = PrivateKeySigner;
function createPrivateKeySigner(privateKey, chainId) {
  return new PrivateKeySigner(privateKey, chainId);
}
//# sourceMappingURL=signer.js.map
