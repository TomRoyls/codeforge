import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import chalk from 'chalk'

import type { RuleViolation } from '../../../src/ast/visitor.js'
import type { FixResult } from '../../../src/commands/interactive-helpers.js'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
  readFile: vi.fn(),
  writeFile: vi.fn(),
}))

// ============================================================================
// Imports — after mocks
// ============================================================================

import {
  filterBySeverity,
  formatSeverity,
  displayViolation,
  applyFix,
  formatSummary,
} from '../../../src/commands/interactive-helpers.js'

import * as fs from 'node:fs/promises'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeViolation = (overrides: Partial<RuleViolation> = {}): RuleViolation => ({
  ruleId: 'test-rule',
  severity: 'warning',
  message: 'Test violation',
  filePath: '/test/file.ts',
  range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
  ...overrides,
})

const makeFixResult = (overrides: Partial<FixResult> = {}): FixResult => ({
  applied: 0,
  skipped: 0,
  total: 0,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ============================================================================
// filterBySeverity
// ============================================================================

describe('filterBySeverity', () => {
  test('filters to error only — returns only error severity violations', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(1)
    expect(result[0]!.severity).toBe('error')
  })

  test('filters to warning — returns error + warning violations', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'info', ruleId: 'i1' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
    expect(result.map((v) => v.severity)).toEqual(expect.arrayContaining(['error', 'warning']))
  })

  test('filters to info — returns all violations', () => {
    const violations = [
      makeViolation({ severity: 'error' }),
      makeViolation({ severity: 'warning' }),
      makeViolation({ severity: 'info' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result).toHaveLength(3)
  })

  test('empty array returns empty array', () => {
    const result = filterBySeverity([], 'error')

    expect(result).toEqual([])
  })

  test('all violations above threshold — all pass through', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'error' })]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
  })

  test('all violations below threshold — empty result', () => {
    const violations = [makeViolation({ severity: 'info' }), makeViolation({ severity: 'warning' })]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(0)
  })

  test('mixed severities with error threshold — correct subset', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'error', ruleId: 'e2' }),
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'info', ruleId: 'i1' }),
    ]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(2)
    expect(result.every((v) => v.severity === 'error')).toBe(true)
  })

  test('mixed severities with warning threshold — error and warning only', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'info', ruleId: 'i1' }),
      makeViolation({ severity: 'info', ruleId: 'i2' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
    expect(result.every((v) => v.severity !== 'info')).toBe(true)
  })

  test('preserves violation objects (same references)', () => {
    const errorV = makeViolation({ severity: 'error' })
    const violations = [errorV, makeViolation({ severity: 'info' })]

    const result = filterBySeverity(violations, 'error')

    expect(result[0]).toBe(errorV)
  })

  test('does not mutate the original array', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })]

    filterBySeverity(violations, 'error')

    expect(violations).toHaveLength(2)
  })
})

// ============================================================================
// formatSeverity
// ============================================================================

describe('formatSeverity', () => {
  test('error returns string containing "error"', () => {
    const result = formatSeverity('error')

    expect(result).toContain('error')
  })

  test('error is colored red', () => {
    const result = formatSeverity('error')

    expect(result).toBe(chalk.red('error'))
  })

  test('warning returns string containing "warning"', () => {
    const result = formatSeverity('warning')

    expect(result).toContain('warning')
  })

  test('warning is colored yellow', () => {
    const result = formatSeverity('warning')

    expect(result).toBe(chalk.yellow('warning'))
  })

  test('info returns string containing "info"', () => {
    const result = formatSeverity('info')

    expect(result).toContain('info')
  })

  test('info is colored blue', () => {
    const result = formatSeverity('info')

    expect(result).toBe(chalk.blue('info'))
  })
})

// ============================================================================
// displayViolation
// ============================================================================

describe('displayViolation', () => {
  test('returns an array of strings', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(Array.isArray(result)).toBe(true)
    expect(result.every((l) => typeof l === 'string')).toBe(true)
  })

  test('includes file path and line number', () => {
    const violation = makeViolation({
      filePath: '/src/app.ts',
      range: { start: { line: 42, column: 5 }, end: { line: 42, column: 10 } },
    })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('/src/app.ts')
    expect(joined).toContain('42')
  })

  test('includes rule ID', () => {
    const violation = makeViolation({ ruleId: 'no-console' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('no-console')
  })

  test('includes severity', () => {
    const violation = makeViolation({ severity: 'error' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('error')
  })

  test('includes message', () => {
    const violation = makeViolation({ message: 'Unexpected console statement' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('Unexpected console statement')
  })

  test('verbose=true with suggestion — includes suggestion line', () => {
    const violation = makeViolation({ suggestion: 'Remove console.log' })

    const result = displayViolation(violation, 0, 1, true)
    const joined = result.join('\n')

    expect(joined).toContain('Remove console.log')
  })

  test('verbose=true without suggestion — no suggestion line', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, true)

    expect(result.some((l) => l.includes('Suggestion:'))).toBe(false)
  })

  test('verbose=false with suggestion — no suggestion line', () => {
    const violation = makeViolation({ suggestion: 'Use const instead' })

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes('Use const instead'))).toBe(false)
    expect(result.some((l) => l.includes('Suggestion:'))).toBe(false)
  })

  test('index and total appear as "Violation N/M" format', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 2, 5, false)
    const joined = result.join('\n')

    expect(joined).toContain('3/5')
  })

  test('index=0 total=1 shows "Violation 1/1"', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes('1/1'))).toBe(true)
  })

  test('contains "File:" label', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('File:')
  })

  test('contains "Rule:" label', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('Rule:')
  })

  test('contains "Severity:" label', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('Severity:')
  })

  test('contains "Message:" label', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('Message:')
  })

  test('last element is empty string', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result[result.length - 1]).toBe('')
  })

  test('first element is empty string', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result[0]).toBe('')
  })

  test('verbose suggestion includes green "Suggestion:" label', () => {
    const violation = makeViolation({ suggestion: 'Fix it' })

    const result = displayViolation(violation, 0, 1, true)

    expect(result.some((l) => l.includes(chalk.green('Suggestion:')))).toBe(true)
  })
})

