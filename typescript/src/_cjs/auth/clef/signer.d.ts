import { type Hex, type SignableMessage, type TransactionSerializable } from 'viem';
import type { RadiusSigner } from '../types';
export declare class ClefSigner implements RadiusSigner {
    readonly address: `0x${string}`;
    readonly chainId: number;
    private readonly clefUrl;
    constructor(address: `0x${string}`, chainId: number, clefUrl: string);
    signMessage(message: SignableMessage): Promise<Hex>;
    signTransaction(tx: TransactionSerializable): Promise<Hex>;
    verifyConnection(): Promise<boolean>;
    private rpcCall;
    private toHex;
    private normalizeHex;
}
export declare function createClefSigner(address: `0x${string}`, chainId: number, clefUrl: string): ClefSigner;
//# sourceMappingURL=signer.d.ts.map