# Radius SDKs

[![TypeScript](https://img.shields.io/npm/v/@radiustechsystems/sdk?label=TypeScript&color=blue)](https://www.npmjs.com/package/@radiustechsystems/sdk)
[![Go](https://img.shields.io/badge/Go-coming%20soon-lightgrey)](go/)
[![Python](https://img.shields.io/badge/Python-coming%20soon-lightgrey)](python/)
[![Rust](https://img.shields.io/badge/Rust-coming%20soon-lightgrey)](rust/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official SDKs for [Radius](https://radiustech.xyz/) — a high-performance smart contract platform with near-instant settlement and millions of transactions per second.

## Quick Start

### TypeScript

```bash
npm install @radiustechsystems/sdk viem
```

```typescript
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const account = createPrivateKeySigner('0x...');

const receipt = await client.sendAndWait(account, '0x...', 1000000000000000000n);
```

### Go

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

| SDK | Status | Install |
|-----|--------|---------|
| [TypeScript](typescript/) | [![npm](https://img.shields.io/npm/v/@radiustechsystems/sdk)](https://www.npmjs.com/package/@radiustechsystems/sdk) | `npm install @radiustechsystems/sdk` |
| [Go](go/) | Stable | `go get github.com/radiustechsystems/sdk/go` |
| [Python](python/) | Coming soon | — |
| [Rust](rust/) | Coming soon | — |

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
