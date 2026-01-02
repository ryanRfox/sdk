import type { Address, Log, PublicClient } from 'viem';
export interface GetLogsParams {
    address: Address | Address[];
    fromBlock: bigint;
    toBlock: bigint;
    chunkSize?: number;
    onProgress?: (params: {
        currentBlock: bigint;
        totalBlocks: bigint;
        chunksProcessed: number;
        logsFetched: number;
    }) => void;
}
export declare function getLogs(client: PublicClient, params: GetLogsParams): Promise<Log[]>;
export interface GetLogsAdaptiveParams {
    address: Address | Address[];
    fromBlock: bigint;
    toBlock: bigint;
    initialChunkSize?: number;
    minChunkSize?: number;
    onProgress?: (params: {
        currentBlock: bigint;
        totalBlocks: bigint;
        chunksProcessed: number;
        logsFetched: number;
        currentChunkSize: number;
    }) => void;
}
export declare function getLogsAdaptive(client: PublicClient, params: GetLogsAdaptiveParams): Promise<Log[]>;
//# sourceMappingURL=getLogs.d.ts.map