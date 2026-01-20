# Open Questions from SDK Walkthrough

**Date:** 2026-01-19
**Status:** Awaiting clarification

These questions arose during the SDK V2 walkthrough and require input to fully document the SDK.

---

## Question 1: What is "Tempo"?

### Context

The SDK audit references "Tempo.ts" as a comparison point:

> "The Radius V2 SDK is a TypeScript library... modeled after [Tempo.ts](https://github.com/tempo-ts)"

The migration guide shows V1 was published under `@aspect-build/radius-sdk`.

### Investigation

- The URL `https://github.com/tempo-ts` does not exist
- The URL `https://github.com/aspect-build/radius-sdk` returns 404
- No public npm package found under these names

### Questions

1. Was "Tempo" an internal codename for the V1 SDK?
2. Is there a different repository URL for the Tempo reference?
3. Should we remove Tempo references from documentation since the repo is inaccessible?

### Impact

Without access to Tempo, we cannot:
- Verify that WebAuthn patterns match
- Compare API design decisions
- Document migration paths for Tempo users

---

## Question 2: Why Doesn't Radius Queue Future-Nonce Transactions?

### Context

From `client.ts:317-319`:
> "Radius does not queue future-nonce transactions like Ethereum."

This is a significant behavioral difference that affects how developers must structure multi-transaction workflows.

### Questions

1. Is this a fundamental Radius protocol design decision, or a current limitation?
2. What is the technical reason? (No mempool? Different consensus mechanism?)
3. Will this behavior change in the future?
4. Should this be documented more prominently (it's currently only in code comments)?

### Impact

This behavior is the primary reason the SDK exists. Without `sendTransactionBatch()`, multi-transaction workflows would be unreliable.

---

## Question 3: WebAuthn Module Purpose

### Context

The `webauthn/` module provides server-side passkey credential management:
- Challenge generation
- Public key storage
- Relying party configuration

This is not related to Viem or blockchain interactions.

### Questions

1. Is this module intended for a specific Radius product (e.g., embedded wallet)?
2. Why is it bundled with the SDK rather than a separate package?
3. Are there frontend/client components that pair with this server module?
4. What's the typical use case? Account abstraction wallets? SSO?

### Impact

Without context, it's difficult to:
- Write appropriate documentation
- Understand how it fits into the Radius ecosystem
- Know if it's production-ready or experimental

---

## Question 4: MAX_GAS Constant Origin

### Context

From `client.ts:156`:
```typescript
export const MAX_GAS = 1319413953330n;
```

This number (1.3 trillion gas) is oddly specific:
- Ethereum block gas limit: ~30M
- This is 44,000x larger
- Not a round number

### Questions

1. Where does this specific value come from?
2. Is it a Radius protocol constant?
3. Why not use a round number or fetch from the network?
4. Is there a risk this becomes outdated?

### Impact

If this value is wrong or changes, gas estimation could fail silently.

---

## Question 5: Native Currency "USD"

### Context

From `chains/radiusTestnet.ts`:
```typescript
nativeCurrency: {
  decimals: 18,
  name: 'USD',
  symbol: 'USD',
}
```

This is unusual:
- Most chains use their own token (ETH, MATIC, etc.)
- "USD" suggests US dollars
- 18 decimals is not standard for USD stablecoins (usually 6)

### Questions

1. Is this actually a USD-pegged stablecoin?
2. Why 18 decimals instead of 6?
3. What is the value model? 1 USD token = 1 USD?
4. How does gas pricing work with free gas but USD denomination?

### Impact

Users may be confused about:
- The actual value of tokens
- How to display balances appropriately
- Whether this is a "real" dollar

---

## Question 6: React Hooks Relationship to RadiusClient

### Context

The SDK has two parallel APIs:
1. `RadiusClient` - standalone client with convenience methods
2. React hooks in `/react` - WAGMI wrappers

The React hooks use WAGMI, not `RadiusClient`:
```typescript
// hooks/useRadiusSend.ts
export function useRadiusSend(): UseRadiusSendReturn {
  const { sendTransaction } = useSendTransaction();  // WAGMI hook
  // ...
}
```

### Questions

1. Why don't the React hooks use `RadiusClient`?
2. Do WAGMI transactions automatically handle `gasPrice: 0n`?
3. What about multi-transaction scenarios in React apps?
4. Is there a recommended pattern for using `sendTransactionBatch` in React?

### Impact

React developers may be confused about which API to use and whether they get Radius-specific behaviors through WAGMI.

---

## Resolution Status

| Question | Status | Assigned To |
|----------|--------|-------------|
| Q1: Tempo identity | Pending | - |
| Q2: Nonce behavior | Pending | - |
| Q3: WebAuthn purpose | Pending | - |
| Q4: MAX_GAS origin | Pending | - |
| Q5: USD currency | Pending | - |
| Q6: React/WAGMI | Pending | - |

---

## How to Resolve

For each question, please provide:
1. A direct answer
2. Whether this should be documented publicly
3. Suggested documentation location (README, guides, API docs, etc.)
