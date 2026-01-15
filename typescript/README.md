# Radius TypeScript SDK

[![npm](https://img.shields.io/npm/v/@radiustechsystems/sdk)](https://www.npmjs.com/package/@radiustechsystems/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

The official TypeScript SDK for [Radius](https://radiustech.xyz/). Built on [viem](https://viem.sh/) for seamless EVM compatibility.

## Installation

```bash
npm install @radiustechsystems/sdk viem
```

## Quick Start

```typescript
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

// Create client
const client = createRadiusClient({ chain: radiusTestnet });

// Create account from private key
const account = createPrivateKeySigner('0x...');

// Check balance
const balance = await client.getBalance(account.address);

// Send transaction
const receipt = await client.sendAndWait(
  account,
  '0x...recipient',
  1000000000000000000n
);
```

## Features

- **Client** — Read balances, send transactions, deploy contracts
- **React Hooks** — `useRadiusBalance`, `useRadiusSend`, ERC-20 hooks
- **Server Handlers** — WebAuthn key management, composable handlers
- **wagmi Integration** — Drop-in connector for wagmi apps
- **Events** — Watch blocks, transfers, approvals, and logs

## Subpath Exports

```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { useRadiusBalance } from '@radiustechsystems/sdk/react';
import { watchTransfer } from '@radiustechsystems/sdk/events';
import { Handler, Kv } from '@radiustechsystems/sdk/server';
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';
```

## Documentation

**[docs.radiustech.xyz](https://docs.radiustech.xyz/)** — Full documentation, guides, and API reference.

- [Getting Started](https://docs.radiustech.xyz/getting-started)
- [TypeScript SDK Guide](https://docs.radiustech.xyz/sdk/typescript)
- [API Reference](https://docs.radiustech.xyz/sdk/typescript/api)
- [React Integration](https://docs.radiustech.xyz/sdk/typescript/react)
- [Server Handlers](https://docs.radiustech.xyz/sdk/typescript/server)

## Requirements

- Node.js >= 22
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
