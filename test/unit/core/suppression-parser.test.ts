import { describe, test, expect, vi } from 'vitest'
import {
  parseSuppressions,
  isViolationSuppressed,
  filterSuppressedViolations,
  parseSuppressionsFromSourceFile,
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

describe('parseSuppressions - additional', () => {
  test('single line with only suppression', () => {
    const result = parseSuppressions('// codeforge-disable-next-line')
    expect(result.count).toBe(1)
  })

  test('suppression at end of file', () => {
    const code = 'const x = 1\n// codeforge-disable-next-line'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].line).toBe(2)
  })

  test('multiple suppressions on different lines', () => {
    const code = `// codeforge-disable no-console
const x = 1
// codeforge-disable-next-line max-params
function f() {}
// codeforge-enable no-console`
    const result = parseSuppressions(code)
    expect(result.count).toBe(3)
    expect(result.suppressions[0].type).toBe('block-start')
    expect(result.suppressions[1].type).toBe('next-line')
    expect(result.suppressions[2].type).toBe('block-end')
  })

  test('handles windows line endings', () => {
    const code = '// codeforge-disable-next-line\r\nconst x = 1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
  })

  test('handles CRLF throughout', () => {
    const code = '// codeforge-disable no-console\r\nconst x = 1\r\n// codeforge-enable no-console'
    const result = parseSuppressions(code)
    expect(result.count).toBe(2)
  })

  test('block comment spanning multiple lines', () => {
    const code = `/* codeforge-disable max-complexity
const x = 1
*/`
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-start')
  })

  test('rule IDs with hyphens and underscores', () => {
    const code = '// codeforge-disable-next-line my-rule_v1, another-rule'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['my-rule_v1', 'another-rule'])
  })

  test('trailing comma in rule list is ignored', () => {
    const code = '// codeforge-disable-next-line rule-a, rule-b,'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule-a', 'rule-b'])
  })

  test('duplicate rule IDs preserved', () => {
    const code = '// codeforge-disable-next-line rule-a, rule-a'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule-a', 'rule-a'])
  })

  test('very long rule ID', () => {
    const longRule = 'a'.repeat(200)
    const code = `// codeforge-disable-next-line ${longRule}`
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds[0]).toBe(longRule)
  })

  test('many rule IDs', () => {
    const rules = Array.from({ length: 20 }, (_, i) => `rule-${i}`)
    const code = `// codeforge-disable-next-line ${rules.join(', ')}`
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(rules)
  })

  test('line numbers are 1-based', () => {
    const code = '\n\n// codeforge-disable-next-line'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].line).toBe(3)
  })

  test('count matches suppressions length', () => {
    const code = `// codeforge-disable a
// codeforge-disable-next-line b
// codeforge-enable a`
    const result = parseSuppressions(code)
    expect(result.count).toBe(result.suppressions.length)
    expect(result.count).toBe(3)
  })

  test('enable at line 1', () => {
    const result = parseSuppressions('// codeforge-enable')
    expect(result.suppressions[0]).toEqual({ type: 'block-end', line: 1, ruleIds: [] })
  })

  test('disable and enable on consecutive lines', () => {
    const code = `// codeforge-disable no-console
// codeforge-enable no-console`
    const result = parseSuppressions(code)
    expect(result.count).toBe(2)
    expect(result.suppressions[0].type).toBe('block-start')
    expect(result.suppressions[1].type).toBe('block-end')
  })

  test('suppression in block comment mid-line', () => {
    const code = `const x = 1 /* codeforge-disable-next-line */`
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
  })

  test('does not match in string literals', () => {
    const code = `const s = "// codeforge-disable-next-line"`
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('two suppressions on adjacent lines', () => {
    const code = `// codeforge-disable a
// codeforge-enable b`
    const result = parseSuppressions(code)
    expect(result.count).toBe(2)
  })

  test('disable with whitespace only rules part', () => {
    const code = '// codeforge-disable    '
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual([])
  })

  test('multiline file with suppressions scattered', () => {
    const code = `const a = 1
// codeforge-disable-next-line rule1
const b = 2
const c = 3
// codeforge-disable rule2
const d = 4
// codeforge-enable rule2
const e = 5`
    const result = parseSuppressions(code)
    expect(result.count).toBe(3)
    expect(result.suppressions[0]).toEqual({ type: 'next-line', line: 2, ruleIds: ['rule1'] })
    expect(result.suppressions[1]).toEqual({ type: 'block-start', line: 5, ruleIds: ['rule2'] })
    expect(result.suppressions[2]).toEqual({ type: 'block-end', line: 7, ruleIds: ['rule2'] })
  })

  test('empty lines between suppressions', () => {
    const code = `// codeforge-disable a

// codeforge-disable-next-line b

// codeforge-enable a`
    const result = parseSuppressions(code)
    expect(result.count).toBe(3)
  })

  test('case insensitive directive', () => {
    const code = `// CoDeFoRgE-DiSaBlE-NeXt-LiNe rule1`
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('next-line')
  })

  test('tab-indented suppression', () => {
    const code = '\t// codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
  })

  test('suppression after asterisk in block comment', () => {
    const code = ` * codeforge-disable-next-line rule1`
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
  })

  test('file with only whitespace', () => {
    const result = parseSuppressions('   \n  \n  ')
    expect(result.count).toBe(0)
  })

  test('single newline', () => {
    const result = parseSuppressions('\n')
    expect(result.count).toBe(0)
  })

  test('returns result with suppressions array', () => {
    const result = parseSuppressions('// codeforge-disable')
    expect(Array.isArray(result.suppressions)).toBe(true)
    expect(typeof result.count).toBe('number')
  })
})

