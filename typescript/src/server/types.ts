import type {
  Router,
  RouterOptions,
} from '@remix-run/fetch-router'
import type { LocalAccount } from 'viem/accounts'
import type { Chain, Client, Transport } from 'viem'
// Forward reference: Kv will be implemented in 1.5
import type { Kv } from './Kv.js'

/**
 * A Router with a listener property for handling HTTP requests.
 * The listener can be used in Node.js servers, Express apps, Hono, Bun, and other runtimes.
 */
export type Handler = Router & {
  listener: (req: any, res: any) => void
}

/**
 * Base options for all handler types.
 * Extends RouterOptions with optional headers.
 */
export type HandlerOptions = RouterOptions & {
  /** Optional headers to add to all responses. */
  headers?: Headers | Record<string, string> | undefined
}

/**
 * Options for the feePayer handler.
 * Allows configuring a fee payer service that can sponsor transaction fees.
 */
export type FeePayerOptions = HandlerOptions & {
  /** The account to use as the fee payer. */
  account: LocalAccount
  /** Optional callback to invoke before handling each request. */
  onRequest?: (request: unknown) => Promise<void>
  /** The path prefix for the fee payer endpoints. */
  path?: string | undefined
} & (
  | {
      /** A pre-configured viem client. */
      client: Client
    }
  | {
      /** The blockchain chain to use. */
      chain: Chain
      /** The transport configuration for the chain. */
      transport: Transport
    }
)

/**
 * Options for the keyManager handler.
 * Configures a WebAuthn-based key management service for credential storage and retrieval.
 */
export type KeyManagerOptions = HandlerOptions & {
  /** The KV store to use for storing credentials and challenges. */
  kv: Kv
  /** The path prefix for the key manager endpoints. */
  path?: string | undefined
  /** The relying party identifier for WebAuthn. Can be a string (used as both id and name) or an object with id and optional name. */
  rp?:
    | string
    | {
        id: string
        name?: string | undefined
      }
    | undefined
}

/**
 * Options for composing multiple handlers.
 * Allows mounting handlers at specific path prefixes.
 */
export type ComposeOptions = HandlerOptions & {
  /** The path prefix to mount the composed handlers at. */
  path?: string | undefined
}
