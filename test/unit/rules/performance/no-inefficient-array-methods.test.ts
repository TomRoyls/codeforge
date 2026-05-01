import { describe, test, expect, vi } from 'vitest'
import {
  noInefficientArrayMethodsRule,
  default as defaultExport,
} from '../../../../src/rules/performance/no-inefficient-array-methods.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'arr.forEach(x => { result.push(x); });',
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

  return { context, reports }
}

function createForEachPushNode(
  pushArg: unknown = { type: 'Identifier', name: 'x' },
  callbackType: 'ArrowFunctionExpression' | 'FunctionExpression' = 'ArrowFunctionExpression',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Identifier', name: 'forEach' },
    },
    arguments: [
      {
        type: callbackType,
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'result' },
                  property: { type: 'Identifier', name: 'push' },
                },
                arguments: [pushArg],
              },
            },
          ],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createFilterNegationNode(
  argument: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Identifier', name: 'filter' },
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument,
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createSpliceIndexOfNode(
  indexOfObject: unknown = { type: 'Identifier', name: 'arr' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Identifier', name: 'splice' },
    },
    arguments: [
      {
        type: 'MemberExpression',
        object: indexOfObject,
        property: { type: 'Identifier', name: 'indexOf' },
      },
      { type: 'Literal', value: 1 },
    ],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

describe('no-inefficient-array-methods rule', () => {
  describe('meta', () => {
    test('should have category performance', () => {
      expect(noInefficientArrayMethodsRule.meta.docs?.category).toBe('performance')
    })

    test('should have severity warn', () => {
      expect(noInefficientArrayMethodsRule.meta.severity).toBe('warn')
    })

    test('should have type suggestion', () => {
      expect(noInefficientArrayMethodsRule.meta.type).toBe('suggestion')
    })

    test('should have description mentioning inefficient', () => {
      expect(
        noInefficientArrayMethodsRule.meta.docs?.description.toLowerCase(),
      ).toContain('inefficient')
    })

    test('should have description mentioning array', () => {
      expect(
        noInefficientArrayMethodsRule.meta.docs?.description.toLowerCase(),
      ).toContain('array')
    })

    test('should have correct docs URL', () => {
      expect(noInefficientArrayMethodsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-inefficient-array-methods',
      )
    })

    test('should have empty schema', () => {
      expect(noInefficientArrayMethodsRule.meta.schema).toEqual([])
    })

    test('should not be recommended', () => {
      expect(noInefficientArrayMethodsRule.meta.docs?.recommended).toBe(false)
    })
  })

  describe('structure', () => {
    test('create() returns visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export equals named export', () => {
      expect(defaultExport).toBe(noInefficientArrayMethodsRule)
    })
  })

  describe('forEach+push positive cases', () => {
    test('reports forEach with arrow function pushing identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode({ type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports forEach with FunctionExpression callback pushing identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode(
          { type: 'Identifier', name: 'item' },
          'FunctionExpression',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports forEach+push with MemberExpression push argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'value' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports forEach+push with CallExpression push argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('forEach+push message mentions forEach and map', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createForEachPushNode())
      expect(reports[0].message).toContain('forEach')
      expect(reports[0].message).toContain('map')
    })

    test('forEach+push report includes location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createForEachPushNode(undefined, undefined, 5, 10))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('forEach+push reports at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createForEachPushNode())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('forEach+push with arrow callback having multiple params reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node = createForEachPushNode()
      const args = (node as Record<string, unknown>).arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      callback.params = [
        { type: 'Identifier', name: 'x' },
        { type: 'Identifier', name: 'i' },
      ]
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('forEach+push with nested member callee on push (obj.result.push)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: {
                        type: 'MemberExpression',
                        object: { type: 'Identifier', name: 'self' },
                        property: { type: 'Identifier', name: 'result' },
                      },
                      property: { type: 'Identifier', name: 'push' },
                    },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('forEach+push with push having multiple arguments reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'result' },
                      property: { type: 'Identifier', name: 'push' },
                    },
                    arguments: [
                      { type: 'Identifier', name: 'x' },
                      { type: 'Identifier', name: 'y' },
                    ],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('forEach+push with different outer object name reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'items' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'item' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'output' },
                      property: { type: 'Identifier', name: 'push' },
                    },
                    arguments: [{ type: 'Identifier', name: 'item' }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('forEach+push with ObjectExpression push argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode({
          type: 'ObjectExpression',
          properties: [],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('forEach+push with ArrayExpression push argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode({
          type: 'ArrayExpression',
          elements: [],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('forEach+push with ConditionalExpression push argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createForEachPushNode({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('forEach+push with FunctionExpression named callback reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node = createForEachPushNode(
        { type: 'Identifier', name: 'el' },
        'FunctionExpression',
      )
      const args = (node as Record<string, unknown>).arguments as Record<string, unknown>[]
      const callback = args[0] as Record<string, unknown>
      callback.id = { type: 'Identifier', name: 'handler' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('forEach+push negative cases', () => {
    test('forEach without push (console.log) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'console' },
                      property: { type: 'Identifier', name: 'log' },
                    },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with multiple statements does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'result' },
                      property: { type: 'Identifier', name: 'push' },
                    },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                },
                {
                  type: 'ExpressionStatement',
                  expression: { type: 'Identifier', name: 'extra' },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with non-push call (pop) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'result' },
                      property: { type: 'Identifier', name: 'pop' },
                    },
                    arguments: [],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('map instead of forEach with push does not trigger forEach rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'result' },
                      property: { type: 'Identifier', name: 'push' },
                    },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with arrow implicit return (not BlockStatement) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'result' },
                property: { type: 'Identifier', name: 'push' },
              },
              arguments: [{ type: 'Identifier', name: 'x' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with empty arguments does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with no arguments property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach callback body with non-ExpressionStatement does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'VariableDeclaration',
                  declarations: [],
                  kind: 'const',
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach with non-function callback (Identifier) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [{ type: 'Identifier', name: 'callback' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach callback with empty block body does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('filter+negation positive cases', () => {
    test('reports filter with arrow returning !x', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createFilterNegationNode({ type: 'Identifier', name: 'x' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports filter with arrow returning !obj.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createFilterNegationNode({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports filter with arrow returning !getValue()', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createFilterNegationNode({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('filter+negation message mentions filter and negated', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createFilterNegationNode())
      expect(reports[0].message).toContain('filter')
      expect(reports[0].message).toContain('negated')
    })

    test('filter+negation report includes location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createFilterNegationNode(undefined, 7, 3))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('filter+negation at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createFilterNegationNode())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports filter with arrow returning !flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createFilterNegationNode({ type: 'Identifier', name: 'flag' }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports filter with double negation !!x', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createFilterNegationNode({
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: { type: 'Identifier', name: 'x' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('filter+negation reports only once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createFilterNegationNode())
      expect(reports.length).toBe(1)
    })

    test('reports filter with UnaryExpression having prefix true', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'UnaryExpression',
              operator: '!',
              prefix: true,
              argument: { type: 'Identifier', name: 'active' },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('filter+negation negative cases', () => {
    test('filter with positive callback (returning x) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'Identifier', name: 'x' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with truthy literal callback does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'Literal', value: true },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('map with negation callback does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'UnaryExpression',
              operator: '!',
              prefix: true,
              argument: { type: 'Identifier', name: 'x' },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with BlockStatement body does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'UnaryExpression',
                    operator: '!',
                    prefix: true,
                    argument: { type: 'Identifier', name: 'x' },
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with empty arguments does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with no arguments property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with non-function callback does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [{ type: 'Identifier', name: 'predicate' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with BinaryExpression body does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BinaryExpression',
              operator: '>',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Literal', value: 0 },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('splice+indexOf positive cases', () => {
    test('reports basic splice(arr.indexOf(x), 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode())
      expect(reports.length).toBe(1)
    })

    test('reports splice with member expression indexOf object', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createSpliceIndexOfNode({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'items' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('splice+indexOf message mentions splice and filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode())
      expect(reports[0].message).toContain('splice')
      expect(reports[0].message).toContain('filter')
    })

    test('splice+indexOf report includes location info', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode(undefined, 10, 5))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('splice+indexOf at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode())
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('splice with identifier indexOf object reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createSpliceIndexOfNode({ type: 'Identifier', name: 'data' }),
      )
      expect(reports.length).toBe(1)
    })

    test('splice with nested member callee (obj.arr.splice) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'arr' },
          },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          { type: 'Literal', value: 1 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('splice+indexOf reports only once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode())
      expect(reports.length).toBe(1)
    })

    test('splice+indexOf message mentions with', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode())
      expect(reports[0].message).toContain('with')
    })

    test('splice+indexOf with different property object names reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(
        createSpliceIndexOfNode({ type: 'Identifier', name: 'list' }),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('splice+indexOf negative cases', () => {
    test('splice with count 2 instead of 1 does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          { type: 'Literal', value: 2 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice without indexOf (literal first arg) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          { type: 'Literal', value: 0 },
          { type: 'Literal', value: 1 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with 3 arguments does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 99 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with 1 argument does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with non-MemberExpression first arg does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          { type: 'Identifier', name: 'index' },
          { type: 'Literal', value: 1 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with indexOf but second arg not Literal does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          { type: 'Identifier', name: 'one' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with MemberExpression but property not indexOf does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'lastIndexOf' },
          },
          { type: 'Literal', value: 1 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with 0 arguments does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('null node does not throw', () => {
      const { context } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('undefined node does not throw', () => {
      const { context } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('string node does not throw or report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('number node does not throw or report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('empty object node does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('node without callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('non-MemberExpression callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('non-Identifier callee property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('node without loc uses default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createForEachPushNode())
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report includes the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node = createForEachPushNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  describe('additional coverage', () => {
    test('separate visitors have isolated state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInefficientArrayMethodsRule.create(ctx1)
      const visitor2 = noInefficientArrayMethodsRule.create(ctx2)

      visitor1.CallExpression(createForEachPushNode())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)

      visitor.CallExpression(createForEachPushNode())
      visitor.CallExpression(createFilterNegationNode())
      visitor.CallExpression(createSpliceIndexOfNode())

      expect(reports.length).toBe(3)
    })

    test('forEach+push with non-MemberExpression inner callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'push' },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with UnaryExpression operator typeof does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'UnaryExpression',
              operator: 'typeof',
              prefix: true,
              argument: { type: 'Identifier', name: 'x' },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter with UnaryExpression operator minus does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'UnaryExpression',
              operator: '-',
              prefix: true,
              argument: { type: 'Identifier', name: 'x' },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('splice with 4 arguments does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach+push correctly ignores non-push Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'processItem' },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach+push with non-CallExpression expression in body does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: { type: 'Identifier', name: 'x' },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('filter+negation with LogicalExpression body does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'LogicalExpression',
              operator: '&&',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'y' },
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('forEach+push message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createForEachPushNode())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('filter+negation message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createFilterNegationNode())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('splice+indexOf message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      visitor.CallExpression(createSpliceIndexOfNode())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noInefficientArrayMethodsRule.create(context)
      const visitor2 = noInefficientArrayMethodsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('splice+indexOf with Literal value 0 does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInefficientArrayMethodsRule.create(context)
      const node: unknown = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          { type: 'Literal', value: 0 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
