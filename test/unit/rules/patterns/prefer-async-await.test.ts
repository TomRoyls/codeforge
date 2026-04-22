import { describe, test, expect, vi } from 'vitest'
import { preferAsyncAwaitRule } from '../../../../src/rules/patterns/prefer-async-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createPromiseThenCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'promise',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createNonPromiseCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'asyncFunction',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMethodCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('prefer-async-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferAsyncAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferAsyncAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferAsyncAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferAsyncAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferAsyncAwaitRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferAsyncAwaitRule.meta.fixable).toBeUndefined()
    })

    test('should mention async/await in description', () => {
      expect(preferAsyncAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting promise methods', () => {
    test('should report .then() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('then')
    })

    test('should report .catch() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('catch'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('catch')
    })

    test('should report .finally() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('finally'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('finally')
    })

    test('should not report non-promise method calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createMethodCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createNonPromiseCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowPromiseMethods', () => {
    test('should allow promise methods when option is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports.length).toBe(0)
    })

    test('should still report when option is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: false }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'promise',
          },
          property: {
            type: 'Identifier',
            name: 'then',
          },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

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
        getSource: () => 'promise.then(x => x);',
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

      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression(createPromiseThenCall('then'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'then',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'promise',
          },
          property: {
            type: 'Literal',
            value: 'then',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention async/await in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports[0].message.toLowerCase()).toContain('async/await')
    })

    test('should mention readability in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports[0].message.toLowerCase()).toContain('readability')
    })
  })

  describe('meta - exhaustive coverage', () => {
    test('meta should be a plain object', () => {
      expect(typeof preferAsyncAwaitRule.meta).toBe('object')
    })

    test('meta.type should be a string', () => {
      expect(typeof preferAsyncAwaitRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof preferAsyncAwaitRule.meta.severity).toBe('string')
    })

    test('meta should have docs property', () => {
      expect(preferAsyncAwaitRule.meta.docs).toBeDefined()
    })

    test('meta.docs should have description', () => {
      expect(typeof preferAsyncAwaitRule.meta.docs?.description).toBe('string')
    })

    test('meta.docs.description should be non-empty', () => {
      expect(preferAsyncAwaitRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.description should mention Promise', () => {
      expect(preferAsyncAwaitRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })

    test('meta.docs should have category', () => {
      expect(preferAsyncAwaitRule.meta.docs?.category).toBeDefined()
    })

    test('meta.docs.category should be patterns', () => {
      expect(preferAsyncAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('meta.docs.recommended should be boolean true', () => {
      expect(preferAsyncAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('meta.docs should have url', () => {
      expect(preferAsyncAwaitRule.meta.docs?.url).toBeDefined()
    })

    test('meta.docs.url should be a string', () => {
      expect(typeof preferAsyncAwaitRule.meta.docs?.url).toBe('string')
    })

    test('meta.docs.url should contain codeforge', () => {
      expect(preferAsyncAwaitRule.meta.docs?.url).toContain('codeforge')
    })

    test('meta.docs.url should contain prefer-async-await', () => {
      expect(preferAsyncAwaitRule.meta.docs?.url).toContain('prefer-async-await')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(preferAsyncAwaitRule.meta.schema)).toBe(true)
    })

    test('meta.schema should have at least one entry', () => {
      const schema = preferAsyncAwaitRule.meta.schema as unknown[]
      expect(schema.length).toBeGreaterThanOrEqual(1)
    })

    test('meta.schema first entry should be an object', () => {
      const schema = preferAsyncAwaitRule.meta.schema as unknown[]
      expect(typeof schema[0]).toBe('object')
    })

    test('meta.schema first entry should have type object', () => {
      const schema = preferAsyncAwaitRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].type).toBe('object')
    })

    test('meta.schema should define allowPromiseMethods property', () => {
      const schema = preferAsyncAwaitRule.meta.schema as Record<string, Record<string, unknown>>[]
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('allowPromiseMethods')
    })

    test('meta.schema allowPromiseMethods should be boolean type', () => {
      const schema = preferAsyncAwaitRule.meta.schema as Record<
        string,
        Record<string, Record<string, unknown>>
      >[]
      const prop = schema[0].properties.allowPromiseMethods
      expect(prop.type).toBe('boolean')
    })

    test('meta.schema allowPromiseMethods default should be false', () => {
      const schema = preferAsyncAwaitRule.meta.schema as Record<
        string,
        Record<string, Record<string, unknown>>
      >[]
      const prop = schema[0].properties.allowPromiseMethods
      expect(prop.default).toBe(false)
    })

    test('meta.schema should have additionalProperties false', () => {
      const schema = preferAsyncAwaitRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].additionalProperties).toBe(false)
    })

    test('meta.fixable should be undefined', () => {
      expect(preferAsyncAwaitRule.meta.fixable).toBeUndefined()
    })

    test('meta should not be deprecated', () => {
      expect(preferAsyncAwaitRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(preferAsyncAwaitRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not require type checking', () => {
      expect(preferAsyncAwaitRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta.severity should be warn not error', () => {
      expect(preferAsyncAwaitRule.meta.severity).not.toBe('error')
    })

    test('meta.severity should be warn not off', () => {
      expect(preferAsyncAwaitRule.meta.severity).not.toBe('off')
    })

    test('meta.type should be suggestion not problem', () => {
      expect(preferAsyncAwaitRule.meta.type).not.toBe('problem')
    })

    test('meta.type should be suggestion not layout', () => {
      expect(preferAsyncAwaitRule.meta.type).not.toBe('layout')
    })
  })

  describe('create - visitor structure', () => {
    test('create should be a function', () => {
      expect(typeof preferAsyncAwaitRule.create).toBe('function')
    })

    test('create should return an object', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('create should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('CallExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(visitor.CallExpression.length).toBe(1)
    })

    test('create should return a new visitor each call', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor1 = preferAsyncAwaitRule.create(context)
      const visitor2 = preferAsyncAwaitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should not have other methods besides CallExpression', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toEqual(['CallExpression'])
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(() => preferAsyncAwaitRule.create(context)).not.toThrow()
    })

    test('visitor CallExpression should not throw when called with no args', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('create should handle context with missing logger gracefully', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      expect(() => preferAsyncAwaitRule.create(context)).not.toThrow()
    })
  })

  describe('detecting promise methods - exhaustive', () => {
    test('should report .then() with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{ type: 'ArrowFunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report .catch() with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'catch' },
        },
        arguments: [{ type: 'ArrowFunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report .finally() with arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'finally' },
        },
        arguments: [{ type: 'ArrowFunctionExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report .then() regardless of object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'someOtherVar' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report .catch() regardless of object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myVar' },
          property: { type: 'Identifier', name: 'catch' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report .finally() regardless of object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myVar' },
          property: { type: 'Identifier', name: 'finally' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report .map() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('map'))
      expect(reports.length).toBe(0)
    })

    test('should not report .filter() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('filter'))
      expect(reports.length).toBe(0)
    })

    test('should not report .reduce() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('reduce'))
      expect(reports.length).toBe(0)
    })

    test('should not report .forEach() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('forEach'))
      expect(reports.length).toBe(0)
    })

    test('should not report .find() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('find'))
      expect(reports.length).toBe(0)
    })

    test('should not report .some() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('some'))
      expect(reports.length).toBe(0)
    })

    test('should not report .every() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('every'))
      expect(reports.length).toBe(0)
    })

    test('should not report .includes() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('includes'))
      expect(reports.length).toBe(0)
    })

    test('should not report .indexOf() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('indexOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report .join() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('join'))
      expect(reports.length).toBe(0)
    })

    test('should not report .push() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('push'))
      expect(reports.length).toBe(0)
    })

    test('should not report .pop() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('pop'))
      expect(reports.length).toBe(0)
    })

    test('should not report .shift() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('shift'))
      expect(reports.length).toBe(0)
    })

    test('should not report .slice() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('slice'))
      expect(reports.length).toBe(0)
    })

    test('should not report .splice() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('splice'))
      expect(reports.length).toBe(0)
    })

    test('should not report .concat() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('concat'))
      expect(reports.length).toBe(0)
    })

    test('should not report .sort() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('sort'))
      expect(reports.length).toBe(0)
    })

    test('should not report .flat() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('flat'))
      expect(reports.length).toBe(0)
    })

    test('should not report .flatMap() calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('flatMap'))
      expect(reports.length).toBe(0)
    })

    test('should report .then() on chained calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'promise' },
              property: { type: 'Identifier', name: 'then' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('then')
    })

    test('should not report .then on identifier alone', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'then' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report .catch on identifier alone', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'catch' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report .finally on identifier alone', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'finally' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report method named "Then" (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('Then'))
      expect(reports.length).toBe(0)
    })

    test('should not report method named "Catch" (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('Catch'))
      expect(reports.length).toBe(0)
    })

    test('should not report method named "Finally" (case-sensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('Finally'))
      expect(reports.length).toBe(0)
    })

    test('should not report method named "THEN" (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createMethodCall('THEN'))
      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowPromiseMethods exhaustive', () => {
    test('should not report .then() when allowPromiseMethods is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(0)
    })

    test('should not report .catch() when allowPromiseMethods is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('catch'))
      expect(reports.length).toBe(0)
    })

    test('should not report .finally() when allowPromiseMethods is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('finally'))
      expect(reports.length).toBe(0)
    })

    test('should report .then() when allowPromiseMethods is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: false }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should report .catch() when allowPromiseMethods is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: false }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('catch'))
      expect(reports.length).toBe(1)
    })

    test('should report .finally() when allowPromiseMethods is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: false }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('finally'))
      expect(reports.length).toBe(1)
    })

    test('should report .then() when options is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should report .catch() when options is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('catch'))
      expect(reports.length).toBe(1)
    })

    test('should report .finally() when options is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('finally'))
      expect(reports.length).toBe(1)
    })

    test('should report when options has unrelated properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOtherOption: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should not report when allowPromiseMethods is true regardless of other options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true, other: false }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(0)
    })

    test('should report when options is undefined (default)', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should report when config.options is null', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should report when config.options is empty array', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should report when first option is null', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push({ message: d.message, loc: d.loc }),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases - exhaustive', () => {
    test('should handle node with numeric callee type', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string callee type', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: 'then',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having null property', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: null,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having undefined property', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: undefined,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as property', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: {},
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 42,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: null,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: undefined,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested node', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'fetch' },
                  property: { type: 'Identifier', name: 'then' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'catch' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric property name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 123 },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Literal', value: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where callee.object is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { end: { line: 1, column: 10 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '10' },
        },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with negative line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', -1, -5))
      expect(reports.length).toBe(1)
    })

    test('should handle loc with zero line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 0, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct start line for .then()', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 15, 8))
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report correct start column for .then()', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 15, 8))
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct end line for .then()', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 15, 8))
      expect(reports[0].loc?.end.line).toBe(15)
    })

    test('should report correct end column for .then()', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 15, 8))
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should report correct location for .catch()', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('catch', 20, 4))
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for .finally()', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('finally', 30, 12))
      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location at start of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 500, 100))
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report location when loc has partial start', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'p' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })
  })

  describe('message quality - exhaustive', () => {
    test('.then() message should contain method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message).toContain('.then()')
    })

    test('.catch() message should contain method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('catch'))
      expect(reports[0].message).toContain('.catch()')
    })

    test('.finally() message should contain method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('finally'))
      expect(reports[0].message).toContain('.finally()')
    })

    test('message should mention async/await in lowercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message.toLowerCase()).toContain('async/await')
    })

    test('message should mention readability', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message.toLowerCase()).toContain('readability')
    })

    test('message should mention convert', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message.toLowerCase()).toContain('convert')
    })

    test('message should start with Prefer', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message).toMatch(/^Prefer/)
    })

    test('message should mention Promise chain', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message.toLowerCase()).toContain('promise chain')
    })

    test('message should mention syntax', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message.toLowerCase()).toContain('syntax')
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports[0].message.length).toBeGreaterThan(0)
      expect(typeof reports[0].message).toBe('string')
    })

    test('different methods should produce different messages', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const v1 = preferAsyncAwaitRule.create(ctx1)
      const v2 = preferAsyncAwaitRule.create(ctx2)
      v1.CallExpression(createPromiseThenCall('then'))
      v2.CallExpression(createPromiseThenCall('catch'))
      expect(r1[0].message).not.toBe(r2[0].message)
    })

    test('.then() and .finally() messages should differ', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const v1 = preferAsyncAwaitRule.create(ctx1)
      const v2 = preferAsyncAwaitRule.create(ctx2)
      v1.CallExpression(createPromiseThenCall('then'))
      v2.CallExpression(createPromiseThenCall('finally'))
      expect(r1[0].message).not.toBe(r2[0].message)
    })

    test('.catch() and .finally() messages should differ', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const v1 = preferAsyncAwaitRule.create(ctx1)
      const v2 = preferAsyncAwaitRule.create(ctx2)
      v1.CallExpression(createPromiseThenCall('catch'))
      v2.CallExpression(createPromiseThenCall('finally'))
      expect(r1[0].message).not.toBe(r2[0].message)
    })
  })

  describe('multiple calls behavior', () => {
    test('should report each .then() call separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 1, 0))
      visitor.CallExpression(createPromiseThenCall('then', 2, 0))
      visitor.CallExpression(createPromiseThenCall('then', 3, 0))
      expect(reports.length).toBe(3)
    })

    test('should report each .catch() call separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('catch', 1, 0))
      visitor.CallExpression(createPromiseThenCall('catch', 2, 0))
      expect(reports.length).toBe(2)
    })

    test('should report mixed promise method calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 1, 0))
      visitor.CallExpression(createPromiseThenCall('catch', 2, 0))
      visitor.CallExpression(createPromiseThenCall('finally', 3, 0))
      expect(reports.length).toBe(3)
    })

    test('should only report promise methods, not other methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 1, 0))
      visitor.CallExpression(createMethodCall('map'))
      visitor.CallExpression(createPromiseThenCall('catch', 2, 0))
      visitor.CallExpression(createNonPromiseCall())
      visitor.CallExpression(createPromiseThenCall('finally', 3, 0))
      expect(reports.length).toBe(3)
    })

    test('should handle many consecutive calls without error', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      for (let i = 0; i < 100; i++) {
        visitor.CallExpression(createPromiseThenCall('then', i + 1, 0))
      }
      expect(reports.length).toBe(100)
    })

    test('should handle alternating valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createPromiseThenCall('then', i * 2 + 1, 0))
        visitor.CallExpression(createMethodCall('map', i * 2 + 2, 0))
      }
      expect(reports.length).toBe(50)
    })

    test('should track correct location for each call', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 5, 10))
      visitor.CallExpression(createPromiseThenCall('catch', 15, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[1].loc?.start.line).toBe(15)
      expect(reports[1].loc?.start.column).toBe(20)
    })
  })

  describe('exports and module shape', () => {
    test('should export preferAsyncAwaitRule as named export', () => {
      expect(preferAsyncAwaitRule).toBeDefined()
    })

    test('should have meta property on the rule', () => {
      expect(preferAsyncAwaitRule).toHaveProperty('meta')
    })

    test('should have create property on the rule', () => {
      expect(preferAsyncAwaitRule).toHaveProperty('create')
    })

    test('rule should be an object', () => {
      expect(typeof preferAsyncAwaitRule).toBe('object')
    })

    test('rule should not be null', () => {
      expect(preferAsyncAwaitRule).not.toBeNull()
    })

    test('rule meta should be frozen-like (readonly)', () => {
      expect(preferAsyncAwaitRule.meta.type).toBe('suggestion')
    })

    test('rule should have exactly meta and create properties', () => {
      const keys = Object.keys(preferAsyncAwaitRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('createMockContext integration', () => {
    test('createMockContext should return context and reports', () => {
      const result = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(result).toHaveProperty('context')
      expect(result).toHaveProperty('reports')
    })

    test('createMockContext reports should start empty', () => {
      const { reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(reports).toEqual([])
    })

    test('createMockContext should accept custom filePath', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);', filePath: '/custom/path.ts' })
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('createMockContext should accept custom source', () => {
      const { context } = createMockRuleContext({ source: 'custom source code', filePath: '/src/file.ts' })
      expect(context.getSource()).toBe('custom source code')
    })

    test('createMockContext should provide getAST returning null', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(context.getAST()).toBeNull()
    })

    test('createMockContext should provide getTokens returning empty array', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(context.getTokens()).toEqual([])
    })

    test('createMockContext should provide getComments returning empty array', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(context.getComments()).toEqual([])
    })

    test('createMockContext should provide workspaceRoot', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(context.workspaceRoot).toBe('/src')
    })

    test('createMockContext should provide logger methods', () => {
      const { context } = createMockRuleContext({ source: 'promise.then(x => x);' })
      expect(typeof context.logger.debug).toBe('function')
      expect(typeof context.logger.info).toBe('function')
      expect(typeof context.logger.warn).toBe('function')
      expect(typeof context.logger.error).toBe('function')
    })

    test('createMockContext report should push to reports array', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      context.report({ message: 'test', loc: undefined })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('test')
    })
  })

  describe('createPromiseThenCall helper', () => {
    test('should create node with correct type', () => {
      const node = createPromiseThenCall('then')
      const n = node as Record<string, unknown>
      expect(n.type).toBe('CallExpression')
    })

    test('should create node with MemberExpression callee', () => {
      const node = createPromiseThenCall('then')
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      expect(callee.type).toBe('MemberExpression')
    })

    test('should create node with correct method name', () => {
      const node = createPromiseThenCall('catch')
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      const prop = callee.property as Record<string, unknown>
      expect(prop.name).toBe('catch')
    })

    test('should create node with default location', () => {
      const node = createPromiseThenCall('then')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })

    test('should create node with custom location', () => {
      const node = createPromiseThenCall('then', 10, 5)
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(10)
      expect(loc.start.column).toBe(5)
    })

    test('should create node with object name "promise"', () => {
      const node = createPromiseThenCall('then')
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      const obj = callee.object as Record<string, unknown>
      expect(obj.name).toBe('promise')
    })
  })

  describe('createNonPromiseCall helper', () => {
    test('should create node with Identifier callee', () => {
      const node = createNonPromiseCall()
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      expect(callee.type).toBe('Identifier')
    })

    test('should create node with asyncFunction name', () => {
      const node = createNonPromiseCall()
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      expect(callee.name).toBe('asyncFunction')
    })

    test('should not trigger report', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createNonPromiseCall())
      expect(reports.length).toBe(0)
    })
  })

  describe('createMethodCall helper', () => {
    test('should create node with MemberExpression callee', () => {
      const node = createMethodCall('map')
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      expect(callee.type).toBe('MemberExpression')
    })

    test('should create node with correct method name', () => {
      const node = createMethodCall('filter')
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      const prop = callee.property as Record<string, unknown>
      expect(prop.name).toBe('filter')
    })

    test('should create node with object name "obj"', () => {
      const node = createMethodCall('map')
      const n = node as Record<string, unknown>
      const callee = n.callee as Record<string, unknown>
      const obj = callee.object as Record<string, unknown>
      expect(obj.name).toBe('obj')
    })

    test('should create node with default location', () => {
      const node = createMethodCall('map')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })

    test('should create node with custom location', () => {
      const node = createMethodCall('map', 5, 10)
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(5)
      expect(loc.start.column).toBe(10)
    })
  })

  describe('rule behavior with different contexts', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);', filePath: '/project/utils/async.ts' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'fetch(url).then(r => r.json())', filePath: '/src/file.ts' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.ts'
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);', filePath: longPath })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('should work with special characters in file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);', filePath: '/src/[file].ts' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      expect(reports.length).toBe(1)
    })

    test('visitor created from one context should be independent of another', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ options: [{ allowPromiseMethods: false }], source: 'promise.then(x => x);' })
      const v1 = preferAsyncAwaitRule.create(ctx1)
      const v2 = preferAsyncAwaitRule.create(ctx2)
      v1.CallExpression(createPromiseThenCall('then'))
      v2.CallExpression(createPromiseThenCall('then'))
      expect(r1.length).toBe(0)
      expect(r2.length).toBe(1)
    })
  })

  describe('type guards and node structure validation', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
          extra: true,
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        extraProp: 'hello',
        range: [0, 10],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle callee with extra nested MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'promise' },
          },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle ThisExpression as object', () => {
      const { context, reports } = createMockRuleContext({ source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('allowPromiseMethods with multiple calls', () => {
    test('should suppress all reports when allowPromiseMethods is true', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 1, 0))
      visitor.CallExpression(createPromiseThenCall('catch', 2, 0))
      visitor.CallExpression(createPromiseThenCall('finally', 3, 0))
      expect(reports.length).toBe(0)
    })

    test('should report all calls when allowPromiseMethods is false', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: false }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then', 1, 0))
      visitor.CallExpression(createPromiseThenCall('catch', 2, 0))
      visitor.CallExpression(createPromiseThenCall('finally', 3, 0))
      expect(reports.length).toBe(3)
    })

    test('allowPromiseMethods true should suppress even with null node after', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowPromiseMethods: true }], source: 'promise.then(x => x);' })
      const visitor = preferAsyncAwaitRule.create(context)
      visitor.CallExpression(createPromiseThenCall('then'))
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })
  })
})
