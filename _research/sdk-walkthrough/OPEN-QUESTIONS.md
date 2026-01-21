# Open Questions from SDK Walkthrough

**Date:** 2026-01-19 (Updated)
**Status:** Mostly resolved

---

## Resolved Questions

### Question 1: What is "Tempo"? ✓ RESOLVED

**Answer:** Tempo is a competitor's blockchain. The reference found in `webauthn/internal/requestListener.ts` was a provenance comment from adapted code. This has been removed along with the webauthn module.

---

### Question 2: Why Doesn't Radius Queue Future-Nonce Transactions? ✓ RESOLVED

**Answer from team:**
> "High speed network that expects the client to manage their nonces and connections in a synchronous way."

**Implication:** This is a deliberate design decision for performance, not a limitation. The SDK's `sendTransactionBatch()` method is the correct solution for clients needing to send multiple transactions.

**Documentation recommendation:** Add this explanation to the SDK docs/README to help developers understand why batch transactions are essential on Radius.

---

### Question 3: WebAuthn Module Purpose ✓ RESOLVED

**Answer:** The webauthn module has been **removed from the SDK**. It was server-side authentication infrastructure unrelated to blockchain/viem operations.

See [WEBAUTHN-REMOVAL.md](./WEBAUTHN-REMOVAL.md) for the full decision documentation.

---

### Question 5: Native Currency "USD" ✓ RESOLVED (TBD)

**Answer from team:**
> "This is still TBD, just ignore the base token name for now."

**Action:** No documentation changes needed. The token name may change before mainnet launch.

---

### Question 6: React Hooks / WAGMI ✓ RESOLVED

**Answer:** React and WAGMI modules have been **removed from the SDK**. The industry standard (followed by Base, Optimism, Polygon) is:
- Core SDK = Framework-agnostic (TypeScript + viem)
- React = Use WAGMI directly with Radius chain config

See [WAGMI-REACT-RECOMMENDATION.md](./WAGMI-REACT-RECOMMENDATION.md) for the full analysis.

---

## Remaining Open Questions

### Question 4: MAX_GAS Constant Origin ⚠️ NEEDS CLARIFICATION

**Context:**
From `typescript/src/client/client.ts:157`:
```typescript
export const MAX_GAS = 1319413953330n;
```

**Location found:** The value is hardcoded in `client.ts:157` with the comment:
```typescript
/**
 * Maximum gas limit for transactions.
 * Used to cap gas estimates to prevent unexpectedly high costs.
 */
```

**What the SDK does with it:**
- Used to cap gas estimates (`client.ts:611-612`, `721`, `782-783`)
- Applied as a safety limit to prevent unexpectedly large gas values

**Analysis:** This number (1.3 trillion gas) is oddly specific:
- Ethereum block gas limit: ~30M
- This is 44,000x larger
- Not a round number (1319413953330n = specific hex value?)

**What other SDKs do:**

| SDK | Approach | Details |
|-----|----------|---------|
| **Viem** | No hardcoded max | Relies on chain's block gas limit |
| **Ethers.js** | No hardcoded max | Uses network-reported limits |
| **zkSync SDK** | Fetches from chain | Uses `eth_gasPrice` / chain config |
| **Web3.js** | No hardcoded max | Uses `eth_estimateGas` response directly |

**Common pattern:** Most SDKs fetch the block gas limit from the chain rather than hardcoding a value:
```typescript
const block = await client.getBlock();
const maxGas = block.gasLimit;
```

**Questions for Radius team:**
1. Where does 1319413953330n come from?
2. Is this a Radius protocol constant that can be fetched?
3. Should this be dynamically fetched from `eth_getBlockByNumber().gasLimit`?
4. What happens if this value becomes incorrect?

**Recommendation:** Consider replacing the hardcoded value with a dynamic fetch:
```typescript
// Option A: Fetch from chain at client creation
const block = await publicClient.getBlock();
const maxGas = block.gasLimit;

// Option B: Use a more conservative fixed value
const MAX_GAS = 30_000_000n; // Match Ethereum mainnet

// Option C: Fetch from Radius-specific RPC method (if available)
const maxGas = await client.request({ method: 'radius_getMaxGas' });
```

**Status:** Needs clarification from Radius team

---

## Resolution Status

| Question | Status | Resolution |
|----------|--------|------------|
| Q1: Tempo identity | ✓ Resolved | Competitor blockchain - references removed |
| Q2: Nonce behavior | ✓ Resolved | Design decision for high-speed network |
| Q3: WebAuthn purpose | ✓ Resolved | Module removed from SDK |
| Q4: MAX_GAS origin | ⚠️ Open | Needs clarification - recommend dynamic fetch |
| Q5: USD currency | ✓ Resolved | TBD - ignore for now |
| Q6: React/WAGMI | ✓ Resolved | Modules removed from SDK |
