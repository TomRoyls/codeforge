import { describe, expect, it } from 'vitest'

import {
  filterSuppressedViolations,
  isViolationSuppressed,
  parseSuppressions,
} from '../../src/core/suppression-parser.js'

import type { RuleViolation } from '../../src/ast/visitor.js'
import type { Suppression } from '../../src/core/suppression-parser.js'

// ─── Helpers ───

function makeViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    filePath: 'test.ts',
    message: 'test violation',
    range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } },
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

// ─── parseSuppressions ───

describe('parseSuppressions', () => {
  it('returns empty for text without suppressions', () => {
    const result = parseSuppressions('const x = 1;\nconsole.log(x);')
    expect(result.count).toBe(0)
    expect(result.suppressions).toEqual([])
  })

  it('parses codeforge-disable-next-line', () => {
    const text = '// codeforge-disable-next-line test-rule\nconst x = 1;'
    const result = parseSuppressions(text)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('next-line')
    expect(result.suppressions[0].ruleIds).toEqual(['test-rule'])
    expect(result.suppressions[0].line).toBe(1)
  })

  it('parses codeforge-disable-next-line without rules', () => {
    const text = '// codeforge-disable-next-line\nconst x = 1;'
    const result = parseSuppressions(text)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('next-line')
    expect(result.suppressions[0].ruleIds).toEqual([])
  })

  it('parses codeforge-disable (block start)', () => {
    const text = '// codeforge-disable test-rule'
    const result = parseSuppressions(text)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-start')
    expect(result.suppressions[0].ruleIds).toEqual(['test-rule'])
  })

  it('parses codeforge-enable (block end)', () => {
    const text = '// codeforge-enable test-rule'
    const result = parseSuppressions(text)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-end')
  })

  it('parses multiple rules', () => {
    const text = '// codeforge-disable-next-line rule1, rule2, rule3'
    const result = parseSuppressions(text)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1', 'rule2', 'rule3'])
  })

  it('parses multiple suppressions across lines', () => {
    const text = [
      '// codeforge-disable rule1',
      'const x = 1;',
      '// codeforge-enable rule1',
      '// codeforge-disable-next-line rule2',
      'const y = 2;',
    ].join('\n')
    const result = parseSuppressions(text)
    expect(result.count).toBe(3)
  })

  it('handles block comment style', () => {
    const text = '/* codeforge-disable rule-a */'
    const result = parseSuppressions(text)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-start')
    expect(result.suppressions[0].ruleIds).toEqual(['rule-a'])
  })

  it('reports correct line numbers', () => {
    const text = 'line1\nline2\n// codeforge-disable-next-line test\nline4'
    const result = parseSuppressions(text)
    expect(result.suppressions[0].line).toBe(3)
  })

  it('parses disable without rules (all rules)', () => {
    const text = '// codeforge-disable'
    const result = parseSuppressions(text)
    expect(result.suppressions[0].ruleIds).toEqual([])
    expect(result.suppressions[0].type).toBe('block-start')
  })

  it('handles empty string', () => {
    const result = parseSuppressions('')
    expect(result.count).toBe(0)
  })

  it('trims whitespace from rule IDs', () => {
    const text = '// codeforge-disable-next-line  rule-a , rule-b '
    const result = parseSuppressions(text)
    expect(result.suppressions[0].ruleIds).toEqual(['rule-a', 'rule-b'])
  })
})

// ─── isViolationSuppressed ───

