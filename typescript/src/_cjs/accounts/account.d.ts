import type { RadiusSigner } from '../auth';
import { Address, type BytesLike, type Receipt, SignedTransaction, type Transaction } from '../common';
import type { AccountOption } from './options';
import type { AccountClient } from './types';
export declare class Account {
    signer?: RadiusSigner;
    constructor(signer?: RadiusSigner);
    static New(...opts: AccountOption[]): Promise<Account>;
    address(): Address;
    balance(client: AccountClient): Promise<bigint>;
    nonce(client: AccountClient): Promise<number>;
    send(client: AccountClient, recipient: Address, value: bigint): Promise<Receipt>;
    signMessage(message: BytesLike): Promise<Uint8Array>;
    signTransaction(transaction: Transaction): Promise<SignedTransaction>;
}
//# sourceMappingURL=account.d.ts.map