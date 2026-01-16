# HANDOFF: SDK Feedback from Developer Evaluation

**From:** Developer Evaluation (First Contact Project)
**To:** Radius SDK Engineering Team
**Date:** January 2026
**SDK Version Tested:** 2.0.0-alpha.1

---

## Context

I evaluated your TypeScript SDK V2-alpha by building real examples against Radius Testnet. I'm an experienced viem/wagmi/TypeScript developer, also familiar with the Tempo SDK patterns your codebase references.

**My evaluation project:** `/Users/fox/Getting Started/radius-first-contact`

I wrote working scripts, deployed contracts, tested all module exports, and documented everything. This handoff tells you what I need fixed to confidently build apps on Radius.

---

## TL;DR

Your SDK **works** — that's the good news. All core operations succeeded. But there's friction that will frustrate developers and slow adoption:

1. **Error messages are useless** — I wasted time debugging because errors don't explain what's wrong
2. **API deviates from viem conventions** — Causes immediate confusion for anyone who knows viem
3. **No type safety for contracts** — I can typo method names and it compiles fine
4. **Server module is confusing** — Name suggests general handlers, it's actually WebAuthn infra

**Overall Score: 3.8/5** — Good foundation, needs polish.

---

## Full Reports & Examples

Read these for complete details:

### Reports (by phase)
| Report | Path |
|--------|------|
| **Final Summary** | `/Users/fox/Getting Started/radius-first-contact/REPORT.md` |
| Setup & Connection | `/Users/fox/Getting Started/radius-first-contact/reports/phase1-setup-connect.md` |
| Send Transaction | `/Users/fox/Getting Started/radius-first-contact/reports/phase2-send-transaction.md` |
| Deploy Contract | `/Users/fox/Getting Started/radius-first-contact/reports/phase3-deploy-contract.md` |
| ERC-20 Token | `/Users/fox/Getting Started/radius-first-contact/reports/phase4-5-erc20.md` |
| React Hooks | `/Users/fox/Getting Started/radius-first-contact/reports/phase6-react-hooks.md` |
| Wagmi Connector | `/Users/fox/Getting Started/radius-first-contact/reports/phase7-wagmi-connector.md` |
| Server Handlers | `/Users/fox/Getting Started/radius-first-contact/reports/phase8-server-handlers.md` |

### Working Examples
| Script | Path |
|--------|------|
| Basic connection | `/Users/fox/Getting Started/radius-first-contact/src/01-connect.ts` |
| Send transaction | `/Users/fox/Getting Started/radius-first-contact/src/02-send.ts` |
| Deploy contract | `/Users/fox/Getting Started/radius-first-contact/src/03-deploy.ts` |
| Deploy ERC-20 | `/Users/fox/Getting Started/radius-first-contact/src/04-deploy-erc20.ts` |
| Transfer ERC-20 | `/Users/fox/Getting Started/radius-first-contact/src/05-transfer-erc20.ts` |
| Server handlers | `/Users/fox/Getting Started/radius-first-contact/src/06-server.ts` |
| React examples | `/Users/fox/Getting Started/radius-first-contact/src/react-examples/` |

---

## Priority 0: Must Fix Before Release

These will cause developers to give up or file angry issues.

### P0-1: Error Messages Are Useless

**The Problem:**
```typescript
// I wrote this (wrong):
const balance = await client.getBalance({ address });

// Error I got:
UnknownRpcError: An unknown RPC error occurred.
Details: Invalid params
```

I had to read your source code to figure out the SDK wants `getBalance(address)` not `getBalance({ address })`. This is unacceptable developer experience.

**What I Expected:**
```
RadiusError: getBalance expects address as first argument, got object.
Hint: Use client.getBalance(address) instead of client.getBalance({ address })
```

**Where to Fix:** `typescript/src/client/client.ts` — wrap methods with parameter validation

**Tempo SDK Comparison:** Tempo has excellent error messages with suggestions. You should match that.

---

### P0-2: API Deviates from Viem Without Reason

**The Problem:**
```typescript
// Radius SDK:
client.getBalance(address)
client.getCode(address)
client.getNonce(address)

// Standard viem:
publicClient.getBalance({ address })
publicClient.getCode({ address })
publicClient.getTransactionCount({ address })
```

Every viem developer will try the object syntax first. They'll get cryptic errors (see P0-1). This is a double-whammy of frustration.

**What I Expected:**
Either match viem exactly, OR document the difference prominently with migration notes.

**Where to Fix:** `typescript/src/client/client.ts` lines 458, 462, 467

**Options:**
1. **Match viem** (recommended): Change to `getBalance({ address })`
2. **Support both**: Accept object or direct address
3. **Document loudly**: Add big warning in README

**Why This Matters:**
Your SDK is "viem-based" per the docs. Developers expect viem patterns. Breaking them without clear reason erodes trust.

---

## Priority 1: Should Fix Before Release

These cause friction but developers can work around them.

### P1-1: No Type Safety for Contract Methods

**The Problem:**
```typescript
// These all compile fine but fail at runtime:
client.call(contract, 'nonExistent');           // Wrong method name
client.call(contract, 'balanceOf');             // Missing argument
client.call(contract, 'balanceOf', 123);        // Wrong argument type
client.call(contract, 'balanceOf', addr, addr); // Too many arguments
```

No autocomplete, no type checking. I have to run the code to find typos.

**What I Expected:**
```typescript
// Typed contract helper:
const token = client.typedContract<typeof ERC20_ABI>(address, abi);
await token.read.balanceOf(address);  // ← Autocomplete works!
await token.write.transfer(to, amount);
```

