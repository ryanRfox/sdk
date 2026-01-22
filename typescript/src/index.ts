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
// Re-export viem transport and client factories for convenience
export { createPublicClient, createWalletClient, http } from 'viem';
// Re-export viem account utilities
export { privateKeyToAccount } from 'viem/accounts';
// Actions
export {
	type SendTransactionBatchParameters,
	type SendTransactionBatchReturnType,
	sendTransactionBatch,
} from './actions/index.js';
// Chains
export { MAX_GAS, radius, radiusTestnet } from './chains/index.js';
// Decorators
export { type RadiusWalletActions, radiusWalletActions } from './decorators/index.js';

// Errors
export * from './errors/index.js';

// Transport
export * from './transport/index.js';
