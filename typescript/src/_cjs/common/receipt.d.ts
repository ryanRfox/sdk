import type { Address } from './address';
import type { Event } from './event';
import type { Hash } from './hash';
import type { BigNumberish } from './transaction';
export declare class Receipt {
    from: Address;
    to: Address;
    contractAddress: Address;
    txHash: Hash;
    gasUsed: BigNumberish;
    status: number;
    logs: Event[];
    value?: BigNumberish | undefined;
    constructor(from: Address, to: Address, contractAddress: Address, txHash: Hash, gasUsed: BigNumberish, status: number, logs?: Event[], value?: BigNumberish | undefined);
}
//# sourceMappingURL=receipt.d.ts.map