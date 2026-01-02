# Radius v2 TypeScript SDK - Comprehensive Audit Report

**Version:** 2.0.0-alpha.0
**Created:** January 2, 2026
**Location:** `/Users/fox/Getting Started/radius-sdk/typescript`

---

## Executive Summary

The Radius v2 TypeScript SDK is a viem-based client library for interacting with the Radius blockchain platform. The SDK provides a clean, modern API focused on:

- **Client creation** via `createRadiusClient()`
- **Transaction signing** with pluggable signers (PrivateKey, Clef)
- **Contract interaction** with ABI encoding/decoding
- **React integration** with hooks and providers
- **ERC-20 token handling** with built-in contract support
- **Event monitoring** with pagination helpers
- **Wagmi integration** for React DApp development

The codebase is well-structured with strict TypeScript configuration, comprehensive documentation, and clear separation of concerns. It's currently in alpha stage with mature architecture patterns.

---

## 1. Project Structure

### Directory Organization

```
typescript/
├── src/
│   ├── accounts/          # Account abstraction with nonce/balance management
│   ├── auth/              # Signer implementations (PrivateKey, Clef)
│   ├── chains/            # Chain definitions (testnet, mainnet)
│   ├── client/            # Main RadiusClient implementation
│   ├── common/            # Core data types (Address, Transaction, Receipt, etc.)
│   ├── contracts/         # Contract interaction utilities (ERC20, generic Contract)
│   ├── crypto/            # Cryptographic utilities (keccak256, signing)
│   ├── events/            # Event/log querying with pagination
│   ├── react/             # React integration (Provider, hooks, context)
│   ├── transport/         # Custom viem transport with interception
│   ├── wagmi/             # Wagmi connector for React DApps
│   └── index.ts           # Main entry point
├── test/
│   ├── integration/       # Integration tests against testnet
│   ├── unit/              # Unit tests (React hooks)
│   └── setup.ts           # Test configuration
├── docs/                  # Documentation
├── package.json           # Dependencies and build config
├── tsconfig.json          # TypeScript configuration
├── biome.json             # Code linting/formatting
└── vitest.config.ts       # Test runner configuration
```

### Entry Points

#### Primary Export (`src/index.ts`)
```typescript
// Main exports:
export { createRadiusClient, RadiusClient, RadiusClientConfig, MAX_GAS } from './client';
export {
  createPrivateKeySigner, PrivateKeySigner,
  createClefSigner, ClefSigner,
  type RadiusSigner
} from './auth';
export { radiusMainnet, radiusTestnet } from './chains';
// Plus accounts, contracts, common, crypto, transport re-exports
```

#### Sub-exports (Conditional)
- `./react` - React hooks and provider
- `./chains` - Chain definitions
- `./events` - Event/log utilities
- `./wagmi` - Wagmi connector

### Build Configuration

**Package.json Key Settings:**
- **Name:** `@radiustechsystems/sdk`
- **Type:** ESM module
- **Node requirement:** >=22
- **Build outputs:**
  - CJS: `src/_cjs/` (CommonJS)
  - ESM: `src/_esm/` (ES Modules)
  - Types: `src/_types/` (TypeScript declarations)

**Build Scripts:**
```bash
npm run build      # Full build (CJS + ESM + Types)
npm run build:esm  # ES Module build
npm run build:cjs  # CommonJS build
npm run build:types # Type declarations only
npm run test       # Run tests
npm run lint       # Code linting with Biome
npm run format     # Auto-format code
```

---

## 2. Client Creation

### API Overview

**Primary Factory Function:** `createRadiusClient(config)`

```typescript
// File: src/client/client.ts

interface RadiusClientConfig {
  chain: Chain;              // Chain definition (e.g., radiusTestnet)
  transport?: Transport;     // Optional viem transport
  interceptor?: Interceptor; // Optional response interceptor
  logger?: Logf;            // Optional debug logger
}

function createRadiusClient(config: RadiusClientConfig): RadiusClient
```

### Usage Examples

**Basic Usage:**
```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { http } from 'viem';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});
```

**With Logging:**
```typescript
const client = createRadiusClient({
  chain: radiusTestnet,
  logger: console.log,
});
```

**With Custom Interceptor:**
```typescript
const client = createRadiusClient({
  chain: radiusTestnet,
  interceptor: async (reqBody, response) => {
    // Inspect or modify response
    console.log('RPC Response:', response);
    return response;
  },
});
```

### Configuration Patterns

**Chain Definition Pattern:**
Uses viem's `defineChain()` utility:

```typescript
// File: src/chains/radius.ts

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
  testnet: true,
});

export const radiusMainnet = defineChain({
  id: 1223954, // Placeholder
  name: 'Radius',
  // ... mainnet configuration (TBD)
});
```

**Key Design Decisions:**
- Wraps viem's `createPublicClient` internally
- Creates intercepting transport automatically if logger/interceptor provided
- Defaults to RPC URL from chain config
- Applies 20% gas safety margin (capped at `MAX_GAS`)
- Uses zero gas price (Radius-specific feature)

