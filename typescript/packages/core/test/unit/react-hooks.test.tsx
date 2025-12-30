// @vitest-environment jsdom

import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import {
  RadiusProvider,
  useERC20Allowance,
  useERC20Approve,
  useERC20Balance,
  useERC20Metadata,
  useERC20Transfer,
  useRadiusBalance,
  useRadiusContext,
  useRadiusSend,
} from '@radiustechsystems/sdk/react';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import type { Address, Chain } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as wagmi from 'wagmi';

// Mock wagmi hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof wagmi>('wagmi');
  return {
    ...actual,
    useAccount: vi.fn(),
    useBalance: vi.fn(),
    useSendTransaction: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
    useWriteContract: vi.fn(),
    useReadContract: vi.fn(),
    WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    createConfig: vi.fn(() => ({})),
    http: vi.fn(),
  };
});

// ============================================================================
// Test Helpers
// ============================================================================

interface TestWrapperProps {
  children: ReactNode;
  chain?: Chain;
  queryClient?: QueryClient;
}

function TestWrapper({ children, chain, queryClient }: TestWrapperProps) {
  return (
    <RadiusProvider chain={chain} queryClient={queryClient}>
      {children}
    </RadiusProvider>
  );
}

const mockAddress = '0x1234567890123456789012345678901234567890' as Address;
const mockTokenAddress = '0x0987654321098765432109876543210987654321' as Address;
const mockSpenderAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;
const mockHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as const;

const mockReceipt: any = {
  transactionHash: mockHash,
  blockNumber: BigInt(100),
  blockHash: '0xblockhash',
  from: mockAddress,
  to: mockTokenAddress,
  status: 'success' as const,
};

// ============================================================================
// RadiusProvider Tests
// ============================================================================

describe('RadiusProvider', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render children', () => {
    render(
      <TestWrapper>
        <div data-testid="child">Test Child</div>
      </TestWrapper>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should wrap with QueryClientProvider', () => {
    const testQueryClient = new QueryClient();
    render(
      <TestWrapper queryClient={testQueryClient}>
        <div data-testid="child">Test Child</div>
      </TestWrapper>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should accept custom chain', () => {
    function ContextConsumer() {
      const { chain } = useRadiusContext();
      return <div data-testid="chain-id">{chain.id}</div>;
    }

    render(
      <TestWrapper chain={radiusTestnet}>
        <ContextConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('chain-id')).toHaveTextContent(radiusTestnet.id.toString());
  });

  it('should use default radiusTestnet chain', () => {
    function ContextConsumer() {
      const { chain } = useRadiusContext();
      return <div data-testid="chain-name">{chain.name}</div>;
    }

    render(
      <TestWrapper>
        <ContextConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('chain-name')).toHaveTextContent(radiusTestnet.name);
  });
});

// ============================================================================
// RadiusContext Tests
// ============================================================================

describe('useRadiusContext', () => {
  afterEach(() => {
    cleanup();
  });

  it('should provide chain config', () => {
    function ContextConsumer() {
      const { chain } = useRadiusContext();
      return (
        <div>
          <div data-testid="chain-id">{chain.id}</div>
          <div data-testid="chain-name">{chain.name}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <ContextConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('chain-id')).toBeInTheDocument();
    expect(screen.getByTestId('chain-name')).toBeInTheDocument();
  });

  it('should throw error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function ContextConsumer() {
      useRadiusContext();
      return <div>Test</div>;
    }

    expect(() => {
      render(<ContextConsumer />);
    }).toThrow('useRadiusContext must be used within a RadiusProvider');

    consoleError.mockRestore();
  });
});

// ============================================================================
// useRadiusBalance Tests
// ============================================================================

