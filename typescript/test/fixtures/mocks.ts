/**
 * Typed Mock Factories for Testing
 *
 * This module provides type-safe mock factories for testing, replacing `as any` patterns
 * throughout the test suite. It includes mocks for viem clients and Radius SDK client types.
 *
 * Usage:
 * ```typescript
 * const mockPublic = createMockPublicClient();
 * const mockWallet = createMockWalletClient();
 * const mockSigner = createMockSignerClient();
 * ```
 */

import { type Account, type PublicClient, type WalletClient } from 'viem';
import { vi } from 'vitest';
import type { SignerClient } from '../../packages/core/src/auth/types';

/**
 * Mock interface for viem's PublicClient
 * Includes all contract interaction and data reading methods used in tests
 */
export interface MockPublicClient extends Omit<PublicClient, 'readContract' | 'writeContract' | 'simulateContract' | 'watchContractEvent' | 'getLogs' | 'getTransactionCount' | 'estimateGas' | 'sendRawTransaction' | 'getChainId' | 'getBalance' | 'getBlockNumber' | 'waitForTransactionReceipt'> {
  readContract: ReturnType<typeof vi.fn>;
  writeContract?: ReturnType<typeof vi.fn>;
  simulateContract?: ReturnType<typeof vi.fn>;
  waitForTransactionReceipt: ReturnType<typeof vi.fn>;
  getLogs?: ReturnType<typeof vi.fn>;
  watchContractEvent?: ReturnType<typeof vi.fn>;
  getTransactionCount?: ReturnType<typeof vi.fn>;
  estimateGas?: ReturnType<typeof vi.fn>;
  sendRawTransaction?: ReturnType<typeof vi.fn>;
  getChainId?: ReturnType<typeof vi.fn>;
  getBalance?: ReturnType<typeof vi.fn>;
  getBlockNumber?: ReturnType<typeof vi.fn>;
}

/**
 * Mock interface for viem's WalletClient
 * Includes all transaction writing and account-related methods
 */
export interface MockWalletClient extends Omit<WalletClient, 'writeContract' | 'sendTransaction' | 'account'> {
  writeContract: ReturnType<typeof vi.fn>;
  sendTransaction?: ReturnType<typeof vi.fn>;
  account?: Account | null;
  chain?: { id: number };
}

/**
 * Mock interface for Radius SDK's SignerClient
 * Provides chain ID retrieval and HTTP client access
 */
export interface MockSignerClient extends SignerClient {
  chainID: ReturnType<typeof vi.fn>;
  httpClient: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock PublicClient for viem with all required methods
 *
 * All mock methods are configured to return successfully by default and can be
 * customized per test using mockResolvedValue/mockResolvedValueOnce.
 *
 * @param overrides Optional object to override default mock implementations
 * @returns A MockPublicClient with mocked methods
 *
 * @example
 * ```typescript
 * const mockPublic = createMockPublicClient({
 *   readContract: vi.fn().mockResolvedValue('token-name')
 * });
 * ```
 */
export function createMockPublicClient(
  overrides?: Partial<Record<keyof MockPublicClient, ReturnType<typeof vi.fn>>>
): MockPublicClient {
  const defaults: Record<string, ReturnType<typeof vi.fn>> = {
    readContract: vi.fn(),
    writeContract: vi.fn(),
    simulateContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
    getLogs: vi.fn(),
    watchContractEvent: vi.fn(),
    getTransactionCount: vi.fn(),
    estimateGas: vi.fn(),
    sendRawTransaction: vi.fn(),
    getChainId: vi.fn(),
    getBalance: vi.fn(),
    getBlockNumber: vi.fn(),
  };

  return {
    ...defaults,
    ...overrides,
  } as MockPublicClient;
}

/**
 * Creates a mock WalletClient for viem with all required methods
 *
 * Includes a mock account object that can be customized. The account property
 * defaults to a mock account with a zero address.
 *
 * @param overrides Optional object to override default mock implementations
 * @returns A MockWalletClient with mocked methods
 *
 * @example
 * ```typescript
 * const mockWallet = createMockWalletClient({
 *   writeContract: vi.fn().mockResolvedValue('0x...')
 * });
 * ```
 */
export function createMockWalletClient(
  overrides?: Partial<Record<keyof MockWalletClient, ReturnType<typeof vi.fn> | Account | null | { id: number }>>
): MockWalletClient {
  const mockAccount: Account = {
    address: '0x0000000000000000000000000000000000000000',
  };

  const defaults: Record<string, ReturnType<typeof vi.fn> | Account | { id: number }> = {
    writeContract: vi.fn(),
    sendTransaction: vi.fn(),
    account: mockAccount,
    chain: { id: 1 },
  };

  return {
    ...defaults,
    ...overrides,
  } as MockWalletClient;
}

/**
 * Creates a mock SignerClient for Radius SDK with configurable chain ID
 *
 * The mock client returns async chain ID and a mock HTTP client. The chain ID
 * can be customized per call using mockResolvedValue/mockResolvedValueOnce.
 *
 * @param chainId The chain ID to return (default: 1234)
 * @returns A MockSignerClient with mocked methods
 *
 * @example
 * ```typescript
 * const mockSigner = createMockSignerClient(137); // Polygon chain
 *
 * // Or customize in test:
 * const mockSigner = createMockSignerClient();
 * mockSigner.chainID.mockResolvedValue(42n);
 * ```
 */
export function createMockSignerClient(chainId: number | bigint = 1234): MockSignerClient {
  const mockHttpClient = {
    // Mock HTTP client interface as needed by tests
    request: vi.fn(),
  };

  return {
    chainID: vi.fn().mockResolvedValue(typeof chainId === 'bigint' ? chainId : BigInt(chainId)),
    httpClient: vi.fn().mockReturnValue(mockHttpClient),
  };
}

/**
 * Creates a mock Account object for use with viem WalletClient mocks
 *
 * @param address The account address (default: zero address)
 * @returns A mock Account object
 *
 * @example
 * ```typescript
 * const mockAccount = createMockAccount('0x1234567890123456789012345678901234567890');
 * const mockWallet = createMockWalletClient({ account: mockAccount });
 * ```
 */
export function createMockAccount(address: `0x${string}` = '0x0000000000000000000000000000000000000000'): Account {
  return {
    address,
  };
}