---

## 3. Account/Signer Patterns

### Signer Interface

**Core Interface:** `RadiusSigner` (viem-compatible)

```typescript
// File: src/auth/types.ts

interface RadiusSigner {
  readonly address: `0x${string}`;
  readonly chainId: number;
  signMessage(message: SignableMessage): Promise<Hex>;
  signTransaction(tx: TransactionSerializable): Promise<Hex>;
}
```

### Signer Implementations

#### 1. PrivateKeySigner

**File:** `src/auth/privatekey/signer.ts`

```typescript
export class PrivateKeySigner implements RadiusSigner {
  constructor(privateKey: Hex, chainId: number);

  get address(): `0x${string}`;
  async signMessage(message: SignableMessage): Promise<Hex>;
  async signTransaction(tx: TransactionSerializable): Promise<Hex>;
}

// Factory function
export function createPrivateKeySigner(
  privateKey: Hex,
  chainId: number
): PrivateKeySigner;
```

**Usage:**
```typescript
import { createPrivateKeySigner } from '@radiustechsystems/sdk';

const signer = createPrivateKeySigner(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  1223953 // Radius testnet chain ID
);

console.log(signer.address); // '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

// Sign a transaction
const signedTx = await signer.signTransaction({
  to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  value: 1000000000000000000n,
  nonce: 0,
  gas: 21000n,
  gasPrice: 0n, // Radius uses zero gas price
  chainId: 1223953,
});
```

**Implementation Details:**
- Wraps viem's `privateKeyToAccount()` internally
- Private key stored in memory (security consideration)
- Includes chain ID for EIP-155 transaction signing
- Prevents replay attacks across chains

#### 2. ClefSigner

**File:** `src/auth/clef/signer.ts`

```typescript
export class ClefSigner implements RadiusSigner {
  constructor(
    address: `0x${string}`,
    chainId: number,
    clefUrl: string
  );

  readonly address: `0x${string}`;
  readonly chainId: number;

  async signMessage(message: SignableMessage): Promise<Hex>;
  async signTransaction(tx: TransactionSerializable): Promise<Hex>;
  async verifyConnection(): Promise<boolean>;
}

// Factory function
export function createClefSigner(
  address: `0x${string}`,
  chainId: number,
  clefUrl: string
): ClefSigner;
```

**Usage:**
```typescript
import { createClefSigner } from '@radiustechsystems/sdk';

const signer = createClefSigner(
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  1223953,
  'http://localhost:8550' // Clef RPC endpoint
);

// Verify Clef is running
await signer.verifyConnection();

// Sign transaction via Clef
const signedTx = await signer.signTransaction({
  to: '0x...',
  value: 1000000000000000000n,
  nonce: 0,
});
```

**Implementation Details:**
- Communicates with Clef via JSON-RPC
- Keys never exposed to application
- Production-suitable for secure key management
- Includes connection verification
- Supports EIP-1559 transactions

### Account Abstraction

**File:** `src/accounts/account.ts`

```typescript
export class Account {
  signer?: RadiusSigner;

  constructor(signer?: RadiusSigner);

  static async New(...opts: AccountOption[]): Promise<Account>;

  address(): Address;
  async balance(client: AccountClient): Promise<bigint>;
  async nonce(client: AccountClient): Promise<number>;
  async send(client: AccountClient, recipient: Address, value: bigint): Promise<Receipt>;
  async signMessage(message: BytesLike): Promise<Uint8Array>;
  async signTransaction(transaction: Transaction): Promise<SignedTransaction>;
}
```

**Usage Pattern:**
```typescript
import { Account } from '@radiustechsystems/sdk';

// Create account with signer
const account = await Account.New(WithSigner(signer));

// Get account info
const address = account.address();
const balance = await account.balance(client);
const nonce = await account.nonce(client);

// Send transaction
const receipt = await account.send(client, recipientAddress, 1000000000000000000n);
```

### Private Key Handling

**Security Approach:**
- Private keys accepted as hex strings (`0x${string}` format)
- Immediately wrapped by viem's account utilities
- No intermediate storage or exposure
- PrivateKeySigner loads key into memory (development/testing only)
- Recommended: Use ClefSigner for production

**Type Safety:**
- Uses branded types: `Hex`, `0x${string}`
- Prevents accidental type coercion
- TypeScript ensures correct usage at compile time

---

## 4. Core API Surface

### RadiusClient Interface

**File:** `src/client/client.ts`