describe('useRadiusBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should use connected address when not provided', () => {
    const mockUseBalance = vi.fn().mockReturnValue({
      data: { value: BigInt('1000000000000000000'), decimals: 18 },
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useBalance).mockImplementation(mockUseBalance);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const balance = useRadiusBalance();
      return <div data-testid="balance">{balance.data?.value.toString()}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseBalance).toHaveBeenCalledWith({
      address: mockAddress,
    });
  });

  it('should use provided address', () => {
    const mockUseBalance = vi.fn().mockReturnValue({
      data: { value: BigInt('2000000000000000000'), decimals: 18 },
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useBalance).mockImplementation(mockUseBalance);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: undefined,
      status: 'disconnected',
      isConnected: false,
    } as any);

    function TestComponent() {
      const balance = useRadiusBalance({ address: mockAddress });
      return <div data-testid="balance">{balance.data?.value.toString()}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseBalance).toHaveBeenCalledWith({
      address: mockAddress,
    });
  });

  it('should return loading state', () => {
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const balance = useRadiusBalance();
      return (
        <div>
          <div data-testid="loading">{balance.isLoading ? 'loading' : 'loaded'}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should return error state', () => {
    const mockError = new Error('Balance fetch failed');
    vi.mocked(wagmi.useBalance).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
    } as any);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const balance = useRadiusBalance();
      return (
        <div>
          <div data-testid="error">{balance.isError ? 'error' : 'ok'}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('error');
  });
});

// ============================================================================
// useRadiusSend Tests
// ============================================================================

describe('useRadiusSend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should return correct data structure', () => {
    const mockSendTransaction = vi.fn();
    const mockReset = vi.fn();

    vi.mocked(wagmi.useSendTransaction).mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
      sendTransaction: mockSendTransaction,
      reset: mockReset,
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const send = useRadiusSend();
      return (
        <div>
          <div data-testid="hash">{send.hash || 'no-hash'}</div>
          <div data-testid="receipt">{send.receipt ? 'has-receipt' : 'no-receipt'}</div>
          <div data-testid="error">{send.error ? 'error' : 'no-error'}</div>
          <div data-testid="is-pending">{send.isPending ? 'pending' : 'not-pending'}</div>
          <div data-testid="is-confirming">
            {send.isConfirming ? 'confirming' : 'not-confirming'}
          </div>
          <div data-testid="is-confirmed">{send.isConfirmed ? 'confirmed' : 'not-confirmed'}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('hash')).toHaveTextContent('no-hash');
    expect(screen.getByTestId('receipt')).toHaveTextContent('no-receipt');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('is-pending')).toHaveTextContent('not-pending');
    expect(screen.getByTestId('is-confirming')).toHaveTextContent('not-confirming');
    expect(screen.getByTestId('is-confirmed')).toHaveTextContent('not-confirmed');
  });

  it('should handle send function', () => {
    const mockSendTransaction = vi.fn();
    const mockReset = vi.fn();

    vi.mocked(wagmi.useSendTransaction).mockReturnValue({
      data: undefined,
      error: null,
      isPending: true,
      sendTransaction: mockSendTransaction,
      reset: mockReset,
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const send = useRadiusSend();
      return (
        <button
          type="button"
          data-testid="send-button"
          onClick={() => send.send({ to: mockAddress, value: '1.0' })}
        >
          Send
        </button>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByTestId('send-button');
    button.click();

    expect(mockSendTransaction).toHaveBeenCalled();
    const callArgs = mockSendTransaction.mock.calls[0][0];
    expect(callArgs.to).toBe(mockAddress);
    expect(callArgs.value).toBeDefined();
  });

  it('should handle loading state', () => {
    const mockSendTransaction = vi.fn();

    vi.mocked(wagmi.useSendTransaction).mockReturnValue({
      data: mockHash,
      error: null,
      isPending: true,
      sendTransaction: mockSendTransaction,
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const send = useRadiusSend();
      return (
        <div data-testid="pending">{send.isPending || send.isConfirming ? 'loading' : 'idle'}</div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('pending')).toHaveTextContent('loading');
  });

  it('should handle success state', () => {
    vi.mocked(wagmi.useSendTransaction).mockReturnValue({
      data: mockHash,
      error: null,
      isPending: false,
      sendTransaction: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: mockReceipt,
      isLoading: false,
      isSuccess: true,
    } as any);

    function TestComponent() {
      const send = useRadiusSend();
      return (
        <div>
          <div data-testid="confirmed">{send.isConfirmed ? 'yes' : 'no'}</div>
          <div data-testid="has-receipt">{send.receipt ? 'yes' : 'no'}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('confirmed')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-receipt')).toHaveTextContent('yes');
  });

  it('should handle error state', () => {
    const mockError = new Error('Transaction failed');

    vi.mocked(wagmi.useSendTransaction).mockReturnValue({
      data: undefined,
      error: mockError,
      isPending: false,
      sendTransaction: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const send = useRadiusSend();
      return <div data-testid="error">{send.error ? 'error' : 'no-error'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('error');
  });
});

// ============================================================================
// useERC20Balance Tests
// ============================================================================

describe('useERC20Balance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should use connected address when not provided', () => {
    const mockUseReadContract = vi.fn().mockReturnValue({
      data: BigInt('1000000000000000000'),
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const balance = useERC20Balance({ token: mockTokenAddress });
      return <div data-testid="balance">{balance.data?.toString()}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockTokenAddress,
        functionName: 'balanceOf',
        args: [mockAddress],
        query: { enabled: true },
      })
    );
  });

  it('should use provided address', () => {
    const mockUseReadContract = vi.fn().mockReturnValue({
      data: BigInt('2000000000000000000'),
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: undefined,
      status: 'disconnected',
      isConnected: false,
    } as any);

    function TestComponent() {
      const balance = useERC20Balance({ token: mockTokenAddress, address: mockAddress });
      return <div data-testid="balance">{balance.data?.toString()}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockTokenAddress,
        functionName: 'balanceOf',
        args: [mockAddress],
        query: { enabled: true },
      })
    );
  });

  it('should disable query when no address', () => {
    const mockUseReadContract = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: undefined,
      status: 'disconnected',
      isConnected: false,
    } as any);

    function TestComponent() {
      useERC20Balance({ token: mockTokenAddress });
      return <div data-testid="balance">ok</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        args: undefined,
        query: { enabled: false },
      })
    );
  });

  it('should return loading state', () => {
    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const balance = useERC20Balance({ token: mockTokenAddress });
      return <div data-testid="loading">{balance.isLoading ? 'loading' : 'loaded'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should return error state', () => {
    const mockError = new Error('Balance fetch failed');
    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
    } as any);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const balance = useERC20Balance({ token: mockTokenAddress });
      return <div data-testid="error">{balance.isError ? 'error' : 'ok'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('error');
  });
});

