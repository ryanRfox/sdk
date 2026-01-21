# GasLimit=0 Ecosystem Impact Research

**Date:** 2026-01-20
**Context:** Radius network returns `gasLimit: 0` from `eth_getBlockByNumber`. This document investigates what breaks across the Ethereum ecosystem when clients encounter this non-standard behavior.

---

## Summary

While viem handles `gasLimit=0` gracefully (converting "0x0" to `0n` without errors), **ethers.js can break entirely** when encountering missing or zero `gasLimit` in block responses. MetaMask and Web3.js are primarily concerned with transaction-level gas limits, not block-level validation. Hardware wallets and block explorers display issues but don't functionally break. The SDK's hardcoded `MAX_GAS` constant remains necessary as a client-side safety cap since dynamic fetching from blocks returns zero.

---

## Findings by Client/Tool

### MetaMask

**Impact: LOW - MetaMask does not validate against `block.gasLimit` for transaction submission**

MetaMask's gas handling is focused on transaction-level validation, not block-level validation:

1. **Transaction Gas Limit Validation:**
   - MetaMask validates that transaction `gasLimit >= 21000` for simple transfers
   - Shows warning: "Gas limit must be at least 21000" during estimation ([GitHub Issue #9345](https://github.com/MetaMask/metamask-extension/issues/9345))
   - Previously had a bug where clicking "Confirm" during gas estimation could submit with `gasLimit=0`

2. **High Gas Limit Warning:**
   - MetaMask warns when transaction gas limit approaches the current block gas limit: "Gas limit set dangerously high. Approving this transaction is likely to fail." ([GitHub Issue #3646](https://github.com/MetaMask/metamask-extension/issues/3646))
   - This check uses `block.gasLimit`, but a zero value would likely disable this warning rather than cause errors

3. **Gas Estimation API Cap:**
   - MetaMask/Infura caps `eth_estimateGas` at 10x (1000%) the current block gas limit ([MetaMask docs](https://docs.metamask.io/services/reference/ethereum/json-rpc-methods/eth_estimategas/))
   - With `block.gasLimit=0`, this cap would theoretically be 0, but the actual enforcement likely happens server-side

4. **Transaction Controller:**
   - The [MetaMask Transaction Controller](https://github.com/MetaMask/transaction-controller) considers `txParams` "sacred" - everything gets signed as-is
   - Gas limit autofill issues have occurred ([Issue #3770](https://github.com/MetaMask/metamask-extension/issues/3770)), but these relate to missing values, not block-level validation

**Conclusion:** MetaMask should work with Radius. The "dangerously high gas limit" warning may be disabled, but this is actually beneficial for a network with non-standard gas semantics.

---

### ethers.js

**Impact: HIGH - ethers.js can throw errors when `block.gasLimit` is missing or zero**

This is the most problematic client library for `gasLimit=0`:

1. **Block Deserialization Errors:**
   - ethers.js `provider.getBlock()` uses a strict formatter that validates all block fields
   - If `gasLimit` is undefined/missing, throws: `reason: 'invalid BigNumber value', code: 'INVALID_ARGUMENT', argument: 'value', value: undefined, checkKey: 'gasLimit'` ([GitHub Issue #1735](https://github.com/ethers-io/ethers.js/issues/1735))
   - Zero (`"0x0"`) parses as `0n` without error, but missing `gasLimit` crashes

2. **Celo Compatibility Issue:**
   - Celo network also doesn't return `gasLimit` in blocks, causing identical errors
   - The [celo-ethers-wrapper](https://github.com/celo-tools/celo-ethers-wrapper) was created to handle this

3. **Workaround - Formatter Override:**
   ```typescript
   const provider = new providers.JsonRpcProvider(rpcUrl);
   const originalBlockFormatter = provider.formatter._block;
   provider.formatter._block = (value, format) => {
     return originalBlockFormatter({ gasLimit: constants.Zero, ...value }, format);
   };
   ```
   This provides a default `gasLimit` of zero when missing ([GitHub Issue #1735 comment](https://github.com/ethers-io/ethers.js/issues/1735))

4. **v6 Improvements:**
   - ethers v6 has better handling for non-standard chains
   - The maintainer mentioned plans for an "ancillary package template" for compatibility issues

5. **Gas Estimation Not Affected:**
   - `provider.estimateGas()` works independently of `block.gasLimit`
   - The `UNPREDICTABLE_GAS_LIMIT` error is about transaction execution, not block validation ([ethers docs](https://docs.ethers.org/v5/troubleshooting/errors/))

**Conclusion:** ethers.js v5 users will need the formatter workaround. ethers.js v6 handles zero values better but may still need configuration for Radius.

---

### Web3.js

**Impact: LOW - Web3.js does not strictly validate `block.gasLimit`**

Web3.js is more permissive than ethers.js:

1. **Transaction Validation:**
   - Validates transaction gas against the block limit when specified
   - "exceeds block gas limit" error occurs when `tx.gas > block.gasLimit` ([Web3.js Issue #1656](https://github.com/web3/web3.js/issues/1656))
   - With `block.gasLimit=0`, any transaction with `gas > 0` would technically exceed the limit

2. **Gas Defaults:**
   - Web3.js defaults gas to "To-Be-Determined" and relies on `eth_estimateGas`
   - The `web3.eth.estimateGas()` function works independently ([Web3.js docs](https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html))

3. **Block Parsing:**
   - Web3.js parses `block.gasLimit` without strict validation
   - A `"0x0"` value becomes `0` without throwing errors
   - `null` block objects cause errors: "Cannot read property 'gasLimit' of null" ([Issue #2402](https://github.com/web3/web3.js/issues/2402))

4. **Transaction Format:**
   - Legacy transaction format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
   - `gasLimit` in this context is the transaction's gas limit, not the block's

**Conclusion:** Web3.js should work with Radius, but applications that explicitly validate `tx.gas <= block.gasLimit` will need modification.

---

### Hardware Wallets

**Impact: NONE - Hardware wallets do not validate against `block.gasLimit`**

Ledger and Trezor hardware wallets operate at the transaction signing level:

1. **Transaction Signing Only:**
   - Hardware wallets sign raw transaction data including `gasLimit` as a transaction parameter
   - They do not query or validate against `block.gasLimit` ([Medium article](https://medium.com/rayonprotocol/this-article-explains-about-the-role-of-hardware-wallet-things-to-consider-when-to-choose-it-and-7935b08d3157))

2. **Trezor Integration:**
   - `TrezorConnect.ethereumSignTransaction` receives pre-formatted transaction with `gasLimit`
   - Example: `if (typeof tx.gasLimit === 'object') tx.gasLimit = '0x' + tx.gasLimit.toString(16)`
   - No block-level validation occurs ([ethers.js Issue #118](https://github.com/ethers-io/ethers.js/issues/118))

3. **Ledger Integration:**
   - Ledger Ethereum app signs transactions blind or with clear signing
   - Blind signing shows only a hash; clear signing shows transaction details
   - Neither mode references `block.gasLimit` ([Ledger support](https://support.ledger.com/article/360009576554-zd))

4. **Display Considerations:**
   - Companion apps (Ledger Live, Trezor Suite) may fetch block data for display
   - A `gasLimit=0` block would display oddly but not prevent signing

**Conclusion:** Hardware wallets are fully compatible. The SDK's `MAX_GAS` cap is applied before the transaction reaches the hardware wallet.

---

### Block Explorers

**Impact: LOW - Display anomalies but no functional issues**

Etherscan and Blockscout handle non-standard values gracefully:

1. **Etherscan Display:**
   - Block pages show "Gas Limit" as part of block details ([Etherscan info](https://info.etherscan.com/exploring-block-details-page/))
   - A value of 0 would display as "0" - unusual but not an error
   - Gas Used percentage (gasUsed/gasLimit) would show as "0%" or potentially "N/A"

2. **Blockscout Handling:**
   - Blockscout validates blocks against Etherscan-compatible API schemas ([Blockscout source](https://github.com/blockscout/blockscout/blob/master/apps/block_scout_web/lib/block_scout_web/etherscan.ex))
   - Zero values are valid hex strings and would be displayed

3. **L2 Explorer Precedent:**
   - Optimistic Etherscan and Basescan handle L2-specific gas semantics
   - Arbitrum shows artificially high `gasLimit` (includes L1 costs) without issues ([Arbitrum docs](https://docs.arbitrum.io/build-decentralized-apps/arbitrum-vs-ethereum/block-numbers-and-time))

4. **Transaction Verification:**
   - Block explorers verify transactions independently of `block.gasLimit`
   - Contract verification, event parsing, and trace analysis unaffected

**Conclusion:** Block explorers will display `gasLimit=0` correctly. Users may find it unusual, but no functionality breaks.

---

### Other L2 SDKs

**Impact: INFORMATIVE - L2s commonly use non-standard block parameters**

Examining how other L2 SDKs handle non-standard gas semantics provides useful precedent:

#### Arbitrum

1. **Non-Standard Gas Limits:**
   - Block `gasLimit` can appear artificially high because it includes L1 posting costs
   - Effective block gas limit (32M) only accounts for execution gas ([Arbitrum docs](https://docs.arbitrum.io/build-decentralized-apps/arbitrum-vs-ethereum/block-numbers-and-time))
   - The SDK documentation explicitly warns developers about this difference

2. **Gas Estimation Formula:**
   - `Gas Limit = L2 Gas + L1 Cost Buffer`
   - Standard `eth_estimateGas` returns the combined value ([Arbitrum gas docs](https://docs.arbitrum.io/devs-how-tos/how-to-estimate-gas))

3. **SDK Approach:**
   - Arbitrum SDK does NOT rely on `block.gasLimit` for transaction preparation
   - Custom gas estimation accounts for L1+L2 costs

#### Optimism / OP Stack

1. **System Config Gas Limit:**
   - Gas limit is configured via SystemConfig contract, not block header
   - Maximum L2 gas limit is a protocol constraint ([OP Stack specs](https://specs.optimism.io/protocol/system-config.html))

2. **Block-Level Values:**
   - OP Mainnet uses 30M gas limit (similar to Ethereum)
   - EIP-1559 parameters: 5M gas target, 10% adjustment ([Optimism docs](https://docs.optimism.io/builders/dapp-developers/transactions/parameters))

3. **SDK Independence:**
   - OP SDK does not fetch `block.gasLimit` for transaction preparation
   - Relies on `eth_estimateGas` and protocol constants

#### zkSync Era

1. **Fundamentally Different Model:**
   - Block gas limit is ~2^32 gas, but individual transactions capped at 80M ([zkSync docs](https://docs.zksync.io/build/tutorials/how-to/estimate-gas.html))
   - `gas_per_pubdata_limit` is zkSync-specific field for L1 data costs

2. **SDK Requirements:**
   - zksync-ethers library provides `DEFAULT_GAS_PER_PUBDATA_LIMIT`
   - Applications must use zkSync-aware SDK for correct gas estimation ([zkSync features](https://docs.zksync.io/zksync-era/sdk/js/ethers/guides/features))

3. **Intrinsic Costs:**
   - zkSync doesn't use 21000 gas for transfers (due to account abstraction)
   - Standard Ethereum assumptions don't apply

**Conclusion:** All major L2 SDKs use custom gas handling rather than relying on `block.gasLimit`. This validates the Radius SDK's approach with `MAX_GAS`.

---

## Geth Behavior Note

**Important Discovery:** Geth itself has special handling for zero gas limits:

- When `genesis.gasLimit == 0`, Geth automatically overrides it to `params.GenesisGasLimit` ([GitHub Issue #25126](https://github.com/ethereum/go-ethereum/issues/25126))
- Other clients do NOT have this override behavior
- This can cause consensus issues in multi-client environments

This suggests that `gasLimit=0` is recognized as problematic at the execution client level, and Radius may be intentionally returning zero to indicate "gas limit not applicable."

---

## Recommendation

**Keep the hardcoded `MAX_GAS` constant (1319413953330n) in the Radius SDK.**

### Rationale:

1. **Cannot Remove:** Dynamic fetching returns 0, which would prevent all transactions
2. **Safety Cap Purpose:** `MAX_GAS` caps gas estimates to prevent unexpectedly high values - this remains necessary regardless of block-level semantics
3. **L2 Precedent:** All major L2 SDKs use custom gas handling rather than relying on `block.gasLimit`
4. **Client Compatibility:**
   - viem: Works fine
   - ethers.js: May need formatter workaround for `getBlock()`, but gas estimation works
   - Web3.js: Works fine
   - MetaMask: Works fine
   - Hardware wallets: Unaffected

### Suggested Improvements:

1. **Documentation:** Add prominent documentation explaining:
   - Radius returns `gasLimit=0` for all blocks
   - This is intentional, not a bug
   - Applications should use `eth_estimateGas`, not `block.gasLimit`

2. **ethers.js Guidance:** Provide a code snippet for ethers.js users who encounter block parsing errors

3. **Future Enhancement:** Consider a custom RPC method `radius_getMaxGas` to expose the protocol constant

### Documentation Comment for MAX_GAS:

```typescript
/**
 * Maximum gas limit for transactions on Radius.
 *
 * IMPORTANT: This constant is required because:
 * - Radius returns gasLimit: 0 for all blocks (intentionally)
 * - This differs from Ethereum where block.gasLimit is ~30,000,000
 * - Dynamic fetching from blocks is not possible
 *
 * This value (0x13333333332) is a Radius protocol constant used to:
 * 1. Cap gas estimates to prevent unexpectedly high values
 * 2. Provide a safety bound for transaction gas limits
 *
 * Similar to how Arbitrum and zkSync SDKs use custom gas handling
 * rather than relying on block.gasLimit.
 *
 * @see GASLIMIT-ECOSYSTEM.md for full ecosystem impact analysis
 */
export const MAX_GAS = 1319413953330n;
```

---

## References

- [MetaMask Gas Documentation](https://support.metamask.io/more-web3/learn/user-guide-gas/)
- [MetaMask Transaction Controller](https://github.com/MetaMask/transaction-controller)
- [ethers.js Provider Documentation](https://docs.ethers.org/v6/api/providers/)
- [ethers.js Celo Issue #1735](https://github.com/ethers-io/ethers.js/issues/1735)
- [Web3.js Documentation](https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html)
- [Geth Zero Gas Limit Issue #25126](https://github.com/ethereum/go-ethereum/issues/25126)
- [Arbitrum Block Numbers and Time](https://docs.arbitrum.io/build-decentralized-apps/arbitrum-vs-ethereum/block-numbers-and-time)
- [Arbitrum Gas Estimation](https://docs.arbitrum.io/devs-how-tos/how-to-estimate-gas)
- [Optimism Transaction Parameters](https://docs.optimism.io/builders/dapp-developers/transactions/parameters)
- [OP Stack System Config](https://specs.optimism.io/protocol/system-config.html)
- [zkSync Era Gas Estimation](https://docs.zksync.io/build/tutorials/how-to/estimate-gas.html)
- [zkSync Era SDK Features](https://docs.zksync.io/zksync-era/sdk/js/ethers/guides/features)
- [Etherscan Block Details](https://info.etherscan.com/exploring-block-details-page/)