describe('isViolationSuppressed - additional', () => {
  describe('next-line edge cases', () => {
    test('suppresses multiple rules on next line', () => {
      const suppressions: Suppression[] = [
        { type: 'next-line', line: 5, ruleIds: ['rule-a', 'rule-b'] },
      ]
      expect(isViolationSuppressed(createViolation(6, 'rule-a'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(6, 'rule-b'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(6, 'rule-c'), suppressions)).toBe(false)
    })

    test('next-line on line 0 targets line 1', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 0, ruleIds: [] }]
      expect(isViolationSuppressed(createViolation(1, 'any'), suppressions)).toBe(true)
    })

    test('next-line does not affect earlier lines', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 10, ruleIds: [] }]
      expect(isViolationSuppressed(createViolation(9, 'any'), suppressions)).toBe(false)
    })

    test('multiple next-line suppressions for different lines', () => {
      const suppressions: Suppression[] = [
        { type: 'next-line', line: 1, ruleIds: ['a'] },
        { type: 'next-line', line: 3, ruleIds: ['b'] },
      ]
      expect(isViolationSuppressed(createViolation(2, 'a'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(4, 'b'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(2, 'b'), suppressions)).toBe(false)
    })
  })

  describe('block edge cases', () => {
    test('block-start on same line as violation', () => {
      const suppressions: Suppression[] = [{ type: 'block-start', line: 5, ruleIds: [] }]
      expect(isViolationSuppressed(createViolation(5, 'any'), suppressions)).toBe(true)
    })

    test('block-start after violation does not suppress', () => {
      const suppressions: Suppression[] = [{ type: 'block-start', line: 10, ruleIds: [] }]
      expect(isViolationSuppressed(createViolation(5, 'any'), suppressions)).toBe(false)
    })

    test('block-end on same line as violation unsuppresses', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: [] },
      ]
      expect(isViolationSuppressed(createViolation(5, 'any'), suppressions)).toBe(false)
    })

    test('nested disable/enable cycles', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: [] },
        { type: 'block-start', line: 10, ruleIds: [] },
        { type: 'block-end', line: 15, ruleIds: [] },
      ]
      expect(isViolationSuppressed(createViolation(3, 'any'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(7, 'any'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(12, 'any'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(20, 'any'), suppressions)).toBe(false)
    })

    test('enable specific rule from all-disabled', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: ['rule-a'] },
      ]
      expect(isViolationSuppressed(createViolation(10, 'rule-a'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(10, 'rule-b'), suppressions)).toBe(true)
    })

    test('enable multiple rules from all-disabled', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: ['rule-a', 'rule-b'] },
      ]
      expect(isViolationSuppressed(createViolation(10, 'rule-a'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(10, 'rule-b'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(10, 'rule-c'), suppressions)).toBe(true)
    })

    test('disable specific rules cumulatively', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['rule-a'] },
        { type: 'block-start', line: 3, ruleIds: ['rule-b'] },
      ]
      expect(isViolationSuppressed(createViolation(5, 'rule-a'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(5, 'rule-b'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(5, 'rule-c'), suppressions)).toBe(false)
    })

    test('enable removes specific rule from disabled set', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['rule-a', 'rule-b'] },
        { type: 'block-end', line: 5, ruleIds: ['rule-a'] },
      ]
      expect(isViolationSuppressed(createViolation(10, 'rule-a'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(10, 'rule-b'), suppressions)).toBe(true)
    })

    test('enable all clears disabled set entirely', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['rule-a', 'rule-b'] },
        { type: 'block-end', line: 5, ruleIds: [] },
      ]
      expect(isViolationSuppressed(createViolation(10, 'rule-a'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(10, 'rule-b'), suppressions)).toBe(false)
    })
  })

  describe('verbose option', () => {
    test('verbose option does not affect result for suppressed violation', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
      expect(
        isViolationSuppressed(createViolation(2, 'any'), suppressions, { verbose: true }),
      ).toBe(true)
    })

    test('verbose option does not affect result for unsuppressed violation', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
      expect(
        isViolationSuppressed(createViolation(5, 'any'), suppressions, { verbose: true }),
      ).toBe(false)
    })

    test('verbose false is same as undefined', () => {
      const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
      const r1 = isViolationSuppressed(createViolation(2, 'any'), suppressions, { verbose: false })
      const r2 = isViolationSuppressed(createViolation(2, 'any'), suppressions)
      expect(r1).toBe(r2)
    })
  })

  describe('complex scenarios', () => {
    test('block disable overridden by next-line enable', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['rule-a'] },
        { type: 'next-line', line: 5, ruleIds: ['rule-a'] },
      ]
      expect(isViolationSuppressed(createViolation(6, 'rule-a'), suppressions)).toBe(true)
    })

    test('many suppressions processed in order', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: ['a'] },
        { type: 'block-start', line: 2, ruleIds: ['b'] },
        { type: 'block-start', line: 3, ruleIds: ['c'] },
        { type: 'block-end', line: 10, ruleIds: ['b'] },
      ]
      expect(isViolationSuppressed(createViolation(15, 'a'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(15, 'b'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(15, 'c'), suppressions)).toBe(true)
    })

    test('all rules disabled via block with enable re-enable', () => {
      const suppressions: Suppression[] = [
        { type: 'block-start', line: 1, ruleIds: [] },
        { type: 'block-end', line: 5, ruleIds: ['x'] },
        { type: 'block-end', line: 10, ruleIds: [] },
      ]
      expect(isViolationSuppressed(createViolation(3, 'any'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(7, 'x'), suppressions)).toBe(false)
      expect(isViolationSuppressed(createViolation(7, 'y'), suppressions)).toBe(true)
      expect(isViolationSuppressed(createViolation(15, 'any'), suppressions)).toBe(false)
    })
  })
})

