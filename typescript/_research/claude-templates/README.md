# Claude Code Session Templates

This directory contains session templates for Claude Code audit and fix workflows on the Radius SDK.

## Why Use Templates?

These templates provide Claude Code with:
- Accurate V2 codebase structure and API patterns
- Correct commands (`pnpm check:types` not `pnpm typecheck`)
- Clear severity classifications (no ambiguous statuses)
- Comprehensive verification checklists
- Branch hygiene rules

## Templates

### `CLAUDE-AUDIT.md` - Security & Code Quality Audit

Use this template when conducting a comprehensive audit of the codebase.

**Features:**
- Expanded audit focus areas (including documentation validation)
- Strict severity classification (CRITICAL/HIGH/MEDIUM/LOW only)
- Pre and post-audit checklists
- Output format specification
- Branch hygiene rules

### `CLAUDE-FIX.md` - Implementing Audit Fixes

Use this template when implementing fixes from an audit session.

**Features:**
- Accurate V2 module structure
- Correct API patterns with code examples
- 8-phase fix process
- Verification checklist with all correct commands
- Integration test instructions (with Anvil)
- Version bump guidance
- Error naming conventions

## How to Use

### Option 1: Global CLAUDE.md (Recommended)

Copy the appropriate template to your global Claude Code instructions:

```bash
# For audit session
cp typescript/_research/claude-templates/CLAUDE-AUDIT.md ~/.claude/CLAUDE.md

# For fix session
cp typescript/_research/claude-templates/CLAUDE-FIX.md ~/.claude/CLAUDE.md
```

Then start a new Claude Code session.

### Option 2: Session-Specific Instructions

Start Claude Code and manually paste the template content when beginning your session.

### Option 3: Project-Level Instructions

Copy to the project root (not recommended - clutters the repo):

```bash
cp typescript/_research/claude-templates/CLAUDE-AUDIT.md ./CLAUDE.md
```

## Workflow

### Complete Audit Cycle

1. **Start audit session** with `CLAUDE-AUDIT.md`
2. Claude creates findings in `typescript/_research/audit-findings-YYYY-MM-DD.md`
3. Commit findings to `research/findings` branch
4. **Start fix session** with `CLAUDE-FIX.md`
5. Claude implements fixes on a fix branch (e.g., `fix/audit-findings-YYYY-MM-DD`)
6. Create PR to main, get review, merge
7. Update audit document with fix status on `research/findings` branch

### Branch Structure

```
main                          # Production code only
├── fix/audit-findings-*      # Temporary fix branches (deleted after merge)
│
research/findings             # Audit artifacts (never merged to main)
├── typescript/_research/
│   ├── claude-templates/     # These templates
│   ├── audit-findings-*.md   # Audit documents
│   └── ...                   # Other research artifacts
```

## Maintenance

When the codebase changes significantly:

1. Update module structure in both templates
2. Update API patterns if new patterns are introduced
3. Update commands if package.json scripts change
4. Add new audit focus areas if new security concerns emerge

## Version History

- **v1.0** (2025-01-22): Initial templates based on lessons learned from first audit/fix cycle
  - Added documentation validation to audit scope
  - Added Biome formatting to fix process
  - Added version bump instructions
  - Fixed incorrect command references
  - Added branch hygiene rules
