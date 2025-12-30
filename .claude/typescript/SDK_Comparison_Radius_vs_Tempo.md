# SDK Comparison: Radius vs Tempo (TypeScript)

**Date**: 2025-12-30
**Radius SDK Version**: 1.0.0
**Tempo SDK Version**: Latest (from github.com/tempoxyz/tempo-ts)

---

## Executive Summary

The Radius TypeScript SDK and Tempo TypeScript SDK take fundamentally different architectural approaches. Radius builds on **ethers.js v6** with a server-friendly design, while Tempo builds on **viem + wagmi** with React/frontend optimization. Each has distinct strengths.

---

## Architecture Comparison

| Aspect | Radius SDK | Tempo SDK |
|--------|-----------|-----------|
| **Base Library** | ethers.js v6.13.5 | viem v2.43.3+ + wagmi v2.19+ |
| **Pattern** | Direct client method calls | Wagmi actions + React hooks |
| **React Support** | None (vanilla JS/TS) | Full (wagmi hooks, TanStack Query) |
| **Query Caching** | None | TanStack Query built-in |
| **Bundle Style** | ESM + CJS | ESM + CJS |
| **Primary Use Case** | Server-side / Backend | Frontend / React apps |

---

## Core Features Comparison

| Feature | Radius | Tempo | Winner |
|---------|:------:|:-----:|:------:|
| Client creation | Yes | Yes | Tie |
| Private key accounts | Yes (first-class) | Yes (marked "dangerous") | **Radius** |
| WebAuthn/Passkeys | No | Yes | **Tempo** |
| External signer (Clef/HSM) | Yes | No | **Radius** |
| Custom signers | Yes | Yes | Tie |
| Gas estimation | Yes | Yes (via viem) | Tie |
| Transaction signing | Yes (EIP-155) | Yes (EIP-155) | Tie |
| Sync transactions (wait) | Manual | Built-in `*Sync` | **Tempo** |
| Contract deployment | Yes | Not exposed | **Radius** |
| Request logging | Yes (built-in) | Via viem | **Radius** |
| Request interceptors | Yes | No | **Radius** |

---

## Token Operations Comparison

| Feature | Radius | Tempo | Winner |
|---------|:------:|:-----:|:------:|
| Native transfers | Yes | Yes | Tie |
| ERC-20 balance | Manual ABI | Built-in | **Tempo** |
| ERC-20 transfer | Manual ABI | Built-in | **Tempo** |
| ERC-20 approve | Manual ABI | Built-in | **Tempo** |
| Token creation | No | Yes (TIP20) | **Tempo** |
| Token minting | No | Yes | **Tempo** |
| Token burning | No | Yes | **Tempo** |
| Token pausing | No | Yes | **Tempo** |
| Role-based access | No | Yes | **Tempo** |
| Supply caps | No | Yes | **Tempo** |
| Transfer policies | No | Yes | **Tempo** |

---

## Advanced Features Comparison

| Feature | Radius | Tempo | Winner |
|---------|:------:|:-----:|:------:|
| Event subscriptions | No | Yes (`watch*`) | **Tempo** |
| WebSocket support | No | Yes | **Tempo** |
| Batch transactions | No | No | Tie |
| Multi-chain support | No | Yes | **Tempo** |
| Query caching | No | TanStack Query | **Tempo** |
| React hooks | No | Full wagmi | **Tempo** |

---

## What Radius Does Better

### 1. Server-Side / Backend Use
- No browser dependencies
- Works cleanly in Node.js environments
- No React/DOM assumptions

### 2. Private Key Management
- First-class `withPrivateKey()` support
- Not marked as "dangerous" like Tempo
- Designed for programmatic use

### 3. External Signing (Clef)
- Production HSM/hardware wallet support
- JSON-RPC based external signer
- Keys never touch application memory

### 4. Contract Deployment
- Full `deployContract()` API
- Constructor argument encoding
- Returns typed Contract instance

### 5. Request Interceptors
- `withInterceptor()` for custom response handling
- `withLogger()` for debugging RPC calls
- Useful for testing and debugging

### 6. Simpler API Surface
- Fewer abstractions
- Direct method calls
- Easier to understand flow

