# SDK V2 Architecture Audit

**Date:** 2026-01-18
**Scope:** TypeScript SDK v2.0.0-alpha.5
**Compared Against:** Tempo.ts, WAGMI, viem patterns

---

## Key Finding

| Area | Status | Notes |
|------|--------|-------|
| Chain definitions | ✅ Correct | Uses viem's `defineChain()` properly |
| WebAuthn handlers | ✅ Correct | Matches Tempo.ts pattern |
| Error hierarchy | ✅ Correct | Rich error classes with `.walk()` |
| TypeScript/ESM | ✅ Correct | Strict mode, proper exports |
| Client pattern | ⚠️ Different | Custom `RadiusClient` vs viem actions |
| WAGMI integration | ⚠️ Confusing | React hooks require WAGMI, not RadiusClient |
| Transport naming | 🔧 Fix needed | Go-style naming (`Logf`, `RoundTripper`) |
| Documentation | 🔧 Fix needed | Export path mismatch in examples |

---

## Documentation

| File | Description |
|------|-------------|
| [SDK-ARCHITECTURE.md](./SDK-ARCHITECTURE.md) | Full architecture explainer and directory breakdown |
| [AUDIT-FINDINGS.md](./AUDIT-FINDINGS.md) | Detailed audit findings with recommendations |
| [WAGMI-ANALYSIS.md](./WAGMI-ANALYSIS.md) | Analysis of WAGMI inclusion decision |

---

## Related Research

- [Transaction Behavior](../transaction-behavior/) - Nonce ordering and batch transaction findings

---

## Impact on SDK

This audit identified several issues requiring fixes:
1. Go-inspired naming needs TypeScript idioms
2. Documentation path mismatch (`/server` vs `/webauthn`)
3. WebAuthn validation differences from Tempo
4. Dual API confusion (`call/execute` vs `readContract/writeContract`)
5. viem in devDependencies instead of dependencies
6. Missing `http` re-export

See [fix/v2-audit branch](../../) for implementation.
