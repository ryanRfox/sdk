# Claude Instructions: Audit Fix Implementation

## Your Role

You are implementing fixes for code issues identified in the Radius SDK audit. Your goal is to fix each issue while maintaining viem/wagmi pattern compatibility.

**Read `HANDOFF.md` for your task list.**
**Read `AUDIT-REPORT.md` for detailed context on each issue.**

---

## Reference Repositories

These repos are cloned locally for pattern reference:

| Repo | Location | Reference For |
|------|----------|---------------|
| viem | `/tmp/viem` | `BaseError`, `http()` transport, client patterns |
| wagmi | `/tmp/wagmi` | Connector patterns (`onAccountsChanged`, `getChainId`) |
| tempo-ts | `/tmp/tempo-ts` | Chain extension patterns |

**Use these for reference when implementing fixes.** Look at how viem/wagmi does things before implementing.

---

## Fix Order

Work through the HANDOFF.md task list in order. Each fix should:

1. Be minimal - only change what's needed
2. Follow viem/wagmi patterns from reference repos
3. Pass type checking
4. Not break existing tests

---

## Key Patterns to Follow

### viem BaseError Pattern
```typescript
// From /tmp/viem/src/errors/base.ts
export class BaseError extends Error {
  details: string
  docsPath?: string | undefined
  metaMessages?: string[] | undefined
  shortMessage: string
  version: string
  override name = 'BaseError'

  constructor(
    shortMessage: string,
    args: BaseErrorParameters = {},
  ) {
    // ...
  }
}
```

### wagmi Connector onAccountsChanged Pattern
```typescript
// From /tmp/wagmi/packages/connectors/src/metaMask.ts
async onAccountsChanged(accounts) {
  if (accounts.length === 0) this.onDisconnect()
  else if (config.emitter.listenerCount('connect')) {
    const chainId = await this.getChainId()
    this.onConnect({ chainId })
  }
  else config.emitter.emit('change', { accounts: accounts.map(x => getAddress(x)) })
}
```

### viem http() Transport Pattern
```typescript
// From /tmp/viem/src/clients/transports/http.ts
export function http(url, options) {
  return ({ chain, retryCount, timeout }) => {
    return createTransport({
      request: async ({ method, params }) => { ... },
      retryCount,
      retryDelay,
      timeout,
    })
  }
}
```

---

## Commands

```bash
# Build
pnpm build

# Test
pnpm test

# Type check
pnpm check:types

# Run specific test
pnpm test -- --grep "pattern"
```

---

## Important Notes

1. **Don't over-engineer** - Fix only what's broken
2. **Check reference repos first** - See how viem/wagmi does it
3. **Test after each fix** - Run build and tests
4. **Keep commits focused** - One fix per commit ideally

---

## SDK Location

```
/Users/fox/Getting Started/radius-sdk/typescript
```
