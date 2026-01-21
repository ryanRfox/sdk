# SDK V2 Research Summary

**Date:** 2026-01-19
**Branch:** v2-walkthru (research), main (code changes)
**Author:** Claude Code

---

## Executive Summary

This research investigated the Radius V2 SDK to determine:
1. What value it provides vs raw viem
2. How to simplify/improve the SDK
3. Whether to pursue viem upstream integration

### Key Findings

| Finding | Impact |
|---------|--------|
| **Raw viem works on Radius** | SDK is optional for basic operations |
| **All tx types supported** | EIP-1559 works (previous "legacy only" claim was wrong) |
| **sendTransactionBatch is essential** | Only SDK feature with no viem equivalent |
| **viem extend pattern works** | Can add radiusActions() decorator |
| **webauthn removed** | Out of scope for blockchain SDK |

---

## Code Changes Merged to Main

### Commit: `19dc91e` - Remove webauthn module

**Files removed:** 60 files, -5,445 lines

- `typescript/src/webauthn/` - Entire module
- `typescript/docs/api/webauthn/` - API docs
- `typescript/docs/guides/server.mdx` - Server guide
- `@remix-run/fetch-router` dependency
- JSX config from tsconfig

**Reason:** Server-side auth infrastructure unrelated to blockchain operations.

---

## Research Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Overview and quick reference |
| [VIEM-RADIUS-TEST-RESULTS.md](./VIEM-RADIUS-TEST-RESULTS.md) | Comprehensive test results with tx hashes |
| [VIEM-COMPARISON.md](./VIEM-COMPARISON.md) | Side-by-side raw viem vs SDK patterns |
| [VIEM-UPSTREAM-ANALYSIS.md](./VIEM-UPSTREAM-ANALYSIS.md) | How to become part of viem ecosystem |
| [VIEM-EXTENSION-PATTERN.md](./VIEM-EXTENSION-PATTERN.md) | How to add radiusActions() decorator |
| [MODULE-ARCHITECTURE.md](./MODULE-ARCHITECTURE.md) | Module-by-module breakdown |
| [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) | Questions and answers |
| [EIP1559-RESEARCH.md](./EIP1559-RESEARCH.md) | Transaction type support proof |

---

## Key Technical Findings

### 1. Raw Viem Works on Radius

**Test Results:**
```
Total: 21 | Passed: 17 | Failed: 4

Failures (expected):
- Parallel WalletClient (nonce collision - expected)
- Contract tests (test bytecode issue, not Radius)
```

**Proof (real tx hashes):**
| Type | Hash |
|------|------|
| Legacy | `0x2dee8d057f6a82a9d21e39ed54f7fdbb7d5a99846ff04ee47873d30f3c5a2bab` |
| EIP-2930 | `0xed67793e598729fa3d34f779f1b03f815664f54486f585744ecd2dd95d2f6cf2` |
| EIP-1559 | `0xd3ce5f49e26fa35a2f52fd224fc9e9b1c071fbe19966d5aa779f0181bfd62633` |

### 2. sendTransactionBatch is Essential

Radius has no mempool - expects synchronous nonce management:
```typescript
// This FAILS (parallel sends cause nonce collision)
const hashes = await Promise.all([
  walletClient.sendTransaction({ to: addr1, value: 1n }),
  walletClient.sendTransaction({ to: addr2, value: 2n }),
]);

// This WORKS (SDK handles nonces)
const hashes = await client.sendTransactionBatch(account, [
  { to: addr1, value: 1n },
  { to: addr2, value: 2n },
]);
```

### 3. Viem Extend Pattern Can Add radiusActions()

```typescript
// Proposed API
import { radiusActions } from '@radiustechsystems/sdk';

const client = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusActions());

// Now has sendTransactionBatch
const hashes = await client.sendTransactionBatch({
  account,
  transactions: [{ to, value }],
});
```

---

## Recommendations

### Immediate Actions

1. **Document no-mempool behavior** - Users need to understand why batch transactions are essential
2. **Add radiusActions() export** - Allow extending viem clients
3. **Keep RadiusClient** - For users wanting unified SDK experience

### Future Considerations

1. **Submit basic chain to viem** - Get into `viem/chains`
2. **Consider full viem integration** - If Radius has unique features (encrypted tx, etc.)
3. **Clarify MAX_GAS** - Replace hardcoded value with dynamic fetch

### SDK Structure Recommendation

```
@radiustechsystems/sdk
├── /chains       ← Keep (viem chain definitions)
├── /client       ← Keep but simplify (RadiusClient)
├── /decorators   ← NEW (radiusActions for extend pattern)
├── /actions      ← NEW (standalone action functions)
├── /events       ← Keep (block range chunking)
├── /errors       ← Keep (rich error types)
└── /transport    ← Keep (interceptors)
```

---

## Open Items

### Still Needs Clarification

| Item | Status |
|------|--------|
| MAX_GAS value origin (1319413953330n) | Unknown - recommend dynamic fetch |
| USD native currency details | TBD per team |

### Resolved

| Item | Resolution |
|------|------------|
| Tempo reference | Competitor blockchain - removed |
| WebAuthn purpose | Removed from SDK |
| React/WAGMI | Removed (use WAGMI directly) |
| Nonce behavior | Design decision for high-speed network |

---

## Test Scripts

Located at `_research/sdk-walkthrough/test-scripts/`:

| Script | Purpose |
|--------|---------|
| `viem-radius-comprehensive-test.ts` | Full test of all operations |
| `publicclient-test.ts` | PublicClient vs RadiusClient comparison |
| `debug-tx-difference.ts` | Transaction type analysis |
| `final-tx-test.ts` | Isolated parameter testing |

Run with:
```bash
cd typescript && npx tsx ../_research/sdk-walkthrough/test-scripts/viem-radius-comprehensive-test.ts
```

---

## Branch Summary

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production code | Has webauthn removal commit |
| `v2-walkthru` | Research + code | Complete research documentation |
| `research/findings` | Original research | Merged into v2-walkthru |
