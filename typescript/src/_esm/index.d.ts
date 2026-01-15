/**
 * Radius TypeScript SDK v2
 *
 * A viem-based SDK for interacting with the Radius platform.
 *
 * @packageDocumentation
 */
export type { Abi, Address, Chain, Hash, Hex, TransactionReceipt, Transport, } from 'viem';
export * from './accounts';
export { createPrivateKeySigner } from './auth';
export type { LocalAccount } from 'viem';
export { radiusMainnet, radiusTestnet, RADIUS_MAINNET_CONTRACTS, RADIUS_TESTNET_CONTRACTS, } from './chains';
export { type ContractInstance, createRadiusClient, MAX_GAS, type RadiusClient, type RadiusClientConfig, type RadiusReceipt, } from './client';
export * from './common';
export * from './contracts';
export * from './crypto';
export * from './errors';
export * from './transport';
//# sourceMappingURL=index.d.ts.map