describe('filterSuppressedViolations - additional', () => {
  test('returns new array', () => {
    const violations = [createViolation(1, 'a')]
    const result = filterSuppressedViolations(violations, [])
    expect(result).not.toBe(violations)
  })

  test('preserves violation objects', () => {
    const violations = [createViolation(1, 'a')]
    const result = filterSuppressedViolations(violations, [])
    expect(result[0]).toBe(violations[0])
  })

  test('empty violations array', () => {
    const result = filterSuppressedViolations([], [{ type: 'block-start', line: 1, ruleIds: [] }])
    expect(result).toHaveLength(0)
  })

  test('single violation not suppressed', () => {
    const violations = [createViolation(5, 'a')]
    const result = filterSuppressedViolations(violations, [])
    expect(result).toHaveLength(1)
  })

  test('single violation suppressed', () => {
    const violations = [createViolation(2, 'a')]
    const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: [] }]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(0)
  })

  test('mixed violations some suppressed', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: ['a'] }]
    const violations = [
      createViolation(2, 'a'),
      createViolation(2, 'b'),
      createViolation(3, 'a'),
      createViolation(4, 'c'),
    ]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(2)
    expect(result[0].ruleId).toBe('b')
    expect(result[1].ruleId).toBe('c')
  })

  test('many violations with block suppression', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: [] }]
    const violations = Array.from({ length: 50 }, (_, i) => createViolation(i + 1, 'rule'))
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(0)
  })

  test('next-line suppresses exactly one line of violations', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 5, ruleIds: [] }]
    const violations = [createViolation(4, 'a'), createViolation(6, 'a'), createViolation(7, 'a')]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(2)
    expect(result[0].range.start.line).toBe(4)
    expect(result[1].range.start.line).toBe(7)
  })

  test('multiple rule-specific suppressions', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['rule-a', 'rule-b'] },
      { type: 'block-end', line: 5, ruleIds: ['rule-a'] },
    ]
    const violations = [
      createViolation(3, 'rule-a'),
      createViolation(3, 'rule-b'),
      createViolation(3, 'rule-c'),
      createViolation(7, 'rule-a'),
      createViolation(7, 'rule-b'),
      createViolation(7, 'rule-c'),
    ]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(3)
    expect(result.map((v) => v.ruleId)).toEqual(['rule-c', 'rule-a', 'rule-c'])
  })
})

