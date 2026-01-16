"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadiusError = void 0;
class RadiusError extends Error {
    shortMessage;
    details;
    docsPath;
    cause;
    meta;
    metaMessages;
    constructor(message, options = {}) {
        const fullMessage = [
            message,
            '',
            ...(options.metaMessages ? [...options.metaMessages, ''] : []),
            ...(options.details ? [`Details: ${options.details}`] : []),
        ].join('\n');
        super(fullMessage);
        this.name = 'RadiusError';
        this.shortMessage = options.shortMessage ?? message;
        this.details = options.details;
        this.docsPath = options.docsPath;
        this.cause = options.cause;
        this.meta = options.meta;
        this.metaMessages = options.metaMessages;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    walk(fn) {
        return walk(this, fn);
    }
}
exports.RadiusError = RadiusError;
function walk(err, fn) {
    if (fn?.(err)) {
        return err;
    }
    if (err instanceof Error && err.cause) {
        if (fn?.(err.cause)) {
            return err.cause;
        }
        if (err.cause instanceof Error) {
            return walk(err.cause, fn);
        }
        return err.cause;
    }
    return fn ? null : err;
}
//# sourceMappingURL=base.js.map