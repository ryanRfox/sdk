import type { Address, Hash, Log, PublicClient, WatchContractEventReturnType } from 'viem';
import { watchContractEvent } from 'viem/actions';
export declare function watchLogs(client: PublicClient, params: Parameters<typeof watchContractEvent>[1]): WatchContractEventReturnType;
export interface WatchRawLogsParameters {
    address: Address | Address[];
    topics?: Hash[][];
    onLogs: (logs: Log[]) => void;
    onError?: (error: Error) => void;
    sync?: boolean;
    pollingInterval?: number;
}
export declare function watchRawLogs(client: PublicClient, params: WatchRawLogsParameters): WatchContractEventReturnType;
//# sourceMappingURL=watchLogs.d.ts.map