// ============================================================================
// applyFix
// ============================================================================

describe('applyFix', () => {
  test('no suggestion — returns false without reading file', async () => {
    const violation = makeViolation()

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.readFile).not.toHaveBeenCalled()
  })

  test('valid fix with correct line index — returns true and writes modified content', async () => {
    const originalContent = 'line1\nline2\nline3'
    vi.mocked(fs.readFile).mockResolvedValue(originalContent)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fixed line2',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 6 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.readFile).toHaveBeenCalledWith('/test/file.ts', 'utf8')
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'line1\nfixed line2\nline3', 'utf8')
  })

  test('suggestion replaces correct line in file', async () => {
    const originalContent = 'import foo\nconst x = 1\nexport default x'
    vi.mocked(fs.readFile).mockResolvedValue(originalContent)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'const x = 2',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 11 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]![1] as string
    const lines = writtenContent.split('\n')
    expect(lines[1]).toBe('const x = 2')
  })

  test('line index negative — returns false', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content')

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 0, column: 1 }, end: { line: 0, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('line index >= lines.length — returns false', async () => {
    const content = 'only one line'
    vi.mocked(fs.readFile).mockResolvedValue(content)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 5, column: 1 }, end: { line: 5, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('file read error — returns false', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT: file not found'))

    const violation = makeViolation({ suggestion: 'fix' })

    const result = await applyFix('/missing/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('file write error — returns false', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('line1\nline2')
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('EACCES: permission denied'))

    const violation = makeViolation({
      suggestion: 'fixed',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })

    const result = await applyFix('/readonly/file.ts', violation)

    expect(result).toBe(false)
  })

  test('fix on first line (line=1, index=0)', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('first line\nsecond line')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'replaced first',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/test/file.ts',
      'replaced first\nsecond line',
      'utf8',
    )
  })

  test('fix on last line', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('line1\nline2\nline3')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'replaced line3',
      range: { start: { line: 3, column: 1 }, end: { line: 3, column: 5 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/test/file.ts',
      'line1\nline2\nreplaced line3',
      'utf8',
    )
  })

  test('single line file — replaces the only line', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('only line')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'new only line',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 9 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'new only line', 'utf8')
  })

  test('line exactly at boundary (line = lines.length) — returns false', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('a\nb\nc')

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 4, column: 1 }, end: { line: 4, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
  })

  test('file read error is caught and returns false (not thrown)', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('disk error'))

    const violation = makeViolation({ suggestion: 'fix' })

    await expect(applyFix('/test/file.ts', violation)).resolves.toBe(false)
  })

  test('empty file with line=1 — index 0 >= lines.length (0) → returns false', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('')

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
  })
})

// ============================================================================
// formatSummary
// ============================================================================

describe('formatSummary', () => {
  test('returns array of strings', () => {
    const result = formatSummary(makeFixResult())

    expect(Array.isArray(result)).toBe(true)
    expect(result.every((l) => typeof l === 'string')).toBe(true)
  })

  test('includes applied count', () => {
    const result = formatSummary(makeFixResult({ applied: 5 }))

    const joined = result.join('\n')
    expect(joined).toContain('5')
  })

  test('includes skipped count', () => {
    const result = formatSummary(makeFixResult({ skipped: 3 }))

    const joined = result.join('\n')
    expect(joined).toContain('3')
  })

  test('includes total count', () => {
    const result = formatSummary(makeFixResult({ total: 10 }))

    const joined = result.join('\n')
    expect(joined).toContain('10')
  })

  test('zero values show "0"', () => {
    const result = formatSummary(makeFixResult({ applied: 0, skipped: 0, total: 0 }))

    const joined = result.join('\n')
    expect(joined).toContain('Applied:')
    expect(joined).toContain('Skipped:')
    expect(joined).toContain('Total:')
  })

  test('includes "Summary:" header', () => {
    const result = formatSummary(makeFixResult())

    const joined = result.join('\n')
    expect(joined).toContain('Summary:')
  })

  test('first element is empty string', () => {
    const result = formatSummary(makeFixResult())

    expect(result[0]).toBe('')
  })

  test('last element is empty string', () => {
    const result = formatSummary(makeFixResult())

    expect(result[result.length - 1]).toBe('')
  })

  test('contains "Applied:" label with green coloring', () => {
    const result = formatSummary(makeFixResult({ applied: 2 }))

    expect(result.some((l) => l.includes('Applied:'))).toBe(true)
    expect(result.some((l) => l.includes(chalk.green('2')))).toBe(true)
  })

  test('contains "Skipped:" label with yellow coloring', () => {
    const result = formatSummary(makeFixResult({ skipped: 1 }))

    expect(result.some((l) => l.includes('Skipped:'))).toBe(true)
    expect(result.some((l) => l.includes(chalk.yellow('1')))).toBe(true)
  })

  test('contains "Total:" label', () => {
    const result = formatSummary(makeFixResult({ total: 7 }))

    expect(result.some((l) => l.includes('Total:'))).toBe(true)
    expect(result.some((l) => l.includes('7'))).toBe(true)
  })

  test('Summary: label is bold', () => {
    const result = formatSummary(makeFixResult())

    expect(result.some((l) => l.includes(chalk.bold('Summary:')))).toBe(true)
  })

  test('returns correct number of lines', () => {
    const result = formatSummary(makeFixResult())

    expect(result).toHaveLength(6)
  })

  test('large values are displayed correctly', () => {
    const result = formatSummary(makeFixResult({ applied: 999, skipped: 500, total: 1499 }))

    const joined = result.join('\n')
    expect(joined).toContain('999')
    expect(joined).toContain('500')
    expect(joined).toContain('1499')
  })
})

