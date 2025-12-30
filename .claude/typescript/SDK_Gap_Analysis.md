# SDK Gap Analysis

**Date**: 2025-12-29 (Re-validated)
**SDK Version**: 1.0.0

## Executive Summary

The Radius TypeScript SDK has a **bug in gas estimation** that prevents ERC-20 token transfers via the SDK. However, **the Radius network works correctly** - MetaMask, Foundry's `cast`, and direct ethers.js usage can successfully transfer ERC-20 tokens.

The SDK's `estimateGas()` method doesn't include the `from` address, causing ERC-20 `transfer()` calls to fail with "transfer from the zero address". This is a **client-side bug only**.

All other Phase 2 "Must Have" features work correctly.

---

## BUG CONFIRMED (Client-Side Only)

### ERC-20 Token Transfers Fail in SDK

| Issue | Details |
|-------|---------|
| **Symptom** | `contract.execute('transfer', ...)` fails |
| **Error** | "ERC20: transfer from the zero address" |
| **Location** | `src/client/client.ts:217-230` |
| **Root Cause** | `estimateGas()` doesn't pass `from` address |
| **Impact** | Cannot transfer SBC/ISB or any ERC-20 tokens via SDK |
| **Network Status** | WORKS - `cast` and MetaMask succeed |

**Verified working alternatives:**
- `cast send` (Foundry) - Transaction successful
- MetaMask - User confirmed working
- Direct ethers.js - Standard approach works

**What Works in SDK:**
- ERC-20 `balanceOf()` calls (read operations)
- Native ETH transfers
- Non-msg.sender-dependent contract interactions

**What's Broken in SDK:**
- Any ERC-20 `transfer()`, `approve()`, or `transferFrom()` calls
- Any contract method checking `msg.sender` during gas estimation

---

## Feature Comparison

### Phase 2: Must Have (Documentation Requirements)

| Requirement | SDK Status | Implementation Quality |
|-------------|-----------|----------------------|
| Connect to Radius testnet | IMPLEMENTED | Excellent - `NewClient()` with options |
| Create/import accounts from private key | IMPLEMENTED | Excellent - `NewAccount(withPrivateKey())` |
| Check native balance | IMPLEMENTED | Excellent - `account.balance(client)` |
| Check SBC token balance | IMPLEMENTED | Good - `contract.call('balanceOf', ...)` works |
| Send native value transfers | IMPLEMENTED | Excellent - `account.send()` |
| Send SBC token transfers | **SDK BUG** | Bug - gas estimation missing `from` address |
| Deploy smart contracts | IMPLEMENTED | Excellent - `client.deployContract()` |
| Read from contracts (call) | IMPLEMENTED | Excellent - `contract.call()` |
| Write to contracts (execute) | PARTIAL | Works for non-msg.sender-dependent contracts |

### Phase 3: Nice to Have (Documentation Requirements)

| Requirement | SDK Status | Gap Details |
|-------------|-----------|-------------|
| Event subscription | PARTIAL | Events in receipts only, no WebSocket subscription |
| Balance watching/polling | NOT IMPLEMENTED | No polling helper functions |
| Gas estimation helpers | IMPLEMENTED | `client.estimateGas()` available (but has bug) |
| Batch transactions | NOT IMPLEMENTED | Single transaction per call only |
| x402 payment protocol | NOT IMPLEMENTED | Not present in SDK |

---

## Gaps Requiring SDK Changes

### HIGH PRIORITY (SDK Bug)

1. **Gas Estimation Missing `from` Address**
   - **Bug**: `estimateGas()` doesn't pass sender address to RPC call
   - **Impact**: ERC-20 token transfers fail (SDK only, network works)
   - **Fix Required**: Add `from` parameter to gas estimation
   - **Priority**: HIGH - but workarounds exist

### Medium Priority (Affects Documentation Examples)

2. **ERC-20 Token Helper Functions**
   - **Gap**: No built-in helper for checking/transferring ERC-20 tokens
   - **Impact**: Docs must show manual Contract setup with ABI
   - **Recommendation**: Add `NewERC20Contract(address)` helper

3. **SBC Token Constant**
   - **Gap**: No exported constant for SBC token address
   - **Impact**: Devs must hardcode address
   - **Recommendation**: Add `SBC_TOKEN_ADDRESS` export for testnet/mainnet

### Low Priority (Would Improve Developer Experience)

4. **Balance Watching**
   - **Gap**: No polling/subscription for balance changes
   - **Impact**: Devs must implement their own polling
   - **Recommendation**: Add `watchBalance()` or polling helper

5. **Event Subscription**
   - **Gap**: No WebSocket support for live events
   - **Impact**: Cannot build reactive applications
   - **Recommendation**: Add `subscribeToEvents()` method

6. **Batch Transactions**
   - **Gap**: Cannot send multiple transactions atomically
   - **Impact**: Complex operations require multiple calls
   - **Recommendation**: Add batch transaction support

---

## Workarounds for SDK Bug

### Option 1: Use Foundry's `cast`
```bash
cast send 0xF966020a30946A64B39E2e243049036367590858 "transfer(address,uint256)" \
  <RECIPIENT> <AMOUNT> \
  --private-key <KEY> --rpc-url https://rpc.testnet.radiustech.xyz
```

