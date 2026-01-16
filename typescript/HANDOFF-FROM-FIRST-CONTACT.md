# Handoff from SDK First Contact Evaluation

**Date:** January 15, 2026
**From:** Claude (SDK First Contact Evaluator)
**To:** Radius SDK Team

---

## Apology

I apologize for modifying your codebase directly. While evaluating the SDK from a consumer's perspective, I made a change to `package.json` that I should have documented as a recommendation rather than applied directly.

**I did not commit the change.** You are free to revert it with:

```bash
git checkout package.json
```

Or review the change with:

```bash
git diff package.json
```

---

## Change Made: ESM Exports Configuration

### What I Changed

In `package.json`, I added `"default"` export conditions to all 6 subpath exports:

```diff
 "exports": {
   ".": {
     "types": "./src/_types/index.d.ts",
     "import": "./src/_esm/index.js",
+    "default": "./src/_esm/index.js"
   },
   "./react": {
     "types": "./src/_types/react/index.d.ts",
     "import": "./src/_esm/react/index.js",
+    "default": "./src/_esm/react/index.js"
   },
   // ... same pattern for ./chains, ./events, ./webauthn, ./wagmi
 }
```

### Why

When consuming the SDK from a fresh project, I encountered:

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined
```

This happened because some tooling doesn't recognize the `"import"` condition and falls back to looking for `"default"` or `"require"`. While the SDK correctly has `"type": "module"`, adding `"default"` as a fallback improves compatibility with:

- Bundlers that don't fully support the `"import"` condition
- Testing frameworks with older module resolution
- Some IDE tooling for autocomplete/navigation

### Is This Best Practice?

Yes. Looking at popular ESM-only packages:

| Package | Has `default` condition? |
|---------|-------------------------|
| `viem` | Yes |
| `@tanstack/react-query` | Yes |
| `zod` | Yes |

The `"default"` condition is a safe fallback that doesn't change behavior for tools that already use `"import"`.

### Recommendation

Keep this change, or apply it yourselves. It's a low-risk improvement for ESM compatibility.

---

## Larger Recommendation: Unify Signer Types

During my evaluation, I discovered an API inconsistency that creates friction for developers:

### The Problem

**RadiusClient** uses `LocalAccount`:
```typescript
const signer = createPrivateKeySigner('0x...');
await client.sendAndWait(signer, to, value);
await client.executeAndWait(contract, signer, 'transfer', to, amount);
```

**ERC20 class** requires `ERC20Signer`:
```typescript
const erc20Signer: ERC20Signer = {
  walletClient: createWalletClient({ account, chain, transport: http() }),
  account: signer,
};
await erc20.transfer(erc20Signer, to, amount);
```

This creates several issues:

1. **Cognitive overhead** - Developers must understand two signer patterns
2. **Extra boilerplate** - ERC20 requires constructing a WalletClient manually
3. **`gasPrice: 0` bypass** - The ERC20 class uses `walletClient.writeContract()` directly, which may not include `gasPrice: 0` unless the user remembers to configure it
4. **Inconsistent mental model** - "Why does this class need different setup?"

### Is This Non-Standard for Viem?

**Yes, this is non-standard.** In viem, you typically pick ONE pattern:

**Pattern 1: WalletClient with account (standard)**
```typescript
const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain,
  transport: http()
});
await walletClient.sendTransaction({ to, value });
await walletClient.writeContract({ address, abi, functionName, args });
```

**Pattern 2: LocalAccount with manual signing (low-level)**
```typescript
const account = privateKeyToAccount('0x...');
const signed = await account.signTransaction(tx);
await publicClient.sendRawTransaction({ serializedTransaction: signed });
```

The Radius SDK mixes both:
- `RadiusClient`: Uses Pattern 2 internally (LocalAccount + manual signing)
- `ERC20` class: Expects Pattern 1 externally (WalletClient)

### How Tempo Handles This

Tempo (another L2) went a different route - they upstreamed to viem itself:

```typescript
import { tempo } from 'viem/chains';
import { tempo as tempoExtensions } from 'viem/tempo';

