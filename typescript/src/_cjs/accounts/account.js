"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const common_1 = require("../common");
class Account {
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    static async New(...opts) {
        const options = {};
        for (const opt of opts) {
            await opt(options);
        }
        return new Account(options.signer);
    }
    address() {
        return this.signer ? new common_1.Address(this.signer.address) : (0, common_1.zeroAddress)();
    }
    async balance(client) {
        return client.balanceAt(this.address());
    }
    async nonce(client) {
        return client.pendingNonceAt(this.address());
    }
    async send(client, recipient, value) {
        if (!this.signer) {
            throw new Error('Signer is required for sending transactions');
        }
        return client.send(this.signer, recipient, value);
    }
    async signMessage(message) {
        if (!this.signer) {
            throw new Error('Signer is required for signing messages');
        }
        const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
        const signature = await this.signer.signMessage(messageStr);
        const hexStr = signature.startsWith('0x') ? signature.slice(2) : signature;
        const bytes = new Uint8Array(hexStr.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }
    async signTransaction(transaction) {
        if (!this.signer) {
            throw new Error('Signer is required for sending transactions');
        }
        const toBigInt = (value) => {
            if (value === undefined)
                return undefined;
            return typeof value === 'bigint' ? value : BigInt(value);
        };
        const signedTx = await this.signer.signTransaction({
            to: transaction.to?.hex(),
            value: toBigInt(transaction.value) ?? 0n,
            data: transaction.data,
            nonce: transaction.nonce,
            gas: toBigInt(transaction.gas),
            gasPrice: toBigInt(transaction.gasPrice) ?? 0n,
            chainId: this.signer.chainId,
        });
        return new common_1.SignedTransaction(signedTx);
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map