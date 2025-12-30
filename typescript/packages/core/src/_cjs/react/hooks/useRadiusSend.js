'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useRadiusSend = useRadiusSend;
const viem_1 = require('viem');
const wagmi_1 = require('wagmi');
function useRadiusSend() {
  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
    reset,
  } = (0, wagmi_1.useSendTransaction)();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = (0, wagmi_1.useWaitForTransactionReceipt)({
    hash,
  });
  const send = ({ to, value }) => {
    const amount = typeof value === 'string' ? (0, viem_1.parseEther)(value) : value;
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