// ============================================================================
// useERC20Transfer Tests
// ============================================================================

describe('useERC20Transfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should return correct data structure', () => {
    const mockWriteContract = vi.fn();
    const mockReset = vi.fn();

    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
      writeContract: mockWriteContract,
      reset: mockReset,
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const transfer = useERC20Transfer({ token: mockTokenAddress });
      return (
        <div>
          <div data-testid="hash">{transfer.hash || 'no-hash'}</div>
          <div data-testid="receipt">{transfer.receipt ? 'has-receipt' : 'no-receipt'}</div>
          <div data-testid="error">{transfer.error ? 'error' : 'no-error'}</div>
          <div data-testid="is-pending">{transfer.isPending ? 'pending' : 'not-pending'}</div>
          <div data-testid="is-confirming">
            {transfer.isConfirming ? 'confirming' : 'not-confirming'}
          </div>
          <div data-testid="is-confirmed">
            {transfer.isConfirmed ? 'confirmed' : 'not-confirmed'}
          </div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('hash')).toHaveTextContent('no-hash');
    expect(screen.getByTestId('receipt')).toHaveTextContent('no-receipt');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should handle transfer function', () => {
    const mockWriteContract = vi.fn();

    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
      writeContract: mockWriteContract,
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const transfer = useERC20Transfer({ token: mockTokenAddress });
      return (
        <button
          type="button"
          data-testid="transfer-button"
          onClick={() => transfer.transfer(mockAddress, BigInt('1000000000000000000'))}
        >
          Transfer
        </button>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByTestId('transfer-button');
    button.click();

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockTokenAddress,
        functionName: 'transfer',
        args: [mockAddress, BigInt('1000000000000000000')],
      })
    );
  });

  it('should handle pending state', () => {
    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: mockHash,
      error: null,
      isPending: true,
      writeContract: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const transfer = useERC20Transfer({ token: mockTokenAddress });
      return (
        <div data-testid="pending">
          {transfer.isPending || transfer.isConfirming ? 'loading' : 'idle'}
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('pending')).toHaveTextContent('loading');
  });

  it('should handle success state', () => {
    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: mockHash,
      error: null,
      isPending: false,
      writeContract: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: mockReceipt,
      isLoading: false,
      isSuccess: true,
    } as any);

    function TestComponent() {
      const transfer = useERC20Transfer({ token: mockTokenAddress });
      return (
        <div>
          <div data-testid="confirmed">{transfer.isConfirmed ? 'yes' : 'no'}</div>
          <div data-testid="has-receipt">{transfer.receipt ? 'yes' : 'no'}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('confirmed')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-receipt')).toHaveTextContent('yes');
  });

  it('should handle error state', () => {
    const mockError = new Error('Transfer failed');

    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: undefined,
      error: mockError,
      isPending: false,
      writeContract: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const transfer = useERC20Transfer({ token: mockTokenAddress });
      return <div data-testid="error">{transfer.error ? 'error' : 'no-error'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('error');
  });
});

