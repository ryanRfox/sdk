import { type Hex } from 'viem';
export type BytesLike = Uint8Array | Hex | string;
export declare class Address {
    private readonly data;
    constructor(data: Address | BytesLike | string);
    bytes(): Uint8Array;
    ethAddress(): string;
    hex(): Hex;
    equals(other: Address): boolean;
}
//# sourceMappingURL=address.d.ts.map