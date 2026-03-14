import { describe, test, expect, vi } from 'vitest'
import { noImplicitCoercionRule } from '../../../../src/rules/patterns/no-implicit-coercion.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '+x;',
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

function createUnaryExpression(operator: string, argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

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

describe('no-implicit-coercion rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noImplicitCoercionRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noImplicitCoercionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noImplicitCoercionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noImplicitCoercionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noImplicitCoercionRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noImplicitCoercionRule.meta.fixable).toBe('code')
    })

    test('should mention coercion in description', () => {
      expect(noImplicitCoercionRule.meta.docs?.description.toLowerCase()).toContain('coercion')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting number coercion with +x', () => {
    test('should report +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number')
    })

    test('should report +str', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('str'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report +(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('value'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report +0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createLiteral(0))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report +1', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createLiteral(1))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting boolean coercion with !!x', () => {
    test('should report !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Boolean')
    })

    test('should report !!value', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('value'))
      const node = createUnaryExpression('!', innerNot)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report !x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('!', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report !flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('!', createIdentifier('flag'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting string coercion with x + ""', () => {
    test('should report x + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('String')
    })

    test('should report "" + x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(''), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report num + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('num'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report "hello" + "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createLiteral('hello'), createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + y', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression('string')).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('+', createIdentifier('x'), 25, 10)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: createIdentifier('x'),
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
    })

    test('should handle -x (not a coercion)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('-', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ~x (not a coercion)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('~', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle typeof x (not a coercion)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = createUnaryExpression('typeof', createIdentifier('x'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention Number for +x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message).toContain('Number')
    })

    test('should mention Boolean for !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const innerNot = createUnaryExpression('!', createIdentifier('x'))
      visitor.UnaryExpression(createUnaryExpression('!', innerNot))

      expect(reports[0].message).toContain('Boolean')
    })

    test('should mention String for x + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral('')),
      )

      expect(reports[0].message).toContain('String')
    })

    test('should mention implicit for number coercion', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message.toLowerCase()).toContain('implicit')
    })

    test('should mention explicit as alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      visitor.UnaryExpression(createUnaryExpression('+', createIdentifier('x')))

      expect(reports[0].message.toLowerCase()).toContain('explicit')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitCoercionRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createIdentifier('x'),
        prefix: true,
        loc: {},
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
