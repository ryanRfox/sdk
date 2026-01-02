import type { Address, Log, PublicClient, WatchContractEventReturnType } from 'viem';
export interface TransferEvent {
    from: Address;
    to: Address;
    value: bigint;
    log: Log;
}
export interface WatchTransferParameters {
    address: Address;
    from?: Address;
    to?: Address;
    onTransfer: (events: TransferEvent[]) => void;
    onError?: (error: Error) => void;
    sync?: boolean;
    pollingInterval?: number;
}
export declare function watchTransfer(client: PublicClient, params: WatchTransferParameters): WatchContractEventReturnType;
export interface WatchTransferForAddressParameters {
    tokenAddress: Address;
    watchAddress: Address;
    senderOnly?: boolean;
    receiverOnly?: boolean;
    onTransfer: (events: TransferEvent[]) => void;
    onError?: (error: Error) => void;
    sync?: boolean;
    pollingInterval?: number;
}
export declare function watchTransferForAddress(client: PublicClient, params: WatchTransferForAddressParameters): WatchContractEventReturnType;
//# sourceMappingURL=watchTransfer.d.ts.map