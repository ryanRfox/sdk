import type { Hex } from 'viem';
import { type RadiusSigner } from '../auth';
export type AccountOption = (options: AccountOptions) => Promise<void>;
export interface AccountOptions {
    signer?: RadiusSigner;
}
export declare function withPrivateKey(key: Hex, chainId: number): AccountOption;
export declare function withSigner(signer: RadiusSigner): AccountOption;
//# sourceMappingURL=options.d.ts.map