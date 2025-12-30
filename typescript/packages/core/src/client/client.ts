/**
 * Radius SDK Client - A viem-based client for interacting with the Radius platform.
 *
 * This module provides the primary interface for reading blockchain state,
 * sending transactions, deploying contracts, and interacting with smart contracts.
 */
import {
  type Abi,
  type AbiParameter,
  type Chain,
  createPublicClient,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionData,
  type Hash,
  type Hex,
  type PublicClient,
  type TransactionReceipt,
  type TransactionRequest,
  type Transport,
  type Address as ViemAddress,
} from 'viem'

/**
 * ABI constructor type definition.
 */
type AbiConstructor = {
  type: 'constructor'
  inputs: readonly AbiParameter[]
  stateMutability: 'nonpayable' | 'payable'
}

import type { RadiusSigner } from '../auth'
import {
  createInterceptingTransport,
  type Interceptor,
  type Logf,
} from '../transport'

/**
 * Maximum gas limit for transactions.
 * Used to cap gas estimates to prevent unexpectedly high costs.
 */
export const MAX_GAS = 1319413953330n

/**
 * Receipt returned from transaction execution.
 * Contains information about the transaction result.
 */
export interface RadiusReceipt {
  /** The transaction hash */
  transactionHash: Hash
  /** The sender address */
  from: ViemAddress
  /** The recipient address (or null for contract creation) */
  to: ViemAddress | null
  /** The created contract address (if any) */
  contractAddress: ViemAddress | null
  /** The amount of gas used */
  gasUsed: bigint
  /** The transaction status (1 for success, 0 for failure) */
  status: 'success' | 'reverted'
  /** The block number the transaction was included in */
  blockNumber: bigint
  /** The block hash */
  blockHash: Hash
  /** Transaction logs */
  logs: TransactionReceipt['logs']
}

/**
 * Configuration options for creating a RadiusClient.
 */
export interface RadiusClientConfig {
  /** The chain configuration (use radiusTestnet or radiusMainnet from @radiustechsystems/sdk/chains) */
  chain: Chain
  /** The viem transport to use (defaults to http transport based on chain config) */
  transport?: Transport
  /** Optional response interceptor for modifying or monitoring JSON-RPC responses */
  interceptor?: Interceptor
  /** Optional logger function for debugging request/response cycles */
  logger?: Logf
}

/**
 * Contract interface for the client's call and execute methods.
 * Must have an ABI and address for contract interactions.
 */
export interface ContractInstance {
  /** The contract's ABI */
  abi: Abi
  /** The contract's deployed address */
  address: ViemAddress
}

/**
 * The RadiusClient provides methods for interacting with the Radius platform.
 *
 * This is the main entry point for:
 * - Reading blockchain state (balances, contract data, chain info)
 * - Sending transactions (native transfers, contract calls)
 * - Deploying smart contracts
 *
 * @example
 * ```typescript
 * import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { http } from 'viem';
 *
 * const client = createRadiusClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // Get balance
 * const balance = await client.getBalance('0x...');
 *
 * // Send transaction
 * const signer = createPrivateKeySigner('0x...privateKey', radiusTestnet.id);
 * const receipt = await client.sendSync(signer, '0x...recipient', 1000000000000000000n);
 * ```
 */
export interface RadiusClient {
  /**
   * The underlying viem PublicClient for advanced operations.
   */
  readonly publicClient: PublicClient

  /**
   * Get the chain ID of the connected network.
   * @returns The chain ID as a bigint
   */
  getChainId(): Promise<bigint>

  /**
   * Get the balance of an address in wei.
   * @param address - The address to check
   * @returns The balance in wei
   */
  getBalance(address: ViemAddress): Promise<bigint>

  /**
   * Get the bytecode deployed at an address.
   * @param address - The contract address
   * @returns The bytecode as a hex string, or '0x' if no code
   */
  getCode(address: ViemAddress): Promise<Hex>

