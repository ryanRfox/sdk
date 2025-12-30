import {
  type Account,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
  type WalletClient,
} from 'viem';
/**
 * Standard ERC-20 ABI definition using viem's parseAbi.
 * Includes all standard ERC-20 functions and events.
 */
export declare const ERC20_ABI: readonly [
  {
    readonly name: 'name';
    readonly type: 'function';
    readonly stateMutability: 'view';
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly type: 'string';
      },
    ];
  },
  {
    readonly name: 'symbol';
    readonly type: 'function';
    readonly stateMutability: 'view';
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly type: 'string';
      },
    ];
  },
  {
    readonly name: 'decimals';
    readonly type: 'function';
    readonly stateMutability: 'view';
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly type: 'uint8';
      },
    ];
  },
  {
    readonly name: 'totalSupply';
    readonly type: 'function';
    readonly stateMutability: 'view';
    readonly inputs: readonly [];
    readonly outputs: readonly [
      {
        readonly type: 'uint256';
      },
    ];
  },
  {
    readonly name: 'balanceOf';
    readonly type: 'function';
    readonly stateMutability: 'view';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'owner';
      },
    ];
    readonly outputs: readonly [
      {
        readonly type: 'uint256';
      },
    ];
  },
  {
    readonly name: 'transfer';
    readonly type: 'function';
    readonly stateMutability: 'nonpayable';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'to';
      },
      {
        readonly type: 'uint256';
        readonly name: 'amount';
      },
    ];
    readonly outputs: readonly [
      {
        readonly type: 'bool';
      },
    ];
  },
  {
    readonly name: 'approve';
    readonly type: 'function';
    readonly stateMutability: 'nonpayable';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'spender';
      },
      {
        readonly type: 'uint256';
        readonly name: 'amount';
      },
    ];
    readonly outputs: readonly [
      {
        readonly type: 'bool';
      },
    ];
  },
  {
    readonly name: 'allowance';
    readonly type: 'function';
    readonly stateMutability: 'view';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'owner';
      },
      {
        readonly type: 'address';
        readonly name: 'spender';
      },
    ];
    readonly outputs: readonly [
      {
        readonly type: 'uint256';
      },
    ];
  },
  {
    readonly name: 'transferFrom';
    readonly type: 'function';
    readonly stateMutability: 'nonpayable';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'from';
      },
      {
        readonly type: 'address';
        readonly name: 'to';
      },
      {
        readonly type: 'uint256';
        readonly name: 'amount';
      },
    ];
    readonly outputs: readonly [
      {
        readonly type: 'bool';
      },
    ];
  },
  {
    readonly name: 'Transfer';
    readonly type: 'event';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'from';
        readonly indexed: true;
      },
      {
        readonly type: 'address';
        readonly name: 'to';
        readonly indexed: true;
      },
      {
        readonly type: 'uint256';
        readonly name: 'value';
      },
    ];
  },
  {
    readonly name: 'Approval';
    readonly type: 'event';
    readonly inputs: readonly [
      {
        readonly type: 'address';
        readonly name: 'owner';
        readonly indexed: true;
      },
      {
        readonly type: 'address';
        readonly name: 'spender';
        readonly indexed: true;
      },
      {
        readonly type: 'uint256';
        readonly name: 'value';
      },
    ];
  },
];
/**
 * Signer type that can be used for write operations.
 * Combines a WalletClient with an Account for transaction signing.
 */
export type ERC20Signer = {
  walletClient: WalletClient;
  account: Account;
};
/**
 * ERC20 class for interacting with ERC-20 token contracts on Radius.
 * Provides convenient methods for all standard ERC-20 operations including
 * reading token metadata, checking balances and allowances, and executing
 * transfers and approvals.
 *
 * Read operations use the provided PublicClient, while write operations
 * require an ERC20Signer with a WalletClient and Account.
 */