```typescript
interface RadiusClient {
  // Public viem client for advanced operations
  readonly publicClient: PublicClient;

  // Read operations
  getChainId(): Promise<bigint>;
  getBalance(address: Address): Promise<bigint>;
  getCode(address: Address): Promise<Hex>;
  getNonce(address: Address): Promise<number>;
  estimateGas(tx: TransactionRequest): Promise<bigint>;

  // Contract interaction
  call<T = unknown>(
    contract: ContractInstance,
    method: string,
    ...args: unknown[]
  ): Promise<T>;

  execute(
    contract: ContractInstance,
    signer: RadiusSigner,
    method: string,
    ...args: unknown[]
  ): Promise<Hash>;

  executeSync(
    contract: ContractInstance,
    signer: RadiusSigner,
    method: string,
    ...args: unknown[]
  ): Promise<RadiusReceipt>;

  // Native transfers
  send(signer: RadiusSigner, to: Address, value: bigint): Promise<Hash>;
  sendSync(signer: RadiusSigner, to: Address, value: bigint): Promise<RadiusReceipt>;

  // Contract deployment
  deployContract(
    signer: RadiusSigner,
    bytecode: Hex,
    abi: Abi,
    ...args: unknown[]
  ): Promise<{ address: Address; receipt: RadiusReceipt }>;

  // Low-level
  sendRawTransaction(signedTx: Hex): Promise<Hash>;
  waitForReceipt(hash: Hash): Promise<RadiusReceipt>;
}
```

### Complete Exported API

#### Main Exports (from `src/index.ts`)

**Clients & Configuration:**
- `createRadiusClient(config)` - Main client factory
- `type RadiusClient` - Client interface
- `type RadiusClientConfig` - Configuration
- `type ContractInstance` - Contract info interface
- `type RadiusReceipt` - Transaction receipt
- `MAX_GAS` - Gas limit constant (1319413953330n)

**Authentication:**
- `createPrivateKeySigner(key, chainId)` - Private key signer factory
- `PrivateKeySigner` - Class
- `type PrivateKeySignerConfig`
- `createClefSigner(address, chainId, url)` - Clef signer factory
- `ClefSigner` - Class
- `type ClefSignerConfig`
- `type RadiusSigner` - Signer interface

**Chains:**
- `radiusTestnet` - Testnet configuration
- `radiusMainnet` - Mainnet configuration

**Accounts:**
- `Account` - Account class
- `type AccountOption` - Option function type
- `WithSigner(signer)` - Add signer to account

**Contracts:**
- `Contract` - Generic contract class
- `ERC20` - ERC-20 token class
- `createERC20(address, client)` - ERC-20 factory
- `ERC20_ABI` - Standard ERC-20 ABI

**Common/Utilities:**
- `Address` - Address class
- `Transaction` - Unsigned transaction
- `SignedTransaction` - Signed transaction
- `Receipt` - Transaction receipt
- `Hash` - Hash type
- Various utility functions

**Crypto:**
- `hexToSigningKey(key)` - Convert hex to signing key
- `keccak256(data)` - Hash function
- `pubkeyToAddress(pubkey)` - Derive address from public key
- `sign(hash, key)` - Sign digest

**Transport:**
- `createInterceptingTransport(options)` - Custom transport with logging/interception
- `type Interceptor` - Response interceptor
- `type Logf` - Logger function

**Events (from `./events`):**
- `getLogs(client, params)` - Fetch logs with pagination
- `getLogsAdaptive(client, params)` - Adaptive chunk sizing
- `type GetLogsParams`
- `type GetLogsAdaptiveParams`
- `watchLogs(client, params, callback)` - Real-time log monitoring
- `watchTransfer(client, params, callback)` - ERC-20 transfer monitoring
- `watchApproval(client, params, callback)` - ERC-20 approval monitoring
- `watchBlock(client, callback)` - Block monitoring

**React (from `./react`):**
- `RadiusProvider` - Provider component
- `RadiusContextProvider` - Context provider
- `useRadiusContext()` - Context hook
- `useRadiusBalance(address)` - Balance hook
- `useRadiusSend(signer)` - Send transaction hook
- `useERC20Balance(token, owner)` - ERC-20 balance hook
- `useERC20Approve(token)` - ERC-20 approve hook
- `useERC20Transfer(token)` - ERC-20 transfer hook
- `useERC20Allowance(token, owner, spender)` - Allowance hook
- `useERC20Metadata(token)` - Token metadata hook

**Wagmi (from `./wagmi`):**
- `privateKeyConnector(options)` - Wagmi connector (dev only)
- `type PrivateKeyConnectorOptions`

### Re-exported viem Types

```typescript
export type {
  Abi, Address, Chain, Hash, Hex, TransactionReceipt, Transport
} from 'viem';
```

### Naming Conventions

**Sync vs Async Patterns:**
- `send()` - Fire-and-forget (returns hash immediately)
- `sendSync()` - Wait for receipt
- `execute()` - Fire-and-forget contract call
- `executeSync()` - Wait for contract receipt

**Type Naming:**
- `Radius*` prefix for SDK-specific types (RadiusClient, RadiusReceipt, RadiusSigner)
- `create*` prefix for factory functions
- `use*` prefix for React hooks
- No prefixes for utility functions (getLogs, keccak256, etc.)

---

## 5. Type System

### Custom Type Definitions

**Address Types:**
```typescript
// File: src/common/address.ts
export type BytesLike = Uint8Array | Hex | string;

export class Address {
  constructor(data: Address | BytesLike | string);
  bytes(): Uint8Array;
  ethAddress(): string;
  hex(): Hex;
  equals(other: Address): boolean;
}
```

