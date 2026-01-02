import type { Address, Log, PublicClient, WatchContractEventReturnType } from 'viem';
export interface ApprovalEvent {
    owner: Address;
    spender: Address;
    value: bigint;
    log: Log;
}
export interface WatchApprovalParameters {
    address: Address;
    owner?: Address;
    spender?: Address;
    onApproval: (events: ApprovalEvent[]) => void;
    onError?: (error: Error) => void;
    sync?: boolean;
    pollingInterval?: number;
}
export declare function watchApproval(client: PublicClient, params: WatchApprovalParameters): WatchContractEventReturnType;
export interface WatchApprovalForAddressParameters {
    tokenAddress: Address;
    watchAddress: Address;
    ownerOnly?: boolean;
    spenderOnly?: boolean;
    onApproval: (events: ApprovalEvent[]) => void;
    onError?: (error: Error) => void;
    sync?: boolean;
    pollingInterval?: number;
}
export declare function watchApprovalForAddress(client: PublicClient, params: WatchApprovalForAddressParameters): WatchContractEventReturnType;
//# sourceMappingURL=watchApproval.d.ts.map