### Option 2: Use ethers.js directly
```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.testnet.radiustech.xyz');
const wallet = new ethers.Wallet(privateKey, provider);
const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
const tx = await tokenContract.transfer(recipient, amount);
await tx.wait();
```

### Option 3: Use MetaMask or standard wallet
Standard EVM wallets handle gas estimation correctly.

---

## Documentation Recommendations

### Code Examples That Work

1. **Token Balance Example** (WORKS)
   ```typescript
   const sbcAddress = AddressFromHex('0xF966020a30946A64B39E2e243049036367590858');
   const sbcAbi = ABIFromJSON(ERC20_ABI);
   const sbcContract = new Contract(sbcAddress, sbcAbi);
   const balance = await sbcContract.call(client, 'balanceOf', account.address().hex());
   // This works correctly
   ```

2. **Native Transfer Example** (WORKS)
   ```typescript
   const receipt = await account.send(client, recipientAddress, amount);
   // This works correctly
   ```

3. **Contract Deployment Example** (WORKS)
   ```typescript
   const contract = await client.deployContract(account.signer, bytecode, abi);
   // This works correctly
   ```

### Code Examples That Need Workaround

1. **Token Transfer** - Use workaround until SDK is fixed
   ```typescript
   // SDK approach (BROKEN):
   // await sbcContract.execute(client, signer, 'transfer', recipient, amount);

   // Workaround - use ethers.js:
   const provider = new ethers.JsonRpcProvider('https://rpc.testnet.radiustech.xyz');
   const wallet = new ethers.Wallet(privateKey, provider);
   const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
   await contract.transfer(recipient, amount);
   ```

### Network Configuration Notes
- Chain ID: `1223953` (0x12ad11)
- The testnet token is named "ISBToken" with symbol "ISB" (not SBC)

### Features Docs Should NOT Promise (Until SDK Fix)

1. **ERC-20 token transfers via SDK** - Broken due to gas estimation bug

### Features Docs CAN Promise

1. Full testnet connectivity
2. Private key account management
3. Native balance checking
4. Native value transfers
5. **ERC-20 token balance checking** (read-only)
6. Smart contract deployment
7. Contract read operations (`call()`)
8. Contract write operations for simple contracts
9. Gas estimation (for non-msg.sender operations)
10. Immediate transaction finality
11. Zero gas price (stablecoin fees handled transparently)

---

## API Changes from Expected

| Expected API | Actual API | Status |
|--------------|------------|--------|
| `radius.connect()` | `NewClient()` | Different naming |
| `account.getSBCBalance()` | N/A | Not implemented |
| `account.transferSBC()` | N/A | **SDK BUG** (network works) |
| `contract.execute('transfer')` | Exists | **SDK BUG** for ERC-20 |
| `client.subscribeEvents()` | N/A | Not implemented |
| `client.watchBalance()` | N/A | Not implemented |

---

## SDK Architecture Assessment

### Strengths

1. **Clean abstraction over ethers.js** - Well-designed wrapper
2. **Radius-specific handling** - Zero gas price, immediate finality
3. **Type safety** - Full TypeScript support
4. **Flexible options pattern** - `withPrivateKey()`, `withLogger()`, etc.
5. **Native transfers work perfectly** - ETH transfers are solid
6. **Contract reads work perfectly** - `call()` operations work

### Issues

1. **Gas estimation bug** - Missing `from` address breaks ERC-20
2. **No convenience methods for common tokens** - ERC-20 requires manual setup
3. **Limited event support** - Only from transaction receipts
4. **No network constants** - Devs must know chain IDs, token addresses

---

## Recommended Priority for Fixes

### HIGH (Bug Fix)

1. **FIX GAS ESTIMATION BUG** - Add `from` address to `estimateGas()`
   - Location: `src/client/client.ts:217-230`
   - Workarounds exist, but SDK should work correctly

### Medium (After Bug Fix)

1. Add SBC_TOKEN_ADDRESS constant for testnet
2. Document the manual ERC-20 approach clearly
3. Clarify ISB vs SBC token naming

### Low (Improve Developer Experience)

1. Add ERC-20 helper class or methods
2. Add network configuration constants
3. Add balance polling utility

### Future (Feature Enhancement)

1. Event subscription support
2. Batch transaction support
3. Multiple account management

---

## Conclusion

The TypeScript SDK has a **bug in gas estimation** that affects ERC-20 token transfers. However:

1. **The network works correctly** - This is a client-side bug only
2. **Workarounds exist** - Use `cast`, ethers.js, or MetaMask
3. **All other features work** - Native transfers, contract deployment, reads all work

**What Works Now:**
- Native ETH operations (balance, transfers)
- Contract deployment
- Contract reads (including ERC-20 `balanceOf`)
- Non-msg.sender-dependent contract writes

**What's Broken in SDK:**
- ERC-20 token transfers via `contract.execute()`
- Any contract method checking `msg.sender` during gas estimation

**Overall Assessment**: SDK is mostly functional. The gas estimation bug should be fixed, but workarounds are available for ERC-20 transfers.
