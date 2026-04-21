import { describe, test, expect, vi } from 'vitest'
import { noBitwiseRule } from '../../../../src/rules/patterns/no-bitwise.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: operator,
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Identifier', name: 'y' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: operator.length + 5 },
    },
  }
}

function createUnaryExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: operator,
    argument: { type: 'Identifier', name: 'x' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: operator.length + 2 },
    },
  }
}

function createAssignmentExpression(operator: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: operator,
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Identifier', name: 'y' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: operator.length + 3 },
    },
  }
}

function createBitwiseContext(
  allowOptions?: { allow?: string[] },
  overrides?: { filePath?: string; source?: string },
): { context: RuleContext; reports: ReportDescriptor[] } {
  const { context: baseContext, reports } = createMockRuleContext(overrides)
  if (allowOptions?.allow && allowOptions.allow.length > 0) {
    return {
      context: {
        ...baseContext,
        config: { rules: { 'no-bitwise': ['error', allowOptions] } },
      } as unknown as RuleContext,
      reports,
    }
  }
  return { context: baseContext, reports }
}

// ============================================================
// META TESTS (20)
// ============================================================
describe('no-bitwise rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noBitwiseRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noBitwiseRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noBitwiseRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noBitwiseRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noBitwiseRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noBitwiseRule.meta.fixable).toBeUndefined()
    })

    test('should mention bitwise operators in description', () => {
      const desc = noBitwiseRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/bitwise/)
    })

    test('should mention & operator in description', () => {
      const desc = noBitwiseRule.meta.docs?.description
      expect(desc).toContain('&')
    })

    test('should mention | operator in description', () => {
      const desc = noBitwiseRule.meta.docs?.description
      expect(desc).toContain('|')
    })

    test('should mention ^ operator in description', () => {
      const desc = noBitwiseRule.meta.docs?.description
      expect(desc).toContain('^')
    })

    test('should mention ~ operator in description', () => {
      const desc = noBitwiseRule.meta.docs?.description
      expect(desc).toContain('~')
    })

    test('should mention >>> operator in description', () => {
      const desc = noBitwiseRule.meta.docs?.description
      expect(desc).toContain('>>>')
    })

    test('should have docs property', () => {
      expect(noBitwiseRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof noBitwiseRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noBitwiseRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url defined', () => {
      expect(noBitwiseRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as non-empty string', () => {
      expect(typeof noBitwiseRule.meta.docs?.url).toBe('string')
      expect(noBitwiseRule.meta.docs?.url?.length).toBeGreaterThan(0)
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noBitwiseRule.meta.schema)).toBe(true)
    })

    test('should have allow property in schema', () => {
      const schema = noBitwiseRule.meta.schema as Record<string, unknown>[]
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('allow')
    })

    test('should not be deprecated', () => {
      expect(noBitwiseRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noBitwiseRule.meta.replacedBy).toBeUndefined()
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return visitor object with UnaryExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return visitor object with AssignmentExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should return exactly three visitor methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(3)
    })

    test('should return function for BinaryExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return function for UnaryExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should return function for AssignmentExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should create new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noBitwiseRule.create(context)
      const visitor2 = noBitwiseRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // DETECTION TESTS (30)
  // ============================================================
  describe('detecting bitwise AND (&)', () => {
    test('should report bitwise AND operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for & operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '&'")
      expect(reports[0].message).toContain('&&')
    })
  })

  describe('detecting bitwise OR (|)', () => {
    test('should report bitwise OR operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for | operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '|'")
      expect(reports[0].message).toContain('||')
    })
  })

  describe('detecting bitwise XOR (^)', () => {
    test('should report bitwise XOR operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for ^ operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '^'")
    })
  })

  describe('detecting bitwise NOT (~)', () => {
    test('should report bitwise NOT operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for ~ operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports[0].message).toContain("Unexpected use of bitwise NOT operator '~'")
    })
  })

  describe('detecting shift operators', () => {
    test('should report left shift operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))

      expect(reports.length).toBe(1)
    })

    test('should report right shift operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>'))

      expect(reports.length).toBe(1)
    })

    test('should report unsigned right shift operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>>'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for left shift', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '<<'")
    })

    test('should report correct message for right shift', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '>>'")
    })

    test('should report correct message for unsigned right shift', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>>'))

      expect(reports[0].message).toContain("Unexpected use of bitwise operator '>>>'")
    })
  })

  describe('detecting bitwise assignment operators', () => {
    test('should report bitwise AND assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&='))

      expect(reports.length).toBe(1)
    })

    test('should report bitwise OR assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('|='))

      expect(reports.length).toBe(1)
    })

    test('should report bitwise XOR assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('^='))

      expect(reports.length).toBe(1)
    })

    test('should report left shift assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('<<='))

      expect(reports.length).toBe(1)
    })

    test('should report right shift assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>='))

      expect(reports.length).toBe(1)
    })

    test('should report unsigned right shift assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>>='))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for &= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&='))

      expect(reports[0].message).toContain("Unexpected use of bitwise assignment operator '&='")
    })

    test('should report correct message for |= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('|='))

      expect(reports[0].message).toContain("Unexpected use of bitwise assignment operator '|='")
    })

    test('should report correct message for ^= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('^='))

      expect(reports[0].message).toContain("Unexpected use of bitwise assignment operator '^='")
    })

    test('should report correct message for <<= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('<<='))

      expect(reports[0].message).toContain("Unexpected use of bitwise assignment operator '<<='")
    })

    test('should report correct message for >>= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>='))

      expect(reports[0].message).toContain("Unexpected use of bitwise assignment operator '>>='")
    })

    test('should report correct message for >>>= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>>='))

      expect(reports[0].message).toContain("Unexpected use of bitwise assignment operator '>>>='")
    })
  })

  // ============================================================
  // ALLOW OPTION TESTS (12)
  // ============================================================
  describe('allow option', () => {
    test('should not report allowed operators', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&', '|'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(0)
    })

    test('should still report non-allowed operators when some are allowed', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('|')
    })

    test('should allow shift operators', () => {
      const { context, reports } = createBitwiseContext({
        allow: ['<<', '>>', '>>>'],
      })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))
      visitor.BinaryExpression(createBinaryExpression('>>'))
      visitor.BinaryExpression(createBinaryExpression('>>>'))

      expect(reports.length).toBe(0)
    })

    test('should allow bitwise NOT', () => {
      const { context, reports } = createBitwiseContext({ allow: ['~'] })
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports.length).toBe(0)
    })

    test('should allow bitwise XOR', () => {
      const { context, reports } = createBitwiseContext({ allow: ['^'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports.length).toBe(0)
    })

    test('should allow bitwise AND assignment', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&='] })
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&='))

      expect(reports.length).toBe(0)
    })

    test('should allow bitwise OR assignment', () => {
      const { context, reports } = createBitwiseContext({ allow: ['|='] })
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('|='))

      expect(reports.length).toBe(0)
    })

    test('should allow bitwise XOR assignment', () => {
      const { context, reports } = createBitwiseContext({ allow: ['^='] })
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('^='))

      expect(reports.length).toBe(0)
    })

    test('should allow left shift assignment', () => {
      const { context, reports } = createBitwiseContext({ allow: ['<<='] })
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('<<='))

      expect(reports.length).toBe(0)
    })

    test('should allow right shift assignment', () => {
      const { context, reports } = createBitwiseContext({ allow: ['>>='] })
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>='))

      expect(reports.length).toBe(0)
    })

    test('should allow unsigned right shift assignment', () => {
      const { context, reports } = createBitwiseContext({ allow: ['>>>='] })
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>>='))

      expect(reports.length).toBe(0)
    })

    test('should allow all operators when all are listed', () => {
      const { context, reports } = createBitwiseContext({
        allow: ['&', '|', '^', '~', '<<', '>>', '>>>', '&=', '|=', '^=', '<<=', '>>=', '>>>='],
      })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))
      visitor.BinaryExpression(createBinaryExpression('^'))
      visitor.BinaryExpression(createBinaryExpression('<<'))
      visitor.BinaryExpression(createBinaryExpression('>>'))
      visitor.BinaryExpression(createBinaryExpression('>>>'))
      visitor.UnaryExpression(createUnaryExpression('~'))
      visitor.AssignmentExpression(createAssignmentExpression('&='))
      visitor.AssignmentExpression(createAssignmentExpression('|='))
      visitor.AssignmentExpression(createAssignmentExpression('^='))
      visitor.AssignmentExpression(createAssignmentExpression('<<='))
      visitor.AssignmentExpression(createAssignmentExpression('>>='))
      visitor.AssignmentExpression(createAssignmentExpression('>>>='))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // NOT REPORTING NON-BITWISE OPERATORS (30)
  // ============================================================
  describe('not reporting non-bitwise operators', () => {
    test('should not report logical AND operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&&'))

      expect(reports.length).toBe(0)
    })

    test('should not report logical OR operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('||'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular assignment operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('='))

      expect(reports.length).toBe(0)
    })

    test('should not report arithmetic operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+'))
      visitor.BinaryExpression(createBinaryExpression('-'))
      visitor.BinaryExpression(createBinaryExpression('*'))

      expect(reports.length).toBe(0)
    })

    test('should not report addition operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+'))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-'))

      expect(reports.length).toBe(0)
    })

    test('should not report multiplication operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*'))

      expect(reports.length).toBe(0)
    })

    test('should not report division operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/'))

      expect(reports.length).toBe(0)
    })

    test('should not report modulo operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('%'))

      expect(reports.length).toBe(0)
    })

    test('should not report exponentiation operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('**'))

      expect(reports.length).toBe(0)
    })

    test('should not report less than operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<'))

      expect(reports.length).toBe(0)
    })

    test('should not report greater than operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>'))

      expect(reports.length).toBe(0)
    })

    test('should not report less than or equal operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<='))

      expect(reports.length).toBe(0)
    })

    test('should not report greater than or equal operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>='))

      expect(reports.length).toBe(0)
    })

    test('should not report equality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('=='))

      expect(reports.length).toBe(0)
    })

    test('should not report strict equality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('==='))

      expect(reports.length).toBe(0)
    })

    test('should not report inequality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('!='))

      expect(reports.length).toBe(0)
    })

    test('should not report strict inequality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('!=='))

      expect(reports.length).toBe(0)
    })

    test('should not report addition assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('+='))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('-='))

      expect(reports.length).toBe(0)
    })

    test('should not report multiplication assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('*='))

      expect(reports.length).toBe(0)
    })

    test('should not report division assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('/='))

      expect(reports.length).toBe(0)
    })

    test('should not report modulo assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('%='))

      expect(reports.length).toBe(0)
    })

    test('should not report exponentiation assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('**='))

      expect(reports.length).toBe(0)
    })

    test('should not report logical AND assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&&='))

      expect(reports.length).toBe(0)
    })

    test('should not report logical OR assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('||='))

      expect(reports.length).toBe(0)
    })

    test('should not report nullish coalescing assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('??='))

      expect(reports.length).toBe(0)
    })

    test('should not report unary minus operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('-'))

      expect(reports.length).toBe(0)
    })

    test('should not report unary plus operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+'))

      expect(reports.length).toBe(0)
    })

    test('should not report logical not operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('!'))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty allow option', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined allow option', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty rule config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x & y',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should handle null node for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: null,
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { end: { line: 1, column: 5 } },
      }
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle UnaryExpression with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '~',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }
      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle UnaryExpression with non-tilde operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '&=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property for UnaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        operator: '~',
        argument: { type: 'Identifier', name: 'x' },
      }
      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without operator for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle rule config with severity only (no options)', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x & y',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-bitwise': ['error'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION REPORTING (15)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for bitwise operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for bitwise NOT', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~', 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location for assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&=', 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location for bitwise AND', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&', 3, 4))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report correct location for left shift', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<', 20, 10))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for right shift', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>', 25, 15))

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location for unsigned right shift', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>>', 30, 20))

      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for |= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('|=', 12, 6))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report location for ^= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('^=', 14, 2))

      expect(reports[0].loc?.start.line).toBe(14)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for <<= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('<<=', 16, 4))

      expect(reports[0].loc?.start.line).toBe(16)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for >>= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>=', 18, 6))

      expect(reports[0].loc?.start.line).toBe(18)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report location for >>>= assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('>>>='), 22, 8)

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should report location with high line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&', 999, 50))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })
  })

  // ============================================================
  // MESSAGE QUALITY (10)
  // ============================================================
  describe('message quality', () => {
    test('should mention the operator in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports[0].message).toContain('&')
    })

    test('should suggest logical AND for bitwise AND', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports[0].message).toContain('&&')
    })

    test('should suggest logical OR for bitwise OR', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports[0].message).toContain('||')
    })

    test('should mention bitwise in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports[0].message).toContain('bitwise')
    })

    test('should contain "Unexpected" in binary message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "Unexpected" in unary message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "Unexpected" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&='))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should include operator name in binary message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))

      expect(reports[0].message).toContain('<<')
    })

    test('should say "bitwise assignment operator" for assignment expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('|='))

      expect(reports[0].message).toContain('bitwise assignment operator')
    })

    test('should say "bitwise NOT operator" for tilde', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports[0].message).toContain('bitwise NOT operator')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (10)
  // ============================================================
  describe('multiple reports', () => {
    test('should report multiple bitwise operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))
      visitor.BinaryExpression(createBinaryExpression('^'))

      expect(reports.length).toBe(3)
    })

    test('should report each occurrence separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(3)
    })

    test('should report mixed operator types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.UnaryExpression(createUnaryExpression('~'))
      visitor.AssignmentExpression(createAssignmentExpression('|='))

      expect(reports.length).toBe(3)
    })

    test('should report all shift operators together', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<'))
      visitor.BinaryExpression(createBinaryExpression('>>'))
      visitor.BinaryExpression(createBinaryExpression('>>>'))

      expect(reports.length).toBe(3)
    })

    test('should report all assignment operators together', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('&='))
      visitor.AssignmentExpression(createAssignmentExpression('|='))
      visitor.AssignmentExpression(createAssignmentExpression('^='))
      visitor.AssignmentExpression(createAssignmentExpression('<<='))
      visitor.AssignmentExpression(createAssignmentExpression('>>='))
      visitor.AssignmentExpression(createAssignmentExpression('>>>='))

      expect(reports.length).toBe(6)
    })

    test('should only report non-allowed in mixed scenario', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&', '|'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('|'))
      visitor.BinaryExpression(createBinaryExpression('^'))
      visitor.BinaryExpression(createBinaryExpression('<<'))

      expect(reports.length).toBe(2)
    })

    test('should preserve report order', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&', 1, 0))
      visitor.BinaryExpression(createBinaryExpression('|', 2, 0))
      visitor.BinaryExpression(createBinaryExpression('^', 3, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report interleaved operators correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('+'))
      visitor.BinaryExpression(createBinaryExpression('|'))
      visitor.BinaryExpression(createBinaryExpression('-'))

      expect(reports.length).toBe(2)
    })

    test('should not report any when all are allowed', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&', '~'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.UnaryExpression(createUnaryExpression('~'))

      expect(reports.length).toBe(0)
    })

    test('should handle mix of null and valid nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(null)
      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(undefined)
      visitor.BinaryExpression(createBinaryExpression('|'))

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================
  // CONTEXT VARIATIONS (10)
  // ============================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/utils/math.ts' })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/file.ts',
        source: 'x & y | z',
      })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with minimal context', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-bitwise': ['error', {}] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with warn severity config', () => {
      const { context, reports } = createMockRuleContext()
      const contextWarn: RuleContext = {
        ...context,
        config: { rules: { 'no-bitwise': ['warn'] } },
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(contextWarn)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with off severity config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-bitwise': ['off'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with rule config as single-element array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-bitwise': ['error'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with context that has no matching rule key', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'other-rule': ['error'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with non-array rule config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-bitwise': 'error' } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))

      expect(reports.length).toBe(1)
    })

    test('should work with allow containing unknown operators', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&', 'unknown', '<<'] })
      const visitor = noBitwiseRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&'))
      visitor.BinaryExpression(createBinaryExpression('<<'))

      expect(reports.length).toBe(0)
    })

    test('should work when report throws an error', () => {
      const context: RuleContext = {
        report: () => {
          throw new Error('report error')
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-bitwise': ['error'] } },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noBitwiseRule.create(context)

      expect(() => visitor.BinaryExpression(createBinaryExpression('&'))).toThrow('report error')
    })
  })

  // ============================================================
  // PARAMETERIZED TESTS WITH test.each (45+)
  // ============================================================
  describe('parameterized binary operator detection', () => {
    test('should report bitwise binary operator "&" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise binary operator "|" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('|'))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise binary operator "^" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('^'))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise binary operator "<<" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<<'))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise binary operator ">>" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>'))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise binary operator ">>>" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>>'))
      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized non-bitwise binary operators', () => {
    test('should not report non-bitwise binary operator "&&"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&&'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "||"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('||'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "+"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('+'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "-"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('-'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "*"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('*'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "/"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "%"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('%'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "**"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('**'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "<"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator ">"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "<="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator ">="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "=="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('=='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "==="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('==='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "!="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('!='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "!=="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('!=='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "in"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('in'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise binary operator "instanceof"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('instanceof'))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized assignment operator detection', () => {
    test('should report bitwise assignment operator "&=" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('&='))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise assignment operator "|=" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('|='))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise assignment operator "^=" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('^='))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise assignment operator "<<=" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('<<='))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise assignment operator ">>=" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('>>='))
      expect(reports.length).toBe(1)
    })

    test('should report bitwise assignment operator ">>>=" once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('>>>='))
      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized non-bitwise assignment operators', () => {
    test('should not report non-bitwise assignment operator "="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "+="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('+='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "-="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('-='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "*="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('*='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "/="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('/='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "%="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('%='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "**="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('**='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "&&="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('&&='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "||="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('||='))
      expect(reports.length).toBe(0)
    })

    test('should not report non-bitwise assignment operator "??="', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('??='))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized unary operators', () => {
    test('should handle unary operator "~" with 1 report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('~'))
      expect(reports.length).toBe(1)
    })

    test('should handle unary operator "-" with 0 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('-'))
      expect(reports.length).toBe(0)
    })

    test('should handle unary operator "+" with 0 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('+'))
      expect(reports.length).toBe(0)
    })

    test('should handle unary operator "!" with 0 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('!'))
      expect(reports.length).toBe(0)
    })

    test('should handle unary operator "typeof" with 0 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('typeof'))
      expect(reports.length).toBe(0)
    })

    test('should handle unary operator "void" with 0 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('void'))
      expect(reports.length).toBe(0)
    })

    test('should handle unary operator "delete" with 0 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.UnaryExpression(createUnaryExpression('delete'))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized allow option for binary operators', () => {
    test('should allow binary operator "&" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&'] })
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))
      expect(reports.length).toBe(0)
    })

    test('should allow binary operator "|" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['|'] })
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('|'))
      expect(reports.length).toBe(0)
    })

    test('should allow binary operator "^" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['^'] })
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('^'))
      expect(reports.length).toBe(0)
    })

    test('should allow binary operator "<<" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['<<'] })
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<<'))
      expect(reports.length).toBe(0)
    })

    test('should allow binary operator ">>" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['>>'] })
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>'))
      expect(reports.length).toBe(0)
    })

    test('should allow binary operator ">>>" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['>>>'] })
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>>'))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized allow option for assignment operators', () => {
    test('should allow assignment operator "&=" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['&='] })
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('&='))
      expect(reports.length).toBe(0)
    })

    test('should allow assignment operator "|=" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['|='] })
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('|='))
      expect(reports.length).toBe(0)
    })

    test('should allow assignment operator "^=" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['^='] })
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('^='))
      expect(reports.length).toBe(0)
    })

    test('should allow assignment operator "<<=" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['<<='] })
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('<<='))
      expect(reports.length).toBe(0)
    })

    test('should allow assignment operator ">>=" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['>>='] })
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('>>='))
      expect(reports.length).toBe(0)
    })

    test('should allow assignment operator ">>>=" when listed in allow', () => {
      const { context, reports } = createBitwiseContext({ allow: ['>>>='] })
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('>>>='))
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized binary message content', () => {
    test('should include operator "&" in message for binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&'))
      expect(reports[0].message).toContain('&')
    })

    test('should include operator "|" in message for binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('|'))
      expect(reports[0].message).toContain('|')
    })

    test('should include operator "^" in message for binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('^'))
      expect(reports[0].message).toContain('^')
    })

    test('should include operator "<<" in message for binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<<'))
      expect(reports[0].message).toContain('<<')
    })

    test('should include operator ">>" in message for binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>'))
      expect(reports[0].message).toContain('>>')
    })

    test('should include operator ">>>" in message for binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>>'))
      expect(reports[0].message).toContain('>>>')
    })
  })

  describe('parameterized assignment message content', () => {
    test('should include operator "&=" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('&='))
      expect(reports[0].message).toContain('&=')
    })

    test('should include operator "|=" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('|='))
      expect(reports[0].message).toContain('|=')
    })

    test('should include operator "^=" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('^='))
      expect(reports[0].message).toContain('^=')
    })

    test('should include operator "<<=" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('<<='))
      expect(reports[0].message).toContain('<<=')
    })

    test('should include operator ">>=" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('>>='))
      expect(reports[0].message).toContain('>>=')
    })

    test('should include operator ">>>=" in assignment message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.AssignmentExpression(createAssignmentExpression('>>>='))
      expect(reports[0].message).toContain('>>>=')
    })
  })

  describe('parameterized location reporting for binary operators', () => {
    test('should report correct location for "&" at line 1 col 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('&', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for "|" at line 5 col 10', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('|', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for "^" at line 100 col 50', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('^', 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location for "<<" at line 1 col 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<<', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for ">>" at line 25 col 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>', 25, 0))
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for ">>>" at line 50 col 100', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noBitwiseRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('>>>', 50, 100))
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(100)
    })
  })
})
