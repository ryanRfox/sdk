import {
  type Account,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
  type WalletClient,
  formatUnits,
  parseAbi,
  parseUnits,
} from 'viem';

/**
 * Standard ERC-20 ABI definition using viem's parseAbi.
 * Includes all standard ERC-20 functions and events.
 */
export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);

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
export class ERC20 {
  /**
   * The token contract address
   */
  readonly address: `0x${string}`;

  /**
   * The public client used for read operations
   * @private
   */
  private readonly publicClient: PublicClient;

  /**
   * Cached token decimals
   * @private
   */
  private _decimals?: number;

  /**
   * Cached token symbol
   * @private
   */
  private _symbol?: string;

  /**
   * Cached token name
   * @private
   */
  private _name?: string;

  /**
   * Creates a new ERC20 instance for interacting with a token contract.
   *
   * @param address The token contract address (must be a valid 0x-prefixed hex string)
   * @param publicClient The viem PublicClient to use for read operations
   */
  constructor(address: `0x${string}`, publicClient: PublicClient) {
    this.address = address;
    this.publicClient = publicClient;
  }

  // ============================================================================
  // Read Methods
  // ============================================================================

  /**
   * Gets the token name.
   * The result is cached after the first call.
   *
   * @returns The token name (e.g., "Wrapped Ether")
   * @throws Error if the contract call fails
   */
  async name(): Promise<string> {
    if (this._name !== undefined) {
      return this._name;
    }

    const name = await this.publicClient.readContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'name',
    });

    this._name = name;
    return name;
  }

  /**
   * Gets the token symbol.
   * The result is cached after the first call.
   *
   * @returns The token symbol (e.g., "WETH")
   * @throws Error if the contract call fails
   */
  async symbol(): Promise<string> {
    if (this._symbol !== undefined) {
      return this._symbol;
    }

    const symbol = await this.publicClient.readContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'symbol',
    });

    this._symbol = symbol;
    return symbol;
  }

  /**
   * Gets the number of decimals the token uses.
   * The result is cached after the first call.
   *
   * @returns The number of decimals (e.g., 18 for most tokens)
   * @throws Error if the contract call fails
   */
  async decimals(): Promise<number> {
    if (this._decimals !== undefined) {
      return this._decimals;
    }

    const decimals = await this.publicClient.readContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });

    this._decimals = decimals;
    return decimals;
  }

  /**
   * Gets the total token supply.
   *
   * @returns The total supply as a bigint (in the smallest unit)
   * @throws Error if the contract call fails
   */
  async totalSupply(): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'totalSupply',
    });
  }

  /**
   * Gets the token balance of an address.
   *
   * @param owner The address to check the balance for
   * @returns The balance as a bigint (in the smallest unit)
   * @throws Error if the contract call fails
   */
  async balanceOf(owner: `0x${string}`): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [owner],
    });
  }

  /**
   * Gets the allowance that an owner has granted to a spender.
   *
   * @param owner The address that owns the tokens
   * @param spender The address that is allowed to spend the tokens
   * @returns The allowance as a bigint (in the smallest unit)
   * @throws Error if the contract call fails
   */
  async allowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    });
  }

  // ============================================================================
  // Write Methods (Async - returns tx hash immediately)
  // ============================================================================

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
  async transfer(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<Hash> {
    const hash = await signer.walletClient.writeContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, amount],
      account: signer.account,
      chain: signer.walletClient.chain,
    });

    return hash;
  }

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
  async transferSync(
    signer: ERC20Signer,
    to: `0x${string}`,
    amount: bigint
  ): Promise<TransactionReceipt> {
    const hash = await this.transfer(signer, to, amount);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

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
  async approve(signer: ERC20Signer, spender: `0x${string}`, amount: bigint): Promise<Hash> {
    const hash = await signer.walletClient.writeContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
      account: signer.account,
      chain: signer.walletClient.chain,
    });

    return hash;
  }

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
  async approveSync(
    signer: ERC20Signer,
    spender: `0x${string}`,
    amount: bigint
  ): Promise<TransactionReceipt> {
    const hash = await this.approve(signer, spender, amount);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

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
  async transferFrom(
    signer: ERC20Signer,
    from: `0x${string}`,
    to: `0x${string}`,
    amount: bigint
  ): Promise<Hash> {
    const hash = await signer.walletClient.writeContract({
      address: this.address,
      abi: ERC20_ABI,
      functionName: 'transferFrom',
      args: [from, to, amount],
      account: signer.account,
      chain: signer.walletClient.chain,
    });

    return hash;
  }

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
  async transferFromSync(
    signer: ERC20Signer,
    from: `0x${string}`,
    to: `0x${string}`,
    amount: bigint
  ): Promise<TransactionReceipt> {
    const hash = await this.transferFrom(signer, from, to, amount);
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

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
  async formatAmount(amount: bigint): Promise<string> {
    const decimals = await this.decimals();
    return formatUnits(amount, decimals);
  }

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
  async parseAmount(amount: string): Promise<bigint> {
    const decimals = await this.decimals();
    return parseUnits(amount, decimals);
  }

  /**
   * Clears the cached metadata (name, symbol, decimals).
   * Call this if the token contract has been upgraded or if you need fresh data.
   */
  clearCache(): void {
    this._name = undefined;
    this._symbol = undefined;
    this._decimals = undefined;
  }
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
export function createERC20(address: `0x${string}`, publicClient: PublicClient): ERC20 {
  return new ERC20(address, publicClient);
}