// ============================================================================
// filterBySeverity — additional coverage
// ============================================================================

describe('filterBySeverity — additional coverage', () => {
  test('single error violation with error threshold — returns it', () => {
    const violations = [makeViolation({ severity: 'error', ruleId: 'e1' })]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(1)
    expect(result[0]!.ruleId).toBe('e1')
  })

  test('single info violation with error threshold — returns empty', () => {
    const violations = [makeViolation({ severity: 'info', ruleId: 'i1' })]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(0)
  })

  test('all info violations with warning threshold — returns empty', () => {
    const violations = [
      makeViolation({ severity: 'info', ruleId: 'i1' }),
      makeViolation({ severity: 'info', ruleId: 'i2' }),
      makeViolation({ severity: 'info', ruleId: 'i3' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(0)
  })

  test('duplicate severities — preserves all matching', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'error', ruleId: 'e2' }),
      makeViolation({ severity: 'error', ruleId: 'e3' }),
    ]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(3)
  })

  test('all same severity (warning) with warning threshold — all pass', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'warning', ruleId: 'w2' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
  })

  test('all same severity (info) with info threshold — all pass', () => {
    const violations = [
      makeViolation({ severity: 'info', ruleId: 'i1' }),
      makeViolation({ severity: 'info', ruleId: 'i2' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result).toHaveLength(2)
  })

  test('large array of violations — filters correctly', () => {
    const violations = Array.from({ length: 100 }, (_, i) =>
      makeViolation({ severity: i % 2 === 0 ? 'error' : 'info', ruleId: `r${i}` }),
    )

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(50)
    expect(result.every((v) => v.severity === 'error')).toBe(true)
  })

  test('result maintains original relative order', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'first' }),
      makeViolation({ severity: 'info', ruleId: 'skip' }),
      makeViolation({ severity: 'warning', ruleId: 'second' }),
      makeViolation({ severity: 'info', ruleId: 'skip2' }),
      makeViolation({ severity: 'warning', ruleId: 'third' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result.map((v) => v.ruleId)).toEqual(['first', 'second', 'third'])
  })

  test('does not modify violation objects within the array', () => {
    const v1 = makeViolation({ severity: 'error', ruleId: 'orig' })
    const violations = [v1]

    filterBySeverity(violations, 'error')

    expect(v1.ruleId).toBe('orig')
    expect(v1.severity).toBe('error')
  })

  test('error threshold excludes warnings', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'warning', ruleId: 'w2' }),
    ]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(0)
  })

  test('info threshold includes error and warning', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result).toHaveLength(2)
  })

  test('returns new array reference', () => {
    const violations = [makeViolation({ severity: 'error' })]

    const result = filterBySeverity(violations, 'error')

    expect(result).not.toBe(violations)
  })
})

// ============================================================================
// formatSeverity — additional coverage
// ============================================================================

describe('formatSeverity — additional coverage', () => {
  test('error result matches chalk.red("error")', () => {
    const result = formatSeverity('error')

    expect(result).toBe(chalk.red('error'))
  })

  test('warning result matches chalk.yellow("warning")', () => {
    const result = formatSeverity('warning')

    expect(result).toBe(chalk.yellow('warning'))
  })

  test('info result matches chalk.blue("info")', () => {
    const result = formatSeverity('info')

    expect(result).toBe(chalk.blue('info'))
  })

  test('error result contains the text "error"', () => {
    const result = formatSeverity('error')

    expect(result).toContain('error')
  })

  test('warning result contains the text "warning"', () => {
    const result = formatSeverity('warning')

    expect(result).toContain('warning')
  })

  test('info result contains the text "info"', () => {
    const result = formatSeverity('info')

    expect(result).toContain('info')
  })
})

// ============================================================================
// displayViolation — additional coverage
// ============================================================================

