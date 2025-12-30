'use client';
import { parseEther } from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
export function useRadiusSend() {
  const { data: hash, error, isPending, sendTransaction, reset } = useSendTransaction();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });
  const send = ({ to, value }) => {
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
//# sourceMappingURL=useRadiusSend.js.map
