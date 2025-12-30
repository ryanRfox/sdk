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

// Auth / Signers
export {
  ClefSigner,
  type ClefSignerConfig,
  createClefSigner,
  createPrivateKeySigner,
  PrivateKeySigner,
  type PrivateKeySignerConfig,
  type RadiusSigner,
} from './auth';
// Chains
export { radiusMainnet, radiusTestnet } from './chains';
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
// Transport
export * from './transport';