describe('parseSuppressionsFromSourceFile', () => {
  function createMockSourceFile(text: string) {
    return {
      getFullText: () => text,
      getText: () => text,
    } as any
  }

  test('parses suppressions from source file', () => {
    const sf = createMockSourceFile('// codeforge-disable-next-line\nconst x = 1')
    const result = parseSuppressionsFromSourceFile(sf)
    expect(result.count).toBe(1)
  })

  test('handles empty source file', () => {
    const sf = createMockSourceFile('')
    const result = parseSuppressionsFromSourceFile(sf)
    expect(result.count).toBe(0)
  })

  test('handles source with multiple suppressions', () => {
    const sf = createMockSourceFile(`// codeforge-disable a
const x = 1
// codeforge-enable a`)
    const result = parseSuppressionsFromSourceFile(sf)
    expect(result.count).toBe(2)
  })

  test('uses getFullText when available', () => {
    const sf = {
      getFullText: () => '// codeforge-disable-next-line rule1',
      getText: () => 'wrong',
    } as any
    const result = parseSuppressionsFromSourceFile(sf)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('falls back to getText when getFullText not available', () => {
    const sf = {
      getText: () => '// codeforge-disable rule2',
    } as any
    const result = parseSuppressionsFromSourceFile(sf)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule2'])
  })

  test('returns same structure as parseSuppressions', () => {
    const code = '// codeforge-disable a\nconst x = 1'
    const sf = createMockSourceFile(code)
    const fromText = parseSuppressions(code)
    const fromSf = parseSuppressionsFromSourceFile(sf)
    expect(fromSf.count).toBe(fromText.count)
    expect(fromSf.suppressions).toEqual(fromText.suppressions)
  })
})

describe('parseSuppressions - comment style variations', () => {
  test('parses triple-slash comment directive', () => {
    const code = '/// codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses no-space after double slash', () => {
    const code = '//codeforge-disable rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses block comment with no internal spaces', () => {
    const code = '/*codeforge-disable rule1*/'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses block comment disable with no rules', () => {
    const code = '/*codeforge-disable*/'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual([])
  })

  test('parses block comment with trailing text after closing', () => {
    const code = '/* codeforge-disable-next-line rule1 */ const x = 1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses JSDoc-style block with multiple leading asterisks', () => {
    const code = '/** codeforge-disable rule1 */'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-start')
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses directive in mid-line block comment', () => {
    const code = 'const x = /* codeforge-disable-next-line rule1 */ 1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses asterisk-prefixed line in block comment', () => {
    const code = ' * codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses star-slash prefixed line', () => {
    const code = ' */ codeforge-enable rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-end')
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('parses multiple spaces between comment marker and directive', () => {
    const code = '//     codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('unclosed block comment still parses (line ends)', () => {
    const code = '/* codeforge-disable rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('second inline comment on same line contains directive', () => {
    const code = '// regular comment // codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })
})

describe('parseSuppressions - rule ID formats', () => {
  test('parses rule with dots', () => {
    const code = '// codeforge-disable-next-line rule.part.sub'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule.part.sub'])
  })

  test('parses rule with numbers', () => {
    const code = '// codeforge-disable-next-line rule-123'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule-123'])
  })

  test('parses camelCase rule ID', () => {
    const code = '// codeforge-disable-next-line myRuleName'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['myRuleName'])
  })

  test('parses at-prefixed scoped rule ID', () => {
    const code = '// codeforge-disable-next-line @scope/rule'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['@scope/rule'])
  })

  test('parses single character rule ID', () => {
    const code = '// codeforge-disable-next-line x'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['x'])
  })

  test('parses rule with forward slashes', () => {
    const code = '// codeforge-disable-next-line category/sub-rule'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['category/sub-rule'])
  })

  test('parses rule with colons', () => {
    const code = '// codeforge-disable-next-line category:rule-name'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['category:rule-name'])
  })

  test('parses numeric-only rule ID', () => {
    const code = '// codeforge-disable-next-line 12345'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['12345'])
  })

  test('parses rule with underscores', () => {
    const code = '// codeforge-disable-next-line no_eval_please'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['no_eval_please'])
  })

  test('parses rule with mixed special characters', () => {
    const code = '// codeforge-disable-next-line my_rule.v2-beta'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['my_rule.v2-beta'])
  })
})

describe('parseSuppressions - whitespace and formatting', () => {
  test('multiple leading tabs before comment', () => {
    const code = '\t\t\t// codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
  })

  test('mixed spaces and tabs after directive', () => {
    const code = '// codeforge-disable-next-line \t rule1 \t, rule2'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1', 'rule2'])
  })

  test('trailing spaces after rule list', () => {
    const code = '// codeforge-disable-next-line rule1   '
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('trailing tab after rule list', () => {
    const code = '// codeforge-disable-next-line rule1\t'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1'])
  })

  test('carriage return only line ending is not treated as line break', () => {
    const code = '// codeforge-disable-next-line rule1\rconst x = 1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('multiple newlines between suppressions', () => {
    const code = '// codeforge-disable a\n\n\n\n// codeforge-enable a'
    const result = parseSuppressions(code)
    expect(result.count).toBe(2)
    expect(result.suppressions[0].line).toBe(1)
    expect(result.suppressions[1].line).toBe(5)
  })

  test('deeply indented code with suppression', () => {
    const code = '          // codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].line).toBe(1)
  })

  test('spaces around commas in rule list', () => {
    const code = '// codeforge-disable-next-line  rule-a  ,  rule-b  ,  rule-c  '
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule-a', 'rule-b', 'rule-c'])
  })

  test('no space between directive and first rule', () => {
    const code = '// codeforge-disable-nextrule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('suppression with empty lines before and after', () => {
    const code = '\n\n// codeforge-disable rule1\n\n'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].line).toBe(3)
  })
})

describe('parseSuppressions - line number accuracy', () => {
  test('suppression at line 50', () => {
    const lines = Array.from({ length: 49 }, () => 'const x = 1')
    lines.push('// codeforge-disable-next-line rule1')
    const code = lines.join('\n')
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].line).toBe(50)
  })

  test('multiple directives track correct line numbers', () => {
    const code = `const a = 1
// codeforge-disable rule1
const b = 2
// codeforge-disable-next-line rule2
const c = 3
// codeforge-enable rule1`
    const result = parseSuppressions(code)
    expect(result.count).toBe(3)
    expect(result.suppressions[0].line).toBe(2)
    expect(result.suppressions[1].line).toBe(4)
    expect(result.suppressions[2].line).toBe(6)
  })

  test('suppression after many blank lines', () => {
    const code = '\n'.repeat(100) + '// codeforge-disable rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].line).toBe(101)
  })

  test('suppression on first line', () => {
    const code = '// codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].line).toBe(1)
  })

  test('suppression on last line of multi-line file', () => {
    const code = 'const a = 1\nconst b = 2\n// codeforge-disable rule1'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].line).toBe(3)
  })

  test('consecutive suppression lines', () => {
    const code = `// codeforge-disable rule1
// codeforge-disable-next-line rule2
// codeforge-enable rule1`
    const result = parseSuppressions(code)
    expect(result.count).toBe(3)
    expect(result.suppressions.map((s) => s.line)).toEqual([1, 2, 3])
  })

  test('suppressions interleaved with code', () => {
    const code = `const a = 1
// codeforge-disable rule1
const b = 2
const c = 3
// codeforge-enable rule1
const d = 4`
    const result = parseSuppressions(code)
    expect(result.suppressions.map((s) => s.line)).toEqual([2, 5])
  })

  test('line numbers correct with CRLF', () => {
    const code = 'const a = 1\r\n// codeforge-disable rule1\r\n// codeforge-enable rule1'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].line).toBe(2)
    expect(result.suppressions[1].line).toBe(3)
  })
})

