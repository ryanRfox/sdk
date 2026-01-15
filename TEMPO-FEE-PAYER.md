# Tempo Fee Payer Analysis

> **Purpose:** Document why Tempo's `feePayer` handler cannot be ported to Radius
> **Date:** 15 January 2026
> **Decision:** Remove `feePayer` from Radius SDK v2

---

## Summary

Tempo's `feePayer` handler relies on **protocol-level features** that don't exist in standard EVM blockchains. Since Radius is a standard EVM chain, the feePayer functionality cannot work without significant protocol changes.

---

## How Tempo's feePayer Works

### Custom Transaction Format (`0x76`)

Tempo uses a custom transaction type with prefix `0x76` that includes:

```typescript
type TransactionSerializableTempo = {
  // ... standard fields ...
  feePayerSignature?: Signature | null  // <-- This field doesn't exist in standard EVM
  feePayer?: Account | true
  feeToken?: Address
  // ... other Tempo-specific fields ...
}
```

### The Fee Payer Flow

1. **User creates transaction** with `feePayer: true` flag
2. **User signs** the transaction (their signature goes in `signature` field)
3. **User sends** to feePayer handler via `eth_sendRawTransaction`
4. **Handler deserializes** the `0x76` transaction
5. **Handler signs** as fee payer (signature goes in `feePayerSignature` field)
6. **Handler submits** transaction with BOTH signatures to the network
7. **Tempo nodes validate** both signatures and charge fees to the fee payer account

### Key Code from Tempo

**File:** `/tmp/tempo-ts/src/server/Handler.ts:568-588`

```typescript
if (request.method === 'eth_sendRawTransaction') {
  const serialized = request.params?.[0] as `0x76${string}`  // Tempo format
  const transaction = Transaction.deserialize(serialized)

  const serializedTransaction = await signTransaction(client, {
    ...transaction,
    account,
    // @ts-expect-error - Tempo-specific option
    feePayer: account,  // Adds feePayerSignature to the transaction
  })

  const result = await client.request({
    method: request.method,
    params: [serializedTransaction],
  })
}
```

---

## Why This Cannot Work on Standard EVM

### Standard EVM Transaction Structure

Standard EVM transactions (types `0x00`, `0x01`, `0x02`) have this structure:

```
[nonce, gasPrice, gasLimit, to, value, data, v, r, s]
```

Or for EIP-1559 (`0x02`):

```
[chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, v, r, s]
```

**There is no `feePayerSignature` field.** The single signature (`v, r, s`) determines:
- Who authorized the transaction
- Who pays the gas fees

These are inseparable in standard EVM.

### The Fundamental Problem

On standard EVM:
```
Transaction Signer == Fee Payer (always)
```

On Tempo:
```
Transaction Signer != Fee Payer (can be different)
```

This is a **protocol-level distinction**, not an SDK feature.

---

## What Would Radius Need for Fee Sponsorship

### Option 1: Custom Transaction Format (Like Tempo)

**Requirements:**
- Define a new transaction type (e.g., `0x76` or similar)
- Modify node software to recognize and validate it
- Implement dual-signature verification in consensus
- Update all tooling (explorers, wallets, etc.)

**Effort:** Very high (protocol change)

### Option 2: EIP-2771 Meta-Transactions

**How it works:**
- Deploy a "Trusted Forwarder" contract
- Users sign messages (not transactions)
- Relayer wraps user signatures in real transactions
- Smart contracts verify user signatures via `_msgSender()`

**Effort:** Medium (smart contract + SDK changes)
**Limitation:** Only works with EIP-2771 compatible contracts

### Option 3: EIP-4337 Account Abstraction

**How it works:**
- Users have smart contract wallets
- "Paymasters" can sponsor gas for UserOperations
- Bundlers submit transactions on behalf of users

**Effort:** High (infrastructure + contract deployment)
**Benefit:** Standard, well-supported approach

### Option 4: Simple Relay (Not True Fee Sponsorship)

**How it works:**
- Users send unsigned transaction parameters
- Relayer signs and submits as its own transaction
- Relayer address becomes the `from` address on-chain

**Effort:** Low (SDK only)
**Limitation:** Not really "sponsorship" - relayer IS the sender

---

## Decision

Since Radius is a standard EVM blockchain without custom transaction format support, the `feePayer` handler **cannot provide true fee sponsorship**.

**Action:** Remove `feePayer` from the Radius SDK v2.

**Future options:**
- If Radius implements protocol-level fee delegation, re-add feePayer
- Consider EIP-2771 or EIP-4337 as alternative approaches
- Document the limitation for users who expect Tempo-like behavior

---

## Files Affected

### Removed from SDK
- `typescript/src/server/Handler.ts` - `feePayer()` function
- `typescript/src/server/Handler.test.ts` - feePayer tests
- `typescript/src/server/types.ts` - `FeePayerOptions` type

### Documentation Updates Needed
- `typescript/README.md` - Remove feePayer examples
- Any guides mentioning fee sponsorship

---

## References

- Tempo Handler implementation: `/tmp/tempo-ts/src/server/Handler.ts:514-615`
- Tempo Transaction types: `/tmp/tempo-ts/src/server/Handler.ts` (imports from `viem/tempo`)
- EIP-2771: https://eips.ethereum.org/EIPS/eip-2771
- EIP-4337: https://eips.ethereum.org/EIPS/eip-4337
