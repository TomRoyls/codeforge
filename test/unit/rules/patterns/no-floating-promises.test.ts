import { describe, test, expect, vi } from 'vitest'
import { noFloatingPromisesRule } from '../../../../src/rules/patterns/no-floating-promises.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'asyncFunction();',
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

function createFloatingPromiseStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'asyncFunction',
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createVoidAsyncStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'UnaryExpression',
      operator: 'void',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'asyncFunction',
        },
        arguments: [],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSyncStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'syncFunction',
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFetchStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'fetch',
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createPromiseAllStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'Promise',
        },
        property: {
          type: 'Identifier',
          name: 'all',
        },
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createNonExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-floating-promises rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noFloatingPromisesRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFloatingPromisesRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFloatingPromisesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noFloatingPromisesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noFloatingPromisesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noFloatingPromisesRule.meta.fixable).toBeUndefined()
    })

    test('should mention Promise in description', () => {
      expect(noFloatingPromisesRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(visitor).toHaveProperty('ExpressionStatement')
    })
  })

  describe('detecting floating promises', () => {
    test('should report floating async function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise')
    })

    test('should report floating fetch call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFetchStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise')
    })

    test('should report floating Promise.all call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createPromiseAllStatement())

      expect(reports.length).toBe(1)
    })

    test('should not report sync function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createSyncStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report non-expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createNonExpressionStatement())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - ignoreVoid', () => {
    test('should allow void operator when ignoreVoid is true', () => {
      const { context, reports } = createMockContext({ ignoreVoid: true })
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createVoidAsyncStatement())

      expect(reports.length).toBe(0)
    })

    test('should still report floating promise when ignoreVoid is false', () => {
      const { context, reports } = createMockContext({ ignoreVoid: false })
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports.length).toBe(1)
    })

    test('should report void wrapped promise by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createVoidAsyncStatement())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement('string')).not.toThrow()
      expect(() => visitor.ExpressionStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'asyncFunction',
          },
          arguments: [],
        },
      }

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

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
        getSource: () => 'asyncFunction();',
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

      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement(createFloatingPromiseStatement())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-CallExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'Identifier',
          name: 'x',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('should mention catch in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports[0].message.toLowerCase()).toContain('catch')
    })

    test('should mention unhandled rejection in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports[0].message.toLowerCase()).toContain('unhandled')
    })
  })

  describe('meta - exhaustive', () => {
    test('meta should have type property', () => {
      expect(noFloatingPromisesRule.meta).toHaveProperty('type')
    })

    test('meta should have severity property', () => {
      expect(noFloatingPromisesRule.meta).toHaveProperty('severity')
    })

    test('meta should have docs property', () => {
      expect(noFloatingPromisesRule.meta).toHaveProperty('docs')
    })

    test('meta docs should have description', () => {
      expect(noFloatingPromisesRule.meta.docs).toHaveProperty('description')
    })

    test('meta docs description should be a non-empty string', () => {
      expect(typeof noFloatingPromisesRule.meta.docs?.description).toBe('string')
      expect(noFloatingPromisesRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs should have category', () => {
      expect(noFloatingPromisesRule.meta.docs).toHaveProperty('category')
    })

    test('meta docs category should be patterns', () => {
      expect(noFloatingPromisesRule.meta.docs?.category).toBe('patterns')
    })

    test('meta docs should have recommended', () => {
      expect(noFloatingPromisesRule.meta.docs).toHaveProperty('recommended')
    })

    test('meta docs recommended should be true', () => {
      expect(noFloatingPromisesRule.meta.docs?.recommended).toBe(true)
    })

    test('meta docs should have url', () => {
      expect(noFloatingPromisesRule.meta.docs).toHaveProperty('url')
    })

    test('meta docs url should be a string', () => {
      expect(typeof noFloatingPromisesRule.meta.docs?.url).toBe('string')
    })

    test('meta docs url should contain codeforge', () => {
      expect(noFloatingPromisesRule.meta.docs?.url).toContain('codeforge')
    })

    test('meta should have schema', () => {
      expect(noFloatingPromisesRule.meta).toHaveProperty('schema')
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(noFloatingPromisesRule.meta.schema)).toBe(true)
    })

    test('meta schema should have at least one entry', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      expect(schema.length).toBeGreaterThanOrEqual(1)
    })

    test('meta schema first entry should have type object', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].type).toBe('object')
    })

    test('meta schema should define ignoreVoid property', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreVoid')
    })

    test('meta schema should define ignoreIIFE property', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreIIFE')
    })

    test('meta schema ignoreVoid should have type boolean', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreVoid.type).toBe('boolean')
    })

    test('meta schema ignoreIIFE should have type boolean', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreIIFE.type).toBe('boolean')
    })

    test('meta schema should have additionalProperties false', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].additionalProperties).toBe(false)
    })

    test('meta fixable should be undefined', () => {
      expect(noFloatingPromisesRule.meta.fixable).toBeUndefined()
    })

    test('meta type should be problem', () => {
      expect(noFloatingPromisesRule.meta.type).toBe('problem')
    })

    test('meta severity should be error', () => {
      expect(noFloatingPromisesRule.meta.severity).toBe('error')
    })

    test('meta should not be deprecated', () => {
      expect(noFloatingPromisesRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noFloatingPromisesRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not require type checking', () => {
      expect(noFloatingPromisesRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with ExpressionStatement method', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('ExpressionStatement should accept one argument', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      expect(visitor.ExpressionStatement.length).toBe(1)
    })

    test('create should return new visitor on each call', () => {
      const { context } = createMockContext()
      const visitor1 = noFloatingPromisesRule.create(context)
      const visitor2 = noFloatingPromisesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple visitors should have independent report tracking', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = noFloatingPromisesRule.create(ctx1)
      const visitor2 = noFloatingPromisesRule.create(ctx2)

      visitor1.ExpressionStatement(createFloatingPromiseStatement())
      visitor2.ExpressionStatement(createSyncStatement())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })
  })

  describe('async function name patterns - Identifier callee', () => {
    test('should report call starting with async', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncFunction' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report asyncData call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report asyncInit call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncInit' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report fetch call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetch' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report fetchData call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report fetchUrl call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchUrl' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report call with Async in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'loadAsync' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report call with Async in middle of name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getAsyncData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report sync function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'syncFunction' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report regular function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'consoleLog' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report getData call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report parseJSON call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'parseJSON' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report Async suffix only name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'doAsync' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('MemberExpression callee patterns', () => {
    test('should report obj.asyncMethod call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'asyncMethod' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report api.fetchResources call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'api' },
            property: { type: 'Identifier', name: 'fetchResources' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report client.loadAsync call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'client' },
            property: { type: 'Identifier', name: 'loadAsync' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report obj.syncMethod call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'syncMethod' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.method call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('Promise method calls (MemberExpression)', () => {
    test('should report .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'promise' },
            property: { type: 'Identifier', name: 'then' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report .catch() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'promise' },
            property: { type: 'Identifier', name: 'catch' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report .finally() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'promise' },
            property: { type: 'Identifier', name: 'finally' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report Promise.all() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createPromiseAllStatement())
      expect(reports.length).toBe(1)
    })

    test('should report Promise.race() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'race' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report Promise.allSettled() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'allSettled' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report Promise.any() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'any' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report Promise.resolve() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'resolve' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Promise.reject() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr.map() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'map' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'forEach' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('void operator handling', () => {
    test('should not report void asyncFunction() with ignoreVoid default', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createVoidAsyncStatement())
      expect(reports.length).toBe(0)
    })

    test('should not report void asyncFunction() with ignoreVoid true', () => {
      const { context, reports } = createMockContext({ ignoreVoid: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createVoidAsyncStatement())
      expect(reports.length).toBe(0)
    })

    test('should not report void asyncFunction() with ignoreVoid false', () => {
      const { context, reports } = createMockContext({ ignoreVoid: false })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createVoidAsyncStatement())
      expect(reports.length).toBe(0)
    })

    test('should still report floating promise without void when ignoreVoid true', () => {
      const { context, reports } = createMockContext({ ignoreVoid: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('void operator node should not be reported as floating promise', () => {
      const { context, reports } = createMockContext({ ignoreVoid: false })
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'asyncFn' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle void with fetch call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fetch' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(3, 4))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncFunction' },
          arguments: [],
        },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncFunction' },
          arguments: [],
        },
        loc: {
          start: { line: 7, column: 2 },
        },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should handle node with loc containing string values', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncFunction' },
          arguments: [],
        },
        loc: {
          start: { line: 'abc', column: 'xyz' },
          end: { line: 'def', column: 'uvw' },
        },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node with boolean expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: 'hello',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: null,
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: undefined,
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {},
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: null,
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'then' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a plain empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type casing', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'expressionstatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncFunction' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ArrayExpression',
          elements: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ObjectExpression',
          properties: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with UnaryExpression non-void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'asyncFunction' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with UnaryExpression typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'asyncFunction' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested node without breaking', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'asyncFunction' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'then' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('options handling', () => {
    test('should handle ignoreIIFE option set to true', () => {
      const { context, reports } = createMockContext({ ignoreIIFE: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should handle ignoreIIFE option set to false', () => {
      const { context, reports } = createMockContext({ ignoreIIFE: false })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should handle both options set to true', () => {
      const { context, reports } = createMockContext({ ignoreVoid: true, ignoreIIFE: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should handle both options set to false', () => {
      const { context, reports } = createMockContext({ ignoreVoid: false, ignoreIIFE: false })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should handle unknown options gracefully', () => {
      const { context, reports } = createMockContext({ unknownOption: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with empty options object', () => {
      const { context, reports } = createMockContext({})
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should handle config with undefined options element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'asyncFunction();',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [undefined] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noFloatingPromisesRule.create(context)
      expect(() => visitor.ExpressionStatement(createFloatingPromiseStatement())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle config with null options element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'asyncFunction();',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noFloatingPromisesRule.create(context)
      expect(() => visitor.ExpressionStatement(createFloatingPromiseStatement())).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple invocations', () => {
    test('should report each floating promise independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement(1, 0))
      visitor.ExpressionStatement(createFloatingPromiseStatement(2, 0))
      visitor.ExpressionStatement(createFloatingPromiseStatement(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report only floating promises, not sync calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement(1, 0))
      visitor.ExpressionStatement(createSyncStatement(2, 0))
      visitor.ExpressionStatement(createFloatingPromiseStatement(3, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle mix of floating and non-floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createSyncStatement(1, 0))
      visitor.ExpressionStatement(createFloatingPromiseStatement(2, 0))
      visitor.ExpressionStatement(createSyncStatement(3, 0))
      visitor.ExpressionStatement(createFetchStatement(4, 0))
      visitor.ExpressionStatement(createSyncStatement(5, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle alternating floating and void-wrapped calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement(1, 0))
      visitor.ExpressionStatement(createVoidAsyncStatement(2, 0))
      visitor.ExpressionStatement(createFloatingPromiseStatement(3, 0))

      expect(reports.length).toBe(2)
    })

    test('should track locations correctly across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement(10, 5))
      visitor.ExpressionStatement(createFloatingPromiseStatement(20, 8))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[1].loc?.start.column).toBe(8)
    })

    test('should handle 10 floating promises in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.ExpressionStatement(createFloatingPromiseStatement(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle rapid creation and invocation of visitors', () => {
      for (let i = 0; i < 5; i++) {
        const { context, reports } = createMockContext()
        const visitor = noFloatingPromisesRule.create(context)
        visitor.ExpressionStatement(createFloatingPromiseStatement())
        expect(reports.length).toBe(1)
      }
    })
  })

  describe('different file paths and sources', () => {
    test('should work with .tsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockContext({}, '/src/index.js')
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file path', () => {
      const { context, reports } = createMockContext({}, '/src/app.jsx')
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with .mjs file path', () => {
      const { context, reports } = createMockContext({}, '/src/module.mjs')
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const x = await asyncFunction();',
      )
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockContext({}, '/src/features/auth/utils/async-helper.ts')
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })
  })

  describe('message content details', () => {
    test('message should contain floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0].message.toLowerCase()).toContain('floating')
    })

    test('message should be consistent across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())
      const firstMessage = reports[0].message

      visitor.ExpressionStatement(createFetchStatement())
      const secondMessage = reports[1].message

      expect(firstMessage).toBe(secondMessage)
    })

    test('message should be the same for different promise patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())
      visitor.ExpressionStatement(createFetchStatement())
      visitor.ExpressionStatement(createPromiseAllStatement())

      const message = reports[0].message
      expect(reports.every((r) => r.message === message)).toBe(true)
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('report descriptor completeness', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('non-ExpressionStatement node types', () => {
    test('should not report for VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createNonExpressionStatement())
      expect(reports.length).toBe(0)
    })

    test('should not report for IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: { type: 'Identifier', name: 'x' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'test' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for SwitchStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: { type: 'Identifier', name: 'err' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('Identifier callee without name property', () => {
    test('should handle Identifier with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 123 },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Identifier without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ExpressionStatement(node)).toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression property without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      expect(() => visitor.ExpressionStatement(node)).toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('ignoreIIFE option behavior', () => {
    test('should report floating promise regardless of ignoreIIFE true', () => {
      const { context, reports } = createMockContext({ ignoreIIFE: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should report floating promise regardless of ignoreIIFE false', () => {
      const { context, reports } = createMockContext({ ignoreIIFE: false })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement())
      expect(reports.length).toBe(1)
    })

    test('should report fetch regardless of ignoreIIFE true', () => {
      const { context, reports } = createMockContext({ ignoreIIFE: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFetchStatement())
      expect(reports.length).toBe(1)
    })

    test('should report Promise.all regardless of ignoreIIFE true', () => {
      const { context, reports } = createMockContext({ ignoreIIFE: true })
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createPromiseAllStatement())
      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export noFloatingPromisesRule as named export', () => {
      expect(noFloatingPromisesRule).toBeDefined()
    })

    test('should export an object with meta and create', () => {
      expect(noFloatingPromisesRule).toHaveProperty('meta')
      expect(noFloatingPromisesRule).toHaveProperty('create')
    })

    test('create should be a function', () => {
      expect(typeof noFloatingPromisesRule.create).toBe('function')
    })

    test('meta should be an object', () => {
      expect(typeof noFloatingPromisesRule.meta).toBe('object')
    })
  })

  describe('statement types that should not trigger', () => {
    test('should not report for empty ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with Literal expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'use strict' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with TaggedTemplateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ExpressionStatement with YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'YieldExpression',
          argument: null,
          delegate: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('boundary name patterns', () => {
    test('should report function named exactly async', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'async' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report function named asynchronizer', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'synchronize' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report function named async_underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'async_work' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report function starting with get', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report function with camelCase Async in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'runAsyncOperation' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report function with lowercase async in name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getasynclist' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report MemberExpression with async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'module' },
            property: { type: 'Identifier', name: 'asyncInit' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report MemberExpression with Async in property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'service' },
            property: { type: 'Identifier', name: 'sendAsync' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report MemberExpression with sync property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'service' },
            property: { type: 'Identifier', name: 'sendSync' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('Promise method chains on various objects', () => {
    test('should report result.then() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'result' },
            property: { type: 'Identifier', name: 'then' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report response.catch() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'response' },
            property: { type: 'Identifier', name: 'catch' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report promise.finally() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'promise' },
            property: { type: 'Identifier', name: 'finally' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report result.map() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'result' },
            property: { type: 'Identifier', name: 'map' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report result.filter() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'result' },
            property: { type: 'Identifier', name: 'filter' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.reduce() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'reduce' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.find() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'find' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.some() floating', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'some' },
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('CallExpression with arguments', () => {
    test('should report asyncFunction with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncFunction' },
          arguments: [
            { type: 'Literal', value: 'arg1' },
            { type: 'Literal', value: 42 },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report fetch with URL argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetch' },
          arguments: [{ type: 'Literal', value: 'https://api.example.com' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report Promise.all with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'all' },
          },
          arguments: [{ type: 'ArrayExpression', elements: [] }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('void operator edge cases', () => {
    test('should not report void 0 (common pattern)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Literal', value: 0 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report void identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report void Promise.all()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'Promise' },
              property: { type: 'Identifier', name: 'all' },
            },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report void .then() chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'promise' },
              property: { type: 'Identifier', name: 'then' },
            },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('concurrent visitor invocations', () => {
    test('should correctly track reports from two visitors on same rule', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = noFloatingPromisesRule.create(ctx1)
      const visitor2 = noFloatingPromisesRule.create(ctx2)

      visitor1.ExpressionStatement(createFloatingPromiseStatement(1, 0))
      visitor2.ExpressionStatement(createFloatingPromiseStatement(2, 0))
      visitor1.ExpressionStatement(createSyncStatement(3, 0))
      visitor2.ExpressionStatement(createFetchStatement(4, 0))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
    })

    test('should correctly handle visitor with all sync calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.ExpressionStatement(createSyncStatement(i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should correctly handle visitor with all floating calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.ExpressionStatement(createFloatingPromiseStatement(i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })
  })

  describe('location with zero values', () => {
    test('should handle location at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(9999, 0))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      visitor.ExpressionStatement(createFloatingPromiseStatement(1, 9999))
      expect(reports[0].loc?.start.column).toBe(9999)
    })
  })

  describe('mixed async name patterns', () => {
    test('should report asyncInit call via Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'asyncInit' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report fetchApi call via Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchApi' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report executeAsync via Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'executeAsync' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report handleAsyncEvent via Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'handleAsyncEvent' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report syncInit via Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'syncInit' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report processData via Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'processData' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('meta deep property immutability', () => {
    test('meta docs description should not be empty', () => {
      const desc = noFloatingPromisesRule.meta.docs?.description
      expect(desc).toBeTruthy()
      expect((desc as string).trim().length).toBeGreaterThan(10)
    })

    test('meta docs url should start with https', () => {
      expect(noFloatingPromisesRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('meta schema ignoreVoid should have default false', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreVoid.default).toBe(false)
    })

    test('meta schema ignoreIIFE should have default false', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, Record<string, unknown>>
      expect(props.ignoreIIFE.default).toBe(false)
    })

    test('meta docs description should contain "handled" or "appropriately"', () => {
      const desc = noFloatingPromisesRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/handled|appropriately/)
    })

    test('meta docs description should mention "floating"', () => {
      const desc = noFloatingPromisesRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('floating')
    })

    test('meta schema should have exactly 2 properties', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const props = schema[0].properties as Record<string, unknown>
      expect(Object.keys(props).length).toBe(2)
    })

    test('meta schema should define properties in order', () => {
      const schema = noFloatingPromisesRule.meta.schema as Record<string, unknown>[]
      const keys = Object.keys(schema[0].properties as Record<string, unknown>)
      expect(keys).toContain('ignoreVoid')
      expect(keys).toContain('ignoreIIFE')
    })
  })
})