describe('displayViolation — additional coverage', () => {
  test('violation header is bold', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.bold('Violation 1/1')))).toBe(true)
  })

  test('contains dash separator', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes('─'))).toBe(true)
  })

  test('dash separator is gray', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.gray('─')))).toBe(true)
  })

  test('file label is red', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.red('File:')))).toBe(true)
  })

  test('rule label is red', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.red('Rule:')))).toBe(true)
  })

  test('severity label is red', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.red('Severity:')))).toBe(true)
  })

  test('message label is red', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.red('Message:')))).toBe(true)
  })

  test('complex file path is displayed correctly', () => {
    const violation = makeViolation({ filePath: '/deeply/nested/path/to/module.ts' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('/deeply/nested/path/to/module.ts')
  })

  test('line 999 is displayed in output', () => {
    const violation = makeViolation({
      range: { start: { line: 999, column: 1 }, end: { line: 999, column: 5 } },
    })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('999')
  })

  test('message with special characters renders correctly', () => {
    const violation = makeViolation({ message: 'Use `const` instead of "let"' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('Use `const` instead of "let"')
  })

  test('message with unicode characters renders correctly', () => {
    const violation = makeViolation({ message: 'Avoid using → operator' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('Avoid using → operator')
  })

  test('ruleId with special characters renders correctly', () => {
    const violation = makeViolation({ ruleId: 'no-eval/strict' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('no-eval/strict')
  })

  test('high index number — violation 100/200', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 99, 200, false)
    const joined = result.join('\n')

    expect(joined).toContain('100/200')
  })

  test('verbose with empty suggestion string — no suggestion shown', () => {
    const violation = makeViolation({ suggestion: '' })

    const result = displayViolation(violation, 0, 1, true)

    expect(result.some((l) => l.includes('Suggestion:'))).toBe(false)
  })

  test('verbose with non-empty suggestion — shows suggestion content', () => {
    const violation = makeViolation({ suggestion: 'Replace with const' })

    const result = displayViolation(violation, 0, 1, true)
    const joined = result.join('\n')

    expect(joined).toContain('Replace with const')
  })

  test('error severity displayed with correct colorization', () => {
    const violation = makeViolation({ severity: 'error' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain(chalk.red('error'))
  })

  test('warning severity displayed with correct colorization', () => {
    const violation = makeViolation({ severity: 'warning' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain(chalk.yellow('warning'))
  })

  test('info severity displayed with correct colorization', () => {
    const violation = makeViolation({ severity: 'info' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain(chalk.blue('info'))
  })

  test('output lines are indented with two spaces', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    // Non-empty lines (except first/last which are '') should be indented
    const contentLines = result.filter((l) => l.length > 0)
    expect(contentLines.every((l) => l.startsWith('  '))).toBe(true)
  })

  test('different violations produce different output', () => {
    const v1 = makeViolation({ ruleId: 'rule-a', message: 'msg a' })
    const v2 = makeViolation({ ruleId: 'rule-b', message: 'msg b' })

    const r1 = displayViolation(v1, 0, 1, false)
    const r2 = displayViolation(v2, 0, 1, false)

    expect(r1).not.toEqual(r2)
  })

  test('suggestion line is indented with two spaces', () => {
    const violation = makeViolation({ suggestion: 'Fix it' })

    const result = displayViolation(violation, 0, 1, true)

    const suggestionLine = result.find((l) => l.includes('Suggestion:'))
    expect(suggestionLine).toBeDefined()
    expect(suggestionLine!.startsWith('  ')).toBe(true)
  })
})

// ============================================================================
// applyFix — additional coverage
// ============================================================================

describe('applyFix — additional coverage', () => {
  test('suggestion as empty string — returns false', async () => {
    const violation = makeViolation({ suggestion: '' })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.readFile).not.toHaveBeenCalled()
  })

  test('suggestion as whitespace string — proceeds (truthy)', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('line1\nline2')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: '   ',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.readFile).toHaveBeenCalled()
  })

  test('multi-line file — fix in the middle', async () => {
    const content = 'a\nb\nc\nd\ne'
    vi.mocked(fs.readFile).mockResolvedValue(content)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'FIXED',
      range: { start: { line: 3, column: 1 }, end: { line: 3, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'a\nb\nFIXED\nd\ne', 'utf8')
  })

  test('suggestion with special characters', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('original')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'const → "hello" & <world>',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'const → "hello" & <world>', 'utf8')
  })

  test('suggestion that matches original line — still writes', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('same line\nother')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'same line',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 9 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
  })

  test('suggestion completely different from original', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('old\nline2')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'completely new content here',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 3 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/test/file.ts',
      'completely new content here\nline2',
      'utf8',
    )
  })

  test('file with only newlines — fix on line 1', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('\n\n\n')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fixed',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'fixed\n\n\n', 'utf8')
  })

  test('fix on second line of two-line file', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('first\nsecond')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'SECOND',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 6 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'first\nSECOND', 'utf8')
  })

  test('readFile is called with utf8 encoding', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    await applyFix('/test/file.ts', violation)

    expect(fs.readFile).toHaveBeenCalledWith('/test/file.ts', 'utf8')
  })

  test('writeFile is called with utf8 encoding', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('original')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } },
    })

    await applyFix('/test/file.ts', violation)

    expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf8')
  })

  test('different file paths are passed correctly to readFile', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    await applyFix('/custom/path/to/file.ts', violation)

    expect(fs.readFile).toHaveBeenCalledWith('/custom/path/to/file.ts', 'utf8')
  })

  test('line index at exact boundary — line=1 with single-line file succeeds', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('only line')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'replaced',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 9 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
  })

  test('line=2 on single-line file — returns false', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('only line')

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('returns promise that resolves to boolean', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('line1')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })

    const promise = applyFix('/test/file.ts', violation)

    expect(promise).toBeInstanceOf(Promise)
    const result = await promise
    expect(typeof result).toBe('boolean')
  })

  test('file with trailing newline content', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('line1\nline2\n')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'LINE1',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'LINE1\nline2\n', 'utf8')
  })

  test('suggestion with emoji characters', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('original')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: '✅ fixed',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', '✅ fixed', 'utf8')
  })

  test('writeFile receives the exact path passed to applyFix', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('original')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } },
    })

    await applyFix('/exact/path.ts', violation)

    expect(fs.writeFile).toHaveBeenCalledWith('/exact/path.ts', expect.any(String), 'utf8')
  })

  test('undefined suggestion (no field) — returns false', async () => {
    const violation = makeViolation()

    // suggestion is not set, so it's undefined
    expect(violation.suggestion).toBeUndefined()

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.readFile).not.toHaveBeenCalled()
  })
})

// ============================================================================
// formatSummary — additional coverage
// ============================================================================

