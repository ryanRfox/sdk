'use client';

import type { Address } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export type UseRadiusBalanceParams = {
  address?: Address;
};

export function useRadiusBalance(params: UseRadiusBalanceParams = {}) {
  const { address: connectedAddress } = useAccount();
  const address = params.address ?? connectedAddress;

  return useBalance({
    address,
  });
}
