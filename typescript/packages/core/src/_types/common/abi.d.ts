import type { BytesLike } from './address';
/**
 * ABI represents an Application Binary Interface for smart contracts.
 *
 * It provides methods for encoding and decoding contract method calls and return values,
 * which are essential for interacting with smart contracts deployed on Radius.
 */
export declare class ABI {
    /**
     * The underlying ABI definition
     * @private
     */
    private readonly abi;
    /**
     * Creates a new ABI instance from a JSON string representation.
     *
     * @param abiJSON String representing the ABI in JSON format
     * @throws Error if the JSON string is empty or invalid
     */
    constructor(abiJSON: string);
    /**
     * Pack encodes contract input data for method calls or constructor invocations.
     *
     * @param name Name of the method to call, or an empty string for constructor
     * @param args Variadic list of arguments for the method
     * @returns Encoded binary data ready for contract interaction
     * @throws Error if the method is not found or encoding fails
     */
    pack(name: string, ...args: unknown[]): Uint8Array;
    /**
     * Unpack decodes contract output data returned from a method call.
     *
     * @param name Name of the method that produced the output, or an empty string for constructor
     * @param data Encoded binary data received from the contract
     * @returns Array of decoded values representing the method's return values
     * @throws Error if the method is not found or decoding fails
     */
    unpack(name: string, data: BytesLike): unknown[];
}
//# sourceMappingURL=abi.d.ts.map