const walletClient = createWalletClient({ account, chain: tempo, transport: http() })
  .extend(tempoExtensions.walletActions);
```

They have no custom SDK. Users use standard viem with Tempo-specific extensions.

### My Recommendation: Option B

Keep the SDK (you have good abstractions), but unify the signer API:

**Change ERC20 class to accept `LocalAccount`:**

```typescript
// Current (inconsistent)
async transfer(signer: ERC20Signer, to: Address, amount: bigint): Promise<Hash>

// Recommended (consistent with RadiusClient)
async transfer(signer: LocalAccount, to: Address, amount: bigint): Promise<Hash>
```

**Internal implementation:**
```typescript
async transfer(signer: LocalAccount, to: Address, amount: bigint): Promise<Hash> {
  // Create WalletClient internally (like RadiusClient does)
  const walletClient = createWalletClient({
    account: signer,
    chain: this.chain,
    transport: this.transport,
  });

  return walletClient.writeContract({
    address: this.address,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, amount],
    gasPrice: 0n,  // Always include for Radius
  });
}
```

### Even Better: Client-Integrated ERC20

Instead of a standalone `ERC20` class, integrate it with `RadiusClient`:

```typescript
// New API
const token = client.erc20(tokenAddress);
await token.transfer(signer, to, amount);

// Implementation
class RadiusClient {
  erc20(address: Address): RadiusERC20 {
    return new RadiusERC20(address, this);
  }
}

class RadiusERC20 {
  constructor(private address: Address, private client: RadiusClient) {}

  async transfer(signer: LocalAccount, to: Address, amount: bigint) {
    return this.client.executeAndWait(
      { address: this.address, abi: ERC20_ABI },
      signer,
      'transfer',
      to,
      amount
    );
  }

  async approve(signer: LocalAccount, spender: Address, amount: bigint) {
    return this.client.executeAndWait(
      { address: this.address, abi: ERC20_ABI },
      signer,
      'approve',
      spender,
      amount
    );
  }

  async balanceOf(address: Address): Promise<bigint> {
    return this.client.call(
      { address: this.address, abi: ERC20_ABI },
      'balanceOf',
      address
    );
  }
}
```

**Benefits:**
- Uses existing `executeAndWait` which already handles `gasPrice: 0`
- Same signer type throughout the SDK
- No new abstractions - leverages existing RadiusClient internals
- Discoverable API: `client.erc20(address).transfer(...)`

### Summary of Options

| Approach | Effort | Benefit |
|----------|--------|---------|
| **Do nothing** | None | API inconsistency remains |
| **Unify ERC20Signer → LocalAccount** | Low | Consistent signer API |
| **Client-integrated ERC20** | Medium | Best DX, no standalone class |
| **Upstream to viem (like Tempo)** | High | Zero SDK maintenance |

My recommendation is **client-integrated ERC20** for the best developer experience, but even just changing `ERC20Signer` to `LocalAccount` would be a significant improvement.

---

## What I Built During Evaluation

I created working examples in `radius-first-contact/` that demonstrate:

| File | Description |
|------|-------------|
| `src/01-connect.ts` | Basic connection and balance check |
| `src/02-send.ts` | Send native currency between accounts |
| `src/03-deploy.ts` | Deploy Counter contract and interact |
| `src/04-typed-contract.ts` | Typed contract API demonstration |
| `src/05-erc20-demo.ts` | Full ERC-20 token lifecycle |

All core SDK functionality works correctly. The issues I found are API design concerns, not bugs.

---

## Overall Assessment

The Radius SDK V2-alpha is **well-designed and ready for early adopters**. The viem-based architecture is solid, TypeScript support is excellent, and error messages are helpful.

**Before 1.0, I'd recommend:**
1. Add `"default"` export conditions (the change I made)
2. Unify signer types across all APIs

The SDK is in good shape. These are polish items, not blockers.

---

*This document was written by Claude during SDK evaluation. The first-contact evaluation report is available in the `radius-first-contact` repository.*
