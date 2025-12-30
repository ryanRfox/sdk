import {
  type Abi,
  type Hex,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionData,
  hexToBytes,
} from 'viem';
import type { BytesLike } from './address';

/**
 * ABI represents an Application Binary Interface for smart contracts.
 *
 * It provides methods for encoding and decoding contract method calls and return values,
 * which are essential for interacting with smart contracts deployed on Radius.
 */
export class ABI {
  /**
   * The underlying ABI definition
   * @private
   */
  private readonly abi: Abi;

  /**
   * Creates a new ABI instance from a JSON string representation.
   *
   * @param abiJSON String representing the ABI in JSON format
   * @throws Error if the JSON string is empty or invalid
   */
  constructor(abiJSON: string) {
    if (!abiJSON) {
      throw new Error('ABI JSON string is empty');
    }

    this.abi = JSON.parse(abiJSON) as Abi;
  }

  /**
   * Pack encodes contract input data for method calls or constructor invocations.
   *
   * @param name Name of the method to call, or an empty string for constructor
   * @param args Variadic list of arguments for the method
   * @returns Encoded binary data ready for contract interaction
   * @throws Error if the method is not found or encoding fails
   */
  pack(name: string, ...args: unknown[]): Uint8Array {
    // Special case for constructor
    if (name === '') {
      // Find constructor in ABI
      const ctorItem = this.abi.find((item) => item.type === 'constructor');
      if (!ctorItem || ctorItem.type !== 'constructor') {
        // No constructor defined, return empty bytes
        return new Uint8Array(0);
      }
      // Encode constructor parameters
      const encoded = encodeAbiParameters(ctorItem.inputs, args as readonly unknown[]);
      return hexToBytes(encoded);
    }

    // Regular method call
    const encoded = encodeFunctionData({
      abi: this.abi,
      functionName: name,
      args: args as readonly unknown[],
    });
    return hexToBytes(encoded);
  }

  /**
   * Unpack decodes contract output data returned from a method call.
   *
   * @param name Name of the method that produced the output, or an empty string for constructor
   * @param data Encoded binary data received from the contract
   * @returns Array of decoded values representing the method's return values
   * @throws Error if the method is not found or decoding fails
   */
  unpack(name: string, data: BytesLike): unknown[] {
    // Special case for constructor which has no return value
    if (name === '') {
      return [];
    }

    try {
      // Convert data to Hex if it's a Uint8Array
      let hexData: Hex;
      if (data instanceof Uint8Array) {
        hexData = `0x${Array.from(data)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')}` as Hex;
      } else if (typeof data === 'string') {
        hexData = (data.startsWith('0x') ? data : `0x${data}`) as Hex;
      } else {
        hexData = data as Hex;
      }

      const result = decodeFunctionResult({
        abi: this.abi,
        functionName: name,
        data: hexData,
      });

      // decodeFunctionResult returns a single value or an array
      if (Array.isArray(result)) {
        return result;
      }
      return [result];
    } catch (error) {
      throw new Error(
        `Failed to unpack ABI data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
