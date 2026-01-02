import type { RadiusSigner } from '../auth';
import type { ABI, Address, Receipt } from '../common';
import type { ContractClient } from './types';
export declare class Contract {
    readonly abi: ABI;
    private readonly _address;
    constructor(address: Address, abi: ABI);
    address(): Address;
    call(client: ContractClient, method: string, ...args: unknown[]): Promise<unknown[]>;
    execute(client: ContractClient, signer: RadiusSigner, method: string, ...args: unknown[]): Promise<Receipt>;
}
//# sourceMappingURL=contract.d.ts.map