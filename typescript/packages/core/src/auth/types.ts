/**
 * The auth types module defines interfaces for signing transactions and messages.
 * It provides the foundation for different signer implementations using viem.
 */
import type { Hex, SignableMessage, TransactionSerializable } from 'viem';

/**
 * RadiusSigner interface for cryptographically signing messages and transactions.
 * Different implementations provide different mechanisms for accessing private keys.
 * This interface is compatible with viem's account utilities.
 */
export interface RadiusSigner {
  /**
   * The Radius account address associated with the Signer.
   * Returns a checksummed Ethereum address.
   */
  readonly address: `0x${string}`;

  /**
   * The Chain ID associated with the Signer.
   * Used for EIP-155 transaction signing to prevent replay attacks.
   */
  readonly chainId: number;

  /**
   * Signs a message using the EIP-191 standard.
   * @param message - The message to sign (string, bytes, or structured data)
   * @returns The signature as a hex string
   * @throws Error if signing fails
   */
  signMessage(message: SignableMessage): Promise<Hex>;

  /**
   * Signs a transaction using the EIP-155 standard.
   * @param tx - The transaction to sign
   * @returns The signed transaction as a hex string
   * @throws Error if signing fails
   */
  signTransaction(tx: TransactionSerializable): Promise<Hex>;
}

/**
 * Configuration options for creating a ClefSigner.
 */
export interface ClefSignerConfig {
  /**
   * The address to use for signing.
   * Must be an account managed by the Clef instance.
   */
  address: `0x${string}`;

  /**
   * The chain ID for transaction signing.
   */
  chainId: number;

  /**
   * The URL of the Clef JSON-RPC server.
   * @example "http://localhost:8550"
   */
  clefUrl: string;
}

/**
 * Configuration options for creating a PrivateKeySigner.
 */
export interface PrivateKeySignerConfig {
  /**
   * The private key as a hex string.
   * Should be 32 bytes (64 hex characters) with optional 0x prefix.
   */
  privateKey: Hex;

  /**
   * The chain ID for transaction signing.
   */
  chainId: number;
}