describe('formatSummary — additional coverage', () => {
  test('second line is bold "Summary:"', () => {
    const result = formatSummary(makeFixResult())

    expect(result[1]).toContain(chalk.bold('Summary:'))
  })

  test('applied value uses green coloring', () => {
    const result = formatSummary(makeFixResult({ applied: 3 }))

    const appliedLine = result.find((l) => l.includes('Applied:'))
    expect(appliedLine).toBeDefined()
    expect(appliedLine!.includes(chalk.green('3'))).toBe(true)
  })

  test('skipped value uses yellow coloring', () => {
    const result = formatSummary(makeFixResult({ skipped: 4 }))

    const skippedLine = result.find((l) => l.includes('Skipped:'))
    expect(skippedLine).toBeDefined()
    expect(skippedLine!.includes(chalk.yellow('4'))).toBe(true)
  })

  test('total value is displayed as plain number', () => {
    const result = formatSummary(makeFixResult({ total: 5 }))

    const totalLine = result.find((l) => l.includes('Total:'))
    expect(totalLine).toBeDefined()
    expect(totalLine!.includes('5')).toBe(true)
    expect(totalLine!.includes('Total:')).toBe(true)
  })

  test('applied=0 shows green "0"', () => {
    const result = formatSummary(makeFixResult({ applied: 0 }))

    const appliedLine = result.find((l) => l.includes('Applied:'))
    expect(appliedLine).toBeDefined()
    expect(appliedLine!.includes(chalk.green('0'))).toBe(true)
  })

  test('skipped=0 shows yellow "0"', () => {
    const result = formatSummary(makeFixResult({ skipped: 0 }))

    const skippedLine = result.find((l) => l.includes('Skipped:'))
    expect(skippedLine).toBeDefined()
    expect(skippedLine!.includes(chalk.yellow('0'))).toBe(true)
  })

  test('total=0 shows plain "0"', () => {
    const result = formatSummary(makeFixResult({ total: 0 }))

    const totalLine = result.find((l) => l.includes('Total:'))
    expect(totalLine).toBeDefined()
    expect(totalLine!.includes('0')).toBe(true)
  })

  test('values with applied=1 shows single digit', () => {
    const result = formatSummary(makeFixResult({ applied: 1 }))

    const joined = result.join('\n')
    expect(joined).toContain(chalk.green('1'))
  })

  test('applied=100 shows "100" in green', () => {
    const result = formatSummary(makeFixResult({ applied: 100 }))

    const appliedLine = result.find((l) => l.includes('Applied:'))
    expect(appliedLine!.includes(chalk.green('100'))).toBe(true)
  })

  test('skipped=100 shows "100" in yellow', () => {
    const result = formatSummary(makeFixResult({ skipped: 100 }))

    const skippedLine = result.find((l) => l.includes('Skipped:'))
    expect(skippedLine!.includes(chalk.yellow('100'))).toBe(true)
  })

  test('order of fields: Applied before Skipped before Total', () => {
    const result = formatSummary(makeFixResult({ applied: 1, skipped: 2, total: 3 }))

    const joined = result.join('\n')
    const appliedIdx = joined.indexOf('Applied:')
    const skippedIdx = joined.indexOf('Skipped:')
    const totalIdx = joined.indexOf('Total:')

    expect(appliedIdx).toBeLessThan(skippedIdx)
    expect(skippedIdx).toBeLessThan(totalIdx)
  })

  test('value lines are indented with four spaces (two + two)', () => {
    const result = formatSummary(makeFixResult())

    const appliedLine = result.find((l) => l.includes('Applied:'))
    const skippedLine = result.find((l) => l.includes('Skipped:'))
    const totalLine = result.find((l) => l.includes('Total:'))

    expect(appliedLine).toBeDefined()
    expect(skippedLine).toBeDefined()
    expect(totalLine).toBeDefined()
    // Lines should be indented (start with spaces)
    expect(appliedLine!.startsWith('    ')).toBe(true)
    expect(skippedLine!.startsWith('    ')).toBe(true)
    expect(totalLine!.startsWith('    ')).toBe(true)
  })

  test('total=1 shows plain "1"', () => {
    const result = formatSummary(makeFixResult({ total: 1 }))

    const totalLine = result.find((l) => l.includes('Total:'))
    expect(totalLine).toBeDefined()
    expect(totalLine!.includes('1')).toBe(true)
  })

  test('all zero values render without errors', () => {
    const result = formatSummary(makeFixResult({ applied: 0, skipped: 0, total: 0 }))

    expect(result).toHaveLength(6)
    const joined = result.join('\n')
    expect(joined).toContain('Applied:')
    expect(joined).toContain('Skipped:')
    expect(joined).toContain('Total:')
  })

  test('applied line contains the word "Applied:" with colon', () => {
    const result = formatSummary(makeFixResult({ applied: 7 }))

    const appliedLine = result.find((l) => l.includes('Applied:'))
    expect(appliedLine).toBeDefined()
    expect(appliedLine!.includes(':')).toBe(true)
  })

  test('skipped line contains the word "Skipped:" with colon', () => {
    const result = formatSummary(makeFixResult({ skipped: 8 }))

    const skippedLine = result.find((l) => l.includes('Skipped:'))
    expect(skippedLine).toBeDefined()
    expect(skippedLine!.includes(':')).toBe(true)
  })

  test('total line contains the word "Total:" with colon', () => {
    const result = formatSummary(makeFixResult({ total: 9 }))

    const totalLine = result.find((l) => l.includes('Total:'))
    expect(totalLine).toBeDefined()
    expect(totalLine!.includes(':')).toBe(true)
  })

  test('Summary line is the second line in output', () => {
    const result = formatSummary(makeFixResult())

    expect(result[1]).toContain('Summary:')
  })

  test('result is a fresh array each call', () => {
    const r1 = formatSummary(makeFixResult())
    const r2 = formatSummary(makeFixResult())

    expect(r1).not.toBe(r2)
  })

  test('applied and skipped values can be equal', () => {
    const result = formatSummary(makeFixResult({ applied: 5, skipped: 5, total: 10 }))

    const joined = result.join('\n')
    expect(joined).toContain(chalk.green('5'))
    expect(joined).toContain(chalk.yellow('5'))
  })

  test('very large total renders correctly', () => {
    const result = formatSummary(makeFixResult({ total: 1000000 }))

    const totalLine = result.find((l) => l.includes('Total:'))
    expect(totalLine).toBeDefined()
    expect(totalLine!.includes('1000000')).toBe(true)
  })
})

