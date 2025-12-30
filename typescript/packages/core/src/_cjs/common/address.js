Object.defineProperty(exports, '__esModule', { value: true });
exports.Address = void 0;
const viem_1 = require('viem');
class Address {
  constructor(data) {
    Object.defineProperty(this, 'data', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    if (data instanceof Address) {
      this.data = data.bytes();
    } else if (typeof data === 'string') {
      const cleanHex = data.startsWith('0x') ? data : `0x${data}`;
      this.data = (0, viem_1.hexToBytes)(cleanHex);
    } else if (data instanceof Uint8Array) {
      if (data.length !== 20) {
        throw new Error('Address must be 20 bytes');
      }
      this.data = data;
    } else {
      const bytes = (0, viem_1.hexToBytes)(data);
      if (bytes.length !== 20) {
        throw new Error('Address must be 20 bytes');
      }
      this.data = bytes;
    }
  }
  bytes() {
    return this.data;
  }
  ethAddress() {
    return (0, viem_1.getAddress)(this.hex());
  }
  hex() {
    return (0, viem_1.bytesToHex)(this.data);
  }
  equals(other) {
    return this.hex().toLowerCase() === other.hex().toLowerCase();
  }
}
exports.Address = Address;
//# sourceMappingURL=address.js.map
