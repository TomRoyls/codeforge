import { describe, test, expect } from 'vitest'
import {
  parseSuppressions,
  isViolationSuppressed,
  filterSuppressedViolations,
  type Suppression,
} from '../../../src/core/suppression-parser'
import type { RuleViolation } from '../../../src/ast/visitor'

function createViolation(line: number, ruleId: string): RuleViolation {
  return {
    ruleId,
    severity: 'error',
    message: `Test violation for ${ruleId}`,
    filePath: '/test/file.ts',
    range: {
      start: { line, column: 0 },
      end: { line, column: 10 },
    },
  }
}

describe('parseSuppressions', () => {
  describe('codeforge-disable-next-line', () => {
    test('parses codeforge-disable-next-line (all rules)', () => {
      const code = `// codeforge-disable-next-line
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions).toHaveLength(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: [],
      })
    })

    test('parses codeforge-disable-next-line with single rule', () => {
      const code = `// codeforge-disable-next-line max-complexity
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })

    test('parses codeforge-disable-next-line with multiple rules', () => {
      const code = `// codeforge-disable-next-line max-complexity, no-console, no-eval
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity', 'no-console', 'no-eval'],
      })
    })

    test('parses codeforge-disable-next-line with extra whitespace', () => {
      const code = `//   codeforge-disable-next-line   max-complexity  ,  no-console  
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity', 'no-console'],
      })
    })

    test('parses block comment style disable-next-line', () => {
      const code = `/* codeforge-disable-next-line max-complexity */
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })

    test('parses JSDoc style disable-next-line', () => {
      const code = `/** codeforge-disable-next-line max-complexity */
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })
  })

  describe('codeforge-disable (block start)', () => {
    test('parses codeforge-disable (all rules)', () => {
      const code = `// codeforge-disable
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-start',
        line: 1,
        ruleIds: [],
      })
    })

    test('parses codeforge-disable with single rule', () => {
      const code = `// codeforge-disable max-complexity
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-start',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })

    test('parses codeforge-disable with multiple rules', () => {
      const code = `// codeforge-disable max-complexity, no-console
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-start',
        line: 1,
        ruleIds: ['max-complexity', 'no-console'],
      })
    })

    test('parses block comment style disable', () => {
      const code = `/* codeforge-disable max-complexity */
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-start',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })
  })

  describe('codeforge-enable (block end)', () => {
    test('parses codeforge-enable (all rules)', () => {
      const code = `// codeforge-enable
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-end',
        line: 1,
        ruleIds: [],
      })
    })

    test('parses codeforge-enable with single rule', () => {
      const code = `// codeforge-enable max-complexity
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-end',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })

    test('parses codeforge-enable with multiple rules', () => {
      const code = `// codeforge-enable max-complexity, no-console
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'block-end',
        line: 1,
        ruleIds: ['max-complexity', 'no-console'],
      })
    })
  })

  describe('multiple suppressions', () => {
    test('parses multiple suppressions in same file', () => {
      const code = `// codeforge-disable max-complexity
const x = 1
// codeforge-disable-next-line no-console
console.log(x)
// codeforge-enable max-complexity
const y = 2`
      const result = parseSuppressions(code)

      expect(result.count).toBe(3)
      expect(result.suppressions[0]).toEqual({
        type: 'block-start',
        line: 1,
        ruleIds: ['max-complexity'],
      })
      expect(result.suppressions[1]).toEqual({
        type: 'next-line',
        line: 3,
        ruleIds: ['no-console'],
      })
      expect(result.suppressions[2]).toEqual({
        type: 'block-end',
        line: 5,
        ruleIds: ['max-complexity'],
      })
    })

    test('handles empty lines correctly', () => {
      const code = `
// codeforge-disable-next-line max-complexity

const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 2,
        ruleIds: ['max-complexity'],
      })
    })
  })

  describe('edge cases', () => {
    test('handles empty text', () => {
      const result = parseSuppressions('')

      expect(result.count).toBe(0)
      expect(result.suppressions).toHaveLength(0)
    })

    test('handles text without suppressions', () => {
      const code = `const x = 1
const y = 2`
      const result = parseSuppressions(code)

      expect(result.count).toBe(0)
      expect(result.suppressions).toHaveLength(0)
    })

    test('is case insensitive', () => {
      const code = `// CODEFORGE-DISABLE-NEXT-LINE max-complexity
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })

    test('handles mixed case', () => {
      const code = `// CodeForge-Disable-Next-Line max-complexity
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })

    test('does not match partial directives', () => {
      const code = `// codeforge-disable-next-lines max-complexity
const x = 1`
      const result = parseSuppressions(code)

      expect(result.count).toBe(0)
    })

    test('handles inline suppression after code', () => {
      const code = `const x = 1 // codeforge-disable-next-line max-complexity
const y = 2`
      const result = parseSuppressions(code)

      expect(result.count).toBe(1)
      expect(result.suppressions[0]).toEqual({
        type: 'next-line',
        line: 1,
        ruleIds: ['max-complexity'],
      })
    })
  })
})

describe('isViolationSuppressed', () => {
  describe('next-line suppressions', () => {
    test('suppresses all rules on next line', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
      const violation = createViolation(2, 'max-complexity')

      expect(isViolationSuppressed(violation, suppressions)).toBe(true)
    })

    test('suppresses specific rule on next line', () => {
      const suppressions: Suppression[] = [
        { type: 'next-line', line: 1, ruleIds: ['max-complexity'] },
      ]

      expect(isViolationSuppressed(createViolation(2, 'max-complexity'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(2, 'no-console'), suppressions)).toBe(false)
    })

    test('does not suppress on same line', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
      const violation = createViolation(1, 'max-complexity')

      expect(isViolationSuppressed(violation, suppressions)).toBe(false)
    })

    test('does not suppress on line after next', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
      const violation = createViolation(3, 'max-complexity')

      expect(isViolationSuppressed(violation, suppressions)).toBe(false)
    })
  })

  describe('block suppressions', () => {
    test('suppresses all rules after disable', () => {
      const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: [] }]

      expect(isViolationSuppressed(createViolation(2, 'max-complexity'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(10, 'no-console'), suppressions)).toBe(true)
    })

    test('suppresses specific rule after disable', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['max-complexity'] },
      ]

      expect(isViolationSuppressed(createViolation(2, 'max-complexity'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(2, 'no-console'), suppressions)).toBe(false)
    })

    test('stops suppression after enable', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: [] },
      ]

      expect(isViolationSuppressed(createViolation(3, 'max-complexity'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(6, 'max-complexity'), suppressions)).toBe(false)
    })

    test('enables specific rule only', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: ['max-complexity'] },
      ]

      expect(isViolationSuppressed(createViolation(6, 'max-complexity'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(6, 'no-console'), suppressions)).toBe(true)
    })

    test('handles multiple block suppressions', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['max-complexity'] },
        { type: 'block-start', line: 3, ruleIds: ['no-console'] },
        { type: 'block-end', line: 5, ruleIds: ['max-complexity'] },
      ]

      expect(isViolationSuppressed(createViolation(4, 'max-complexity'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(4, 'no-console'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(6, 'max-complexity'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(6, 'no-console'), suppressions)).toBe(true)
    })
  })

  describe('combined suppressions', () => {
    test('handles next-line within block suppression', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['max-complexity'] },
        { type: 'next-line', line: 3, ruleIds: ['no-console'] },
      ]

      expect(isViolationSuppressed(createViolation(4, 'max-complexity'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(4, 'no-console'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(5, 'no-console'), suppressions)).toBe(false)
    })
  })

  describe('edge cases', () => {
    test('handles empty suppressions array', () => {
      const violation = createViolation(1, 'max-complexity')

      expect(isViolationSuppressed(violation, [])).toBe(false)
    })

    test('handles violation before any suppression', () => {
      const suppressions: Suppression[] = [{ type: 'block-start', line: 5, ruleIds: [] }]
      const violation = createViolation(3, 'max-complexity')

      expect(isViolationSuppressed(violation, suppressions)).toBe(false)
    })
  })
})

