import type { LocalAccount } from 'viem';
import type { Receipt } from '../common';
import type { Contract } from './contract';
export interface ContractClient {
    call(contract: Contract, method: string, ...args: unknown[]): Promise<unknown[]>;
    execute(contract: Contract, account: LocalAccount, method: string, ...args: unknown[]): Promise<Receipt>;
}
//# sourceMappingURL=types.d.ts.map