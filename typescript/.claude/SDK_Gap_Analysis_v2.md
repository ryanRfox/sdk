# SDK Gap Analysis: Radius v2 vs Tempo vs Monad

**Date**: 2025-12-30
**Radius SDK Version**: v2.0.0 (viem/wagmi migration)
**Tempo SDK**: Latest (viem v2.43.3 + wagmi v2.19+)
**Monad**: No custom SDK (EVM-compatible, uses standard tools)

---

## Executive Summary

| Chain | SDK Approach | Base Library | Custom SDK? |
|-------|-------------|--------------|-------------|
| **Radius** | Custom SDK | viem + wagmi 3.x | Yes - full featured |
| **Tempo** | Custom SDK | viem + wagmi 2.x | Yes - full featured |
| **Monad** | No SDK | viem/ethers.js direct | No - use standard EVM tools |

**Key Finding**: Radius SDK v2 now matches or exceeds Tempo's feature set, while Monad relies entirely on EVM compatibility with no custom SDK.

---

## SDK Approach Comparison

### Monad: No Custom SDK

Monad's philosophy: *"We're fully EVM-compatible, use existing Ethereum tools."*

```typescript
// Monad development - just use viem/ethers with their RPC
import { createPublicClient, http } from 'viem'
import { monad } from 'viem/chains' // or define custom chain

const client = createPublicClient({
  chain: monad,
  transport: http('https://testnet-rpc.monad.xyz'),
})
```

**Pros**:
- Zero learning curve for Ethereum devs
- Any viem/ethers code works immediately
- No SDK maintenance burden

**Cons**:
- No chain-specific helpers
- No optimized abstractions
- Developers must handle all edge cases

### Tempo: Full Custom SDK

Tempo built comprehensive SDK with chain-specific features:
- Token creation/management (TIP20)
- DEX order management
- AMM liquidity operations
- WebAuthn/Passkey authentication
- Full React hooks ecosystem

### Radius v2: Full Custom SDK

Radius v2 now provides:
- Chain definitions (radiusTestnet, radiusMainnet)
- ERC-20 helper class with sync variants
- Event subscriptions (watchTransfer, watchApproval, watchBlockNumber)
- React hooks (useRadiusBalance, useRadiusSend, useERC20*)
- Clef/HSM signer support
- Custom transport interceptors

---

## Feature Matrix

### Core Features

| Feature | Radius v2 | Tempo | Monad |
|---------|:---------:|:-----:|:-----:|
| Chain definition | ✅ | ✅ | ❌ (manual) |
| Public client | ✅ | ✅ | ❌ (use viem) |
| Wallet client | ✅ | ✅ | ❌ (use viem) |
| Private key accounts | ✅ | ⚠️ (marked dangerous) | ❌ (use viem) |
| External signer (Clef/HSM) | ✅ | ❌ | ❌ |
| Gas estimation | ✅ | ✅ | ❌ (use viem) |
| Request interceptors | ✅ | ❌ | ❌ |
| Request logging | ✅ | ❌ | ❌ |

### Token Operations

| Feature | Radius v2 | Tempo | Monad |
|---------|:---------:|:-----:|:-----:|
| Native transfers | ✅ | ✅ | ❌ (use viem) |
| ERC-20 balance | ✅ `token.balanceOf()` | ✅ | ❌ (manual) |
| ERC-20 transfer | ✅ `token.transfer()` | ✅ | ❌ (manual) |
| ERC-20 approve | ✅ `token.approve()` | ✅ | ❌ (manual) |
| ERC-20 transferFrom | ✅ `token.transferFrom()` | ✅ | ❌ (manual) |
| Sync variants (*Sync) | ✅ | ✅ | ❌ |
| Token creation | ❌ | ✅ (TIP20) | ❌ |
| Token minting | ❌ | ✅ | ❌ |
| Token burning | ❌ | ✅ | ❌ |
| Token pausing | ❌ | ✅ | ❌ |

### Event Subscriptions

