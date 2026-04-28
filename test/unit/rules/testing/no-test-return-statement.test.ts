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
})
