import {
  bytesToHex,
  type Hex,
  hexToBytes,
  keccak256 as viemKeccak256,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Address, type BytesLike } from '../common'
import type { SigningKey } from './types'

/**
 * Convert input to bytes.
 */
function toBytes(data: BytesLike): Uint8Array {
  if (data instanceof Uint8Array) {
    return data
  }
  if (typeof data === 'string') {
    const hex = data.startsWith('0x') ? data : `0x${data}`
    return hexToBytes(hex as Hex)
  }
  throw new Error('Invalid BytesLike input')
}

/**
 * Convert a hex string private key to a SigningKey.
 * Creates an account from the private key to extract the public key.
 * @param key Hex string of the private key (with or without 0x prefix)
 * @returns SigningKey containing both public and private keys
 */
export function hexToSigningKey(key: string): SigningKey {
  const formattedKey = (key.startsWith('0x') ? key : `0x${key}`) as Hex
  const account = privateKeyToAccount(formattedKey)

  // Get the public key from the account (viem accounts expose publicKey)
  const publicKeyHex = account.publicKey

  return {
    publicKey: hexToBytes(publicKeyHex),
    privateKey: hexToBytes(formattedKey),
  }
}

/**
 * Calculate the Keccak256 hash of the input data.
 * This is the hashing algorithm used by Ethereum for various cryptographic operations.
 * @param data Input data as a single value or an array of values to be concatenated before hashing
 * @returns Keccak256 hash as a Uint8Array
 */
export function keccak256(data: BytesLike | BytesLike[]): Uint8Array {
  if (Array.isArray(data)) {
    // Concatenate all byte arrays
    const totalLength = data.reduce((sum, d) => sum + toBytes(d).length, 0)
    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const d of data) {
      const bytes = toBytes(d)
      combined.set(bytes, offset)
      offset += bytes.length
    }
    const hash = viemKeccak256(bytesToHex(combined))
    return hexToBytes(hash)
  }
  const hash = viemKeccak256(bytesToHex(toBytes(data)))
  return hexToBytes(hash)
}

/**
 * Convert a public key to an account address.
 * The address is derived by taking the Keccak256 hash of the public key
 * (without the prefix byte) and keeping the last 20 bytes.
 * @param publicKey Public key as BytesLike
 * @returns Account address as an Address object
 */
export function pubkeyToAddress(publicKey: BytesLike): Address {
  const bytes = toBytes(publicKey)
  // Remove the prefix byte (0x04 for uncompressed public keys)
  const keyWithoutPrefix = bytes.slice(1)
  const hash = viemKeccak256(bytesToHex(keyWithoutPrefix))
  // Take the last 20 bytes (40 hex chars)
  const addressHex = `0x${hash.slice(-40)}` as Hex
  return new Address(addressHex)
}

/**
 * Sign a digest hash with a signing key.
 * The signature is in the Ethereum format: [R || S || V] where V is 0 or 1.
 * @param digestHash Digest hash to sign (typically a Keccak256 hash)
 * @param key Signing key containing the private key
 * @returns The signature as a Uint8Array
 */
export async function sign(
  digestHash: BytesLike,
  key: SigningKey,
): Promise<Uint8Array> {
  const privateKeyHex = bytesToHex(key.privateKey) as Hex
  const account = privateKeyToAccount(privateKeyHex)
  const hashHex = bytesToHex(toBytes(digestHash)) as Hex

  // Sign the raw message hash
  const signature = await account.signMessage({
    message: { raw: hashHex },
  })

  return hexToBytes(signature)
}