**Tempo SDK Comparison:** Tempo has typed contract wrappers. Your code references Tempo patterns but didn't implement this.

**Suggested Implementation:**
```typescript
// In client.ts
typedContract<TAbi extends Abi>(address: Address, abi: TAbi) {
  return {
    address,
    abi,
    read: createReadProxy(this, address, abi),
    write: createWriteProxy(this, address, abi),
  };
}
```

---

### P1-2: No Event Decoding Helper

**The Problem:**
```typescript
const receipt = await client.executeAndWait(contract, signer, 'transfer', to, amount);
console.log(receipt.logs);  // Raw logs - what do I do with this?
```

I have to manually import viem's `decodeEventLog` and iterate through logs. Every ERC-20 app needs events.

**What I Expected:**
```typescript
// Option 1: Method on client
const events = client.decodeEvents(contract, receipt);
// [{ name: 'Transfer', args: { from, to, value } }]

// Option 2: Events included in receipt
receipt.events  // Already decoded
```

**Where to Fix:** Add to `typescript/src/client/client.ts` or create `typescript/src/events/decoder.ts`

---

### P1-3: Server Module Name is Misleading

**The Problem:**
```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';
```

I expected: General server utilities for blockchain operations
I got: WebAuthn credential management infrastructure

The module is actually for passkey-based authentication. That's a specific feature, not what "server" implies.

**What I Expected:**
- Name it `/webauthn` or `/passkeys` or `/credentials`
- OR document clearly in the export that this is WebAuthn-specific

**Where to Fix:**
- Rename export path in `package.json`
- Update `typescript/src/server/index.ts` JSDoc

---

### P1-4: ESM-Only Server Export

**The Problem:**
```json
"./server": {
  "types": "./src/_types/server/index.d.ts",
  "import": "./src/_esm/server/index.js"
  // No CJS export!
}
```

My project broke until I added `"type": "module"` to package.json. Many Node.js projects still use CommonJS.

**What I Expected:**
All exports have both ESM and CJS like your other modules.

**Where to Fix:** `package.json` exports, add CJS build for server

---

## Priority 2: Nice to Have

These would make the SDK excellent, not just functional.

### P2-1: useERC20Metadata Makes 4 RPC Calls

**Location:** `typescript/src/react/hooks/useERC20.ts` lines 64-88

```typescript
const name = useReadContract({ functionName: 'name' });
const symbol = useReadContract({ functionName: 'symbol' });
const decimals = useReadContract({ functionName: 'decimals' });
const totalSupply = useReadContract({ functionName: 'totalSupply' });
```

Could use `multicall` for efficiency. Not critical but wasteful.

---

### P2-2: No Generic useContract Hook

React hooks cover `useRadiusSend` and `useERC20*` but not arbitrary contracts. Developers fall back to raw wagmi hooks.

**Suggested:**
```typescript
const { call, execute } = useRadiusContract({ address, abi });
await call('myMethod', arg1, arg2);
```

---

### P2-3: Routing Bug in Handler.compose()

**Location:** `typescript/src/server/Handler.ts` around line 320

When composing handlers, the credential lookup returns plain "Not Found" instead of JSON error. See my test in `/Users/fox/Getting Started/radius-first-contact/src/06-server.ts` line 85-96.

---

### P2-4: Peer Dependency Warnings Are Noisy

When linking locally:
```
WARN: The package has the following peerDependencies:
  - @tanstack/react-query@>=5.0.0
  - react@>=18.0.0
  - wagmi@>=3.0.0
```

These are optional but pnpm warns loudly. Consider `optionalDependencies` or documenting expected warnings.

---

## What Worked Well

Credit where due — these are solid:

### Clean Client API
```typescript
const client = createRadiusClient({ chain: radiusTestnet });
```
Minimal config, smart defaults. Great.

### sendAndWait / executeAndWait Naming
Clear that it waits for receipt. Better than the deprecated `sendSync` name.

### RadiusReceipt Type
```typescript
status: 'success' | 'reverted'  // String union, not number
```
Much better than raw viem's `status: 1 | 0`.

### Zero Gas Cost Handling
`gasPrice: 0n` is set automatically. Developers don't think about gas on Radius. Excellent UX.

### React Hook Consistency
All write hooks return same shape:
```typescript
{ isPending, isConfirming, isConfirmed, hash, receipt, error, reset }
```
Easy to build consistent UI.

### deployContract Returns Both
```typescript
const { address, receipt } = await client.deployContract(...);
```
Don't have to parse receipt for contract address. Nice.

---

## Action Items Summary

### Must Do (P0)
- [ ] Add helpful error messages with suggestions
- [ ] Match viem API conventions OR document differences loudly

### Should Do (P1)
- [ ] Add typed contract helper
- [ ] Add event decoding utility
- [ ] Rename/clarify server module purpose
- [ ] Add CJS export for server

### Consider (P2)
- [ ] Use multicall in useERC20Metadata
- [ ] Add generic useContract hook
- [ ] Fix Handler.compose() routing
- [ ] Clean up peer dependency warnings

---

## Final Words

Your SDK has good bones. The core works, the architecture is sound, and you've clearly studied viem/wagmi/Tempo patterns.

But the devil is in the details. Error messages and API conventions are the first things developers hit. Get those wrong and they'll assume the whole SDK is rough.

Fix P0 issues, address P1 before public release, and you'll have a SDK developers actually want to use.

I'm happy to test again after changes. Good luck.

— Developer Evaluation
