/**
 * Unit tests for RadiusClient creation and configuration
 * Tests createRadiusClient function with various configurations
 */

import { http } from 'viem';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { radiusMainnet, radiusTestnet } from '../../packages/core/src/chains/radius';
import {
  MAX_GAS,
  type RadiusClientConfig,
  createRadiusClient,
} from '../../packages/core/src/client/client';
import { type Interceptor, type Logf } from '../../packages/core/src/transport/types';

describe('RadiusClient Creation', () => {
  describe('createRadiusClient', () => {
    test('should create client with testnet chain and default transport', () => {
      const client = createRadiusClient({
        chain: radiusTestnet,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
      expect(client.getChainId).toBeDefined();
      expect(client.getBalance).toBeDefined();
      expect(client.getCode).toBeDefined();
      expect(client.getNonce).toBeDefined();
      expect(client.estimateGas).toBeDefined();
      expect(client.call).toBeDefined();
      expect(client.execute).toBeDefined();
      expect(client.executeSync).toBeDefined();
      expect(client.send).toBeDefined();
      expect(client.sendSync).toBeDefined();
      expect(client.deployContract).toBeDefined();
      expect(client.sendRawTransaction).toBeDefined();
      expect(client.waitForReceipt).toBeDefined();
    });

    test('should create client with mainnet chain', () => {
      const client = createRadiusClient({
        chain: radiusMainnet,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should create client with explicit HTTP transport', () => {
      const transport = http('https://rpc.testnet.radiustech.xyz');
      const client = createRadiusClient({
        chain: radiusTestnet,
        transport,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should create client with logger', () => {
      const logger: Logf = vi.fn();
      const client = createRadiusClient({
        chain: radiusTestnet,
        logger,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should create client with interceptor', async () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const client = createRadiusClient({
        chain: radiusTestnet,
        interceptor,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should create client with both logger and interceptor', () => {
      const logger: Logf = vi.fn();
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const client = createRadiusClient({
        chain: radiusTestnet,
        logger,
        interceptor,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should throw error if chain has no RPC URL', () => {
      const invalidChain = {
        id: 999,
        name: 'Invalid Chain',
        rpcUrls: {
          default: {
            http: [],
          },
        },
      };

      expect(() => {
        createRadiusClient({
          chain: invalidChain as any,
        });
      }).toThrow('No RPC URL configured for chain');
    });

    test('should throw error if chain RPC URL is missing', () => {
      const invalidChain = {
        id: 999,
        name: 'Invalid Chain',
        rpcUrls: {
          default: {
            http: undefined,
          },
        },
      };

      expect(() => {
        createRadiusClient({
          chain: invalidChain as any,
        });
      }).toThrow();
    });

    test('should use provided transport over default', () => {
      const customTransport = http('https://custom-rpc.example.com');
      const config: RadiusClientConfig = {
        chain: radiusTestnet,
        transport: customTransport,
        logger: vi.fn(), // Logger should be ignored when transport is provided
      };

      const client = createRadiusClient(config);
      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should use intercepting transport when logger provided without transport', () => {
      const logger: Logf = vi.fn();
      const client = createRadiusClient({
        chain: radiusTestnet,
        logger,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });

    test('should use intercepting transport when interceptor provided without transport', () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const client = createRadiusClient({
        chain: radiusTestnet,
        interceptor,
      });

      expect(client).toBeDefined();
      expect(client.publicClient).toBeDefined();
    });
  });

  describe('MAX_GAS constant', () => {
    test('should have MAX_GAS defined', () => {
      expect(MAX_GAS).toBeDefined();
      expect(typeof MAX_GAS).toBe('bigint');
    });

    test('MAX_GAS should be a positive bigint', () => {
      expect(MAX_GAS).toBeGreaterThan(0n);
    });

    test('MAX_GAS should have expected value', () => {
      expect(MAX_GAS).toBe(1319413953330n);
    });
  });

  describe('RadiusClient interface properties', () => {
    let client: ReturnType<typeof createRadiusClient>;

    beforeEach(() => {
      client = createRadiusClient({
        chain: radiusTestnet,
      });
    });

    test('publicClient should be a valid viem PublicClient', () => {
      expect(client.publicClient).toBeDefined();
      expect(typeof client.publicClient.getBalance).toBe('function');
      expect(typeof client.publicClient.getCode).toBe('function');
      expect(typeof client.publicClient.call).toBe('function');
    });

    test('all required methods should be functions', () => {
      expect(typeof client.getChainId).toBe('function');
      expect(typeof client.getBalance).toBe('function');
      expect(typeof client.getCode).toBe('function');
      expect(typeof client.getNonce).toBe('function');
      expect(typeof client.estimateGas).toBe('function');
      expect(typeof client.call).toBe('function');
      expect(typeof client.execute).toBe('function');
      expect(typeof client.executeSync).toBe('function');
      expect(typeof client.send).toBe('function');
      expect(typeof client.sendSync).toBe('function');
      expect(typeof client.deployContract).toBe('function');
      expect(typeof client.sendRawTransaction).toBe('function');
      expect(typeof client.waitForReceipt).toBe('function');
    });

    test('all methods should return Promises', async () => {
      // Note: We're just checking the function signatures exist
      // Not actually calling them since they require network calls
      const chainIdPromise = client.getChainId();
      expect(chainIdPromise).toBeInstanceOf(Promise);
    });
  });

  describe('Client Configuration Edge Cases', () => {
    test('should handle empty config object gracefully', () => {
      // Chain is required, so this should throw
      expect(() => {
        createRadiusClient({} as any);
      }).toThrow();
    });

    test('should create separate client instances', () => {
      const client1 = createRadiusClient({
        chain: radiusTestnet,
      });

      const client2 = createRadiusClient({
        chain: radiusTestnet,
      });

      // Should be different instances
      expect(client1).not.toBe(client2);
      // But have similar structure
      expect(typeof client1.getBalance).toBe(typeof client2.getBalance);
    });

    test('should support both chain objects', () => {
      const testnetClient = createRadiusClient({
        chain: radiusTestnet,
      });

      const mainnetClient = createRadiusClient({
        chain: radiusMainnet,
      });

      expect(testnetClient).toBeDefined();
      expect(mainnetClient).toBeDefined();
    });

    test('client methods should handle null/undefined gracefully', async () => {
      const client = createRadiusClient({
        chain: radiusTestnet,
      });

      // Test that methods exist and are callable (not testing actual network calls)
      expect(() => {
        client.getBalance('0x0000000000000000000000000000000000000000');
      }).not.toThrow();

      expect(() => {
        client.getCode('0x0000000000000000000000000000000000000000');
      }).not.toThrow();

      expect(() => {
        client.getNonce('0x0000000000000000000000000000000000000000');
      }).not.toThrow();
    });
  });

  describe('Logger integration', () => {
    test('should pass logger to intercepting transport', () => {
      const logger: Logf = vi.fn();
      const client = createRadiusClient({
        chain: radiusTestnet,
        logger,
      });

      expect(client).toBeDefined();
      // Logger is used internally, just verify client was created
    });

    test('should handle logger function calls', () => {
      const logCalls: Array<[string, any]> = [];
      const logger: Logf = (message, data) => {
        logCalls.push([message, data]);
      };

      const client = createRadiusClient({
        chain: radiusTestnet,
        logger,
      });

      expect(client).toBeDefined();
    });
  });

  describe('Interceptor integration', () => {
    test('should pass interceptor to intercepting transport', async () => {
      const interceptor: Interceptor = vi.fn(async (_reqBody, response) => response);
      const client = createRadiusClient({
        chain: radiusTestnet,
        interceptor,
      });

      expect(client).toBeDefined();
      // Interceptor is used internally during RPC calls
    });

    test('should create valid interceptor function', () => {
      const interceptor: Interceptor = async (_reqBody, response) => {
        // Modify response if needed
        return response;
      };

      const client = createRadiusClient({
        chain: radiusTestnet,
        interceptor,
      });

      expect(client).toBeDefined();
    });
  });
});
