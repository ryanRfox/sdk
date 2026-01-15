/**
 * Radius TypeScript SDK v2
 *
 * A viem-based SDK for interacting with the Radius platform.
 *
 * @packageDocumentation
 */

// Re-export common viem types for convenience
export type {
	Abi,
	Address,
	Chain,
	Hash,
	Hex,
	TransactionReceipt,
	Transport,
} from 'viem';
// Accounts
export * from './accounts';

// Auth / Accounts
export { createPrivateKeySigner } from './auth';
export type { LocalAccount } from 'viem';
// Chains
export {
	radiusMainnet,
	radiusTestnet,
	RADIUS_MAINNET_CONTRACTS,
	RADIUS_TESTNET_CONTRACTS,
} from './chains';
// Client - main entry point
export {
	type ContractInstance,
	createRadiusClient,
	MAX_GAS,
	type RadiusClient,
	type RadiusClientConfig,
	type RadiusReceipt,
} from './client';
// Common utilities
export * from './common';
// Contracts
export * from './contracts';
// Crypto
export * from './crypto';
// Errors
export * from './errors';
// Transport
export * from './transport';
