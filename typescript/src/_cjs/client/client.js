"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_GAS = void 0;
exports.createRadiusClient = createRadiusClient;
const viem_1 = require("viem");
const transport_1 = require("../transport");
const errors_1 = require("../errors");
exports.MAX_GAS = 1319413953330n;
function getRpcUrl(chain) {
    if (typeof process !== 'undefined' && process.env) {
        const envUrl = process.env.RADIUS_RPC_URL || process.env.RADIUS_ENDPOINT;
        if (envUrl) {
            return envUrl;
        }
    }
    const chainUrl = chain.rpcUrls.default.http[0];
    if (!chainUrl) {
        throw new errors_1.RadiusError('No RPC URL configured. Set RADIUS_RPC_URL environment variable or configure chain.rpcUrls', {
            shortMessage: 'Missing RPC URL configuration',
        });
    }
    return chainUrl;
}
function createRadiusClient(config) {
    const rpcUrl = getRpcUrl(config.chain);
    let transport;
    if (config.transport) {
        transport = config.transport;
    }
    else if (config.logger || config.interceptor) {
        transport = (0, transport_1.createInterceptingTransport)({
            url: rpcUrl,
            interceptor: config.interceptor,
            logger: config.logger,
        });
    }
    else {
        transport = (0, transport_1.createInterceptingTransport)({ url: rpcUrl });
    }
    const publicClient = (0, viem_1.createPublicClient)({
        chain: config.chain,
        transport,
    });
    function toRadiusReceipt(receipt) {
        return {
            transactionHash: receipt.transactionHash,
            from: receipt.from,
            to: receipt.to ?? null,
            contractAddress: receipt.contractAddress ?? null,
            gasUsed: receipt.gasUsed,
            status: receipt.status,
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            logs: receipt.logs,
        };
    }
    async function signAndSendTransaction(signer, tx) {
        const nonce = await publicClient.getTransactionCount({
            address: signer.address,
            blockTag: 'pending',
        });
        let gas;
        if (tx.gas !== undefined) {
            gas = tx.gas;
        }
        else {
            const estimate = await publicClient.estimateGas({
                account: signer.address,
                to: tx.to,
                data: tx.data,
                value: tx.value,
            });
            const margin = estimate / 5n;
            gas = estimate + margin;
            if (gas > exports.MAX_GAS) {
                gas = exports.MAX_GAS;
            }
        }
        const signedTx = await signer.signTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value ?? 0n,
            nonce,
            gas,
            gasPrice: 0n,
            chainId: config.chain.id,
        });
        return publicClient.sendRawTransaction({
            serializedTransaction: signedTx,
        });
    }
    return {
        publicClient,
        async getChainId() {
            return BigInt(publicClient.chain?.id ?? (await publicClient.getChainId()));
        },
        async getBalance(params) {
            if (typeof params === 'string') {
                throw new errors_1.RadiusError('getBalance expects an object parameter', {
                    metaMessages: [
                        'You passed a string directly.',
                        'Use client.getBalance({ address }) instead of client.getBalance(address)',
                    ],
                    details: `Received: ${typeof params}`,
                });
            }
            if (!params || typeof params !== 'object' || !('address' in params)) {
                throw new errors_1.RadiusError('getBalance expects an object with an address property', {
                    metaMessages: [
                        'Example: client.getBalance({ address: "0x..." })',
                    ],
                    details: `Received: ${JSON.stringify(params)}`,
                });
            }
            const { address, blockNumber, blockTag = 'latest' } = params;
            if (blockNumber !== undefined) {
                return publicClient.getBalance({ address, blockNumber });
            }
            return publicClient.getBalance({ address, blockTag });
        },
        async getCode(params) {
            if (typeof params === 'string') {
                throw new errors_1.RadiusError('getCode expects an object parameter', {
                    metaMessages: [
                        'You passed a string directly.',
                        'Use client.getCode({ address }) instead of client.getCode(address)',
                    ],
                    details: `Received: ${typeof params}`,
                });
            }
            if (!params || typeof params !== 'object' || !('address' in params)) {
                throw new errors_1.RadiusError('getCode expects an object with an address property', {
                    metaMessages: [
                        'Example: client.getCode({ address: "0x..." })',
                    ],
                    details: `Received: ${JSON.stringify(params)}`,
                });
            }
            const { address, blockNumber, blockTag = 'latest' } = params;
            if (blockNumber !== undefined) {
                return publicClient.getCode({ address, blockNumber });
            }
            return publicClient.getCode({ address, blockTag });
        },
        async getTransactionCount(params) {
            if (typeof params === 'string') {
                throw new errors_1.RadiusError('getTransactionCount expects an object parameter', {
                    metaMessages: [
                        'You passed a string directly.',
                        'Use client.getTransactionCount({ address }) instead of client.getTransactionCount(address)',
                    ],
                    details: `Received: ${typeof params}`,
                });
            }
            if (!params || typeof params !== 'object' || !('address' in params)) {
                throw new errors_1.RadiusError('getTransactionCount expects an object with an address property', {
                    metaMessages: [
                        'Example: client.getTransactionCount({ address: "0x..." })',
                    ],
                    details: `Received: ${JSON.stringify(params)}`,
                });
            }
            const { address, blockNumber, blockTag = 'pending' } = params;
            if (blockNumber !== undefined) {
                return publicClient.getTransactionCount({ address, blockNumber });
            }
            return publicClient.getTransactionCount({ address, blockTag });
        },
        async estimateGas(tx) {
            const estimate = await publicClient.estimateGas(tx);
            const margin = estimate / 5n;
            const gas = estimate + margin;
            return gas > exports.MAX_GAS ? exports.MAX_GAS : gas;
        },
        async call(contract, method, ...args) {
            if (!contract.abi) {
                throw new errors_1.MissingAbiError('Contract ABI is required');
            }
            if (!contract.address) {
                throw new errors_1.ContractCallError('Contract address is required', {
                    functionName: method,
                    args: args,
                });
            }
            let data;
            try {
                data = (0, viem_1.encodeFunctionData)({
                    abi: contract.abi,
                    functionName: method,
                    args: args,
                });
            }
            catch (err) {
                throw new errors_1.AbiError(`Failed to encode function call: ${err.message}`, {
                    cause: err,
                });
            }
            const result = await publicClient.call({
                to: contract.address,
                data,
            });
            if (!result.data) {
                throw new errors_1.ContractCallError('No data returned from contract call', {
                    contractAddress: contract.address,
                    functionName: method,
                    args: args,
                });
            }
            let decoded;
            try {
                decoded = (0, viem_1.decodeFunctionResult)({
                    abi: contract.abi,
                    functionName: method,
                    data: result.data,
                });
            }
            catch (err) {
                throw new errors_1.AbiError(`Failed to decode function result: ${err.message}`, {
                    cause: err,
                });
            }
            return decoded;
        },
        async execute(contract, signer, method, ...args) {
            if (!contract.abi) {
                throw new errors_1.MissingAbiError('Contract ABI is required');
            }
            if (!contract.address) {
                throw new errors_1.ContractCallError('Contract address is required', {
                    functionName: method,
                    args: args,
                });
            }
            let data;
            try {
                data = (0, viem_1.encodeFunctionData)({
                    abi: contract.abi,
                    functionName: method,
                    args: args,
                });
            }
            catch (err) {
                throw new errors_1.AbiError(`Failed to encode function call: ${err.message}`, {
                    cause: err,
                });
            }
            return signAndSendTransaction(signer, {
                to: contract.address,
                data,
                value: 0n,
            });
        },
        async executeAndWait(contract, signer, method, ...args) {
            const hash = await this.execute(contract, signer, method, ...args);
            return this.waitForTransactionReceipt({ hash });
        },
        async send(signer, to, value) {
            return signAndSendTransaction(signer, {
                to,
                value,
            });
        },
        async sendAndWait(signer, to, value) {
            const hash = await this.send(signer, to, value);
            return this.waitForTransactionReceipt({ hash });
        },
        async deployContract(signer, bytecode, abi, ...args) {
            let deployData = bytecode;
            if (args.length > 0) {
                const ctorItem = abi.find((item) => typeof item === 'object' &&
                    item !== null &&
                    'type' in item &&
                    item.type === 'constructor');
                if (ctorItem?.inputs && ctorItem.inputs.length > 0) {
                    try {
                        const encodedArgs = (0, viem_1.encodeAbiParameters)(ctorItem.inputs, args);
                        deployData = `${bytecode}${encodedArgs.slice(2)}`;
                    }
                    catch (err) {
                        throw new errors_1.AbiError(`Failed to encode constructor arguments: ${err.message}`, {
                            cause: err,
                        });
                    }
                }
            }
            const hash = await signAndSendTransaction(signer, {
                data: deployData,
                value: 0n,
            });
            const receipt = await this.waitForTransactionReceipt({ hash });
            if (!receipt.contractAddress) {
                throw new errors_1.ContractDeploymentError('Contract deployment failed: no contract address in receipt', {
                    bytecode,
                    constructorArgs: args,
                });
            }
            if (receipt.status !== 'success') {
                throw new errors_1.TransactionRevertedError('Contract deployment failed: transaction reverted', {
                    transactionHash: receipt.transactionHash,
                });
            }
            return {
                address: receipt.contractAddress,
                receipt,
            };
        },
        async sendRawTransaction(params) {
            if (typeof params === 'string') {
                throw new errors_1.RadiusError('sendRawTransaction expects an object parameter', {
                    metaMessages: [
                        'You passed a string directly.',
                        'Use client.sendRawTransaction({ serializedTransaction }) instead of client.sendRawTransaction(signedTx)',
                    ],
                    details: `Received: ${typeof params}`,
                });
            }
            if (!params || typeof params !== 'object' || !('serializedTransaction' in params)) {
                throw new errors_1.RadiusError('sendRawTransaction expects an object with a serializedTransaction property', {
                    metaMessages: [
                        'Example: client.sendRawTransaction({ serializedTransaction: "0x..." })',
                    ],
                    details: `Received: ${JSON.stringify(params)}`,
                });
            }
            return publicClient.sendRawTransaction({
                serializedTransaction: params.serializedTransaction,
            });
        },
        async waitForTransactionReceipt(params) {
            if (typeof params === 'string') {
                throw new errors_1.RadiusError('waitForTransactionReceipt expects an object parameter', {
                    metaMessages: [
                        'You passed a string directly.',
                        'Use client.waitForTransactionReceipt({ hash }) instead of client.waitForTransactionReceipt(hash)',
                    ],
                    details: `Received: ${typeof params}`,
                });
            }
            if (!params || typeof params !== 'object' || !('hash' in params)) {
                throw new errors_1.RadiusError('waitForTransactionReceipt expects an object with a hash property', {
                    metaMessages: [
                        'Example: client.waitForTransactionReceipt({ hash: "0x..." })',
                    ],
                    details: `Received: ${JSON.stringify(params)}`,
                });
            }
            const receipt = await publicClient.waitForTransactionReceipt({ hash: params.hash });
            return toRadiusReceipt(receipt);
        },
        extend(extender) {
            const extension = extender(this);
            return Object.assign(Object.create(this), extension);
        },
    };
}
//# sourceMappingURL=client.js.map