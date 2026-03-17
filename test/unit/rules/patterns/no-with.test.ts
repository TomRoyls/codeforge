import { describe, test, expect, vi } from 'vitest'
import { noWithRule } from '../../../../src/rules/patterns/no-with.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'with (obj) { }',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: name.length },
    },
  }
}

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: String(value).length },
    },
  }
}

function createWithStatement(object: unknown, body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WithStatement',
    object,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-with rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noWithRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noWithRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noWithRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noWithRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention with in description', () => {
      expect(noWithRule.meta.docs?.description.toLowerCase()).toContain('with')
    })

    test('should have empty schema', () => {
      expect(noWithRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noWithRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with WithStatement method', () => {
      const { context } = createMockContext()
      const visitor = noWithRule.create(context)

      expect(visitor).toHaveProperty('WithStatement')
      expect(typeof visitor.WithStatement).toBe('function')
    })
  })

  describe('detecting with statements', () => {
    test('should report with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('with')
      expect(reports[0].message).toContain('not allowed')
    })

    test('should report with statement with identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('data')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createLiteral('test')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with statements in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('x') },
      ])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report multiple with statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(3)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 42, 10))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('message quality', () => {
    test('should mention with statement in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.toLowerCase()).toContain('with')
    })

    test('should mention not allowed in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })

    test('should use single quotes around with', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message).toContain("'with'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement('string')).not.toThrow()
      expect(() => visitor.WithStatement(123)).not.toThrow()
      expect(() => visitor.WithStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without object property', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      const node = createWithStatement(obj, body)
      delete (node as Record<string, unknown>).loc
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle with statement with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: null,
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with undefined object', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: null,
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with incorrect type', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const node = {
        type: 'NotWithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          start: { line: 1, column: 'not-a-number' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {},
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
