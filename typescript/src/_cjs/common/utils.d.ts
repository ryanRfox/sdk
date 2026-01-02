import { type Log, type TransactionReceipt } from 'viem';
import { ABI } from './abi';
import { type Address } from './address';
import { Event } from './event';
import { Hash } from './hash';
import { type Receipt } from './receipt';
export declare function abiFromJSON(json: string): ABI | undefined;
export declare function addressFromHex(hex: string): Address;
export declare function bytecodeFromHex(s: string): Uint8Array | undefined;
export declare function eventsFromEthLogs(logs: Log[]): Event[];
export declare function hashFromHex(hex: string): Hash;
export declare function receiptFromEthReceipt(receipt: TransactionReceipt, from?: Address, to?: Address, value?: bigint): Receipt;
export declare function zeroAddress(): Address;
//# sourceMappingURL=utils.d.ts.map