/**
 * Radius Testnet integration setup for testing
 *
 * Environment Variables:
 * - RADIUS_ENDPOINT: RPC endpoint for Radius testnet (defaults to https://rpc.testnet.radiustech.xyz)
 * - RADIUS_PRIVATE_KEY: Private key for testing account (required for wallet operations)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Account,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '../../packages/core/src/chains';

/**
 * Radius testnet RPC endpoint
 * Can be overridden via RADIUS_ENDPOINT environment variable
 */
export const RADIUS_ENDPOINT =
  process.env.RADIUS_ENDPOINT ?? 'https://rpc.testnet.radiustech.xyz';

/**
 * Private key for test account
 * Must be set via RADIUS_PRIVATE_KEY environment variable
 */
export const TEST_PRIVATE_KEY = process.env.RADIUS_PRIVATE_KEY;

/**
 * ISB token address on Radius testnet
 */
export const ISB_TOKEN_ADDRESS = '0xF966020a30946A64B39E2e243049036367590858' as const;

/**
 * Interface for created testnet clients
 */
export interface RadiusTestnetClients {
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: Account;
}

/**
 * Creates viem clients for Radius testnet testing
 *
 * @throws Error if RADIUS_PRIVATE_KEY environment variable is not set
 * @returns Object containing publicClient, walletClient, and account
 */
export function createRadiusTestnetClients(): RadiusTestnetClients {
  if (!TEST_PRIVATE_KEY) {
    throw new Error(
      'RADIUS_PRIVATE_KEY environment variable is required for wallet operations'
    );
  }

  // Handle private key with or without 0x prefix
  const normalizedKey = TEST_PRIVATE_KEY.startsWith('0x')
    ? TEST_PRIVATE_KEY
    : `0x${TEST_PRIVATE_KEY}`;
  const account = privateKeyToAccount(normalizedKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: radiusTestnet,
    transport: http(RADIUS_ENDPOINT),
  });

  const walletClient = createWalletClient({
    chain: radiusTestnet,
    transport: http(RADIUS_ENDPOINT),
    account,
  });

  return {
    publicClient,
    walletClient,
    account,
  };
}

/**
 * Gets the test token address on Radius testnet
 *
 * @returns ISB token address
 */
export function getTestTokenAddress(): `0x${string}` {
  return ISB_TOKEN_ADDRESS;
}

/**
 * Helper to determine if testnet is available for testing
 * Returns true if tests should be skipped
 *
 * @returns true if RADIUS_PRIVATE_KEY is not set, false otherwise
 */
export function skipIfNoTestnet(): boolean {
  return !process.env.RADIUS_PRIVATE_KEY;
}
