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

This guide helps you get started with the Radius TypeScript SDK.

## Installation

Install the SDK using your preferred package manager:

\`\`\`bash
pnpm add @radiustechsystems/sdk viem
\`\`\`

\`\`\`bash
npm install @radiustechsystems/sdk viem
\`\`\`

## Basic Usage

### Create a Client

\`\`\`typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { http } from 'viem';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});
\`\`\`

### Create an Account

\`\`\`typescript
import { privateKeyToAccount } from '@radiustechsystems/sdk';

const account = privateKeyToAccount('0x...');
console.log('Address:', account.address);
\`\`\`

### Send a Transaction

\`\`\`typescript
const receipt = await client.sendAndWait(
  account,
  '0x...recipientAddress',
  1000000000000000000n // 1 token in wei
);
console.log('Transaction hash:', receipt.transactionHash);
\`\`\`

## Next Steps

- [API Reference](/docs/api) - Complete API documentation
- [React Integration](/docs/guides/react) - Using the SDK with React
- [Server Handlers](/docs/guides/server) - Building backend services

`;

// ============================================================================
// React Integration Guide
// ============================================================================

const REACT_GUIDE = `---
title: React Integration
description: Using the Radius SDK with React applications
---

# React Integration

The Radius SDK provides React hooks for building dApps.

## Installation

\`\`\`bash
pnpm add @radiustechsystems/sdk viem @tanstack/react-query
\`\`\`

## Setup Provider

\`\`\`typescript
import { RadiusProvider } from '@radiustechsystems/sdk/react';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

function App() {
  return (
    <RadiusProvider chain={radiusTestnet}>
      <YourApp />
    </RadiusProvider>
  );
}
\`\`\`

## Available Hooks

### useRadiusBalance

Query the balance of an address:

\`\`\`typescript
import { useRadiusBalance } from '@radiustechsystems/sdk/react';

function Balance({ address }) {
  const { data: balance, isLoading } = useRadiusBalance({ address });

  if (isLoading) return <div>Loading...</div>;
  return <div>Balance: {balance?.toString()}</div>;
}
\`\`\`

### useRadiusSend

Send transactions:

\`\`\`typescript
import { useRadiusSend } from '@radiustechsystems/sdk/react';

function SendButton({ to, amount }) {
  const { send, isPending } = useRadiusSend();

  return (
    <button
      onClick={() => send({ to, value: amount })}
      disabled={isPending}
    >
      {isPending ? 'Sending...' : 'Send'}
    </button>
  );
}
\`\`\`

### ERC-20 Hooks

- \`useERC20Balance\` - Query token balance
- \`useERC20Allowance\` - Query spending allowance
- \`useERC20Approve\` - Approve token spending
- \`useERC20Transfer\` - Transfer tokens
- \`useERC20Metadata\` - Query token metadata

## API Reference

See the [React API Reference](/docs/api/react) for complete documentation.

`;

// ============================================================================
// Server Handlers Guide
// ============================================================================

