# Radius Rust Loadgen Quick Start

Quick reference for running the Rust load generator against Radius testnet.

**Location:** `/tmp/parsec-rust/loadgen/`

---

## Build

```bash
cd /tmp/parsec-rust

# Build contracts (requires Node.js 22+)
cd loadgen/contracts
nvm use 22.10.0
pnpm install
pnpm run build
cd ../..

# Build loadgen binary
cargo build --release
```

**Output:** `target/release/parsec-loadgen`

---

## Basic Usage

### Native Token Transfers

```bash
./target/release/parsec-loadgen \
  --component_id 0 \
  --agent_count 1 \
  --agent0_endpoint https://rpc.testnet.radiustech.xyz \
  --loadgen_accounts 100 \
  --loadgen_txtype transfer \
  --secret_key 0xYOUR_PRIVATE_KEY \
  --loadgen_listen_endpoint 127.0.0.1:9090 \
  --chain_id 1223953 \
  --loadgen_delay 100 \
  --loadgen_measurement_interval 1000
```

### ERC-20 Token Transfers

```bash
./target/release/parsec-loadgen \
  --component_id 0 \
  --agent_count 1 \
  --agent0_endpoint https://rpc.testnet.radiustech.xyz \
  --loadgen_accounts 100 \
  --loadgen_txtype erc20 \
  --secret_key 0xYOUR_PRIVATE_KEY \
  --loadgen_listen_endpoint 127.0.0.1:9090 \
  --chain_id 1223953 \
  --loadgen_delay 100
```

---

## Load Types

| Type | Command | Description |
|------|---------|-------------|
| Native transfer | `--loadgen_txtype transfer` | 21,000 gas per tx, 500 wei |
| ERC-20 | `--loadgen_txtype erc20` | Auto-deploys token contract |
| ERC-20 Prefunded | `--loadgen_txtype erc20p` | ERC-20 + validates gas accounting |
| USDC | `--loadgen_txtype usdc` | FiatTokenV2_2 contract |

---

## Key Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `--loadgen_accounts` | Number of test accounts | `100` |
| `--loadgen_delay` | Milliseconds between txs | `100` (10 TPS per pair) |
| `--loadgen_measurement_interval` | Log stats every N txs | `1000` |
| `--secret_key` | Funded private key (hex) | `0xac0974bec...` |
| `--chain_id` | Radius testnet chain ID | `1223953` |

---

## Ramp-Up Load

Gradually increase active accounts:

```bash
--loadgen_rampup_offset 0.1 \   # Start with 10% of accounts
--loadgen_rampup_rate 0.1 \     # Add 10% per interval
--loadgen_rampup_delay 30       # Every 30 seconds
```

---

## Receipt Validation

Enable transaction receipt checking:

```bash
--check_receipts_interval 5     # Check every 5 seconds
```

---

## Stopping

Send `SIGTERM` or `SIGINT` (Ctrl+C) for graceful shutdown.

---

## Notes

1. **Account Pairing:** N accounts = N/2 concurrent sender pairs
2. **Gas Price:** Set to 0 (Radius permissioned model)
3. **Metrics:** Exports to OpenTelemetry (requires OTLP collector)
4. **Readiness:** RPC server at `--loadgen_listen_endpoint` indicates ready state

---

## Radius Testnet Configuration

```
RPC Endpoint: https://rpc.testnet.radiustech.xyz
Chain ID: 1223953
Test Token: ISBToken @ 0xF966020a30946A64B39E2e243049036367590858
```
