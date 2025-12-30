import type { Address } from 'viem';
export type UseRadiusBalanceParams = {
  address?: Address;
};
export declare function useRadiusBalance(
  params?: UseRadiusBalanceParams
): import('wagmi').UseBalanceReturnType<{
  decimals: number;
  symbol: string;
  value: bigint;
}>;
//# sourceMappingURL=useRadiusBalance.d.ts.map
