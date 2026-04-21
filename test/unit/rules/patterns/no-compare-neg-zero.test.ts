import { describe, test, expect, vi } from 'vitest'
import { noCompareNegZeroRule } from '../../../../src/rules/patterns/no-compare-neg-zero.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

describe('no-compare-neg-zero rule', () => {
  // ============================================================
  // META PROPERTIES (20 tests)
  // ============================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCompareNegZeroRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noCompareNegZeroRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noCompareNegZeroRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noCompareNegZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noCompareNegZeroRule.meta.schema).toBeDefined()
    })

    test('should have fixable set to code', () => {
      expect(noCompareNegZeroRule.meta.fixable).toBe('code')
    })

    test('should mention -0 in description', () => {
      expect(noCompareNegZeroRule.meta.docs?.description).toContain('-0')
    })

    test('should mention Object.is in description', () => {
      expect(noCompareNegZeroRule.meta.docs?.description).toContain('Object.is')
    })

    test('should have a docs object', () => {
      expect(noCompareNegZeroRule.meta.docs).toBeDefined()
    })

    test('should have a string description in docs', () => {
      expect(typeof noCompareNegZeroRule.meta.docs?.description).toBe('string')
    })

    test('should have a non-empty description', () => {
      expect(noCompareNegZeroRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a string', () => {
      expect(typeof noCompareNegZeroRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noCompareNegZeroRule.meta.severity).toBe('string')
    })

    test('should have a valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noCompareNegZeroRule.meta.type)
    })

    test('should have a valid severity level', () => {
      expect(['off', 'warn', 'error']).toContain(noCompareNegZeroRule.meta.severity)
    })

    test('should have fixable as a string value', () => {
      expect(typeof noCompareNegZeroRule.meta.fixable).toBe('string')
    })

    test('should have a valid fixable value', () => {
      expect(['code', 'whitespace']).toContain(noCompareNegZeroRule.meta.fixable)
    })

    test('should have docs.category as a string', () => {
      expect(typeof noCompareNegZeroRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as a boolean', () => {
      expect(typeof noCompareNegZeroRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.url defined', () => {
      expect(noCompareNegZeroRule.meta.docs?.url).toBeDefined()
    })
  })

  // ============================================================
  // CREATE / VISITOR STRUCTURE (10 tests)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBe(null)
    })

    test('should have BinaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor1 = noCompareNegZeroRule.create(context)
      const visitor2 = noCompareNegZeroRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should create visitor that works with different context instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'x === -0;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'x === -0;' })
      const visitor1 = noCompareNegZeroRule.create(ctx1)
      const visitor2 = noCompareNegZeroRule.create(ctx2)

      visitor1.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor2.BinaryExpression(
        createBinaryExpression('===', createIdentifier('y'), createLiteral(0)),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should have create as a function on the rule', () => {
      expect(typeof noCompareNegZeroRule.create).toBe('function')
    })

    test('should have meta as an object on the rule', () => {
      expect(typeof noCompareNegZeroRule.meta).toBe('object')
      expect(noCompareNegZeroRule.meta).not.toBe(null)
    })

    test('should not throw when creating visitor with valid context', () => {
      expect(() => {
        const { context } = createMockRuleContext({ source: 'x === -0;' })
        noCompareNegZeroRule.create(context)
      }).not.toThrow()
    })

    test('should have exactly one visitor method (BinaryExpression)', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(Object.keys(visitor)).toContain('BinaryExpression')
    })

    test('should handle BinaryExpression being called multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('y'), createLiteral(0)),
      )

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================
  // DETECTION: x === -0, x == -0, -0 === x, -0 == x, !==, != (20 tests)
  // ============================================================
  describe('detecting comparisons with -0', () => {
    test('should report x === -0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.is')
    })

    test('should report -0 === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createUnaryExpression('-', createLiteral(0)),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == -0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '==',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -0 == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '==',
        createUnaryExpression('-', createLiteral(0)),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== -0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Object.is')
    })

    test('should report x != -0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -0 !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createUnaryExpression('-', createLiteral(0)),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -0 != x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createUnaryExpression('-', createLiteral(0)),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with variable identifier on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('myVar'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with variable identifier on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createLiteral(0), createIdentifier('myVar')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with property access on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('val'),
      }

      visitor.BinaryExpression(createBinaryExpression('===', memberExpr, createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should report with call expression on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('getValue'),
        arguments: [],
      }

      visitor.BinaryExpression(createBinaryExpression('===', callExpr, createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should report with different identifier names', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('result'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('value'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('num'), createLiteral(0)),
      )

      expect(reports.length).toBe(3)
    })

    test('should report x === 0 (literal 0 treated as potential -0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 0 === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createLiteral(0), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x == 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 0 == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createLiteral(0), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x !== 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 0 !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createLiteral(0), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x != 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING VALID COMPARISONS (20 tests)
  // ============================================================
  describe('not reporting valid comparisons', () => {
    test('should not report x === 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(1)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x < 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x > 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x <= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<=', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('>=', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x + 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x - 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x * 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x / 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x % 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('%', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report x ** 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('**', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(2)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createIdentifier('x'),
          createUnaryExpression('-', createLiteral(2)),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === true', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x === ""', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral('')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x | 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|', createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (20 tests)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node (string) gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
    })

    test('should handle non-object node (number) gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle non-object node (boolean) gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle null left operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', null, createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle null right operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createLiteral(0), null)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle both null operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', null, null)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined left operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', undefined, createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined right operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createLiteral(0), undefined)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle literal with raw property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), {
        type: 'Literal',
        value: 0,
        raw: '0',
      })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle unary +0 (not negative zero)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createUnaryExpression('+', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle unary ~0 (bitwise NOT)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createUnaryExpression('~', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle nested binary expression as operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const innerBinary = createBinaryExpression('+', createIdentifier('a'), createIdentifier('b'))

      visitor.BinaryExpression(createBinaryExpression('===', innerBinary, createLiteral(0)))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // LOCATION REPORTING (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location with specific line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 25, 10)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 9999, 42),
      )

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 5, 3),
      )

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {},
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should provide default location when loc is missing entirely', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve column offset across different positions', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 10, 20),
      )

      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle loc where start.line is NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: NaN as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle multiple reports with different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('y'), createLiteral(0), 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: null,
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // MESSAGE CONTENT (15 tests)
  // ============================================================
  describe('message quality', () => {
    test('should mention Object.is for === comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('Object.is')
    })

    test('should mention !Object.is for !== comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('!Object.is')
    })

    test('should mention operator === in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('===')
    })

    test('should mention -0 in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('-0')
    })

    test('should mention operator == in message for loose equality', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('==')
    })

    test('should mention operator != in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('!=')
    })

    test('should mention operator !== in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('!==')
    })

    test('should have different messages for === vs !==', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'x === -0;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'x === -0;' })
      const v1 = noCompareNegZeroRule.create(ctx1)
      const v2 = noCompareNegZeroRule.create(ctx2)

      v1.BinaryExpression(createBinaryExpression('===', createIdentifier('x'), createLiteral(0)))
      v2.BinaryExpression(createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)))

      expect(r1[0].message).not.toBe(r2[0].message)
    })

    test('should have same message for === and ==', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'x === -0;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'x === -0;' })
      const v1 = noCompareNegZeroRule.create(ctx1)
      const v2 = noCompareNegZeroRule.create(ctx2)

      v1.BinaryExpression(createBinaryExpression('===', createIdentifier('x'), createLiteral(0)))
      v2.BinaryExpression(createBinaryExpression('==', createIdentifier('x'), createLiteral(0)))

      expect(r1[0].message).toContain('Object.is')
      expect(r2[0].message).toContain('Object.is')
    })

    test('should have same message pattern for !== and !=', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'x === -0;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'x === -0;' })
      const v1 = noCompareNegZeroRule.create(ctx1)
      const v2 = noCompareNegZeroRule.create(ctx2)

      v1.BinaryExpression(createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)))
      v2.BinaryExpression(createBinaryExpression('!=', createIdentifier('x'), createLiteral(0)))

      expect(r1[0].message).toContain('!Object.is')
      expect(r2[0].message).toContain('!Object.is')
    })

    test('should produce a non-empty message string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce a descriptive message with context', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      const msg = reports[0].message
      expect(msg).toContain('Comparing')
      expect(msg).toContain('-0')
    })

    test('should mention "will return true" for === operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('will return true')
    })

    test('should mention "will return false" for !== operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('will return false')
    })

    test('should mention "distinguish" in message for ===', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('distinguish')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (15 tests)
  // ============================================================
  describe('multiple reports', () => {
    test('should report each comparison independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('y'), createLiteral(0)),
      )

      expect(reports.length).toBe(2)
    })

    test('should report three comparisons in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('b'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('c'), createLiteral(0)),
      )

      expect(reports.length).toBe(3)
    })

    test('should report mix of matching and non-matching comparisons', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('y'), createLiteral(1)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('z'), createLiteral(0)),
      )

      expect(reports.length).toBe(2)
    })

    test('should report five consecutive comparisons', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('===', createIdentifier(`x${i}`), createLiteral(0)),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report ten consecutive comparisons', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('===', createIdentifier(`v${i}`), createLiteral(0)),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle interleaved reports and non-reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(createBinaryExpression('<', createIdentifier('x'), createLiteral(0)))
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('y'), createLiteral(0)),
      )
      visitor.BinaryExpression(createBinaryExpression('>', createIdentifier('z'), createLiteral(0)))

      expect(reports.length).toBe(2)
    })

    test('should report all four equality operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(4)
    })

    test('should not carry state between visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'x === -0;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'x === -0;' })

      const v1 = noCompareNegZeroRule.create(ctx1)
      const v2 = noCompareNegZeroRule.create(ctx2)

      v1.BinaryExpression(createBinaryExpression('===', createIdentifier('x'), createLiteral(0)))
      v1.BinaryExpression(createBinaryExpression('===', createIdentifier('y'), createLiteral(0)))

      v2.BinaryExpression(createBinaryExpression('===', createIdentifier('z'), createLiteral(0)))

      expect(r1.length).toBe(2)
      expect(r2.length).toBe(1)
    })

    test('should report comparisons with different identifier names on both sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('foo'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createLiteral(0), createIdentifier('bar')),
      )

      expect(reports.length).toBe(2)
    })

    test('should report comparisons with unary -0 on different sides', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createIdentifier('x'),
          createUnaryExpression('-', createLiteral(0)),
        ),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('-', createLiteral(0)),
          createIdentifier('x'),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report comparison with literal 0 and unary -0 in same session', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createIdentifier('y'),
          createUnaryExpression('-', createLiteral(0)),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report if only non-equality operators are used', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<', createIdentifier('x'), createLiteral(0)))
      visitor.BinaryExpression(createBinaryExpression('>', createIdentifier('x'), createLiteral(0)))
      visitor.BinaryExpression(
        createBinaryExpression('<=', createIdentifier('x'), createLiteral(0)),
      )
      visitor.BinaryExpression(
        createBinaryExpression('>=', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report 20 consecutive comparisons', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('===', createIdentifier(`var${i}`), createLiteral(0), i + 1, 0),
        )
      }

      expect(reports.length).toBe(20)
    })

    test('should preserve order of reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('y'), createLiteral(0), 2, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('z'), createLiteral(0), 3, 0),
      )

      expect(reports[0].message).toContain('===')
      expect(reports[1].message).toContain('==')
      expect(reports[2].message).toContain('!==')
    })

    test('should report correctly with many non-matching nodes in between', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.BinaryExpression(
          createBinaryExpression('+', createIdentifier(`a${i}`), createLiteral(0)),
        )
      }

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('target'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // CONTEXT VARIATIONS (15 tests)
  // ============================================================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/project/src/utils/math.ts',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const result = x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code string', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with complex source code', () => {
      const { context, reports } = createMockRuleContext({
        source: 'function check() { if (x === 0) return true; }',
        filePath: '/src/deep/module/file.ts',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/src/index.js',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/src/components/App.tsx',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/project/src/features/auth/utils/validate.ts',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ strict: true, level: 'error' }],
        source: 'x === -0;',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with workspace root variation', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'x === -0;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with source containing multiple lines', () => {
      const source = `line 1
line 2
x === -0;
line 4`
      const { context, reports } = createMockRuleContext({ source })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with minimal source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'x===0', filePath: '/src/f.ts' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work when source has unicode characters', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/src/日本語.ts',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: 'C:\\Users\\dev\\project\\src\\file.ts',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .vue file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/src/views/Home.vue',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with .svelte file path', () => {
      const { context, reports } = createMockRuleContext({
        source: 'x === -0;',
        filePath: '/src/lib/Counter.svelte',
      })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // TEST.EACH: SAFE / NON-MATCHING CASES (20 tests)
  // ============================================================
  describe('non-matching operators batch', () => {
    test.each([
      { op: '<', desc: 'less than' },
      { op: '>', desc: 'greater than' },
      { op: '<=', desc: 'less than or equal' },
      { op: '>=', desc: 'greater than or equal' },
      { op: '+', desc: 'addition' },
      { op: '-', desc: 'subtraction' },
      { op: '*', desc: 'multiplication' },
      { op: '/', desc: 'division' },
      { op: '%', desc: 'modulo' },
      { op: '**', desc: 'exponentiation' },
      { op: '&', desc: 'bitwise AND' },
      { op: '|', desc: 'bitwise OR' },
      { op: '^', desc: 'bitwise XOR' },
      { op: '<<', desc: 'left shift' },
      { op: '>>', desc: 'right shift' },
      { op: '>>>', desc: 'unsigned right shift' },
      { op: 'in', desc: 'in operator' },
      { op: 'instanceof', desc: 'instanceof operator' },
    ] as Array<{ op: string; desc: string }>)(
      'should not report for $desc ($op) operator with 0',
      ({ op }) => {
        const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
        const visitor = noCompareNegZeroRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression(op, createIdentifier('x'), createLiteral(0)),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  // ============================================================
  // TEST.EACH: MATCHING CASES (20 tests)
  // ============================================================
  describe('matching equality operators batch', () => {
    test.each([
      {
        op: '===',
        side: 'right',
        value: 'literal 0',
        desc: 'strict equal with literal 0 on right',
      },
      { op: '===', side: 'left', value: 'literal 0', desc: 'strict equal with literal 0 on left' },
      { op: '==', side: 'right', value: 'literal 0', desc: 'loose equal with literal 0 on right' },
      { op: '==', side: 'left', value: 'literal 0', desc: 'loose equal with literal 0 on left' },
      {
        op: '!==',
        side: 'right',
        value: 'literal 0',
        desc: 'strict not equal with literal 0 on right',
      },
      {
        op: '!==',
        side: 'left',
        value: 'literal 0',
        desc: 'strict not equal with literal 0 on left',
      },
      {
        op: '!=',
        side: 'right',
        value: 'literal 0',
        desc: 'loose not equal with literal 0 on right',
      },
      {
        op: '!=',
        side: 'left',
        value: 'literal 0',
        desc: 'loose not equal with literal 0 on left',
      },
      { op: '===', side: 'right', value: 'unary -0', desc: 'strict equal with unary -0 on right' },
      { op: '===', side: 'left', value: 'unary -0', desc: 'strict equal with unary -0 on left' },
      { op: '==', side: 'right', value: 'unary -0', desc: 'loose equal with unary -0 on right' },
      { op: '==', side: 'left', value: 'unary -0', desc: 'loose equal with unary -0 on left' },
      {
        op: '!==',
        side: 'right',
        value: 'unary -0',
        desc: 'strict not equal with unary -0 on right',
      },
      {
        op: '!==',
        side: 'left',
        value: 'unary -0',
        desc: 'strict not equal with unary -0 on left',
      },
      {
        op: '!=',
        side: 'right',
        value: 'unary -0',
        desc: 'loose not equal with unary -0 on right',
      },
      { op: '!=', side: 'left', value: 'unary -0', desc: 'loose not equal with unary -0 on left' },
    ] as Array<{ op: string; side: string; value: string; desc: string }>)(
      'should report for $desc',
      ({ op, side, value }) => {
        const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
        const visitor = noCompareNegZeroRule.create(context)

        const zero =
          value === 'unary -0' ? createUnaryExpression('-', createLiteral(0)) : createLiteral(0)
        const id = createIdentifier('x')

        const node =
          side === 'right'
            ? createBinaryExpression(op, id, zero)
            : createBinaryExpression(op, zero, id)

        visitor.BinaryExpression(node)

        expect(reports.length).toBe(1)
      },
    )
  })

  // ============================================================
  // TEST.EACH: NON-ZERO LITERALS (15 tests)
  // ============================================================
  describe('non-zero literals should not trigger', () => {
    test.each([
      { val: 1, desc: 'positive one' },
      { val: -1, desc: 'negative one (as literal)' },
      { val: 0.5, desc: 'positive float' },
      { val: -0.5, desc: 'negative float' },
      { val: 100, desc: 'positive hundred' },
      { val: -100, desc: 'negative hundred' },
      { val: 0.1, desc: 'small positive float' },
      { val: 3.14, desc: 'pi approximation' },
      { val: 42, desc: 'the answer' },
      { val: 255, desc: 'max byte' },
      { val: NaN, desc: 'NaN' },
      { val: Infinity, desc: 'Infinity' },
      { val: -Infinity, desc: 'negative Infinity' },
    ] as Array<{ val: number; desc: string }>)('should not report for $desc ($val)', ({ val }) => {
      const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(val)),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // TEST.EACH: NON-NUMBER LITERALS (10 tests)
  // ============================================================
  describe('non-number literals should not trigger', () => {
    test.each([
      { val: 'hello', desc: 'string' },
      { val: '', desc: 'empty string' },
      { val: '0', desc: 'string zero' },
      { val: null, desc: 'null' },
      { val: true, desc: 'true' },
      { val: false, desc: 'false' },
      { val: undefined, desc: 'undefined' },
    ] as Array<{ val: unknown; desc: string }>)(
      'should not report for $desc literal',
      ({ val }) => {
        const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
        const visitor = noCompareNegZeroRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('===', createIdentifier('x'), createLiteral(val)),
        )

        expect(reports.length).toBe(0)
      },
    )
  })

  // ============================================================
  // TEST.EACH: UNARY EXPRESSIONS NOT -0 (10 tests)
  // ============================================================
  describe('unary expressions that are not -0', () => {
    test.each([
      { op: '-', arg: 1, desc: '-1' },
      { op: '-', arg: 5, desc: '-5' },
      { op: '-', arg: 0.5, desc: '-0.5' },
      { op: '+', arg: 0, desc: '+0' },
      { op: '+', arg: 1, desc: '+1' },
      { op: '~', arg: 0, desc: '~0' },
      { op: '~', arg: 1, desc: '~1' },
      { op: '!', arg: 0, desc: '!0' },
      { op: '!', arg: 1, desc: '!1' },
      { op: '-', arg: -1, desc: '-(-1)' },
    ] as Array<{ op: string; arg: number; desc: string }>)(
      'should not report for $desc',
      ({ op, arg }) => {
        const { context, reports } = createMockRuleContext({ source: 'x === -0;' })
        const visitor = noCompareNegZeroRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression(
            '===',
            createIdentifier('x'),
            createUnaryExpression(op, createLiteral(arg)),
          ),
        )

        expect(reports.length).toBe(0)
      },
    )
  })
})
