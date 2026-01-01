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
import { cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import type { Address, Chain, TransactionReceipt } from 'viem';
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

const mockReceipt: Partial<TransactionReceipt> = {
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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useBalance>);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useBalance>);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: mockReceipt,
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useReadContract>);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useReadContract>);

    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      status: 'connected',
      isConnected: true,
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: mockReceipt,
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: mockReceipt,
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useWriteContract>);

    vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
    } as unknown as ReturnType<typeof wagmi.useAccount>);

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
        return { data: undefined, isLoading: true, isError: false } as unknown as ReturnType<
          typeof wagmi.useReadContract
        >;
      }
      return { data: undefined, isLoading: false, isError: false } as unknown as ReturnType<
        typeof wagmi.useReadContract
      >;
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
        return { data: undefined, isLoading: false, isError: true } as unknown as ReturnType<
          typeof wagmi.useReadContract
        >;
      }
      return { data: undefined, isLoading: false, isError: false } as unknown as ReturnType<
        typeof wagmi.useReadContract
      >;
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
      } as unknown as ReturnType<typeof wagmi.useReadContract>;
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

// ============================================================================
// Hook Reactivity Tests
// ============================================================================

describe('Hook Reactivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('useRadiusBalance', () => {
    it('should respond to address parameter changes', () => {
      const mockUseBalance = vi.fn().mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      vi.mocked(wagmi.useBalance).mockImplementation(mockUseBalance);
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: undefined,
        status: 'disconnected',
        isConnected: false,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      let accountAddress: Address | undefined = undefined;

      const { rerender } = renderHook(() => useRadiusBalance({ address: accountAddress }), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Initially called with undefined
      expect(mockUseBalance).toHaveBeenLastCalledWith({
        address: undefined,
      });

      // Change parameter
      accountAddress = mockAddress;
      mockUseBalance.mockReturnValue({
        data: { value: BigInt('1000000000000000000'), decimals: 18 },
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should have been called with new address
      expect(mockUseBalance).toHaveBeenLastCalledWith({
        address: mockAddress,
      });
    });

    it('should transition from disabled to enabled when address becomes available', () => {
      const mockUseBalance = vi.fn().mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      vi.mocked(wagmi.useBalance).mockImplementation(mockUseBalance);

      // Start with no address
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: undefined,
        status: 'disconnected',
        isConnected: false,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      const { result, rerender } = renderHook(() => useRadiusBalance(), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Initially disabled (no address)
      expect(mockUseBalance).toHaveBeenLastCalledWith({
        address: undefined,
      });
      expect(result.current.isLoading).toBe(false);

      // Connect wallet with address
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: mockAddress,
        status: 'connected',
        isConnected: true,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      mockUseBalance.mockReturnValue({
        data: { value: BigInt('2000000000000000000'), decimals: 18 },
        isLoading: false,
        isError: false,
      });

      rerender();

      // Should now be enabled with address
      expect(mockUseBalance).toHaveBeenLastCalledWith({
        address: mockAddress,
      });
    });
  });

  describe('useERC20Balance', () => {
    it('should respond to token parameter changes', () => {
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
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      const tokenAddress1 = mockTokenAddress;
      const tokenAddress2 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;

      let currentToken = tokenAddress1;

      const { rerender } = renderHook(() => useERC20Balance({ token: currentToken }), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Initially called with first token
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: tokenAddress1,
          functionName: 'balanceOf',
          args: [mockAddress],
          query: { enabled: true },
        })
      );

      // Change token parameter
      currentToken = tokenAddress2;
      mockUseReadContract.mockReturnValue({
        data: BigInt('2000000000000000000'),
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should have been called with new token
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: tokenAddress2,
          functionName: 'balanceOf',
          args: [mockAddress],
          query: { enabled: true },
        })
      );
    });

    it('should respond to address parameter changes', () => {
      const mockUseReadContract = vi.fn().mockReturnValue({
        data: BigInt('1000000000000000000'),
        isLoading: false,
        isError: false,
      });

      vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: undefined,
        status: 'disconnected',
        isConnected: false,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      const address1 = mockAddress;
      const address2 = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Address;

      let currentAddress: Address | undefined = address1;

      const { rerender } = renderHook(
        () => useERC20Balance({ token: mockTokenAddress, address: currentAddress }),
        {
          wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
        }
      );

      // Initially called with first address
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: mockTokenAddress,
          functionName: 'balanceOf',
          args: [address1],
          query: { enabled: true },
        })
      );

      // Change address parameter
      currentAddress = address2;
      mockUseReadContract.mockReturnValue({
        data: BigInt('3000000000000000000'),
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should have been called with new address
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: mockTokenAddress,
          functionName: 'balanceOf',
          args: [address2],
          query: { enabled: true },
        })
      );
    });

    it('should disable query when address becomes undefined', () => {
      const mockUseReadContract = vi.fn().mockReturnValue({
        data: BigInt('1000000000000000000'),
        isLoading: false,
        isError: false,
      });

      vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: undefined,
        status: 'disconnected',
        isConnected: false,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      let currentAddress: Address | undefined = mockAddress;

      const { rerender } = renderHook(
        () => useERC20Balance({ token: mockTokenAddress, address: currentAddress }),
        {
          wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
        }
      );

      // Initially enabled with address
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          args: [mockAddress],
          query: { enabled: true },
        })
      );

      // Remove address
      currentAddress = undefined;
      mockUseReadContract.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should be disabled
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          args: undefined,
          query: { enabled: false },
        })
      );
    });
  });

  describe('useERC20Transfer', () => {
    it('should respond to token parameter changes', () => {
      const mockWriteContract = vi.fn();

      vi.mocked(wagmi.useWriteContract).mockReturnValue({
        data: undefined,
        error: null,
        isPending: false,
        writeContract: mockWriteContract,
        reset: vi.fn(),
      } as unknown as ReturnType<typeof wagmi.useWriteContract>);

      vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
      } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

      const tokenAddress1 = mockTokenAddress;
      const tokenAddress2 = '0xcccccccccccccccccccccccccccccccccccccccc' as Address;

      let currentToken = tokenAddress1;

      const { result, rerender } = renderHook(() => useERC20Transfer({ token: currentToken }), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Call transfer with first token
      result.current.transfer(mockAddress, BigInt('1000000000000000000'));

      expect(mockWriteContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: tokenAddress1,
          functionName: 'transfer',
        })
      );

      // Change token parameter
      currentToken = tokenAddress2;
      rerender();

      // Call transfer with new token
      result.current.transfer(mockAddress, BigInt('2000000000000000000'));

      expect(mockWriteContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: tokenAddress2,
          functionName: 'transfer',
        })
      );
    });
  });

  describe('useERC20Approve', () => {
    it('should respond to token parameter changes', () => {
      const mockWriteContract = vi.fn();

      vi.mocked(wagmi.useWriteContract).mockReturnValue({
        data: undefined,
        error: null,
        isPending: false,
        writeContract: mockWriteContract,
        reset: vi.fn(),
      } as unknown as ReturnType<typeof wagmi.useWriteContract>);

      vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
      } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

      const tokenAddress1 = mockTokenAddress;
      const tokenAddress2 = '0xdddddddddddddddddddddddddddddddddddddddd' as Address;

      let currentToken = tokenAddress1;

      const { result, rerender } = renderHook(() => useERC20Approve({ token: currentToken }), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Call approve with first token
      result.current.approve(mockSpenderAddress, BigInt('1000000000000000000'));

      expect(mockWriteContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: tokenAddress1,
          functionName: 'approve',
        })
      );

      // Change token parameter
      currentToken = tokenAddress2;
      rerender();

      // Call approve with new token
      result.current.approve(mockSpenderAddress, BigInt('2000000000000000000'));

      expect(mockWriteContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: tokenAddress2,
          functionName: 'approve',
        })
      );
    });
  });

  describe('useERC20Allowance', () => {
    it('should respond to spender parameter changes', () => {
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
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      const spender1 = mockSpenderAddress;
      const spender2 = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as Address;

      let currentSpender = spender1;

      const { rerender } = renderHook(
        () =>
          useERC20Allowance({
            token: mockTokenAddress,
            spender: currentSpender,
          }),
        {
          wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
        }
      );

      // Initially called with first spender
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: mockTokenAddress,
          functionName: 'allowance',
          args: [mockAddress, spender1],
          query: { enabled: true },
        })
      );

      // Change spender parameter
      currentSpender = spender2;
      mockUseReadContract.mockReturnValue({
        data: BigInt('2000000000000000000'),
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should have been called with new spender
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: mockTokenAddress,
          functionName: 'allowance',
          args: [mockAddress, spender2],
          query: { enabled: true },
        })
      );
    });

    it('should respond to owner parameter changes', () => {
      const mockUseReadContract = vi.fn().mockReturnValue({
        data: BigInt('1000000000000000000'),
        isLoading: false,
        isError: false,
      });

      vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: undefined,
        status: 'disconnected',
        isConnected: false,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      const owner1 = mockAddress;
      const owner2 = '0xffffffffffffffffffffffffffffffffffffffff' as Address;

      let currentOwner: Address | undefined = owner1;

      const { rerender } = renderHook(
        () =>
          useERC20Allowance({
            token: mockTokenAddress,
            owner: currentOwner,
            spender: mockSpenderAddress,
          }),
        {
          wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
        }
      );

      // Initially called with first owner
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: mockTokenAddress,
          functionName: 'allowance',
          args: [owner1, mockSpenderAddress],
          query: { enabled: true },
        })
      );

      // Change owner parameter
      currentOwner = owner2;
      mockUseReadContract.mockReturnValue({
        data: BigInt('3000000000000000000'),
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should have been called with new owner
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          address: mockTokenAddress,
          functionName: 'allowance',
          args: [owner2, mockSpenderAddress],
          query: { enabled: true },
        })
      );
    });

    it('should disable query when owner becomes undefined', () => {
      const mockUseReadContract = vi.fn().mockReturnValue({
        data: BigInt('1000000000000000000'),
        isLoading: false,
        isError: false,
      });

      vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);
      vi.mocked(wagmi.useAccount).mockReturnValue({
        address: undefined,
        status: 'disconnected',
        isConnected: false,
      } as unknown as ReturnType<typeof wagmi.useAccount>);

      let currentOwner: Address | undefined = mockAddress;

      const { rerender } = renderHook(
        () =>
          useERC20Allowance({
            token: mockTokenAddress,
            owner: currentOwner,
            spender: mockSpenderAddress,
          }),
        {
          wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
        }
      );

      // Initially enabled with owner
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          args: [mockAddress, mockSpenderAddress],
          query: { enabled: true },
        })
      );

      // Remove owner
      currentOwner = undefined;
      mockUseReadContract.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
      rerender();

      // Should be disabled
      expect(mockUseReadContract).toHaveBeenLastCalledWith(
        expect.objectContaining({
          args: undefined,
          query: { enabled: false },
        })
      );
    });
  });

  describe('useERC20Metadata', () => {
    it('should respond to token parameter changes', () => {
      const mockUseReadContract = vi.fn();
      vi.mocked(wagmi.useReadContract).mockImplementation(mockUseReadContract);

      const tokenAddress1 = mockTokenAddress;
      const tokenAddress2 = '0x1111111111111111111111111111111111111111' as Address;

      let currentToken = tokenAddress1;

      // First render with token1
      let callCount = 0;
      mockUseReadContract.mockImplementation(() => {
        callCount += 1;
        const responses: any[] = [
          { data: 'Token1', isLoading: false, isError: false },
          { data: 'TK1', isLoading: false, isError: false },
          { data: 18, isLoading: false, isError: false },
          { data: BigInt('1000'), isLoading: false, isError: false },
        ];
        return responses[callCount - 1];
      });

      const { result, rerender } = renderHook(() => useERC20Metadata({ token: currentToken }), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Verify first token metadata
      expect(result.current.name).toBe('Token1');
      expect(result.current.symbol).toBe('TK1');

      // Change to token2
      currentToken = tokenAddress2;
      callCount = 0;
      mockUseReadContract.mockImplementation(() => {
        callCount += 1;
        const responses: any[] = [
          { data: 'Token2', isLoading: false, isError: false },
          { data: 'TK2', isLoading: false, isError: false },
          { data: 6, isLoading: false, isError: false },
          { data: BigInt('2000'), isLoading: false, isError: false },
        ];
        return responses[callCount - 1];
      });
      rerender();

      // Verify second token metadata
      expect(result.current.name).toBe('Token2');
      expect(result.current.symbol).toBe('TK2');
      expect(result.current.decimals).toBe(6);
    });
  });

  describe('useRadiusSend', () => {
    it('should update state when transaction completes', () => {
      const mockSendTransaction = vi.fn();

      vi.mocked(wagmi.useSendTransaction).mockReturnValue({
        data: undefined,
        error: null,
        isPending: false,
        sendTransaction: mockSendTransaction,
        reset: vi.fn(),
      } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

      vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
      } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

      const { result, rerender } = renderHook(() => useRadiusSend(), {
        wrapper: ({ children }: { children: ReactNode }) => <TestWrapper>{children}</TestWrapper>,
      });

      // Initially not pending
      expect(result.current.isPending).toBe(false);
      expect(result.current.isConfirmed).toBe(false);

      // Simulate transaction sent
      vi.mocked(wagmi.useSendTransaction).mockReturnValue({
        data: mockHash,
        error: null,
        isPending: true,
        sendTransaction: mockSendTransaction,
        reset: vi.fn(),
      } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

      vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
      } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

      rerender();

      // Should be pending
      expect(result.current.isPending).toBe(true);
      expect(result.current.isConfirming).toBe(true);

      // Simulate transaction confirmed
      vi.mocked(wagmi.useSendTransaction).mockReturnValue({
        data: mockHash,
        error: null,
        isPending: false,
        sendTransaction: mockSendTransaction,
        reset: vi.fn(),
      } as unknown as ReturnType<typeof wagmi.useSendTransaction>);

      vi.mocked(wagmi.useWaitForTransactionReceipt).mockReturnValue({
        data: mockReceipt,
        isLoading: false,
        isSuccess: true,
      } as unknown as ReturnType<typeof wagmi.useWaitForTransactionReceipt>);

      rerender();

      // Should be confirmed
      expect(result.current.isPending).toBe(false);
      expect(result.current.isConfirmed).toBe(true);
      expect(result.current.receipt).toBeDefined();
    });
  });
});
