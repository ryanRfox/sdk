# SDK V2 Developer Walkthrough

**Date:** 2026-01-19
**Scope:** TypeScript SDK v2.0.0-alpha.6 (main branch)
**Audience:** Developers familiar with Viem/WAGMI learning Radius SDK

---

## Key Finding

The Radius V2 SDK is a thin wrapper around Viem that handles Radius-specific behaviors. A Viem developer can be productive immediately, with these key differences:

| Area | Viem Default | Radius SDK Behavior |
|------|--------------|---------------------|
| Gas price | Fetched from network | Hardcoded `0n` (free gas) |
| Transaction batching | Mempool queues future nonces | Must use `sendTransactionBatch()` |
| Block range queries | Unlimited | Restricted - use `getLogs()` from events module |
| Native currency | ETH (or chain-specific) | USD (18 decimals) |
| Chain registry | `viem/chains` | `@radiustechsystems/sdk/chains` |

---

## Documentation

| File | Description |
|------|-------------|
| [MODULE-ARCHITECTURE.md](./MODULE-ARCHITECTURE.md) | Complete module-by-module breakdown with code references |
| [VIEM-COMPARISON.md](./VIEM-COMPARISON.md) | Side-by-side Viem vs Radius patterns |
| [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) | Unresolved questions from walkthrough |

---

## Module Summary

```
src/
├── chains/       ← Chain definitions (use instead of viem/chains)
├── client/       ← RadiusClient with convenience methods
├── contracts/    ← Typed contract helper with read/write namespaces
├── errors/       ← Rich error hierarchy extending viem's BaseError
├── events/       ← Event subscriptions with Radius block range handling
├── transport/    ← HTTP interceptors for logging/debugging
└── webauthn/     ← Server-side passkey management (not Viem-related)
```

---

## Quick Reference for Viem Developers

### What Works Unchanged

```typescript
// Chain definitions work with standard viem clients
import { createPublicClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Standard viem operations work
const balance = await publicClient.getBalance({ address: '0x...' });
```

### What Requires SDK

```typescript
// For transactions, use RadiusClient (handles zero gas price)
import { createRadiusClient, privateKeyToAccount } from '@radiustechsystems/sdk';

const client = createRadiusClient({ chain: radiusTestnet });
const account = privateKeyToAccount('0x...');

// Convenience method with auto-wait
const receipt = await client.sendAndWait(account, recipient, amount);

// CRITICAL: For multiple transactions, use batch (nonce ordering)
const hashes = await client.sendTransactionBatch(account, [
  { to: addr1, value: 1n },
  { to: addr2, value: 2n },
]);
```

### What Requires Events Module

```typescript
// Historical log queries with block range chunking
import { getLogs } from '@radiustechsystems/sdk/events';

const logs = await getLogs(publicClient, {
  address: contractAddress,
  fromBlock: 1000000n,
  toBlock: 1010000n,
  chunkSize: 1000,  // Radius restricts block ranges
});
```

---

## Related Research

- [SDK Audit](../sdk-audit/) - Code quality and standards compliance
- [Transaction Behavior](../transaction-behavior/) - Nonce ordering discovery
- [Release Planning](../release-planning/) - V2 alpha roadmap

---

## Open Questions

See [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) for unresolved items requiring clarification:

1. What is "Tempo"? (Referenced as comparison point but repo not found)
2. Why doesn't Radius queue future-nonce transactions?
3. Is the WebAuthn module for a specific Radius product?
