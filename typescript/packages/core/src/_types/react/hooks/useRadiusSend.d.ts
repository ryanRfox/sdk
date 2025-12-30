import type { Address, Hash, TransactionReceipt } from 'viem';
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
export declare function useRadiusSend(): UseRadiusSendReturn;
//# sourceMappingURL=useRadiusSend.d.ts.map
