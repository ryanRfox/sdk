# Radius SDKs

[![TypeScript](https://img.shields.io/badge/TypeScript-2.0.0--alpha.1-blue)](typescript/)
[![Go](https://img.shields.io/badge/Go-v1-green)](go/)
[![Python](https://img.shields.io/badge/Python-coming%20soon-lightgrey)](python/)
[![Rust](https://img.shields.io/badge/Rust-coming%20soon-lightgrey)](rust/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official SDKs for [Radius](https://radiustech.xyz/) — a high-performance smart contract platform with near-instant settlement and millions of transactions per second.

> **V2 Alpha Notice:** The TypeScript SDK on this branch is **V2-alpha** and is not yet published to npm. See [Local Installation](#local-installation-v2-alpha) below. Go, Python, and Rust SDKs remain at V1.

## Quick Start (TypeScript V2)

### Local Installation (V2-alpha)

V2 is not yet on npm. To use this branch locally:

```bash
# Clone and build the SDK
git clone https://github.com/radiustechsystems/sdk.git
cd sdk/typescript
pnpm install
pnpm build

# Link globally
pnpm link --global
```

Then in your project:

```bash
# Link the SDK
pnpm link --global @radiustechsystems/sdk

# Or with npm
npm link @radiustechsystems/sdk
```

### Usage

```typescript
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const account = createPrivateKeySigner('0x...');

const receipt = await client.sendAndWait(account, '0x...', 1000000000000000000n);
```

### Unlink when done

```bash
pnpm unlink --global @radiustechsystems/sdk
```

## Go SDK (V1)

```bash
go get github.com/radiustechsystems/sdk/go
```

```go
import "github.com/radiustechsystems/sdk/go/src/radius"

client, _ := radius.NewClient(radius.Config{EndpointURL: "..."})
balance, _ := client.GetBalance(ctx, address)
```

## Documentation

**[docs.radiustech.xyz](https://docs.radiustech.xyz/)** — Full documentation, guides, and API reference.

- [Getting Started](https://docs.radiustech.xyz/getting-started)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [TypeScript SDK](https://docs.radiustech.xyz/sdk/typescript)
- [Go SDK](https://docs.radiustech.xyz/sdk/go)

## Available SDKs

| SDK | Version | Status | Install |
|-----|---------|--------|---------|
| [TypeScript](typescript/) | 2.0.0-alpha.1 | **V2 Alpha** (local only) | See [Local Installation](#local-installation-v2-alpha) |
| [Go](go/) | 1.x | Stable (V1) | `go get github.com/radiustechsystems/sdk/go` |
| [Python](python/) | — | Coming soon | — |
| [Rust](rust/) | — | Coming soon | — |

## What's New in TypeScript V2

- **viem integration** — Full compatibility with viem types and patterns
- **React hooks** — `useRadiusBalance`, `useRadiusSend`, ERC-20 hooks
- **Server handlers** — `Handler.keyManager()`, `Handler.compose()`
- **wagmi connector** — `privateKeyConnector()` for wagmi v3
- **Events module** — `watchTransfer`, `watchApproval`, `getLogs`
- **Subpath exports** — `/chains`, `/react`, `/events`, `/server`, `/wagmi`

See [typescript/CHANGELOG.md](typescript/CHANGELOG.md) for breaking changes.

## Why Radius?

- **2.8M+ TPS** — Parallel execution, not sequential batching
- **Near-zero latency** — No block times, instant settlement
- **EVM compatible** — Works with existing Ethereum tooling
- **Built for AI** — Designed for agent-to-agent micropayments

## Support

- [Documentation](https://docs.radiustech.xyz/)
- [GitHub Issues](https://github.com/radiustechsystems/sdk/issues)
- [Website](https://radiustech.xyz/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
