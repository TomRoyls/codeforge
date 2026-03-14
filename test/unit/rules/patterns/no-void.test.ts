import { describe, test, expect, vi } from 'vitest'
import { noVoidRule } from '../../../../src/rules/patterns/no-void.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'void 0',
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

function createUnaryVoidExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'void',
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-void rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noVoidRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noVoidRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noVoidRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noVoidRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noVoidRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noVoidRule.meta.fixable).toBe('code')
    })

    test('should mention void in description', () => {
      expect(noVoidRule.meta.docs?.description.toLowerCase()).toContain('void')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noVoidRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })
  })

  describe('void expression detection', () => {
    test('should report void 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected void operator.')
    })

    test('should report void undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createIdentifier('undefined'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'BinaryExpression',
        left: createLiteral(1),
        operator: '+',
        right: createLiteral(2),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: createLiteral(42),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('non-void expressions (valid cases)', () => {
    test('should not report typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ! operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createLiteral(true),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '-',
        argument: createLiteral(5),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createLiteral(5),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ~ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '~',
        argument: createLiteral(5),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for void 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 6] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('undefined')
      expect(reports[0].fix?.range).toEqual([0, 6])
    })

    test('should provide fix for void undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('undefined'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 15] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('undefined')
    })

    test('should not provide fix for void with non-zero literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(42),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 8] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for void with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for void with other identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('something'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 16] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.UnaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: {},
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 10, 5)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(1),
        operator: '+',
        right: createLiteral(2),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: createLiteral(0),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should report correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message).toBe('Unexpected void operator.')
    })

    test('should mention void in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.toLowerCase()).toContain('void')
    })

    test('should mention operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.toLowerCase()).toContain('operator')
    })
  })

  describe('common void patterns', () => {
    test('should report void 0 (common undefined pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 5, 10)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report void functionCall() (minifier pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('console.log'),
        arguments: [createLiteral('test')],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in IIFE pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ObjectExpression',
        properties: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral('ignored'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(null))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'void 0',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noVoidRule.create(context)

      expect(() =>
        visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0))),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('literal edge cases', () => {
    test('should handle literal with string value 0 (not autofixed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: '0', raw: "'0'" },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 8] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      // String '0' should not be autofixed to undefined
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle literal with no value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'Literal' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle identifier that is not undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createIdentifier('foo'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