  /**
   * Get the pending nonce for an address.
   * @param address - The address to check
   * @returns The next nonce to use
   */
  getNonce(address: ViemAddress): Promise<number>

  /**
   * Estimate gas for a transaction.
   * Applies a 20% safety margin and caps at MAX_GAS.
   * @param tx - The transaction parameters
   * @returns The estimated gas with safety margin
   */
  estimateGas(tx: TransactionRequest): Promise<bigint>

  /**
   * Call a read-only contract method (does not create a transaction).
   * @param contract - The contract instance with ABI and address
   * @param method - The method name to call
   * @param args - Arguments to pass to the method
   * @returns The decoded return value(s) from the contract
   */
  call<T = unknown>(
    contract: ContractInstance,
    method: string,
    ...args: unknown[]
  ): Promise<T>

  /**
   * Execute a state-changing contract method.
   * Returns immediately after the transaction is sent (does not wait for receipt).
   * @param contract - The contract instance with ABI and address
   * @param signer - The signer to sign the transaction
   * @param method - The method name to execute
   * @param args - Arguments to pass to the method
   * @returns The transaction hash
   */
  execute(
    contract: ContractInstance,
    signer: RadiusSigner,
    method: string,
    ...args: unknown[]
  ): Promise<Hash>

  /**
   * Execute a state-changing contract method and wait for the receipt.
   * @param contract - The contract instance with ABI and address
   * @param signer - The signer to sign the transaction
   * @param method - The method name to execute
   * @param args - Arguments to pass to the method
   * @returns The transaction receipt
   */
  executeSync(
    contract: ContractInstance,
    signer: RadiusSigner,
    method: string,
    ...args: unknown[]
  ): Promise<RadiusReceipt>

  /**
   * Send native currency to an address.
   * Returns immediately after the transaction is sent (does not wait for receipt).
   * @param signer - The signer to sign the transaction
   * @param to - The recipient address
   * @param value - The amount to send in wei
   * @returns The transaction hash
   */
  send(signer: RadiusSigner, to: ViemAddress, value: bigint): Promise<Hash>

  /**
   * Send native currency to an address and wait for the receipt.
   * @param signer - The signer to sign the transaction
   * @param to - The recipient address
   * @param value - The amount to send in wei
   * @returns The transaction receipt
   */
  sendSync(
    signer: RadiusSigner,
    to: ViemAddress,
    value: bigint,
  ): Promise<RadiusReceipt>

  /**
   * Deploy a smart contract.
   * @param signer - The signer to sign the deployment transaction
   * @param bytecode - The contract bytecode
   * @param abi - The contract ABI
   * @param args - Constructor arguments (if any)
   * @returns The deployed contract address and transaction receipt
   */
  deployContract(
    signer: RadiusSigner,
    bytecode: Hex,
    abi: Abi,
    ...args: unknown[]
  ): Promise<{ address: ViemAddress; receipt: RadiusReceipt }>

  /**
   * Send a raw signed transaction.
   * Returns immediately after the transaction is sent.
   * @param signedTx - The signed transaction as a hex string
   * @returns The transaction hash
   */
  sendRawTransaction(signedTx: Hex): Promise<Hash>

  /**
   * Wait for a transaction receipt.
   * @param hash - The transaction hash to wait for
   * @returns The transaction receipt
   */
  waitForReceipt(hash: Hash): Promise<RadiusReceipt>
}

/**
 * Creates a new RadiusClient instance.
 *
 * @param config - Configuration options for the client
 * @returns A RadiusClient instance
 *
 * @example
 * ```typescript
 * import { createRadiusClient } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 * import { http } from 'viem';
 *
 * // Basic usage
 * const client = createRadiusClient({
 *   chain: radiusTestnet,
 *   transport: http(),
 * });
 *
 * // With logging
 * const clientWithLogging = createRadiusClient({
 *   chain: radiusTestnet,
 *   logger: console.log,
 * });
 *
 * // With custom interceptor
 * const clientWithInterceptor = createRadiusClient({
 *   chain: radiusTestnet,
 *   interceptor: async (reqBody, response) => {
 *     // Custom response handling
 *     return response;
 *   },
 * });
 * ```
 */