describe('parseSuppressions - invalid and non-matching directives', () => {
  test('eslint-disable does not match', () => {
    const code = '// eslint-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('codeforge-ignore does not match', () => {
    const code = '// codeforge-ignore rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('codeforge-disabled (past tense) does not match', () => {
    const code = '// codeforge-disabled rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('codeforge-disble (typo) does not match', () => {
    const code = '// codeforge-disble rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('hash comment does not match', () => {
    const code = '# codeforge-disable rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('directive in single-quoted string matches due to line-end $', () => {
    const code = `const s = '// codeforge-disable-next-line rule1'`
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(["rule1'"])
  })

  test('codeforge text after other comment text does not match', () => {
    const code = '// We use codeforge-disable for suppression'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('codeforge-enable-next-line does not match', () => {
    const code = '// codeforge-enable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('codeforge-disable- (trailing hyphen) does not match', () => {
    const code = '// codeforge-disable- rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('codeforge-disable-next-lines (plural) does not match', () => {
    const code = '// codeforge-disable-next-lines rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })
})

describe('parseSuppressions - regex-specific edge cases', () => {
  test('codeforge-disable with immediately following */', () => {
    const code = '/*codeforge-disable*/'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual([])
  })

  test('directive repeated on consecutive lines', () => {
    const code = `// codeforge-disable rule1
// codeforge-disable rule1`
    const result = parseSuppressions(code)
    expect(result.count).toBe(2)
  })

  test('directive at end of file without newline', () => {
    const code = 'const x = 1\n// codeforge-disable-next-line'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].line).toBe(2)
  })

  test('count equals suppressions length invariant', () => {
    const code = `// codeforge-disable a
// codeforge-disable-next-line b
// codeforge-disable c, d
// codeforge-enable a`
    const result = parseSuppressions(code)
    expect(result.count).toBe(result.suppressions.length)
    expect(result.count).toBe(4)
  })

  test('empty file returns empty result', () => {
    const result = parseSuppressions('')
    expect(result.count).toBe(0)
    expect(result.suppressions).toEqual([])
  })

  test('file with only newlines', () => {
    const result = parseSuppressions('\n\n\n')
    expect(result.count).toBe(0)
  })

  test('directive with unicode text after rules', () => {
    const code = '// codeforge-disable-next-line rule1 日本語説明'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].ruleIds).toEqual(['rule1 日本語説明'])
  })

  test('directive after code on same line', () => {
    const code = 'const x = 1; // codeforge-disable rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('block-start')
  })
})