export declare class ERC20 {
  /**
   * The token contract address
   */
  readonly address: `0x${string}`;
  /**
   * The public client used for read operations
   * @private
   */
  private readonly publicClient;
  /**
   * Cached token decimals
   * @private
   */
  private _decimals?;
  /**
   * Cached token symbol
   * @private
   */
  private _symbol?;
  /**
   * Cached token name
   * @private
   */
  private _name?;
  /**
   * Creates a new ERC20 instance for interacting with a token contract.
   *
   * @param address The token contract address (must be a valid 0x-prefixed hex string)
   * @param publicClient The viem PublicClient to use for read operations
   */
  constructor(address: `0x${string}`, publicClient: PublicClient);
  /**
   * Gets the token name.
   * The result is cached after the first call.
   *
   * @returns The token name (e.g., "Wrapped Ether")
   * @throws Error if the contract call fails
   */
  name(): Promise<string>;
  /**
   * Gets the token symbol.
   * The result is cached after the first call.
   *
   * @returns The token symbol (e.g., "WETH")
   * @throws Error if the contract call fails
   */
  symbol(): Promise<string>;
  /**
   * Gets the number of decimals the token uses.
   * The result is cached after the first call.
   *
   * @returns The number of decimals (e.g., 18 for most tokens)
   * @throws Error if the contract call fails
   */
  decimals(): Promise<number>;
  /**
   * Gets the total token supply.
   *
   * @returns The total supply as a bigint (in the smallest unit)
   * @throws Error if the contract call fails
   */
  totalSupply(): Promise<bigint>;
  /**
   * Gets the token balance of an address.
   *
   * @param owner The address to check the balance for
   * @returns The balance as a bigint (in the smallest unit)
   * @throws Error if the contract call fails
   */
  balanceOf(owner: `0x${string}`): Promise<bigint>;
  /**
   * Gets the allowance that an owner has granted to a spender.
   *
   * @param owner The address that owns the tokens
   * @param spender The address that is allowed to spend the tokens
   * @returns The allowance as a bigint (in the smallest unit)
   * @throws Error if the contract call fails
   */
  allowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
  /**
   * Transfers tokens to another address.
   * Returns immediately with the transaction hash without waiting for confirmation.
   *
   * @param signer The signer containing the wallet client and account
   * @param to The recipient address
   * @param amount The amount to transfer (in the smallest unit)
   * @returns The transaction hash
   * @throws Error if the transaction fails to submit
   */
  transfer(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<Hash>;
  /**
   * Transfers tokens to another address and waits for the transaction receipt.
   * Blocks until the transaction is confirmed.
   *
   * @param signer The signer containing the wallet client and account
   * @param to The recipient address
   * @param amount The amount to transfer (in the smallest unit)
   * @returns The transaction receipt
   * @throws Error if the transaction fails
   */
  transferSync(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;
  /**
   * Approves a spender to transfer tokens on behalf of the owner.
   * Returns immediately with the transaction hash without waiting for confirmation.
   *
   * @param signer The signer containing the wallet client and account
   * @param spender The address to approve
   * @param amount The amount to approve (in the smallest unit)
   * @returns The transaction hash
   * @throws Error if the transaction fails to submit
   */
  approve(signer: ERC20Signer, spender: `0x${string}`, amount: bigint): Promise<Hash>;
  /**
   * Approves a spender to transfer tokens and waits for the transaction receipt.
   * Blocks until the transaction is confirmed.
   *
   * @param signer The signer containing the wallet client and account
   * @param spender The address to approve
   * @param amount The amount to approve (in the smallest unit)
   * @returns The transaction receipt
   * @throws Error if the transaction fails
   */
  approveSync(
    signer: ERC20Signer,
    spender: `0x${string}`,
    amount: bigint
  ): Promise<TransactionReceipt>;
  /**
   * Transfers tokens from one address to another using an allowance.
   * The caller must have been approved by the `from` address.
   * Returns immediately with the transaction hash without waiting for confirmation.
   *
   * @param signer The signer containing the wallet client and account
   * @param from The address to transfer from
   * @param to The address to transfer to
   * @param amount The amount to transfer (in the smallest unit)
   * @returns The transaction hash
   * @throws Error if the transaction fails to submit
   */
  transferFrom(
    signer: ERC20Signer,
    from: `0x${string}`,
    to: `0x${string}`,
    amount: bigint
  ): Promise<Hash>;
  /**
   * Transfers tokens from one address to another and waits for the transaction receipt.
   * The caller must have been approved by the `from` address.
   * Blocks until the transaction is confirmed.
   *
   * @param signer The signer containing the wallet client and account
   * @param from The address to transfer from
   * @param to The address to transfer to
   * @param amount The amount to transfer (in the smallest unit)
   * @returns The transaction receipt
   * @throws Error if the transaction fails
   */
  transferFromSync(
    signer: ERC20Signer,
    from: `0x${string}`,
    to: `0x${string}`,
    amount: bigint
  ): Promise<TransactionReceipt>;
  /**
   * Formats a token amount from the smallest unit to a human-readable string.
   * Uses the token's decimals for formatting.
   *
   * @param amount The amount in the smallest unit (e.g., wei for 18-decimal tokens)
   * @returns The formatted amount as a string (e.g., "1.5" for 1.5 tokens)
   * @throws Error if decimals cannot be fetched
   *
   * @example
   * // For a token with 18 decimals:
   * const formatted = await erc20.formatAmount(1500000000000000000n);
   * // Returns "1.5"
   */
  formatAmount(amount: bigint): Promise<string>;
  /**
   * Parses a human-readable token amount to the smallest unit.
   * Uses the token's decimals for parsing.
   *
   * @param amount The human-readable amount as a string (e.g., "1.5")
   * @returns The amount in the smallest unit as a bigint
   * @throws Error if decimals cannot be fetched
   * @throws Error if the amount string is invalid
   *
   * @example
   * // For a token with 18 decimals:
   * const parsed = await erc20.parseAmount("1.5");
   * // Returns 1500000000000000000n
   */
  parseAmount(amount: string): Promise<bigint>;
  /**
   * Clears the cached metadata (name, symbol, decimals).
   * Call this if the token contract has been upgraded or if you need fresh data.
   */
  clearCache(): void;
}
/**
 * Factory function to create an ERC20 instance.
 * Provides a convenient way to instantiate the ERC20 class.
 *
 * @param address The token contract address (must be a valid 0x-prefixed hex string)
 * @param publicClient The viem PublicClient to use for read operations
 * @returns A new ERC20 instance
 *
 * @example
 * import { createPublicClient, http } from 'viem';
 * import { mainnet } from 'viem/chains';
 * import { createERC20 } from '@radiustechsystems/sdk';
 *
 * const publicClient = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * });
 *
 * const usdc = createERC20('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', publicClient);
 * const balance = await usdc.balanceOf('0x...');
 */
export declare function createERC20(address: `0x${string}`, publicClient: PublicClient): ERC20;
//# sourceMappingURL=erc20.d.ts.map
