import type { LocalAccount } from 'viem';
import type { ABI, Address, Receipt } from '../common';
import type { ContractClient } from './types';
export declare class Contract {
    readonly abi: ABI;
    private readonly _address;
    constructor(address: Address, abi: ABI);
    address(): Address;
    call(client: ContractClient, method: string, ...args: unknown[]): Promise<unknown[]>;
    execute(client: ContractClient, account: LocalAccount, method: string, ...args: unknown[]): Promise<Receipt>;
}
//# sourceMappingURL=contract.d.ts.map