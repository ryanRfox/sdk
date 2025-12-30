# Radius SDK v2 Evaluation Against Gap Analysis

**Date**: 2025-12-30
**SDK Version**: 2.0.0-alpha.0
**Architecture**: Single package with subpath exports (Tempo pattern)

---

## Executive Summary

The Radius TypeScript SDK v2 addresses **all high-priority gaps** identified in the original analysis and adopts modern best practices (viem, wagmi 3.x, React 19, single package with subpath exports).

| Gap Category | Status | Notes |
|--------------|--------|-------|
| Gas estimation bug | **FIXED** | Now passes `account: signer.address` |
| ERC-20 Helper Class | **IMPLEMENTED** | Full ERC20 class with sync variants |
| React Hooks | **IMPLEMENTED** | wagmi 3.x hooks via `/react` subpath |
| Multi-Chain Config | **IMPLEMENTED** | Chain configs via `/chains` subpath |
| Sync Transaction Variants | **IMPLEMENTED** | `transferSync`, `approveSync`, etc. |
| Event Subscriptions | **NOT YET** | Future enhancement |

---

## Gap Analysis Resolution

### HIGH PRIORITY: Gas Estimation Bug - FIXED

**Original Issue**: `estimateGas()` didn't pass `from` address, causing ERC-20 transfers to fail.

**Resolution**:
```typescript
// v2 implementation (client.ts:365-366)
const estimate = await publicClient.estimateGas({
  account: signer.address,  // NOW INCLUDED
  to: tx.to,
  data: tx.data,
  value: tx.value,
})
```

### Priority 1: ERC-20 Helper Class - IMPLEMENTED

**Original Gap**: Developers had to manually set up ERC-20 ABI and contract instances.

**v2 Solution**:
```typescript
import { ERC20, createERC20, ERC20_ABI } from '@radiustechsystems/sdk'

const token = createERC20(tokenAddress, publicClient)
const balance = await token.balanceOf(owner)
await token.transfer(signer, recipient, amount)
await token.transferSync(signer, recipient, amount)  // Waits for receipt
await token.approve(signer, spender, amount)
await token.approveSync(signer, spender, amount)
```

**Features**:
- Built-in ERC-20 ABI (exported)
- Cached metadata (name, symbol, decimals)
- Sync variants that wait for confirmation
- `formatAmount()` / `parseAmount()` utilities

### Priority 2: Event Subscriptions - NOT YET IMPLEMENTED

**Status**: Planned for future release. viem supports WebSocket subscriptions; foundation is in place.

### Priority 3: Sync Transaction Variants - IMPLEMENTED

**Original Gap**: Had to manually wait for transaction receipts.

**v2 Solution**:
```typescript
// Async (returns hash immediately)
const hash = await token.transfer(signer, to, amount)

// Sync (waits for receipt)
const receipt = await token.transferSync(signer, to, amount)
```

### Priority 4: React Package - IMPLEMENTED

**Original Gap**: No React hooks or wagmi-style integration.

**v2 Solution**: Single package with `/react` subpath export:
```typescript
import {
  RadiusProvider,
  useRadiusBalance,
  useRadiusSend,
  useERC20Balance,
  useERC20Transfer,
  useERC20Approve,
} from '@radiustechsystems/sdk/react'

function App() {
  const { data: balance } = useRadiusBalance(address)
  const { transfer, isPending } = useERC20Transfer({ token })
}
```

**Hooks provided**:
- `useRadiusBalance` - Native balance queries
- `useRadiusSend` - Native token transfers
- `useERC20Balance` - Token balance queries
- `useERC20Allowance` - Allowance queries
- `useERC20Metadata` - Token name/symbol/decimals
- `useERC20Transfer` - Token transfers with tx state
- `useERC20Approve` - Token approvals with tx state

### Priority 5: Multi-Chain Config - IMPLEMENTED

