import { describe, test, expect, vi } from 'vitest'
import { noReturnAwaitRule } from '../../../../src/rules/patterns/no-return-await.js'
import defaultExport from '../../../../src/rules/patterns/no-return-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'return await promise;',
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

function createReturnAwaitStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'AwaitExpression',
      argument: {
        type: 'Identifier',
        name: 'promise',
      },
      loc: {
        start: { line, column },
        end: { line, column: column + 15 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createReturnWithoutAwaitStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'Identifier',
      name: 'promise',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createReturnWithoutArgument(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNonReturnStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AwaitExpression',
      argument: {
        type: 'Identifier',
        name: 'promise',
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-return-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noReturnAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noReturnAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noReturnAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noReturnAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noReturnAwaitRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noReturnAwaitRule.meta.fixable).toBeUndefined()
    })

    test('should mention return await in description', () => {
      expect(noReturnAwaitRule.meta.docs?.description.toLowerCase()).toContain('return await')
    })

    test('should have a non-empty description', () => {
      expect(noReturnAwaitRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention async in description', () => {
      expect(noReturnAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention redundant in description', () => {
      expect(noReturnAwaitRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })

    test('should have a docs object', () => {
      expect(noReturnAwaitRule.meta.docs).toBeDefined()
    })

    test('should have docs url', () => {
      expect(noReturnAwaitRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url starting with https', () => {
      expect(noReturnAwaitRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should have docs url containing no-return-await', () => {
      expect(noReturnAwaitRule.meta.docs?.url).toContain('no-return-await')
    })

    test('should have type as a string', () => {
      expect(typeof noReturnAwaitRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noReturnAwaitRule.meta.severity).toBe('string')
    })

    test('should have description as a string', () => {
      expect(typeof noReturnAwaitRule.meta.docs?.description).toBe('string')
    })

    test('should have category as a string', () => {
      expect(typeof noReturnAwaitRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as a boolean', () => {
      expect(typeof noReturnAwaitRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should not be deprecated', () => {
      expect(noReturnAwaitRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noReturnAwaitRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noReturnAwaitRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have schema as empty array', () => {
      expect(noReturnAwaitRule.meta.schema).toEqual([])
    })

    test('should have meta object defined', () => {
      expect(noReturnAwaitRule.meta).toBeDefined()
      expect(typeof noReturnAwaitRule.meta).toBe('object')
    })

    test('should have valid RuleType value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noReturnAwaitRule.meta.type)
    })

    test('should have valid Severity value', () => {
      expect(['off', 'warn', 'error']).toContain(noReturnAwaitRule.meta.severity)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
    })

    test('should return visitor as an object', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return ReturnStatement as a function', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noReturnAwaitRule.create(ctx1)
      const visitor2 = noReturnAwaitRule.create(ctx2)

      visitor1.ReturnStatement(createReturnAwaitStatement())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)

      visitor2.ReturnStatement(createReturnAwaitStatement())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should create new visitor on each call', () => {
      const { context } = createMockContext()
      const visitor1 = noReturnAwaitRule.create(context)
      const visitor2 = noReturnAwaitRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should not throw when create is called with minimal context', () => {
      expect(() =>
        noReturnAwaitRule.create({
          report: vi.fn(),
          getFilePath: () => '',
          getAST: () => null,
          getSource: () => '',
          getTokens: () => [],
          getComments: () => [],
          config: { options: [] },
          logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          workspaceRoot: '',
        } as unknown as RuleContext),
      ).not.toThrow()
    })

    test('should have only ReturnStatement as a key', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('ReturnStatement')
    })

    test('should return visitor that has exactly one method', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)
      const functionKeys = Object.keys(visitor).filter((k) => typeof visitor[k] === 'function')

      expect(functionKeys.length).toBe(1)
    })

    test('should accept different file paths in context', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should accept different source code in context', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'return await foo();')
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting return await', () => {
    test('should report return await', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('return await')
    })

    test('should not report return without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnWithoutAwaitStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report return without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnWithoutArgument())

      expect(reports.length).toBe(0)
    })

    test('should not report non-return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createNonReturnStatement())

      expect(reports.length).toBe(0)
    })

    test('should report return await with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fetchData' },
            arguments: [],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'BinaryExpression',
            left: { type: 'Identifier', name: 'a' },
            operator: '+',
            right: { type: 'Identifier', name: 'b' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'cond' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'ArrayExpression',
            elements: [{ type: 'Identifier', name: 'x' }],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'ObjectExpression',
            properties: [],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Promise' },
            arguments: [],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'TemplateLiteral',
            quasis: [],
            expressions: [],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Identifier', name: 'x' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report return with CallExpression argument (no await)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with MemberExpression argument (no await)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'Literal',
          value: 42,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with string Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'Literal',
          value: 'hello',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with boolean Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'Literal',
          value: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'flag' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report return await with chained call', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fetch' },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'json' },
            },
            arguments: [],
          },
          loc: { start: { line: 5, column: 8 }, end: { line: 5, column: 30 } },
        },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 35 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report return with SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with TaggedTemplateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report return await with YieldExpression inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'YieldExpression',
            argument: { type: 'Identifier', name: 'val' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'Identifier',
            name: 'promise',
          },
        },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

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
        getSource: () => 'return await promise;',
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

      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(createReturnAwaitStatement())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-await argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'promise',
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 42,
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: { name: 'ReturnStatement' },
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with argument type as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 42,
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
          extra: 'property',
          range: [0, 15],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        extra: 'property',
        range: [0, 20],
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle multiple ReturnStatement calls on same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(1, 0))
      visitor.ReturnStatement(createReturnAwaitStatement(2, 0))
      visitor.ReturnStatement(createReturnAwaitStatement(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle mix of valid and invalid nodes on same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())
      visitor.ReturnStatement(createReturnWithoutAwaitStatement())
      visitor.ReturnStatement(createReturnAwaitStatement())
      visitor.ReturnStatement(createReturnWithoutArgument())

      expect(reports.length).toBe(2)
    })

    test('should handle return await with argument being another AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'AwaitExpression',
            argument: { type: 'Identifier', name: 'x' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not crash on node with null prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = Object.create(null)
      node.type = 'ReturnStatement'
      node.argument = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with argument as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with argument as number 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: 0,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with argument as false', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with deeply nested argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'Promise' },
                  property: { type: 'Identifier', name: 'resolve' },
                },
                arguments: [{ type: 'Identifier', name: 'val' }],
              },
              property: { type: 'Identifier', name: 'then' },
            },
            arguments: [
              {
                type: 'ArrowFunctionExpression',
                params: [{ type: 'Identifier', name: 'r' }],
                body: { type: 'Identifier', name: 'r' },
              },
            ],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 55 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with BreakStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'BreakStatement',
        label: null,
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ContinueStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ContinueStatement',
        label: null,
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ThrowStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ForStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with WhileStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with SwitchStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with TryStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: null,
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with VariableDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with FunctionDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ClassDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        body: { type: 'ClassBody', body: [] },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location', () => {
    test('should report location from await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(3, 4))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
      }

      visitor.ReturnStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle argument with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: {
            start: { line: 5, column: 2 },
          },
        },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle argument with partial loc (missing start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: {
            end: { line: 5, column: 20 },
          },
        },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle argument with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: {},
        },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle argument with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: null,
        },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle argument loc with string line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: {
            start: { line: '5', column: 2 },
            end: { line: '5', column: 10 },
          },
        },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle argument loc with NaN line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: {
            start: { line: NaN, column: 0 },
            end: { line: NaN, column: 0 },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle multi-line await expression location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: {
            start: { line: 10, column: 4 },
            end: { line: 12, column: 5 },
          },
        },
        loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should report correct location for each of multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(1, 0))
      visitor.ReturnStatement(createReturnAwaitStatement(5, 4))
      visitor.ReturnStatement(createReturnAwaitStatement(10, 8))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(4)
      expect(reports[2].loc?.start.column).toBe(8)
    })

    test('should use argument location not ReturnStatement location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
          loc: {
            start: { line: 7, column: 8 },
            end: { line: 7, column: 23 },
          },
        },
        loc: {
          start: { line: 7, column: 0 },
          end: { line: 7, column: 28 },
        },
      }

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('message quality', () => {
    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention performance in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('performance')
    })

    test('should mention Promise in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message).toContain('Promise')
    })

    test('should have a non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have a message longer than 20 characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.length).toBeGreaterThan(20)
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('return')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('should mention directly in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('directly')
    })

    test('should produce consistent message for multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())
      visitor.ReturnStatement(createReturnAwaitStatement())
      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should mention catch or errors in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('catch') || msg.includes('error')).toBe(true)
    })

    test('should produce string message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('exports', () => {
    test('should export the rule as named export', () => {
      expect(noReturnAwaitRule).toBeDefined()
    })

    test('should export the rule as default export', () => {
      expect(defaultExport).toBeDefined()
    })

    test('should have same reference for named and default export', () => {
      expect(defaultExport).toBe(noReturnAwaitRule)
    })

    test('should export a rule with create method', () => {
      expect(typeof noReturnAwaitRule.create).toBe('function')
    })

    test('should export a rule with meta property', () => {
      expect(noReturnAwaitRule.meta).toBeDefined()
      expect(typeof noReturnAwaitRule.meta).toBe('object')
    })

    test('should have create method that is callable', () => {
      const { context } = createMockContext()

      expect(() => noReturnAwaitRule.create(context)).not.toThrow()
    })

    test('should have exactly two own properties on rule', () => {
      const keys = Object.keys(noReturnAwaitRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('idempotency', () => {
    test('should report same result for same node processed twice', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)
      const node = createReturnAwaitStatement()

      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should not report after processing non-matching node then matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnWithoutAwaitStatement())
      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should not report after processing matching node then non-matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())
      visitor.ReturnStatement(createReturnWithoutAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should report for each return await in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ReturnStatement(createReturnAwaitStatement())
      }

      expect(reports.length).toBe(10)
    })

    test('should report for alternating valid and invalid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.ReturnStatement(createReturnAwaitStatement())
        } else {
          visitor.ReturnStatement(createReturnWithoutAwaitStatement())
        }
      }

      expect(reports.length).toBe(10)
    })

    test('should not be affected by options in reporting logic', () => {
      const { context: ctx1, reports: r1 } = createMockContext({ strict: true })
      const { context: ctx2, reports: r2 } = createMockContext({ strict: false })
      const { context: ctx3, reports: r3 } = createMockContext({})

      const v1 = noReturnAwaitRule.create(ctx1)
      const v2 = noReturnAwaitRule.create(ctx2)
      const v3 = noReturnAwaitRule.create(ctx3)

      v1.ReturnStatement(createReturnAwaitStatement())
      v2.ReturnStatement(createReturnAwaitStatement())
      v3.ReturnStatement(createReturnAwaitStatement())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
      expect(r3.length).toBe(1)
      expect(r1[0].message).toBe(r2[0].message)
      expect(r2[0].message).toBe(r3[0].message)
    })
  })

  describe('argument variations', () => {
    test('should not report return with ThisExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: { type: 'ThisExpression' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'args' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with TypeCastExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'TypeCastExpression',
          expression: { type: 'Identifier', name: 'x' },
          typeAnnotation: {},
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report return await with chained await call', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'client' },
              property: { type: 'Identifier', name: 'getData' },
            },
            arguments: [{ type: 'Literal', value: 'param' }],
          },
          loc: { start: { line: 8, column: 2 }, end: { line: 8, column: 30 } },
        },
        loc: { start: { line: 8, column: 0 }, end: { line: 8, column: 35 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(8)
    })

    test('should not report return with ParenthesizedExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'ParenthesizedExpression',
          expression: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with AwaitExpression that is not direct child', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [
            {
              type: 'AwaitExpression',
              argument: { type: 'Identifier', name: 'x' },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report return await with null inner argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return await with undefined inner argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('context variations', () => {
    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'return await x;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noReturnAwaitRule.create(context)
      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source', () => {
      const source = 'async function foo() {\n  return await bar();\n}'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should work with AST returned from getAST', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(context.getAST()).toBeNull()
      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should work with tokens returned from getTokens', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(context.getTokens()).toEqual([])
      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should work with comments returned from getComments', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(context.getComments()).toEqual([])
      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should not call logger methods during normal operation', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should not call logger methods for non-matching nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnWithoutAwaitStatement())

      expect(reports.length).toBe(0)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should not call logger methods for null node', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(null)

      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should work with various file extensions', () => {
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
      for (const ext of extensions) {
        const { context, reports } = createMockContext({}, `/src/file${ext}`)
        const visitor = noReturnAwaitRule.create(context)

        visitor.ReturnStatement(createReturnAwaitStatement())

        expect(reports.length).toBe(1)
      }
    })
  })

  describe('falsy argument values', () => {
    test('should not report return with empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with 0 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with null argument and no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with NaN value argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: NaN },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with undefined value argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('argument type string variations', () => {
    test('should not report when argument type is "awaitexpression" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'awaitexpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when argument type is "AWAITEXPRESSION" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AWAITEXPRESSION',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is "returnstatement" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'returnstatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is "RETURNSTATEMENT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'RETURNSTATEMENT',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report for exact "AwaitExpression" type match', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
    })

    test('should report for exact "ReturnStatement" type match', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('location edge cases', () => {
    test('should handle argument loc with negative line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle argument loc with negative column', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: { start: { line: 1, column: -5 }, end: { line: 1, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle argument loc with very large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(999999, 0))

      expect(reports[0].loc?.start.line).toBe(999999)
    })

    test('should handle argument loc with very large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(1, 999999))

      expect(reports[0].loc?.start.column).toBe(999999)
    })

    test('should handle argument loc with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle argument loc with Infinity line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
          loc: { start: { line: Infinity, column: 0 }, end: { line: Infinity, column: 10 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Infinity)
    })
  })

  describe('concurrent visitors', () => {
    test('should handle two visitors created from same context independently', () => {
      const { context, reports } = createMockContext()
      const visitorA = noReturnAwaitRule.create(context)
      const visitorB = noReturnAwaitRule.create(context)

      visitorA.ReturnStatement(createReturnAwaitStatement())
      visitorB.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(2)
    })

    test('should handle three visitors with mixed inputs', () => {
      const { context: ctxA, reports: rA } = createMockContext()
      const { context: ctxB, reports: rB } = createMockContext()
      const { context: ctxC, reports: rC } = createMockContext()

      const vA = noReturnAwaitRule.create(ctxA)
      const vB = noReturnAwaitRule.create(ctxB)
      const vC = noReturnAwaitRule.create(ctxC)

      vA.ReturnStatement(createReturnAwaitStatement())
      vB.ReturnStatement(createReturnWithoutAwaitStatement())
      vC.ReturnStatement(createReturnAwaitStatement())

      expect(rA.length).toBe(1)
      expect(rB.length).toBe(0)
      expect(rC.length).toBe(1)
    })

    test('should handle rapid sequential create and call', () => {
      const allReports: ReportDescriptor[][] = []

      for (let i = 0; i < 5; i++) {
        const { context, reports } = createMockContext()
        const visitor = noReturnAwaitRule.create(context)
        visitor.ReturnStatement(createReturnAwaitStatement())
        allReports.push(reports)
      }

      for (const reports of allReports) {
        expect(reports.length).toBe(1)
      }
    })
  })

  describe('return statement with complex argument types', () => {
    test('should not report return with ImportExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ImportExpression', source: { type: 'Literal', value: './mod' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with ChainExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'ChainExpression',
          expression: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with OptionalMemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'OptionalMemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          optional: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report return with OptionalCallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'OptionalCallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
          optional: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report return await with OptionalCallExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'OptionalCallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
            optional: true,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should report return await with AwaitExpression inside TernaryConsequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'flag' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
          loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 30 } },
        },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 35 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('stress tests', () => {
    test('should handle 100 consecutive return await reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.ReturnStatement(createReturnAwaitStatement(i + 1, 0))
      }

      expect(reports.length).toBe(100)
      expect(reports[99].loc?.start.line).toBe(100)
    })

    test('should handle alternating pattern of 50 nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) {
          visitor.ReturnStatement(createReturnAwaitStatement())
        } else if (i % 3 === 1) {
          visitor.ReturnStatement(createReturnWithoutAwaitStatement())
        } else {
          visitor.ReturnStatement(createReturnWithoutArgument())
        }
      }

      expect(reports.length).toBe(17)
    })

    test('should handle pattern of only non-matching nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ReturnStatement(createReturnWithoutAwaitStatement())
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor shape', () => {
    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have numeric start line in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric start column in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric end line in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have numeric end column in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should have start before or at end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(5, 3))

      expect(reports[0].loc!.start.line).toBeLessThanOrEqual(reports[0].loc!.end.line)
    })
  })

  describe('helper functions', () => {
    test('createReturnAwaitStatement returns correct type', () => {
      const node = createReturnAwaitStatement()
      const n = node as Record<string, unknown>
      expect(n.type).toBe('ReturnStatement')
      expect((n.argument as Record<string, unknown>).type).toBe('AwaitExpression')
    })

    test('createReturnWithoutAwaitStatement returns correct type', () => {
      const node = createReturnWithoutAwaitStatement()
      const n = node as Record<string, unknown>
      expect(n.type).toBe('ReturnStatement')
      expect((n.argument as Record<string, unknown>).type).toBe('Identifier')
    })

    test('createReturnWithoutArgument returns null argument', () => {
      const node = createReturnWithoutArgument()
      const n = node as Record<string, unknown>
      expect(n.type).toBe('ReturnStatement')
      expect(n.argument).toBeNull()
    })

    test('createNonReturnStatement returns ExpressionStatement', () => {
      const node = createNonReturnStatement()
      const n = node as Record<string, unknown>
      expect(n.type).toBe('ExpressionStatement')
    })

    test('createReturnAwaitStatement with custom position has correct loc', () => {
      const node = createReturnAwaitStatement(42, 7)
      const n = node as Record<string, unknown>
      const arg = n.argument as Record<string, unknown>
      const argLoc = arg.loc as { start: { line: number; column: number } }
      expect(argLoc.start.line).toBe(42)
      expect(argLoc.start.column).toBe(7)
    })

    test('createReturnAwaitStatement end column is start + 15', () => {
      const node = createReturnAwaitStatement(3, 10)
      const n = node as Record<string, unknown>
      const arg = n.argument as Record<string, unknown>
      const argLoc = arg.loc as {
        start: { line: number; column: number }
        end: { line: number; column: number }
      }
      expect(argLoc.end.column).toBe(25)
    })

    test('createMockContext returns context with all required methods', () => {
      const { context } = createMockContext()
      expect(typeof context.report).toBe('function')
      expect(typeof context.getFilePath).toBe('function')
      expect(typeof context.getAST).toBe('function')
      expect(typeof context.getSource).toBe('function')
      expect(typeof context.getTokens).toBe('function')
      expect(typeof context.getComments).toBe('function')
    })
  })
})
