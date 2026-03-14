import { describe, test, expect, vi } from 'vitest'
import { noSimplifiablePatternRule } from '../../../../src/rules/patterns/no-simplifiable-pattern.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
  data?: { test: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'x ? true : false;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
        data: descriptor.data,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
    range: [column, column + 20],
  }
}

function createIdentifier(name: string, start = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + name.length },
    },
    range: [start, start + name.length],
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown, start = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line: 1, column: start },
      end: { line: 1, column: start + 5 },
    },
    range: [start, start + 5],
  }
}

describe('no-simplifiable-pattern rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noSimplifiablePatternRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noSimplifiablePatternRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noSimplifiablePatternRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSimplifiablePatternRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(noSimplifiablePatternRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noSimplifiablePatternRule.meta.fixable).toBe('code')
    })

    test('should mention ternary in description', () => {
      expect(noSimplifiablePatternRule.meta.docs?.description.toLowerCase()).toContain('ternary')
    })

    test('should mention simplified in description', () => {
      expect(noSimplifiablePatternRule.meta.docs?.description.toLowerCase()).toContain('simplif')
    })
  })

  describe('create', () => {
    test('should return visitor object with ConditionalExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })
  })

  describe('detecting x ? true : false pattern', () => {
    test('should report x ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!!{{test}}')
      expect(reports[0].message).toContain('Boolean({{test}})')
      expect(reports[0].data?.test).toBe('x')
    })

    test('should report value ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('value')
    })

    test('should report flag ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('flag')
    })

    test('should provide fix to !!test', () => {
      const source = 'x ? true : false;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!!x')
      expect(reports[0].fix?.range).toEqual([0, 20])
    })
  })

  describe('detecting x ? false : true pattern', () => {
    test('should report x ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!{{test}}')
      expect(reports[0].data?.test).toBe('x')
    })

    test('should report condition ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('condition'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })

    test('should provide fix to !test', () => {
      const source = 'x ? false : true;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!x')
      expect(reports[0].fix?.range).toEqual([0, 20])
    })
  })

  describe('detecting !!x ? true : false pattern', () => {
    test('should report !!x ? true : false with special message about already being boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        },
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 4 },
        },
      }
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('already a boolean')
      expect(reports[0].message).toContain('!!{{test}}')
    })

    test('should provide fix to x (remove unnecessary ternary)', () => {
      const source = '!!x ? true : false;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x', 2),
          prefix: true,
          range: [1, 3],
        },
        prefix: true,
        range: [0, 3],
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('!!x')
    })
  })

  describe('valid patterns that should not report', () => {
    test('should not report x ? 1 : 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(1),
        createLiteral(0),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? "yes" : "no"', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral('yes'),
        createLiteral('no'),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? true : null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(null),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? null : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(null),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? false : null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(false),
        createLiteral(null),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ? undefined : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(undefined),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report !x ? true : false (can be simplified to !!(!x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 1)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !x ? false : true (can be simplified to !(!x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 1)
      const node = createConditionalExpression(testNode, createLiteral(false), createLiteral(true))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report !!x ? false : true (can be simplified to !(!!x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'), 3)
      const testNode = createUnaryExpression('!', innerNot, 2)
      const node = createConditionalExpression(testNode, createLiteral(false), createLiteral(true))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      expect(() => visitor.ConditionalExpression('string')).not.toThrow()
      expect(() => visitor.ConditionalExpression(123)).not.toThrow()
      expect(() => visitor.ConditionalExpression(true)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without test', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        consequent: createLiteral(true),
        alternate: createLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node without consequent', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        alternate: createLiteral(false),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node without alternate', () => {
      const { context } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
      }

      expect(() => visitor.ConditionalExpression(node)).not.toThrow()
    })

    test('should handle node without loc but with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
        range: [0, 20],
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createIdentifier('x'),
        consequent: createLiteral(true),
        alternate: createLiteral(false),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
        42,
        15,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-identifier test in getTestDescription (uses "condition")', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = createUnaryExpression('!', createIdentifier('x'), 1)
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].data?.test).toBe('condition')
    })
  })

  describe('message quality', () => {
    test('should mention unnecessary ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('should mention !!{{test}} for true:false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!!{{test}}')
    })

    test('should mention Boolean({{test}}) for true:false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x'),
        createLiteral(true),
        createLiteral(false),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('Boolean({{test}})')
    })

    test('should mention !{{test}} for false:true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('flag'),
        createLiteral(false),
        createLiteral(true),
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].message).toContain('!{{test}}')
    })

    test('should mention !!{{test}} for !!x ? true : false (special case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        },
        prefix: true,
      }
      const node = createConditionalExpression(testNode, createLiteral(true), createLiteral(false))

      visitor.ConditionalExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!!{{test}}')
      expect(reports[0].message).toContain('already a boolean')
    })
  })

  describe('fix functionality', () => {
    test('should provide fix for x ? true : false', () => {
      const source = 'x ? true : false;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('x', 0),
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!x')
    })

    test('should provide fix for x ? false : true', () => {
      const source = 'value ? false : true;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSimplifiablePatternRule.create(context)

      const node = createConditionalExpression(
        createIdentifier('value', 0),
        createLiteral(false),
        createLiteral(true),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!value')
    })

    test('should provide fix for !!x ? true : false (special case - fix to !!x)', () => {
      const source = '!!x ? true : false;'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noSimplifiablePatternRule.create(context)

      const testNode = {
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x', 2),
          prefix: true,
          range: [1, 3],
        },
        prefix: true,
        range: [0, 3],
      }
      const node = createConditionalExpression(
        testNode,
        createLiteral(true),
        createLiteral(false),
        1,
        0,
      )

      visitor.ConditionalExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('!!x')
    })
  })
})
