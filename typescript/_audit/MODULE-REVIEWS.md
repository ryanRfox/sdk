# Module-by-Module Review Notes

## chains/

### radius.ts & radiusTestnet.ts
**Status:** ✅ Clean with minor issues

**Pattern Compliance:**
- Correctly uses viem's `defineChain()` helper
- `/*#__PURE__*/` annotation enables tree-shaking
- Standard chain configuration structure

**Observations:**
- Chain IDs verified: 723 (mainnet), 1223953 (testnet)
- Native currency correctly set to USD with 18 decimals
- Block explorer URLs properly configured
- Testnet has multicall3 contract, mainnet doesn't (verify if intentional)

**Minor Issues:**
- `blockCreated: 1768594222351` for multicall3 looks like a timestamp
- Mainnet missing explicit `testnet: false`
- No WebSocket URLs configured

### chainConfig.ts
**Status:** ✅ Clean

**Observations:**
- `MAX_GAS` constant (1319413953330n / 0x13333333332) properly documented
- Clear explanation of why it's needed (Radius returns gasLimit: 0)
- Good JSDoc with usage example

---

## actions/

### sendTransactionBatch.ts
**Status:** ⚠️ Has issues (H-1, H-2, M-4, L-1)

**Pattern Compliance:**
- Follows viem action pattern (function taking client + params)
- Generic constraints match viem conventions
- Good JSDoc documentation with example

**Security Review:**
- ✅ Private keys never exposed
- ✅ Account validation before signing
- ✅ Chain ID validation
- ✅ Nonce fetched with 'pending' tag (correct)

**Issues Found:**
1. Uses `fetch()` directly, bypassing transport middleware
2. No maximum batch size limit
3. No timeout on HTTP request
4. Generic `RadiusError` instead of `GasEstimationError`

**Code Quality:**
- Gas estimation with 20% safety margin is good
- `MAX_GAS` cap prevents runaway gas
- Response sorting by id ensures correct order
- Good error aggregation in `BatchTransactionError`

---

## decorators/

### radius.ts
**Status:** ✅ Clean

**Pattern Compliance:**
- Matches viem's decorator pattern exactly
- See reference: `viem/src/zksync/decorators/walletL2.ts`
- Returns function that extends client with new methods

**Type Safety:**
- Generic constraints properly propagated
- `RadiusWalletActions` type exported for external use
- Function overload not needed (simple single method)

**Observations:**
- Currently only adds `sendTransactionBatch`
- Clean composition with viem's `.extend()` method

---

## errors/

### base.ts
**Status:** ✅ Clean

**Pattern Compliance:**
- Extends viem's `BaseError` correctly
- Compatible with `instanceof BaseError` checks
- Compatible with wagmi error handling

**Features:**
- `shortMessage` for quick error understanding
- `details` for full error info
- `docsPath` with `docsBaseUrl: 'https://docs.radiustech.xyz'`
- `meta` for Radius-specific metadata
- Inherits viem's `.walk()` method for cause chain traversal

### account.ts, contract.ts, transaction.ts
**Status:** ✅ Clean

**Observations:**
- Good domain-specific error properties:
  - `InsufficientBalanceError`: address, balance, required
  - `ContractCallError`: contractAddress, functionName, args
  - `TransactionRevertedError`: transactionHash, revertReason, revertData
  - `BatchTransactionError`: results array with per-transaction status
- Error type unions in index.ts enable exhaustive error handling

---

## transport/

### interceptor.ts
**Status:** ✅ Clean

**Features:**
- `InterceptingRequestHandler` class for request/response modification
- `DefaultRequestHandler` with timeout via AbortController (10s default)
- `createInterceptingTransport()` factory function
- Automatic retry with exponential backoff

**Smart Design:**
- Uses viem's native `http()` when only logging (no interceptor)
- Falls back to custom transport when response modification needed
- Request ID counter for JSON-RPC id generation

### websocket.ts
**Status:** ⚠️ Minor issues (M-2)

