"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abiFromJSON = abiFromJSON;
exports.addressFromHex = addressFromHex;
exports.bytecodeFromHex = bytecodeFromHex;
exports.eventsFromEthLogs = eventsFromEthLogs;
exports.hashFromHex = hashFromHex;
exports.receiptFromEthReceipt = receiptFromEthReceipt;
exports.zeroAddress = zeroAddress;
const viem_1 = require("viem");
const abi_1 = require("./abi");
const address_1 = require("./address");
const event_1 = require("./event");
const hash_1 = require("./hash");
const receipt_1 = require("./receipt");
function abiFromJSON(json) {
    try {
        return new abi_1.ABI(json);
    }
    catch {
        return undefined;
    }
}
function addressFromHex(hex) {
    const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
    return (0, viem_1.getAddress)(cleanHex);
}
function bytecodeFromHex(s) {
    try {
        const cleanHex = s.startsWith('0x') ? s.slice(2) : s;
        return (0, viem_1.hexToBytes)(`0x${cleanHex}`);
    }
    catch {
        return undefined;
    }
}
function eventsFromEthLogs(logs) {
    return logs.map((log) => new event_1.Event(log.topics[0] ?? '', {}, log.data ?? '0x'));
}
function hashFromHex(hex) {
    const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
    return new hash_1.Hash((0, viem_1.hexToBytes)(cleanHex));
}
function receiptFromEthReceipt(receipt, from, to, value) {
    const status = receipt.status;
    return (0, receipt_1.createReceipt)(from ?? receipt.from, to ?? receipt.to ?? null, receipt.contractAddress ?? null, receipt.transactionHash, receipt.gasUsed, status, eventsFromEthLogs(receipt.logs ?? []), value);
}
function zeroAddress() {
    return address_1.ZERO_ADDRESS;
}
//# sourceMappingURL=utils.js.map