const SERVER_GUIDE = `---
title: Server Handlers
description: Building backend services with Radius SDK server module
---

# Server Handlers

The server module provides handlers for building backend services that interact with Radius.

## Installation

\`\`\`bash
pnpm add @radiustechsystems/sdk
\`\`\`

## Key Manager

The key manager handler provides WebAuthn credential storage:

\`\`\`typescript
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';

const handler = Handler.keyManager({
  kv: Kv.memory(),
  path: '/api/credentials',
  rp: { id: 'example.com', name: 'Example App' },
});
\`\`\`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/challenge\` | Generate WebAuthn challenge |
| GET | \`/:id\` | Get credential public key |
| POST | \`/:id\` | Store credential public key |

## KV Stores

### In-Memory Store

\`\`\`typescript
import { Kv } from '@radiustechsystems/sdk/webauthn';

const kv = Kv.memory();
\`\`\`

### Cloudflare KV

\`\`\`typescript
import { Kv } from '@radiustechsystems/sdk/webauthn';

const kv = Kv.cloudflare({ namespace: env.KV });
\`\`\`

## Composing Handlers

Combine multiple handlers:

\`\`\`typescript
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';

const keyManager = Handler.keyManager({ kv: Kv.memory() });
const health = Handler.from();
health.get('/health', () => Response.json({ status: 'ok' }));

const handler = Handler.compose([keyManager, health], {
  path: '/api',
});
\`\`\`

## Integration

### Express.js

\`\`\`typescript
import express from 'express';

const app = express();
app.use(handler.listener);
app.listen(3000);
\`\`\`

### Cloudflare Workers

\`\`\`typescript
export default {
  fetch: handler.fetch,
};
\`\`\`

## API Reference

See the [Server API Reference](/docs/api/server) for complete documentation.

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

\`\`\`bash
pnpm add @radiustechsystems/sdk
\`\`\`

## Watching Events

### Block Watching

\`\`\`typescript
import { watchBlockNumber } from '@radiustechsystems/sdk/events';
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });

const unwatch = watchBlockNumber(client.publicClient, {
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

const unwatch = watchTransfer(client.publicClient, {
  address: '0x...tokenAddress',
  onTransfer: (event) => {
    console.log(\`Transfer: \${event.from} -> \${event.to}: \${event.value}\`);
  },
});
\`\`\`

### Approval Events

Watch ERC-20 approvals:

\`\`\`typescript
import { watchApproval } from '@radiustechsystems/sdk/events';

const unwatch = watchApproval(client.publicClient, {
  address: '0x...tokenAddress',
  onApproval: (event) => {
    console.log(\`Approval: \${event.owner} -> \${event.spender}: \${event.value}\`);
  },
});
\`\`\`

## Querying Historical Logs

### Basic Log Query

\`\`\`typescript
import { getLogs } from '@radiustechsystems/sdk/events';

const logs = await getLogs(client.publicClient, {
  address: '0x...contractAddress',
  fromBlock: 1000000n,
  toBlock: 1001000n,
});
\`\`\`

### Adaptive Log Query

For large block ranges, use \`getLogsAdaptive\` which automatically handles RPC limits:

\`\`\`typescript
import { getLogsAdaptive } from '@radiustechsystems/sdk/events';

const logs = await getLogsAdaptive(client.publicClient, {
  address: '0x...contractAddress',
  fromBlock: 0n,
  toBlock: 'latest',
});
\`\`\`

## WebSocket Transport

For real-time events, use WebSocket transport:

\`\`\`typescript
import { createWebSocketTransport } from '@radiustechsystems/sdk/events';
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: createWebSocketTransport({
    url: 'wss://...',
  }),
});
\`\`\`

## API Reference

See the [Events API Reference](/docs/api/events) for complete documentation.

`;

// ============================================================================
// wagmi Integration Guide
// ============================================================================