describe('isViolationSuppressed - next-line advanced', () => {
  test('next-line with many rules suppresses only those rules', () => {
    const rules = Array.from({ length: 10 }, (_, i) => `rule-${i}`)
    const suppressions: Suppression[] = [{ type: 'next-line', line: 5, ruleIds: rules }]
    expect(isViolationSuppressed(createViolation(6, 'rule-0'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'rule-9'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'rule-10'), suppressions)).toBe(false)
  })

  test('next-line at very high line number', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 99999, ruleIds: [] }]
    expect(isViolationSuppressed(createViolation(100000, 'any'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(99999, 'any'), suppressions)).toBe(false)
  })

  test('consecutive next-line suppressions', () => {
    const suppressions: Suppression[] = [
      { type: 'next-line', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 2, ruleIds: ['b'] },
      { type: 'next-line', line: 3, ruleIds: ['c'] },
    ]
    expect(isViolationSuppressed(createViolation(2, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(3, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(4, 'c'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(5, 'a'), suppressions)).toBe(false)
  })

  test('next-line after block end', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['rule-a'] },
      { type: 'block-end', line: 5, ruleIds: ['rule-a'] },
      { type: 'next-line', line: 10, ruleIds: ['rule-a'] },
    ]
    expect(isViolationSuppressed(createViolation(11, 'rule-a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(12, 'rule-a'), suppressions)).toBe(false)
  })

  test('next-line inside active block adds additional suppression', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['rule-a'] },
      { type: 'next-line', line: 5, ruleIds: ['rule-b'] },
    ]
    expect(isViolationSuppressed(createViolation(6, 'rule-a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'rule-b'), suppressions)).toBe(true)
  })

  test('duplicate next-line suppressions for same line', () => {
    const suppressions: Suppression[] = [
      { type: 'next-line', line: 5, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(6, 'a'), suppressions)).toBe(true)
  })

  test('next-line with single rule does not suppress different rule', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 5, ruleIds: ['a'] }]
    expect(isViolationSuppressed(createViolation(6, 'b'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(6, 'a'), suppressions)).toBe(true)
  })

  test('multiple violations on suppressed next line all suppressed', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 5, ruleIds: [] }]
    expect(isViolationSuppressed(createViolation(6, 'rule-a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'rule-b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'rule-c'), suppressions)).toBe(true)
  })

  test('next-line at line 1 suppresses line 2', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 1, ruleIds: ['x'] }]
    expect(isViolationSuppressed(createViolation(2, 'x'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(1, 'x'), suppressions)).toBe(false)
  })

  test('next-line suppression only affects immediate next line', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 5, ruleIds: [] }]
    expect(isViolationSuppressed(createViolation(6, 'any'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'any'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(8, 'any'), suppressions)).toBe(false)
  })
})

describe('isViolationSuppressed - block advanced', () => {
  test('multiple overlapping block starts', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-start', line: 1, ruleIds: ['b'] },
    ]
    expect(isViolationSuppressed(createViolation(5, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(5, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(5, 'c'), suppressions)).toBe(false)
  })

  test('block start without end persists forever', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: [] }]
    expect(isViolationSuppressed(createViolation(1000, 'any-rule'), suppressions)).toBe(true)
  })

  test('block end without preceding start does not suppress', () => {
    const suppressions: Suppression[] = [{ type: 'block-end', line: 5, ruleIds: [] }]
    expect(isViolationSuppressed(createViolation(3, 'any'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(10, 'any'), suppressions)).toBe(false)
  })

  test('alternating disable/enable cycles', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: [] },
      { type: 'block-end', line: 5, ruleIds: [] },
      { type: 'block-start', line: 10, ruleIds: [] },
      { type: 'block-end', line: 15, ruleIds: [] },
      { type: 'block-start', line: 20, ruleIds: [] },
    ]
    expect(isViolationSuppressed(createViolation(3, 'any'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'any'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(12, 'any'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(17, 'any'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(25, 'any'), suppressions)).toBe(true)
  })

  test('enable same rule multiple times', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-end', line: 5, ruleIds: ['a'] },
      { type: 'block-end', line: 10, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(7, 'a'), suppressions)).toBe(false)
  })

  test('block end for rule never disabled', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-end', line: 5, ruleIds: ['b'] },
    ]
    expect(isViolationSuppressed(createViolation(10, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(10, 'b'), suppressions)).toBe(false)
  })

  test('multiple block starts for same rule are cumulative', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-start', line: 5, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(10, 'a'), suppressions)).toBe(true)
  })

  test('block with many rules, selectively enabling', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a', 'b', 'c', 'd', 'e'] },
      { type: 'block-end', line: 10, ruleIds: ['b', 'd'] },
    ]
    expect(isViolationSuppressed(createViolation(15, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'b'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(15, 'c'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'd'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(15, 'e'), suppressions)).toBe(true)
  })

  test('block start and end on consecutive lines', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-end', line: 2, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(1, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(2, 'a'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(3, 'a'), suppressions)).toBe(false)
  })

  test('enable all then disable specific after', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: [] },
      { type: 'block-end', line: 5, ruleIds: [] },
      { type: 'block-start', line: 10, ruleIds: ['x'] },
    ]
    expect(isViolationSuppressed(createViolation(3, 'any'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'any'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(15, 'x'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'y'), suppressions)).toBe(false)
  })

  test('block start at same line as violation suppresses', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 5, ruleIds: ['x'] }]
    expect(isViolationSuppressed(createViolation(5, 'x'), suppressions)).toBe(true)
  })

  test('all-rules disable then partial enable then full enable', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: [] },
      { type: 'block-end', line: 5, ruleIds: ['a'] },
      { type: 'block-end', line: 10, ruleIds: [] },
    ]
    expect(isViolationSuppressed(createViolation(3, 'any'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'a'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(7, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'any'), suppressions)).toBe(false)
  })
})