describe('isViolationSuppressed', () => {
  it('returns false for empty suppressions', () => {
    const v = makeViolation()
    expect(isViolationSuppressed(v, [])).toBe(false)
  })

  it('returns true for next-line suppression matching rule', () => {
    const v = makeViolation({ ruleId: 'test-rule', range: { end: { column: 10, line: 3 }, start: { column: 0, line: 3 } } })
    const suppressions: Suppression[] = [
      { line: 2, ruleIds: ['test-rule'], type: 'next-line' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(true)
  })

  it('returns false for next-line suppression on wrong line', () => {
    const v = makeViolation({ range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } } })
    const suppressions: Suppression[] = [
      { line: 2, ruleIds: ['test-rule'], type: 'next-line' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(false)
  })

  it('returns false for next-line suppression with wrong rule', () => {
    const v = makeViolation({ ruleId: 'other-rule', range: { end: { column: 10, line: 3 }, start: { column: 0, line: 3 } } })
    const suppressions: Suppression[] = [
      { line: 2, ruleIds: ['test-rule'], type: 'next-line' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(false)
  })

  it('returns true for block-start suppression matching rule', () => {
    const v = makeViolation({ ruleId: 'test-rule', range: { end: { column: 10, line: 10 }, start: { column: 0, line: 10 } } })
    const suppressions: Suppression[] = [
      { line: 1, ruleIds: ['test-rule'], type: 'block-start' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(true)
  })

  it('returns false for block-start after violation line', () => {
    const v = makeViolation({ range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } } })
    const suppressions: Suppression[] = [
      { line: 10, ruleIds: ['test-rule'], type: 'block-start' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(false)
  })

  it('returns true for block-start without rules (all rules)', () => {
    const v = makeViolation({ ruleId: 'any-rule', range: { end: { column: 10, line: 10 }, start: { column: 0, line: 10 } } })
    const suppressions: Suppression[] = [
      { line: 1, ruleIds: [], type: 'block-start' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(true)
  })

  it('block-end re-enables rules', () => {
    const v = makeViolation({ ruleId: 'test-rule', range: { end: { column: 10, line: 15 }, start: { column: 0, line: 15 } } })
    const suppressions: Suppression[] = [
      { line: 1, ruleIds: ['test-rule'], type: 'block-start' },
      { line: 10, ruleIds: ['test-rule'], type: 'block-end' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(false)
  })

  it('block-end without rules re-enables all', () => {
    const v = makeViolation({ ruleId: 'test-rule', range: { end: { column: 10, line: 15 }, start: { column: 0, line: 15 } } })
    const suppressions: Suppression[] = [
      { line: 1, ruleIds: [], type: 'block-start' },
      { line: 10, ruleIds: [], type: 'block-end' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(false)
  })

  it('next-line suppression without rules suppresses all', () => {
    const v = makeViolation({ ruleId: 'any-rule', range: { end: { column: 10, line: 3 }, start: { column: 0, line: 3 } } })
    const suppressions: Suppression[] = [
      { line: 2, ruleIds: [], type: 'next-line' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(true)
  })

  it('handles multiple suppressions correctly', () => {
    const v = makeViolation({ ruleId: 'r2', range: { end: { column: 10, line: 10 }, start: { column: 0, line: 10 } } })
    const suppressions: Suppression[] = [
      { line: 1, ruleIds: ['r1'], type: 'block-start' },
      { line: 20, ruleIds: ['r1'], type: 'block-end' },
    ]
    expect(isViolationSuppressed(v, suppressions)).toBe(false)
  })
})

// ─── filterSuppressedViolations ───

describe('filterSuppressedViolations', () => {
  it('returns all violations when no suppressions', () => {
    const violations = [makeViolation(), makeViolation({ ruleId: 'r2' })]
    expect(filterSuppressedViolations(violations, [])).toEqual(violations)
  })

  it('filters out suppressed violations', () => {
    const v1 = makeViolation({ ruleId: 'r1', range: { end: { column: 10, line: 3 }, start: { column: 0, line: 3 } } })
    const v2 = makeViolation({ ruleId: 'r2', range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } } })
    const suppressions: Suppression[] = [
      { line: 2, ruleIds: ['r1'], type: 'next-line' },
    ]
    const filtered = filterSuppressedViolations([v1, v2], suppressions)
    expect(filtered.length).toBe(1)
    expect(filtered[0].ruleId).toBe('r2')
  })

  it('returns empty when all suppressed', () => {
    const v1 = makeViolation({ range: { end: { column: 10, line: 5 }, start: { column: 0, line: 5 } } })
    const suppressions: Suppression[] = [
      { line: 1, ruleIds: [], type: 'block-start' },
    ]
    expect(filterSuppressedViolations([v1], suppressions)).toEqual([])
  })

  it('handles empty violations', () => {
    expect(filterSuppressedViolations([], [])).toEqual([])
  })
})
