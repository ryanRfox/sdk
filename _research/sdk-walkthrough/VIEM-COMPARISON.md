# Viem vs Radius SDK - Pattern Comparison

**Date:** 2026-01-19
**SDK Version:** v2.0.0-alpha.6

This document provides side-by-side comparisons for developers migrating from pure Viem to the Radius SDK.

---

## When to Use What

| Task | Use Viem Directly | Use Radius SDK |
|------|-------------------|----------------|
| Read balance | Either works | Either works |
| Read contract state | Either works | Either works |
| Send single transaction | Possible but manual | **Recommended** |
| Send multiple transactions | **Will fail** | **Required** |
| Query historical logs | May fail on large ranges | **Required** |
| Watch events | Either works | SDK has conveniences |
| Deploy contracts | Possible but manual | **Recommended** |
| React/WAGMI integration | Use directly with Radius chains | Use directly with Radius chains |

---

## Pattern Comparisons

### Creating a Client

**Viem (works, but no Radius conveniences):**
```typescript
import { createPublicClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});
```

**Radius SDK (recommended):**
```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({
  chain: radiusTestnet,
  // transport is optional - uses chain's default RPC
});

// Access underlying viem client if needed
const publicClient = client.publicClient;
```

---

### Reading Balance

**Viem:**
```typescript
const balance = await publicClient.getBalance({
  address: '0x...',
});
```

**Radius SDK:**
```typescript
const balance = await client.getBalance({
  address: '0x...',
});
```

**Verdict:** Identical API. Either works.

---

### Sending a Transaction

**Viem (requires manual gas price handling):**
```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({
  account,
  chain: radiusTestnet,
  transport: http(),
});

// Must manually set gasPrice: 0n for Radius
const hash = await walletClient.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n,
  gasPrice: 0n,  // EASY TO FORGET!
});

// Must manually wait for receipt
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

**Radius SDK:**
```typescript
import { createRadiusClient, privateKeyToAccount } from '@radiustechsystems/sdk';

const client = createRadiusClient({ chain: radiusTestnet });
const account = privateKeyToAccount('0x...');

// Gas price handled automatically, includes receipt
const receipt = await client.sendAndWait(account, '0x...', 1000000000000000000n);
```

**Verdict:** SDK is more ergonomic and handles Radius quirks automatically.

---

### Sending Multiple Transactions

**Viem (WILL FAIL on Radius):**
```typescript
// This approach works on Ethereum but FAILS on Radius
const hash1 = await walletClient.sendTransaction({ to: addr1, value: 1n, gasPrice: 0n });
const hash2 = await walletClient.sendTransaction({ to: addr2, value: 2n, gasPrice: 0n });
const hash3 = await walletClient.sendTransaction({ to: addr3, value: 3n, gasPrice: 0n });

// On Radius: hash2 and hash3 may fail because nonces arrive out of order
// Radius doesn't queue future-nonce transactions like Ethereum
```

**Radius SDK (correct approach):**
```typescript
const hashes = await client.sendTransactionBatch(account, [
  { to: addr1, value: 1n },
  { to: addr2, value: 2n },
  { to: addr3, value: 3n },
]);
// All transactions sent in single JSON-RPC batch with sequential nonces
```

**Verdict:** **Must use SDK for multiple transactions.** This is the most important difference.

---

### Reading Contract State

**Viem:**
```typescript
const balance = await publicClient.readContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [ownerAddress],
});
```

**Radius SDK:**
```typescript
const balance = await client.readContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [ownerAddress],
});
```

**Verdict:** Identical API. Either works.

---

### Typed Contract Interactions

**Viem:**
```typescript
import { getContract } from 'viem';

const token = getContract({
  address: tokenAddress,
  abi: erc20Abi,
  client: { public: publicClient, wallet: walletClient },
});

// Read
const balance = await token.read.balanceOf([ownerAddress]);

