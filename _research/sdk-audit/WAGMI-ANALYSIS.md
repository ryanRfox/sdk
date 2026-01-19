# WAGMI Integration Analysis

**Date:** 2026-01-18
**Question:** Should WAGMI be included in the Radius SDK?

---

## TL;DR

**Recommendation: Follow Tempo's pattern - remove WAGMI from SDK.**

Tempo.ts only provides server-side handlers. WAGMI has a separate `./tempo` export for Tempo-specific features. Radius should do the same.

---

## What WAGMI Is

WAGMI (We're All Going to Make It) is a React hooks library for Ethereum dApps:

| Feature | Description |
|---------|-------------|
| React Hooks | `useBalance`, `useSendTransaction`, etc. |
| Connectors | MetaMask, WalletConnect, Coinbase, etc. |
| State Management | React Query integration |
| Multi-chain | Config manages multiple chains |

---

## How Tempo Structures Their Ecosystem

```
┌─────────────────────────────────────────────────────────┐
│                       tempo.ts                           │
│  • Server-side only                                      │
│  • Handler.keyManager(), Handler.compose()               │
│  • Kv.memory(), Kv.cloudflare()                         │
│  • NO client, NO hooks, NO WAGMI                        │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Users who want React
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   @wagmi/core/tempo                      │
│  • Tempo-specific WAGMI actions (dex, amm, token, etc.) │
│  • Tempo connectors (webAuthn, secp256k1)               │
│  • KeyManager client (http, localStorage)               │
│  • Maintained by WAGMI team                             │
└─────────────────────────────────────────────────────────┘
```

**Key Insight:** Tempo SDK does NOT include WAGMI. WAGMI includes Tempo support.

---

## Current Radius SDK Structure

```
@radiustechsystems/sdk
├── . (main)          → RadiusClient (standalone)
├── ./chains          → radius, radiusTestnet
├── ./events          → Event subscriptions
├── ./webauthn        → Server handlers (like Tempo)
├── ./react           → React hooks (WRAPS WAGMI)  ← Problem
└── ./wagmi           → privateKeyConnector       ← Problem
```

**The Problem:**

```typescript
// React hooks DON'T use RadiusClient!
export function useRadiusSend() {
  const { sendTransaction } = useSendTransaction();  // ← WAGMI hook
  // ...
}
```

Users have TWO disconnected APIs:
1. `RadiusClient` for non-React
2. WAGMI hooks for React (that don't use RadiusClient)

---

## Options

### Option A: Remove WAGMI (Tempo's Pattern) ✅ Recommended

**Structure:**
```
@radiustechsystems/sdk
├── . (main)          → RadiusClient + chains
├── ./chains          → radius, radiusTestnet
├── ./events          → Event subscriptions
└── ./webauthn        → Server handlers
```

**For React users:**
```typescript
// Users set up WAGMI themselves with Radius chains
import { createConfig, http } from 'wagmi';
import { radius } from '@radiustechsystems/sdk/chains';

const config = createConfig({
  chains: [radius],
  transports: { [radius.id]: http() },
});
```

**Pros:**
- Cleanest separation
- WAGMI users already know WAGMI
- No confusing dual APIs
- Smaller bundle size
- Chains already work with WAGMI

**Cons:**
- Users need to configure WAGMI themselves
- No "batteries included" React experience

---

### Option B: True Radius React Hooks (Custom)

**Structure:**
```
@radiustechsystems/sdk
├── . (main)          → RadiusClient
├── ./react           → Hooks that use RadiusClient (not WAGMI)
└── ...
```

**Implementation:**
```typescript
// Hooks use RadiusClient directly
export function useRadiusSend(client: RadiusClient) {
  // Uses RadiusClient, not WAGMI
}
```

**Pros:**
- Hooks work with RadiusClient
- No WAGMI dependency
- Consistent API

**Cons:**
- Reinventing React Query patterns
- Users can't use standard WAGMI connectors
- More maintenance burden

---

### Option C: Keep WAGMI (Current Pattern)

**Structure:** (current)

**Pros:**
- "Batteries included" for React

**Cons:**
- Confusing: RadiusClient and React hooks are disconnected
- Users expect hooks to use RadiusClient
- Heavier dependency tree

---

## Recommendation

**Go with Option A (Tempo's pattern).**

1. Remove `./react` and `./wagmi` exports
2. Document: "For React apps, use WAGMI with our chain configs"
3. Provide example WAGMI config in docs

**Migration for existing users:**
```typescript
// Before (Radius SDK hooks)
import { useRadiusSend } from '@radiustechsystems/sdk/react';

// After (WAGMI directly)
import { useSendTransaction } from 'wagmi';
import { radius } from '@radiustechsystems/sdk/chains';
```

The change is minimal because the hooks were just thin wrappers anyway.

---

## Decision Needed

**Question for product team:**

Should the SDK:
1. Remove WAGMI/React (follow Tempo) ← Recommended
2. Keep WAGMI/React but document clearly
3. Build custom React hooks that use RadiusClient

This decision should be made before the fix branch is implemented.