| Feature | Radius v2 | Tempo | Monad |
|---------|:---------:|:-----:|:-----:|
| Block number watching | ✅ `watchBlockNumber()` | ✅ | ❌ (use viem) |
| Block header watching | ✅ `watchBlocks()` | ✅ | ❌ (use viem) |
| Transfer events | ✅ `watchTransfer()` | ✅ | ❌ (manual) |
| Approval events | ✅ `watchApproval()` | ✅ | ❌ (manual) |
| Historical logs | ✅ `getLogs()` | ✅ | ❌ (use viem) |
| Adaptive pagination | ✅ `getLogsAdaptive()` | ❌ | ❌ |
| WebSocket transport | ✅ (when enabled) | ✅ | ❌ (use viem) |

### React Integration

| Feature | Radius v2 | Tempo | Monad |
|---------|:---------:|:-----:|:-----:|
| Provider component | ✅ `<RadiusProvider>` | ✅ | ❌ |
| Balance hook | ✅ `useRadiusBalance()` | ✅ | ❌ |
| Send hook | ✅ `useRadiusSend()` | ✅ | ❌ |
| ERC-20 balance hook | ✅ `useERC20Balance()` | ✅ | ❌ |
| ERC-20 transfer hook | ✅ `useERC20Transfer()` | ✅ | ❌ |
| ERC-20 approve hook | ✅ `useERC20Approve()` | ✅ | ❌ |
| TanStack Query | ✅ (via wagmi 3.x) | ✅ | ❌ |
| wagmi integration | ✅ wagmi 3.x | ✅ wagmi 2.x | ❌ |

### Advanced Features

| Feature | Radius v2 | Tempo | Monad |
|---------|:---------:|:-----:|:-----:|
| Multi-chain config | ✅ | ✅ | ❌ |
| Contract deployment | ✅ | ❌ (not exposed) | ❌ (use viem) |
| WebAuthn/Passkeys | ❌ | ✅ | ❌ |
| DEX operations | ❌ | ✅ (chain-specific) | ❌ |
| AMM/Liquidity | ❌ | ✅ (chain-specific) | ❌ |
| Batch transactions | ❌ | ❌ | ❌ |

---

## Gaps Closed (v1 → v2)

### Previously Missing, Now Implemented

| Gap | v1 Status | v2 Status |
|-----|-----------|-----------|
| Gas estimation bug | ❌ Broken | ✅ Fixed |
| ERC-20 helper class | ❌ Manual ABI | ✅ `ERC20` class |
| Sync transaction variants | ❌ Manual wait | ✅ `*Sync()` methods |
| Event subscriptions | ❌ None | ✅ Full support |
| React hooks | ❌ None | ✅ wagmi 3.x hooks |
| WebSocket transport | ❌ None | ✅ Ready (when enabled) |
| Historical log queries | ❌ None | ✅ `getLogs()` |
| Block watching | ❌ None | ✅ HTTP polling |

---

## Remaining Gaps (v2 vs Tempo)

### Features Tempo Has That Radius Doesn't

