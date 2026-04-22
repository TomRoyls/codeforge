import { describe, test, expect, vi } from 'vitest'
import { noNewFuncRule } from '../../../../src/rules/patterns/no-new-func.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createNewExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

function createCallExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 8 },
    },
  }
}

function createFunctionDeclaration(lineNumber = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'myFunc' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createArrowFunctionExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

function createNewExpressionWithArgs(
  calleeName: string,
  args: unknown[],
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

function createCallExpressionWithArgs(
  calleeName: string,
  args: unknown[],
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 8 },
    },
  }
}

function createMemberExpressionNew(
  objectName: string,
  propertyName: string,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + objectName.length + propertyName.length + 10 },
    },
  }
}

function createMemberExpressionCall(
  objectName: string,
  propertyName: string,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + objectName.length + propertyName.length + 8 },
    },
  }
}

describe('no-new-func rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNewFuncRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNewFuncRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNewFuncRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noNewFuncRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noNewFuncRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noNewFuncRule.meta.fixable).toBeUndefined()
    })

    test('should mention Function in description', () => {
      expect(noNewFuncRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should mention security risk in description', () => {
      const desc = noNewFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/security|risk|eval/)
    })

    test('should have empty schema array', () => {
      expect(noNewFuncRule.meta.schema).toEqual([])
    })

    test('should have docs property', () => {
      expect(noNewFuncRule.meta.docs).toBeDefined()
    })

    test('should have docs description', () => {
      expect(noNewFuncRule.meta.docs?.description).toBeDefined()
      expect(typeof noNewFuncRule.meta.docs?.description).toBe('string')
    })

    test('should have docs url', () => {
      expect(noNewFuncRule.meta.docs?.url).toBeDefined()
    })

    test('should not be deprecated', () => {
      expect(noNewFuncRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noNewFuncRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noNewFuncRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should mention eval in description', () => {
      expect(noNewFuncRule.meta.docs?.description).toContain('eval')
    })

    test('should have a non-empty description', () => {
      expect(noNewFuncRule.meta.docs?.description.length).toBeGreaterThan(10)
    })

    test('should mention runtime in description', () => {
      expect(noNewFuncRule.meta.docs?.description.toLowerCase()).toContain('runtime')
    })

    test('should mention strings in description', () => {
      expect(noNewFuncRule.meta.docs?.description.toLowerCase()).toContain('strings')
    })
  })

  describe('create', () => {
    test('should return visitor object with NewExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return visitor with exactly two methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should return visitor methods that are functions', () => {
      const { context } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(typeof visitor.NewExpression).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor object each time create is called', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noNewFuncRule.create(context)
      const visitor2 = noNewFuncRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting new Function()', () => {
    test('should report new Function() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })

    test('should report multiple new Function() calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.NewExpression(createNewExpression('Function', 2, 0))
      visitor.NewExpression(createNewExpression('Function', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report new Function() with string argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(
        createNewExpressionWithArgs('Function', [{ type: 'Literal', value: 'return 1' }]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new Function() with multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(
        createNewExpressionWithArgs('Function', [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'return a + b' },
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new Function() at various line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.NewExpression(createNewExpression('Function', 50, 0))
      visitor.NewExpression(createNewExpression('Function', 100, 0))
      visitor.NewExpression(createNewExpression('Function', 999, 0))

      expect(reports.length).toBe(4)
    })

    test('should report new Function() at various column offsets', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.NewExpression(createNewExpression('Function', 1, 4))
      visitor.NewExpression(createNewExpression('Function', 1, 8))
      visitor.NewExpression(createNewExpression('Function', 1, 16))

      expect(reports.length).toBe(4)
    })

    test('should report new Function() with empty arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new Function() even when deeply nested in code', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 42, 16))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })
  })

  describe('detecting Function() without new', () => {
    test('should report Function() call without new', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for Function() without new', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function'))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })

    test('should report multiple Function() calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))
      visitor.CallExpression(createCallExpression('Function', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report Function() with string argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(
        createCallExpressionWithArgs('Function', [{ type: 'Literal', value: 'return 1' }]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Function() with multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(
        createCallExpressionWithArgs('Function', [
          { type: 'Literal', value: 'x' },
          { type: 'Literal', value: 'return x * 2' },
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Function() at various line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 5, 0))
      visitor.CallExpression(createCallExpression('Function', 25, 0))
      visitor.CallExpression(createCallExpression('Function', 100, 0))

      expect(reports.length).toBe(3)
    })

    test('should report Function() at various column offsets', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 1, 12))
      visitor.CallExpression(createCallExpression('Function', 1, 24))

      expect(reports.length).toBe(3)
    })
  })

  describe('not reporting regular function declarations', () => {
    test('should not report function declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report regular constructor calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Object'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Math'))
      visitor.CallExpression(createCallExpression('console'))
      visitor.CallExpression(createCallExpression('myFunc'))

      expect(reports.length).toBe(0)
    })
  })

  describe('case sensitivity', () => {
    test('should not report new function (lowercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('function'))

      expect(reports.length).toBe(0)
    })

    test('should not report function() call (lowercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('function'))

      expect(reports.length).toBe(0)
    })

    test('should not report new FUNCTION (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('FUNCTION'))

      expect(reports.length).toBe(0)
    })

    test('should not report FUNCTION() call (uppercase)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('FUNCTION'))

      expect(reports.length).toBe(0)
    })

    test('should report exactly Function with capital F', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should not report fuNcTiOn mixed case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('fuNcTiOn'))

      expect(reports.length).toBe(0)
    })
  })

  describe('safe constructors - NewExpression', () => {
    const safeConstructors = [
      'Array',
      'Object',
      'Date',
      'Map',
      'Set',
      'WeakMap',
      'WeakSet',
      'Promise',
      'RegExp',
      'Error',
      'TypeError',
      'RangeError',
      'SyntaxError',
      'ReferenceError',
      'URIError',
      'EvalError',
      'ArrayBuffer',
      'DataView',
      'Float32Array',
      'Float64Array',
      'Int8Array',
      'Int16Array',
      'Int32Array',
      'Uint8Array',
      'Uint16Array',
      'Uint32Array',
      'Uint8ClampedArray',
      'Number',
      'String',
      'Boolean',
      'Symbol',
    ]

    test.each(safeConstructors)('should not report new %s()', (name) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression(name))

      expect(reports.length).toBe(0)
    })
  })

  describe('safe function calls - CallExpression', () => {
    const safeCalls = [
      'parseInt',
      'parseFloat',
      'isNaN',
      'isFinite',
      'encodeURI',
      'decodeURI',
      'encodeURIComponent',
      'decodeURIComponent',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'clearInterval',
      'fetch',
      'JSON',
      'Math',
      'console',
      'alert',
      'require',
      'define',
      'module',
      'exports',
      'myFunc',
      'callback',
      'handler',
      'process',
    ]

    test.each(safeCalls)('should not report %s() call', (name) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression(name))

      expect(reports.length).toBe(0)
    })
  })

  describe('member expression callees', () => {
    test('should not report new window.Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createMemberExpressionNew('window', 'Function'))

      expect(reports.length).toBe(0)
    })

    test('should not report new globalThis.Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createMemberExpressionNew('globalThis', 'Function'))

      expect(reports.length).toBe(0)
    })

    test('should not report new obj.Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createMemberExpressionNew('obj', 'Function'))

      expect(reports.length).toBe(0)
    })

    test('should not report window.Function() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createMemberExpressionCall('window', 'Function'))

      expect(reports.length).toBe(0)
    })

    test('should not report globalThis.Function() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createMemberExpressionCall('globalThis', 'Function'))

      expect(reports.length).toBe(0)
    })

    test('should not report new some.path.Constructor()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'some' },
            property: { type: 'Identifier', name: 'path' },
          },
          property: { type: 'Identifier', name: 'Constructor' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

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
        getSource: () => 'new Function()',
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

      const visitor = noNewFuncRule.create(context)
      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(() => visitor.NewExpression(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle numeric node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression(0)).not.toThrow()
      expect(() => visitor.NewExpression(-1)).not.toThrow()
      expect(() => visitor.NewExpression(3.14)).not.toThrow()
      expect(() => visitor.NewExpression(NaN)).not.toThrow()
      expect(() => visitor.NewExpression(Infinity)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle numeric node in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()
      expect(() => visitor.CallExpression(3.14)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee in NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression({
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee in CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type but Function callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        callee: { type: 'Identifier', name: 'Function' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having non-Identifier type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Literal', value: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having no name property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee having no name property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee name as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 42 },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee name as empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for new Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for Function() without new', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location with end position for new Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location with end position for Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report end location correctly for new Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 3, 4))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('should report end location correctly for Function() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 7, 2))

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('should handle node without loc gracefully for NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node without loc gracefully for CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (missing end) for NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 5, column: 3 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with partial loc (missing start) for NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { end: { line: 5, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing non-numeric values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: {
          start: { line: 'one', column: 'zero' },
          end: { line: 'two', column: 'ten' },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })
  })

  describe('message quality', () => {
    test('should mention Function in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('Function')
    })

    test('should mention constructor in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('constructor')
    })

    test('should mention unexpected in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should have consistent message format for new Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.NewExpression(createNewExpression('Function', 2, 0))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
      expect(reports[1].message).toBe('Unexpected use of Function constructor.')
    })

    test('should have consistent message format for Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
      expect(reports[1].message).toBe('Unexpected use of Function constructor.')
    })

    test('should have same message for new Function() and Function()', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('.')
    })

    test('should have exactly the expected message text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })
  })

  describe('mixed scenarios', () => {
    test('should report both new Function() and Function() in same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report Function() among safe calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('parseInt'))
      visitor.CallExpression(createCallExpression('Function'))
      visitor.CallExpression(createCallExpression('console'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })

    test('should report new Function() among safe constructors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Function'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })

    test('should report all Function usages in a mixed sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Function', 2, 0))
      visitor.CallExpression(createCallExpression('parseInt'))
      visitor.CallExpression(createCallExpression('Function', 4, 0))
      visitor.NewExpression(createNewExpression('Map'))
      visitor.NewExpression(createNewExpression('Function', 6, 0))

      expect(reports.length).toBe(3)
    })

    test('should track reports independently for NewExpression and CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))
      visitor.NewExpression(createNewExpression('Function', 3, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })

  describe('report accumulation', () => {
    test('should accumulate 5 reports correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression('Function', i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should accumulate 10 reports correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression('Function', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should accumulate reports with correct line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.NewExpression(createNewExpression('Function', (i + 1) * 10, 0))
      }

      expect(reports.length).toBe(5)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
      expect(reports[3].loc?.start.line).toBe(40)
      expect(reports[4].loc?.start.line).toBe(50)
    })

    test('should accumulate mixed reports correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.NewExpression(createNewExpression('Function', i + 1, 0))
        visitor.CallExpression(createCallExpression('Function', i + 1, 20))
      }

      expect(reports.length).toBe(6)
    })

    test('should not accumulate reports for safe constructors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression('Array', i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/utils/eval.ts' })
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Function("return 1")', filePath: '/src/file.ts' })
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'const f = new Function()', filePath: '/src/file.js' })
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should work with deep nested file path', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/a/b/c/d/e/file.ts' })
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing allowlist', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allow: ['Function'] }] })
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should work with extra options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extra: true, count: 5 }] })
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })
  })

  describe('function expression types that should not report', () => {
    test('should not report FunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression({
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration via CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should not report ArrowFunctionExpression via CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('callee type variations', () => {
    test('should not report when callee is a CallExpression (IIFE-style)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getFunction' },
          arguments: [],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'A' },
          alternate: { type: 'Identifier', name: 'B' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression with CallExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getFactory' },
          arguments: [],
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('arguments variations', () => {
    test('should report new Function() with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(
        createNewExpressionWithArgs('Function', [
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Function() with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(
        createCallExpressionWithArgs('Function', [{ type: 'Identifier', name: 'body' }]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new Function() with BinaryExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(
        createNewExpressionWithArgs('Function', [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 'return ' },
            right: { type: 'Identifier', name: 'expr' },
          },
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report new Function() with many arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const args = Array.from({ length: 10 }, (_, i) => ({
        type: 'Identifier',
        name: `arg${i}`,
      }))
      visitor.NewExpression(createNewExpressionWithArgs('Function', args))

      expect(reports.length).toBe(1)
    })

    test('should report Function() with many arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const args = Array.from({ length: 5 }, (_, i) => ({
        type: 'Literal',
        value: `param${i}`,
      }))
      visitor.CallExpression(createCallExpressionWithArgs('Function', args))

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor independence', () => {
    test('should isolate reports between different visitors', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noNewFuncRule.create(ctx1.context)
      const visitor2 = noNewFuncRule.create(ctx2.context)

      visitor1.NewExpression(createNewExpression('Function'))
      visitor2.NewExpression(createNewExpression('Function'))
      visitor2.NewExpression(createNewExpression('Function'))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(2)
    })

    test('should not share state between visitors', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = noNewFuncRule.create(ctx1.context)
      const visitor2 = noNewFuncRule.create(ctx2.context)

      visitor1.NewExpression(createNewExpression('Function'))
      visitor1.NewExpression(createNewExpression('Function'))
      visitor1.NewExpression(createNewExpression('Function'))

      expect(ctx2.reports.length).toBe(0)
    })

    test('should allow creating visitor after another has been used', () => {
      const ctx1 = createMockRuleContext()
      const visitor1 = noNewFuncRule.create(ctx1.context)
      visitor1.NewExpression(createNewExpression('Function'))

      const ctx2 = createMockRuleContext()
      const visitor2 = noNewFuncRule.create(ctx2.context)
      visitor2.CallExpression(createCallExpression('Function'))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
    })
  })

  describe('special node shapes', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 14],
        leadingComments: [],
        trailingComments: [],
        extra: { parenthesized: true },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with array-like arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [
          { type: 'Literal', value: 'x' },
          { type: 'Literal', value: 'return x' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NewExpression with type as non-string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node where type is number instead of string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression({ type: 42 })

      expect(reports.length).toBe(0)
    })

    test('should handle node where callee type is number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 42, name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('rule definition structure', () => {
    test('should have create as a function', () => {
      expect(typeof noNewFuncRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noNewFuncRule.meta).toBe('object')
    })

    test('should have default export', () => {
      expect(noNewFuncRule).toBeDefined()
    })

    test('should be a valid RuleDefinition', () => {
      expect(noNewFuncRule.meta).toBeDefined()
      expect(noNewFuncRule.create).toBeDefined()
    })
  })

  describe('boundary locations', () => {
    test('should handle line 0 gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 0, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1000000, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1000000)
    })

    test('should handle large column numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 999999))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(999999)
    })

    test('should handle negative column gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Function' },
        arguments: [],
        loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 10 } },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('repeated calls', () => {
    test('should handle same node visited twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const node = createNewExpression('Function')
      visitor.NewExpression(node)
      visitor.NewExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should handle rapid alternating NewExpression/CallExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.NewExpression(createNewExpression('Function', i + 1, 0))
        } else {
          visitor.CallExpression(createCallExpression('Function', i + 1, 0))
        }
      }

      expect(reports.length).toBe(20)
    })

    test('should handle 50 consecutive new Function() calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.NewExpression(createNewExpression('Function', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle 50 consecutive Function() calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createCallExpression('Function', i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })
  })

  describe('concurrent safe calls intermixed', () => {
    test('should only report Function among 20 mixed NewExpressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const names = [
        'Array',
        'Function',
        'Object',
        'Map',
        'Set',
        'Function',
        'Date',
        'RegExp',
        'Function',
        'Error',
        'Promise',
        'ArrayBuffer',
        'Function',
        'DataView',
        'Int8Array',
        'Function',
        'Number',
        'String',
        'Function',
        'Boolean',
      ]

      for (const name of names) {
        visitor.NewExpression(createNewExpression(name))
      }

      expect(reports.length).toBe(6)
    })

    test('should only report Function among 20 mixed CallExpressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      const names = [
        'parseInt',
        'Function',
        'parseFloat',
        'Function',
        'isNaN',
        'console',
        'Function',
        'setTimeout',
        'fetch',
        'Function',
        'require',
        'alert',
        'Function',
        'myFunc',
        'handler',
        'process',
        'Function',
        'module',
        'exports',
        'Function',
      ]

      for (const name of names) {
        visitor.CallExpression(createCallExpression(name))
      }

      expect(reports.length).toBe(7)
    })
  })

  describe('location integrity across many reports', () => {
    test('should preserve correct location for each of many reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.NewExpression(createNewExpression('Function', i * 10 + 1, i * 2))
      }

      for (let i = 0; i < 10; i++) {
        expect(reports[i].loc?.start.line).toBe(i * 10 + 1)
        expect(reports[i].loc?.start.column).toBe(i * 2)
      }
    })

    test('should preserve correct messages for all reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noNewFuncRule.create(context)

      for (let i = 0; i < 15; i++) {
        if (i % 2 === 0) {
          visitor.NewExpression(createNewExpression('Function'))
        } else {
          visitor.CallExpression(createCallExpression('Function'))
        }
      }

      for (const report of reports) {
        expect(report.message).toBe('Unexpected use of Function constructor.')
      }
    })
  })

  describe('default export', () => {
    test('should be importable as default', () => {
      expect(noNewFuncRule).toBeDefined()
      expect(noNewFuncRule.meta.type).toBe('problem')
    })
  })
})
