import type { Address, BytesLike } from './address'

/**
 * BigNumberish represents values that can be converted to bigint
 */
export type BigNumberish = bigint | number | string

/**
 * Transaction represents an unsigned Radius EVM transaction
 * Contains all the data needed to execute a Radius transaction
 */
export class Transaction {
  /**
   * The call data for the transaction (bytecode for contract creation, or method call data)
   */
  data: BytesLike

  /**
   * Maximum amount of gas units the transaction can consume
   */
  gas: BigNumberish

  /**
   * Price per gas unit in wei
   */
  gasPrice: BigNumberish

  /**
   * Sequential transaction number for the sending account
   */
  nonce?: number | undefined

  /**
   * Destination address (undefined for contract creation)
   */
  to?: Address

  /**
   * Amount of native currency to send in wei
   */
  value?: BigNumberish

  /**
   * Creates a new unsigned transaction
   * @param data The calldata for the transaction
   * @param gas Maximum amount of gas units the transaction can consume
   * @param gasPrice Price per gas unit in wei
   * @param nonce Sequential transaction number for the sending account
   * @param to Destination address (undefined for contract creation)
   * @param value Amount of native currency to send in wei
   */
  constructor(
    data: BytesLike,
    gas: BigNumberish,
    gasPrice: BigNumberish,
    nonce?: number,
    to?: Address,
    value?: BigNumberish,
  ) {
    this.data = data
    this.gas = gas
    this.gasPrice = gasPrice
    this.nonce = nonce
    this.to = to
    this.value = value
  }
}

/**
 * SignedTransaction represents a cryptographically signed transaction
 * ready to be sent to Radius
 */
export class SignedTransaction {
  /**
   * RLP-encoded signed transaction bytes as hex string
   */
  readonly serialized: `0x${string}`

  /**
   * Creates a new SignedTransaction
   * @param serialized The RLP-encoded signed transaction as hex string
   */
  constructor(serialized: `0x${string}`) {
    this.serialized = serialized
  }

  /**
   * Returns the serialized transaction as a hex string
   */
  toString(): string {
    return this.serialized
  }
}
