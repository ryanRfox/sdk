# SDK V2 Developer Walkthrough

**Date:** 2026-01-19 (Updated)
**Scope:** TypeScript SDK v2.0.0-alpha.6 (main branch)
**Audience:** Developers familiar with Viem learning Radius SDK

---

## Key Finding

**The Radius SDK is largely optional for basic operations.** Standard viem works without any special configuration on Radius Network.

The SDK provides value for:
1. **Batch transactions** (`sendTransactionBatch`) - Essential for no-mempool environment
2. **Chain configuration** - Radius chains not yet in viem registry
3. **Block range handling** - `getLogs` for historical queries with chunking
4. **Convenience methods** - `sendAndWait`, `deployContract`, etc.

---

## What Works with Raw Viem

| Operation | Raw Viem | Radius SDK |
|-----------|----------|------------|
| Read operations | Works | Works |
| Single transactions | Works | Works |
| All tx types (Legacy, EIP-2930, EIP-1559) | Works | Works |
| Parallel transactions | **Fails** (nonce collision) | Use `sendTransactionBatch` |
| Historical logs (large range) | May fail | Use `getLogs` with chunking |

---

## Documentation

| File | Description |
|------|-------------|
| [MODULE-ARCHITECTURE.md](./MODULE-ARCHITECTURE.md) | Module-by-module breakdown with code references |
| [VIEM-COMPARISON.md](./VIEM-COMPARISON.md) | Side-by-side Viem vs Radius patterns |
| [VIEM-RADIUS-TEST-RESULTS.md](./VIEM-RADIUS-TEST-RESULTS.md) | Comprehensive test results with transaction hashes |
| [PUBLICCLIENT-FINDINGS.md](./PUBLICCLIENT-FINDINGS.md) | What works with raw viem |
| [EIP1559-RESEARCH.md](./EIP1559-RESEARCH.md) | Transaction type support testing |
| [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) | Remaining questions |

---

## Module Summary

```
src/
├── chains/       ← Chain definitions (use instead of viem/chains)
├── client/       ← RadiusClient - only essential for batch transactions
├── contracts/    ← Typed contract helper with read/write namespaces
├── errors/       ← Rich error hierarchy extending viem's BaseError
├── events/       ← Event subscriptions with Radius block range handling
└── transport/    ← HTTP interceptors for logging/debugging
```

**Removed modules:** `webauthn/`, `react/`, `wagmi/` (out of scope for blockchain SDK)

---

## Quick Reference for Viem Developers

### Option 1: Raw Viem (Works for Most Cases)

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
});

// This just works - no special config needed
const hash = await walletClient.sendTransaction({
  to: recipient,
  value: amount,
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

### Option 2: RadiusClient (For Batch Transactions)

```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const account = privateKeyToAccount('0x...');

// CRITICAL: For multiple transactions, use batch (nonce ordering)
// This cannot be done reliably with raw viem
const hashes = await client.sendTransactionBatch(account, [
  { to: addr1, value: 1n },
  { to: addr2, value: 2n },
]);
```

### Events Module (For Large Log Queries)

```typescript
import { getLogs } from '@radiustechsystems/sdk/events';

const logs = await getLogs(publicClient, {
  address: contractAddress,
  fromBlock: 1000000n,
  toBlock: 1010000n,
  chunkSize: 1000,  // Handles Radius block range restrictions
});
```

---

## Key Differences from Ethereum

| Behavior | Ethereum | Radius |
|----------|----------|--------|
| Transaction types | All supported | All supported (Legacy, EIP-2930, EIP-1559) |
| Gas price | Market-based | Zero (gasless) |
| Mempool | Queues future nonces | No mempool - rejects future nonces |
| Native currency | ETH | USD (18 decimals) |

---

## Related Research

- [SDK Audit](../sdk-audit/) - Code quality and standards compliance
- [Transaction Behavior](../transaction-behavior/) - Nonce ordering discovery
- [Release Planning](../release-planning/) - V2 alpha roadmap

---

## Open Questions

See [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) for remaining items:

1. Why doesn't Radius queue future-nonce transactions?
2. Where does the `MAX_GAS` constant (1319413953330n) come from?
3. USD native currency - what's the value model?