// ============================================================================
// useERC20Approve Tests
// ============================================================================

describe('useERC20Approve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should return correct data structure', () => {
    const mockWriteContract = vi.fn();
    const mockReset = vi.fn();

    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
      writeContract: mockWriteContract,
      reset: mockReset,
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const approve = useERC20Approve({ token: mockTokenAddress });
      return (
        <div>
          <div data-testid="hash">{approve.hash || 'no-hash'}</div>
          <div data-testid="receipt">{approve.receipt ? 'has-receipt' : 'no-receipt'}</div>
          <div data-testid="error">{approve.error ? 'error' : 'no-error'}</div>
          <div data-testid="is-pending">{approve.isPending ? 'pending' : 'not-pending'}</div>
          <div data-testid="is-confirming">
            {approve.isConfirming ? 'confirming' : 'not-confirming'}
          </div>
          <div data-testid="is-confirmed">
            {approve.isConfirmed ? 'confirmed' : 'not-confirmed'}
          </div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('hash')).toHaveTextContent('no-hash');
    expect(screen.getByTestId('receipt')).toHaveTextContent('no-receipt');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should handle approve function', () => {
    const mockWriteContract = vi.fn();

    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
      writeContract: mockWriteContract,
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const approve = useERC20Approve({ token: mockTokenAddress });
      return (
        <button
          type="button"
          data-testid="approve-button"
          onClick={() => approve.approve(mockSpenderAddress, BigInt('1000000000000000000'))}
        >
          Approve
        </button>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByTestId('approve-button');
    button.click();

    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockTokenAddress,
        functionName: 'approve',
        args: [mockSpenderAddress, BigInt('1000000000000000000')],
      })
    );
  });

  it('should handle pending state', () => {
    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: mockHash,
      error: null,
      isPending: true,
      writeContract: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const approve = useERC20Approve({ token: mockTokenAddress });
      return (
        <div data-testid="pending">
          {approve.isPending || approve.isConfirming ? 'loading' : 'idle'}
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('pending')).toHaveTextContent('loading');
  });

  it('should handle success state', () => {
    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: mockHash,
      error: null,
      isPending: false,
      writeContract: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: mockReceipt,
      isLoading: false,
      isSuccess: true,
    } as any);

    function TestComponent() {
      const approve = useERC20Approve({ token: mockTokenAddress });
      return (
        <div>
          <div data-testid="confirmed">{approve.isConfirmed ? 'yes' : 'no'}</div>
          <div data-testid="has-receipt">{approve.receipt ? 'yes' : 'no'}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('confirmed')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-receipt')).toHaveTextContent('yes');
  });

  it('should handle error state', () => {
    const mockError = new Error('Approval failed');

    vi.mocked(wagmi.useWriteContract).mockReturnValue({
      data: undefined,
      error: mockError,
      isPending: false,
      writeContract: vi.fn(),
      reset: vi.fn(),
    } as any);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as any);

    function TestComponent() {
      const approve = useERC20Approve({ token: mockTokenAddress });
      return <div data-testid="error">{approve.error ? 'error' : 'no-error'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('error');
  });
});

// ============================================================================
// useERC20Allowance Tests
// ============================================================================

