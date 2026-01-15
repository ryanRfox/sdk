import type { LocalAccount } from 'viem';
import type { Address, HttpClient, Receipt, Transaction } from '../common';
export interface AccountClient {
    balanceAt(address: Address): Promise<bigint>;
    chainID(): Promise<bigint>;
    estimateGas(tx: Transaction): Promise<bigint>;
    httpClient(): HttpClient;
    pendingNonceAt(address: Address): Promise<number>;
    send(account: LocalAccount, recipient: Address, value: bigint): Promise<Receipt>;
}
//# sourceMappingURL=types.d.ts.map