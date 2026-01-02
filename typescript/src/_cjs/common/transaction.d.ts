import type { Address, BytesLike } from './address';
import type { Hex } from 'viem';
export type BigNumberish = bigint | number | string;
export interface TransactionParams {
    data?: Hex;
    gas?: bigint;
    gasPrice?: bigint;
    nonce?: number;
    to?: Address;
    value?: bigint;
    chainId?: number;
}
export declare class Transaction {
    data: BytesLike;
    gas: BigNumberish;
    gasPrice: BigNumberish;
    nonce?: number | undefined;
    to?: Address;
    value?: BigNumberish;
    constructor(data: BytesLike, gas: BigNumberish, gasPrice: BigNumberish, nonce?: number, to?: Address, value?: BigNumberish);
}
export declare class SignedTransaction {
    readonly serialized: `0x${string}`;
    constructor(serialized: `0x${string}`);
    toString(): string;
}
//# sourceMappingURL=transaction.d.ts.map