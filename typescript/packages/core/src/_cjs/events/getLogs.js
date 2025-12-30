"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = getLogs;
exports.getLogsAdaptive = getLogsAdaptive;
async function getLogs(client, params) {
    const { address, fromBlock, toBlock, chunkSize = 1000, onProgress } = params;
    if (fromBlock > toBlock) {
        throw new Error('fromBlock must be less than or equal to toBlock');
    }
    if (chunkSize <= 0) {
        throw new Error('chunkSize must be greater than 0');
    }
    const allLogs = [];
    const totalBlocks = toBlock - fromBlock + 1n;
    let chunksProcessed = 0;
    for (let currentFrom = fromBlock; currentFrom <= toBlock; currentFrom += BigInt(chunkSize)) {
        const currentTo = currentFrom + BigInt(chunkSize) - 1n > toBlock
            ? toBlock
            : currentFrom + BigInt(chunkSize) - 1n;
        const filterParams = {
            address,
            fromBlock: currentFrom,
            toBlock: currentTo,
        };
        try {
            const chunkLogs = await client.getLogs(filterParams);
            allLogs.push(...chunkLogs);
            chunksProcessed++;
            if (onProgress) {
                onProgress({
                    currentBlock: currentTo,
                    totalBlocks,
                    chunksProcessed,
                    logsFetched: allLogs.length,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('block range is too wide')) {
                throw new Error(`Block range too wide. Current chunk size: ${chunkSize}. ` +
                    `Try reducing chunkSize. Range: ${currentFrom}-${currentTo}`);
            }
            throw new Error(`Failed to fetch logs for blocks ${currentFrom}-${currentTo}: ${errorMessage}`);
        }
    }
    return allLogs;
}
async function getLogsAdaptive(client, params) {
    let currentChunkSize = params.initialChunkSize ?? 1000;
    const minChunkSize = params.minChunkSize ?? 10;
    while (currentChunkSize >= minChunkSize) {
        try {
            return await getLogs(client, {
                address: params.address,
                fromBlock: params.fromBlock,
                toBlock: params.toBlock,
                chunkSize: currentChunkSize,
                onProgress: params.onProgress
                    ? (progress) => {
                        params.onProgress?.({
                            ...progress,
                            currentChunkSize,
                        });
                    }
                    : undefined,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            if (errorMessage.includes('block range is too wide') ||
                errorMessage.includes('Try reducing chunkSize')) {
                currentChunkSize = Math.floor(currentChunkSize / 2);
                if (currentChunkSize < minChunkSize) {
                    throw new Error(`Cannot fetch logs: minimum chunk size (${minChunkSize}) reached. Network requires smaller block ranges than supported.`);
                }
                continue;
            }
            throw error;
        }
    }
    throw new Error('Failed to fetch logs: minimum chunk size reached');
}
//# sourceMappingURL=getLogs.js.map