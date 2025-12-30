"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToSigningKey = hexToSigningKey;
exports.keccak256 = keccak256;
exports.pubkeyToAddress = pubkeyToAddress;
exports.sign = sign;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const common_1 = require("../common");
function toBytes(data) {
    if (data instanceof Uint8Array) {
        return data;
    }
    if (typeof data === 'string') {
        const hex = data.startsWith('0x') ? data : `0x${data}`;
        return (0, viem_1.hexToBytes)(hex);
    }
    throw new Error('Invalid BytesLike input');
}
function hexToSigningKey(key) {
    const formattedKey = (key.startsWith('0x') ? key : `0x${key}`);
    const account = (0, accounts_1.privateKeyToAccount)(formattedKey);
    const publicKeyHex = account.publicKey;
    return {
        publicKey: (0, viem_1.hexToBytes)(publicKeyHex),
        privateKey: (0, viem_1.hexToBytes)(formattedKey),
    };
}
function keccak256(data) {
    if (Array.isArray(data)) {
        const totalLength = data.reduce((sum, d) => sum + toBytes(d).length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const d of data) {
            const bytes = toBytes(d);
            combined.set(bytes, offset);
            offset += bytes.length;
        }
        const hash = (0, viem_1.keccak256)((0, viem_1.bytesToHex)(combined));
        return (0, viem_1.hexToBytes)(hash);
    }
    const hash = (0, viem_1.keccak256)((0, viem_1.bytesToHex)(toBytes(data)));
    return (0, viem_1.hexToBytes)(hash);
}
function pubkeyToAddress(publicKey) {
    const bytes = toBytes(publicKey);
    const keyWithoutPrefix = bytes.slice(1);
    const hash = (0, viem_1.keccak256)((0, viem_1.bytesToHex)(keyWithoutPrefix));
    const addressHex = `0x${hash.slice(-40)}`;
    return new common_1.Address(addressHex);
}
async function sign(digestHash, key) {
    const privateKeyHex = (0, viem_1.bytesToHex)(key.privateKey);
    const account = (0, accounts_1.privateKeyToAccount)(privateKeyHex);
    const hashHex = (0, viem_1.bytesToHex)(toBytes(digestHash));
    const signature = await account.signMessage({
        message: { raw: hashHex },
    });
    return (0, viem_1.hexToBytes)(signature);
}
//# sourceMappingURL=utils.js.map