describe('isViolationSuppressed - combined interaction patterns', () => {
  test('next-line within active block for different rule', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['b'] },
    ]
    expect(isViolationSuppressed(createViolation(6, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'b'), suppressions)).toBe(false)
  })

  test('block then next-line then block end', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['b'] },
      { type: 'block-end', line: 10, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(3, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'a'), suppressions)).toBe(false)
  })

  test('multiple next-line suppressions separated by blocks', () => {
    const suppressions: Suppression[] = [
      { type: 'next-line', line: 2, ruleIds: ['a'] },
      { type: 'block-start', line: 5, ruleIds: ['b'] },
      { type: 'next-line', line: 10, ruleIds: ['c'] },
    ]
    expect(isViolationSuppressed(createViolation(3, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(8, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(11, 'c'), suppressions)).toBe(true)
  })

  test('next-line suppressed but block not active for that rule', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['b'] },
    ]
    expect(isViolationSuppressed(createViolation(6, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'b'), suppressions)).toBe(false)
  })

  test('all three suppression types in sequence', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['b'] },
      { type: 'block-end', line: 10, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(2, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'a'), suppressions)).toBe(false)
  })

  test('next-line after block end re-enables for one line', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-end', line: 5, ruleIds: ['a'] },
      { type: 'next-line', line: 8, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(4, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(7, 'a'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(9, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(10, 'a'), suppressions)).toBe(false)
  })

  test('interleaved blocks and next-lines', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 3, ruleIds: ['b'] },
      { type: 'block-end', line: 5, ruleIds: ['a'] },
      { type: 'next-line', line: 7, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(2, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(4, 'b'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(6, 'a'), suppressions)).toBe(false)
    expect(isViolationSuppressed(createViolation(8, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(9, 'a'), suppressions)).toBe(false)
  })

  test('block overlapping with next-line for same rule', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['a'] },
      { type: 'block-end', line: 10, ruleIds: ['a'] },
    ]
    expect(isViolationSuppressed(createViolation(6, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(8, 'a'), suppressions)).toBe(true)
    expect(isViolationSuppressed(createViolation(15, 'a'), suppressions)).toBe(false)
  })
})

