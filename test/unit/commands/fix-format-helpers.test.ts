import { describe, expect, test } from 'vitest'
import chalk from 'chalk'

import type { FileFixResult, FixFlags, FixSummary } from '../../../src/commands/fix-helpers.js'
import {
  aggregateResults,
  outputFixResults,
  printSummary,
} from '../../../src/commands/fix-format-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const defaultFlags = (): FixFlags => ({
  ci: false,
  concurrency: 4,
  config: undefined,
  'dry-run': false,
  ignore: undefined,
  rules: undefined,
  'safe-only': false,
  verbose: false,
})

const makeFixResult = (overrides: Partial<FileFixResult> = {}): FileFixResult => ({
  conflicts: [],
  error: undefined,
  file: 'test.ts',
  fixesApplied: 0,
  fixesSkipped: 0,
  status: 'unchanged',
  ...overrides,
})

const makeFixSummary = (overrides: Partial<FixSummary> = {}): FixSummary => ({
  filesModified: [],
  filesUnchanged: [],
  totalFixesApplied: 0,
  totalFixesSkipped: 0,
  ...overrides,
})

// ============================================================================
// printSummary
// ============================================================================

describe('printSummary', () => {
  test('returns array of strings', () => {
    const lines = printSummary(makeFixSummary(), defaultFlags())
    expect(Array.isArray(lines)).toBe(true)
    for (const line of lines) {
      expect(typeof line).toBe('string')
    }
  })

  test('includes bold Fix Summary header', () => {
    const lines = printSummary(makeFixSummary(), defaultFlags())
    expect(lines[0]).toBe(chalk.bold('\n📊 Fix Summary\n'))
  })

  test('shows fixes applied count', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 7 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: 7'))).toBe(true)
  })

  test('shows dry-run mode indicator when dry-run is true', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(makeFixSummary(), flags)
    expect(lines.some((l) => l.includes('Dry run'))).toBe(true)
    expect(lines.some((l) => l.includes('no files modified'))).toBe(true)
  })

  test('does not show dry-run indicator when dry-run is false', () => {
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(makeFixSummary(), flags)
    expect(lines.some((l) => l.includes('Dry run'))).toBe(false)
  })

  test('shows skipped fixes count when > 0', () => {
    const lines = printSummary(makeFixSummary({ totalFixesSkipped: 3 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes skipped: 3'))).toBe(true)
    expect(lines.some((l) => l.includes('conflicts'))).toBe(true)
  })

  test('hides skipped fixes when count is 0', () => {
    const lines = printSummary(makeFixSummary({ totalFixesSkipped: 0 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes skipped'))).toBe(false)
  })

  test('shows Files modified and Files unchanged in non-dry-run mode', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      filesUnchanged: ['c.ts'],
      totalFixesApplied: 5,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files modified: 2'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
  })

  test('shows "Files would be modified" in dry-run mode when fixes > 0', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 3,
      filesModified: ['a.ts', 'b.ts'],
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files would be modified: 2'))).toBe(true)
  })

  test('does not show "Files would be modified" in dry-run when fixes = 0', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0 })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files would be modified'))).toBe(false)
  })

  test('shows "No violations found" when applied=0 and skipped=0', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 0 }),
      defaultFlags(),
    )
    expect(lines.some((l) => l.includes('No violations found to fix'))).toBe(true)
  })

  test('does not show "No violations found" when skipped > 0', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 2 }),
      defaultFlags(),
    )
    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
  })

  test('shows "Fixes applied successfully" when applied > 0 and not dry-run', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 5 }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(true)
  })

  test('does not show "Fixes applied successfully" in dry-run mode', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 5 }), {
      ...defaultFlags(),
      'dry-run': true,
    })
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(false)
  })

  test('empty summary with zero values produces clean output', () => {
    const lines = printSummary(makeFixSummary(), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('No violations found'))).toBe(true)
  })

  test('header line is always the first element in the array', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 10, totalFixesSkipped: 5 }), {
      ...defaultFlags(),
      'dry-run': true,
    })
    expect(lines[0]).toBe(chalk.bold('\n📊 Fix Summary\n'))
  })

  test('dry-run mode does not show Files unchanged count', () => {
    const summary = makeFixSummary({
      filesUnchanged: ['c.ts'],
      totalFixesApplied: 0,
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files unchanged'))).toBe(false)
  })

  test('non-dry-run with both applied > 0 and skipped > 0 shows both messages', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5, totalFixesSkipped: 2 })
    const lines = printSummary(summary, { ...defaultFlags(), 'dry-run': false })
    expect(lines.some((l) => l.includes('Fixes applied: 5'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped: 2'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(true)
  })

  test('non-dry-run with applied = 0 and skipped > 0 shows neither success nor no-violations', () => {
    const summary = makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 3 })
    const lines = printSummary(summary, { ...defaultFlags(), 'dry-run': false })
    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(false)
  })

  test('dry-run with applied > 0 and skipped > 0 shows would-modify and skipped', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 3,
      totalFixesSkipped: 1,
      filesModified: ['a.ts'],
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files would be modified'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped: 1'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(false)
  })

  test('fixes applied line uses chalk.green', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 7 }), defaultFlags())
    expect(lines).toContain(chalk.green('  Fixes applied: 7'))
  })

  test('skipped fixes line uses chalk.yellow', () => {
    const lines = printSummary(makeFixSummary({ totalFixesSkipped: 4 }), defaultFlags())
    expect(lines).toContain(chalk.yellow('  Fixes skipped: 4 (conflicts)'))
  })

  test('dry-run mode indicator uses chalk.dim', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(makeFixSummary(), flags)
    expect(lines).toContain(chalk.dim('  Mode: Dry run (no files modified)'))
  })

  test('files modified line uses chalk.blue', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: [],
      totalFixesApplied: 2,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines).toContain(chalk.blue('  Files modified: 1'))
  })

  test('files unchanged line uses chalk.dim', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: ['b.ts', 'c.ts'],
      totalFixesApplied: 1,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines).toContain(chalk.dim('  Files unchanged: 2'))
  })

  test('"No violations found" line uses chalk.green', () => {
    const lines = printSummary(makeFixSummary(), defaultFlags())
    expect(lines).toContain(chalk.green('\n✨ No violations found to fix!'))
  })

  test('"Fixes applied successfully" line uses chalk.green', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 5 }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines).toContain(chalk.green('\n✨ Fixes applied successfully!'))
  })

  test('"Files would be modified" line uses chalk.blue', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 3,
      filesModified: ['a.ts', 'b.ts', 'c.ts'],
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(summary, flags)
    expect(lines).toContain(chalk.blue('  Files would be modified: 3'))
  })

  test('dry-run indicator appears immediately after header', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(makeFixSummary(), flags)
    expect(lines[0]).toBe(chalk.bold('\n📊 Fix Summary\n'))
    expect(lines[1]).toBe(chalk.dim('  Mode: Dry run (no files modified)'))
  })

  test('non-dry-run with applied=0 and skipped=0 shows files modified count 0', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 0,
      totalFixesSkipped: 0,
      filesModified: [],
      filesUnchanged: [],
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files modified: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 0'))).toBe(true)
  })

  test('large fix count displays correctly', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 999 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: 999'))).toBe(true)
  })

  test('non-dry-run with applied > 0 and skipped = 0 has no skipped line', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5, totalFixesSkipped: 0 })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Fixes skipped'))).toBe(false)
  })

  test('summary with single modified file shows count of 1', () => {
    const summary = makeFixSummary({
      filesModified: ['only.ts'],
      totalFixesApplied: 1,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files modified: 1'))).toBe(true)
  })

  test('summary with single unchanged file shows count of 1', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: ['solo.ts'],
      totalFixesApplied: 1,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
  })

  test('summary with many modified files shows correct count', () => {
    const files = Array.from({ length: 25 }, (_, i) => `file${i}.ts`)
    const summary = makeFixSummary({
      filesModified: files,
      totalFixesApplied: 25,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files modified: 25'))).toBe(true)
  })

  test('dry-run with applied > 0 and skipped = 0 does not show skipped', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 3,
      totalFixesSkipped: 0,
      filesModified: ['a.ts'],
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Fixes skipped'))).toBe(false)
  })

  test('non-dry-run with applied=1 and skipped=0 does not show no-violations', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1, totalFixesSkipped: 0 })
    const lines = printSummary(summary, { ...defaultFlags(), 'dry-run': false })
    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
  })

  test('non-dry-run with many unchanged files shows correct count', () => {
    const files = Array.from({ length: 30 }, (_, i) => `unchanged${i}.ts`)
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: files,
      totalFixesApplied: 1,
    })
    const flags = { ...defaultFlags(), 'dry-run': false }
    const lines = printSummary(summary, flags)
    expect(lines.some((l) => l.includes('Files unchanged: 30'))).toBe(true)
  })

  test('dry-run with applied=0 and skipped=0 shows no-violations and dry-run indicator', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(makeFixSummary(), flags)
    expect(lines.some((l) => l.includes('Dry run'))).toBe(true)
    expect(lines.some((l) => l.includes('No violations found to fix'))).toBe(true)
  })

  test('handles very large totalFixesApplied count', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 2147483647 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: 2147483647'))).toBe(true)
  })

  test('handles very large totalFixesSkipped count', () => {
    const lines = printSummary(makeFixSummary({ totalFixesSkipped: 2147483647 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes skipped: 2147483647'))).toBe(true)
  })

  test('handles maximum safe integer for fixes applied', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: Number.MAX_SAFE_INTEGER }),
      defaultFlags(),
    )
    expect(lines.some((l) => l.includes(String(Number.MAX_SAFE_INTEGER)))).toBe(true)
  })

  test('handles zero totalFixesApplied and zero totalFixesSkipped', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 0 }),
      defaultFlags(),
    )
    expect(lines.some((l) => l.includes('Fixes applied: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped:'))).toBe(false)
  })

  test('handles negative totalFixesApplied (displays as-is)', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: -5 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: -5'))).toBe(true)
  })

  test('handles empty filesModified array', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 1, filesModified: [] }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('Files modified: 0'))).toBe(true)
  })

  test('handles empty filesUnchanged array', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 1, filesUnchanged: [] }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('Files unchanged: 0'))).toBe(true)
  })

  test('handles both empty arrays in dry-run mode', () => {
    const lines = printSummary(
      makeFixSummary({
        filesModified: [],
        filesUnchanged: [],
        totalFixesApplied: 0,
      }),
      { ...defaultFlags(), 'dry-run': true },
    )
    expect(lines.some((l) => l.includes('Files modified'))).toBe(false)
    expect(lines.some((l) => l.includes('Files unchanged'))).toBe(false)
  })

  test('handles single file in filesModified', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 1, filesModified: ['single.ts'] }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files modified: 1'))).toBe(true)
  })

  test('handles single file in filesUnchanged', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 1,
        filesModified: ['a.ts'],
        filesUnchanged: ['single.ts'],
      }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
  })

  test('handles decimal totalFixesApplied (displays as-is)', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 3.5 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: 3.5'))).toBe(true)
  })

  test('handles decimal totalFixesSkipped (displays as-is)', () => {
    const lines = printSummary(makeFixSummary({ totalFixesSkipped: 2.7 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes skipped: 2.7'))).toBe(true)
  })

  test('handles very large filesModified count', () => {
    const files = Array.from({ length: 10000 }, (_, i) => `file${i}.ts`)
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 10000, filesModified: files }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('Files modified: 10000'))).toBe(true)
  })

  test('handles very large filesUnchanged count', () => {
    const files = Array.from({ length: 10000 }, (_, i) => `file${i}.ts`)
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 1,
        filesModified: ['a.ts'],
        filesUnchanged: files,
      }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files unchanged: 10000'))).toBe(true)
  })

  test('handles NaN totalFixesApplied (displays as-is)', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: NaN }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: NaN'))).toBe(true)
  })

  test('handles Infinity totalFixesApplied (displays as-is)', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: Infinity }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: Infinity'))).toBe(true)
  })

  test('dry-run with applied>0 does not show success message', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 5 }), {
      ...defaultFlags(),
      'dry-run': true,
    })
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(false)
  })

  test('non-dry-run with applied>0 shows success message', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 1 }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('Fixes applied successfully!'))).toBe(true)
  })

  test('handles totalFixesApplied=1, totalFixesSkipped=1 correctly', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 1, totalFixesSkipped: 1 }),
      defaultFlags(),
    )
    expect(lines.some((l) => l.includes('Fixes applied: 1'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped: 1'))).toBe(true)
  })

  test('non-dry-run mode shows both modified and unchanged when both have files', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 1,
        filesModified: ['a.ts'],
        filesUnchanged: ['b.ts'],
      }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files modified: 1'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
  })

  test('dry-run with applied>0 shows would-modify even with filesModified', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 2,
        filesModified: ['a.ts', 'b.ts'],
      }),
      { ...defaultFlags(), 'dry-run': true },
    )
    expect(lines.some((l) => l.includes('Files would be modified: 2'))).toBe(true)
  })

  test('dry-run with applied=0 shows no-violations even with filesModified', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 0,
        filesModified: ['a.ts', 'b.ts'],
      }),
      { ...defaultFlags(), 'dry-run': true },
    )
    expect(lines.some((l) => l.includes('No violations found to fix'))).toBe(true)
    expect(lines.some((l) => l.includes('Files would be modified'))).toBe(false)
  })

  test('non-dry-run with skipped>0 and applied=0 shows neither message', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 5 }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
    expect(lines.some((l) => l.includes('Fixes applied successfully'))).toBe(false)
  })

  test('non-dry-run with skipped>0 and applied>0 shows success and skipped', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 3, totalFixesSkipped: 2 }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    expect(lines.some((l) => l.includes('Fixes applied successfully!'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped: 2'))).toBe(true)
  })

  test('dry-run with skipped>0 shows skipped count and dry-run indicator', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 4 }), {
      ...defaultFlags(),
      'dry-run': true,
    })
    expect(lines.some((l) => l.includes('Dry run'))).toBe(true)
    expect(lines.some((l) => l.includes('Fixes skipped: 4'))).toBe(true)
  })

  test('handles mixed modified and unchanged files in non-dry-run', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 2,
        filesModified: ['a.ts', 'b.ts'],
        filesUnchanged: ['c.ts', 'd.ts', 'e.ts'],
      }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files modified: 2'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 3'))).toBe(true)
  })

  test('dry-run indicator position is consistent', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 1 }), flags)
    expect(lines[0]).toBe(chalk.bold('\n📊 Fix Summary\n'))
    expect(lines[1]).toBe(chalk.dim('  Mode: Dry run (no files modified)'))
  })

  test('handles totalFixesApplied=0 with filesModified empty', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 0,
        filesModified: [],
        filesUnchanged: [],
      }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files modified: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('No violations found'))).toBe(true)
  })

  test('handles large totalFixesSkipped with zero applied', () => {
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 99999 }),
      defaultFlags(),
    )
    expect(lines.some((l) => l.includes('Fixes skipped: 99999'))).toBe(true)
    expect(lines.some((l) => l.includes('No violations found'))).toBe(false)
  })

  test('non-dry-run shows file counts even when applied=0', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 0,
        filesModified: [],
        filesUnchanged: ['a.ts'],
      }),
      { ...defaultFlags(), 'dry-run': false },
    )
    expect(lines.some((l) => l.includes('Files modified: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('Files unchanged: 1'))).toBe(true)
  })

  test('dry-run does not show file counts when applied=0', () => {
    const lines = printSummary(
      makeFixSummary({
        totalFixesApplied: 0,
        filesModified: [],
        filesUnchanged: ['a.ts', 'b.ts'],
      }),
      { ...defaultFlags(), 'dry-run': true },
    )
    expect(lines.some((l) => l.includes('Files modified'))).toBe(false)
    expect(lines.some((l) => l.includes('Files unchanged'))).toBe(false)
  })

  test('handles zero and negative skip combinations', () => {
    const lines = printSummary(makeFixSummary({ totalFixesSkipped: 0 }), defaultFlags())
    expect(lines.some((l) => l.includes('Fixes skipped'))).toBe(false)
  })

  test('header contains correct emoji', () => {
    const lines = printSummary(makeFixSummary(), defaultFlags())
    expect(lines[0]).toContain('📊')
  })

  test('success message contains correct emoji', () => {
    const lines = printSummary(makeFixSummary({ totalFixesApplied: 1 }), {
      ...defaultFlags(),
      'dry-run': false,
    })
    const successLine = lines.find((l) => l.includes('Fixes applied successfully'))
    expect(successLine).toContain('✨')
  })

  test('no violations message contains correct emoji', () => {
    const lines = printSummary(makeFixSummary(), defaultFlags())
    const noViolationsLine = lines.find((l) => l.includes('No violations found'))
    expect(noViolationsLine).toContain('✨')
  })

  test('handles empty summary object with all zero values', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 0,
      totalFixesSkipped: 0,
      filesModified: [],
      filesUnchanged: [],
    })
    const lines = printSummary(summary, defaultFlags())
    expect(lines.some((l) => l.includes('Fixes applied: 0'))).toBe(true)
    expect(lines.some((l) => l.includes('No violations found'))).toBe(true)
  })

  test('handles flags with undefined values', () => {
    const flags = { ...defaultFlags(), config: undefined, ignore: undefined, rules: undefined }
    const lines = printSummary(makeFixSummary(), flags)
    expect(lines).toBeDefined()
    expect(lines.length).toBeGreaterThan(0)
  })

  test('dry-run mode indicator appears before other content', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const lines = printSummary(
      makeFixSummary({ totalFixesApplied: 1, totalFixesSkipped: 1 }),
      flags,
    )
    const dryRunIndex = lines.findIndex((l) => l.includes('Dry run'))
    expect(dryRunIndex).toBeGreaterThan(0)
    expect(dryRunIndex).toBeLessThan(lines.length - 1)
  })
})