**Transaction Types:**
```typescript
// File: src/common/transaction.ts
export type BigNumberish = bigint | number | string;

export class Transaction {
  data: BytesLike;
  gas: BigNumberish;
  gasPrice: BigNumberish;
  nonce?: number;
  to?: Address;
  value?: BigNumberish;
}

export class SignedTransaction {
  readonly serialized: `0x${string}`;
  toString(): string;
}
```

**Receipt Types:**
```typescript
// File: src/common/receipt.ts
export class Receipt {
  from: Address;
  to: Address;
  contractAddress: Address;
  txHash: Hash;
  gasUsed: BigNumberish;
  status: number;
  logs: Event[];
  value?: BigNumberish;
}

// Also available as RadiusReceipt:
export interface RadiusReceipt {
  transactionHash: Hash;
  from: Address;
  to: Address | null;
  contractAddress: Address | null;
  gasUsed: bigint;
  status: 'success' | 'reverted';
  blockNumber: bigint;
  blockHash: Hash;
  logs: TransactionReceipt['logs'];
}
```

**Event Types:**
```typescript
// File: src/common/event.ts
export class Event {
  // Event/log representation
}
```

### viem Integration

**Re-exported Types:**
All viem types used in the SDK are re-exported for convenience:
```typescript
export type {
  Abi,
  Address,
  Chain,
  Hash,
  Hex,
  TransactionReceipt,
  Transport,
} from 'viem';
```

**Type Composition:**
- `RadiusClient` uses viem's `PublicClient` internally
- Signers implement viem's `SignableMessage` and `TransactionSerializable`
- Contracts use viem's `Abi` type
- Transport layer uses viem's `Transport` type

**Custom Branded Types:**
- `Hex` branded as `0x${string}` for compile-time safety
- `Hash` branded for transaction hashes
- `Address` custom class for 20-byte addresses

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "lib": ["ES2022", "DOM"],
    "jsx": "react-jsx"
  }
}
```

**Strict Mode:** Enabled
- `noImplicitAny`: No untyped values
- `strictNullChecks`: Null safety
- `strictFunctionTypes`: Function type checking
- `strictBindCallApply`: Bind/call/apply checking

---

## 6. Transaction Patterns

### Transaction Flow

**1. Create Transaction (Unsigned)**

```typescript
// Option A: Direct client method
const hash = await client.send(signer, recipientAddress, amount);

// Option B: Via contract
const hash = await client.execute(contract, signer, 'transfer', recipient, amount);

// Option C: Custom transaction
const tx: TransactionRequest = {
  to: recipientAddress,
  value: amount,
  data: '0x',
};
const gas = await client.estimateGas(tx);
```

**2. Sign Transaction**

```typescript
const signedTx = await signer.signTransaction({
  to: recipientAddress,
  value: amount,
  nonce: nonce,
  gas: estimatedGas,
  gasPrice: 0n, // Radius uses zero gas price
  chainId: signer.chainId,
});
```

**3. Send Transaction**

```typescript
// Direct send
const hash = await client.send(signer, to, value);

// Raw transaction
const hash = await client.sendRawTransaction(signedTx);

// Fire-and-forget methods don't wait for confirmation
```

**4. Wait for Receipt**

```typescript
const receipt = await client.waitForReceipt(hash);
// or use the Sync variants:
const receipt = await client.sendSync(signer, to, value);
```

### Receipt Handling

**Receipt Structure:**
```typescript
interface RadiusReceipt {
  transactionHash: Hash;      // Transaction ID
  from: Address;              // Sender
  to: Address | null;         // Recipient (null for contract creation)
  contractAddress: Address | null; // New contract address
  gasUsed: bigint;            // Gas consumed
  status: 'success' | 'reverted'; // Outcome
  blockNumber: bigint;        // Block height
  blockHash: Hash;            // Block ID
  logs: Log[];                // Events
}
```

**Usage Pattern:**
```typescript
const receipt = await client.sendSync(signer, recipient, amount);

if (receipt.status === 'success') {
  console.log(`Sent ${amount} to ${receipt.to}`);
  console.log(`Gas used: ${receipt.gasUsed}`);
  console.log(`Block: ${receipt.blockNumber}`);
} else {
  throw new Error('Transaction reverted');
}
```

### Gas Estimation

**Automatic Gas Handling:**

```typescript
// File: src/client/client.ts - signAndSendTransaction()

const estimate = await publicClient.estimateGas({
  account: signer.address,
  to: tx.to,
  data: tx.data,
  value: tx.value,
});

// Apply 20% safety margin
const margin = estimate / 5n;
const gas = estimate + margin;

// Cap at MAX_GAS
if (gas > MAX_GAS) {
  gas = MAX_GAS;
}
```

**Constants:**
- `MAX_GAS = 1319413953330n` - Upper limit to prevent runaway costs
- Gas price always `0n` - Radius uses zero gas price model

**Manual Gas Control:**

```typescript
// Pass explicit gas in transaction request
const hash = await client.send(signer, to, value);
// OR provide custom gas in estimateGas

