import { describe, test, expect, vi } from 'vitest'
import { expectExpectRule } from '../../../../src/rules/testing/expect-expect.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = 'it("test", () => { expect(1).toBe(1); });',
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

function createItWithExpect(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'has expect' },
      {
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
                  object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Literal', value: 1 }] },
                  property: { type: 'Identifier', name: 'toBe' },
                },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createItWithoutExpect(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'no expect' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'console' },
                arguments: [{ type: 'Literal', value: 'just logging' }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTestWithExpect(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'test' },
    arguments: [
      { type: 'Literal', value: 'has expect' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Literal', value: true }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 42 },
    },
  }
}

function createTestWithoutExpect(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'test' },
    arguments: [
      { type: 'Literal', value: 'no expect' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createItWithAssert(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'has assert' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'assert' },
                arguments: [
                  { type: 'Literal', value: true },
                  { type: 'Literal', value: 'should be true' },
                ],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
    },
  }
}

function createItWithShould(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'has should' },
      {
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
                  object: { type: 'Identifier', name: 'should' },
                  property: { type: 'Identifier', name: 'equal' },
                },
                arguments: [{ type: 'Literal', value: 42 }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
    },
  }
}

function createDescribeWithTests(): unknown[] {
  const describeNode = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
  return [describeNode]
}

function createItWithFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'function expression' },
      {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createItAsyncWithExpect(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'async test' },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 45 },
    },
  }
}

function createItOnlyBody(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'only body' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Literal', value: 1 }],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createItMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'it' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'focused with expect' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            },
          ],
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 50 },
    },
  }
}

