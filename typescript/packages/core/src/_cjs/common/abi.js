"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABI = void 0;
const viem_1 = require("viem");
class ABI {
    constructor(abiJSON) {
        Object.defineProperty(this, "abi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!abiJSON) {
            throw new Error('ABI JSON string is empty');
        }
        this.abi = JSON.parse(abiJSON);
    }
    pack(name, ...args) {
        if (name === '') {
            const ctorItem = this.abi.find((item) => item.type === 'constructor');
            if (!ctorItem || ctorItem.type !== 'constructor') {
                return new Uint8Array(0);
            }
            const encoded = (0, viem_1.encodeAbiParameters)(ctorItem.inputs, args);
            return (0, viem_1.hexToBytes)(encoded);
        }
        const encoded = (0, viem_1.encodeFunctionData)({
            abi: this.abi,
            functionName: name,
            args: args,
        });
        return (0, viem_1.hexToBytes)(encoded);
    }
    unpack(name, data) {
        if (name === '') {
            return [];
        }
        try {
            let hexData;
            if (data instanceof Uint8Array) {
                hexData = `0x${Array.from(data)
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('')}`;
            }
            else if (typeof data === 'string') {
                hexData = (data.startsWith('0x') ? data : `0x${data}`);
            }
            else {
                hexData = data;
            }
            const result = (0, viem_1.decodeFunctionResult)({
                abi: this.abi,
                functionName: name,
                data: hexData,
            });
            if (Array.isArray(result)) {
                return result;
            }
            return [result];
        }
        catch (error) {
            throw new Error(`Failed to unpack ABI data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.ABI = ABI;
//# sourceMappingURL=abi.js.map