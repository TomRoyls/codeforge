import { describe, test, expect, vi } from 'vitest'
import { noThenableRule } from '../../../../src/rules/patterns/no-thenable.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'promise.then(() => {});',
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

function createCallExpression(propertyName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      property: {
        type: 'Identifier',
        name: propertyName,
      },
    },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: propertyName.length + 10 },
    },
  }
}

function createNonMemberExpressionCall(lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'then',
    },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

describe('no-thenable rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noThenableRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noThenableRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noThenableRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noThenableRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noThenableRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noThenableRule.meta.fixable).toBeUndefined()
    })

    test('should mention then in description', () => {
      expect(noThenableRule.meta.docs?.description.toLowerCase()).toContain('then')
    })

    test('should mention async/await in description', () => {
      const desc = noThenableRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/async|await/)
    })

    test('should have empty schema array', () => {
      expect(noThenableRule.meta.schema).toEqual([])
    })

    test('should have docs property', () => {
      expect(noThenableRule.meta.docs).toBeDefined()
    })

    test('should have docs url', () => {
      expect(noThenableRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as string', () => {
      expect(typeof noThenableRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing codeforge', () => {
      expect(noThenableRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noThenableRule.meta.type)
    })

    test('should have valid severity', () => {
      expect(['off', 'warn', 'error']).toContain(noThenableRule.meta.severity)
    })

    test('should have meta as object', () => {
      expect(typeof noThenableRule.meta).toBe('object')
    })

    test('should have meta type as string', () => {
      expect(typeof noThenableRule.meta.type).toBe('string')
    })

    test('should have meta severity as string', () => {
      expect(typeof noThenableRule.meta.severity).toBe('string')
    })

    test('should have docs description as string', () => {
      expect(typeof noThenableRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty docs description', () => {
      expect(noThenableRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs description starting with uppercase', () => {
      const desc = noThenableRule.meta.docs?.description
      if (desc) {
        expect(desc[0]).toBe(desc[0].toUpperCase())
      }
    })

    test('should have valid docs category', () => {
      expect(['complexity', 'dependencies', 'performance', 'security', 'patterns']).toContain(
        noThenableRule.meta.docs?.category,
      )
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noThenableRule.meta.schema)).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(noThenableRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noThenableRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noThenableRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have docs recommended as boolean true', () => {
      expect(noThenableRule.meta.docs?.recommended).toBe(true)
    })

    test('should have meta with exactly expected properties', () => {
      expect(noThenableRule.meta).toHaveProperty('type')
      expect(noThenableRule.meta).toHaveProperty('severity')
      expect(noThenableRule.meta).toHaveProperty('docs')
      expect(noThenableRule.meta).toHaveProperty('schema')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return object from create', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have CallExpression as function', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return visitor with only CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('should accept one argument in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(visitor.CallExpression.length).toBe(1)
    })

    test('should return undefined from CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      const result = visitor.CallExpression(createCallExpression('then'))

      expect(result).toBeUndefined()
    })

    test('should return new visitor for each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noThenableRule.create(context)
      const visitor2 = noThenableRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should create visitor with different context instances', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext({}, '/other/file.ts')
      const visitor1 = noThenableRule.create(ctx1)
      const visitor2 = noThenableRule.create(ctx2)

      expect(typeof visitor1.CallExpression).toBe('function')
      expect(typeof visitor2.CallExpression).toBe('function')
    })
  })

  describe('detecting .then() calls', () => {
    test('should report .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('catch'))
      visitor.CallExpression(createCallExpression('finally'))
      visitor.CallExpression(createCallExpression('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-member expression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createNonMemberExpressionCall())

      expect(reports.length).toBe(0)
    })

    test('should report correct message for .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toBe('Prefer async/await over .then() method.')
    })

    test('should report multiple .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 2, 0))
      visitor.CallExpression(createCallExpression('then', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report .then() among other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('catch'))
      visitor.CallExpression(createCallExpression('then'))
      visitor.CallExpression(createCallExpression('finally'))
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(2)
    })

    test('should report .then() on promise-like object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() on fetch result', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' } },
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 3, column: 5 }, end: { line: 3, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report chained .then() calls independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 2, 5))
      visitor.CallExpression(createCallExpression('then', 3, 10))

      expect(reports.length).toBe(3)
    })

    test('should report .then() with arguments node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() without arguments node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() with arrow function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() with regular function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{ type: 'FunctionExpression', id: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() on variable member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myPromise' },
          property: { type: 'Identifier', name: 'then' },
          computed: false,
        },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 18 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() on return value chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'api' },
              property: { type: 'Identifier', name: 'getData' },
            },
          },
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('negative cases - other method names', () => {
    test('should not report .catch() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('catch'))

      expect(reports.length).toBe(0)
    })

    test('should not report .finally() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('finally'))

      expect(reports.length).toBe(0)
    })

    test('should not report .map() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report .filter() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('filter'))

      expect(reports.length).toBe(0)
    })

    test('should not report .reduce() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not report .forEach() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report .find() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('find'))

      expect(reports.length).toBe(0)
    })

    test('should not report .some() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('some'))

      expect(reports.length).toBe(0)
    })

    test('should not report .every() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('every'))

      expect(reports.length).toBe(0)
    })

    test('should not report .includes() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('includes'))

      expect(reports.length).toBe(0)
    })

    test('should not report .indexOf() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('indexOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report .join() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('join'))

      expect(reports.length).toBe(0)
    })

    test('should not report .slice() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('slice'))

      expect(reports.length).toBe(0)
    })

    test('should not report .splice() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('splice'))

      expect(reports.length).toBe(0)
    })

    test('should not report .concat() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('concat'))

      expect(reports.length).toBe(0)
    })

    test('should not report .push() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('push'))

      expect(reports.length).toBe(0)
    })

    test('should not report .pop() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('pop'))

      expect(reports.length).toBe(0)
    })

    test('should not report .shift() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('shift'))

      expect(reports.length).toBe(0)
    })

    test('should not report .toString() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report .valueOf() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('valueOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report .then with capital T (Then)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('Then'))

      expect(reports.length).toBe(0)
    })

    test('should not report .THEN in all caps', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('THEN'))

      expect(reports.length).toBe(0)
    })

    test('should not report .tHen mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('tHen'))

      expect(reports.length).toBe(0)
    })

    test('should not report "then " with trailing space', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then '))

      expect(reports.length).toBe(0)
    })

    test('should not report " then" with leading space', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression(' then'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle callee without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

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
        getSource: () => 'promise.then(() => {});',
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

      const visitor = noThenableRule.create(context)
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should handle property without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 'Identifier',
          },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property with non-identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 'Literal',
            value: 'then',
          },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
          extra: true,
          data: { foo: 'bar' },
        },
        extra: 'ignored',
        range: [0, 10],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node type with different casing', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'callexpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node type with all caps', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CALLEXPRESSION',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee type not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'then',
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: null,
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee as empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '10' } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with null values', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: null,
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle callee property with numeric name', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 42 },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee property with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: '' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property name "thenable" (contains then but not exact)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('thenable'))

      expect(reports.length).toBe(0)
    })

    test('should handle property name "getThen" (contains then but not exact)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('getThen'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('async')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('await')
    })

    test('should mention then in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('then')
    })

    test('should use .then() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('.then()')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))
      visitor.CallExpression(createCallExpression('then', 2, 0))

      expect(reports[0].message).toBe('Prefer async/await over .then() method.')
      expect(reports[1].message).toBe('Prefer async/await over .then() method.')
    })

    test('should return message as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message starting with Prefer', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message.startsWith('Prefer')).toBe(true)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should not vary message with different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 100, 50))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should not vary message with different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext({}, '/other/file.ts', 'x.then()')

      const v1 = noThenableRule.create(ctx1)
      const v2 = noThenableRule.create(ctx2)

      v1.CallExpression(createCallExpression('then'))
      v2.CallExpression(createCallExpression('then'))

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should have message with reasonable length', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message.length).toBeGreaterThan(10)
      expect(reports[0].message.length).toBeLessThan(200)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should preserve exact start position', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 42, 17))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should preserve exact end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('should report independent locations for multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 5, 10))
      visitor.CallExpression(createCallExpression('then', 20, 3))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(20)
    })

    test('should use default location when loc missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: undefined,
      }
      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location start line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 7, 3))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should report location start column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 7, 3))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report location end line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 7, 3))

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should report location end column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 7, 3))

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should handle loc at zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report 5 consecutive .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createCallExpression('then', i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report 10 consecutive .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createCallExpression('then', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report mixed .then() and other calls correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('map', 2, 0))
      visitor.CallExpression(createCallExpression('then', 3, 0))
      visitor.CallExpression(createCallExpression('filter', 4, 0))
      visitor.CallExpression(createCallExpression('then', 5, 0))

      expect(reports.length).toBe(3)
    })

    test('should report .then() calls at different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 10, 5))
      visitor.CallExpression(createCallExpression('then', 100, 20))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[2].loc?.start.line).toBe(100)
    })

    test('should have correct messages for all reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 2, 0))
      visitor.CallExpression(createCallExpression('then', 3, 0))

      for (const report of reports) {
        expect(report.message).toBe('Prefer async/await over .then() method.')
      }
    })

    test('should report interleaved .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('map'))
      visitor.CallExpression(createCallExpression('then'))
      visitor.CallExpression(createCallExpression('filter'))
      visitor.CallExpression(createCallExpression('then'))
      visitor.CallExpression(createCallExpression('reduce'))
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(3)
    })

    test('should maintain order of reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 2, 5))
      visitor.CallExpression(createCallExpression('then', 3, 10))

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(5)
      expect(reports[2].loc?.start.column).toBe(10)
    })

    test('should not report any when no .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('map'))
      visitor.CallExpression(createCallExpression('filter'))
      visitor.CallExpression(createCallExpression('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should report single .then() among many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createCallExpression('map'))
      }
      visitor.CallExpression(createCallExpression('then'))
      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createCallExpression('filter'))
      }

      expect(reports.length).toBe(1)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/src/utils/async.ts')
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const x = p.then(() => 1)',
      )
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with long source', () => {
      const longSource = 'x'.repeat(10000) + '.then(() => {})'
      const { context, reports } = createMockContext({}, '/src/file.ts', longSource)
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with options object', () => {
      const { context, reports } = createMockContext({ strict: true })
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with null options object', () => {
      const { context, reports } = createMockContext(null)
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined options object', () => {
      const { context, reports } = createMockContext(undefined)
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with config without options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'promise.then(() => {});',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThenableRule.create(context)
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested workspaceRoot', () => {
      const { context, reports } = createMockContext()
      context.workspaceRoot
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should report independently per context', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noThenableRule.create(ctx1)
      const v2 = noThenableRule.create(ctx2)

      v1.CallExpression(createCallExpression('then'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('exports', () => {
    test('should have named export', () => {
      expect(noThenableRule).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noThenableRule.meta).toBeDefined()
    })

    test('should have create property', () => {
      expect(noThenableRule.create).toBeDefined()
    })

    test('should have create as function', () => {
      expect(typeof noThenableRule.create).toBe('function')
    })

    test('should have meta as object', () => {
      expect(typeof noThenableRule.meta).toBe('object')
    })

    test('should have meta.type as string', () => {
      expect(typeof noThenableRule.meta.type).toBe('string')
    })

    test('should have meta.severity as string', () => {
      expect(typeof noThenableRule.meta.severity).toBe('string')
    })

    test('should have exactly meta and create properties', () => {
      expect(Object.keys(noThenableRule)).toContain('meta')
      expect(Object.keys(noThenableRule)).toContain('create')
    })

    test('should be a valid RuleDefinition shape', () => {
      expect(noThenableRule.meta).toBeDefined()
      expect(typeof noThenableRule.create).toBe('function')
    })
  })

  describe('report descriptor', () => {
    test('should have message in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc.end in report descriptor', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should call report exactly once per .then() detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should call report zero times for non-.then() detection', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('map'))

      expect(reports.length).toBe(0)
    })

    test('should have loc.start.line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have loc.start.column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have loc.end.line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have loc.end.column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  describe('isThenable internal logic', () => {
    test('should not crash on function node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on Symbol node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should detect .then() when property name is exactly then', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not detect when callee type is Super', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Super',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect when property type is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'StringLiteral', value: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect when property type is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'NumericLiteral', value: 0 },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested node structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

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
                callee: { type: 'Identifier', name: 'fetch' },
              },
              property: { type: 'Identifier', name: 'json' },
            },
          },
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with all extra AST properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        leadingComments: [],
        trailingComments: [],
        innerComments: [],
        parent: {},
        scope: {},
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() when callee.object is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: undefined,
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report .then() when callee.object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor robustness', () => {
    test('should handle rapid successive calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.CallExpression(createCallExpression('then', i + 1, 0))
      }

      expect(reports.length).toBe(100)
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          visitor.CallExpression(createCallExpression('then', i + 1, 0))
        } else {
          visitor.CallExpression(null)
        }
      }

      expect(reports.length).toBe(25)
    })

    test('should not accumulate state between calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))
      expect(reports.length).toBe(1)

      visitor.CallExpression(createCallExpression('then'))
      expect(reports.length).toBe(2)

      visitor.CallExpression(createCallExpression('map'))
      expect(reports.length).toBe(2)

      visitor.CallExpression(createCallExpression('then'))
      expect(reports.length).toBe(3)
    })

    test('should work after many non-matching calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createCallExpression('map'))
      }
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should not be affected by previous null nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(undefined)
      visitor.CallExpression({})
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Prefer async/await over .then() method.')
    })
  })

  describe('additional edge cases', () => {
    test('should not report .then when property name has unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then\u200B'))

      expect(reports.length).toBe(0)
    })

    test('should handle node with circular reference gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node: Record<string, unknown> = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      node.self = node

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee property name as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: true },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee property name as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: { toString: () => 'then' } },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report .then() with optional member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          optional: true,
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node that is a class instance', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      class CustomNode {
        type = 'CallExpression'
        callee = {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        }
      }

      expect(() => visitor.CallExpression(new CustomNode())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle callee with additional non-standard properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
          computed: false,
          optional: false,
          shorthand: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report for CallExpression with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: undefined,
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for node type that is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 42,
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee.type is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 1,
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property type is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 3,
            name: 'then',
          },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report .then() when property has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 'Identifier',
            name: 'then',
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 9 } },
            range: [5, 9],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})
