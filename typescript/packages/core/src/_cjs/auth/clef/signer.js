"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClefSigner = void 0;
exports.createClefSigner = createClefSigner;
const viem_1 = require("viem");
class ClefSigner {
    constructor(address, chainId, clefUrl) {
        Object.defineProperty(this, "address", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "chainId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clefUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.address = address;
        this.chainId = chainId;
        this.clefUrl = clefUrl;
    }
    async signMessage(message) {
        const messageHash = (0, viem_1.hashMessage)(message);
        try {
            const result = await this.rpcCall('account_signData', [
                'application/x-clique-header',
                this.address,
                messageHash,
            ]);
            return this.normalizeHex(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Clef message signing failed: ${errorMessage}`);
        }
    }
    async signTransaction(tx) {
        const clefTx = {
            from: this.address,
            chainId: this.toHex(this.chainId),
        };
        if (tx.to) {
            clefTx.to = tx.to;
        }
        if (tx.data) {
            clefTx.data = tx.data;
        }
        if (tx.value !== undefined && tx.value !== null) {
            clefTx.value = this.toHex(tx.value);
        }
        if (tx.gas !== undefined && tx.gas !== null) {
            clefTx.gas = this.toHex(tx.gas);
        }
        if (tx.gasPrice !== undefined && tx.gasPrice !== null) {
            clefTx.gasPrice = this.toHex(tx.gasPrice);
        }
        if (tx.nonce !== undefined && tx.nonce !== null) {
            clefTx.nonce = this.toHex(tx.nonce);
        }
        if (tx.maxFeePerGas !== undefined && tx.maxFeePerGas !== null) {
            clefTx.maxFeePerGas = this.toHex(tx.maxFeePerGas);
        }
        if (tx.maxPriorityFeePerGas !== undefined &&
            tx.maxPriorityFeePerGas !== null) {
            clefTx.maxPriorityFeePerGas = this.toHex(tx.maxPriorityFeePerGas);
        }
        try {
            const result = await this.rpcCall('account_signTransaction', [clefTx]);
            return this.normalizeHex(result.raw);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Clef transaction signing failed: ${errorMessage}`);
        }
    }
    async verifyConnection() {
        try {
            const version = await this.rpcCall('account_version', []);
            if (!version) {
                throw new Error('Failed to get Clef version');
            }
            const accounts = await this.rpcCall('account_list', []);
            const normalizedAddress = this.address.toLowerCase();
            const addressFound = accounts.some((account) => account.toLowerCase() === normalizedAddress);
            if (!addressFound) {
                throw new Error(`Address ${this.address} not found in Clef accounts`);
            }
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to verify Clef connection: ${errorMessage}`);
        }
    }
    async rpcCall(method, params) {
        const response = await fetch(this.clefUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method,
                params,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data.result;
    }
    toHex(value) {
        return `0x${value.toString(16)}`;
    }
    normalizeHex(hex) {
        return (hex.startsWith('0x') ? hex : `0x${hex}`);
    }
}
exports.ClefSigner = ClefSigner;
function createClefSigner(address, chainId, clefUrl) {
    return new ClefSigner(address, chainId, clefUrl);
}
//# sourceMappingURL=signer.js.map