// ============================================================================
// outputFixResults
// ============================================================================

describe('outputFixResults', () => {
  test('ci mode returns jsonOutput and empty summaryLines', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: ['b.ts'],
      totalFixesApplied: 3,
      totalFixesSkipped: 1,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    expect(result.jsonOutput).toBeDefined()
    expect(result.summaryLines).toEqual([])
  })

  test('non-ci mode returns summaryLines and no jsonOutput', () => {
    const summary = makeFixSummary({ totalFixesApplied: 2 })
    const result = outputFixResults(summary, defaultFlags(), false)
    expect(result.jsonOutput).toBeUndefined()
    expect(result.summaryLines.length).toBeGreaterThan(0)
  })

  test('ci mode json has correct structure', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      filesUnchanged: ['c.ts'],
      totalFixesApplied: 5,
      totalFixesSkipped: 2,
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)

    expect(parsed.dryRun).toBe(true)
    expect(parsed.filesModified).toEqual(['a.ts', 'b.ts'])
    expect(parsed.filesUnchanged).toEqual(['c.ts'])
    expect(parsed.summary.fixesApplied).toBe(5)
    expect(parsed.summary.fixesSkipped).toBe(2)
  })

  test('ci mode json reflects dryRun=false correctly', () => {
    const flags = { ...defaultFlags(), 'dry-run': false }
    const result = outputFixResults(makeFixSummary(), flags, true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.dryRun).toBe(false)
  })

  test('non-ci summaryLines match printSummary output', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = defaultFlags()
    const result = outputFixResults(summary, flags, false)
    expect(result.summaryLines).toEqual(printSummary(summary, flags))
  })

  test('ci mode json is pretty-printed', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    expect(result.jsonOutput).toContain('\n')
    expect(result.jsonOutput).toContain('  ')
  })

  test('ci mode with empty summary produces valid json', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual([])
    expect(parsed.summary.fixesApplied).toBe(0)
    expect(parsed.summary.fixesSkipped).toBe(0)
  })

  test('ci mode JSON has exactly 4 top-level keys', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(Object.keys(parsed).sort()).toEqual(
      ['dryRun', 'filesModified', 'filesUnchanged', 'summary'].sort(),
    )
  })

  test('ci mode preserves order of filesModified array', () => {
    const summary = makeFixSummary({ filesModified: ['z.ts', 'a.ts', 'm.ts'] })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual(['z.ts', 'a.ts', 'm.ts'])
  })

  test('ci mode preserves order of filesUnchanged array', () => {
    const summary = makeFixSummary({ filesUnchanged: ['x.ts', 'b.ts', 'n.ts'] })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesUnchanged).toEqual(['x.ts', 'b.ts', 'n.ts'])
  })

  test('non-ci mode with dry-run flag passes through to printSummary', () => {
    const summary = makeFixSummary({ totalFixesApplied: 3 })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const result = outputFixResults(summary, flags, false)
    expect(result.summaryLines).toEqual(printSummary(summary, flags))
    expect(result.summaryLines.some((l) => l.includes('Dry run'))).toBe(true)
  })

  test('ci mode with many files serializes correctly', () => {
    const files = Array.from({ length: 100 }, (_, i) => `file${i}.ts`)
    const summary = makeFixSummary({
      filesModified: files,
      filesUnchanged: files,
      totalFixesApplied: 200,
      totalFixesSkipped: 50,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified.length).toBe(100)
    expect(parsed.filesUnchanged.length).toBe(100)
  })

  test('ci mode summary object has exactly fixesApplied and fixesSkipped', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(Object.keys(parsed.summary)).toEqual(['fixesApplied', 'fixesSkipped'])
  })

  test('ci mode json round-trips through parse/stringify', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts'],
      filesUnchanged: ['b.ts'],
      totalFixesApplied: 4,
      totalFixesSkipped: 1,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    const reStringified = JSON.stringify(parsed)
    const reParsed = JSON.parse(reStringified)
    expect(reParsed).toEqual(parsed)
  })

  test('ci mode with special characters in filenames', () => {
    const summary = makeFixSummary({
      filesModified: ['path/to/file with spaces.ts', 'unicode-αβγ.ts', 'back`tick.ts'],
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([
      'path/to/file with spaces.ts',
      'unicode-αβγ.ts',
      'back`tick.ts',
    ])
  })

  test('ci mode preserves numeric types for fix counts', () => {
    const summary = makeFixSummary({ totalFixesApplied: 42, totalFixesSkipped: 7 })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(typeof parsed.summary.fixesApplied).toBe('number')
    expect(typeof parsed.summary.fixesSkipped).toBe('number')
  })

  test('ci mode with verbose flag still produces identical JSON', () => {
    const summary = makeFixSummary({ totalFixesApplied: 3 })
    const flagsVerbose = { ...defaultFlags(), verbose: true }
    const flagsQuiet = { ...defaultFlags(), verbose: false }
    const resultVerbose = outputFixResults(summary, flagsVerbose, true)
    const resultQuiet = outputFixResults(summary, flagsQuiet, true)
    expect(resultVerbose.jsonOutput).toBe(resultQuiet.jsonOutput)
  })

  test('ci mode with zero totalFixesApplied has fixesApplied=0 in json', () => {
    const result = outputFixResults(
      makeFixSummary({ totalFixesApplied: 0, totalFixesSkipped: 0 }),
      defaultFlags(),
      true,
    )
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary.fixesApplied).toBe(0)
    expect(parsed.summary.fixesSkipped).toBe(0)
  })

  test('non-ci result object has exactly summaryLines key', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), false)
    expect(Object.keys(result)).toEqual(['summaryLines'])
  })

  test('ci result object has jsonOutput and summaryLines keys', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    expect(Object.keys(result).sort()).toEqual(['jsonOutput', 'summaryLines'])
  })

  test('ci mode JSON indentation uses 2 spaces', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    expect(result.jsonOutput).toContain('  "dryRun"')
  })

  test('ci mode dry-run flag true in JSON matches flag', () => {
    const flags = { ...defaultFlags(), 'dry-run': true }
    const result = outputFixResults(makeFixSummary(), flags, true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.dryRun).toBe(true)
  })

  test('ci mode with duplicate filenames preserves them', () => {
    const summary = makeFixSummary({
      filesModified: ['dup.ts', 'dup.ts'],
      filesUnchanged: ['dup.ts'],
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual(['dup.ts', 'dup.ts'])
    expect(parsed.filesUnchanged).toEqual(['dup.ts'])
  })

  test('ci mode with large counts serializes correctly', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1000000, totalFixesSkipped: 999999 })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary.fixesApplied).toBe(1000000)
    expect(parsed.summary.fixesSkipped).toBe(999999)
  })

  test('non-ci mode with various summary states returns non-empty summaryLines', () => {
    const summary = makeFixSummary({
      totalFixesApplied: 10,
      totalFixesSkipped: 5,
      filesModified: ['a.ts'],
      filesUnchanged: ['b.ts'],
    })
    const result = outputFixResults(summary, defaultFlags(), false)
    expect(result.summaryLines.length).toBeGreaterThan(0)
  })

  test('ci mode output is deterministic across calls', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      totalFixesApplied: 3,
    })
    const result1 = outputFixResults(summary, defaultFlags(), true)
    const result2 = outputFixResults(summary, defaultFlags(), true)
    expect(result1.jsonOutput).toBe(result2.jsonOutput)
  })

  test('ci mode with only filesUnchanged populated serializes correctly', () => {
    const summary = makeFixSummary({
      filesModified: [],
      filesUnchanged: ['a.ts', 'b.ts', 'c.ts'],
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  test('non-ci mode summaryLines is a new array each call', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const result1 = outputFixResults(summary, defaultFlags(), false)
    const result2 = outputFixResults(summary, defaultFlags(), false)
    expect(result1.summaryLines).not.toBe(result2.summaryLines)
  })

  test('ci mode handles very large number of files', () => {
    const files = Array.from({ length: 100000 }, (_, i) => `file${i}.ts`)
    const summary = makeFixSummary({
      filesModified: files,
      filesUnchanged: files,
      totalFixesApplied: 100000,
      totalFixesSkipped: 50000,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified.length).toBe(100000)
    expect(parsed.filesUnchanged.length).toBe(100000)
  })

  test('ci mode handles zero-length file arrays', () => {
    const summary = makeFixSummary({
      filesModified: [],
      filesUnchanged: [],
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual([])
  })

  test('ci mode handles MAX_SAFE_INTEGER fix counts', () => {
    const summary = makeFixSummary({
      totalFixesApplied: Number.MAX_SAFE_INTEGER,
      totalFixesSkipped: Number.MAX_SAFE_INTEGER,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary.fixesApplied).toBe(Number.MAX_SAFE_INTEGER)
    expect(parsed.summary.fixesSkipped).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('ci mode handles negative fix counts', () => {
    const summary = makeFixSummary({
      totalFixesApplied: -5,
      totalFixesSkipped: -3,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary.fixesApplied).toBe(-5)
    expect(parsed.summary.fixesSkipped).toBe(-3)
  })

  test('ci mode handles special characters in file paths', () => {
    const summary = makeFixSummary({
      filesModified: ['path/with/unicode/αβγ.ts', 'file\nwith\nnewlines.ts', 'file"with"quotes.ts'],
      filesUnchanged: ['file`with`backticks.ts', 'file\twith\ttabs.ts'],
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified[0]).toBe('path/with/unicode/αβγ.ts')
    expect(parsed.filesModified[1]).toBe('file\nwith\nnewlines.ts')
    expect(parsed.filesModified[2]).toBe('file"with"quotes.ts')
    expect(parsed.filesUnchanged[0]).toBe('file`with`backticks.ts')
    expect(parsed.filesUnchanged[1]).toBe('file\twith\ttabs.ts')
  })

  test('ci mode preserves undefined values in flags', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = {
      ...defaultFlags(),
      config: undefined,
      ignore: undefined,
      rules: undefined,
    }
    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.dryRun).toBe(false)
  })

  test('non-ci mode produces consistent output across multiple calls with same input', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5 })
    const flags = defaultFlags()
    const result1 = outputFixResults(summary, flags, false)
    const result2 = outputFixResults(summary, flags, false)
    expect(result1.summaryLines).toEqual(result2.summaryLines)
  })

  test('ci mode produces consistent output across multiple calls with same input', () => {
    const summary = makeFixSummary({ totalFixesApplied: 5 })
    const flags = defaultFlags()
    const result1 = outputFixResults(summary, flags, true)
    const result2 = outputFixResults(summary, flags, true)
    expect(result1.jsonOutput).toBe(result2.jsonOutput)
  })

  test('non-ci mode returns object with only summaryLines property', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), false)
    expect(Object.keys(result)).toEqual(['summaryLines'])
    expect(result.jsonOutput).toBeUndefined()
  })

  test('ci mode returns object with both jsonOutput and summaryLines properties', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['jsonOutput', 'summaryLines']))
    expect(result.jsonOutput).toBeDefined()
    expect(result.summaryLines).toBeDefined()
  })

  test('ci mode jsonOutput is valid JSON string', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    expect(() => JSON.parse(result.jsonOutput!)).not.toThrow()
  })

  test('ci mode jsonOutput can be parsed back to same structure', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      totalFixesApplied: 3,
      totalFixesSkipped: 1,
    })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const result = outputFixResults(summary, flags, true)
    const parsed = JSON.parse(result.jsonOutput!)
    const reStringified = JSON.stringify(parsed)
    const reParsed = JSON.parse(reStringified)
    expect(reParsed).toEqual(parsed)
  })

  test('ci mode with empty filesModified and filesUnchanged', () => {
    const summary = makeFixSummary({
      filesModified: [],
      filesUnchanged: [],
      totalFixesApplied: 0,
      totalFixesSkipped: 0,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual([])
    expect(parsed.summary.fixesApplied).toBe(0)
    expect(parsed.summary.fixesSkipped).toBe(0)
  })

  test('ci mode with only filesModified populated', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts', 'c.ts'],
      filesUnchanged: [],
      totalFixesApplied: 3,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual(['a.ts', 'b.ts', 'c.ts'])
    expect(parsed.filesUnchanged).toEqual([])
  })

  test('ci mode with only filesUnchanged populated', () => {
    const summary = makeFixSummary({
      filesModified: [],
      filesUnchanged: ['a.ts', 'b.ts', 'c.ts'],
      totalFixesApplied: 0,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([])
    expect(parsed.filesUnchanged).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  test('ci mode dry-run flag reflects correctly in JSON', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.dryRun).toBe(false)
  })

  test('non-ci mode ignores ci parameter and produces summary', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const result = outputFixResults(summary, defaultFlags(), false)
    expect(result.summaryLines.length).toBeGreaterThan(0)
    expect(result.jsonOutput).toBeUndefined()
  })

  test('ci mode with large number of totalFixesSkipped', () => {
    const summary = makeFixSummary({
      totalFixesSkipped: 1000000,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.summary.fixesSkipped).toBe(1000000)
  })

  test('ci mode with very long file paths', () => {
    const longPath = 'a'.repeat(1000) + '.ts'
    const summary = makeFixSummary({
      filesModified: [longPath],
      filesUnchanged: [longPath],
      totalFixesApplied: 1,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified[0]).toBe(longPath)
    expect(parsed.filesUnchanged[0]).toBe(longPath)
  })

  test('ci mode handles files with extensions containing special chars', () => {
    const summary = makeFixSummary({
      filesModified: ['file.name.with.dots.ts', 'file[brackets].ts', 'file(parentheses).ts'],
      totalFixesApplied: 3,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual([
      'file.name.with.dots.ts',
      'file[brackets].ts',
      'file(parentheses).ts',
    ])
  })

  test('ci mode JSON has no extra properties', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    const expectedKeys = ['dryRun', 'filesModified', 'filesUnchanged', 'summary']
    expect(Object.keys(parsed).sort()).toEqual(expectedKeys.sort())
  })

  test('ci mode summary object has no extra properties', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(Object.keys(parsed.summary)).toEqual(['fixesApplied', 'fixesSkipped'])
  })

  test('non-ci mode with dry-run flag produces summaryLines', () => {
    const summary = makeFixSummary({ totalFixesApplied: 1 })
    const flags = { ...defaultFlags(), 'dry-run': true }
    const result = outputFixResults(summary, flags, false)
    expect(result.summaryLines.length).toBeGreaterThan(0)
    expect(result.summaryLines.some((l) => l.includes('Dry run'))).toBe(true)
  })

  test('ci mode produces empty summaryLines array', () => {
    const result = outputFixResults(makeFixSummary(), defaultFlags(), true)
    expect(result.summaryLines).toEqual([])
  })

  test('ci mode with mixed populated arrays serializes correctly', () => {
    const summary = makeFixSummary({
      filesModified: ['a.ts', 'b.ts'],
      filesUnchanged: ['c.ts', 'd.ts'],
      totalFixesApplied: 2,
      totalFixesSkipped: 1,
    })
    const result = outputFixResults(summary, defaultFlags(), true)
    const parsed = JSON.parse(result.jsonOutput!)
    expect(parsed.filesModified).toEqual(['a.ts', 'b.ts'])
    expect(parsed.filesUnchanged).toEqual(['c.ts', 'd.ts'])
  })
})

// ============================================================================
// aggregateResults
// ============================================================================

describe('aggregateResults', () => {
  test('sums totalFixesApplied across all processed results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, fixesSkipped: 1 }),
      makeFixResult({ status: 'processed', fixesApplied: 2, fixesSkipped: 0 }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(5)
  })

  test('sums totalFixesSkipped across all processed results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, fixesSkipped: 2 }),
      makeFixResult({ status: 'processed', fixesApplied: 0, fixesSkipped: 3 }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesSkipped).toBe(5)
  })

  test('tracks filesModified when not dry-run and fixesApplied > 0', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'a.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'b.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['a.ts', 'b.ts'])
  })

  test('does NOT track filesModified in dry-run mode', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual([])
  })

  test('does NOT track filesModified when fixesApplied is 0', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual([])
  })

  test('tracks filesUnchanged for non-processed results', () => {
    const results: FileFixResult[] = [makeFixResult({ status: 'unchanged', file: 'clean.ts' })]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesUnchanged).toEqual(['clean.ts'])
  })

  test('error results do not add to filesModified or filesUnchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'fail', file: 'bad.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
  })

  test('logs error messages for error status results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'Parse failed', file: 'bad.ts' }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.some((l) => l.includes('Error processing'))).toBe(true)
    expect(logLines.some((l) => l.includes('bad.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('Parse failed'))).toBe(true)
  })

  test('logs verbose fix messages only when verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, file: 'a.ts' }),
    ]
    const verboseResult = aggregateResults(results, {
      ...defaultFlags(),
      verbose: true,
      'dry-run': false,
    })
    const quietResult = aggregateResults(results, {
      ...defaultFlags(),
      verbose: false,
      'dry-run': false,
    })
    expect(verboseResult.logLines.some((l) => l.includes('Fixed 3 violation(s)'))).toBe(true)
    expect(quietResult.logLines.some((l) => l.includes('Fixed 3 violation(s)'))).toBe(false)
  })

  test('logs dry-run "would fix" messages only when dry-run=true and verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'a.ts' }),
    ]
    const dryVerbose = aggregateResults(results, {
      ...defaultFlags(),
      'dry-run': true,
      verbose: true,
    })
    const dryQuiet = aggregateResults(results, {
      ...defaultFlags(),
      'dry-run': true,
      verbose: false,
    })
    const notDryVerbose = aggregateResults(results, {
      ...defaultFlags(),
      'dry-run': false,
      verbose: true,
    })
    expect(dryVerbose.logLines.some((l) => l.includes('Would fix 2 violation(s)'))).toBe(true)
    expect(dryQuiet.logLines.some((l) => l.includes('Would fix'))).toBe(false)
    expect(notDryVerbose.logLines.some((l) => l.includes('Would fix'))).toBe(false)
  })

  test('logs conflict messages only when verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [{ ruleId: 'rule-a', conflictingRule: 'rule-b' }],
      }),
    ]
    const verboseResult = aggregateResults(results, { ...defaultFlags(), verbose: true })
    const quietResult = aggregateResults(results, { ...defaultFlags(), verbose: false })
    expect(
      verboseResult.logLines.some((l) => l.includes('Skipped rule-a (conflicts with rule-b)')),
    ).toBe(true)
    expect(quietResult.logLines.some((l) => l.includes('conflicts with'))).toBe(false)
  })

  test('empty results array produces zero summary', () => {
    const { summary, logLines } = aggregateResults([], defaultFlags())
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(logLines).toEqual([])
  })

  test('mixed results aggregate correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, fixesSkipped: 1, file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'Oops', file: 'b.ts' }),
      makeFixResult({ status: 'unchanged', file: 'c.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, fixesSkipped: 2, file: 'd.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }
    const { summary, logLines } = aggregateResults(results, flags)

    expect(summary.totalFixesApplied).toBe(4)
    expect(summary.totalFixesSkipped).toBe(3)
    expect(summary.filesModified).toEqual(['a.ts', 'd.ts'])
    expect(summary.filesUnchanged).toEqual(['c.ts'])
    expect(logLines.some((l) => l.includes('Error processing b.ts'))).toBe(true)
  })

  test('multiple conflict messages are all logged when verbose', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [
          { ruleId: 'r1', conflictingRule: 'r2' },
          { ruleId: 'r3', conflictingRule: 'r4' },
        ],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    expect(logLines.filter((l) => l.includes('Skipped')).length).toBe(2)
  })

  test('processed result with 0 fixes goes to neither modified nor unchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
  })

  test('single error result does not increment fix counts', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'fail', file: 'a.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
  })

  test('multiple error results produce separate log lines', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'err1', file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'err2', file: 'b.ts' }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.length).toBe(2)
    expect(logLines.some((l) => l.includes('a.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('b.ts'))).toBe(true)
  })

  test('processed with fixes > 0, dry-run=false, verbose=false adds to filesModified without log', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: false }
    const { summary, logLines } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['a.ts'])
    expect(logLines.some((l) => l.includes('Fixed'))).toBe(false)
  })

  test('processed with fixes > 0, dry-run=true, verbose=false adds nothing to filesModified', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 5, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: false }
    const { summary, logLines } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual([])
    expect(logLines.some((l) => l.includes('Would fix'))).toBe(false)
  })

  test('all unchanged results produce empty filesModified and empty logLines', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'unchanged', file: 'a.ts' }),
      makeFixResult({ status: 'unchanged', file: 'b.ts' }),
    ]
    const { summary, logLines } = aggregateResults(results, defaultFlags())
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual(['a.ts', 'b.ts'])
    expect(logLines).toEqual([])
  })

  test('all error results produce empty filesModified and empty filesUnchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'e1', file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'e2', file: 'b.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
  })

  test('conflict without verbose produces no conflict log lines', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: false })
    expect(logLines.some((l) => l.includes('conflicts with'))).toBe(false)
  })

  test('processed with fixes = 0 and dry-run = true verbose = true produces no would-fix log', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.some((l) => l.includes('Would fix'))).toBe(false)
  })

  test('conflict log includes the file name', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'specific-file.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    expect(logLines.some((l) => l.includes('specific-file.ts'))).toBe(true)
  })

  test('large result set aggregates correctly', () => {
    const results: FileFixResult[] = Array.from({ length: 50 }, (_, i) =>
      makeFixResult({
        status: 'processed',
        fixesApplied: i % 2 === 0 ? 1 : 0,
        fixesSkipped: i % 3 === 0 ? 1 : 0,
        file: `file${i}.ts`,
      }),
    )
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.totalFixesApplied).toBe(25)
    expect(summary.totalFixesSkipped).toBe(17)
    expect(summary.filesModified.length).toBe(25)
  })

  test('error log line uses chalk.red', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'Oops', file: 'bad.ts' }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines).toContain(chalk.red('  ✗ Error processing bad.ts: Oops'))
  })

  test('verbose fixed log line uses chalk.green', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines).toContain(chalk.green('  ✓ Fixed 2 violation(s) in a.ts'))
  })

  test('dry-run would-fix log line uses chalk.dim', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines).toContain(chalk.dim('  ○ Would fix 1 violation(s) in a.ts'))
  })

  test('conflict log line uses chalk.yellow', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines).toContain(chalk.yellow('  ⚠ Skipped r1 (conflicts with r2) in a.ts'))
  })

  test('empty conflicts array produces no conflict log even with verbose', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.some((l) => l.includes('Skipped'))).toBe(false)
    expect(logLines.some((l) => l.includes('conflicts'))).toBe(false)
  })

  test('processed with fixes > 0, dry-run=true, verbose=true: would-fix but no filesModified', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }
    const { summary, logLines } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual([])
    expect(summary.totalFixesApplied).toBe(3)
    expect(logLines.some((l) => l.includes('Would fix 3 violation(s)'))).toBe(true)
  })

  test('multiple unchanged files all appear in filesUnchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'unchanged', file: 'a.ts' }),
      makeFixResult({ status: 'unchanged', file: 'b.ts' }),
      makeFixResult({ status: 'unchanged', file: 'c.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesUnchanged).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  test('filesModified order matches result processing order', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'z.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'a.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'm.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['z.ts', 'a.ts', 'm.ts'])
  })

  test('filesUnchanged order matches result processing order', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'unchanged', file: 'z.ts' }),
      makeFixResult({ status: 'unchanged', file: 'a.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesUnchanged).toEqual(['z.ts', 'a.ts'])
  })

  test('processed with fixesSkipped > 0, verbose=false: skipped still counted in summary', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, fixesSkipped: 3, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), verbose: false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.totalFixesSkipped).toBe(3)
  })

  test('error with empty error message still logs', () => {
    const results: FileFixResult[] = [makeFixResult({ status: 'error', error: '', file: 'bad.ts' })]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.some((l) => l.includes('Error processing bad.ts'))).toBe(true)
  })

  test('processed with very large fix count', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 10000, fixesSkipped: 5000, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }
    const { summary, logLines } = aggregateResults(results, flags)
    expect(summary.totalFixesApplied).toBe(10000)
    expect(summary.totalFixesSkipped).toBe(5000)
    expect(logLines.some((l) => l.includes('10000 violation(s)'))).toBe(true)
  })

  test('results with path-like filenames are tracked correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'src/commands/fix.ts' }),
      makeFixResult({ status: 'unchanged', file: 'test/unit/example.test.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['src/commands/fix.ts'])
    expect(summary.filesUnchanged).toEqual(['test/unit/example.test.ts'])
  })

  test('mixed status types in specific order produce correct totals', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'e', file: 'e.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 2, file: 'p.ts' }),
      makeFixResult({ status: 'unchanged', file: 'u.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'p2.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.totalFixesApplied).toBe(3)
    expect(summary.filesModified).toEqual(['p.ts', 'p2.ts'])
    expect(summary.filesUnchanged).toEqual(['u.ts'])
  })

  test('unchanged results produce no logLines even with verbose=true', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'unchanged', file: 'a.ts' }),
      makeFixResult({ status: 'unchanged', file: 'b.ts' }),
    ]
    const flags = { ...defaultFlags(), verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines).toEqual([])
  })

  test('processed with zero fixes but non-empty conflicts and verbose shows conflict logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'a.ts',
        conflicts: [{ ruleId: 'rule-x', conflictingRule: 'rule-y' }],
      }),
    ]
    const flags = { ...defaultFlags(), verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.some((l) => l.includes('Skipped rule-x'))).toBe(true)
  })

  test('error results do not affect fix or skip totals', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'fail', file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'fail', file: 'b.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
  })

  test('aggregate with only error results: logLines count matches error count', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'e1', file: 'a.ts' }),
      makeFixResult({ status: 'error', error: 'e2', file: 'b.ts' }),
      makeFixResult({ status: 'error', error: 'e3', file: 'c.ts' }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.length).toBe(3)
  })

  test('single processed result with fixesApplied=1 aggregates correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'solo.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.totalFixesApplied).toBe(1)
    expect(summary.filesModified).toEqual(['solo.ts'])
    expect(summary.filesUnchanged).toEqual([])
  })

  test('error with null error message logs correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: null, file: 'bad.ts' }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.some((l) => l.includes('Error processing bad.ts: null'))).toBe(true)
  })

  test('error with undefined error message logs correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: undefined, file: 'bad.ts' }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.some((l) => l.includes('Error processing bad.ts: undefined'))).toBe(true)
  })

  test('duplicate file names are tracked separately', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'dup.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'dup.ts' }),
      makeFixResult({ status: 'unchanged', file: 'dup.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['dup.ts', 'dup.ts'])
    expect(summary.filesUnchanged).toEqual(['dup.ts'])
  })

  test('handles very large result set efficiently', () => {
    const results: FileFixResult[] = Array.from({ length: 10000 }, (_, i) =>
      makeFixResult({
        status: i % 2 === 0 ? 'processed' : 'unchanged',
        fixesApplied: i % 2 === 0 ? 1 : 0,
        file: `file${i}.ts`,
      }),
    )
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.totalFixesApplied).toBe(5000)
    expect(summary.filesModified.length).toBe(5000)
    expect(summary.filesUnchanged.length).toBe(5000)
  })

  test('processed with negative fix counts (displays as-is)', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: -5, fixesSkipped: -3, file: 'a.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(-5)
    expect(summary.totalFixesSkipped).toBe(-3)
  })

  test('processed with NaN fix counts (displays as-is)', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: NaN, fixesSkipped: NaN, file: 'a.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(Number.isNaN(summary.totalFixesApplied)).toBe(true)
    expect(Number.isNaN(summary.totalFixesSkipped)).toBe(true)
  })

  test('processed with Infinity fix counts (displays as-is)', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: Infinity,
        fixesSkipped: Infinity,
        file: 'a.ts',
      }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(Infinity)
    expect(summary.totalFixesSkipped).toBe(Infinity)
  })

  test('processed with MAX_SAFE_INTEGER fix counts', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: Number.MAX_SAFE_INTEGER,
        fixesSkipped: Number.MAX_SAFE_INTEGER,
        file: 'a.ts',
      }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(Number.MAX_SAFE_INTEGER)
    expect(summary.totalFixesSkipped).toBe(Number.MAX_SAFE_INTEGER)
  })

  test('error message with special characters', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'error',
        error: 'Error: "test" with \'quotes\' and `ticks`',
        file: 'bad.ts',
      }),
    ]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.some((l) => l.includes('Error processing bad.ts'))).toBe(true)
    expect(logLines.some((l) => l.includes('"test" with \'quotes\' and `ticks`'))).toBe(true)
  })

  test('file path with unicode characters', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: '文件/αβγ.ts' }),
      makeFixResult({ status: 'unchanged', file: '文档/中文.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['文件/αβγ.ts'])
    expect(summary.filesUnchanged).toEqual(['文档/中文.ts'])
  })

  test('file path with newlines and tabs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'path\nwith\nnewlines.ts' }),
      makeFixResult({ status: 'unchanged', file: 'path\twith\ttabs.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified[0]).toBe('path\nwith\nnewlines.ts')
    expect(summary.filesUnchanged[0]).toBe('path\twith\ttabs.ts')
  })

  test('conflict with unicode rule IDs', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'a.ts',
        conflicts: [{ ruleId: '规则-α', conflictingRule: '规则-β' }],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    expect(logLines.some((l) => l.includes('规则-α'))).toBe(true)
    expect(logLines.some((l) => l.includes('规则-β'))).toBe(true)
  })

  test('empty conflicts array with verbose shows no conflict logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    expect(logLines.some((l) => l.includes('conflicts'))).toBe(false)
    expect(logLines.some((l) => l.includes('Skipped'))).toBe(false)
  })

  test('multiple files with same path but different status', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'a.ts' }),
      makeFixResult({ status: 'unchanged', file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['a.ts'])
    expect(summary.filesUnchanged).toEqual(['a.ts'])
  })

  test('processed with fixes=0, dry-run=true, verbose=true shows no logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.length).toBe(0)
  })

  test('processed with fixes=0, dry-run=false, verbose=false shows no logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 0, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: false }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.length).toBe(0)
  })

  test('multiple conflicts in single result all logged when verbose', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'a.ts',
        conflicts: [
          { ruleId: 'r1', conflictingRule: 'r2' },
          { ruleId: 'r3', conflictingRule: 'r4' },
          { ruleId: 'r5', conflictingRule: 'r6' },
        ],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    const conflictLogs = logLines.filter((l) => l.includes('Skipped'))
    expect(conflictLogs.length).toBe(3)
  })

  test('mixed result types preserve correct order in filesModified', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'unchanged', file: 'u1.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'p1.ts' }),
      makeFixResult({ status: 'error', error: 'e', file: 'e1.ts' }),
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'p2.ts' }),
      makeFixResult({ status: 'unchanged', file: 'u2.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified).toEqual(['p1.ts', 'p2.ts'])
  })

  test('mixed result types preserve correct order in filesUnchanged', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'p1.ts' }),
      makeFixResult({ status: 'unchanged', file: 'u1.ts' }),
      makeFixResult({ status: 'error', error: 'e', file: 'e1.ts' }),
      makeFixResult({ status: 'unchanged', file: 'u2.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesUnchanged).toEqual(['u1.ts', 'u2.ts'])
  })

  test('very long file path in results', () => {
    const longPath = 'a'.repeat(10000) + '.ts'
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: longPath }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false }
    const { summary } = aggregateResults(results, flags)
    expect(summary.filesModified[0]).toBe(longPath)
  })

  test('error result does not add to fix counts even with non-zero values in other fields', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'error',
        error: 'fail',
        file: 'bad.ts',
        fixesApplied: 5,
        fixesSkipped: 3,
      }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
  })

  test('processed result with fixes>0 and conflicts shows both log types when verbose', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 2,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: true }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.some((l) => l.includes('Fixed 2 violation(s)'))).toBe(true)
    expect(logLines.some((l) => l.includes('Skipped r1'))).toBe(true)
  })

  test('dry-run with fixes>0, verbose=false produces no logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': true, verbose: false }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.length).toBe(0)
  })

  test('non-dry-run with fixes>0, verbose=false produces no logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3, file: 'a.ts' }),
    ]
    const flags = { ...defaultFlags(), 'dry-run': false, verbose: false }
    const { logLines } = aggregateResults(results, flags)
    expect(logLines.length).toBe(0)
  })

  test('error with empty object still produces log line', () => {
    const results: FileFixResult[] = [makeFixResult({ status: 'error', error: '', file: '' })]
    const { logLines } = aggregateResults(results, defaultFlags())
    expect(logLines.length).toBe(1)
  })

  test('conflict with empty rule IDs logs correctly', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'a.ts',
        conflicts: [{ ruleId: '', conflictingRule: '' }],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    expect(logLines.some((l) => l.includes('Skipped'))).toBe(true)
  })

  test('processed with decimal fix counts (displays as-is)', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 3.5, fixesSkipped: 2.7, file: 'a.ts' }),
    ]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.totalFixesApplied).toBe(3.5)
    expect(summary.totalFixesSkipped).toBe(2.7)
  })

  test('flags with undefined values are handled', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'processed', fixesApplied: 1, file: 'a.ts' }),
    ]
    const flags = {
      ...defaultFlags(),
      config: undefined,
      ignore: undefined,
      rules: undefined,
    }
    const { summary } = aggregateResults(results, flags)
    expect(summary.totalFixesApplied).toBe(1)
  })

  test('empty results array produces empty arrays and zero counts', () => {
    const results: FileFixResult[] = []
    const { summary, logLines } = aggregateResults(results, defaultFlags())
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
    expect(logLines).toEqual([])
  })

  test('single unchanged result with no other results', () => {
    const results: FileFixResult[] = [makeFixResult({ status: 'unchanged', file: 'a.ts' })]
    const { summary } = aggregateResults(results, defaultFlags())
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual(['a.ts'])
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
  })

  test('single error result with no other results', () => {
    const results: FileFixResult[] = [
      makeFixResult({ status: 'error', error: 'oops', file: 'a.ts' }),
    ]
    const { summary, logLines } = aggregateResults(results, defaultFlags())
    expect(summary.filesModified).toEqual([])
    expect(summary.filesUnchanged).toEqual([])
    expect(summary.totalFixesApplied).toBe(0)
    expect(summary.totalFixesSkipped).toBe(0)
    expect(logLines.length).toBe(1)
  })

  test('processed with conflicts but no fixes, verbose=true shows conflict logs', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 0,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const { logLines } = aggregateResults(results, { ...defaultFlags(), verbose: true })
    expect(logLines.some((l) => l.includes('Skipped r1'))).toBe(true)
    expect(logLines.some((l) => l.includes('Fixed'))).toBe(false)
  })

  test('processed with conflicts and fixes, verbose=true shows both log types', () => {
    const results: FileFixResult[] = [
      makeFixResult({
        status: 'processed',
        fixesApplied: 1,
        file: 'a.ts',
        conflicts: [{ ruleId: 'r1', conflictingRule: 'r2' }],
      }),
    ]
    const { logLines } = aggregateResults(results, {
      ...defaultFlags(),
      'dry-run': false,
      verbose: true,
    })
    expect(logLines.some((l) => l.includes('Fixed 1 violation(s)'))).toBe(true)
    expect(logLines.some((l) => l.includes('Skipped r1'))).toBe(true)
  })
})
