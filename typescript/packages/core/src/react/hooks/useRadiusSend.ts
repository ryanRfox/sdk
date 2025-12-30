'use client';

import type { Address, Hash, TransactionReceipt } from 'viem';
import { parseEther } from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

export type UseRadiusSendParams = {
  to: Address;
  value: string | bigint;
};

export type UseRadiusSendReturn = {
  hash: Hash | undefined;
  receipt: TransactionReceipt | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  send: (params: UseRadiusSendParams) => void;
  reset: () => void;
};

export function useRadiusSend(): UseRadiusSendReturn {
  const { data: hash, error, isPending, sendTransaction, reset } = useSendTransaction();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const send = ({ to, value }: UseRadiusSendParams) => {
    const amount = typeof value === 'string' ? parseEther(value) : value;
    sendTransaction({
      to,
      value: amount,
    });
  };

  return {
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    send,
    reset,
  };
}
