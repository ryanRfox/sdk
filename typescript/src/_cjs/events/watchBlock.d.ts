import type { Block, PublicClient } from 'viem';
export declare const DEFAULT_POLLING_INTERVAL_MS = 1000;
export interface WatchBlockNumberParams {
    onBlockNumber: (blockNumber: bigint) => void;
    onError?: (error: Error) => void;
    emitOnBegin?: boolean;
    pollingInterval?: number;
}
export declare function watchBlockNumber(client: PublicClient, params: WatchBlockNumberParams): () => void;
export interface WatchBlocksParams {
    onBlock: (block: Block) => void;
    onError?: (error: Error) => void;
    emitOnBegin?: boolean;
    includeTransactions?: boolean;
    pollingInterval?: number;
}
export declare function watchBlocks(client: PublicClient, params: WatchBlocksParams): () => void;
export interface WatchPendingTransactionsParams {
    onTransactions: (hashes: `0x${string}`[]) => void;
    onError?: (error: Error) => void;
    pollingInterval?: number;
}
export declare function watchPendingTransactions(client: PublicClient, params: WatchPendingTransactionsParams): () => void;
//# sourceMappingURL=watchBlock.d.ts.map