# Radius V2 SDK - Architecture Explainer

## Overview

The Radius V2 SDK is a TypeScript library built on top of [viem](https://viem.sh) for interacting with the Radius Network - an EVM-compatible blockchain. The SDK is modeled after [Tempo.ts](https://github.com/tempo-ts) (the official Tempo SDK) and integrates with [WAGMI](https://wagmi.sh) for React dApp development.

**Key Characteristics:**
- ESM-only (no CommonJS)
- Node.js >= 22 required
- viem >= 2.0.0 as core dependency
- Optional React/WAGMI integration

---

## Audit Summary

### What the SDK Does

1. **Chain Configuration**: Defines Radius mainnet (ID: 723) and testnet (ID: 1223953) chains with proper viem `defineChain()` format
2. **Client Interface**: Provides `RadiusClient` - a high-level wrapper around viem's `PublicClient` with convenience methods
3. **Transaction Management**: Handles signing, gas estimation (with 20% safety margin), batch transactions, and receipt management
4. **Contract Interactions**: Typed contract helper with read/write namespaces
5. **Event Subscriptions**: WebSocket-based real-time event watching and historical log queries
6. **React Hooks**: Wagmi-compatible hooks for balance, ERC-20 operations, and transactions
7. **WebAuthn Server**: Credential storage and challenge management for passkey authentication
8. **WAGMI Connector**: Development-only private key connector for testing

---

## Comparison Against Standards (Viem/Tempo/WAGMI)

### What Follows Standards ✅

| Pattern | Standard | Radius Implementation |
|---------|----------|----------------------|
| Chain definitions | `defineChain()` from viem | ✅ Correct - uses `defineChain` with proper structure |
| Subpath exports | Modular exports pattern | ✅ Good - `./chains`, `./react`, `./events`, `./wagmi`, `./webauthn` |
| WebAuthn Handler | Tempo.ts `Handler.keyManager()` | ✅ Nearly identical API - `Handler.keyManager()`, `Handler.compose()`, `Handler.from()` |
| KV Store abstraction | Tempo.ts `Kv.memory()`, `Kv.cloudflare()` | ✅ Same pattern |
| Error hierarchy | viem's error patterns | ✅ Rich error hierarchy with `.walk()`, `shortMessage`, `details` |
| TypeScript strictness | ESM + strict mode | ✅ Correct |
| Build output | `_esm/` and `_types/` separation | ✅ Standard pattern |
| Package exports | Conditional exports in package.json | ✅ Proper `types`, `import`, `default` conditions |

### What Is Wrong ❌

#### 1. **Client Pattern Diverges from Viem/WAGMI**

**Problem**: The SDK creates a custom `RadiusClient` interface instead of extending viem's client or using WAGMI's action pattern.

```typescript
// WAGMI pattern (standard):
const balance = await getBalance(config, { address });

// Radius pattern (non-standard):
const balance = await client.getBalance({ address });
```

**Impact**: Users familiar with viem/WAGMI must learn a new API. The SDK cannot easily leverage viem's ecosystem of extensions.

**Recommendation**: Either:
- Expose the underlying `publicClient` more prominently and encourage its use
- Implement viem's action pattern where each action is a standalone function

#### 2. **Hardcoded `gasPrice: 0n`**

**Location**: `client/client.ts:678`

```typescript
gasPrice: 0n, // Radius uses zero gas price
```

**Problem**: Zero gas price is hardcoded. If Radius ever implements non-zero gas fees (like most EVM chains), this will break silently.

**Recommendation**: Either:
- Fetch gas price from the network via `eth_gasPrice`
- Make this configurable via chain config or client options
- At minimum, add a comment explaining this is intentional for Radius

#### 3. **No `viem` Runtime Dependency**

**Location**: `package.json:41`

```json
"devDependencies": {
  "viem": "^2.43.3",
```

**Problem**: `viem` is in `devDependencies` but the code imports from it at runtime. This means users MUST install viem separately, but the error message won't be clear.

**Recommendation**: Move `viem` to `dependencies` or clearly document it as a required peer dependency.

#### 4. **Native Currency Named "USD"**

**Location**: `chains/radius.ts:22-25`

```typescript
nativeCurrency: {
  decimals: 18,
  name: 'USD',
  symbol: 'USD',
},
```

**Problem**: "USD" as a native currency name is confusing. It suggests the chain uses US dollars, but it's actually a crypto token with 18 decimals (like ETH). No stablecoin has 18 decimals - they typically have 6 (USDC) or 18 (DAI).

**Impact**: Users may be confused about the actual value semantics.

#### 5. **Batch Transaction Uses Direct `fetch()`**

**Location**: `client/client.ts:980-984`

```typescript
const response = await fetch(rpcUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(batchRequest),
});
```

**Problem**: This bypasses viem's transport layer, which means:
- Interceptors won't work for batch transactions
- Logger won't capture batch requests
- Custom transports are ignored

**Recommendation**: Either use viem's batch capabilities or ensure the intercepting transport is used.

#### 6. **React Hooks Are Wagmi Wrappers, Not Independent**

**Location**: `react/hooks/*.ts`

The React hooks wrap WAGMI hooks but don't work without a full WAGMI setup:

```typescript
export function useRadiusSend(): UseRadiusSendReturn {
  const { data: hash, error, isPending, sendTransaction } = useSendTransaction();
  // ...
}
```

**Problem**: Users must set up the full WAGMI config even if they just want to use the "Radius SDK React hooks". This creates a confusing layering where:
- `@radiustechsystems/sdk` provides a standalone client
- `@radiustechsystems/sdk/react` requires WAGMI (not the Radius client)

**Recommendation**: Either:
- Create hooks that work with `RadiusClient` directly
- Clearly document that React hooks are WAGMI extensions, not SDK extensions

#### 7. **Missing `http` Transport Export**

Users need to import `http` from viem separately:

```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { http } from 'viem'; // Must import separately
```

**Recommendation**: Re-export `http` from the main entry point like other viem utilities are re-exported.

### What Is Weird 🤔

#### 1. **`MAX_GAS` Constant Is Suspiciously Specific**

**Location**: `client/client.ts:157`

```typescript
export const MAX_GAS = 1319413953330n;
```

This number (1.3 trillion gas) is oddly specific. For reference:
- Ethereum block gas limit: ~30M
- This is 44,000x larger

**Questions**:
- Where does this number come from?
- Is this a Radius-specific limit?
- Why not use a round number?

#### 2. **WebAuthn Module Named `webauthn` but Documented as `server`**

**Location**: `webauthn/Handler.ts:109`

```typescript
* import { Handler, Kv } from '@radiustechsystems/sdk/server';
```

But the actual export is:
```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';
```

**Inconsistency**: Documentation says `/server`, actual path is `/webauthn`.

#### 3. **Transport Has Go-Inspired Naming**

**Location**: `transport/types.ts`

```typescript
export type RoundTripper = ...
export type Logf = ...
```

`RoundTripper` is a Go pattern (`http.RoundTripper`). `Logf` is from Go's `log.Printf`. These are unusual in TypeScript where we'd typically say `HttpClient` or `Logger`.

#### 4. **Both `call/execute` AND `readContract/writeContract` Methods**

The client exposes both patterns:

```typescript
// Old-school pattern
await client.call(contract, 'balanceOf', address);
await client.execute(contract, signer, 'transfer', to, amount);

// Viem-compatible pattern
await client.readContract({ address, abi, functionName: 'balanceOf', args: [address] });
await client.writeContract({ address, abi, functionName: 'transfer', args: [to, amount], account });
```

**Confusion**: Two ways to do the same thing with different signatures.

#### 5. **WebAuthn Handler More Thorough Than Tempo**

The Radius WebAuthn handler has additional validation that Tempo doesn't:
- Credential ID format validation: `/^[a-zA-Z0-9_-]{1,255}$/`
- JSON parsing error handling
- Challenge TTL configuration
- Explicit challenge expiration checking

This is actually *better* than Tempo, but creates API surface differences.

#### 6. **Chain ID Hardcoded in Multiple Places**

Testnet chain ID appears as both:
- Decimal: `1223953`
- Hex comment: `0x12ad11`

If these ever diverge, bugs will be subtle.

---

## Directory Structure Explained

### `/typescript/src/`

```
src/
├── index.ts              # Main entry point
├── chains/               # Chain configurations
├── client/               # RadiusClient implementation
├── contracts/            # Typed contract helper
├── errors/               # Error class hierarchy
├── events/               # Event subscriptions & log queries
├── react/                # React hooks & providers
├── transport/            # HTTP/WebSocket transport layer
├── wagmi/                # WAGMI connector
├── webauthn/             # Server-side WebAuthn handling
├── _esm/                 # [Generated] ES Module build output
└── _types/               # [Generated] TypeScript declarations
```

---

### `chains/`

**Purpose**: Define Radius network configurations in viem's chain format.

**Files**:
- `radius.ts` - Mainnet (Chain ID: 723)
- `radiusTestnet.ts` - Testnet (Chain ID: 1223953)
- `index.ts` - Re-exports both chains

**Key Details**:
- Uses viem's `defineChain()` for proper typing
- Includes RPC URLs, block explorer URLs, native currency config
- Marked with `/*#__PURE__*/` for tree-shaking

**Usage**:
```typescript
import { radius, radiusTestnet } from '@radiustechsystems/sdk/chains';
```

---

### `client/`

**Purpose**: Primary SDK interface for blockchain interactions.

**Files**:
- `client.ts` - `RadiusClient` implementation and `createRadiusClient()` factory
- `index.ts` - Re-exports client types and factory

**Key Features**:
- Wraps viem's `PublicClient`
- Automatic gas estimation with 20% safety margin
- Transaction signing and submission
- Batch transaction support (JSON-RPC batching)
- Contract deployment
- `extend()` method for custom extensions

**Key Types**:
- `RadiusClient` - Main client interface
- `RadiusClientConfig` - Configuration options
- `RadiusReceipt` - Transaction receipt format
- `ContractInstance` - Contract with ABI and address

**Usage**:
```typescript
import { createRadiusClient, privateKeyToAccount } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
const balance = await client.getBalance({ address: '0x...' });
```

---

### `contracts/`

**Purpose**: Typed contract helper with autocomplete support.

**Files**:
- `typedContract.ts` - `getContract()` helper and `TypedContract` type
- `index.ts` - Re-exports

**Key Features**:
- Type-safe contract method calls
- `read` and `write` namespaces
- Autocomplete for function names based on ABI
- Integration with RadiusClient

**Usage**:
```typescript
const token = client.getContract({
  address: '0x...',
  abi: erc20Abi,
});

const balance = await token.read.balanceOf(['0x...']);
await token.write.transfer({ args: ['0x...', 1000n], signer });
```

---

### `errors/`

**Purpose**: Structured error hierarchy for better debugging.

**Files**:
- `base.ts` - `RadiusError` base class
- `account.ts` - Account-related errors (balance, signing)
- `contract.ts` - Contract errors (ABI, deployment)
- `transaction.ts` - Transaction errors (failed, reverted, timeout)
- `index.ts` - Re-exports and error type unions

**Key Features**:
- All errors extend `RadiusError`
- `.walk()` method for cause chain traversal
- `shortMessage` for quick understanding
- `details` for debugging information
- Error type unions for TypeScript narrowing

**Error Classes**:
- `InsufficientBalanceError` - Not enough funds
- `TransactionFailedError` - Transaction failed
- `TransactionRevertedError` - Contract reverted
- `BatchTransactionError` - Partial batch failure
- `ContractCallError` - Contract call failed
- `AbiError` - ABI encoding/decoding failed

---

### `events/`

**Purpose**: Real-time event subscriptions and historical log queries.

**Files**:
- `watchBlock.ts` - Block number, blocks, pending transactions
- `watchTransfer.ts` - ERC-20 Transfer events
- `watchApproval.ts` - ERC-20 Approval events
- `watchLogs.ts` - Generic log watching
- `getLogs.ts` - Historical log queries with adaptive chunking
- `decodeEventLogs.ts` - Event log decoding utilities
- `index.ts` - Re-exports

**Key Features**:
- WebSocket-based subscriptions
- Polling fallback for HTTP
- Adaptive block range chunking for large queries
- ERC-20 specific event helpers

**Usage**:
```typescript
import { watchTransfer, getLogs } from '@radiustechsystems/sdk/events';

// Real-time watching
const unwatch = watchTransfer(client, {
  token: '0x...',
  onTransfer: (event) => console.log(event),
});

// Historical query
const logs = await getLogs(client, {
  address: '0x...',
  event: transferEvent,
  fromBlock: 0n,
  toBlock: 'latest',
});
```

---

### `react/`

**Purpose**: React hooks and context providers for dApp development.

**Files**:
- `context.tsx` - `RadiusContextProvider` and `useRadiusContext()`
- `provider.tsx` - `RadiusProvider` wrapper
- `hooks/useRadiusBalance.ts` - Native balance hook
- `hooks/useRadiusSend.ts` - Transaction sending hook
- `hooks/useERC20.ts` - ERC-20 operations hooks
- `index.ts` - Re-exports

**Key Features**:
- Built on WAGMI hooks
- React Query integration
- Loading/error states
- Refetch controls

**Hooks**:
- `useRadiusBalance()` - Get native token balance
- `useRadiusSend()` - Send transactions
- `useERC20Balance()` - Token balance
- `useERC20Transfer()` - Token transfers
- `useERC20Approve()` - Token approvals
- `useERC20Allowance()` - Check allowance
- `useERC20Metadata()` - Token decimals, symbol, name

**Usage**:
```typescript
import { useRadiusBalance, useRadiusSend } from '@radiustechsystems/sdk/react';

function MyComponent() {
  const { balance, isLoading } = useRadiusBalance({ address: '0x...' });
  const { send, isPending } = useRadiusSend();

  return <button onClick={() => send({ to: '0x...', value: 1n })}>Send</button>;
}
```

---

### `transport/`

**Purpose**: HTTP/WebSocket transport layer with interceptor support.

**Files**:
- `interceptor.ts` - `createInterceptingTransport()` for HTTP
- `websocket.ts` - `createWebSocketTransport()` for subscriptions
- `types.ts` - Type definitions (`Interceptor`, `Logf`, `RoundTripper`)
- `index.ts` - Re-exports

**Key Features**:
- Request/response interception
- Logging middleware
- Custom transport factory
- WebSocket reconnection handling

**Usage**:
```typescript
import { createInterceptingTransport } from '@radiustechsystems/sdk';

const transport = createInterceptingTransport({
  url: 'https://rpc.radiustech.xyz',
  logger: console.log,
  interceptor: async (request, response) => {
    // Modify or log responses
    return response;
  },
});
```

---

### `wagmi/`

**Purpose**: WAGMI v3 integration for React dApps.

**Files**:
- `connector.ts` - `privateKeyConnector()` for development
- `index.ts` - Re-exports

**Key Features**:
- Development-only private key connector
- Storage-based key persistence
- Auto key generation option

**Warning**: This connector is for development only. It stores private keys in browser storage and should never be used in production.

**Usage**:
```typescript
import { createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';

const config = createConfig({
  chains: [radiusTestnet],
  connectors: [privateKeyConnector({ generateOnConnect: true })],
  transports: { [radiusTestnet.id]: http() },
});
```

---

### `webauthn/`

**Purpose**: Server-side WebAuthn credential management for passkey authentication.

**Files**:
- `Handler.ts` - Request handlers (`keyManager()`, `compose()`, `from()`)
- `Kv.ts` - Key-value store abstractions (`memory()`, `cloudflare()`)
- `errors.ts` - WebAuthn-specific errors
- `types.ts` - Type definitions
- `internal/requestListener.ts` - Node.js adapter

**Key Features**:
- Challenge generation and verification
- Public key storage and retrieval
- Relying party configuration
- Works with Node.js, Bun, Deno, Cloudflare Workers

**Endpoints Created**:
- `GET /challenge` - Generate WebAuthn challenge
- `GET /:id` - Get public key for credential
- `POST /:id` - Store credential public key

**Usage**:
```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';

const handler = Handler.keyManager({
  kv: Kv.memory(),
  rp: { id: 'example.com', name: 'Example App' },
});

// Express.js
app.use('/api/auth', handler.listener);

// Cloudflare Workers
export default { fetch: handler.fetch };
```

---

### `_esm/` and `_types/` (Generated)

**Purpose**: Build output directories.

- `_esm/` - Compiled ES modules (`.js` files)
- `_types/` - TypeScript declarations (`.d.ts` files)

These are generated by `pnpm build` and should not be edited manually. They mirror the source structure and are what gets published to npm.

---

## Recommendations Summary

### High Priority
1. Move `viem` to `dependencies` or make peer dependency explicit
2. Document the zero gas price behavior
3. Use transport layer for batch transactions
4. Fix documentation to match actual export paths

### Medium Priority
5. Consider adding `http` transport re-export
6. Clarify React hooks require full WAGMI setup
7. Document the `MAX_GAS` constant's origin

### Low Priority
8. Consider removing duplicate `call/execute` vs `readContract/writeContract` APIs
9. Use more TypeScript-idiomatic naming (`Logger` vs `Logf`)
