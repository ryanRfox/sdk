'use client';
import { useAccount, useBalance } from 'wagmi';
export function useRadiusBalance(params = {}) {
    const { address: connectedAddress } = useAccount();
    const address = params.address ?? connectedAddress;
    return useBalance({
        address,
    });
}
//# sourceMappingURL=useRadiusBalance.js.map