export function createRadiusClient(config: RadiusClientConfig): RadiusClient {
  // Create transport - use provided transport or create intercepting transport if logger/interceptor provided
  let transport: Transport
  if (config.transport) {
    transport = config.transport
  } else if (config.logger || config.interceptor) {
    const rpcUrl = config.chain.rpcUrls.default.http[0]
    if (!rpcUrl) {
      throw new Error('No RPC URL configured for chain')
    }
    transport = createInterceptingTransport({
      url: rpcUrl,
      interceptor: config.interceptor,
      logger: config.logger,
    })
  } else {
    // Create a basic http transport using the intercepting transport without logger/interceptor
    const rpcUrl = config.chain.rpcUrls.default.http[0]
    if (!rpcUrl) {
      throw new Error('No RPC URL configured for chain')
    }
    transport = createInterceptingTransport({ url: rpcUrl })
  }

  const publicClient = createPublicClient({
    chain: config.chain,
    transport,
  })

  /**
   * Convert a viem TransactionReceipt to RadiusReceipt
   */
  function toRadiusReceipt(receipt: TransactionReceipt): RadiusReceipt {
    return {
      transactionHash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to ?? null,
      contractAddress: receipt.contractAddress ?? null,
      gasUsed: receipt.gasUsed,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      logs: receipt.logs,
    }
  }

  /**
   * Sign and send a transaction
   */
  async function signAndSendTransaction(
    signer: RadiusSigner,
    tx: {
      to?: ViemAddress
      data?: Hex
      value?: bigint
      gas?: bigint
    },
  ): Promise<Hash> {
    // Get nonce
    const nonce = await publicClient.getTransactionCount({
      address: signer.address,
      blockTag: 'pending',
    })

    // Estimate gas if not provided
    let gas: bigint
    if (tx.gas !== undefined) {
      gas = tx.gas
    } else {
      const estimate = await publicClient.estimateGas({
        account: signer.address,
        to: tx.to,
        data: tx.data,
        value: tx.value,
      })
      // Apply 20% safety margin
      const margin = estimate / 5n
      gas = estimate + margin
      // Cap at MAX_GAS
      if (gas > MAX_GAS) {
        gas = MAX_GAS
      }
    }

    // Sign the transaction
    const signedTx = await signer.signTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value ?? 0n,
      nonce,
      gas,
      gasPrice: 0n, // Radius uses zero gas price
      chainId: signer.chainId,
    })

    // Send the signed transaction
    return publicClient.sendRawTransaction({
      serializedTransaction: signedTx,
    })
  }

  return {
    publicClient,

    async getChainId(): Promise<bigint> {
      return BigInt(publicClient.chain?.id ?? (await publicClient.getChainId()))
    },

    async getBalance(address: ViemAddress): Promise<bigint> {
      return publicClient.getBalance({ address })
    },

    async getCode(address: ViemAddress): Promise<Hex> {
      const code = await publicClient.getCode({ address })
      return code ?? '0x'
    },

    async getNonce(address: ViemAddress): Promise<number> {
      return publicClient.getTransactionCount({
        address,
        blockTag: 'pending',
      })
    },

    async estimateGas(tx: TransactionRequest): Promise<bigint> {
      const estimate = await publicClient.estimateGas(tx)
      // Apply 20% safety margin
      const margin = estimate / 5n
      const gas = estimate + margin
      // Cap at MAX_GAS
      return gas > MAX_GAS ? MAX_GAS : gas
    },

    async call<T = unknown>(
      contract: ContractInstance,
      method: string,
      ...args: unknown[]
    ): Promise<T> {
      if (!contract.abi) {
        throw new Error('Contract ABI is required')
      }
      if (!contract.address) {
        throw new Error('Contract address is required')
      }

      // Encode the function call
      const data = encodeFunctionData({
        abi: contract.abi,
        functionName: method,
        args: args as readonly unknown[],
      })

      // Make the call
      const result = await publicClient.call({
        to: contract.address,
        data,
      })

      if (!result.data) {
        throw new Error('No data returned from contract call')
      }

      // Decode the result
      const decoded = decodeFunctionResult({
        abi: contract.abi,
        functionName: method,
        data: result.data,
      })

      return decoded as T
    },

    async execute(
      contract: ContractInstance,
      signer: RadiusSigner,
      method: string,
      ...args: unknown[]
    ): Promise<Hash> {
      if (!contract.abi) {
        throw new Error('Contract ABI is required')
      }
      if (!contract.address) {
        throw new Error('Contract address is required')
      }

      // Encode the function call
      const data = encodeFunctionData({
        abi: contract.abi,
        functionName: method,
        args: args as readonly unknown[],
      })

      return signAndSendTransaction(signer, {
        to: contract.address,
        data,
        value: 0n,
      })
    },

    async executeSync(
      contract: ContractInstance,
      signer: RadiusSigner,
      method: string,
      ...args: unknown[]
    ): Promise<RadiusReceipt> {
      const hash = await this.execute(contract, signer, method, ...args)
      return this.waitForReceipt(hash)
    },

    async send(
      signer: RadiusSigner,
      to: ViemAddress,
      value: bigint,
    ): Promise<Hash> {
      return signAndSendTransaction(signer, {
        to,
        value,
      })
    },

    async sendSync(
      signer: RadiusSigner,
      to: ViemAddress,
      value: bigint,
    ): Promise<RadiusReceipt> {
      const hash = await this.send(signer, to, value)
      return this.waitForReceipt(hash)
    },

    async deployContract(
      signer: RadiusSigner,
      bytecode: Hex,
      abi: Abi,
      ...args: unknown[]
    ): Promise<{ address: ViemAddress; receipt: RadiusReceipt }> {
      // Encode constructor arguments if any
      let deployData: Hex = bytecode
      if (args.length > 0) {
        // Find the constructor in the ABI
        const ctorItem = abi.find(
          (item): item is AbiConstructor =>
            typeof item === 'object' &&
            item !== null &&
            'type' in item &&
            item.type === 'constructor',
        )
        if (ctorItem?.inputs && ctorItem.inputs.length > 0) {
          const encodedArgs = encodeAbiParameters(
            ctorItem.inputs,
            args as readonly unknown[],
          )
          // Append constructor args to bytecode (remove 0x prefix from encoded args)
          deployData = `${bytecode}${encodedArgs.slice(2)}` as Hex
        }
      }

      // Send deployment transaction (to is undefined for contract creation)
      const hash = await signAndSendTransaction(signer, {
        data: deployData,
        value: 0n,
      })

      // Wait for receipt
      const receipt = await this.waitForReceipt(hash)

      if (!receipt.contractAddress) {
        throw new Error(
          'Contract deployment failed: no contract address in receipt',
        )
      }

      if (receipt.status !== 'success') {
        throw new Error('Contract deployment failed: transaction reverted')
      }

      return {
        address: receipt.contractAddress,
        receipt,
      }
    },

    async sendRawTransaction(signedTx: Hex): Promise<Hash> {
      return publicClient.sendRawTransaction({
        serializedTransaction: signedTx,
      })
    },

    async waitForReceipt(hash: Hash): Promise<RadiusReceipt> {
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return toRadiusReceipt(receipt)
    },
  }
}

// Re-export commonly used viem types for convenience
export type { Chain, Transport, Abi, Hash, Hex, TransactionReceipt }
export type { ViemAddress as Address }
