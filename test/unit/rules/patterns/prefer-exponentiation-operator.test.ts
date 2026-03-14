import { describe, test, expect, vi } from 'vitest'
import { preferExponentiationOperatorRule } from '../../../../src/rules/patterns/prefer-exponentiation-operator.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'Math.pow(2, 3);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: createIdentifier(property),
    computed: false,
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

describe('prefer-exponentiation-operator rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferExponentiationOperatorRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferExponentiationOperatorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferExponentiationOperatorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferExponentiationOperatorRule.meta.fixable).toBe('code')
    })

    test('should mention ** operator in description', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.description).toContain('**')
    })

    test('should mention Math.pow in description', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.description).toContain('Math.pow')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting Math.pow() calls', () => {
    test('should report Math.pow(2, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('**')
    })

    test('should report Math.pow(x, y)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('x'), createIdentifier('y')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(2, 0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(0.5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(base, exponent)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        createIdentifier('base'),
        createIdentifier('exponent'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid code', () => {
    test('should not report Math.sqrt()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'sqrt')
      const node = createCallExpression(callee, [createLiteral(4)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'max')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.min()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'min')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report pow() without Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = createCallExpression(createIdentifier('pow'), [
        createLiteral(2),
        createLiteral(3),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myMath.pow()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('myMath'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.pow accessed via computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property: createLiteral('pow'),
          computed: true,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 42, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention ** operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message).toContain('**')
    })

    test('should mention Math.pow in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message).toContain('Math.pow')
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for Math.pow(2, 3)', () => {
      const source = 'Math.pow(2, 3)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 2, range: [9, 10] },
          { type: 'Literal', value: 3, range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('2 ** 3')
      expect(reports[0].fix?.range).toEqual([0, 14])
    })

    test('should provide fix for Math.pow(x, y)', () => {
      const source = 'Math.pow(x, y)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Identifier', name: 'x', range: [9, 10] },
          { type: 'Identifier', name: 'y', range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('x ** y')
    })

    test('should provide fix for Math.pow(base + 1, 2)', () => {
      const source = 'Math.pow(base + 1, 2)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'BinaryExpression', range: [9, 17] },
          { type: 'Literal', value: 2, range: [19, 20] },
        ],
        range: [0, 21] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 21 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('base + 1 ** 2')
    })
  })
})
