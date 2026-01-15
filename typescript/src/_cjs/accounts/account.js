"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const common_1 = require("../common");
class Account {
    account;
    constructor(account) {
        this.account = account;
    }
    static async New(...opts) {
        const options = {};
        for (const opt of opts) {
            await opt(options);
        }
        return new Account(options.account);
    }
    address() {
        return this.account?.address ?? common_1.ZERO_ADDRESS;
    }
    async balance(client) {
        return client.balanceAt(this.address());
    }
    async nonce(client) {
        return client.pendingNonceAt(this.address());
    }
    async send(client, recipient, value) {
        if (!this.account) {
            throw new Error('Account is required for sending transactions');
        }
        return client.send(this.account, recipient, value);
    }
    async signMessage(message) {
        if (!this.account) {
            throw new Error('Account is required for signing messages');
        }
        const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
        const signature = await this.account.signMessage({ message: messageStr });
        const hexStr = signature.startsWith('0x') ? signature.slice(2) : signature;
        const bytes = new Uint8Array(hexStr.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }
    async signTransaction(transaction, chainId) {
        if (!this.account) {
            throw new Error('Account is required for signing transactions');
        }
        const toBigInt = (value) => {
            if (value === undefined)
                return undefined;
            return typeof value === 'bigint' ? value : BigInt(value);
        };
        const signedTx = await this.account.signTransaction({
            to: transaction.to,
            value: toBigInt(transaction.value) ?? 0n,
            data: transaction.data,
            nonce: transaction.nonce,
            gas: toBigInt(transaction.gas),
            gasPrice: toBigInt(transaction.gasPrice) ?? 0n,
            chainId,
        });
        return new common_1.SignedTransaction(signedTx);
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map