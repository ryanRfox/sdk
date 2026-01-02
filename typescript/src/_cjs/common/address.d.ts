import { type Address as ViemAddress, type Hex } from 'viem';
export type { ViemAddress as Address };
export type BytesLike = Uint8Array | Hex | string;
export declare function addressToBytes(address: ViemAddress): Uint8Array;
export declare function isAddressEqual(a: ViemAddress, b: ViemAddress): boolean;
export declare function toChecksumAddress(address: ViemAddress): ViemAddress;
export declare const ZERO_ADDRESS: ViemAddress;
//# sourceMappingURL=address.d.ts.map