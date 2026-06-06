import { describe, test, expect, vi } from 'vitest'
import { preferEachRule } from '../../../../src/rules/testing/prefer-each.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'for (const x of items) { test("a", () => {}); }',
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

function createForOfWithTests(line = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'test' },
            arguments: [],
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createForInWithTests(line = 1, column = 0): unknown {
  return {
    type: 'ForInStatement',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'it' },
            arguments: [],
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createForWithTests(line = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'test' },
            arguments: [],
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createWhileWithTests(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: null,
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'it' },
            arguments: [],
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createForEachWithTests(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'forEach' },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [],
              },
            },
          ],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createForOfWithNonTests(line = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'console' },
            arguments: [],
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createForOfWithMixedContent(line = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'test' },
            arguments: [],
          },
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'console' },
            arguments: [],
          },
        },
      ],
    },
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

describe('prefer-each rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferEachRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferEachRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferEachRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferEachRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct description', () => {
      expect(preferEachRule.meta.docs?.description.toLowerCase()).toContain('test.each')
    })

    test('should have description mentioning it.each', () => {
      expect(preferEachRule.meta.docs?.description.toLowerCase()).toContain('it.each')
    })

    test('should have description mentioning loops', () => {
      expect(preferEachRule.meta.docs?.description.toLowerCase()).toContain('loop')
    })

    test('should have correct docs URL', () => {
      expect(preferEachRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/prefer-each')
    })

    test('should have empty schema', () => {
      expect(preferEachRule.meta.schema).toEqual([])
    })

    test('meta should be an object', () => {
      expect(typeof preferEachRule.meta).toBe('object')
    })

    test('meta should have docs property', () => {
      expect(preferEachRule.meta).toHaveProperty('docs')
    })

    test('docs should have category property', () => {
      expect(preferEachRule.meta.docs).toHaveProperty('category')
    })

    test('docs should have url property', () => {
      expect(preferEachRule.meta.docs).toHaveProperty('url')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(preferEachRule.meta.schema)).toBe(true)
    })

    test('schema should have length 0', () => {
      expect(preferEachRule.meta.schema).toHaveLength(0)
    })

    test('create should be a function', () => {
      expect(typeof preferEachRule.create).toBe('function')
    })
  })

  describe('create', () => {
    test('should return visitor object with loop handlers', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('ForInStatement')
      expect(visitor).toHaveProperty('ForOfStatement')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferEachRule.create(context)
      const visitor2 = preferEachRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('all visitor methods should be functions', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)
      expect(typeof visitor.ForStatement).toBe('function')
      expect(typeof visitor.ForInStatement).toBe('function')
      expect(typeof visitor.ForOfStatement).toBe('function')
      expect(typeof visitor.WhileStatement).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting for-of loops with test calls', () => {
    test('should report for-of loop containing only test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests())

      expect(reports.length).toBe(1)
    })

    test('should report for-of loop containing only it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'it' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location for for-of', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report for-of with multiple test calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [],
              },
            },
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting for-in loops with test calls', () => {
    test('should report for-in loop containing only it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForInStatement(createForInWithTests())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for for-in', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForInStatement(createForInWithTests(8, 4))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report for-in with test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForInStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForInStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting for loops with test calls', () => {
    test('should report for loop containing only test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForStatement(createForWithTests())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForStatement(createForWithTests(12, 2))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report for loop with it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'it' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting while loops with test calls', () => {
    test('should report while loop containing only it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.WhileStatement(createWhileWithTests())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.WhileStatement(createWhileWithTests(3, 6))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report while loop with test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting forEach with test calls', () => {
    test('should report forEach with arrow callback containing only test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.CallExpression(createForEachWithTests())

      expect(reports.length).toBe(1)
    })

    test('should report correct location for forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.CallExpression(createForEachWithTests(7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report forEach with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'it' },
                    arguments: [],
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

    test('should report forEach with it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'it' },
                    arguments: [],
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
  })

  describe('valid cases - loops with non-test content', () => {
    test('should not report for-of loop with console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithNonTests())

      expect(reports.length).toBe(0)
    })

    test('should not report for-of loop with mixed content', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithMixedContent())

      expect(reports.length).toBe(0)
    })

    test('should not report for loop with non-test calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'console' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report while loop with non-test calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'processData' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report forEach with non-test callback', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'console' },
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

    test('should not report forEach with mixed callback content', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
                    arguments: [],
                  },
                },
                {
                  type: 'VariableDeclaration',
                  declarations: [],
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

    test('should not report regular function call that is not forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'map' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
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
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for ForStatement', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for ForStatement', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
    })

    test('should handle null node gracefully for ForOfStatement', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.ForOfStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully for ForInStatement', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.ForInStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully for WhileStatement', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferEachRule.create(context)

      expect(() => visitor.ForOfStatement('string')).not.toThrow()
      expect(() => visitor.ForStatement(123)).not.toThrow()
      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle loop with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loop without body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loop with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForStatement',
        body: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle forEach with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle forEach with non-function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [{ type: 'Literal', value: 'string' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
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

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [],
              },
            },
          ],
        },
      }

      expect(() => visitor.ForOfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('report format', () => {
    test('should include test.each in report message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests())

      expect(reports[0].message).toContain('test.each')
    })

    test('should include it.each in report message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests())

      expect(reports[0].message).toContain('it.each')
    })

    test('should include location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests())

      expect(reports[0].loc).toBeDefined()
    })

    test('should report consistent message across loop types', () => {
      const MESSAGE = 'Prefer test.each() or it.each() over loop-based tests for better test reporting'

      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const { context: ctx3, reports: rep3 } = createMockContext()
      const { context: ctx4, reports: rep4 } = createMockContext()

      preferEachRule.create(ctx1).ForOfStatement(createForOfWithTests())
      preferEachRule.create(ctx2).ForInStatement(createForInWithTests())
      preferEachRule.create(ctx3).ForStatement(createForWithTests())
      preferEachRule.create(ctx4).WhileStatement(createWhileWithTests())

      expect(rep1[0].message).toBe(MESSAGE)
      expect(rep2[0].message).toBe(MESSAGE)
      expect(rep3[0].message).toBe(MESSAGE)
      expect(rep4[0].message).toBe(MESSAGE)
    })
  })

  describe('state isolation', () => {
    test('should not share reports between separate visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      preferEachRule.create(ctx1).ForOfStatement(createForOfWithTests())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('should accumulate reports within a single visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests(1, 0))
      visitor.ForInStatement(createForInWithTests(2, 0))
      visitor.ForStatement(createForWithTests(3, 0))
      visitor.WhileStatement(createWhileWithTests(4, 0))

      expect(reports.length).toBe(4)
    })

    test('should handle multiple forEach calls in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.CallExpression(createForEachWithTests(1, 0))
      visitor.CallExpression(createForEachWithTests(5, 0))

      expect(reports.length).toBe(2)
    })
  })

  describe('nested loops', () => {
    test('should report outer loop containing only test calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement(createForOfWithTests())

      expect(reports.length).toBe(1)
    })

    test('should not report loop with nested non-test loop', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForStatement',
              init: null,
              test: null,
              update: null,
              body: {
                type: 'BlockStatement',
                body: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.skip and test.only member expressions', () => {
    test('should report loop with test.skip() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'test' },
                  property: { type: 'Identifier', name: 'skip' },
                },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report loop with it.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'it' },
                  property: { type: 'Identifier', name: 'only' },
                },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report loop with describe() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'describe' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report loop with expect() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('single statement body (no block)', () => {
    test('should report for-of with single test call body (no braces)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'test' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report while with single it call body (no braces)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: null,
        body: {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'it' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report for-of with single non-test call body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
        body: {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'processData' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ForOfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('forEach edge cases', () => {
    test('should report forEach with arrow function returning test call (expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'test' },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report forEach called on array (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'items' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
                    arguments: [],
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
  })

  describe('additional coverage', () => {
    test('should report for loop at line 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.ForStatement(createForWithTests(0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should report while loop with multiple it() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'it' },
                arguments: [],
              },
            },
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'it' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.WhileStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should not report loop with variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForOfStatement',
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should report forEach with multiple test calls in callback', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
                    arguments: [],
                  },
                },
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
                    arguments: [],
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

    test('should not report for loop with if statement body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: {
          type: 'IfStatement',
          test: null,
          consequent: null,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle forEach with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'items' }, property: { type: 'Identifier', name: 'forEach' } },
        arguments: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage', () => {
    test('should report for loop at custom line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        body: { type: 'BlockStatement', body: [
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'test' }, arguments: [{ type: 'Literal', value: 'a' }] } },
        ] },
        loc: { start: { line: 15, column: 4 }, end: { line: 15, column: 40 } },
      })
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should not report while loop with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.WhileStatement({
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should report for-in with it.only() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.ForInStatement({
        type: 'ForInStatement',
        body: { type: 'BlockStatement', body: [
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'it' }, property: { type: 'Identifier', name: 'only' } }, arguments: [{ type: 'Literal', value: 'a' }] } },
        ] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('should not report forEach with vi.fn() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'items' }, property: { type: 'Identifier', name: 'forEach' } },
        arguments: [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'jest' }, property: { type: 'Identifier', name: 'fn' } }, arguments: [] } },
        ] } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should not report for-of with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.ForOfStatement({
        type: 'ForOfStatement',
        body: { type: 'BlockStatement', body: [
          { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
        ] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('should report while loop with test.skip() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.WhileStatement({
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'test' }, property: { type: 'Identifier', name: 'skip' } }, arguments: [{ type: 'Literal', value: 'a' }] } },
        ] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('should not report for loop with try/catch', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        body: { type: 'BlockStatement', body: [
          { type: 'TryStatement', block: { type: 'BlockStatement', body: [] }, handler: null },
        ] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })
  })

  describe('additional meta checks', () => {
    test('should have valid docs URL containing rule name', () => {
      const url = preferEachRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('prefer-each')
    })

    test('should have create as a function', () => {
      expect(typeof preferEachRule.create).toBe('function')
    })
  })

  describe('callback type variations', () => {
    test('should report forEach with FunctionExpression callback containing test calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'item' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
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
      expect(reports).toHaveLength(1)
    })

    test('should not report forEach with FunctionExpression containing mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'item' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'test' },
                    arguments: [],
                  },
                },
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'console.log' },
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
      expect(reports).toHaveLength(0)
    })
  })

  describe('mixed test function types', () => {
    test('should report for-of with mixed it() and test() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForOfStatement({
        type: 'ForOfStatement',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'it' },
                arguments: [{ type: 'Literal', value: 'a' }],
              },
            },
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'test' },
                arguments: [{ type: 'Literal', value: 'b' }],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('null and edge case bodies', () => {
    test('should not report ForStatement with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: null,
      })

      expect(reports).toHaveLength(0)
    })

    test('should report for-in with single statement body (no block braces)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferEachRule.create(context)

      visitor.ForInStatement({
        type: 'ForInStatement',
        body: {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'it' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports).toHaveLength(1)
    })
  })
})
