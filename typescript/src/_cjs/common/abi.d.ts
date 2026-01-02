import type { BytesLike } from './address';
export declare class ABI {
    private readonly abi;
    constructor(abiJSON: string);
    pack(name: string, ...args: unknown[]): Uint8Array;
    unpack(name: string, data: BytesLike): unknown[];
}
//# sourceMappingURL=abi.d.ts.map