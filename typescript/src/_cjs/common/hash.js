"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hash = void 0;
const viem_1 = require("viem");
class Hash {
    data;
    constructor(data) {
        if (data instanceof Uint8Array) {
            this.data = data;
        }
        else if (typeof data === 'string') {
            const cleanHex = data.startsWith('0x') ? data : `0x${data}`;
            this.data = (0, viem_1.hexToBytes)(cleanHex);
        }
        else {
            this.data = (0, viem_1.hexToBytes)(data);
        }
    }
    bytes() {
        return this.data;
    }
    hex() {
        return (0, viem_1.bytesToHex)(this.data);
    }
    hexWithoutPrefix() {
        return this.hex().substring(2);
    }
}
exports.Hash = Hash;
//# sourceMappingURL=hash.js.map