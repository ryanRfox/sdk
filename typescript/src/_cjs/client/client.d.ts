import { type Abi, type Chain, type Hash, type Hex, type LocalAccount, type PublicClient, type TransactionReceipt, type TransactionRequest, type Transport, type Address as ViemAddress } from 'viem';
import { type Interceptor, type Logf } from '../transport';
export declare const MAX_GAS = 1319413953330n;
export interface RadiusReceipt {
    transactionHash: Hash;
    from: ViemAddress;
    to: ViemAddress | null;
    contractAddress: ViemAddress | null;
    gasUsed: bigint;
    status: 'success' | 'reverted';
    blockNumber: bigint;
    blockHash: Hash;
    logs: TransactionReceipt['logs'];
}
export interface RadiusClientConfig {
    chain: Chain;
    transport?: Transport;
    interceptor?: Interceptor;
    logger?: Logf;
}
export interface ContractInstance {
    abi: Abi;
    address: ViemAddress;
}
export interface RadiusClient {
    readonly publicClient: PublicClient;
    getChainId(): Promise<bigint>;
    getBalance(address: ViemAddress): Promise<bigint>;
    getCode(address: ViemAddress): Promise<Hex>;
    getNonce(address: ViemAddress): Promise<number>;
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    call<T = unknown>(contract: ContractInstance, method: string, ...args: unknown[]): Promise<T>;
    execute(contract: ContractInstance, signer: LocalAccount, method: string, ...args: unknown[]): Promise<Hash>;
    executeAndWait(contract: ContractInstance, signer: LocalAccount, method: string, ...args: unknown[]): Promise<RadiusReceipt>;
    executeSync(contract: ContractInstance, signer: LocalAccount, method: string, ...args: unknown[]): Promise<RadiusReceipt>;
    send(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<Hash>;
    sendAndWait(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<RadiusReceipt>;
    sendSync(signer: LocalAccount, to: ViemAddress, value: bigint): Promise<RadiusReceipt>;
    deployContract(signer: LocalAccount, bytecode: Hex, abi: Abi, ...args: unknown[]): Promise<{
        address: ViemAddress;
        receipt: RadiusReceipt;
    }>;
    sendRawTransaction(signedTx: Hex): Promise<Hash>;
    waitForReceipt(hash: Hash): Promise<RadiusReceipt>;
    extend<TExtension extends Record<string, unknown>>(extender: (client: RadiusClient) => TExtension): RadiusClient & TExtension;
}
export declare function createRadiusClient(config: RadiusClientConfig): RadiusClient;
export type { Chain, Transport, Abi, Hash, Hex, TransactionReceipt };
export type { ViemAddress as Address };
//# sourceMappingURL=client.d.ts.map