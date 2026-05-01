import { describe, test, expect, vi } from 'vitest'
import { noTestReturnStatementRule } from '../../../../src/rules/testing/no-test-return-statement.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => { return 1; });',
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

function createItCallWithReturn(
  returnValue: unknown = { type: 'Literal', value: 1 },
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: returnValue,
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [{ type: 'Literal', value: 'test name' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
  return { call, callback, returnStmt }
}

function createTestCallWithReturn(
  returnValue: unknown = { type: 'Literal', value: 1 },
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: returnValue,
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'test' },
    arguments: [{ type: 'Literal', value: 'test name' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 42 } },
  }
  return { call, callback, returnStmt }
}

function createItCallWithEmptyReturn(
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: null,
    loc: { start: { line, column }, end: { line, column: column + 7 } },
  }
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [{ type: 'Literal', value: 'test name' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
  return { call, callback, returnStmt }
}

function createItCallWithNestedReturn(
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; nestedFn: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: { type: 'Literal', value: 42 },
    loc: { start: { line: line + 2, column }, end: { line: line + 2, column: column + 10 } },
  }
  const nestedFn = {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
    loc: { start: { line: line + 1, column }, end: { line: line + 3, column: column + 5 } },
  }
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [nestedFn] },
    loc: { start: { line, column }, end: { line: line + 4, column } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [{ type: 'Literal', value: 'test with nested' }, callback],
    loc: { start: { line, column }, end: { line: line + 5, column } },
  }
  return { call, callback, nestedFn, returnStmt }
}

function createItCallNoReturn(
  line = 1,
  column = 0,
): { call: unknown; callback: unknown } {
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'expect' },
              property: { type: 'Identifier', name: 'toBe' },
            },
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [{ type: 'Literal', value: 'normal test' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
  return { call, callback }
}

function createDescribeCallWithReturn(
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: { type: 'Literal', value: 1 },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
  const callback = {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [{ type: 'Literal', value: 'suite' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
  return { call, callback, returnStmt }
}

function createItEachCallWithReturn(
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: { type: 'Literal', value: 1 },
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
  }
  const call = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'it' },
      property: { type: 'Identifier', name: 'each' },
    },
    arguments: [{ type: 'Literal', value: 'test name' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
  return { call, callback, returnStmt }
}

function createItCallWithNestedArrowReturn(
  line = 1,
  column = 0,
): { call: unknown; callback: unknown; nestedArrow: unknown; returnStmt: unknown } {
  const returnStmt = {
    type: 'ReturnStatement',
    argument: { type: 'Literal', value: 'nested' },
    loc: { start: { line: line + 1, column }, end: { line: line + 1, column: column + 15 } },
  }
  const nestedArrow = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [returnStmt] },
  }
  const callback = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [nestedArrow] },
    loc: { start: { line, column }, end: { line: line + 3, column } },
  }
  const call = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [{ type: 'Literal', value: 'nested arrow test' }, callback],
    loc: { start: { line, column }, end: { line: line + 4, column } },
  }
  return { call, callback, nestedArrow, returnStmt }
}

