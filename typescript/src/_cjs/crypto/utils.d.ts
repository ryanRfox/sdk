import { Address, type BytesLike } from '../common';
import type { SigningKey } from './types';
export declare function hexToSigningKey(key: string): SigningKey;
export declare function keccak256(data: BytesLike | BytesLike[]): Uint8Array;
export declare function pubkeyToAddress(publicKey: BytesLike): Address;
export declare function sign(digestHash: BytesLike, key: SigningKey): Promise<Uint8Array>;
//# sourceMappingURL=utils.d.ts.map