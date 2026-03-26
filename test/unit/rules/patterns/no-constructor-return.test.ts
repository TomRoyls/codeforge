import { describe, test, expect, vi } from 'vitest'
import { noConstructorReturnRule } from '../../../../src/rules/patterns/no-constructor-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'class Foo {}',
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

function createMethodDefinition(
  kind: 'constructor' | 'method' | 'get' | 'set',
  hasReturn = false,
  lineNumber = 1,
  column = 0,
): unknown {
  const body = hasReturn
    ? {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: { type: 'Literal', value: 42 },
          },
        ],
      }
    : {
        type: 'BlockStatement',
        body: [
          {
            type: 'ExpressionStatement',
            expression: { type: 'Identifier', name: 'x' },
          },
        ],
      }

  return {
    type: 'MethodDefinition',
    kind: kind,
    body: body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber + 5, column },
    },
  }
}

describe('no-constructor-return rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConstructorReturnRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConstructorReturnRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConstructorReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstructorReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConstructorReturnRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noConstructorReturnRule.meta.fixable).toBeUndefined()
    })

    test('should mention constructor in description', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('constructor')
    })

    test('should mention return in description', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('return')
    })

    test('should have empty schema array', () => {
      expect(noConstructorReturnRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with MethodDefinition method', () => {
      const { context } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('detecting return statements in constructors', () => {
    test('should report constructor with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should not report constructor without return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', false))

      expect(reports.length).toBe(0)
    })

    test('should not report method with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', true))

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('get', true))

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('set', true))

      expect(reports.length).toBe(0)
    })

    test('should report correct message for constructor with return', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toBe('Unexpected return in constructor.')
    })

    test('should report multiple constructors with returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report only constructors with returns among other methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', true))
      visitor.MethodDefinition(createMethodDefinition('get', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in MethodDefinition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in MethodDefinition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in MethodDefinition', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition('string')).not.toThrow()
      expect(() => visitor.MethodDefinition(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without kind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement' }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle constructor with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

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
        getSource: () => 'class Foo { constructor() { return 1; } }',
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

      const visitor = noConstructorReturnRule.create(context)
      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention constructor in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toContain('constructor')
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toContain('return')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))

      expect(reports[0].message).toBe('Unexpected return in constructor.')
      expect(reports[1].message).toBe('Unexpected return in constructor.')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for constructor with return', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })
})
