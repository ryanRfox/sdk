export interface RadiusErrorOptions {
    shortMessage?: string;
    details?: string;
    docsPath?: string;
    cause?: Error | unknown;
    meta?: Record<string, unknown>;
}
export declare class RadiusError extends Error {
    readonly shortMessage: string;
    readonly details?: string;
    readonly docsPath?: string;
    readonly cause?: Error | unknown;
    readonly meta?: Record<string, unknown>;
    constructor(message: string, options?: RadiusErrorOptions);
    walk(fn?: (err: unknown) => boolean): Error | unknown | null;
}
//# sourceMappingURL=base.d.ts.map