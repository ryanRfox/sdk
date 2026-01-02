import type { Address } from './address';
import type { Event } from './event';
import type { Hash } from 'viem';
export type TransactionStatus = 'success' | 'reverted';
export interface Receipt {
    from: Address;
    to: Address | null;
    contractAddress: Address | null;
    txHash: Hash;
    gasUsed: bigint;
    status: TransactionStatus;
    logs: Event[];
    value?: bigint;
}
export declare function createReceipt(from: Address, to: Address | null, contractAddress: Address | null, txHash: Hash, gasUsed: bigint, status: TransactionStatus, logs?: Event[], value?: bigint): Receipt;
//# sourceMappingURL=receipt.d.ts.map