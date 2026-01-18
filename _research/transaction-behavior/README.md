# Transaction Behavior Research

This directory contains research findings about Radius testnet transaction submission behavior, conducted during SDK development in January 2026.

## Key Finding

Radius does not have a traditional mempool. Transactions must arrive at the RPC in strict nonce order:

| Submission Method | Success Rate |
|-------------------|--------------|
| Sequential (await each) | 100% |
| `sendTransactionBatch()` | 100% |
| Parallel individual HTTP | ~50% |

## Documentation

- **[TESTNET-TX-FINDINGS.md](./TESTNET-TX-FINDINGS.md)** - Executive summary with diagrams and recommendations
- **[DOCUMENTATION-PLAN.md](./DOCUMENTATION-PLAN.md)** - API design rationale for `sendTransactionBatch`
- **[parallel-tx-diagram.md](./parallel-tx-diagram.md)** - Mermaid diagrams explaining the behavior

## Scripts

Test and diagnostic scripts used during research:

| Script | Purpose |
|--------|---------|
| [`scripts/rpc-behavior-test.ts`](./scripts/rpc-behavior-test.ts) | Comprehensive RPC behavior test |
| [`scripts/detailed-tx-diagnosis.ts`](./scripts/detailed-tx-diagnosis.ts) | Transaction failure diagnostics |
| [`scripts/gas-consumption-test.ts`](./scripts/gas-consumption-test.ts) | Gas behavior analysis |
| [`scripts/timing-discovery.ts`](./scripts/timing-discovery.ts) | Timing analysis |

## Results

Raw test output from the research scripts:

- [`scripts/results/rpc-behavior-results.json`](./scripts/results/rpc-behavior-results.json)
- [`scripts/results/diagnosis-results.json`](./scripts/results/diagnosis-results.json)
- [`scripts/results/timing-results.json`](./scripts/results/timing-results.json)

## Running the Scripts

```bash
cd /path/to/radius-sdk/typescript
RADIUS_PRIVATE_KEY=0x... npx tsx _research/transaction-behavior/scripts/rpc-behavior-test.ts
```

## Impact on SDK

This research led to the implementation of `sendTransactionBatch()` which handles nonce ordering and JSON-RPC batching automatically, achieving 100% reliable multi-transaction submission.