const estimate = await client.estimateGas({
  to: recipientAddress,
  value: amount,
  data: '0x',
  // gas will be estimated automatically
});
```

---

## 7. Contract Interaction

### Contract Instantiation

**Generic Contract Class:**

```typescript
// File: src/contracts/contract.ts

export class Contract {
  readonly abi: ABI;

  constructor(address: Address, abi: ABI);
  address(): Address;

  async call(client: ContractClient, method: string, ...args): Promise<unknown[]>;
  async execute(client: ContractClient, signer: RadiusSigner, method: string, ...args): Promise<Receipt>;
}
```

**Usage:**
```typescript
import { Contract, Address } from '@radiustechsystems/sdk';
import { parseAbi } from 'viem';

const abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]);

const contract = new Contract(
  new Address('0x...tokenAddress'),
  abi
);

// Read call
const balance = await contract.call(client, 'balanceOf', '0x...');

// State-changing call
const receipt = await contract.execute(client, signer, 'transfer', recipient, amount);
```

### ERC-20 Contract Support

**Built-in ERC-20 Class:**

```typescript
// File: src/contracts/erc20.ts

export class ERC20 {
  readonly address: `0x${string}`;

  constructor(address: `0x${string}`, publicClient: PublicClient);

  // Read methods
  async name(): Promise<string>;
  async symbol(): Promise<string>;
  async decimals(): Promise<number>;
  async totalSupply(): Promise<bigint>;
  async balanceOf(owner: `0x${string}`): Promise<bigint>;
  async allowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint>;

