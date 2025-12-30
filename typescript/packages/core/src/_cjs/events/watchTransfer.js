"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchTransfer = watchTransfer;
exports.watchTransferForAddress = watchTransferForAddress;
const viem_1 = require("viem");
const erc20_1 = require("../contracts/erc20");
function watchTransfer(client, params) {
    const args = {};
    if (params.from)
        args.from = params.from;
    if (params.to)
        args.to = params.to;
    return client.watchContractEvent({
        address: params.address,
        abi: erc20_1.ERC20_ABI,
        eventName: 'Transfer',
        args: Object.keys(args).length > 0 ? args : undefined,
        onLogs: (logs) => {
            const events = logs
                .map((log) => {
                try {
                    const decoded = (0, viem_1.decodeEventLog)({
                        abi: erc20_1.ERC20_ABI,
                        data: log.data,
                        topics: log.topics,
                    });
                    return {
                        from: decoded.args.from,
                        to: decoded.args.to,
                        value: decoded.args.value,
                        log: log,
                    };
                }
                catch (error) {
                    if (params.onError) {
                        params.onError(error instanceof Error ? error : new Error('Failed to decode Transfer event'));
                    }
                    return null;
                }
            })
                .filter((event) => event !== null);
            if (events.length > 0) {
                params.onTransfer(events);
            }
        },
        onError: params.onError,
        pollingInterval: params.pollingInterval,
    });
}
function watchTransferForAddress(client, params) {
    if (params.senderOnly && params.receiverOnly) {
        throw new Error('Cannot set both senderOnly and receiverOnly to true');
    }
    let from;
    let to;
    if (params.senderOnly) {
        from = params.watchAddress;
    }
    else if (params.receiverOnly) {
        to = params.watchAddress;
    }
    else {
        const unwatchFrom = watchTransfer(client, {
            address: params.tokenAddress,
            from: params.watchAddress,
            onTransfer: params.onTransfer,
            onError: params.onError,
            sync: params.sync,
            pollingInterval: params.pollingInterval,
        });
        const unwatchTo = watchTransfer(client, {
            address: params.tokenAddress,
            to: params.watchAddress,
            onTransfer: params.onTransfer,
            onError: params.onError,
            sync: params.sync,
            pollingInterval: params.pollingInterval,
        });
        return () => {
            unwatchFrom();
            unwatchTo();
        };
    }
    return watchTransfer(client, {
        address: params.tokenAddress,
        from,
        to,
        onTransfer: params.onTransfer,
        onError: params.onError,
        sync: params.sync,
        pollingInterval: params.pollingInterval,
    });
}
//# sourceMappingURL=watchTransfer.js.map