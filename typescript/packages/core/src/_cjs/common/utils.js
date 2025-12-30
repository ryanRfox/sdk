"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abiFromJSON = abiFromJSON;
exports.addressFromHex = addressFromHex;
exports.bytecodeFromHex = bytecodeFromHex;
exports.ethAddressFromRadiusAddress = ethAddressFromRadiusAddress;
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
    return new address_1.Address((0, viem_1.hexToBytes)(cleanHex));
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
function ethAddressFromRadiusAddress(address) {
    if (!address) {
        return undefined;
    }
    return address.ethAddress();
}
function eventsFromEthLogs(logs) {
    return logs.map((log) => new event_1.Event(log.topics[0], {}, log.data));
}
function hashFromHex(hex) {
    const cleanHex = hex.startsWith('0x') ? hex : `0x${hex}`;
    return new hash_1.Hash((0, viem_1.hexToBytes)(cleanHex));
}
function receiptFromEthReceipt(receipt, from, to = new address_1.Address(zeroAddress()), value) {
    return new receipt_1.Receipt(from, to, new address_1.Address(receipt.contractAddress ?? zeroAddress()), new hash_1.Hash(receipt.transactionHash ?? receipt.hash), receipt.gasUsed, receipt.status === 'success' ? 1 : receipt.status ?? 0, eventsFromEthLogs(receipt.logs ?? []), value);
}
function zeroAddress() {
    return new address_1.Address('0x0000000000000000000000000000000000000000');
}
//# sourceMappingURL=utils.js.map