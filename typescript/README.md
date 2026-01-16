# Radius TypeScript SDK

[![Version](https://img.shields.io/badge/version-2.0.0--alpha.4-blue)](package.json)
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
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

// Create client
const client = createRadiusClient({ chain: radiusTestnet });

// Create account from private key
const account = createPrivateKeySigner('0x...');

// Check balance (viem-compatible API)
const balance = await client.getBalance({ address: account.address });

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
import { decodeEventLogs, filterEventLogs } from '@radiustechsystems/sdk/events';
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';
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
