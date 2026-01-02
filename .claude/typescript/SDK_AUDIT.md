# Radius TypeScript SDK v2 - Comprehensive Audit

**Document Date**: January 2, 2026
**SDK Version**: 2.0.0-alpha.0
**Location**: `/Users/fox/Getting Started/radius-sdk/typescript`
**Status**: Ready for Production Alpha

---

## Table of Contents

1. [SDK Overview](#1-sdk-overview)
2. [Project Structure](#2-project-structure)
3. [Client Creation & Configuration](#3-client-creation--configuration)
4. [Core API Surface](#4-core-api-surface)
5. [Type System](#5-type-system)
6. [Error Hierarchy](#6-error-hierarchy)
7. [Signer Patterns](#7-signer-patterns)
8. [Contract Interaction](#8-contract-interaction)
9. [Chain Configuration](#9-chain-configuration)
10. [Code Quality & Dependencies](#10-code-quality--dependencies)

---

## 1. SDK Overview

### Purpose

The Radius TypeScript SDK provides a modern, type-safe interface for interacting with the Radius blockchain platform. Built on **viem** for maximum EVM compatibility and developer experience.

### Key Features

| Feature | Description |
|---------|-------------|
| **viem-based** | Leverages viem's stability and ecosystem |
| **Type-safe** | Full TypeScript support with strict mode |
| **Zero dependencies** | All external packages are peer dependencies |
| **Rich errors** | Comprehensive error hierarchy with cause chains |
| **Multi-format** | ESM, CJS, and TypeScript declarations |
| **Extensible** | `.extend()` method for custom client behavior |

### Version Information

| Component | Version |
|-----------|---------|
| SDK | 2.0.0-alpha.0 |
| TypeScript | ^5.9.3 |
| Viem | ^2.43.3 |
| Wagmi | ^3.1.3 |
| Node.js | >=22.0.0 |
| Biome | ^2.2.2 |
| Vitest | ^4.0.15 |

### Native Currency

Radius uses **USD** (not ETH) as the native currency:

```typescript
nativeCurrency: {
  decimals: 18,
  name: 'USD',
  symbol: 'USD',
}
```

---

## 2. Project Structure

### Directory Layout

```
typescript/
├── src/
│   ├── accounts/        # Account management (deprecated)
│   ├── auth/            # Signing strategies
│   │   ├── clef/        # ClefSigner implementation
│   │   ├── privatekey/  # PrivateKeySigner implementation
│   │   └── types.ts     # RadiusSigner interface
│   ├── chains/          # Chain definitions
│   │   └── radius.ts    # radiusTestnet, radiusMainnet
│   ├── client/          # Main client
│   │   └── client.ts    # RadiusClient, createRadiusClient
│   ├── common/          # Shared types and utilities
│   │   ├── address.ts   # Address type alias
│   │   └── receipt.ts   # Receipt interface
│   ├── contracts/       # Contract helpers
│   │   └── erc20.ts     # ERC20 class
│   ├── crypto/          # Cryptographic utilities
│   ├── errors/          # Error hierarchy
│   │   ├── base.ts      # RadiusError base class
│   │   ├── transaction.ts
│   │   ├── account.ts
│   │   └── contract.ts
│   ├── events/          # Event watching
│   ├── react/           # React hooks
│   ├── transport/       # HTTP/WebSocket transports
│   └── wagmi/           # wagmi connector
├── test/
│   ├── integration/     # Integration tests
│   └── setup.ts         # Test setup
├── docs/                # Generated documentation
├── scripts/             # Build scripts
├── biome.json           # Linting config
├── tsconfig.json        # TypeScript config
├── vitest.config.ts     # Test config
└── package.json         # Package manifest
```

### Module Exports

```json
{
  ".": "Main SDK (client, signers, errors)",
  "./react": "React hooks & components",
  "./chains": "Chain configurations",
  "./events": "Event listeners",
  "./wagmi": "Wagmi connectors"
}
```

---

## 3. Client Creation & Configuration

### Factory Function

**File**: `src/client/client.ts`

```typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { http } from 'viem';

// Basic usage - auto-configured from chain
const client = createRadiusClient({ chain: radiusTestnet });

// With custom transport
const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http('https://custom-rpc.example.com'),
});
```

### Environment Variables

The client reads RPC URL from environment (Node.js only):

| Variable | Description |
|----------|-------------|
| `RADIUS_RPC_URL` | Primary RPC endpoint |
| `RADIUS_ENDPOINT` | Fallback RPC endpoint |

### Client Extension

The `.extend()` method allows adding custom functionality:

```typescript
import { formatEther } from 'viem';

const client = createRadiusClient({ chain: radiusTestnet }).extend((base) => ({
  async getBalanceFormatted(address: Address) {
    const balance = await base.getBalance(address);
    return formatEther(balance);
  },
}));

const formatted = await client.getBalanceFormatted(signer.address);
```

---

## 4. Core API Surface

### Transaction Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `send()` | Send native tokens (fire-and-forget) | `Hash` |
| `sendAndWait()` | Send native tokens and wait | `RadiusReceipt` |
| `execute()` | Execute contract method (fire-and-forget) | `Hash` |
| `executeAndWait()` | Execute contract method and wait | `RadiusReceipt` |
| `call()` | Read-only contract call | `T` |
| `deployContract()` | Deploy smart contract | `{ address, receipt }` |

### Method Naming Convention

- **New API**: `sendAndWait()`, `executeAndWait()` - clearly indicates waiting behavior
- **Deprecated**: `sendSync()`, `executeSync()` - legacy names, still functional

### Usage Examples

```typescript
// Send native tokens with confirmation
const receipt = await client.sendAndWait(signer, recipientAddress, amountInWei);
console.log('Status:', receipt.status); // 'success' or 'reverted'

// Execute contract method
const receipt = await client.executeAndWait(
  { address: contractAddress, abi },
  signer,
  'transfer',
  recipientAddress,
  amount
);

// Read from contract
const balance = await client.call<bigint>(
  { address: contractAddress, abi },
  'balanceOf',
  userAddress
);
```

### RadiusReceipt Interface

```typescript
export interface RadiusReceipt {
  transactionHash: Hash;
  from: Address;
  to: Address | null;              // null for contract creation
  contractAddress: Address | null;  // set for deployments
  gasUsed: bigint;
  status: 'success' | 'reverted';   // string literal union
  blockNumber: bigint;
  blockHash: Hash;
  logs: TransactionLog[];
}
```

---

## 5. Type System

### Address as Type Alias

**File**: `src/common/address.ts`

The `Address` type is now a **type alias**, not a class:

```typescript
export type Address = `0x${string}`;
```

This provides:
- Zero runtime overhead
- Full viem compatibility
- Type-safe string operations

### Address Utilities

```typescript
export function addressToBytes(address: Address): Uint8Array;
export function isAddressEqual(a: Address, b: Address): boolean;
export function toChecksumAddress(address: Address): Address;
export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
```

### Receipt Status Type

```typescript
export type TransactionStatus = 'success' | 'reverted';
```

The `receipt.status` field uses a **string literal union** instead of numeric values (0/1).

### Hash Type

```typescript
export type Hash = `0x${string}`;
```

---

## 6. Error Hierarchy

The SDK implements a rich, structured error system based on viem's `BaseError` pattern.

### Base Error Class

**File**: `src/errors/base.ts`

```typescript
export interface RadiusErrorOptions {
  shortMessage?: string;        // Quick description
  details?: string;              // Detailed information
  docsPath?: string;            // URL path to documentation
  cause?: Error | unknown;       // Underlying cause
  meta?: Record<string, unknown>; // Additional metadata
}

export class RadiusError extends Error {
  readonly shortMessage: string;
  readonly details?: string;
  readonly docsPath?: string;
  override readonly cause?: Error | unknown;
  readonly meta?: Record<string, unknown>;

  walk(fn?: (err: unknown) => boolean): Error | unknown | null;
}
```

### Transaction Errors

**File**: `src/errors/transaction.ts`

| Error Class | When Thrown | Key Properties |
|-------------|-------------|----------------|
| `TransactionFailedError` | Transaction fails to execute | `transactionHash`, `reason` |
| `TransactionRevertedError` | Transaction reverts on-chain | `revertReason`, `revertData` |
| `GasEstimationError` | Gas estimation fails | `to`, `data` |
| `NonceError` | Invalid nonce | `nonce`, `expectedNonce` |
| `TransactionTimeoutError` | Confirmation timeout | `transactionHash`, `timeout` |

### Account Errors

**File**: `src/errors/account.ts`

| Error Class | When Thrown | Key Properties |
|-------------|-------------|----------------|
| `SignerNotFoundError` | No signer available | - |
| `InsufficientBalanceError` | Balance too low | `address`, `balance`, `required` |
| `SigningError` | Signing fails | - |
| `InvalidPrivateKeyError` | Bad private key format | - |
| `InvalidAddressError` | Address validation fails | `invalidAddress` |

### Contract Errors

**File**: `src/errors/contract.ts`

| Error Class | When Thrown | Key Properties |
|-------------|-------------|----------------|
| `ContractCallError` | Read call fails | `contractAddress`, `functionName`, `args` |
| `ContractDeploymentError` | Deployment fails | `bytecode`, `constructorArgs` |
| `MissingAbiError` | Required ABI missing | - |
| `AbiError` | ABI encoding/decoding fails | - |

### Error Handling Example

```typescript
import {
  RadiusError,
  InsufficientBalanceError,
  TransactionRevertedError,
} from '@radiustechsystems/sdk';

try {
  await client.sendAndWait(signer, to, value);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.log(`Need ${error.required}, have ${error.balance}`);
  } else if (error instanceof TransactionRevertedError) {
    console.log('Reverted:', error.revertReason);
  } else if (error instanceof RadiusError) {
    console.log(error.shortMessage);
    console.log(`Docs: https://docs.radiustech.xyz${error.docsPath}`);

    // Walk the error chain
    const root = error.walk();
  }
}
```

---

## 7. Signer Patterns

### RadiusSigner Interface

**File**: `src/auth/types.ts`

```typescript
export interface RadiusSigner {
  readonly address: `0x${string}`;
  readonly chainId: number;
  signMessage(message: SignableMessage): Promise<Hex>;
  signTransaction(tx: TransactionSerializable): Promise<Hex>;
}
```

### PrivateKeySigner

**File**: `src/auth/privatekey/signer.ts`

For development and testing. Stores private key in memory.

```typescript
import { createPrivateKeySigner } from '@radiustechsystems/sdk';

const signer = createPrivateKeySigner(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  radiusTestnet.id
);

console.log(signer.address); // '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
```

**Security Warning**: Never use PrivateKeySigner in production.

### ClefSigner

**File**: `src/auth/clef/signer.ts`

For production. Uses external Clef key management server.

```typescript
import { createClefSigner } from '@radiustechsystems/sdk';

const signer = createClefSigner(
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  radiusTestnet.id,
  'http://localhost:8550'
);

// Verify connection before use
await signer.verifyConnection();
```

### Security Comparison

| Approach | Security | Use Case |
|----------|----------|----------|
| **PrivateKeySigner** | Low | Development, testing |
| **ClefSigner** | High | Production, key management |
| **Hardware Wallet** | Very High | Enterprise, cold storage |

---

## 8. Contract Interaction

### ContractInstance Interface

```typescript
export interface ContractInstance {
  abi: Abi;
  address: Address;
}
```

### Read Operations

```typescript
// Generic call with type parameter
const balance = await client.call<bigint>(
  { abi: ERC20_ABI, address: tokenAddress },
  'balanceOf',
  userAddress
);

const symbol = await client.call<string>(
  { abi: ERC20_ABI, address: tokenAddress },
  'symbol'
);
```

### Write Operations

```typescript
// Fire-and-forget (returns transaction hash)
const txHash = await client.execute(
  { abi: ERC20_ABI, address: tokenAddress },
  signer,
  'transfer',
  recipientAddress,
  amount
);

// Wait for confirmation (returns receipt)
const receipt = await client.executeAndWait(
  { abi: ERC20_ABI, address: tokenAddress },
  signer,
  'transfer',
  recipientAddress,
  amount
);
```

### ERC20 Helper Class

**File**: `src/contracts/erc20.ts`

The ERC20 class uses its own signer type (`ERC20Signer`) for write operations, which differs from `RadiusSigner`:

```typescript
// ERC20Signer type (required for write operations)
type ERC20Signer = {
  walletClient: WalletClient;
  account: Account;
};
```

**Usage**:

```typescript
import { createERC20 } from '@radiustechsystems/sdk';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const token = createERC20(tokenAddress, client.publicClient);

// Read operations (no signer needed)
const balance = await token.balanceOf(userAddress);
const decimals = await token.decimals();

// Write operations require ERC20Signer
const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({
  chain: radiusTestnet,
  transport: http(),
});
const erc20Signer = { walletClient, account };

const receipt = await token.transferSync(erc20Signer, recipient, amount);
```

**Note**: For simpler token transfers, use `client.executeAndWait()` with the ERC20 ABI and a `RadiusSigner` instead of the ERC20 helper class.

### Contract Deployment

```typescript
const { address, receipt } = await client.deployContract(
  signer,
  bytecode,
  abi,
  constructorArg1,
  constructorArg2
);

console.log('Deployed at:', address);
```

---

## 9. Chain Configuration

### Chain Definitions

**File**: `src/chains/radius.ts`

```typescript
export const radiusTestnet = defineChain({
  id: 1223953,
  name: 'Radius Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://explorer.testnet.radiustech.xyz',
    },
  },
  contracts: {
    sbc: {
      address: '0xF966020a30946A64B39E2e243049036367590858',
    },
  },
  testnet: true,
});
```

### Chain Contracts

```typescript
export const RADIUS_TESTNET_CONTRACTS = {
  sbc: '0xF966020a30946A64B39E2e243049036367590858' as const,
} as const;

// Usage
const sbcAddress = radiusTestnet.contracts?.sbc?.address;
// or
const sbcAddress = RADIUS_TESTNET_CONTRACTS.sbc;
```

### Mainnet Configuration

```typescript
export const radiusMainnet = defineChain({
  id: 1223954, // Placeholder - update when mainnet launches
  name: 'Radius',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.radiustech.xyz'], // Placeholder
    },
  },
  // ...
});
```

**Note**: Mainnet values are placeholders. Update when Radius mainnet launches.

---

## 10. Code Quality & Dependencies

### TypeScript Configuration

**File**: `tsconfig.json`

- **Strict Mode**: Enabled (all strict options)
- **Target**: ES2022
- **Module**: ESNext
- **Declaration Maps**: Enabled for debugging

### Linting & Formatting

**Tool**: Biome 2.2.2+

**File**: `biome.json`

Key rules:
- `noUnusedVariables`: error
- `noExplicitAny`: error
- `useConst`: error
- Quote style: single
- Trailing commas: all
- Line width: 100

### Dependencies

#### Peer Dependencies (Required)

| Package | Version | Optional | Purpose |
|---------|---------|----------|---------|
| `viem` | `>=2.0.0` | No | Core blockchain interactions |
| `wagmi` | `>=3.0.0` | Yes | React hooks for Web3 |
| `react` | `>=18.0.0` | Yes | React integration |
| `@tanstack/react-query` | `>=5.0.0` | Yes | Query management |
| `typescript` | `>=5.0.0` | No | Type checking |

**Key Benefit**: Zero direct dependencies reduces bundle size and supply chain risk.

### Build Outputs

1. **ESM** (`src/_esm/`): Modern ES modules, tree-shakeable
2. **CJS** (`src/_cjs/`): CommonJS for Node.js compatibility
3. **Types** (`src/_types/`): TypeScript declarations

### Testing

**Framework**: Vitest 4.0.15+

```bash
pnpm run test       # Run once
pnpm run test:watch # Watch mode
pnpm run check:types # Type checking
```

Test structure:
- Unit tests: `src/**/*.test.ts`
- Integration tests: `test/integration/*.test.ts`
- Setup: `test/setup.ts`

---

## Production Checklist

Before deploying to production:

- [ ] Update mainnet chain configuration with real values
- [ ] Use ClefSigner or hardware wallet (not PrivateKeySigner)
- [ ] Set RADIUS_RPC_URL to production endpoint
- [ ] Enable error logging with proper handlers
- [ ] Add request/response interceptors for monitoring
- [ ] Test all error scenarios
- [ ] Implement rate limiting if needed
- [ ] Add health check endpoints
- [ ] Document error codes for frontend
- [ ] Set up alerting for transaction failures

---

## Migration from v1 to v2

### Key Changes

| v1 | v2 | Migration |
|----|----|-----------
| ethers.js | viem | Complete refactor required |
| `contract.send()` | `client.sendAndWait()` | Update method calls |
| Address class | Address type alias | Remove `.toString()` calls |
| `receipt.status === 1` | `receipt.status === 'success'` | Update status checks |
| `sendSync()` | `sendAndWait()` | Rename (old still works) |
| `executeSync()` | `executeAndWait()` | Rename (old still works) |

---

## Summary

The Radius TypeScript SDK v2 provides:

- **Modern Architecture**: Built on viem for EVM compatibility
- **Type Safety**: Full TypeScript strict mode support
- **Rich Errors**: Comprehensive error hierarchy with cause chains
- **Extensibility**: `.extend()` method for custom client behavior
- **Production Ready**: ClefSigner for secure key management
- **Zero Dependencies**: All external packages are peer dependencies

For questions or issues, see:
- **GitHub**: https://github.com/radiustechsystems/sdk
- **Documentation**: https://docs.radiustech.xyz
- **Issues**: https://github.com/radiustechsystems/sdk/issues

---

**Audit Date**: January 2, 2026
**Audit Version**: 2.0
**Status**: Complete

---

**End of SDK Audit Document**
