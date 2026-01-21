# Viem vs Radius SDK - Pattern Comparison

**Date:** 2026-01-21
**SDK Version:** v2.0.0-alpha.7

This document provides side-by-side comparisons for developers using viem with the Radius SDK.

---

## Key Finding: Raw Viem Works

**Important:** Raw viem works for most operations on Radius Network without any special configuration. The SDK provides a decorator for batch transactions and utilities for log queries, but is **not required** for basic functionality.

See [VIEM-RADIUS-TEST-RESULTS.md](./VIEM-RADIUS-TEST-RESULTS.md) for proof with transaction hashes.

---

## When to Use What

| Task | Raw Viem | Radius SDK | Notes |
|------|----------|------------|-------|
| Read balance | Works | Works | Identical |
| Read contract state | Works | Works | Identical |
| Send single transaction | **Works** | Works | Both use standard viem |
| Send multiple transactions | **Fails** (parallel) | **Required** | Use `sendTransactionBatch` |
| Query historical logs | May fail (large ranges) | Recommended | SDK handles chunking |
| Watch events | Works | Works | SDK has typed wrappers |
| Deploy contracts | Works | Works | Standard viem |
| All transaction types | **Works** | Works | Legacy, EIP-2930, EIP-1559 all work |

---

## SDK Architecture (V2)

The SDK follows viem's decorator pattern. There is **no RadiusClient class** - you use standard viem clients extended with Radius-specific actions.

```
@radiustechsystems/sdk/
├── chains/            # Chain definitions (radiusTestnet)
├── decorators/        # Client extension decorators (radiusWalletActions)
├── actions/           # Standalone action functions
├── events/            # Event watching and log utilities
└── transport/         # WebSocket transport utilities
```

---

## Pattern Comparisons

### Creating a Client

**Raw Viem (works fine for read operations and single transactions):**
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
```

**With Radius SDK (for batch transactions):**
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Add .extend(radiusWalletActions()) for sendTransactionBatch
const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());
```

---

### Sending a Single Transaction

**Both approaches are identical:**
```typescript
// This works with raw viem OR SDK-extended client
const hash = await walletClient.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n,
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

**Verdict:** Both work identically. No SDK advantage for single transactions.

---

### Transaction Types (All Work)

**All of these work on Radius:**

```typescript
// Legacy (Type 0)
await walletClient.sendTransaction({
  to, value,
  type: 'legacy',
  gasPrice: 0n,
});

// EIP-2930 (Type 1)
await walletClient.sendTransaction({
  to, value,
  type: 'eip2930',
  accessList: [],
  gasPrice: 0n,
});

// EIP-1559 (Type 2)
await walletClient.sendTransaction({
  to, value,
  type: 'eip1559',
  maxFeePerGas: 0n,
  maxPriorityFeePerGas: 0n,
});

// Default (viem chooses EIP-1559, works fine)
await walletClient.sendTransaction({ to, value });
```

**Verdict:** Radius supports all transaction types. No restrictions.

---

### Sending Multiple Transactions

**Raw Viem - Sequential (works but slow):**
```typescript
const hash1 = await walletClient.sendTransaction({ to: addr1, value: 1n });
const hash2 = await walletClient.sendTransaction({ to: addr2, value: 2n });
const hash3 = await walletClient.sendTransaction({ to: addr3, value: 3n });
// Works but ~350ms per transaction
```

**Raw Viem - Parallel (FAILS):**
```typescript
// This FAILS on Radius due to nonce collision
const hashes = await Promise.all([
  walletClient.sendTransaction({ to: addr1, value: 1n }),
  walletClient.sendTransaction({ to: addr2, value: 2n }),
  walletClient.sendTransaction({ to: addr3, value: 3n }),
]);
// Error: nonce collision - Radius doesn't queue future nonces
```

**Radius SDK (correct approach for parallel):**
```typescript
// Client must be extended with radiusWalletActions()
const hashes = await walletClient.sendTransactionBatch({
  transactions: [
    { to: addr1, value: 1n },
    { to: addr2, value: 2n },
    { to: addr3, value: 3n },
  ],
});
// All transactions sent in single JSON-RPC batch with sequential nonces

