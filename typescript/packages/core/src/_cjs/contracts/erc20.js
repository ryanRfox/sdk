"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20 = exports.ERC20_ABI = void 0;
exports.createERC20 = createERC20;
const viem_1 = require("viem");
exports.ERC20_ABI = (0, viem_1.parseAbi)([
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);
class ERC20 {
    constructor(address, publicClient) {
        Object.defineProperty(this, "address", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "publicClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_decimals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_symbol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.address = address;
        this.publicClient = publicClient;
    }
    async name() {
        if (this._name !== undefined) {
            return this._name;
        }
        const name = await this.publicClient.readContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'name',
        });
        this._name = name;
        return name;
    }
    async symbol() {
        if (this._symbol !== undefined) {
            return this._symbol;
        }
        const symbol = await this.publicClient.readContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'symbol',
        });
        this._symbol = symbol;
        return symbol;
    }
    async decimals() {
        if (this._decimals !== undefined) {
            return this._decimals;
        }
        const decimals = await this.publicClient.readContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'decimals',
        });
        this._decimals = decimals;
        return decimals;
    }
    async totalSupply() {
        return this.publicClient.readContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'totalSupply',
        });
    }
    async balanceOf(owner) {
        return this.publicClient.readContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'balanceOf',
            args: [owner],
        });
    }
    async allowance(owner, spender) {
        return this.publicClient.readContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'allowance',
            args: [owner, spender],
        });
    }
    async transfer(signer, to, amount) {
        const hash = await signer.walletClient.writeContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'transfer',
            args: [to, amount],
            account: signer.account,
            chain: signer.walletClient.chain,
        });
        return hash;
    }
    async transferSync(signer, to, amount) {
        const hash = await this.transfer(signer, to, amount);
        return this.publicClient.waitForTransactionReceipt({ hash });
    }
    async approve(signer, spender, amount) {
        const hash = await signer.walletClient.writeContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'approve',
            args: [spender, amount],
            account: signer.account,
            chain: signer.walletClient.chain,
        });
        return hash;
    }
    async approveSync(signer, spender, amount) {
        const hash = await this.approve(signer, spender, amount);
        return this.publicClient.waitForTransactionReceipt({ hash });
    }
    async transferFrom(signer, from, to, amount) {
        const hash = await signer.walletClient.writeContract({
            address: this.address,
            abi: exports.ERC20_ABI,
            functionName: 'transferFrom',
            args: [from, to, amount],
            account: signer.account,
            chain: signer.walletClient.chain,
        });
        return hash;
    }
    async transferFromSync(signer, from, to, amount) {
        const hash = await this.transferFrom(signer, from, to, amount);
        return this.publicClient.waitForTransactionReceipt({ hash });
    }
    async formatAmount(amount) {
        const decimals = await this.decimals();
        return (0, viem_1.formatUnits)(amount, decimals);
    }
    async parseAmount(amount) {
        const decimals = await this.decimals();
        return (0, viem_1.parseUnits)(amount, decimals);
    }
    clearCache() {
        this._name = undefined;
        this._symbol = undefined;
        this._decimals = undefined;
    }
}
exports.ERC20 = ERC20;
function createERC20(address, publicClient) {
    return new ERC20(address, publicClient);
}
//# sourceMappingURL=erc20.js.map