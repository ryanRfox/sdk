/**
 * Radius TypeScript SDK v2
 *
 * A viem-based SDK for interacting with the Radius platform.
 *
 * @packageDocumentation
 */
export type { Abi, Address, Chain, Hash, Hex, LocalAccount, TransactionReceipt, Transport, } from 'viem';
export { privateKeyToAccount } from 'viem/accounts';
export { radiusMainnet, radiusTestnet, RADIUS_MAINNET_CONTRACTS, RADIUS_TESTNET_CONTRACTS, } from './chains';
export { type ContractInstance, createRadiusClient, MAX_GAS, type RadiusClient, type RadiusClientConfig, type RadiusReceipt, } from './client';
export * from './contracts';
export * from './errors';
export * from './transport';
//# sourceMappingURL=index.d.ts.map