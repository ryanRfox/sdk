# Documentation Generation

This document explains how the SDK documentation is generated and maintained.

## Overview

The Radius SDK documentation is generated from TypeScript source code and templates using a custom generation script. This ensures documentation stays synchronized with the SDK implementation.

## Generated Files

The following MDX files are auto-generated:

| File | Description |
|------|-------------|
| `sdk-typescript.mdx` | Main SDK API reference (~1500 lines) |
| `sdk-typescript-events.mdx` | Events and subscription API (~300 lines) |
| `sdk-typescript-react.mdx` | React hooks and components (~400 lines) |

## How to Regenerate

### Prerequisites

- Node.js 22+
- pnpm 9+

### Running the Generator

```bash
# From the typescript SDK directory
pnpm generate:docs
```

This runs `scripts/generate-docs.ts` and outputs to the `docs/` directory.

### What Gets Updated

- All API method signatures
- Type definitions
- Code examples
- Error handling documentation
- Migration guides

## When to Regenerate

Regenerate documentation after:

1. **API Changes** - New methods, renamed functions, changed signatures
2. **Type Changes** - Modified interfaces, new types, deprecated types
3. **Error Hierarchy Changes** - New error classes, changed error properties
4. **Breaking Changes** - Any changes that affect user-facing API

## How Generation Works

### Source of Truth

The generation script (`scripts/generate-docs.ts`) contains template strings that embed:

1. **API signatures** derived from source TypeScript files
2. **JSDoc comments** for descriptions
3. **Code examples** that are tested separately
4. **Type tables** for quick reference

### Template Structure

```typescript
// scripts/generate-docs.ts
const SDK_TYPESCRIPT_MDX = `---
title: Radius SDK for TypeScript
---

# API Documentation

## Methods

### sendAndWait()

...method documentation...
`;
```

### Advantages

- Single source of truth for documentation
- Examples can be validated against actual API
- Version-controlled alongside code
- Easy to review in PRs

## Configuration Options

### Customizing Output

Edit `scripts/generate-docs.ts` to:

- Add new sections
- Modify examples
- Update type tables
- Change formatting

### Output Directory

The default output is `./docs/`. To change:

```typescript
// In scripts/generate-docs.ts
const DOCS_DIR = join(import.meta.dirname, '..', 'custom-docs');
```

## Customization

### Adding New Sections

1. Open `scripts/generate-docs.ts`
2. Add content to the appropriate template string
3. Run `pnpm generate:docs`
4. Commit changes

### Modifying Examples

All code examples in the templates should be:
- Syntactically correct TypeScript
- Using current API patterns
- Tested in the test suite where applicable

### Updating After API Changes

After changing the SDK API:

1. Update the relevant template in `scripts/generate-docs.ts`
2. Ensure examples use new API patterns
3. Run `pnpm generate:docs`
4. Verify output in `docs/*.mdx`
5. Commit both script and generated files

## Troubleshooting

### Common Issues

#### "Cannot find module" Error

```bash
# Ensure dependencies are installed
pnpm install

# Try running directly with tsx
npx tsx scripts/generate-docs.ts
```

#### Output Not Updating

Check that you're in the correct directory:

```bash
cd /path/to/radius-sdk/typescript
pnpm generate:docs
```

#### Formatting Issues

The generated MDX uses:
- GitHub-flavored Markdown
- Fenced code blocks with language hints
- MDX frontmatter for metadata

### Validation

After generation, verify:

```bash
# Check file sizes (should be substantial)
ls -la docs/*.mdx

# Verify no deprecated patterns remain
grep -r "sendSync\|executeSync" docs/*.mdx
# Should return nothing for new v2 docs

# Check key v2 patterns exist
grep -r "sendAndWait\|executeAndWait" docs/*.mdx
# Should show multiple matches
```

## Integration with Docs Site

The generated MDX files are designed to be consumed by the Radius documentation site. The Docs team ingests these files during their build process.

### Handoff Process

1. SDK team regenerates docs after API changes
2. SDK team commits and pushes changes
3. Docs team pulls latest from SDK repo
4. Docs site builds with updated MDX files

### Communication

When regenerating docs, update `/tmp/comms/SDK_TO_DOCS.md` with:
- Summary of changes
- Any new sections added
- Breaking changes to document structure

## Maintenance

### Regular Tasks

- Regenerate after any API changes
- Review examples for correctness
- Update migration guides for major versions
- Sync with Docs team on format requirements

### Version Sync

The documentation version should match the SDK version in `package.json`. Update the generated docs whenever:

- Major version bump (breaking changes)
- Minor version bump (new features)
- Patch version bump (only if docs affected)