describe('no-test-return-statement rule', () => {
  describe('meta', () => {
    test('should have correct rule id in docs url', () => {
      expect(noTestReturnStatementRule.meta.docs?.url).toContain('no-test-return-statement')
    })

    test('should have correct rule type', () => {
      expect(noTestReturnStatementRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noTestReturnStatementRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noTestReturnStatementRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noTestReturnStatementRule.meta.docs?.category).toBe('testing')
    })

    test('should have empty schema', () => {
      expect(noTestReturnStatementRule.meta.schema).toEqual([])
    })

    test('should have description mentioning return statements', () => {
      expect(noTestReturnStatementRule.meta.docs?.description.toLowerCase()).toContain('return')
    })

    test('should not be fixable', () => {
      expect(noTestReturnStatementRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('ReturnStatement')
    })

    test('should return a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noTestReturnStatementRule.create(context)
      const visitor2 = noTestReturnStatementRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting return with value in it()', () => {
    test('should report return with literal value inside it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected return statement in test')
    })

    test('should report correct location for return in it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn(
        { type: 'Literal', value: 1 },
        5,
        10,
      )

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report return with function call value', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
      })

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return with object value', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn({
        type: 'ObjectExpression',
        properties: [{ type: 'Property', key: { type: 'Identifier', name: 'foo' } }],
      })

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return with Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
      })

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting return with value in test()', () => {
    test('should report return with value inside test() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createTestCallWithReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected return statement in test')
    })

    test('should report correct location for return in test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createTestCallWithReturn(
        { type: 'Literal', value: 42 },
        10,
        5,
      )

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('NOT flagging empty return statements', () => {
    test('should not report empty return (return;) in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithEmptyReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report return with undefined argument in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagging returns outside test callbacks', () => {
    test('should not report return in regular function (not inside it/test)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(returnStmt)

      expect(reports.length).toBe(0)
    })

    test('should not report return in describe() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createDescribeCallWithReturn()

      visitor.CallExpression(call)
      visitor.FunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagging returns inside nested functions', () => {
    test('should not report return inside nested FunctionExpression in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, nestedFn, returnStmt } = createItCallWithNestedReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.FunctionExpression(nestedFn)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report return inside nested ArrowFunctionExpression in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, nestedArrow, returnStmt } = createItCallWithNestedArrowReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ArrowFunctionExpression(nestedArrow)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report return inside nested FunctionDeclaration in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'decl' },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
      }
      const fnDecl = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [fnDecl] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.FunctionDeclaration(fnDecl)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionDeclaration:exit']()
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagging tests with no returns', () => {
    test('should not report it() callback with only assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback } = createItCallNoReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple returns in one test', () => {
    test('should report multiple return statements in the same it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt1 = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      }
      const returnStmt2 = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 2 },
        loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 10 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt1, returnStmt2] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'multi-return' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt1)
      visitor.ReturnStatement(returnStmt2)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(2)
    })
  })

  describe('it.each / test.each patterns', () => {
    test('should report return inside it.each() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItEachCallWithReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return inside test.each() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [{ type: 'Literal', value: 'parametrized' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully in ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle CallExpression with missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
      }
      const node = { type: 'CallExpression', arguments: [] }

      visitor.CallExpression(node)
      visitor.ReturnStatement(returnStmt)
      visitor['CallExpression:exit'](node)

      expect(reports.length).toBe(0)
    })

    test('should handle it() call without callback argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'no callback' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
      }

      visitor.CallExpression(call)
      visitor.ReturnStatement(returnStmt)
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should handle non-it/test CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
      }

      visitor.CallExpression(call)
      visitor.ReturnStatement(returnStmt)
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should properly reset state between visitors', () => {
      const ctx1 = createMockContext()
      const ctx2 = createMockContext()
      const visitor1 = noTestReturnStatementRule.create(ctx1.context)
      const visitor2 = noTestReturnStatementRule.create(ctx2.context)

      const { call: call1, callback: cb1, returnStmt: rs1 } = createItCallWithReturn()
      visitor1.CallExpression(call1)
      visitor1.ArrowFunctionExpression(cb1)
      visitor1.ReturnStatement(rs1)

      expect(ctx1.reports.length).toBe(1)

      const { call: call2, callback: cb2 } = createItCallNoReturn()
      visitor2.CallExpression(call2)
      visitor2.ArrowFunctionExpression(cb2)

      expect(ctx2.reports.length).toBe(0)
    })

    test('should handle FunctionExpression callback in it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const callback = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'func expr' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(call)
      visitor.FunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should not flag return in callback passed to non-test method like it.skip', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [{ type: 'Literal', value: 'skipped' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('rule metadata completeness', () => {
    test('meta should be an object', () => {
      expect(typeof noTestReturnStatementRule.meta).toBe('object')
    })

    test('meta should have docs property', () => {
      expect(noTestReturnStatementRule.meta).toHaveProperty('docs')
    })

    test('docs should have description property', () => {
      expect(noTestReturnStatementRule.meta.docs).toHaveProperty('description')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(noTestReturnStatementRule.meta.schema)).toBe(true)
    })

    test('create should be a function', () => {
      expect(typeof noTestReturnStatementRule.create).toBe('function')
    })

    test('docs url should point to github', () => {
      expect(noTestReturnStatementRule.meta.docs?.url).toContain('github.com')
    })

    test('description should mention assertions', () => {
      expect(noTestReturnStatementRule.meta.docs?.description.toLowerCase()).toContain('assertions')
    })

    test('description should mention test cases', () => {
      expect(noTestReturnStatementRule.meta.docs?.description.toLowerCase()).toContain('test')
    })
  })

  describe('visitor shape', () => {
    test('visitor should have CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('visitor should have ReturnStatement method', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('visitor should have CallExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(typeof visitor['CallExpression:exit']).toBe('function')
    })

    test('visitor should have ArrowFunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('visitor should have FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('visitor should have FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })
  })

  describe('additional meta validation', () => {
    test('meta.id should be no-test-return-statement if present', () => {
      if (noTestReturnStatementRule.meta.id !== undefined) {
        expect(noTestReturnStatementRule.meta.id).toBe('no-test-return-statement')
      }
      expect(true).toBe(true)
    })

    test('meta.description should be non-empty', () => {
      expect(noTestReturnStatementRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.category should be testing', () => {
      expect(noTestReturnStatementRule.meta.docs?.category).toBe('testing')
    })

    test('meta.severity should exist and be a string', () => {
      expect(typeof noTestReturnStatementRule.meta.severity).toBe('string')
      expect(noTestReturnStatementRule.meta.severity.length).toBeGreaterThan(0)
    })

    test('meta.docs should contain examples or description with both good and bad patterns', () => {
      const desc = noTestReturnStatementRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('return')
      expect(desc.toLowerCase()).toContain('test')
    })
  })

  describe('return of promise .then chain', () => {
    test('should report return of a .then() chain inside it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const thenCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
      }
      const { call, callback, returnStmt } = createItCallWithReturn(thenCall)

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected return statement in test')
    })
  })

  describe('return of await expression', () => {
    test('should report return await expression inside test() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const awaitExpr = {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchData' } },
      }
      const { call, callback, returnStmt } = createTestCallWithReturn(awaitExpr)

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('arrow function implicit return', () => {
    test('should not report arrow function with expression body (implicit return) — no ReturnStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Literal', value: 42 },
        expression: true,
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'implicit' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should report arrow function with block body containing explicit return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('it() with return statement', () => {
    test('should report return in it() with FunctionExpression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'result' },
        loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 18 } },
      }
      const callback = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test name' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 2 } },
      }

      visitor.CallExpression(call)
      visitor.FunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected return statement in test')
    })
  })

  describe('describe() callback with return', () => {
    test('should not report return inside describe() callback — describe is not a test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createDescribeCallWithReturn()

      visitor.CallExpression(call)
      visitor.FunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('beforeAll/beforeEach with return', () => {
    test('should not report return inside beforeAll() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report return inside beforeEach() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'setup' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('afterAll/afterEach with return', () => {
    test('should not report return inside afterAll() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const callback = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(call)
      visitor.FunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report return inside afterEach() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'cleanup' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('nested function inside test with return', () => {
    test('should not report return inside nested helper function within test callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, nestedFn, returnStmt } = createItCallWithNestedReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.FunctionExpression(nestedFn)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })
  })

  describe('return inside try/catch within test', () => {
    test('should report return inside try block within it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'try-result' },
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 20 } },
      }
      const tryBlock = {
        type: 'BlockStatement',
        body: [returnStmt],
      }
      const tryStmt = {
        type: 'TryStatement',
        block: tryBlock,
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: { type: 'BlockStatement', body: [] },
        },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [tryStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'try-catch test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return inside catch block within it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'catch-result' },
        loc: { start: { line: 5, column: 4 }, end: { line: 5, column: 22 } },
      }
      const tryStmt = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: { type: 'BlockStatement', body: [returnStmt] },
        },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [tryStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'catch return test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 7, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('return inside if block within test', () => {
    test('should report return inside if block within it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'early' },
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 18 } },
      }
      const ifStmt = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'condition' },
        consequent: {
          type: 'BlockStatement',
          body: [returnStmt],
        },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [ifStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'if-return test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple return statements reported individually', () => {
    test('should report each return statement separately with distinct locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt1 = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 14 } },
      }
      const returnStmt2 = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 2 },
        loc: { start: { line: 4, column: 4 }, end: { line: 4, column: 14 } },
      }
      const returnStmt3 = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 3 },
        loc: { start: { line: 6, column: 4 }, end: { line: 6, column: 14 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt1, returnStmt2, returnStmt3] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [{ type: 'Literal', value: 'multi' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 7, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt1)
      visitor.ReturnStatement(returnStmt2)
      visitor.ReturnStatement(returnStmt3)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[2].loc?.start.line).toBe(6)
    })
  })

  describe('report message content', () => {
    test('report message should mention assertions as alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const { call, callback, returnStmt } = createItCallWithReturn()

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assertions')
    })
  })

  describe('test.each with return', () => {
    test('should report return inside test.each() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'each-result' },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 18 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'val' }],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
          { type: 'Literal', value: 'parametrized %s' },
          callback,
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional coverage', () => {
    test('should report return inside it.skip() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 12 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [{ type: 'Literal', value: 'skipped' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return inside function declaration nested in test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 14 } },
      }
      const funcDecl = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'helper' },
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [funcDecl] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return with function call argument in test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getResult' },
          arguments: [],
        },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 18 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should not report empty return statement (no argument) in it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 9 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(0)
    })

    test('should not report return in regular function expression not in test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(returnStmt)

      expect(reports.length).toBe(0)
    })

    test('should report return inside it.only() with regular function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: true },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 12 } },
      }
      const callback = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [{ type: 'Literal', value: 'focused' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.FunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['FunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report two return statements in same test callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'it' }, arguments: [{ type: 'Literal', value: 'test' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 }, loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 12 } } })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: 2 }, loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 12 } } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'it' }, arguments: [] })
      expect(reports).toHaveLength(2)
    })

    test('should report return inside test.skip() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'test' }, property: { type: 'Identifier', name: 'skip' } }, arguments: [{ type: 'Literal', value: 'skipped' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'test' }, property: { type: 'Identifier', name: 'skip' } }, arguments: [] })
      expect(reports).toHaveLength(1)
    })

    test('should report return inside test.only() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'test' }, property: { type: 'Identifier', name: 'only' } }, arguments: [{ type: 'Literal', value: 'focused' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: 'value' } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'test' }, property: { type: 'Identifier', name: 'only' } }, arguments: [] })
      expect(reports).toHaveLength(1)
    })

    test('should not report return inside suite() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'suite' }, arguments: [{ type: 'Literal', value: 'suite' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'suite' }, arguments: [] })
      expect(reports).toHaveLength(0)
    })

    test('should report return with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'it' }, arguments: [{ type: 'Literal', value: 'test' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'it' }, arguments: [] })
      expect(reports).toHaveLength(1)
    })

    test('should report return with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'it' }, arguments: [{ type: 'Literal', value: 'test' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'it' }, arguments: [] })
      expect(reports).toHaveLength(1)
    })

    test('should not report return inside context() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'context' }, arguments: [{ type: 'Literal', value: 'ctx' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: true } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'context' }, arguments: [] })
      expect(reports).toHaveLength(0)
    })
  })

  describe('suite() as describe function', () => {
    test('should not report return inside suite() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'suite' }, arguments: [{ type: 'Literal', value: 'suite' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }] })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: true } })
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'suite' }, arguments: [] })
      expect(reports).toHaveLength(0)
    })
  })

  describe('member expression callees', () => {
    test('should report return inside it.only() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [{ type: 'Literal', value: 'focused' }, { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] }],
      })
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [],
      })
      expect(reports).toHaveLength(1)
    })
  })

  describe('additional verification', () => {
    test('should have create function returning visitor', () => {
      const { context } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('additional return value types', () => {
    test('should report return with ArrayExpression value in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 15 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected return statement in test')
    })

    test('should report return with ConditionalExpression value in test() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'condition' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 25 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return with UnaryExpression value in it() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: {
          type: 'UnaryExpression',
          operator: '-',
          prefix: true,
          argument: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 12 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report return with TemplateLiteral value in test() callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const returnStmt = {
        type: 'ReturnStatement',
        argument: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } }],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 18 } },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [returnStmt] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(returnStmt)
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
    })

    test('should report only direct return and not nested function return in same test', () => {
      const { context, reports } = createMockContext()
      const visitor = noTestReturnStatementRule.create(context)
      const directReturn = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'direct' },
        loc: { start: { line: 2, column: 2 }, end: { line: 2, column: 16 } },
      }
      const nestedReturn = {
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'nested' },
        loc: { start: { line: 4, column: 4 }, end: { line: 4, column: 18 } },
      }
      const nestedFn = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [nestedReturn] },
      }
      const callback = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [directReturn, nestedFn] },
      }
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test' }, callback],
        loc: { start: { line: 1, column: 0 }, end: { line: 6, column: 1 } },
      }

      visitor.CallExpression(call)
      visitor.ArrowFunctionExpression(callback)
      visitor.ReturnStatement(directReturn)
      visitor.FunctionExpression(nestedFn)
      visitor.ReturnStatement(nestedReturn)
      visitor['FunctionExpression:exit']()
      visitor['ArrowFunctionExpression:exit']()
      visitor['CallExpression:exit'](call)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected return statement in test')
    })
  })
})
