"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_ADDRESS = void 0;
exports.addressToBytes = addressToBytes;
exports.isAddressEqual = isAddressEqual;
exports.toChecksumAddress = toChecksumAddress;
const viem_1 = require("viem");
function addressToBytes(address) {
    return (0, viem_1.hexToBytes)(address);
}
function isAddressEqual(a, b) {
    return (0, viem_1.isAddressEqual)(a, b);
}
function toChecksumAddress(address) {
    return (0, viem_1.getAddress)(address);
}
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
//# sourceMappingURL=address.js.map