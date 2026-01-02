"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAddressError = exports.InvalidPrivateKeyError = exports.SigningError = exports.InsufficientBalanceError = exports.SignerNotFoundError = void 0;
const base_1 = require("./base");
class SignerNotFoundError extends base_1.RadiusError {
    name = 'SignerNotFoundError';
    constructor(message = 'Signer is required', options = {}) {
        super(message, {
            shortMessage: 'No signer available',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#signer-not-found',
        });
    }
}
exports.SignerNotFoundError = SignerNotFoundError;
class InsufficientBalanceError extends base_1.RadiusError {
    name = 'InsufficientBalanceError';
    address;
    balance;
    required;
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Insufficient balance',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#insufficient-balance',
        });
        this.address = options.address;
        this.balance = options.balance;
        this.required = options.required;
    }
}
exports.InsufficientBalanceError = InsufficientBalanceError;
class SigningError extends base_1.RadiusError {
    name = 'SigningError';
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Failed to sign',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#signing',
        });
    }
}
exports.SigningError = SigningError;
class InvalidPrivateKeyError extends base_1.RadiusError {
    name = 'InvalidPrivateKeyError';
    constructor(message = 'Invalid private key', options = {}) {
        super(message, {
            shortMessage: 'Invalid private key format',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-private-key',
        });
    }
}
exports.InvalidPrivateKeyError = InvalidPrivateKeyError;
class InvalidAddressError extends base_1.RadiusError {
    name = 'InvalidAddressError';
    invalidAddress;
    constructor(message, options = {}) {
        super(message, {
            shortMessage: 'Invalid address',
            ...options,
            docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-address',
        });
        this.invalidAddress = options.invalidAddress;
    }
}
exports.InvalidAddressError = InvalidAddressError;
//# sourceMappingURL=account.js.map