**Observations:**
- Wrapper around viem's `webSocket()` transport
- HTTP-to-WS URL conversion fallback may not work for all endpoints
- Good default configuration (3 reconnect attempts, 1s delay)

**Limitation:**
- Chain configs don't have WebSocket URLs
- Comment says "WebSocket is NOT currently enabled on Radius testnet"

### types.ts
**Status:** ✅ Clean

---

## events/

### decodeEventLogs.ts
**Status:** ✅ Clean

**Features:**
- `decodeEventLogs()`: Batch decode with strict/non-strict modes
- `filterEventLogs()`: Filter by event name
- Proper function overloads for type inference

### getLogs.ts
**Status:** ✅ Clean

**Features:**
- `getLogs()`: Paginated historical log fetching
- `getLogsAdaptive()`: Auto-adjusting chunk size on error
- Good progress callback support
- Proper error messages for "block range is too wide"

### watchBlock.ts
**Status:** ✅ Clean

**Features:**
- `watchBlockNumber()`, `watchBlocks()`, `watchPendingTransactions()`
- Thin wrappers around viem's watch functions
- `DEFAULT_POLLING_INTERVAL_MS = 1000`
- Good documentation of Radius limitations

### watchApproval.ts & watchTransfer.ts
**Status:** ⚠️ Minor issues (L-3)

**Features:**
- ERC-20 specific event watchers
- Auto-decode to typed `ApprovalEvent`/`TransferEvent`
- `watchApprovalForAddress`/`watchTransferForAddress` with deduplication

**Issue:**
- `seenEvents` Set grows unboundedly (memory leak potential)

### watchLogs.ts
**Status:** ✅ Clean

---

## contracts/

### typedContract.ts
**Status:** ⚠️ Minor issues (M-3, L-5)

**Features:**
- Type-safe contract helper with `read` and `write` namespaces
- Autocomplete for contract methods based on ABI
- `WriteOptions` for `wait: true/false`

**Design:**
- Uses Proxy for dynamic method binding
- Handles both array and loose arguments
- Proper gas estimation and signing flow

**Issues:**
- Function named `getContract` conflicts with viem's `getContract`
- Different signature than viem's version

---

## Test Suite Review

### Unit Tests

**test/unit/contractAliases.test.ts**
- Tests viem's readContract/writeContract pattern
- Uses `@ts-nocheck` (flagged as M-5)
- Tests are valid but could use better typing

**test/unit/decodeEventLogs.test.ts**
- Comprehensive coverage of `decodeEventLogs` and `filterEventLogs`
- Tests strict/non-strict modes
- Tests invalid log handling
- Uses proper viem encoding helpers

**test/unit/typedContract.test.ts**
- Tests read namespace with/without args
- Tests write namespace with wait/no-wait
- Tests error propagation
- Tests missing chain handling
- Good mock setup pattern

### Integration Tests

**test/integration/client.integration.test.ts**
- Tests public client read operations
- Tests wallet client write operations (with balance skip)
- Tests batch transactions
- Good error handling tests

**test/integration/erc20.integration.test.ts**
- Tests ERC-20 reads using `getContract` pattern
- Tests token deployment if not exists
- Good use of viem's erc20Abi

**test/integration/signer.integration.test.ts**
- Comprehensive privateKeyToAccount tests
- Message signing with recovery
- Transaction signing with EIP-155
- Good edge case coverage (max value, zero value, large nonce)

### Co-located Event Tests (src/events/*.test.ts)

**watchApproval.test.ts, watchBlock.test.ts, watchTransfer.test.ts**
- Good mock pattern for PublicClient
- Tests callback invocation
- Tests error handling
- Tests deduplication in ForAddress variants
- Tests combined unwatch function

### Test Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Coverage | Good | Most code paths tested |
| Mocking | Good | Proper isolation |
| Edge Cases | Good | Error conditions covered |
| Real Network | Good | Integration tests exist |
| Type Safety | Fair | Some @ts-nocheck usage |
| Skip Handling | Fair | Silent skips on low balance |
