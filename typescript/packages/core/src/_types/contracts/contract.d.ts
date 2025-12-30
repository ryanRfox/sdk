import type { RadiusSigner } from '../auth';
import type { ABI, Address, Receipt } from '../common';
import type { ContractClient } from './types';
/**
 * Contract class for interacting with smart contracts on Radius.
 * Provides methods to call read-only methods and execute state-changing methods.
 * The class handles method encoding, parameter serialization, and result decoding
 * according to the contract's ABI specification.
 */
export declare class Contract {
    /**
     * The contract's ABI (Application Binary Interface)
     * Used for encoding and decoding method calls and return values
     */
    readonly abi: ABI;
    /**
     * The contract's address on Radius
     * @private
     */
    private readonly _address;
    /**
     * Create a new Contract instance.
     * @param address Contract address
     * @param abi Contract ABI
     */
    constructor(address: Address, abi: ABI);
    /**
     * Get the contract address.
     * @returns The contract address
     */
    address(): Address;
    /**
     * Calls a read-only contract method without creating a transaction
     * @param client Radius client instance used to make the call
     * @param method Name of the method to call on the contract
     * @param args Arguments to pass to the contract method
     * @returns Array of decoded return values from the contract method
     * @throws Error if the contract ABI is missing
     * @throws Error if the contract address is missing or zero
     * @throws Error if the contract method call fails
     */
    call(client: ContractClient, method: string, ...args: unknown[]): Promise<unknown[]>;
    /**
     * Executes a contract method that modifies Radius state
     * @param client Radius client instance used to execute the transaction
     * @param signer The signer used to sign the transaction
     * @param method Name of the method to execute on the contract
     * @param args Arguments to pass to the contract method
     * @returns Transaction receipt after the method execution
     * @throws Error if the contract ABI is missing
     * @throws Error if the contract address is missing or zero
     * @throws Error if the transaction fails or is reverted
     * @throws Error if the transaction receipt is not returned
     */
    execute(client: ContractClient, signer: RadiusSigner, method: string, ...args: unknown[]): Promise<Receipt>;
}
//# sourceMappingURL=contract.d.ts.map