const WAGMI_GUIDE = `---
title: wagmi Integration
description: Using the Radius SDK with wagmi
---

# wagmi Integration

The Radius SDK provides wagmi connectors for easy integration with wagmi-based dApps.

## Installation

\`\`\`bash
pnpm add @radiustechsystems/sdk viem wagmi @tanstack/react-query
\`\`\`

## Setup

\`\`\`typescript
import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';

const config = createConfig({
  chains: [radiusTestnet],
  connectors: [
    privateKeyConnector({
      privateKey: '0x...',
    }),
  ],
  transports: {
    [radiusTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
\`\`\`

## Using wagmi Hooks

Once configured, you can use standard wagmi hooks:

\`\`\`typescript
import { useAccount, useBalance, useSendTransaction } from 'wagmi';

function Wallet() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();

  if (!isConnected) return <div>Not connected</div>;

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted}</p>
      <button onClick={() => sendTransaction({ to: '0x...', value: 1n })}>
        Send
      </button>
    </div>
  );
}
\`\`\`

## API Reference

See the [wagmi API Reference](/docs/api/wagmi) for complete documentation.

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

## Breaking Changes

### Account Creation

**V1:**
\`\`\`typescript
import { privateKeyToAccount } from '@aspect-build/radius-sdk';

const signer = privateKeyToAccount(privateKey, chainId);
\`\`\`

**V2:**
\`\`\`typescript
import { privateKeyToAccount } from '@radiustechsystems/sdk';

// Chain ID is no longer required - determined by the client
const account = privateKeyToAccount(privateKey);
\`\`\`

### Package Name

The package has been renamed:

\`\`\`bash
# V1
pnpm remove @aspect-build/radius-sdk

# V2
pnpm add @radiustechsystems/sdk
\`\`\`

### viem Integration

V2 is built on viem. The \`RadiusSigner\` interface has been replaced with viem's \`LocalAccount\`:

**V1:**
\`\`\`typescript
interface RadiusSigner {
  address: Address;
  signTransaction(...): Promise<Hex>;
}
\`\`\`

**V2:**
\`\`\`typescript
import type { LocalAccount } from 'viem';

// privateKeyToAccount returns a viem LocalAccount
const account: LocalAccount = privateKeyToAccount(privateKey);
\`\`\`

### ClefSigner Removed

The \`ClefSigner\` and \`createClefSigner\` have been removed in V2.
If you were using Clef, you'll need to implement a custom solution.

### Subpath Exports

V2 uses subpath exports for better tree-shaking:

\`\`\`typescript
// Main exports
import { createRadiusClient, privateKeyToAccount } from '@radiustechsystems/sdk';

// Chain definitions
import { radiusTestnet, radiusMainnet } from '@radiustechsystems/sdk/chains';

// React hooks
import { useRadiusBalance, useRadiusSend } from '@radiustechsystems/sdk/react';

// Events
import { watchTransfer, getLogs } from '@radiustechsystems/sdk/events';

// Server handlers
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';

// wagmi integration
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';
\`\`\`

## Step-by-Step Migration

1. **Update package:**
   \`\`\`bash
   pnpm remove @aspect-build/radius-sdk
   pnpm add @radiustechsystems/sdk viem
   \`\`\`

2. **Update imports:**
   \`\`\`typescript
   // Old
   import { createRadiusClient } from '@aspect-build/radius-sdk';

   // New
   import { createRadiusClient } from '@radiustechsystems/sdk';
   import { radiusTestnet } from '@radiustechsystems/sdk/chains';
   \`\`\`

3. **Update account creation:**
   \`\`\`typescript
   // Old
   const signer = privateKeyToAccount(privateKey, chainId);

   // New
   const account = privateKeyToAccount(privateKey);
   \`\`\`

4. **Update type imports:**
   \`\`\`typescript
   // Old
   import type { RadiusSigner } from '@aspect-build/radius-sdk';

   // New
   import type { LocalAccount } from 'viem';
   \`\`\`

## Need Help?

If you encounter issues during migration, please [open an issue](https://github.com/radiustechsystems/sdk/issues).

`;

// ============================================================================
// Write all guides
// ============================================================================

const guides = [
  { name: 'quick-start.mdx', content: QUICK_START },
  { name: 'react.mdx', content: REACT_GUIDE },
  { name: 'server.mdx', content: SERVER_GUIDE },
  { name: 'events.mdx', content: EVENTS_GUIDE },
  { name: 'wagmi.mdx', content: WAGMI_GUIDE },
  { name: 'migration-v1-v2.mdx', content: MIGRATION_GUIDE },
];

console.log('Generating guides...');

for (const guide of guides) {
  const path = join(GUIDES_DIR, guide.name);
  writeFileSync(path, guide.content);
  console.log(`  Created: docs/guides/${guide.name}`);
}

console.log('\nGuides generated successfully!');
