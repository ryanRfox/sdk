# Radius TypeScript SDK

[![Version](https://img.shields.io/badge/version-2.0.0--alpha.7-blue)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

The official TypeScript SDK for [Radius](https://radiustech.xyz/). Built on [viem](https://viem.sh/) for seamless EVM compatibility.

> **V2 Alpha Notice:** This SDK is in pre-release and not yet published to npm. You must build and link locally to use it.

> **ESM Only:** This SDK is published as ES Modules only. CommonJS (`require()`) is not supported. Your project must use `"type": "module"` in package.json or use `.mjs` extensions.

## Local Installation

V2 is not yet on npm. Build and link locally:

```bash
# In this directory (typescript/)
pnpm install
pnpm build
pnpm link --global
```

Then in your project:

```bash
pnpm link --global @radiustechsystems/sdk
# Or: npm link @radiustechsystems/sdk
```

When done testing:

```bash
pnpm unlink --global @radiustechsystems/sdk
```

## Quick Start

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

// Public client for reading blockchain state
const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Wallet client for sending transactions
const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

// Check balance (standard viem API)
const balance = await publicClient.getBalance({
  address: walletClient.account.address,
});

// Send transaction (standard viem API)
const hash = await walletClient.sendTransaction({
  to: '0x...recipient',
  value: 1000000000000000000n,
});

// Wait for receipt
const receipt = await publicClient.waitForTransactionReceipt({ hash });
```

## Batch Transactions

Radius doesn't queue future-nonce transactions like Ethereum. Use `sendTransactionBatch` to send multiple transactions atomically:

```typescript
const hashes = await walletClient.sendTransactionBatch({
  transactions: [
    { to: '0x...', value: 1000000000000000000n },
    { to: '0x...', data: '0x...' },
  ],
});
```

## SDK Architecture

The SDK follows viem's decorator pattern:

```
@radiustechsystems/sdk/
├── chains/            # Chain definitions (radius, radiusTestnet)
├── decorators/        # Client extension decorators (radiusWalletActions)
├── actions/           # Standalone action functions
├── contracts/         # Typed contract utilities
├── errors/            # Typed error classes
├── events/            # Event watching utilities
└── transport/         # Transport utilities
```

## Extending Viem Clients

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

const client = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

// Now has sendTransactionBatch available
const hashes = await client.sendTransactionBatch({
  transactions: [{ to: '0x...', value: 1n }],
});
```

## Features

- **Chain Configs** — Pre-configured chains for Radius mainnet and testnet
- **Batch Transactions** — Send multiple transactions atomically
- **Events** — Watch blocks, transfers, approvals, and logs
- **Multicall3** — Batch contract reads (configured on testnet)

## Subpath Exports

```typescript
import { radiusTestnet, radiusWalletActions, MAX_GAS } from '@radiustechsystems/sdk';
import { radius, radiusTestnet } from '@radiustechsystems/sdk/chains';
import { decodeEventLogs, filterEventLogs } from '@radiustechsystems/sdk/events';
```

## Documentation

**[docs.radiustech.xyz](https://docs.radiustech.xyz/)** — Full documentation, guides, and API reference.

- [Getting Started](https://docs.radiustech.xyz/getting-started)
- [TypeScript SDK Guide](https://docs.radiustech.xyz/sdk/typescript)
- [API Reference](https://docs.radiustech.xyz/sdk/typescript/api)

## Requirements

- Node.js >= 22
- ESM project (`"type": "module"` in package.json)
- pnpm (for local development)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RADIUS_RPC_URL` | RPC endpoint URL |
| `RADIUS_PRIVATE_KEY` | Account private key (for scripts) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](../LICENSE)