// Wait for all receipts (standard viem pattern)
const receipts = await Promise.all(
  hashes.map(hash => publicClient.waitForTransactionReceipt({ hash }))
);
```

**Verdict:** **SDK required for parallel transactions.** This is the primary SDK feature.

---

### Waiting for Batch Receipts

The SDK follows viem convention - compose primitives with `Promise.all()`:

```typescript
// Send batch
const hashes = await walletClient.sendTransactionBatch({
  transactions: [
    { to: addr1, value: 1n },
    { to: addr2, value: 2n },
  ],
});

// Wait for all receipts using standard viem
const receipts = await Promise.all(
  hashes.map(hash => publicClient.waitForTransactionReceipt({ hash }))
);

// Check all succeeded
const allSucceeded = receipts.every(r => r.status === 'success');
```

---

### Reading Contract State

**Identical API:**
```typescript
const balance = await publicClient.readContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [ownerAddress],
});
```

**Verdict:** Identical API. Either works.

---

### Historical Log Queries

**Raw Viem (may fail on large ranges):**
```typescript
const logs = await publicClient.getLogs({
  address: contractAddress,
  fromBlock: 1000000n,
  toBlock: 1100000n,  // 100k blocks - may exceed Radius limit
});
// Error: "block range is too wide"
```

**Radius SDK (handles chunking):**
```typescript
import { getLogs } from '@radiustechsystems/sdk/events';

const logs = await getLogs(publicClient, {
  address: contractAddress,
  fromBlock: 1000000n,
  toBlock: 1100000n,
  chunkSize: 1000,  // Queries in 1000-block chunks
  onProgress: ({ currentBlock, totalBlocks, logsFetched }) => {
    console.log(`Progress: ${logsFetched} logs found`);
  },
});
```

**Adaptive Log Queries (auto-adjusting chunk size):**
```typescript
import { getLogsAdaptive } from '@radiustechsystems/sdk/events';

// Automatically reduces chunk size on "block range too wide" errors
const logs = await getLogsAdaptive(publicClient, {
  address: contractAddress,
  fromBlock: 1000000n,
  toBlock: 1100000n,
});
```

**Verdict:** SDK recommended for large block ranges.

---

### Deploying Contracts

**Standard viem (works):**
```typescript
const hash = await walletClient.deployContract({
  abi: contractAbi,
  bytecode: '0x...',
  args: [constructorArg1, constructorArg2],
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
const contractAddress = receipt.contractAddress;
```

**Verdict:** Standard viem works. No SDK needed.

---

### WAGMI Integration

**Use Radius chains directly with WAGMI:**

```typescript
import { createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const config = createConfig({
  chains: [radiusTestnet],
  transports: {
    [radiusTestnet.id]: http(),
  },
});

// Standard WAGMI hooks work
const { data: balance } = useBalance({ address: '0x...' });
const { sendTransaction } = useSendTransaction();
```

**Note:** For batch transactions in React apps, import and use `sendTransactionBatch` from the SDK directly.

---

## Summary Table

| Feature | Raw Viem | Radius SDK | Winner |
|---------|----------|------------|--------|
| Single transaction | Works | Works | Tie |
| All tx types | Works | Works | Tie |
| Parallel transactions | Fails | Works | **SDK** |
| Large log queries | May fail | Works | **SDK** |
| Contract reads | Works | Works | Tie |
| Contract writes | Works | Works | Tie |
| Contract deploys | Works | Works | Tie |
| Bundle size | Smaller | Larger | Viem |

---

## Recommendation

**For most projects:**
1. Use raw viem for simple operations (reads, single transactions)
2. Add `.extend(radiusWalletActions())` for batch transactions
3. Import `getLogs`/`getLogsAdaptive` from SDK for large historical queries
4. Use Radius chain config from SDK

**Minimal setup:**
```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
import { getLogs } from '@radiustechsystems/sdk/events';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());
```
