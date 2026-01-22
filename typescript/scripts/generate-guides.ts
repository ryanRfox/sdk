#!/usr/bin/env npx tsx
/**
 * Generate thin guide templates for Radius SDK documentation.
 *
 * These guides provide narrative documentation while linking to
 * the auto-generated API reference from TypeDoc.
 *
 * Run with: pnpm generate:guides
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_DIR = join(import.meta.dirname, '..', 'docs');
const GUIDES_DIR = join(DOCS_DIR, 'guides');

// Ensure directories exist
if (!existsSync(DOCS_DIR)) {
	mkdirSync(DOCS_DIR, { recursive: true });
}
if (!existsSync(GUIDES_DIR)) {
	mkdirSync(GUIDES_DIR, { recursive: true });
}

// ============================================================================
// Quick Start Guide
// ============================================================================

const QUICK_START = `---
title: Quick Start
description: Get started with the Radius TypeScript SDK
---

# Quick Start

This guide helps you get started with the Radius TypeScript SDK V2.

## Installation

Install the SDK and viem using your preferred package manager:

\`\`\`bash
pnpm add @radiustechsystems/sdk viem
\`\`\`

\`\`\`bash
npm install @radiustechsystems/sdk viem
\`\`\`

## Basic Usage

The Radius SDK extends [viem](https://viem.sh) with Radius-specific functionality.
You use standard viem clients with the \`radiusWalletActions\` decorator.

### Create Clients

\`\`\`typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

// Public client for read operations
const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Wallet client for write operations (with Radius extensions)
const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());
\`\`\`

### Send a Transaction

\`\`\`typescript
// Send a transaction
const hash = await walletClient.sendTransaction({
  to: '0x...recipientAddress',
  value: 1000000000000000000n, // 1 token in wei
});

// Wait for confirmation
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log('Transaction confirmed:', receipt.transactionHash);
\`\`\`

### Batch Transactions (Radius-Specific)

Radius supports sending multiple transactions in a single batch:

\`\`\`typescript
const hashes = await walletClient.sendTransactionBatch({
  transactions: [
    { to: '0x...', value: 1000000000000000000n },
    { to: '0x...', value: 2000000000000000000n },
  ],
});
console.log('Batch hashes:', hashes);
\`\`\`

### Read Contract Data

Use viem's standard \`getContract\` for typed contract interactions:

\`\`\`typescript
import { getContract, erc20Abi } from 'viem';

const token = getContract({
  address: '0x...tokenAddress',
  abi: erc20Abi,
  client: publicClient,
});

const balance = await token.read.balanceOf(['0x...ownerAddress']);
console.log('Balance:', balance);
\`\`\`

### Write Contract Data

\`\`\`typescript
const token = getContract({
  address: '0x...tokenAddress',
  abi: erc20Abi,
  client: walletClient,
});

const hash = await token.write.transfer(['0x...recipient', 1000n]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
\`\`\`

## Next Steps

- [API Reference](/docs/api) - Complete API documentation
- [Events Guide](/docs/guides/events) - Watching blockchain events

`;

// ============================================================================
// Events Guide
// ============================================================================

const EVENTS_GUIDE = `---
title: Events & Subscriptions
description: Watching blockchain events with the Radius SDK
---

# Events & Subscriptions

The events module provides utilities for watching blockchain events and querying logs.

## Installation

Events are available via a subpath export:

\`\`\`typescript
import { watchTransfer, watchApproval, getLogs } from '@radiustechsystems/sdk/events';
\`\`\`

## Setup

Create a public client for event watching:

\`\`\`typescript
import { createPublicClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});
\`\`\`

## Watching Events

### Block Watching

\`\`\`typescript
import { watchBlockNumber } from '@radiustechsystems/sdk/events';

const unwatch = watchBlockNumber(publicClient, {
  onBlockNumber: (blockNumber) => {
    console.log('New block:', blockNumber);
  },
});

// Stop watching
unwatch();
\`\`\`

### Transfer Events

Watch ERC-20 transfers:

\`\`\`typescript
import { watchTransfer } from '@radiustechsystems/sdk/events';

const unwatch = watchTransfer(publicClient, {
  address: '0x...tokenAddress',
  onTransfer: (events) => {
    for (const event of events) {
      console.log(\`Transfer: \${event.from} -> \${event.to}: \${event.value}\`);
    }
  },
});
\`\`\`

### Approval Events

Watch ERC-20 approvals:

\`\`\`typescript
import { watchApproval } from '@radiustechsystems/sdk/events';

const unwatch = watchApproval(publicClient, {
  address: '0x...tokenAddress',
  onApproval: (events) => {
    for (const event of events) {
      console.log(\`Approval: \${event.owner} -> \${event.spender}: \${event.value}\`);
    }
  },
});
\`\`\`

## Querying Historical Logs

### Basic Log Query

\`\`\`typescript
import { getLogs } from '@radiustechsystems/sdk/events';

const logs = await getLogs(publicClient, {
  address: '0x...contractAddress',
  fromBlock: 1000000n,
  toBlock: 1001000n,
});
\`\`\`

### Adaptive Log Query

For large block ranges, use \`getLogsAdaptive\` which automatically handles RPC limits:

\`\`\`typescript
import { getLogsAdaptive } from '@radiustechsystems/sdk/events';

const logs = await getLogsAdaptive(publicClient, {
  address: '0x...contractAddress',
  fromBlock: 0n,
  toBlock: 'latest',
});
\`\`\`

## WebSocket Transport

For real-time events with lower latency, use WebSocket transport:

\`\`\`typescript
import { createWebSocketTransport } from '@radiustechsystems/sdk/events';
import { createPublicClient } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport({
    chain: radiusTestnet,
  }),
});
\`\`\`

## API Reference

See the [Events API Reference](/docs/api/events) for complete documentation.

`;

// ============================================================================
// Migration Guide
// ============================================================================

const MIGRATION_GUIDE = `---
title: V1 to V2 Migration
description: Migrating from Radius SDK V1 to V2
---

# Migrating from V1 to V2

This guide helps you migrate from Radius SDK V1 to V2.

## Overview

V2 is a complete rewrite built on [viem](https://viem.sh). Instead of a custom client,
you now use standard viem clients extended with Radius-specific functionality.

## Breaking Changes

### Package Name

The package has been renamed:

\`\`\`bash
# V1
pnpm remove @aspect-build/radius-sdk

# V2
pnpm add @radiustechsystems/sdk viem
\`\`\`

### Client Creation

**V1:**
\`\`\`typescript
import { createRadiusClient } from '@aspect-build/radius-sdk';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});
\`\`\`

**V2:**
\`\`\`typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

// Separate clients for reads and writes
const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());
\`\`\`

### Account Creation

**V1:**
\`\`\`typescript
import { privateKeyToAccount } from '@aspect-build/radius-sdk';

const signer = privateKeyToAccount(privateKey, chainId);
\`\`\`

**V2:**
\`\`\`typescript
import { privateKeyToAccount } from 'viem/accounts';

// Chain ID is no longer required - determined by the client
const account = privateKeyToAccount(privateKey);
\`\`\`

### Sending Transactions

**V1:**
\`\`\`typescript
const receipt = await client.sendAndWait(signer, to, value);
\`\`\`

**V2:**
\`\`\`typescript
const hash = await walletClient.sendTransaction({ to, value });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
\`\`\`

### Contract Interactions

**V1:**
\`\`\`typescript
import { getContract } from '@aspect-build/radius-sdk';

const token = getContract(client, { address, abi });
const balance = await token.read.balanceOf(['0x...']);
\`\`\`

**V2:**
\`\`\`typescript
import { getContract } from 'viem';

// Use viem's getContract directly
const token = getContract({
  address,
  abi,
  client: publicClient, // or walletClient for writes
});

const balance = await token.read.balanceOf(['0x...']);
\`\`\`

### Type Changes

**V1:**
\`\`\`typescript
import type { RadiusSigner } from '@aspect-build/radius-sdk';
\`\`\`

**V2:**
\`\`\`typescript
import type { LocalAccount } from 'viem';
\`\`\`

### Removed Features

- \`RadiusSigner\` interface - use viem's \`LocalAccount\`
- \`ClefSigner\` - removed, implement custom solution if needed
- \`createClefSigner\` - removed
- Custom \`getContract\` - use viem's native \`getContract\`

## Step-by-Step Migration

1. **Update packages:**
   \`\`\`bash
   pnpm remove @aspect-build/radius-sdk
   pnpm add @radiustechsystems/sdk viem
   \`\`\`

2. **Update client creation:**
   - Replace \`createRadiusClient\` with \`createPublicClient\` + \`createWalletClient\`
   - Add \`.extend(radiusWalletActions())\` to wallet client

3. **Update account creation:**
   - Import \`privateKeyToAccount\` from \`viem/accounts\`
   - Remove chain ID parameter

4. **Update transactions:**
   - Use \`walletClient.sendTransaction()\` for sending
   - Use \`publicClient.waitForTransactionReceipt()\` for confirmation

5. **Update contracts:**
   - Use \`getContract\` from \`viem\` instead of SDK
   - Pass \`client\` in options object

6. **Update types:**
   - Replace \`RadiusSigner\` with \`LocalAccount\` from viem

## Need Help?

If you encounter issues during migration, please [open an issue](https://github.com/radiustechsystems/sdk/issues).

`;

// ============================================================================
// Write all guides
// ============================================================================

const guides = [
	{ name: 'quick-start.mdx', content: QUICK_START },
	{ name: 'events.mdx', content: EVENTS_GUIDE },
	{ name: 'migration-v1-v2.mdx', content: MIGRATION_GUIDE },
];

console.log('Generating guides...');

for (const guide of guides) {
	const path = join(GUIDES_DIR, guide.name);
	writeFileSync(path, guide.content);
	console.log(`  Created: docs/guides/${guide.name}`);
}

console.log('\nGuides generated successfully!');