| Feature | Priority | Rationale |
|---------|----------|-----------|
| WebAuthn/Passkeys | Low | Enterprise use cases use HSM/Clef instead |
| Token creation | N/A | Chain-specific (Tempo's TIP20) |
| DEX operations | N/A | Chain-specific feature |
| AMM/Liquidity | N/A | Chain-specific feature |

### Features Radius Has That Tempo Doesn't

| Feature | Radius v2 | Tempo |
|---------|-----------|-------|
| Clef/HSM external signer | ✅ | ❌ |
| Contract deployment | ✅ | ❌ |
| Request interceptors | ✅ | ❌ |
| Request logging | ✅ | ❌ |
| Adaptive log pagination | ✅ | ❌ |

---

## Architecture Comparison

### Package Structure

**Radius v2** (single package, subpath exports):
```
@radiustechsystems/sdk
├── index.ts        → Main entry
├── /chains         → Chain definitions
├── /react          → React hooks + provider
├── /events         → Event subscriptions
├── /contracts      → Contract utilities, ERC20
├── /auth           → PrivateKeySigner, ClefSigner
└── /transport      → HTTP interceptors, WebSocket
```

**Tempo** (multiple packages):
```
@tempo/sdk-core     → Core utilities
@tempo/sdk-react    → React hooks
@tempo/sdk-tokens   → Token operations
```

**Monad** (no SDK):
```
(use viem/ethers.js directly)
```

### Dependency Strategy

| SDK | Runtime Dependencies | React Dependencies |
|-----|---------------------|-------------------|
| Radius v2 | viem | wagmi 3.x, @tanstack/react-query (peer) |
| Tempo | viem | wagmi 2.x, @tanstack/react-query |
| Monad | N/A | N/A |

---

## Developer Experience Comparison

### Getting Started

**Radius v2**:
```typescript
import { createRadiusClient } from '@radiustechsystems/sdk'
import { radiusTestnet } from '@radiustechsystems/sdk/chains'
import { ERC20 } from '@radiustechsystems/sdk/contracts'

const client = createRadiusClient({ chain: radiusTestnet })
const token = new ERC20(tokenAddress, client)
const balance = await token.balanceOf(owner)
```

**Tempo**:
```typescript
import { createTempoClient } from '@tempo/sdk-core'
import { tempoTestnet } from '@tempo/sdk-core/chains'

const client = createTempoClient({ chain: tempoTestnet })
const balance = await client.getTokenBalance(tokenAddress, owner)
```

**Monad**:
```typescript
import { createPublicClient, http } from 'viem'
import { monadTestnet } from './chains' // must define manually

const client = createPublicClient({
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz'),
})
// must manually encode ERC-20 calls
```

### React Integration

**Radius v2**:
```tsx
import { RadiusProvider, useERC20Balance } from '@radiustechsystems/sdk/react'

function App() {
  return (
    <RadiusProvider>
      <TokenBalance />
    </RadiusProvider>
  )
}

function TokenBalance() {
  const { data: balance, isLoading } = useERC20Balance({ token, owner })
  return <div>{balance?.formatted}</div>
}
```

**Monad**:
```tsx
// Must build everything from scratch using wagmi core
import { WagmiProvider, useBalance } from 'wagmi'
// Manual ERC-20 contract reads required
```

---

## Competitive Position

### Radius v2 Strengths

1. **Enterprise-ready**: Clef/HSM support for production key management
2. **Debug-friendly**: Request interceptors and logging
3. **Modern stack**: wagmi 3.x (latest), React 19 ready
4. **Event handling**: Comprehensive subscription system
5. **Contract deployment**: First-class support (Tempo lacks this)

### Radius v2 Weaknesses

1. **No WebAuthn**: Consumer passkey auth not supported
2. **No chain-specific DeFi**: No DEX/AMM helpers (but N/A for Radius)

### vs Tempo

Radius v2 is **at feature parity** with Tempo for core SDK functionality. Tempo's additional features (TIP20, DEX, AMM) are chain-specific to Tempo's blockchain.

### vs Monad

Radius provides **significantly better DX** than Monad's "use viem directly" approach:
- Pre-configured chain definitions
- ERC-20 helper class
- React hooks out of the box
- Event subscription utilities

---

## Conclusion

### SDK Maturity Ranking

| Rank | SDK | Maturity | Notes |
|------|-----|----------|-------|
| 1 | **Radius v2** | Production-ready | Full feature set, enterprise support |
| 2 | **Tempo** | Production-ready | Chain-specific features, older wagmi |
| 3 | **Monad** | N/A | No SDK (use standard tools) |

### Recommendation

Radius SDK v2 successfully closes all critical gaps from v1 and achieves feature parity with Tempo for standard EVM SDK functionality. The remaining gaps (WebAuthn, chain-specific DeFi) are either low priority or not applicable.

**Next priorities should be**:
1. Unit test coverage (Phase 7)
2. API documentation (Phase 8)
3. Migration guide (v1 → v2)
4. Publish v2.0.0

---

## Sources

- [Monad Developer Documentation](https://docs.monad.xyz/)
- [Monad for Developers](https://docs.monad.xyz/introduction/monad-for-developers)
- Tempo SDK: github.com/tempoxyz/tempo-ts
- Radius SDK v2: Current implementation