  // Write methods (async, fire-and-forget)
  async transfer(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<Hash>;
  async approve(signer: ERC20Signer, spender: `0x${string}`, amount: bigint): Promise<Hash>;
  async transferFrom(signer: ERC20Signer, from: `0x${string}`, to: `0x${string}`, amount: bigint): Promise<Hash>;

  // Write methods with confirmation (Sync variants)
  async transferSync(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;
  async approveSync(signer: ERC20Signer, spender: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;
  async transferFromSync(signer: ERC20Signer, from: `0x${string}`, to: `0x${string}`, amount: bigint): Promise<TransactionReceipt>;

  // Utilities
  async formatAmount(amount: bigint): Promise<string>;
  async parseAmount(amount: string): Promise<bigint>;
  clearCache(): void;
}

export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);
```

**ERC-20 Usage:**

```typescript
import { createERC20 } from '@radiustechsystems/sdk';
import { createPublicClient, http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

const usdc = createERC20('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', publicClient);

// Read operations
const balance = await usdc.balanceOf('0x...');
const decimals = await usdc.decimals();
const formatted = await usdc.formatAmount(balance);
console.log(`Balance: ${formatted} USDC`);

// Write operations
const signer = { walletClient, account };
const hash = await usdc.transfer(signer, recipient, amount);

// With confirmation
const receipt = await usdc.transferSync(signer, recipient, amount);
```

### Read vs Write Patterns

**Read Methods (Call):**
- Don't modify blockchain state
- Use `publicClient.readContract()` internally
- Return decoded values directly
- No gas cost
- Instant execution

```typescript
const result = await contract.call(client, 'balanceOf', address);
```

**Write Methods (Execute):**
- Require signer
- Create transactions
- Consume gas
- Return transaction hash immediately (async variant)
- Return receipt after confirmation (Sync variant)

```typescript
const hash = await contract.execute(client, signer, 'transfer', recipient, amount);
const receipt = await client.waitForReceipt(hash);
```

### ABI Handling

**ABI Definition:**
- Uses viem's `parseAbi()` for string-based ABI definition
- Alternatively, use parsed ABI objects
- Standard JSON ABI format compatible

**Function Encoding:**
```typescript
// Internally uses viem's encodeFunctionData
const data = encodeFunctionData({
  abi: contract.abi,
  functionName: 'transfer',
  args: [recipient, amount],
});
```

**Result Decoding:**
```typescript
// Internally uses viem's decodeFunctionResult
const decoded = decodeFunctionResult({
  abi: contract.abi,
  functionName: 'balanceOf',
  data: result.data,
});
```

---

## 8. Dependencies

### Package.json Dependencies

**Production Dependencies:** None (all are peerDependencies)

**Peer Dependencies:**
```json
{
  "viem": ">=2.0.0",          // Core Ethereum interactions
  "wagmi": ">=3.0.0",         // React hooks (optional)
  "@tanstack/react-query": ">=5.0.0", // Async state (optional)
  "react": ">=18.0.0",        // React (optional)
  "typescript": ">=5.0.0"     // TypeScript (required)
}
```

**Dev Dependencies:**
```json
{
  "@biomejs/biome": "^2.2.2",           // Linting/formatting
  "@types/node": "^22.10.0",            // Node.js types
  "@types/react": "^19.1.4",            // React types
  "@tanstack/react-query": "^5.90.16",  // For dev/testing
  "jsdom": "27.4.0",                    // DOM simulation
  "react": "^19.1.4",                   // For dev/testing
  "rimraf": "^6.0.1",                   // File cleanup
  "typescript": "^5.9.3",               // TypeScript compiler
  "viem": "^2.43.3",                    // For dev/testing
  "vitest": "^4.0.15",                  // Test runner
  "wagmi": "^3.1.3",                    // For dev/testing
  "@testing-library/react": "16.3.1",   // React testing
  "@testing-library/jest-dom": "6.9.1", // Test utilities
  "@vitest/coverage-v8": "^4.0.15"      // Coverage reports
}
```

**Key Library Versions:**
- **viem:** 2.43.3+ (no ethers.js or web3.js)
- **wagmi:** 3.1.3+ (React DApp framework)
- **React Query:** 5.90.16+ (async state management)
- **TypeScript:** 5.9.3+ (strict mode)

**No Direct Dependencies On:**
- ethers.js
- web3.js
- web3-types
- Any Ethereum client library except viem

### Library Choices

**viem Selected For:**
- Modern, type-safe Ethereum client
- Built-in support for new EVM chains
- Async-first API design
- Zero dependencies itself
- Active maintenance
- TypeScript-first development

**wagmi Selected For:**
- React hooks for wallet integration
- Multi-chain support
- Connector ecosystem
- Caching and refetching
- Dev experience

**React Query (TanStack Query):**
- Handles async state management in React
- Request deduplication
- Automatic refetching
- Caching strategies

---

## 9. Code Quality

### TypeScript Strictness

**Configuration (tsconfig.json):**
- **Target:** ES2022
- **Module:** ESNext (native modules)
- **strict:** true (all strict checks enabled)
- **noImplicitAny:** Implicit any types forbidden
- **strictNullChecks:** Null safety enforced
- **strictFunctionTypes:** Function type variance checked
- **strictBindCallApply:** Bind/call/apply type checking
- **forceConsistentCasingInFileNames:** Case-sensitive imports
- **noUnusedVariables:** Unused variables forbidden (Biome rule)

**Result:**
- Compile-time type safety throughout
- No untyped functions
- All edge cases handled explicitly
- IDE autocomplete support

### Error Handling Patterns

**Explicit Error Types:**

```typescript
// Validation errors
if (!contract.abi) {
  throw new Error('Contract ABI is required');
}

// Gas estimation failures
if (errorMessage.includes('block range is too wide')) {
  throw new Error(`Block range too wide. Current chunk size: ${chunkSize}...`);
}

// Connection errors
if (!response.ok) {
  throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
}
```

**Error Propagation:**
- Errors bubble up to caller
- Context added at each level
- No silent failures
- Clear error messages

**Async Error Handling:**
```typescript
try {
  response = await this.proxied.roundTrip(request);
} catch (err) {
  if (this.logf) {
    this.logf('Request failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  throw err;
}
```

### Code Documentation

**JSDoc Comments:**
Every public class, function, and interface has comprehensive JSDoc:

```typescript
/**
 * Creates a new PrivateKeySigner instance.
 *
 * @param privateKey - The private key as a hex string (must include 0x prefix)
 * @param chainId - The chain ID used for transaction signing
 * @throws Error if the private key is invalid
 *
 * @example
 * ```typescript
 * const signer = new PrivateKeySigner(
 *   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
 *   1 // mainnet
 * );
 * ```
 */
constructor(privateKey: Hex, chainId: number);
```

**Documentation Coverage:**
- All public methods documented
- Parameters and return types specified
- Throws documentation
- Usage examples for complex APIs
- Remarks section for important notes

**Code Comments:**
- Inline comments for complex logic
- Section headers for grouping related code
- Rationale for design decisions
- Performance considerations noted

### Code Organization

**File Structure:**
- One primary export per file
- Related types in dedicated type files
- Implementation separate from interfaces
- Clear naming: `types.ts`, `index.ts`, `signer.ts`, etc.

**Module Organization:**
```
auth/
├── types.ts           # Interfaces only
├── index.ts           # Exports
├── privatekey/
│   ├── types.ts       # PrivateKeySignerConfig
│   ├── signer.ts      # PrivateKeySigner implementation
│   └── index.ts       # Exports
└── clef/
    ├── types.ts       # ClefSignerConfig, ClefSignTransactionResponse
    ├── signer.ts      # ClefSigner implementation
    └── index.ts       # Exports
```

### Linting Configuration

**File: biome.json**

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" },
      "suspicious": { "noExplicitAny": "error" },
      "style": { "useConst": "error" }
    }
  },
  "formatter": {
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all"
    }
  }
}
```

**Enforced Rules:**
- No any types
- No unused variables
- const over let
- Single quotes
- Trailing commas
- Tab indentation
- Max line width: 100 chars

### Testing

**Test Runner:** Vitest (Vite-based, fast)

**Test Structure:**
```
test/
├── integration/
│   ├── client.integration.test.ts       # RadiusClient tests
│   ├── signer.integration.test.ts       # Signer tests
│   └── erc20.integration.test.ts        # ERC-20 tests
└── unit/
    └── react-hooks.test.tsx             # React hook tests
```

**Test Configuration:**
- RADIUS_ENDPOINT env var for RPC
- RADIUS_PRIVATE_KEY env var for signing tests
- Tests skip gracefully when env vars missing
- Integration tests run against real testnet

**Example Test:**
```typescript
describe('RadiusClient Integration Tests', () => {
  let client: RadiusClient;
  let signer: RadiusSigner | undefined;

  beforeAll(() => {
    client = createRadiusClient({ chain: testChain });
    if (hasPrivateKey && RADIUS_PRIVATE_KEY) {
      signer = createPrivateKeySigner(RADIUS_PRIVATE_KEY, testChain.id);
    }
  });

  it('should get the chain ID', async () => {
    const chainId = await client.getChainId();
    expect(chainId).toBe(BigInt(testChain.id));
  });
});
```

---

## 10. Additional Features

### Transport Interception

**File: src/transport/interceptor.ts**

```typescript
interface InterceptingTransportOptions {
  url: string;
  interceptor?: Interceptor;
  logger?: Logf;
}

export type Interceptor = (
  reqBody: string,
  response: Response
) => Promise<Response>;

export type Logf = (label: string, data: unknown) => void;

function createInterceptingTransport(
  options: InterceptingTransportOptions
): Transport;
```

**Usage:**
```typescript
const transport = createInterceptingTransport({
  url: 'https://rpc.testnet.radiustech.xyz',
  logger: (label, data) => console.log(label, JSON.stringify(data, null, 2)),
  interceptor: async (reqBody, response) => {
    const body = await response.clone().json();
    if (body.error) {
      console.error('RPC Error:', body.error);
    }
    return response;
  },
});
```

### Event/Log Querying

**File: src/events/getLogs.ts**

Provides pagination helpers for Radius's block range restrictions:

```typescript
export async function getLogs(
  client: PublicClient,
  params: GetLogsParams
): Promise<Log[]>;

export async function getLogsAdaptive(
  client: PublicClient,
  params: GetLogsAdaptiveParams
): Promise<Log[]>;

// Watch functions for real-time events
export function watchLogs(client, params, callback);
export function watchTransfer(client, params, callback);
export function watchApproval(client, params, callback);
export function watchBlock(client, callback);
```

**Why Needed:**
- Radius restricts eth_getLogs to narrow block ranges
- SDK automatically chunks large queries
- Adaptive sizing adjusts chunk size on errors
- Progress callbacks for long operations

**Usage:**
```typescript
const logs = await getLogs(client, {
  address: tokenAddress,
  fromBlock: 1000000n,
  toBlock: 1010000n,
  chunkSize: 1000,
  onProgress: ({ currentBlock, logsFetched }) => {
    console.log(`${currentBlock} (${logsFetched} logs)`);
  },
});
```

### React Integration

**Components:**
- `RadiusProvider` - Sets up Wagmi, React Query, Radius context
- `RadiusContextProvider` - Provides chain and client context

**Hooks:**
- `useRadiusContext()` - Access chain and client
- `useRadiusBalance(address)` - Get native token balance
- `useRadiusSend(signer)` - Send transactions
- `useERC20Balance(token, owner)` - Get token balance
- `useERC20Approve(token)` - Approve tokens
- `useERC20Transfer(token)` - Transfer tokens
- `useERC20Allowance(token, owner, spender)` - Get allowance
- `useERC20Metadata(token)` - Get token info

**React Example:**
```typescript
import { RadiusProvider, useRadiusBalance } from '@radiustechsystems/sdk/react';

function App() {
  return (
    <RadiusProvider chain={radiusTestnet}>
      <BalanceDisplay />
    </RadiusProvider>
  );
}

function BalanceDisplay() {
  const { data: balance } = useRadiusBalance(userAddress);
  return <div>Balance: {balance?.toString()}</div>;
}
```

### Wagmi Integration

**Custom Connector:**
```typescript
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';

const config = createConfig({
  chains: [radiusTestnet],
  connectors: [
    privateKeyConnector({
      generateOnConnect: true, // Dev only
    }),
  ],
  transports: { [radiusTestnet.id]: http() },
});
```

---

## Summary Table: API Overview

| Category | Component | Type | File |
|----------|-----------|------|------|
| **Core** | RadiusClient | Interface | client.ts |
| | createRadiusClient | Function | client.ts |
| | MAX_GAS | Constant | client.ts |
| **Signers** | PrivateKeySigner | Class | auth/privatekey/signer.ts |
| | ClefSigner | Class | auth/clef/signer.ts |
| | RadiusSigner | Interface | auth/types.ts |
| **Chains** | radiusTestnet | Object | chains/radius.ts |
| | radiusMainnet | Object | chains/radius.ts |
| **Accounts** | Account | Class | accounts/account.ts |
| | Address | Class | common/address.ts |
| | Transaction | Class | common/transaction.ts |
| | Receipt | Class | common/receipt.ts |
| **Contracts** | Contract | Class | contracts/contract.ts |
| | ERC20 | Class | contracts/erc20.ts |
| | ERC20_ABI | Constant | contracts/erc20.ts |
| **Crypto** | keccak256 | Function | crypto/utils.ts |
| | sign | Function | crypto/utils.ts |
| | hexToSigningKey | Function | crypto/utils.ts |
| | pubkeyToAddress | Function | crypto/utils.ts |
| **Transport** | createInterceptingTransport | Function | transport/interceptor.ts |
| **Events** | getLogs | Function | events/getLogs.ts |
| | getLogsAdaptive | Function | events/getLogs.ts |
| | watchLogs | Function | events/watchLogs.ts |
| | watchBlock | Function | events/watchBlock.ts |
| **React** | RadiusProvider | Component | react/provider.tsx |
| | useRadiusBalance | Hook | react/hooks/useRadiusBalance.ts |
| | useRadiusSend | Hook | react/hooks/useRadiusSend.ts |
| | useERC20Transfer | Hook | react/hooks/useERC20.ts |
| **Wagmi** | privateKeyConnector | Function | wagmi/connector.ts |

---

## Recommendations & Observations

### Strengths

1. **Clean API Design** - Consistent naming, clear patterns, minimal boilerplate
2. **Type Safety** - Strict TypeScript configuration, branded types prevent errors
3. **Documentation** - Comprehensive JSDoc, examples in comments, clear error messages
4. **viem Foundation** - Modern, lightweight, future-proof architecture
5. **Modular Architecture** - Clear separation of concerns, tree-shakeable exports
6. **Error Handling** - Explicit error messages with context
7. **React Integration** - Hooks and providers follow current best practices
8. **Test Coverage** - Integration tests against real testnet

### Areas for Enhancement

1. **Error Types** - Consider custom error classes instead of generic Error
2. **Batch Operations** - Could benefit from batch send/call utilities
3. **Estimated Gas Caching** - Gas estimates could be cached to reduce RPC calls
4. **Event Decoding** - Built-in helpers for parsing event logs
5. **Retry Logic** - Automatic retry with exponential backoff for RPC errors
6. **Rate Limiting** - Throttling helpers for high-volume requests
7. **Example Applications** - More comprehensive example projects
8. **Migration Guides** - If this is a major version bump, migration docs from v1

### Production Readiness

- **Security:** Good - Uses established libraries, no cryptographic implementation
- **Performance:** Good - No obvious bottlenecks, efficient gas estimation
- **Reliability:** Good - Error handling is explicit, test coverage present
- **Scalability:** Good - Pagination for events, efficient transport

---

## Files Analyzed

**Total Source Files:** 49 TypeScript files

**Key Files:**
- `/Users/fox/Getting Started/radius-sdk/typescript/src/index.ts` - Main exports
- `/Users/fox/Getting Started/radius-sdk/typescript/src/client/client.ts` - Core client
- `/Users/fox/Getting Started/radius-sdk/typescript/src/auth/types.ts` - Signer interface
- `/Users/fox/Getting Started/radius-sdk/typescript/src/auth/privatekey/signer.ts` - Private key signer
- `/Users/fox/Getting Started/radius-sdk/typescript/src/auth/clef/signer.ts` - Clef signer
- `/Users/fox/Getting Started/radius-sdk/typescript/src/chains/radius.ts` - Chain configs
- `/Users/fox/Getting Started/radius-sdk/typescript/src/contracts/erc20.ts` - ERC-20 support
- `/Users/fox/Getting Started/radius-sdk/typescript/src/contracts/contract.ts` - Generic contracts
- `/Users/fox/Getting Started/radius-sdk/typescript/src/common/address.ts` - Address type
- `/Users/fox/Getting Started/radius-sdk/typescript/src/common/transaction.ts` - Transaction types
- `/Users/fox/Getting Started/radius-sdk/typescript/src/crypto/utils.ts` - Crypto utilities
- `/Users/fox/Getting Started/radius-sdk/typescript/src/events/getLogs.ts` - Log pagination
- `/Users/fox/Getting Started/radius-sdk/typescript/src/transport/interceptor.ts` - Custom transport
- `/Users/fox/Getting Started/radius-sdk/typescript/src/react/provider.tsx` - React provider
- `/Users/fox/Getting Started/radius-sdk/typescript/src/wagmi/connector.ts` - Wagmi integration
- `/Users/fox/Getting Started/radius-sdk/typescript/package.json` - Dependencies
- `/Users/fox/Getting Started/radius-sdk/typescript/tsconfig.json` - TypeScript config
- `/Users/fox/Getting Started/radius-sdk/typescript/biome.json` - Code quality config
- `/Users/fox/Getting Started/radius-sdk/typescript/test/integration/client.integration.test.ts` - Integration tests

---

**Audit Complete**
