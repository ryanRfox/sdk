import type { Hex, SignableMessage, TransactionSerializable } from 'viem';
export interface RadiusSigner {
    readonly address: `0x${string}`;
    readonly chainId: number;
    signMessage(message: SignableMessage): Promise<Hex>;
    signTransaction(tx: TransactionSerializable): Promise<Hex>;
}
export interface ClefSignerConfig {
    address: `0x${string}`;
    chainId: number;
    clefUrl: string;
}
export interface PrivateKeySignerConfig {
    privateKey: Hex;
    chainId: number;
}
//# sourceMappingURL=types.d.ts.map