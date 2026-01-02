# Radius TypeScript SDK v2 - Audit Executive Summary

**Audit Date**: January 2, 2026
**SDK Version**: 2.0.0-alpha.0
**Status**: Production Alpha Ready

---

## Quick Facts

| Aspect | Details |
|--------|---------|
| **Version** | 2.0.0-alpha.0 |
| **Language** | TypeScript (strict mode) |
| **Core Dependency** | viem ^2.43.3 |
| **Package Name** | @radiustechsystems/sdk |
| **Build Outputs** | ESM, CJS, Type declarations |
| **Node.js Required** | >=22 |
| **License** | MIT |

## Core API at a Glance

### Initialization
```typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(), // optional, auto-configured
});
```

### Signer Creation
```typescript
import {
  createPrivateKeySigner,
  createClefSigner,
  type RadiusSigner,
} from '@radiustechsystems/sdk';

// Private key signer (development only)
const signer = createPrivateKeySigner(privateKeyHex, chainId);

// Clef signer (production-recommended)
const clefSigner = createClefSigner(address, chainId, 'http://localhost:8550');
```

### Essential Operations
```typescript
// Send native tokens with confirmation
await client.sendAndWait(signer, recipientAddress, amountInWei);

// Execute contract method with confirmation
await client.executeAndWait(
  { address: contractAddress, abi: contractABI },
  signer,
  'transfer',
  recipientAddress,
  amount
);

// Extend client with custom functionality
const enhancedClient = client.extend((base) => ({
  async getBalanceFormatted(address: Address) {
    const balance = await base.getBalance(address);
    return formatEther(balance);
  },
}));
```

### Error Handling
```typescript
import {
  RadiusError,
  InsufficientBalanceError,
  TransactionFailedError,
  TransactionRevertedError,
  type SendTransactionErrorType,
} from '@radiustechsystems/sdk';

try {
  await client.sendAndWait(signer, to, value);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.log(`Balance: ${error.balance}, Required: ${error.required}`);
  } else if (error instanceof TransactionRevertedError) {
    console.log(`Reverted: ${error.revertReason}`);
  } else if (error instanceof RadiusError) {
    console.log(error.shortMessage); // Human-readable message
    error.walk((cause) => console.log(cause)); // Traverse error chain
  }
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Application Code                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
    ┌────v─────────┐        ┌──────v──────────┐
    │ RadiusClient │        │  RadiusSigner   │
    │  (Exported)  │        │   (Interface)   │
    └────┬─────────┘        └──┬───────┬──────┘
         │                     │       │
    ┌────v─────────────┐   ┌───v──┐   │
    │ viem PublicClient│   │PKSig │   │
    │ (Underlying)     │   │      │   │
    └────┬─────────────┘   └──────┘   │
         │                            │
    ┌────v────────────────────────────v──────────┐
    │          viem HTTP/WS Transport            │
    └─────────────────────────────────────────────┘
         │
    ┌────v─────────────────────────────┐
    │  Radius JSON-RPC Endpoint         │
    └──────────────────────────────────┘

Legend:
  PKSig = PrivateKeySigner
  Also supports ClefSigner for production key management
```

## Key v2 Changes from v1

| Change | Description | Migration |
|--------|-------------|-----------|
| **Address as TYPE ALIAS** | No longer a class, now `type Address = 0x${string}` | Treat as immutable type, no methods |
| **Receipt.status** | Changed from numeric (0/1) to string enum | Check for `'success' \| 'reverted'` |
| **sendSync → sendAndWait** | Renamed for clarity, old name still works (deprecated) | Update call sites for v3 compatibility |
| **executeSync → executeAndWait** | Renamed for clarity, old name still works (deprecated) | Update call sites for v3 compatibility |
| **Error Hierarchy** | New typed error classes for each failure mode | Use `instanceof` checks instead of codes |
| **client.extend()** | New method to customize client behavior | Chain multiple configurations |
| **Chain Contracts** | RADIUS_TESTNET_CONTRACTS and RADIUS_MAINNET_CONTRACTS exported | Use for contract interactions |
| **Environment Variables** | New support for config via env vars | RADIUS_RPC_URL, RADIUS_CHAIN_ID, etc. |

