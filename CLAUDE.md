# Claude Instructions: Radius SDK Development

## Current Priority: Developer Feedback

**Read `HANDOFF.md` first.** It contains prioritized feedback from a developer evaluation of the TypeScript SDK V2-alpha.

The evaluation project with full reports and working examples is at:
```
/Users/fox/Getting Started/radius-first-contact
```

---

## Project Structure

```
radius-sdk/
├── typescript/     ← V2-alpha SDK (primary focus of feedback)
├── go/             ← Go SDK
├── python/         ← Python SDK
├── rust/           ← Rust SDK
└── contracts/      ← Shared contract ABIs
```

---

## TypeScript SDK Location

```
/Users/fox/Getting Started/radius-sdk/typescript
```

Key files for addressing feedback:
- `src/client/client.ts` — Main client, error handling, API methods
- `src/react/hooks/` — React hooks
- `src/server/` — Server handlers (WebAuthn)
- `src/wagmi/` — Wagmi connector
- `package.json` — Exports configuration

---

## Action Items from Evaluation

### Priority 0 (Must Fix)
1. **P0-1:** Add helpful error messages with suggestions
   - Location: `typescript/src/client/client.ts`
   - Issue: Errors say "Invalid params" with no context

2. **P0-2:** Match viem API or document differences
   - Location: `typescript/src/client/client.ts` (getBalance, getCode, getNonce)
   - Issue: Takes address directly vs viem's `{ address }` object

### Priority 1 (Should Fix)
3. **P1-1:** Add typed contract helper for autocomplete
4. **P1-2:** Add event decoding utility
5. **P1-3:** Rename/clarify server module (it's WebAuthn, not general server)
6. **P1-4:** Add CJS export for server module

### Priority 2 (Nice to Have)
7. **P2-1:** Use multicall in useERC20Metadata
8. **P2-2:** Add generic useContract hook
9. **P2-3:** Fix Handler.compose() routing bug
10. **P2-4:** Clean up peer dependency warnings

---

## Developer Expectations

The evaluator is experienced with:
- **viem** — Expects matching API patterns
- **wagmi** — Expects standard hook patterns
- **Tempo SDK** — Your code references this; match its error message quality

Key expectation: **Don't surprise viem developers.** If you deviate from viem patterns, document it loudly or support both syntaxes.

---

## Reference Materials

### Evaluation Reports
| Report | Location |
|--------|----------|
| Final summary | `/Users/fox/Getting Started/radius-first-contact/REPORT.md` |
| All phase reports | `/Users/fox/Getting Started/radius-first-contact/reports/` |

### Working Examples
| Script | Shows |
|--------|-------|
| `01-connect.ts` | Basic client usage |
| `02-send.ts` | Transaction flow |
| `03-deploy.ts` | Contract deployment |
| `04-deploy-erc20.ts` | ERC-20 deployment |
| `05-transfer-erc20.ts` | Token transfers |
| `06-server.ts` | Server handlers |

Path: `/Users/fox/Getting Started/radius-first-contact/src/`

---

## When Working on This SDK

1. **Read HANDOFF.md** for full context on each issue
2. **Check the example scripts** to see how developers use the SDK
3. **Read phase reports** for detailed DX feedback per feature
4. **Match viem patterns** unless there's a strong reason not to
5. **Test changes** against the evaluation project's scripts

---

## Build & Test

```bash
cd typescript
pnpm install
pnpm build
pnpm test
pnpm check:types
```

To test against the evaluation project:
```bash
cd /Users/fox/Getting\ Started/radius-first-contact
npx tsx src/01-connect.ts  # etc.
```
