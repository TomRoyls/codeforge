import { describe, test, expect } from 'vitest'
import { noUnnecessaryNullishCoalescingRule } from '../../../../src/rules/patterns/no-unnecessary-nullish-coalescing.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function binaryExpression(
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

function identifier(name: string): unknown {
  return { type: 'Identifier', name, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: name.length } } }
}

function nullLiteralEstree(): unknown {
  return { type: 'Literal', value: null, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } } }
}

function nullLiteralBabel(): unknown {
  return { type: 'NullLiteral', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } } }
}

function undefinedIdentifier(): unknown {
  return { type: 'Identifier', name: 'undefined', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } } }
}

function undefinedLiteralBabel(): unknown {
  return { type: 'UndefinedLiteral', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } } }
}

function numberLiteral(n: number): unknown {
  return { type: 'Literal', value: n, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } } }
}

function stringLiteral(s: string): unknown {
  return { type: 'Literal', value: s, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: s.length + 2 } } }
}

describe('no-unnecessary-nullish-coalescing rule', () => {
  describe('meta', () => {
    test('has suggestion type', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.type).toBe('suggestion')
    })

    test('has warn severity', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.severity).toBe('warn')
    })

    test('is not recommended by default', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.docs?.recommended).toBe(false)
    })

    test('has patterns category', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.docs?.category).toBe('patterns')
    })

    test('has empty schema', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.schema).toEqual([])
    })

    test('has a description', () => {
      expect(typeof noUnnecessaryNullishCoalescingRule.meta.docs?.description).toBe('string')
      expect((noUnnecessaryNullishCoalescingRule.meta.docs?.description ?? '').length).toBeGreaterThan(0)
    })

    test('description mentions nullish coalescing', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.docs?.description.toLowerCase()).toContain('nullish')
    })

    test('has url in docs', () => {
      expect(noUnnecessaryNullishCoalescingRule.meta.docs?.url).toBeDefined()
    })

    test('has create function', () => {
      expect(typeof noUnnecessaryNullishCoalescingRule.create).toBe('function')
    })
  })

  describe('reports unnecessary ?? null (ESTree)', () => {
    test('reports x ?? null where null is ESTree Literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), nullLiteralEstree()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('`null`')
    })

    test('reports foo ?? null at arbitrary line/column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(
        binaryExpression('??', identifier('foo'), nullLiteralEstree(), 7, 4),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  describe('reports unnecessary ?? null (Babel)', () => {
    test('reports x ?? null where null is Babel NullLiteral', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), nullLiteralBabel()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('`null`')
    })
  })

  describe('reports unnecessary ?? undefined (ESTree)', () => {
    test('reports x ?? undefined where undefined is an Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), undefinedIdentifier()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('`undefined`')
    })
  })

  describe('reports unnecessary ?? undefined (Babel)', () => {
    test('reports x ?? undefined where undefined is UndefinedLiteral', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), undefinedLiteralBabel()))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('`undefined`')
    })
  })

  describe('does not report meaningful fallbacks', () => {
    test('does not report x ?? 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), numberLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('does not report x ?? ""', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), stringLiteral('')))

      expect(reports.length).toBe(0)
    })

    test('does not report x ?? "default"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), stringLiteral('default')))

      expect(reports.length).toBe(0)
    })

    test('does not report x ?? false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), { type: 'Literal', value: false }))

      expect(reports.length).toBe(0)
    })

    test('does not report x ?? y (identifier fallback)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), identifier('y')))

      expect(reports.length).toBe(0)
    })

    test('does not report config ?? {} (object fallback)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('config'), { type: 'ObjectExpression', properties: [] }))

      expect(reports.length).toBe(0)
    })

    test('does not report list ?? [] (array fallback)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('list'), { type: 'ArrayExpression', elements: [] }))

      expect(reports.length).toBe(0)
    })
  })

  describe('does not report other operators', () => {
    test.each([
      '==', '!=', '===', '!==',
      '<', '>', '<=', '>=',
      '+', '-', '*', '/', '%', '**',
      '&', '|', '^', '<<', '>>', '>>>',
      '&&', '||',
      'in', 'instanceof',
    ])('does not report %s operator', (op) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression(op, identifier('a'), identifier('b')))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('handles null node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('handles undefined node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('handles primitive input', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('handles non-BinaryExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression({ type: 'CallExpression', callee: identifier('f'), arguments: [] })

      expect(reports.length).toBe(0)
    })

    test('handles ?? with missing right operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '??', left: identifier('x') })

      expect(reports.length).toBe(0)
    })

    test('handles ?? with primitive right operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '??',
        left: identifier('x'),
        right: 'string-primitive',
      })

      expect(reports.length).toBe(0)
    })

    test('handles ?? with null right but missing left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '??',
        right: nullLiteralEstree(),
      })

      expect(reports.length).toBe(1)
    })

    test('reports once per occurrence (not twice for null+undefined)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      visitor.BinaryExpression(binaryExpression('??', identifier('x'), nullLiteralEstree()))

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor shape', () => {
    test('returns a BinaryExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryNullishCoalescingRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('creates independent visitors per context', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = noUnnecessaryNullishCoalescingRule.create(ctx1)
      const v2 = noUnnecessaryNullishCoalescingRule.create(ctx2)

      v1.BinaryExpression(binaryExpression('??', identifier('a'), nullLiteralEstree()))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('handles manual RuleContext without helpers', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => 'x ?? null',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        workspaceRoot: '/src',
      } as unknown as Parameters<typeof noUnnecessaryNullishCoalescingRule.create>[0]

      const visitor = noUnnecessaryNullishCoalescingRule.create(context)
      visitor.BinaryExpression(binaryExpression('??', identifier('x'), nullLiteralEstree()))

      expect(reports.length).toBe(1)
    })
  })
})