## Module Breakdown

| Module | Purpose | Key Exports |
|--------|---------|------------|
| **client** | Main client interface and transaction methods | `createRadiusClient`, `RadiusClient`, `RadiusReceipt` |
| **auth** | Signing strategies for transactions | `PrivateKeySigner`, `ClefSigner`, `createPrivateKeySigner`, `createClefSigner` |
| **chains** | Chain configurations and contracts | `radiusTestnet`, `radiusMainnet`, `RADIUS_*_CONTRACTS` |
| **common** | Data types, utilities, and helpers | `Address`, `Hash`, `Receipt` (deprecated), `isAddressEqual`, `toChecksumAddress` |
| **crypto** | Cryptographic utilities | Keccak256 hashing, key derivation |
| **contracts** | Contract interaction helpers | `createContract`, `erc20()` factory, contract types |
| **errors** | Typed error classes and unions | `RadiusError`, `TransactionFailedError`, error type unions |
| **events** | Event subscription and log querying | `watchTransfer`, `watchApproval`, `getLogs`, `getLogsAdaptive` |
| **react** | React hooks and context | `useRadiusSend`, `useERC20Balance`, `RadiusProvider` |
| **wagmi** | wagmi integration for wallet connections | `privateKeyConnector` |
| **transport** | Low-level HTTP/WebSocket transport | `createInterceptingTransport`, `createWebSocketTransport` |

## Security Considerations

### Private Key Management
- **PrivateKeySigner**: Stores keys in memory; suitable only for development/testing
- **ClefSigner**: Integrates with Clef key management server for production deployments
- **Never commit keys**: Use environment variables for configuration

### EIP-155 Chain ID Protection
- All signers require explicit `chainId` parameter during creation
- Prevents transaction signing for unintended chains
- Validates chain ID during transaction construction

### Transport Security
- Default HTTP transport uses chain's configured RPC URL
- WebSocket transport available for event subscriptions
- Optional interceptor for request/response inspection and modification

### Error Message Security
- RadiusError instances include human-readable `shortMessage`
- Detailed information available via `message` property
- Error cause chain traversable via `.walk()` method for debugging

## Dependencies Summary

### Required
- **viem** (^2.0.0): Core blockchain interaction library with full EVM support

### Optional (Peer Dependencies)
- **wagmi** (^3.0.0): React hooks for wallet integration and account management
- **react** (>=18.0.0): Required only when using React hooks from `/react` export
- **@tanstack/react-query** (>=5.0.0): Required only when using React hooks from `/react` export

### Development Only
- TypeScript 5.9+, Biome for linting/formatting, Vitest for testing

## Quick Start Example

```typescript
import {
  createRadiusClient,
  createPrivateKeySigner,
  radiusTestnet,
} from '@radiustechsystems/sdk';

// 1. Create client
const client = createRadiusClient({
  chain: radiusTestnet,
});

// 2. Create signer
const signer = createPrivateKeySigner(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  radiusTestnet.id
);

// 3. Send transaction
const receipt = await client.sendAndWait(
  signer,
  '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1',
  1000000000000000n // 0.001 native currency
);

console.log('Success:', receipt.status === 'success');
console.log('Gas used:', receipt.gasUsed);
```

## Production Readiness

- Comprehensive TypeScript strict mode support with full type safety
- Multi-format build outputs (ESM, CJS, .d.ts declarations)
- Rich error types with cause chain traversal for debugging
- Environment variable configuration support
- Tested with modern Node.js (>=22)
- MIT licensed, open-source

## Next Steps

- Review [Module Breakdown](#module-breakdown) for your use case
- Check [Security Considerations](#security-considerations) for production deployments
- Use React hooks from `/react` export if building React frontends
- Reference error type unions for proper error handling patterns