describe('expect-expect rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(expectExpectRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(expectExpectRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(expectExpectRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(expectExpectRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema with assertFunctionNames option', () => {
      const schema = expectExpectRule.meta.schema as readonly unknown[]
      expect(Array.isArray(schema)).toBe(true)
      expect(schema.length).toBe(1)
    })

    test('should have correct description mentioning assertions', () => {
      expect(expectExpectRule.meta.docs?.description.toLowerCase()).toContain('assertion')
    })

    test('should have correct docs URL', () => {
      expect(expectExpectRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/expect-expect',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = expectExpectRule.create(context)
      const visitor2 = expectExpectRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('passing tests (with assertions)', () => {
    test('should not report it() with expect call', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithExpect())
      expect(reports.length).toBe(0)
    })

    test('should not report test() with expect call', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createTestWithExpect())
      expect(reports.length).toBe(0)
    })

    test('should not report it() with FunctionExpression callback containing expect', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithFunctionExpression())
      expect(reports.length).toBe(0)
    })

    test('should not report async it() with expect call', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItAsyncWithExpect())
      expect(reports.length).toBe(0)
    })

    test('should not report it() with arrow function expression body returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItOnlyBody())
      expect(reports.length).toBe(0)
    })

    test('should not report it() with expect().toBe() chained', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'chained' },
          {
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
                      object: {
                        type: 'CallExpression',
                        callee: { type: 'Identifier', name: 'expect' },
                        arguments: [{ type: 'Literal', value: 1 }],
                      },
                      property: { type: 'Identifier', name: 'toBe' },
                    },
                    arguments: [{ type: 'Literal', value: 1 }],
                  },
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
  })

  describe('failing tests (no assertions)', () => {
    test('should report it() without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect())
      expect(reports.length).toBe(1)
    })

    test('should report test() without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createTestWithoutExpect())
      expect(reports.length).toBe(1)
    })

    test('should report it() with empty callback body', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'empty' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report correct location for failing test', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect(5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should include helpful message', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect())
      expect(reports[0].message).toContain('no assertions')
      expect(reports[0].message).toContain('it')
    })

    test('should report test() with function name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createTestWithoutExpect())
      expect(reports[0].message).toContain('test')
    })

    test('should report it() with only comments (no assertions)', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'comments only' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'someHelper' },
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
      expect(reports.length).toBe(1)
    })
  })

  describe('assert function detection', () => {
    test('should recognize expect() as assertion by default', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithExpect())
      expect(reports.length).toBe(0)
    })

    test('should recognize assert() with custom assertFunctionNames', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['assert'] })
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithAssert())
      expect(reports.length).toBe(0)
    })

    test('should not recognize expect() when assertFunctionNames only has assert', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['assert'] })
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithExpect())
      expect(reports.length).toBe(1)
    })

    test('should recognize should() with custom assertFunctionNames', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['should'] })
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithShould())
      expect(reports.length).toBe(0)
    })

    test('should support multiple custom assert function names', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['expect', 'assert', 'should'] })
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithExpect())
      visitor.CallExpression(createItWithAssert())
      visitor.CallExpression(createItWithShould())
      expect(reports.length).toBe(0)
    })

    test('should recognize expect in MemberExpression chain (expect().toBe())', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'chained expect' },
          {
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
                      object: {
                        type: 'CallExpression',
                        callee: { type: 'Identifier', name: 'expect' },
                        arguments: [{ type: 'Literal', value: 1 }],
                      },
                      property: { type: 'Identifier', name: 'toEqual' },
                    },
                    arguments: [{ type: 'Literal', value: 2 }],
                  },
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
  })

  describe('describe blocks', () => {
    test('should not report describe() blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const nodes = createDescribeWithTests()
      for (const node of nodes) {
        visitor.CallExpression(node)
      }
      expect(reports.length).toBe(0)
    })

    test('should handle nested describe with inner it having expect', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)

      const describeNode = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'outer' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(describeNode)
      const itNode = createItWithExpect()
      visitor.CallExpression(itNode)

      expect(reports.length).toBe(0)
    })

    test('should handle nested describe with inner it having no expect', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)

      const describeNode = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'describe' },
        arguments: [
          { type: 'Literal', value: 'outer' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(describeNode)
      const itNode = createItWithoutExpect()
      visitor.CallExpression(itNode)

      expect(reports.length).toBe(1)
    })

    test('should not require assertions in context() blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'context' },
        arguments: [
          { type: 'Literal', value: 'a context' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('it.only / test.only member expressions', () => {
    test('should check it.only tests for assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItMemberExpression())
      expect(reports.length).toBe(0)
    })

    test('should report it.only without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'focused no expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should check test.only with assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'focused with expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 1 }],
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

    test('should report test.only without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'focused no expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple expect calls', () => {
    test('should pass with multiple expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'multiple expects' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 1 }],
                  },
                },
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 2 }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report only once for a test without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect())
      expect(reports.length).toBe(1)
    })

    test('should report multiple independent tests without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect(1, 0))
      visitor.CallExpression(createTestWithoutExpect(2, 0))
      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = { type: 'CallExpression', arguments: [] }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'no loc' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle it() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle it() with only title, no callback', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'just title' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [{ type: 'Literal', value: 'log' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report non-test non-describe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myHelper' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested expect in callback', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'deep nested' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'someFunction' },
                    arguments: [
                      {
                        type: 'CallExpression',
                        callee: { type: 'Identifier', name: 'expect' },
                        arguments: [{ type: 'Literal', value: 1 }],
                      },
                    ],
                  },
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

    test('should handle it.each member expression as test function', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('custom assertFunctionNames option', () => {
    test('should use custom assert function name sinon.assert', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['sinon.assert'] })
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'sinon test' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'sinon.assert' },
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

    test('should report when custom function name not found', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: ['assert'] })
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect())
      expect(reports.length).toBe(1)
    })

    test('should default to expect when no option provided', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithExpect())
      expect(reports.length).toBe(0)
    })

    test('should handle empty assertFunctionNames array (no assertion passes)', () => {
      const { context, reports } = createMockContext({ assertFunctionNames: [] })
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithExpect())
      expect(reports.length).toBe(1)
    })
  })

  describe('rule metadata', () => {
    test('meta should be an object', () => {
      expect(typeof expectExpectRule.meta).toBe('object')
    })

    test('meta should have docs property', () => {
      expect(expectExpectRule.meta).toHaveProperty('docs')
    })

    test('docs should have recommended property set to true', () => {
      expect(expectExpectRule.meta.docs?.recommended).toBe(true)
    })

    test('docs should have category property', () => {
      expect(expectExpectRule.meta.docs).toHaveProperty('category')
    })

    test('docs should have url property', () => {
      expect(expectExpectRule.meta.docs).toHaveProperty('url')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(expectExpectRule.meta.schema)).toBe(true)
    })

    test('create should be a function', () => {
      expect(typeof expectExpectRule.create).toBe('function')
    })
  })

  describe('visitor shape', () => {
    test('visitor should have CallExpression key', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = expectExpectRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('callback variations', () => {
    test('should handle it() with arrow function returning expression', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'implicit return' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report it() with arrow function returning non-assertion expression', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'bad return' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'someFunction' },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle it() with callback at index 0 when no title', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 1 }],
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

  describe('isolation between visitors', () => {
    test('should isolate state between different visitor instances', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = expectExpectRule.create(ctx1)
      const visitor2 = expectExpectRule.create(ctx2)

      visitor1.CallExpression(createItWithoutExpect())

      visitor2.CallExpression(createItWithExpect())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('should not leak test tracking between visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const visitor1 = expectExpectRule.create(ctx1)
      const visitor2 = expectExpectRule.create(ctx2)

      visitor1.CallExpression(createItWithoutExpect())
      visitor2.CallExpression(createItWithoutExpect())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('error message content', () => {
    test('should include test function name "it" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect())
      expect(reports[0].message).toContain("'it'")
    })

    test('should include test function name "test" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createTestWithoutExpect())
      expect(reports[0].message).toContain("'test'")
    })

    test('should mention assertion in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithoutExpect())
      expect(reports[0].message).toContain('assertion')
    })
  })

  describe('lifecycle hooks', () => {
    test('should not report beforeEach() blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report afterEach() blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report beforeAll() blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report afterAll() blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('it.skip / test.skip member expressions', () => {
    test('should report it.skip without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'skipped no expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report it.skip with assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'skipped with expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 1 }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report test.skip without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'skipped no expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report test.skip with assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'skipped with expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 1 }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('non-test function names', () => {
    test('should not report fit() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fit' },
        arguments: [
          { type: 'Literal', value: 'focused test' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report xit() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'xit' },
        arguments: [
          { type: 'Literal', value: 'skipped test' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('content patterns without assertions', () => {
    test('should report test with only variable declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'only variables' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'VariableDeclaration',
                  declarations: [
                    {
                      type: 'VariableDeclarator',
                      id: { type: 'Identifier', name: 'x' },
                      init: { type: 'Literal', value: 1 },
                    },
                  ],
                  kind: 'const',
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report test with only console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'just logging' },
          {
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
                      object: { type: 'Identifier', name: 'console' },
                      property: { type: 'Identifier', name: 'log' },
                    },
                    arguments: [{ type: 'Literal', value: 'debug output' }],
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

    test('should report it() using assert() by default', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      visitor.CallExpression(createItWithAssert())
      expect(reports.length).toBe(1)
    })
  })

  describe('async patterns', () => {
    test('should report async test() without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'async no expect' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'someAsync' },
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

  describe('template literal titles', () => {
    test('should handle it() with template literal title', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } }],
            expressions: [{ type: 'Identifier', name: 'name' }],
          },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Literal', value: 1 }],
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

    test('should report it() with template literal title and no assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'test ', cooked: 'test ' } }],
            expressions: [{ type: 'Identifier', name: 'name' }],
          },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('control flow with expect', () => {
    test('should handle test with expect inside if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'conditional expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'IfStatement',
                  test: { type: 'Literal', value: true },
                  consequent: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: {
                          type: 'CallExpression',
                          callee: { type: 'Identifier', name: 'expect' },
                          arguments: [{ type: 'Literal', value: 1 }],
                        },
                      },
                    ],
                  },
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

    test('should handle test with expect inside try-catch block', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'try catch expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'TryStatement',
                  block: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: {
                          type: 'CallExpression',
                          callee: { type: 'Identifier', name: 'expect' },
                          arguments: [{ type: 'Literal', value: 1 }],
                        },
                      },
                    ],
                  },
                  handler: {
                    type: 'CatchClause',
                    param: { type: 'Identifier', name: 'e' },
                    body: { type: 'BlockStatement', body: [] },
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 55 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report FunctionExpression callback without expect', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'function expression no expect' },
          {
            type: 'FunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'someHelper' },
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

  // SECTION: Additional edge cases for coverage
  describe('additional edge cases', () => {
    test('should find expect inside forEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'forEach with expect' },
          {
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
                                callee: { type: 'Identifier', name: 'expect' },
                                arguments: [{ type: 'Identifier', name: 'item' }],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report test.each without assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'each' },
        },
        arguments: [
          { type: 'Literal', value: 'parameterized' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should find expect with .not modifier chain', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'expect.not chain' },
          {
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
                      object: {
                        type: 'MemberExpression',
                        object: {
                          type: 'CallExpression',
                          callee: { type: 'Identifier', name: 'expect' },
                          arguments: [{ type: 'Literal', value: 1 }],
                        },
                        property: { type: 'Identifier', name: 'not' },
                      },
                      property: { type: 'Identifier', name: 'toBe' },
                    },
                    arguments: [{ type: 'Literal', value: 2 }],
                  },
                },
              ],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 55 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should check it.concurrent member expression for assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = expectExpectRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Identifier', name: 'concurrent' },
        },
        arguments: [
          { type: 'Literal', value: 'concurrent no expect' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})
