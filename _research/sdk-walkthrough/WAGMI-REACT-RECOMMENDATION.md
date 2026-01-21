# React/WAGMI Recommendation for Radius SDK

**Date:** 2026-01-19
**Research:** Based on analysis of viem, Base, Optimism, and Polygon ecosystems

---

## Executive Summary

**Recommendation: Remove React/WAGMI from the Radius SDK.**

The industry consensus for viem-first SDKs is clear separation:
- **Core SDK** = Framework-agnostic (TypeScript + viem)
- **React** = Use WAGMI directly with Radius chain config

---

## Industry Analysis

### How Other Chains Structure Their SDKs

| Chain | Core SDK | React Integration |
|-------|----------|-------------------|
| **Viem** | Framework-agnostic TypeScript | WAGMI is separate project |
| **Base (Coinbase)** | `@coinbase/cdp-core` | `@coinbase/cdp-wagmi` (separate) |
| **Optimism** | Deprecated bundled SDK → migrated to `viem/op-stack` | None (use WAGMI directly) |
| **Polygon** | No custom SDK | Use WAGMI with Polygon chain config |

### Key Patterns

1. **Viem is the foundation** - Low-level, stateless, tree-shakable
2. **WAGMI wraps viem for React** - It's designed to do this
3. **Chains don't bundle React** - They provide chain configs that WAGMI consumes
4. **Optimism migrated away** from bundled SDK to viem-native approach

---

## What Radius Should Do

### Current Structure (Problematic)

```
@radiustechsystems/sdk
├── /chains      ← Good (framework-agnostic)
├── /client      ← Good (framework-agnostic)
├── /events      ← Good (framework-agnostic)
├── /webauthn    ← Questionable (should be separate or removed)
├── /react       ← Remove (use WAGMI directly)
└── /wagmi       ← Remove (use WAGMI directly)
```

### Recommended Structure

```
@radiustechsystems/sdk
├── /chains      ← Keep (viem chain definitions)
├── /client      ← Keep (RadiusClient for batch tx, conveniences)
├── /events      ← Keep (block range handling)
├── /transport   ← Keep (interceptors/logging)
└── /errors      ← Keep (rich error types)
```

### For React Developers

Instead of custom React hooks, developers use WAGMI directly:

```typescript
import { createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const config = createConfig({
  chains: [radiusTestnet],
  transports: {
    [radiusTestnet.id]: http(),
  },
});

// Then use standard WAGMI hooks
const { data: balance } = useBalance({ address });
const { sendTransaction } = useSendTransaction();
```

---

## Why This Is Better

### 1. Smaller Bundle Size

React hooks are duplicated functionality. WAGMI already provides:
- `useBalance()` - replaces `useRadiusBalance()`
- `useSendTransaction()` - replaces `useRadiusSend()`
- `useReadContract()` - replaces custom ERC20 hooks

### 2. Better Maintenance

- WAGMI is actively maintained by wevm team
- Radius doesn't need to track WAGMI updates
- Fewer dependencies, fewer breaking changes

### 3. Ecosystem Compatibility

Developers already know WAGMI. Custom hooks create:
- Learning curve
- Confusion about which to use
- Potential behavior differences

### 4. Industry Standard

Every major chain has converged on this pattern:
- Optimism **deprecated** their bundled SDK
- Base **separates** core from React
- Polygon **doesn't provide** React wrappers

---

## Migration Path

### For Existing Users

```diff
- import { useRadiusBalance } from '@radiustechsystems/sdk/react';
+ import { useBalance } from 'wagmi';
+ import { radiusTestnet } from '@radiustechsystems/sdk/chains';

- const { balance } = useRadiusBalance({ address });
+ const { data: balance } = useBalance({ address, chainId: radiusTestnet.id });
```

### Documentation Update

Update quick-start guide to show WAGMI integration:

```typescript
// 1. Install packages
pnpm add @radiustechsystems/sdk viem wagmi @tanstack/react-query

// 2. Configure WAGMI
import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const config = createConfig({
  chains: [radiusTestnet],
  transports: { [radiusTestnet.id]: http() },
});

// 3. Wrap your app
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// 4. Use hooks
function Balance() {
  const { data } = useBalance({ address: '0x...' });
  return <div>{data?.formatted} USD</div>;
}
```

---

## Open Question: Batch Transactions in React

One concern: WAGMI's `useSendTransaction` doesn't handle Radius's no-mempool behavior.

**Options:**

1. **Document the limitation** - "For multiple transactions, use RadiusClient directly"

2. **Create a single hook** - `useBatchTransaction` that wraps `sendTransactionBatch`

3. **Trust WAGMI** - Each `useSendTransaction` call is independent, may work if called sequentially

**Recommendation:** Document the limitation. Users needing batch transactions can import RadiusClient directly. This is an edge case.

---

## Files to Remove

If this recommendation is accepted:

```
typescript/src/react/           ← Delete entire directory
typescript/src/wagmi/           ← Delete entire directory
```

Also update:
- `package.json` - remove React/WAGMI peer dependencies
- `tsconfig.json` - remove JSX config if not needed
- Documentation - update to show WAGMI integration

---

## Conclusion

The Radius SDK should focus on what viem doesn't provide:
- Chain definitions
- Batch transaction handling (due to no mempool)
- Block range chunking for logs
- Transport interceptors

React integration should be handled by WAGMI, not custom hooks. This is the industry standard and reduces maintenance burden.
