/**
 * Radius TypeScript SDK v2
 *
 * A viem-based SDK for interacting with the Radius platform.
 *
 * @packageDocumentation
 */

// Re-export common viem types and functions for convenience
export type {
	Abi,
	Address,
	Chain,
	Hash,
	Hex,
	LocalAccount,
	TransactionReceipt,
	Transport,
} from 'viem';

// Re-export viem account utilities
export { privateKeyToAccount } from 'viem/accounts';

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

// Contracts (typed contract helper)
export * from './contracts';

// Errors
export * from './errors';

// Transport
export * from './transport';