describe('filterSuppressedViolations', () => {
  test('filters out suppressed violations', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
    const violations = [
      createViolation(1, 'max-complexity'),
      createViolation(2, 'max-complexity'),
      createViolation(3, 'no-console'),
    ]

    const result = filterSuppressedViolations(violations, suppressions)

    expect(result).toHaveLength(2)
    expect(result[0].range.start.line).toBe(1)
    expect(result[1].range.start.line).toBe(3)
  })

  test('returns all violations when no suppressions', () => {
    const violations = [createViolation(1, 'max-complexity'), createViolation(2, 'no-console')]

    const result = filterSuppressedViolations(violations, [])

    expect(result).toHaveLength(2)
  })

  test('returns empty array when all violations suppressed', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: [] }]
    const violations = [createViolation(2, 'max-complexity'), createViolation(3, 'no-console')]

    const result = filterSuppressedViolations(violations, suppressions)

    expect(result).toHaveLength(0)
  })

  test('handles complex suppression scenarios', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: [] },
      { type: 'block-end', line: 3, ruleIds: [] },
      { type: 'next-line', line: 5, ruleIds: ['max-complexity'] },
    ]
    const violations = [
      createViolation(2, 'max-complexity'),
      createViolation(4, 'max-complexity'),
      createViolation(6, 'max-complexity'),
      createViolation(6, 'no-console'),
    ]

    const result = filterSuppressedViolations(violations, suppressions)

    expect(result).toHaveLength(2)
    expect(result.map((v) => v.range.start.line)).toEqual([4, 6])
  })
})