**v2 Solution**:
```typescript
import { radiusTestnet, radiusMainnet } from '@radiustechsystems/sdk/chains'

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
})
```

---

## Comparison: v1 (ethers.js) vs v2 (viem)

| Aspect | v1 | v2 |
|--------|----|----|
| Base library | ethers.js v6 | viem ^2.43.3 |
| Bundle size | ~150KB | ~80KB (tree-shakeable) |
| React support | None | Full wagmi 3.x hooks |
| Package structure | Single package | Single package + subpaths |
| ERC-20 helper | Manual ABI | Built-in ERC20 class |
| Sync transactions | Manual | Built-in `*Sync` variants |
| Gas estimation | **BUGGY** | Fixed |
| TypeScript | Good | Excellent (stricter) |

---

## Comparison: Radius v2 vs Tempo

| Feature | Radius v2 | Tempo | Notes |
|---------|:---------:|:-----:|-------|
| Base library | viem | viem | Tie |
| React hooks | wagmi 3.x | wagmi 2.x | **Radius** (newer) |
| Private key accounts | Yes | "dangerous" | **Radius** |
| External signer (Clef) | Yes | No | **Radius** |
| ERC-20 helpers | Yes | Yes (TIP20) | Tie |
| Sync transactions | Yes | Yes | Tie |
| Event subscriptions | No | Yes | **Tempo** |
| WebAuthn/Passkeys | No | Yes | **Tempo** |
| Token creation | No | Yes | **Tempo** (chain-specific) |
| Contract deployment | Yes | No | **Radius** |
| Package structure | Subpath exports | Subpath exports | Tie |

---

## SDK v2 Structure

```
@radiustechsystems/sdk
├── index.ts              # Main entry (client, signers, contracts)
├── /react                # React hooks and provider (subpath)
│   ├── RadiusProvider
│   ├── useRadiusBalance
│   ├── useRadiusSend
│   ├── useERC20*
│   └── useRadiusContext
├── /chains               # Chain configurations (subpath)
│   ├── radiusTestnet
│   └── radiusMainnet
├── /contracts            # Contract utilities
│   ├── Contract
│   ├── ERC20
│   └── ERC20_ABI
├── /auth                 # Signers
│   ├── PrivateKeySigner
│   └── ClefSigner
└── /client               # Client creation
    └── createRadiusClient
```

---

## Remaining Gaps (Future Work)

| Feature | Priority | Effort |
|---------|----------|--------|
| Event subscriptions (WebSocket) | Medium | ~2-3 days |
| Balance watching/polling | Low | ~1 day |
| Batch transactions | Low | ~2 days |
| x402 payment protocol | Low | TBD |

---

## Breaking Changes from v1

1. **Import paths changed**:
   ```typescript
   // v1
   import { Client } from '@radiustechsystems/sdk'

   // v2
   import { createRadiusClient } from '@radiustechsystems/sdk'
   ```

2. **Client creation**:
   ```typescript
   // v1
   const client = await Client.New('https://rpc.testnet.radiustech.xyz')

   // v2
   const client = createRadiusClient({
     chain: radiusTestnet,
     transport: http(),
   })
   ```

3. **React moved to subpath**:
   ```typescript
   // v1 (if existed)
   import { ... } from '@radiustechsystems/sdk-react'

   // v2
   import { ... } from '@radiustechsystems/sdk/react'
   ```

---

## Conclusion

The Radius SDK v2 successfully addresses the critical issues identified in the gap analysis:

- **Gas estimation bug**: Fixed
- **ERC-20 helpers**: Fully implemented with sync variants
- **React support**: Modern wagmi 3.x hooks
- **Architecture**: Clean single-package with subpath exports (like Tempo/viem)

The SDK is now competitive with modern web3 SDKs while maintaining Radius-specific features (Clef signer, zero gas price handling, immediate finality).

**Recommended next steps**:
1. Add WebSocket event subscriptions
2. Add documentation and examples
3. Publish v2.0.0-alpha.0 for testing