describe('useERC20Allowance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should use connected address as owner when not provided', () => {
    const mockUseReadContract = vi.fn().mockReturnValue({
      data: BigInt('1000000000000000000'),
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as any);

    function TestComponent() {
      const allowance = useERC20Allowance({
        token: mockTokenAddress,
        spender: mockSpenderAddress,
      });
      return <div data-testid="allowance">{allowance.data?.toString()}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockTokenAddress,
        functionName: 'allowance',
        args: [mockAddress, mockSpenderAddress],
        query: { enabled: true },
      })
    );
  });

  it('should use provided owner address', () => {
    const mockUseReadContract = vi.fn().mockReturnValue({
      data: BigInt('2000000000000000000'),
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: undefined,
      status: 'disconnected',
      isConnected: false,
    } as any);

    function TestComponent() {
      const allowance = useERC20Allowance({
        token: mockTokenAddress,
        owner: mockAddress,
        spender: mockSpenderAddress,
      });
      return <div data-testid="allowance">{allowance.data?.toString()}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockTokenAddress,
        functionName: 'allowance',
        args: [mockAddress, mockSpenderAddress],
        query: { enabled: true },
      })
    );
  });

  it('should disable query when no owner', () => {
    const mockUseReadContract = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: undefined,
      status: 'disconnected',
      isConnected: false,
    } as any);

    function TestComponent() {
      useERC20Allowance({
        token: mockTokenAddress,
        spender: mockSpenderAddress,
      });
      return <div data-testid="allowance">ok</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        args: undefined,
        query: { enabled: false },
      })
    );
  });
});

// ============================================================================
// useERC20Metadata Tests
// ============================================================================

describe('useERC20Metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should return combined metadata from multiple contracts', () => {
    let callCount = 0;
    vi.mocked(wagmi.useReadContract).mockImplementation(() => {
      callCount += 1;
      const responses: any[] = [
        { data: 'Token Name', isLoading: false, isError: false },
        { data: 'TKN', isLoading: false, isError: false },
        { data: 18, isLoading: false, isError: false },
        { data: BigInt('1000000000000000000000'), isLoading: false, isError: false },
      ];
      return responses[callCount - 1];
    });

    function TestComponent() {
      const metadata = useERC20Metadata({ token: mockTokenAddress });
      return (
        <div>
          <div data-testid="name">{metadata.name}</div>
          <div data-testid="symbol">{metadata.symbol}</div>
          <div data-testid="decimals">{metadata.decimals}</div>
          <div data-testid="total-supply">{metadata.totalSupply?.toString()}</div>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('name')).toHaveTextContent('Token Name');
    expect(screen.getByTestId('symbol')).toHaveTextContent('TKN');
    expect(screen.getByTestId('decimals')).toHaveTextContent('18');
    expect(screen.getByTestId('total-supply')).toHaveTextContent('1000000000000000000000');
  });

  it('should return loading state when any query is loading', () => {
    let callCount = 0;
    vi.mocked(wagmi.useReadContract).mockImplementation(() => {
      callCount += 1;
      if (callCount === 2) {
        return { data: undefined, isLoading: true, isError: false } as any;
      }
      return { data: undefined, isLoading: false, isError: false } as any;
    });

    function TestComponent() {
      const metadata = useERC20Metadata({ token: mockTokenAddress });
      return <div data-testid="loading">{metadata.isLoading ? 'loading' : 'loaded'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should return error state when any query has error', () => {
    let callCount = 0;
    vi.mocked(wagmi.useReadContract).mockImplementation(() => {
      callCount += 1;
      if (callCount === 3) {
        return { data: undefined, isLoading: false, isError: true } as any;
      }
      return { data: undefined, isLoading: false, isError: false } as any;
    });

    function TestComponent() {
      const metadata = useERC20Metadata({ token: mockTokenAddress });
      return <div data-testid="error">{metadata.isError ? 'error' : 'ok'}</div>;
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('error');
  });

  it('should provide refetch function', async () => {
    const mockRefetch = vi.fn().mockResolvedValue({ data: 'Token Name' });
    let callCount = 0;
    vi.mocked(wagmi.useReadContract).mockImplementation(() => {
      callCount += 1;
      return {
        data: callCount === 1 ? 'Token Name' : undefined,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as any;
    });

    function TestComponent() {
      const metadata = useERC20Metadata({ token: mockTokenAddress });
      return (
        <button
          type="button"
          data-testid="refetch-button"
          onClick={() => {
            metadata.refetch();
          }}
        >
          Refetch
        </button>
      );
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByTestId('refetch-button');
    button.click();

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