### 7. Lighter Dependencies
- Only ethers.js as runtime dependency
- Smaller bundle size
- Fewer transitive dependencies

---

## What Tempo Does Better

### 1. React Integration
- Full wagmi hooks ecosystem
- `useQuery`, `useMutation` patterns
- TanStack Query caching

### 2. Event Subscriptions
- Real-time `watch*` functions for all events
- WebSocket transport support
- Automatic reconnection

### 3. Token Helpers
- Built-in TIP20/ERC-20 methods
- No manual ABI setup required
- Type-safe token operations

### 4. Sync Transaction Variants
- `*Sync` methods wait for block confirmation
- Return receipt with parsed events
- More ergonomic async flow

### 5. Query Caching
- TanStack Query integration
- Automatic cache invalidation
- Optimistic updates

### 6. Modern Authentication
- WebAuthn/Passkey support
- P256 cryptography
- Biometric authentication

### 7. Multi-Chain Support
- ChainId parameter throughout
- Easy chain switching
- Multi-network configs

### 8. DeFi Features (Blockchain-Specific)
- DEX order management
- AMM liquidity operations
- Reward/staking system

### 9. Documentation
- More comprehensive JSDoc
- Example blocks in comments
- Better type documentation

---

## Gap Analysis: What Radius SDK Needs

### Priority 1: ERC-20 Helper Class
**Gap**: Developers must manually set up ERC-20 ABI and contract instances.

**Recommendation**: Add `NewERC20(address)` helper:
```typescript
const token = NewERC20(tokenAddress);
const balance = await token.balanceOf(client, account);
await token.transfer(client, signer, recipient, amount);
await token.approve(client, signer, spender, amount);
```

### Priority 2: Event Subscriptions
**Gap**: No way to watch for real-time events (Transfer, Approval, etc.)

**Recommendation**: Add WebSocket support with `watch*` pattern:
```typescript
const unsubscribe = client.watchTransfer(tokenAddress, {
  onTransfer: (from, to, amount) => { ... }
});
```

### Priority 3: Sync Transaction Variants
**Gap**: Must manually wait for transaction receipts.

**Recommendation**: Add `*Sync` methods:
```typescript
// Current (manual)
const receipt = await account.send(client, to, amount);

// New (sync variant)
const { receipt, events } = await account.sendSync(client, to, amount);
```

### Priority 4: React Package
**Gap**: No React hooks or wagmi-style integration.

**Recommendation**: Create `@radiustechsystems/sdk-react`:
```typescript
import { useRadiusClient, useAccount, useBalance } from '@radiustechsystems/sdk-react';

const { balance } = useBalance(address);
const { send, isPending } = useSend();
```

### Priority 5: Multi-Chain Config
**Gap**: Single network per client, no chain switching.

**Recommendation**: Add chainId parameter support:
```typescript
const client = await Client.New(config, { chainId: 1223953 });
await client.switchChain(newChainId);
```

---

## Tempo-Specific Features (Not Applicable to Radius)

These are blockchain-specific to Tempo and not gaps:

| Feature | Description |
|---------|-------------|
| DEX Operations | Order placement, cancellation, orderbook |
| AMM/Liquidity | Pool management, rebalancing |
| Transfer Policies | Whitelist/blacklist enforcement |
| Reward System | Staking rewards distribution |
| Fee Token Config | Custom gas payment tokens |
| Testnet Faucet | Built-in funding mechanism |

---

## Summary

| Category | Radius Strengths | Tempo Strengths |
|----------|-----------------|-----------------|
| **Use Case** | Backend, server-side, scripts | Frontend, React apps |
| **Auth** | Private keys, HSM/Clef | WebAuthn, passkeys |
| **Contracts** | Full deployment API | Token-specific helpers |
| **Events** | None | Full subscription system |
| **React** | None | Full wagmi integration |
| **Caching** | None | TanStack Query |
| **Dependencies** | Minimal (ethers.js) | Heavy (viem, wagmi, tanstack) |

**Recommendation**: Radius SDK is well-positioned for backend/server use. To compete with modern frontend SDKs like Tempo, prioritize adding ERC-20 helpers, event subscriptions, and optionally a React package.
