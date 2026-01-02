import { type Hex } from 'viem';
import type { BytesLike } from './address';
export declare class Hash {
    private readonly data;
    constructor(data: BytesLike);
    bytes(): Uint8Array;
    hex(): Hex;
    hexWithoutPrefix(): string;
}
//# sourceMappingURL=hash.d.ts.map