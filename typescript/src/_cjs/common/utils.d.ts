import { ABI } from './abi';
import { Address } from './address';
import { Event } from './event';
import { Hash } from './hash';
import { Receipt } from './receipt';
import type { BigNumberish } from './transaction';
export declare function abiFromJSON(json: string): ABI | undefined;
export declare function addressFromHex(hex: string): Address;
export declare function bytecodeFromHex(s: string): Uint8Array | undefined;
export declare function ethAddressFromRadiusAddress(address?: Address): string | undefined;
export declare function eventsFromEthLogs(logs: any[]): Event[];
export declare function hashFromHex(hex: string): Hash;
export declare function receiptFromEthReceipt(receipt: any, from: Address, to?: Address, value?: BigNumberish): Receipt;
export declare function zeroAddress(): Address;
//# sourceMappingURL=utils.d.ts.map