#!/usr/bin/env npx tsx
/**
 * Validate SDK documentation for common issues.
 *
 * This script checks for:
 * - References to removed code (RadiusSigner, ClefSigner)
 * - Stale documentation patterns
 * - Missing required files
 *
 * Run with: pnpm docs:check
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_DIR = join(import.meta.dirname, '..', 'docs');

interface ValidationError {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

const errors: ValidationError[] = [];

// ============================================================================
// Validation Rules
// ============================================================================

// Patterns that indicate stale documentation
const STALE_PATTERNS = [
  { pattern: /RadiusSigner/g, message: 'Reference to removed RadiusSigner type' },
  { pattern: /ClefSigner/g, message: 'Reference to removed ClefSigner class' },
  { pattern: /createClefSigner/g, message: 'Reference to removed createClefSigner function' },
  { pattern: /ClefSignerConfig/g, message: 'Reference to removed ClefSignerConfig type' },
  { pattern: /createPrivateKeySigner\([^)]+,\s*\w+\.id\)/g, message: 'createPrivateKeySigner no longer takes chainId parameter' },
  { pattern: /@aspect-build\/radius-sdk/g, message: 'Reference to old package name' },
];

// Files where stale patterns are expected (migration guides, etc.)
const STALE_PATTERN_EXCEPTIONS = [
  /migration/i,  // Migration guides need to reference old APIs
];

// Required documentation files
const REQUIRED_FILES = [
  'api/README.md',
  'api/index.md',
  'guides/quick-start.mdx',
];

// ============================================================================
// Validation Functions
// ============================================================================

function validateFile(filePath: string, content: string) {
  // Skip stale pattern checks for exception files (migration guides, etc.)
  const skipStalePatterns = STALE_PATTERN_EXCEPTIONS.some(regex => regex.test(filePath));

  if (!skipStalePatterns) {
    for (const { pattern, message } of STALE_PATTERNS) {
      // Reset regex lastIndex
      pattern.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;

        errors.push({
          file: filePath,
          line: lineNumber,
          message,
          severity: 'error',
        });
      }
    }
  }
}

function validateDirectory(dir: string, baseDir: string = dir) {
  if (!existsSync(dir)) {
    errors.push({
      file: dir,
      message: `Directory does not exist: ${dir}`,
      severity: 'error',
    });
    return;
  }

  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = fullPath.replace(baseDir + '/', '');

    if (entry.isDirectory()) {
      validateDirectory(fullPath, baseDir);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const content = readFileSync(fullPath, 'utf-8');
      validateFile(relativePath, content);
    }
  }
}

function checkRequiredFiles() {
  for (const file of REQUIRED_FILES) {
    const fullPath = join(DOCS_DIR, file);
    if (!existsSync(fullPath)) {
      errors.push({
        file: file,
        message: `Required documentation file missing: ${file}`,
        severity: 'error',
      });
    }
  }
}

// ============================================================================
// Main
// ============================================================================

console.log('Validating documentation...\n');

// Check docs directory exists
if (!existsSync(DOCS_DIR)) {
  console.error('ERROR: docs/ directory does not exist.');
  console.error('Run "pnpm generate:docs" first.\n');
  process.exit(1);
}

// Run validations
checkRequiredFiles();
validateDirectory(DOCS_DIR);

// Report results
if (errors.length === 0) {
  console.log('All documentation checks passed!\n');
  process.exit(0);
}

// Group errors by file
const errorsByFile = new Map<string, ValidationError[]>();
for (const error of errors) {
  const existing = errorsByFile.get(error.file) || [];
  existing.push(error);
  errorsByFile.set(error.file, existing);
}

// Print errors
const errorCount = errors.filter(e => e.severity === 'error').length;
const warningCount = errors.filter(e => e.severity === 'warning').length;

console.log(`Found ${errorCount} error(s) and ${warningCount} warning(s):\n`);

for (const [file, fileErrors] of errorsByFile) {
  console.log(`${file}:`);
  for (const error of fileErrors) {
    const prefix = error.severity === 'error' ? 'ERROR' : 'WARNING';
    const lineInfo = error.line ? `:${error.line}` : '';
    console.log(`  ${prefix}${lineInfo}: ${error.message}`);
  }
  console.log();
}

// Exit with error code if there are errors
process.exit(errorCount > 0 ? 1 : 0);