describe('filterSuppressedViolations - advanced', () => {
  test('many violations with selective suppression', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: ['a'] }]
    const violations = Array.from({ length: 50 }, (_, i) =>
      createViolation(i + 1, i % 2 === 0 ? 'a' : 'b'),
    )
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(25)
    result.forEach((v) => expect(v.ruleId).toBe('b'))
  })

  test('multiple suppression types filtering', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'block-end', line: 3, ruleIds: ['a'] },
      { type: 'next-line', line: 5, ruleIds: ['b'] },
    ]
    const violations = [
      createViolation(2, 'a'),
      createViolation(2, 'b'),
      createViolation(4, 'a'),
      createViolation(6, 'b'),
      createViolation(6, 'a'),
    ]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(3)
    expect(result.map((v) => [v.range.start.line, v.ruleId])).toEqual([
      [2, 'b'],
      [4, 'a'],
      [6, 'a'],
    ])
  })

  test('violations on same line with different rules', () => {
    const suppressions: Suppression[] = [{ type: 'next-line', line: 4, ruleIds: ['a'] }]
    const violations = [createViolation(5, 'a'), createViolation(5, 'b'), createViolation(5, 'c')]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(2)
    expect(result.map((v) => v.ruleId)).toEqual(['b', 'c'])
  })

  test('empty suppressions with many violations', () => {
    const violations = Array.from({ length: 100 }, (_, i) => createViolation(i + 1, 'rule'))
    const result = filterSuppressedViolations(violations, [])
    expect(result).toHaveLength(100)
  })

  test('no violations with many suppressions', () => {
    const suppressions: Suppression[] = Array.from({ length: 50 }, (_, i) => ({
      type: 'block-start' as const,
      line: i + 1,
      ruleIds: [],
    }))
    const result = filterSuppressedViolations([], suppressions)
    expect(result).toHaveLength(0)
  })

  test('block suppresses most, next-line adds one more', () => {
    const suppressions: Suppression[] = [
      { type: 'block-start', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 10, ruleIds: ['b'] },
    ]
    const violations = [
      createViolation(5, 'a'),
      createViolation(5, 'b'),
      createViolation(11, 'a'),
      createViolation(11, 'b'),
    ]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(
      expect.objectContaining({
        ruleId: 'b',
        range: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
      }),
    )
  })

  test('order preservation check', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: ['b'] }]
    const violations = [
      createViolation(2, 'a'),
      createViolation(3, 'b'),
      createViolation(4, 'c'),
      createViolation(5, 'a'),
    ]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result.map((v) => v.ruleId)).toEqual(['a', 'c', 'a'])
  })

  test('all filtered returns empty array', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 1, ruleIds: [] }]
    const violations = [createViolation(2, 'a'), createViolation(3, 'b'), createViolation(4, 'c')]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(0)
  })

  test('none filtered returns all violations', () => {
    const suppressions: Suppression[] = [{ type: 'block-start', line: 100, ruleIds: [] }]
    const violations = [createViolation(1, 'a'), createViolation(2, 'b'), createViolation(3, 'c')]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(3)
  })

  test('mixed rule IDs with selective next-line suppression', () => {
    const suppressions: Suppression[] = [
      { type: 'next-line', line: 1, ruleIds: ['a'] },
      { type: 'next-line', line: 3, ruleIds: ['b'] },
      { type: 'next-line', line: 5, ruleIds: ['c'] },
    ]
    const violations = [
      createViolation(2, 'a'),
      createViolation(2, 'b'),
      createViolation(4, 'a'),
      createViolation(4, 'b'),
      createViolation(6, 'c'),
      createViolation(6, 'd'),
    ]
    const result = filterSuppressedViolations(violations, suppressions)
    expect(result).toHaveLength(3)
    expect(result.map((v) => v.ruleId)).toEqual(['b', 'a', 'd'])
  })
})

describe('parseSuppressions - scope and directive interaction', () => {
  test('multiple disable blocks for different rules', () => {
    const code = `// codeforge-disable a
const x = 1
// codeforge-disable b
const y = 2
// codeforge-enable a
// codeforge-enable b`
    const result = parseSuppressions(code)
    expect(result.count).toBe(4)
    expect(result.suppressions[0]).toEqual({ type: 'block-start', line: 1, ruleIds: ['a'] })
    expect(result.suppressions[1]).toEqual({ type: 'block-start', line: 3, ruleIds: ['b'] })
    expect(result.suppressions[2]).toEqual({ type: 'block-end', line: 5, ruleIds: ['a'] })
    expect(result.suppressions[3]).toEqual({ type: 'block-end', line: 6, ruleIds: ['b'] })
  })

  test('all three directive types in one file', () => {
    const code = `// codeforge-disable a
const x = 1
// codeforge-disable-next-line b
const y = 2
// codeforge-enable a`
    const result = parseSuppressions(code)
    expect(result.count).toBe(3)
    expect(result.suppressions.map((s) => s.type)).toEqual([
      'block-start',
      'next-line',
      'block-end',
    ])
  })

  test('directive after code on line with semicolon', () => {
    const code = 'const x = 1; // codeforge-disable-next-line rule1'
    const result = parseSuppressions(code)
    expect(result.count).toBe(1)
    expect(result.suppressions[0].type).toBe('next-line')
  })

  test('empty rule part with trailing spaces', () => {
    const code = '// codeforge-disable     '
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual([])
  })

  test('rules with only commas produce empty list', () => {
    const code = '// codeforge-disable-next-line ,,,'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual([])
  })

  test('single rule followed by trailing comma', () => {
    const code = '// codeforge-disable-next-line rule-a,'
    const result = parseSuppressions(code)
    expect(result.suppressions[0].ruleIds).toEqual(['rule-a'])
  })

  test('malformed directive without next-line keyword', () => {
    const code = '// codeforge-disable-next-rule1 , rule2'
    const result = parseSuppressions(code)
    expect(result.count).toBe(0)
  })

  test('complete file with realistic suppression pattern', () => {
    const code = `import { x } from 'y'

// codeforge-disable-next-line max-complexity
function complex(a: number, b: number) {
  // codeforge-disable no-console
  console.log(a, b)
  // codeforge-enable no-console
  return a + b
}

// codeforge-disable-next-line max-params, max-lines
function manyParams(a: number, b: number, c: number) {
  return a + b + c
}`
    const result = parseSuppressions(code)
    expect(result.count).toBe(4)
  })
})
