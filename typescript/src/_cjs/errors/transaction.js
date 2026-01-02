"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTimeoutError = exports.NonceError = exports.GasEstimationError = exports.TransactionRevertedError = exports.TransactionFailedError = void 0;
const base_1 = require("./base");
class TransactionFailedError extends base_1.RadiusError {
    name = 'TransactionFailedError';
    transactionHash;
    reason;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-failed',
        });
        this.transactionHash = options.transactionHash;
        this.reason = options.reason;
    }
}
exports.TransactionFailedError = TransactionFailedError;
class TransactionRevertedError extends base_1.RadiusError {
    name = 'TransactionRevertedError';
    transactionHash;
    reason;
    revertReason;
    revertData;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-reverted',
        });
        this.transactionHash = options.transactionHash;
        this.reason = options.reason;
        this.revertReason = options.revertReason;
        this.revertData = options.revertData;
    }
}
exports.TransactionRevertedError = TransactionRevertedError;
class GasEstimationError extends base_1.RadiusError {
    name = 'GasEstimationError';
    to;
    data;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#gas-estimation',
        });
        this.to = options.to;
        this.data = options.data;
    }
}
exports.GasEstimationError = GasEstimationError;
class NonceError extends base_1.RadiusError {
    name = 'NonceError';
    nonce;
    expectedNonce;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#nonce',
        });
        this.nonce = options.nonce;
        this.expectedNonce = options.expectedNonce;
    }
}
exports.NonceError = NonceError;
class TransactionTimeoutError extends base_1.RadiusError {
    name = 'TransactionTimeoutError';
    transactionHash;
    timeout;
    constructor(message, options = {}) {
        super(message, {
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-timeout',
        });
        this.transactionHash = options.transactionHash;
        this.timeout = options.timeout;
    }
}
exports.TransactionTimeoutError = TransactionTimeoutError;
//# sourceMappingURL=transaction.js.map