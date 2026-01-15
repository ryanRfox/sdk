# Task Context: V2 SDK Audit

## Original Request
Audit the V2 SDK to identify issues, bugs, security concerns, and areas for improvement.

## Scope
The full TypeScript SDK at `typescript/src/` including:
- Core client (`client/`)
- Server handlers (`server/`)
- Authentication/accounts (`auth/`)
- Error handling (`errors/`)
- Types and exports
- React hooks (`react/`)
- Chain definitions (`chains/`)

## Audit Areas (Parallel QA)
1. **Core Client** - RadiusClient, transaction handling, contract interactions
2. **Server Module** - Handler implementations, Kv storage, request handling
3. **Auth/Accounts** - PrivateKeySigner, account management
4. **Error Handling** - Error hierarchy, error messages, edge cases
5. **Types & Exports** - Type safety, export completeness, API surface
6. **Security** - Input validation, injection risks, secret handling

## Mode
QA Mode - Start with parallel Haiku QA, escalate findings as needed
