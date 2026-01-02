import type { Address, BytesLike } from './address';
import type { Hex } from 'viem';
/**
 * BigNumberish represents values that can be converted to bigint
 * @deprecated Prefer using `bigint` directly for cleaner types
 */
export type BigNumberish = bigint | number | string;
/**
 * Transaction parameters for building unsigned transactions.
 * This interface represents the data needed to construct a Radius transaction.
 */
export interface TransactionParams {
    /** The call data for the transaction (bytecode for contract creation, or method call data) */
    data?: Hex;
    /** Maximum amount of gas units the transaction can consume */
    gas?: bigint;
    /** Price per gas unit in wei (typically 0n on Radius) */
    gasPrice?: bigint;
    /** Sequential transaction number for the sending account */
    nonce?: number;
    /** Destination address (undefined for contract creation) */
    to?: Address;
    /** Amount of native currency to send in wei */
    value?: bigint;
    /** Chain ID for EIP-155 replay protection */
    chainId?: number;
}
/**
 * Transaction represents an unsigned Radius EVM transaction.
 * Contains all the data needed to execute a Radius transaction.
 *
 * @deprecated Use TransactionParams interface instead for cleaner types.
 */
export declare class Transaction {
    /** The call data for the transaction */
    data: BytesLike;
    /** Maximum amount of gas units */
    gas: BigNumberish;
    /** Price per gas unit in wei */
    gasPrice: BigNumberish;
    /** Sequential transaction number */
    nonce?: number | undefined;
    /** Destination address */
    to?: Address;
    /** Amount of native currency in wei */
    value?: BigNumberish;
    constructor(data: BytesLike, gas: BigNumberish, gasPrice: BigNumberish, nonce?: number, to?: Address, value?: BigNumberish);
}
/**
 * SignedTransaction represents a cryptographically signed transaction
 * ready to be sent to Radius
 */
export declare class SignedTransaction {
    /**
     * RLP-encoded signed transaction bytes as hex string
     */
    readonly serialized: `0x${string}`;
    /**
     * Creates a new SignedTransaction
     * @param serialized The RLP-encoded signed transaction as hex string
     */
    constructor(serialized: `0x${string}`);
    /**
     * Returns the serialized transaction as a hex string
     */
    toString(): string;
}
//# sourceMappingURL=transaction.d.ts.map