// Write - returns hash, must wait separately
const hash = await token.write.transfer([recipientAddress, amount]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

**Radius SDK:**
```typescript
const token = client.getContract({
  address: tokenAddress,
  abi: erc20Abi,
});

// Read
const balance = await token.read.balanceOf([ownerAddress]);

// Write - returns receipt by default
const receipt = await token.write.transfer({
  args: [recipientAddress, amount],
  signer: account,
});

// Or just get hash
const hash = await token.write.transfer({
  args: [recipientAddress, amount],
  signer: account,
  options: { wait: false },
});
```

**Verdict:** SDK is more ergonomic with auto-wait and clearer signer passing.

---

### Historical Log Queries

**Viem (may fail on large ranges):**
```typescript
const logs = await publicClient.getLogs({
  address: contractAddress,
  fromBlock: 1000000n,
  toBlock: 1100000n,  // 100k blocks - TOO LARGE for Radius
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
  onProgress: ({ currentBlock, logsFetched }) => {
    console.log(`Progress: ${logsFetched} logs found`);
  },
});
```

**Verdict:** **Must use SDK events module for large block ranges.**

---

### Watching Events

**Viem:**
```typescript
const unwatch = publicClient.watchContractEvent({
  address: tokenAddress,
  abi: erc20Abi,
  eventName: 'Transfer',
  onLogs: (logs) => {
    // Must decode logs manually
    const decoded = decodeEventLog({ abi: erc20Abi, ... });
    console.log(decoded.args.from, decoded.args.to, decoded.args.value);
  },
});
```

**Radius SDK:**
```typescript
import { watchTransfer } from '@radiustechsystems/sdk/events';

const unwatch = watchTransfer(publicClient, {
  address: tokenAddress,
  onTransfer: (events) => {
    // Already decoded
    events.forEach(e => console.log(e.from, e.to, e.value));
  },
});
```

**Verdict:** SDK provides typed convenience wrappers. Viem works but is more verbose.

---

### Deploying Contracts

**Viem:**
```typescript
const hash = await walletClient.deployContract({
  abi: contractAbi,
  bytecode: '0x...',
  args: [constructorArg1, constructorArg2],
  gasPrice: 0n,  // Don't forget!
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
const contractAddress = receipt.contractAddress;
```

**Radius SDK:**
```typescript
const { address, receipt } = await client.deployContract(
  account,
  '0x...',  // bytecode
  contractAbi,
  constructorArg1,
  constructorArg2,
);
```

**Verdict:** SDK is more ergonomic, handles gas price, returns both address and receipt.

---

### Error Handling

**Viem:**
```typescript
import { BaseError } from 'viem';

try {
  await publicClient.sendRawTransaction({ ... });
} catch (error) {
  if (error instanceof BaseError) {
    console.log(error.shortMessage);
  }
}
```

**Radius SDK:**
```typescript
import { RadiusError, InsufficientBalanceError } from '@radiustechsystems/sdk';

try {
  await client.sendAndWait(account, to, value);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.log(`Need ${error.required}, have ${error.balance}`);
  } else if (error instanceof RadiusError) {
    console.log(error.shortMessage);
  }
}
```

**Verdict:** SDK provides more specific error types. Both extend viem's `BaseError`.

---

## WAGMI Integration

**Same for both - use Radius chains directly with WAGMI:**

```typescript
import { createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const config = createConfig({
  chains: [radiusTestnet],
  transports: {
    [radiusTestnet.id]: http(),
  },
});

// Then use standard WAGMI hooks
const { data: balance } = useBalance({ address: '0x...' });
```

**Note:** For transactions in WAGMI, you still need to handle the gas price and nonce ordering. The SDK's `RadiusClient` is not integrated with WAGMI hooks - they're parallel approaches.

---

## Summary

| Feature | Viem Direct | Radius SDK |
|---------|-------------|------------|
| Simple reads | Works | Works |
| Single transaction | Manual gas price | Automatic |
| Multiple transactions | **Fails** | Works |
| Large log queries | **Fails** | Works |
| Contract interactions | More verbose | More ergonomic |
| Error handling | Generic | Specific types |
| WAGMI integration | Works | Same (uses chains only) |
