/**
 * Creates a typed contract instance with autocomplete support.
 *
 * @param client - The RadiusClient instance
 * @param params - The contract address and ABI
 * @returns A typed contract with read and write namespaces
 *
 * @example
 * ```typescript
 * import { createRadiusClient, getContract } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createRadiusClient({ chain: radiusTestnet });
 *
 * const erc20Abi = [
 *   { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
 *   { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
 * ] as const;
 *
 * const token = getContract(client, {
 *   address: '0x...',
 *   abi: erc20Abi,
 * });
 *
 * // Read - autocomplete shows balanceOf
 * const balance = await token.read.balanceOf(['0x...']);
 *
 * // Write - autocomplete shows transfer
 * const receipt = await token.write.transfer({
 *   args: ['0x...', 1000000n],
 *   signer: account,
 * });
 * ```
 */
export function getContract(client, params) {
    const { address, abi } = params;
    const contract = { address, abi };
    // Create read proxy
    const read = new Proxy({}, {
        get(_target, functionName) {
            return async (...callArgs) => {
                // If args were passed as an array in the first position, spread them
                const args = Array.isArray(callArgs[0]) ? callArgs[0] : callArgs;
                return client.call(contract, functionName, ...args);
            };
        },
    });
    // Create write proxy
    const write = new Proxy({}, {
        get(_target, functionName) {
            return async (params) => {
                const { args = [], signer, options = {} } = params;
                const { wait = true } = options;
                if (wait) {
                    return client.executeAndWait(contract, signer, functionName, ...args);
                }
                return client.execute(contract, signer, functionName, ...args);
            };
        },
    });
    return {
        address,
        abi,
        read,
        write,
    };
}
//# sourceMappingURL=typedContract.js.map