// ============================================================================
// filterBySeverity — edge cases
// ============================================================================

describe('filterBySeverity — edge cases', () => {
  test('array with one of each severity filtered by info returns all three', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e' }),
      makeViolation({ severity: 'warning', ruleId: 'w' }),
      makeViolation({ severity: 'info', ruleId: 'i' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result).toHaveLength(3)
  })

  test('array with one of each severity filtered by warning returns two', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'e' }),
      makeViolation({ severity: 'warning', ruleId: 'w' }),
      makeViolation({ severity: 'info', ruleId: 'i' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
    const severities = result.map((v) => v.severity)
    expect(severities).toContain('error')
    expect(severities).toContain('warning')
    expect(severities).not.toContain('info')
  })

  test('single warning with error threshold returns empty', () => {
    const violations = [makeViolation({ severity: 'warning' })]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(0)
  })

  test('single info with warning threshold returns empty', () => {
    const violations = [makeViolation({ severity: 'info' })]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(0)
  })

  test('alternating error and info violations filtered by error', () => {
    const violations = Array.from({ length: 10 }, (_, i) =>
      makeViolation({ severity: i % 2 === 0 ? 'error' : 'info', ruleId: `r${i}` }),
    )

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(5)
    expect(result.every((v) => v.severity === 'error')).toBe(true)
  })

  test('two-element array [warning, error] filtered by warning returns both', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'error', ruleId: 'e1' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result).toHaveLength(2)
  })

  test('array of identical objects filtered correctly', () => {
    const base = makeViolation({ severity: 'error', ruleId: 'same' })
    const violations = [base, base, base]

    const result = filterBySeverity(violations, 'error')

    expect(result).toHaveLength(3)
  })
})

// ============================================================================
// displayViolation — boundary and edge cases
// ============================================================================

describe('displayViolation — boundary and edge cases', () => {
  test('column numbers are not shown in output', () => {
    const violation = makeViolation({
      range: { start: { line: 5, column: 99 }, end: { line: 5, column: 200 } },
    })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('5')
  })

  test('long file path is fully included', () => {
    const longPath =
      '/very/long/nested/directory/structure/that/goes/on/and/on/src/components/features/dashboard/widgets/chart.ts'
    const violation = makeViolation({ filePath: longPath })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain(longPath)
  })

  test('line 1 with column 1 displays correctly', () => {
    const violation = makeViolation({
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain(':1')
  })

  test('index 0 total 100 shows "Violation 1/100"', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 100, false)

    expect(result.some((l) => l.includes('1/100'))).toBe(true)
  })

  test('index 99 total 100 shows "Violation 100/100"', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 99, 100, false)

    expect(result.some((l) => l.includes('100/100'))).toBe(true)
  })

  test('verbose=false always omits suggestion even when present', () => {
    const violation = makeViolation({ suggestion: 'This should not appear' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).not.toContain('This should not appear')
  })

  test('message with newlines is rendered in output', () => {
    const violation = makeViolation({ message: 'Line 1\nLine 2' })

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes('Line 1'))).toBe(true)
  })

  test('ruleId with dots renders correctly', () => {
    const violation = makeViolation({ ruleId: 'security.no-eval.strict' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('security.no-eval.strict')
  })

  test('verbose with long suggestion text renders completely', () => {
    const longSuggestion =
      'Replace the entire function body with a more efficient algorithm that uses memoization'
    const violation = makeViolation({ suggestion: longSuggestion })

    const result = displayViolation(violation, 0, 1, true)
    const joined = result.join('\n')

    expect(joined).toContain(longSuggestion)
  })

  test('multiple calls with same input produce identical output', () => {
    const violation = makeViolation({ ruleId: 'consistent-test' })

    const r1 = displayViolation(violation, 0, 1, false)
    const r2 = displayViolation(violation, 0, 1, false)

    expect(r1).toEqual(r2)
  })

  test('output contains the severity value as a word', () => {
    const violation = makeViolation({ severity: 'warning' })

    const result = displayViolation(violation, 0, 1, false)
    const joined = result.join('\n')

    expect(joined).toContain('warning')
  })

  test('error severity in displayViolation is colored red', () => {
    const violation = makeViolation({ severity: 'error' })

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.red('error')))).toBe(true)
  })

  test('warning severity in displayViolation is colored yellow', () => {
    const violation = makeViolation({ severity: 'warning' })

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.yellow('warning')))).toBe(true)
  })

  test('info severity in displayViolation is colored blue', () => {
    const violation = makeViolation({ severity: 'info' })

    const result = displayViolation(violation, 0, 1, false)

    expect(result.some((l) => l.includes(chalk.blue('info')))).toBe(true)
  })

  test('dash separator has width 40', () => {
    const violation = makeViolation()

    const result = displayViolation(violation, 0, 1, false)

    const dashLine = result.find((l) => l.includes('─'))
    expect(dashLine).toBeDefined()
    const dashes = dashLine!.match(/─/g)
    expect(dashes).toHaveLength(40)
  })
})

