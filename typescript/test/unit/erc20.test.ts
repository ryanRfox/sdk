/**
 * Unit tests for ERC20 contract class
 * Tests all ERC20 methods including read, write, and utility methods
 */

import { type Account, type PublicClient, type WalletClient } from 'viem';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ERC20, type ERC20Signer } from '../../packages/core/src/contracts/erc20';
import { createMockPublicClient, createMockWalletClient, createMockAccount } from '../fixtures/mocks';

describe('ERC20 Contract Class', () => {
  // Mock address and test data
  const tokenAddress = '0x1234567890123456789012345678901234567890' as const;
  const ownerAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;
  const spenderAddress = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as const;
  const recipientAddress = '0xcccccccccccccccccccccccccccccccccccccccc' as const;

  // Mock clients
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;
  let mockAccount: Account;
  let erc20: ERC20;
  let signer: ERC20Signer;

  beforeEach(() => {
    // Create mock public client
    mockPublicClient = createMockPublicClient({
      readContract: vi.fn(),
      waitForTransactionReceipt: vi.fn(),
    });

    // Create mock wallet client
    mockWalletClient = createMockWalletClient({
      writeContract: vi.fn(),
      chain: { id: 1 },
    });

    // Create mock account
    mockAccount = createMockAccount(ownerAddress);

    // Create signer
    signer = {
      walletClient: mockWalletClient,
      account: mockAccount,
    };

    // Create ERC20 instance
    erc20 = new ERC20(tokenAddress, mockPublicClient);
  });

  describe('Constructor', () => {
    test('should create an instance with correct address', () => {
      expect(erc20.address).toBe(tokenAddress);
    });

    test('should have address property', () => {
      // TypeScript enforces readonly at compile time
      // This test verifies the property exists and returns the correct value
      expect(erc20.address).toBe(tokenAddress);
      expect(typeof erc20.address).toBe('string');
      expect(erc20.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    test('should initialize with valid hex address', () => {
      const validAddress = '0x0000000000000000000000000000000000000000' as const;
      const instance = new ERC20(validAddress, mockPublicClient);
      expect(instance.address).toBe(validAddress);
    });
  });

  describe('Read Methods - name()', () => {
    test('should fetch token name from contract', async () => {
      const expectedName = 'Wrapped Ether';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

      const name = await erc20.name();

      expect(name).toBe(expectedName);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'name',
        })
      );
    });

    test('should cache token name after first call', async () => {
      const expectedName = 'Wrapped Ether';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

      // First call
      const name1 = await erc20.name();
      // Second call
      const name2 = await erc20.name();

      expect(name1).toBe(name2);
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1);
    });

    test('should return different names for different tokens', async () => {
      const erc20_1 = new ERC20(tokenAddress, mockPublicClient);
      const erc20_2 = new ERC20(
        '0x0000000000000000000000000000000000000001' as const,
        mockPublicClient
      );

      vi.mocked(mockPublicClient.readContract)
        .mockResolvedValueOnce('Token 1')
        .mockResolvedValueOnce('Token 2');

      const name1 = await erc20_1.name();
      const name2 = await erc20_2.name();

      expect(name1).toBe('Token 1');
      expect(name2).toBe('Token 2');
    });
  });

  describe('Read Methods - symbol()', () => {
    test('should fetch token symbol from contract', async () => {
      const expectedSymbol = 'WETH';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSymbol);

      const symbol = await erc20.symbol();

      expect(symbol).toBe(expectedSymbol);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'symbol',
        })
      );
    });

    test('should cache token symbol after first call', async () => {
      const expectedSymbol = 'WETH';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSymbol);

      const symbol1 = await erc20.symbol();
      const symbol2 = await erc20.symbol();

      expect(symbol1).toBe(symbol2);
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1);
    });

    test('should handle empty symbol', async () => {
      const expectedSymbol = '';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSymbol);

      const symbol = await erc20.symbol();

      expect(symbol).toBe(expectedSymbol);
    });
  });

  describe('Read Methods - decimals()', () => {
    test('should fetch token decimals from contract', async () => {
      const expectedDecimals = 18;
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedDecimals);

      const decimals = await erc20.decimals();

      expect(decimals).toBe(expectedDecimals);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'decimals',
        })
      );
    });

    test('should cache token decimals after first call', async () => {
      const expectedDecimals = 18;
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedDecimals);

      const decimals1 = await erc20.decimals();
      const decimals2 = await erc20.decimals();

      expect(decimals1).toBe(decimals2);
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1);
    });

    test('should handle different decimal values', async () => {
      const testCases = [6, 8, 18];

      for (const expectedDecimals of testCases) {
        const erc20_instance = new ERC20(tokenAddress, mockPublicClient);
        vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedDecimals);

        const decimals = await erc20_instance.decimals();

        expect(decimals).toBe(expectedDecimals);
      }
    });
  });

  describe('Read Methods - totalSupply()', () => {
    test('should fetch total supply from contract', async () => {
      const expectedSupply = BigInt('1000000000000000000000000'); // 1M tokens with 18 decimals
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSupply);

      const supply = await erc20.totalSupply();

      expect(supply).toBe(expectedSupply);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'totalSupply',
        })
      );
    });

    test('should return bigint total supply', async () => {
      const expectedSupply = BigInt('1000000000000000000000000');
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSupply);

      const supply = await erc20.totalSupply();

      expect(typeof supply).toBe('bigint');
    });

    test('should not cache total supply', async () => {
      const supply1 = BigInt('1000000000000000000000000');
      const supply2 = BigInt('2000000000000000000000000');

      vi.mocked(mockPublicClient.readContract)
        .mockResolvedValueOnce(supply1)
        .mockResolvedValueOnce(supply2);

      const result1 = await erc20.totalSupply();
      const result2 = await erc20.totalSupply();

      expect(result1).toBe(supply1);
      expect(result2).toBe(supply2);
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(2);
    });
  });

  describe('Read Methods - balanceOf()', () => {
    test('should fetch balance for an address', async () => {
      const expectedBalance = BigInt('1000000000000000000'); // 1 token with 18 decimals
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedBalance);

      const balance = await erc20.balanceOf(ownerAddress);

      expect(balance).toBe(expectedBalance);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'balanceOf',
          args: [ownerAddress],
        })
      );
    });

    test('should return zero balance for address with no tokens', async () => {
      const zeroBalance = BigInt('0');
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(zeroBalance);

      const balance = await erc20.balanceOf(recipientAddress);

      expect(balance).toBe(zeroBalance);
    });

    test('should fetch different balances for different addresses', async () => {
      const balance1 = BigInt('1000000000000000000');
      const balance2 = BigInt('2000000000000000000');

      vi.mocked(mockPublicClient.readContract)
        .mockResolvedValueOnce(balance1)
        .mockResolvedValueOnce(balance2);

      const result1 = await erc20.balanceOf(ownerAddress);
      const result2 = await erc20.balanceOf(recipientAddress);

      expect(result1).toBe(balance1);
      expect(result2).toBe(balance2);
    });

    test('should pass correct address argument to contract call', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(BigInt('0'));

      await erc20.balanceOf(ownerAddress);

      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [ownerAddress],
        })
      );
    });
  });

  describe('Read Methods - allowance()', () => {
    test('should fetch allowance between owner and spender', async () => {
      const expectedAllowance = BigInt('5000000000000000000'); // 5 tokens with 18 decimals
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedAllowance);

      const allowance = await erc20.allowance(ownerAddress, spenderAddress);

      expect(allowance).toBe(expectedAllowance);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'allowance',
          args: [ownerAddress, spenderAddress],
        })
      );
    });

    test('should return zero allowance when not approved', async () => {
      const zeroAllowance = BigInt('0');
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(zeroAllowance);

      const allowance = await erc20.allowance(ownerAddress, spenderAddress);

      expect(allowance).toBe(zeroAllowance);
    });

    test('should pass correct arguments to contract call', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(BigInt('0'));

      await erc20.allowance(ownerAddress, spenderAddress);

      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [ownerAddress, spenderAddress],
        })
      );
    });

    test('should handle different allowance values', async () => {
      const allowance1 = BigInt('1000000000000000000');
      const allowance2 = BigInt('5000000000000000000');

      vi.mocked(mockPublicClient.readContract)
        .mockResolvedValueOnce(allowance1)
        .mockResolvedValueOnce(allowance2);

      const result1 = await erc20.allowance(ownerAddress, spenderAddress);
      const result2 = await erc20.allowance(ownerAddress, recipientAddress);

      expect(result1).toBe(allowance1);
      expect(result2).toBe(allowance2);
    });
  });

  describe('Write Methods - transfer()', () => {
    test('should transfer tokens and return tx hash', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('1000000000000000000');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      const hash = await erc20.transfer(signer, recipientAddress, amount);

      expect(hash).toBe(txHash);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'transfer',
          args: [recipientAddress, amount],
          account: mockAccount,
        })
      );
    });

    test('should pass correct transfer parameters', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('5000000000000000000');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      await erc20.transfer(signer, recipientAddress, amount);

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [recipientAddress, amount],
        })
      );
    });

    test('should include account in write contract call', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      await erc20.transfer(signer, recipientAddress, BigInt('1000000000000000000'));

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          account: mockAccount,
        })
      );
    });

    test('should handle zero amount transfer', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      const hash = await erc20.transfer(signer, recipientAddress, BigInt('0'));

      expect(hash).toBe(txHash);
    });
  });

  describe('Write Methods - transferSync()', () => {
    test('should transfer tokens and wait for receipt', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('1000000000000000000');
      const mockReceipt = {
        transactionHash: txHash,
        status: 'success',
      };

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);
      vi.mocked(mockPublicClient.waitForTransactionReceipt).mockResolvedValueOnce(mockReceipt);

      const receipt = await erc20.transferSync(signer, recipientAddress, amount);

      expect(receipt).toBe(mockReceipt);
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith({ hash: txHash });
    });

    test('should pass transaction hash to waitForTransactionReceipt', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const mockReceipt = { transactionHash: txHash };

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);
      vi.mocked(mockPublicClient.waitForTransactionReceipt).mockResolvedValueOnce(mockReceipt);

      await erc20.transferSync(signer, recipientAddress, BigInt('1000000000000000000'));

      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          hash: txHash,
        })
      );
    });
  });

  describe('Write Methods - approve()', () => {
    test('should approve spender and return tx hash', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('5000000000000000000');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      const hash = await erc20.approve(signer, spenderAddress, amount);

      expect(hash).toBe(txHash);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'approve',
          args: [spenderAddress, amount],
          account: mockAccount,
        })
      );
    });

    test('should pass correct approve parameters', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('10000000000000000000');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      await erc20.approve(signer, spenderAddress, amount);

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [spenderAddress, amount],
        })
      );
    });

    test('should handle unlimited approval (max uint256)', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const maxApproval = BigInt(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      ); // max uint256

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      const hash = await erc20.approve(signer, spenderAddress, maxApproval);

      expect(hash).toBe(txHash);
    });
  });

  describe('Write Methods - approveSync()', () => {
    test('should approve and wait for receipt', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const mockReceipt = {
        transactionHash: txHash,
        status: 'success',
      };

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);
      vi.mocked(mockPublicClient.waitForTransactionReceipt).mockResolvedValueOnce(mockReceipt);

      const receipt = await erc20.approveSync(
        signer,
        spenderAddress,
        BigInt('5000000000000000000')
      );

      expect(receipt).toBe(mockReceipt);
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith({ hash: txHash });
    });
  });

  describe('Write Methods - transferFrom()', () => {
    test('should transfer tokens from one address to another', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('1000000000000000000');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      const hash = await erc20.transferFrom(signer, ownerAddress, recipientAddress, amount);

      expect(hash).toBe(txHash);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: tokenAddress,
          functionName: 'transferFrom',
          args: [ownerAddress, recipientAddress, amount],
          account: mockAccount,
        })
      );
    });

    test('should pass correct transferFrom parameters', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const amount = BigInt('2000000000000000000');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      await erc20.transferFrom(signer, ownerAddress, recipientAddress, amount);

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [ownerAddress, recipientAddress, amount],
        })
      );
    });

    test('should preserve from and to addresses in correct order', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      const fromAddr = '0x1111111111111111111111111111111111111111' as const;
      const toAddr = '0x2222222222222222222222222222222222222222' as const;

      await erc20.transferFrom(signer, fromAddr, toAddr, BigInt('1000000000000000000'));

      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [fromAddr, toAddr, expect.any(BigInt)],
        })
      );
    });
  });

  describe('Write Methods - transferFromSync()', () => {
    test('should transfer from and wait for receipt', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const mockReceipt = {
        transactionHash: txHash,
        status: 'success',
      };

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);
      vi.mocked(mockPublicClient.waitForTransactionReceipt).mockResolvedValueOnce(mockReceipt);

      const receipt = await erc20.transferFromSync(
        signer,
        ownerAddress,
        recipientAddress,
        BigInt('1000000000000000000')
      );

      expect(receipt).toBe(mockReceipt);
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith({ hash: txHash });
    });
  });

  describe('Utility Methods - formatAmount()', () => {
    test('should format amount using token decimals', async () => {
      const amount = BigInt('1500000000000000000'); // 1.5 tokens with 18 decimals
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const formatted = await erc20.formatAmount(amount);

      expect(formatted).toBe('1.5');
    });

    test('should handle zero amount', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const formatted = await erc20.formatAmount(BigInt('0'));

      expect(formatted).toBe('0');
    });

    test('should format with different decimal values', async () => {
      const testCases = [
        { amount: BigInt('1000000'), decimals: 6, expected: '1' },
        { amount: BigInt('100000000'), decimals: 8, expected: '1' },
        { amount: BigInt('1000000000000000000'), decimals: 18, expected: '1' },
      ];

      for (const { amount, decimals, expected } of testCases) {
        const erc20_instance = new ERC20(tokenAddress, mockPublicClient);
        vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(decimals);

        const formatted = await erc20_instance.formatAmount(amount);

        expect(formatted).toBe(expected);
      }
    });

    test('should cache decimals when formatting', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      await erc20.formatAmount(BigInt('1000000000000000000'));
      await erc20.formatAmount(BigInt('2000000000000000000'));

      // decimals() is called once in first formatAmount, then cached
      // Second formatAmount should use cached value
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1);
    });

    test('should handle large amounts', async () => {
      const largeAmount = BigInt('1000000000000000000000000'); // 1M tokens with 18 decimals
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const formatted = await erc20.formatAmount(largeAmount);

      expect(formatted).toBe('1000000');
    });
  });

  describe('Utility Methods - parseAmount()', () => {
    test('should parse amount to token smallest unit', async () => {
      const amountStr = '1.5';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const parsed = await erc20.parseAmount(amountStr);

      expect(parsed).toBe(BigInt('1500000000000000000'));
    });

    test('should handle zero amount', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const parsed = await erc20.parseAmount('0');

      expect(parsed).toBe(BigInt('0'));
    });

    test('should parse with different decimal values', async () => {
      const testCases = [
        { amountStr: '1', decimals: 6, expected: BigInt('1000000') },
        { amountStr: '1', decimals: 8, expected: BigInt('100000000') },
        { amountStr: '1', decimals: 18, expected: BigInt('1000000000000000000') },
      ];

      for (const { amountStr, decimals, expected } of testCases) {
        const erc20_instance = new ERC20(tokenAddress, mockPublicClient);
        vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(decimals);

        const parsed = await erc20_instance.parseAmount(amountStr);

        expect(parsed).toBe(expected);
      }
    });

    test('should cache decimals when parsing', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      await erc20.parseAmount('1');
      await erc20.parseAmount('2');

      // decimals() is called once in first parseAmount, then cached
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1);
    });

    test('should handle decimal amounts', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const parsed = await erc20.parseAmount('123.456789');

      expect(parsed).toBe(BigInt('123456789000000000000'));
    });

    test('should handle large amounts', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(18);

      const parsed = await erc20.parseAmount('1000000');

      expect(parsed).toBe(BigInt('1000000000000000000000000'));
    });
  });

  describe('Cache Management - clearCache()', () => {
    test('should clear cached name', async () => {
      const expectedName = 'Wrapped Ether';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

      // First call - caches the name
      await erc20.name();
      // Clear cache
      erc20.clearCache();
      // Reset mock
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);
      // Second call - should fetch again
      await erc20.name();

      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(2);
    });

    test('should clear cached symbol', async () => {
      const expectedSymbol = 'WETH';
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSymbol);

      await erc20.symbol();
      erc20.clearCache();
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedSymbol);
      await erc20.symbol();

      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(2);
    });

    test('should clear cached decimals', async () => {
      const expectedDecimals = 18;
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedDecimals);

      await erc20.decimals();
      erc20.clearCache();
      vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedDecimals);
      await erc20.decimals();

      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(2);
    });

    test('should clear all cached metadata at once', async () => {
      vi.mocked(mockPublicClient.readContract)
        .mockResolvedValueOnce('Wrapped Ether') // name
        .mockResolvedValueOnce('WETH') // symbol
        .mockResolvedValueOnce(18); // decimals

      await erc20.name();
      await erc20.symbol();
      await erc20.decimals();

      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(3);

      erc20.clearCache();

      vi.mocked(mockPublicClient.readContract)
        .mockResolvedValueOnce('Wrapped Ether')
        .mockResolvedValueOnce('WETH')
        .mockResolvedValueOnce(18);

      await erc20.name();
      await erc20.symbol();
      await erc20.decimals();

      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(6);
    });
  });

  describe('Integration Tests - formatAmount and parseAmount', () => {
    test('should round-trip format and parse', async () => {
      const originalAmount = BigInt('1500000000000000000');
      vi.mocked(mockPublicClient.readContract).mockResolvedValue(18);

      const formatted = await erc20.formatAmount(originalAmount);
      const parsed = await erc20.parseAmount(formatted);

      expect(parsed).toBe(originalAmount);
    });

    test('should handle multiple format/parse cycles', async () => {
      vi.mocked(mockPublicClient.readContract).mockResolvedValue(18);

      const testAmounts = [
        BigInt('1000000000000000000'),
        BigInt('2500000000000000000'),
        BigInt('100000000000000000'),
      ];

      for (const amount of testAmounts) {
        const formatted = await erc20.formatAmount(amount);
        const parsed = await erc20.parseAmount(formatted);
        expect(parsed).toBe(amount);
      }
    });
  });

  describe('Error Handling', () => {
    test('should propagate readContract errors', async () => {
      const error = new Error('Contract call failed');
      vi.mocked(mockPublicClient.readContract).mockRejectedValueOnce(error);

      await expect(erc20.name()).rejects.toThrow('Contract call failed');
    });

    test('should propagate writeContract errors', async () => {
      const error = new Error('Transaction failed');
      vi.mocked(mockWalletClient.writeContract).mockRejectedValueOnce(error);

      await expect(erc20.transfer(signer, recipientAddress, BigInt('1000'))).rejects.toThrow(
        'Transaction failed'
      );
    });

    test('should propagate waitForTransactionReceipt errors', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      const error = new Error('Receipt not found');

      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);
      vi.mocked(mockPublicClient.waitForTransactionReceipt).mockRejectedValueOnce(error);

      await expect(erc20.transferSync(signer, recipientAddress, BigInt('1000'))).rejects.toThrow(
        'Receipt not found'
      );
    });
  });

  describe('Type Safety', () => {
    test('should maintain correct address type', () => {
      const address: `0x${string}` = tokenAddress;
      expect(erc20.address).toBe(address);
      expect(erc20.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    test('should require ERC20Signer with walletClient and account', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as const;
      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);

      // Should accept valid signer
      await expect(erc20.transfer(signer, recipientAddress, BigInt('1000'))).resolves.toBe(txHash);
    });
  });

  describe('Factory Function - createERC20', () => {
    test('should be exported from module', async () => {
      // Import is already done at the top of the file
      // We just verify it's available as a function
      const { createERC20 } = await import('../../packages/core/src/contracts/erc20');
      expect(typeof createERC20).toBe('function');
    });
  });
});
