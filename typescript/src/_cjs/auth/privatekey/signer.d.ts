import type { Hex, SignableMessage, TransactionSerializable } from 'viem';
import type { RadiusSigner } from '../types';
export declare class PrivateKeySigner implements RadiusSigner {
    private readonly account;
    readonly chainId: number;
    constructor(privateKey: Hex, chainId: number);
    get address(): `0x${string}`;
    signMessage(message: SignableMessage): Promise<Hex>;
    signTransaction(tx: TransactionSerializable): Promise<Hex>;
}
export declare function createPrivateKeySigner(privateKey: Hex, chainId: number): PrivateKeySigner;
//# sourceMappingURL=signer.d.ts.map