// ============================================================================
// applyFix — boundary and edge cases
// ============================================================================

describe('applyFix — boundary and edge cases', () => {
  test('file with Windows-style CRLF line endings', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('line1\r\nline2\r\nline3')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'FIXED',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 5 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]![1] as string
    expect(writtenContent).toContain('FIXED')
  })

  test('file with many lines — fix near end', async () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line${i + 1}`)
    vi.mocked(fs.readFile).mockResolvedValue(lines.join('\n'))
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fixed-line99',
      range: { start: { line: 99, column: 1 }, end: { line: 99, column: 8 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]![1] as string
    const writtenLines = writtenContent.split('\n')
    expect(writtenLines[98]).toBe('fixed-line99')
  })

  test('file with many lines — fix at very last line', async () => {
    const lines = Array.from({ length: 50 }, (_, i) => `line${i + 1}`)
    vi.mocked(fs.readFile).mockResolvedValue(lines.join('\n'))
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fixed-last',
      range: { start: { line: 50, column: 1 }, end: { line: 50, column: 6 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]![1] as string
    const writtenLines = writtenContent.split('\n')
    expect(writtenLines[49]).toBe('fixed-last')
  })

  test('readFile called exactly once on success', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content\nmore')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    await applyFix('/test/file.ts', violation)

    expect(fs.readFile).toHaveBeenCalledTimes(1)
  })

  test('writeFile called exactly once on success', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content\nmore')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    await applyFix('/test/file.ts', violation)

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })

  test('writeFile not called when readFile fails', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('read error'))

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 3 } },
    })

    await applyFix('/test/file.ts', violation)

    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  test('suggestion replaces entire line content', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('short\nother')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'this is a much longer replacement line',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/test/file.ts',
      'this is a much longer replacement line\nother',
      'utf8',
    )
  })

  test('line index 0 (line=1) is valid for non-empty file', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('first\nsecond')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'new first',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
  })

  test('file with content containing backticks', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('const msg = `hello ${name}`')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'const msg = `hi ${name}`',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 27 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', 'const msg = `hi ${name}`', 'utf8')
  })

  test('ENOENT error code is handled gracefully', async () => {
    const error = new Error('ENOENT') as Error & { code: string }
    error.code = 'ENOENT'
    vi.mocked(fs.readFile).mockRejectedValue(error)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    })

    const result = await applyFix('/nonexistent.ts', violation)

    expect(result).toBe(false)
  })

  test('EACCES permission error is handled gracefully', async () => {
    const error = new Error('EACCES') as Error & { code: string }
    error.code = 'EACCES'
    vi.mocked(fs.readFile).mockResolvedValue('content')
    vi.mocked(fs.writeFile).mockRejectedValue(error)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    const result = await applyFix('/no-permission.ts', violation)

    expect(result).toBe(false)
  })

  test('suggestion with tab characters', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('original')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: '\tindented\twith\ttabs',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', '\tindented\twith\ttabs', 'utf8')
  })

  test('suggestion with multibyte unicode characters', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('original')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: '日本語テスト 🎉🎉🎉',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledWith('/test/file.ts', '日本語テスト 🎉🎉🎉', 'utf8')
  })

  test('fix does not modify non-target lines', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('keep1\ntarget\nkeep3')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'REPLACED',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 6 } },
    })

    await applyFix('/test/file.ts', violation)

    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]![1] as string
    const writtenLines = writtenContent.split('\n')
    expect(writtenLines[0]).toBe('keep1')
    expect(writtenLines[2]).toBe('keep3')
  })

  test('empty file content results in empty array of lines', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('')

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 1 } },
    })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
  })

  test('multiple sequential calls work correctly', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('a\nb\nc')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const v1 = makeViolation({
      suggestion: 'A',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    })
    const v2 = makeViolation({
      suggestion: 'B',
      range: { start: { line: 2, column: 1 }, end: { line: 2, column: 1 } },
    })

    const r1 = await applyFix('/test/file.ts', v1)
    const r2 = await applyFix('/test/file.ts', v2)

    expect(r1).toBe(true)
    expect(r2).toBe(true)
    expect(fs.writeFile).toHaveBeenCalledTimes(2)
  })

  test('file path with spaces works correctly', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    const result = await applyFix('/path with spaces/file name.ts', violation)

    expect(result).toBe(true)
    expect(fs.readFile).toHaveBeenCalledWith('/path with spaces/file name.ts', 'utf8')
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/path with spaces/file name.ts',
      expect.any(String),
      'utf8',
    )
  })

  test('file path with unicode characters works', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    const result = await applyFix('/プロジェクト/ファイル.ts', violation)

    expect(result).toBe(true)
    expect(fs.readFile).toHaveBeenCalledWith('/プロジェクト/ファイル.ts', 'utf8')
  })
})

// ============================================================================
// formatSeverity — boundary and edge cases
// ============================================================================

describe('formatSeverity — boundary and edge cases', () => {
  test('calling formatSeverity multiple times returns consistent results', () => {
    const r1 = formatSeverity('error')
    const r2 = formatSeverity('error')
    const r3 = formatSeverity('error')

    expect(r1).toBe(r2)
    expect(r2).toBe(r3)
  })

  test('all three severity levels produce distinct output', () => {
    const errorResult = formatSeverity('error')
    const warningResult = formatSeverity('warning')
    const infoResult = formatSeverity('info')

    expect(errorResult).not.toBe(warningResult)
    expect(warningResult).not.toBe(infoResult)
    expect(errorResult).not.toBe(infoResult)
  })

  test('error result is a non-empty string', () => {
    expect(formatSeverity('error').length).toBeGreaterThan(0)
  })

  test('warning result is a non-empty string', () => {
    expect(formatSeverity('warning').length).toBeGreaterThan(0)
  })

  test('info result is a non-empty string', () => {
    expect(formatSeverity('info').length).toBeGreaterThan(0)
  })

  test('error output contains the word error as substring', () => {
    const result = formatSeverity('error')

    expect(result.includes('error')).toBe(true)
  })

  test('warning output contains the word warning as substring', () => {
    const result = formatSeverity('warning')

    expect(result.includes('warning')).toBe(true)
  })

  test('info output contains the word info as substring', () => {
    const result = formatSeverity('info')

    expect(result.includes('info')).toBe(true)
  })
})

// ============================================================================
// filterBySeverity — ordering and immutability
// ============================================================================

describe('filterBySeverity — ordering and immutability', () => {
  test('result order matches input order for error+warning mix', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'w1' }),
      makeViolation({ severity: 'error', ruleId: 'e1' }),
      makeViolation({ severity: 'warning', ruleId: 'w2' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result.map((v) => v.ruleId)).toEqual(['w1', 'e1', 'w2'])
  })

  test('filtering does not change result length property', () => {
    const violations = [makeViolation({ severity: 'error' }), makeViolation({ severity: 'info' })]

    const result = filterBySeverity(violations, 'error')

    expect(typeof result.length).toBe('number')
    expect(result.length).toBe(1)
  })

  test('warning threshold includes both errors and warnings in order', () => {
    const violations = [
      makeViolation({ severity: 'error', ruleId: 'first' }),
      makeViolation({ severity: 'info', ruleId: 'second' }),
      makeViolation({ severity: 'warning', ruleId: 'third' }),
    ]

    const result = filterBySeverity(violations, 'warning')

    expect(result.map((v) => v.ruleId)).toEqual(['first', 'third'])
  })

  test('info threshold preserves full input order', () => {
    const violations = [
      makeViolation({ severity: 'warning', ruleId: 'a' }),
      makeViolation({ severity: 'error', ruleId: 'b' }),
      makeViolation({ severity: 'info', ruleId: 'c' }),
    ]

    const result = filterBySeverity(violations, 'info')

    expect(result.map((v) => v.ruleId)).toEqual(['a', 'b', 'c'])
  })
})

// ============================================================================
// displayViolation — verbose mode behavior
// ============================================================================

describe('displayViolation — verbose mode behavior', () => {
  test('verbose mode adds exactly one line for suggestion', () => {
    const noSuggestion = displayViolation(makeViolation(), 0, 1, true)
    const withSuggestion = displayViolation(makeViolation({ suggestion: 'Fix it' }), 0, 1, true)

    expect(withSuggestion.length).toBe(noSuggestion.length + 1)
  })

  test('non-verbose mode has same line count regardless of suggestion', () => {
    const noSuggestion = displayViolation(makeViolation(), 0, 1, false)
    const withSuggestion = displayViolation(makeViolation({ suggestion: 'Fix it' }), 0, 1, false)

    expect(noSuggestion.length).toBe(withSuggestion.length)
  })

  test('verbose with suggestion includes both "Suggestion:" and suggestion text', () => {
    const violation = makeViolation({ suggestion: 'Use const' })

    const result = displayViolation(violation, 0, 1, true)
    const suggestionLine = result.find((l) => l.includes('Suggestion:'))

    expect(suggestionLine).toBeDefined()
    expect(suggestionLine!.includes('Use const')).toBe(true)
    expect(suggestionLine!.includes(chalk.green('Suggestion:'))).toBe(true)
  })
})

// ============================================================================
// applyFix — suggestion gating
// ============================================================================

describe('applyFix — suggestion gating', () => {
  test('undefined suggestion never reads file', async () => {
    const violation = makeViolation()
    delete (violation as Record<string, unknown>).suggestion

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.readFile).not.toHaveBeenCalled()
  })

  test('null-like suggestion (empty string) is falsy — returns false', async () => {
    const violation = makeViolation({ suggestion: '' })

    const result = await applyFix('/test/file.ts', violation)

    expect(result).toBe(false)
    expect(fs.readFile).not.toHaveBeenCalled()
  })

  test('truthy suggestion proceeds to read file', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('content')
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const violation = makeViolation({
      suggestion: 'fix',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 7 } },
    })

    await applyFix('/test/file.ts', violation)

    expect(fs.readFile).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// formatSummary — structure verification
// ============================================================================

describe('formatSummary — structure verification', () => {
  test('output has exactly 6 lines', () => {
    const result = formatSummary(makeFixResult({ applied: 1, skipped: 2, total: 3 }))

    expect(result).toHaveLength(6)
  })

  test('third line contains Applied', () => {
    const result = formatSummary(makeFixResult({ applied: 5 }))

    expect(result[2]).toContain('Applied:')
    expect(result[2]).toContain(chalk.green('5'))
  })

  test('fourth line contains Skipped', () => {
    const result = formatSummary(makeFixResult({ skipped: 6 }))

    expect(result[3]).toContain('Skipped:')
    expect(result[3]).toContain(chalk.yellow('6'))
  })

  test('fifth line contains Total', () => {
    const result = formatSummary(makeFixResult({ total: 11 }))

    expect(result[4]).toContain('Total:')
    expect(result[4]).toContain('11')
  })

  test('Summary line is indented with two spaces', () => {
    const result = formatSummary(makeFixResult())

    expect(result[1]).toContain('Summary:')
    const summaryLine = result[1]!
    expect(summaryLine.includes('  ')).toBe(true)
  })
})
