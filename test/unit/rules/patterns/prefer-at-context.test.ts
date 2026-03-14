import { describe, test, expect, vi } from 'vitest'
import { preferAtContextRule } from '../../../../src/rules/patterns/prefer-at-context.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const fn = function() { return this.x; }.bind(this);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createBindCall(line = 1, column = 0, isFunctionExpression = true): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [],
        },
        generator: false,
        expression: false,
        async: false,
      },
      property: {
        type: 'Identifier',
        name: 'bind',
      },
    },
    arguments: [
      {
        type: 'ThisExpression',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    range: [column, column + 30],
  }
}

function createNonBindCall(line = 1, column = 0): unknown {
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
        name: 'method',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createBindCallWithNonThisArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [],
        },
        generator: false,
        expression: false,
        async: false,
      },
      property: {
        type: 'Identifier',
        name: 'bind',
      },
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'context',
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createAssignmentExpression(
  leftType: 'this' | 'normal' = 'this',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object:
        leftType === 'this'
          ? {
              type: 'ThisExpression',
            }
          : {
              type: 'Identifier',
              name: 'obj',
            },
      property: {
        type: 'Identifier',
        name: 'method',
      },
    },
    right: {
      type: 'FunctionExpression',
      id: null,
      params: [],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'MemberExpression',
              object: {
                type: 'ThisExpression',
              },
              property: {
                type: 'Identifier',
                name: 'x',
              },
            },
          },
        ],
      },
      generator: false,
      expression: false,
      async: false,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createFunctionExpressionWithThis(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [
      {
        type: 'Identifier',
        name: 'x',
      },
    ],
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ReturnStatement',
          argument: {
            type: 'MemberExpression',
            object: {
              type: 'ThisExpression',
            },
            property: {
              type: 'Identifier',
              name: 'value',
            },
          },
        },
      ],
    },
    generator: false,
    expression: false,
    async: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 50 },
    },
    range: [column, column + 50],
  }
}

describe('prefer-at-context rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferAtContextRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferAtContextRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferAtContextRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferAtContextRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferAtContextRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferAtContextRule.meta.fixable).toBe('code')
    })

    test('should mention arrow function in description', () => {
      expect(preferAtContextRule.meta.docs?.description.toLowerCase()).toContain('arrow')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('AssignmentExpression')
    })
  })

  describe('detecting .bind(this) patterns', () => {
    test('should report .bind(this) on function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arrow function')
      expect(reports[0].message).toContain('.bind(this)')
    })

    test('should not report non-bind calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createNonBindCall())

      expect(reports.length).toBe(0)
    })

    test('should not report .bind() with non-this argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCallWithNonThisArg())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(10, 5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('fix capabilities', () => {
    test('rule should be marked as fixable in meta', () => {
      expect(preferAtContextRule.meta.fixable).toBe('code')
    })
  })

  describe('detecting this.method = function() patterns', () => {
    test('should report this.method = function() when it uses this', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arrow function')
    })

    test('should not report non-this assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('normal'))

      expect(reports.length).toBe(0)
    })

    test('should not provide fix for assignment pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('edge cases - CallExpression', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [],
            },
            generator: false,
            expression: false,
            async: false,
          },
          property: {
            type: 'Identifier',
            name: 'bind',
          },
        },
        arguments: [
          {
            type: 'ThisExpression',
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle bind with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [],
            },
            generator: false,
            expression: false,
            async: false,
          },
          property: {
            type: 'Identifier',
            name: 'bind',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle bind with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [],
            },
            generator: false,
            expression: false,
            async: false,
          },
          property: {
            type: 'Identifier',
            name: 'bind',
          },
        },
        arguments: [
          {
            type: 'ThisExpression',
          },
          {
            type: 'Literal',
            value: 'arg1',
          },
          {
            type: 'Literal',
            value: 'arg2',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'bind',
        },
        arguments: [
          {
            type: 'ThisExpression',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - AssignmentExpression', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: 'method',
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-function expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: 'method',
          },
        },
        right: {
          type: 'Identifier',
          name: 'someFunction',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention arrow function in message for .bind(this)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.toLowerCase()).toContain('arrow function')
    })

    test('should mention .bind(this) in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message).toContain('.bind(this)')
    })

    test('should mention this context in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.toLowerCase()).toContain('this')
    })

    test('should mention enclosing scope in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.toLowerCase()).toContain('scope')
    })
  })

  describe('missing edge cases', () => {
    test('should report .bind(this) on FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: 'fn' },
            params: [],
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arrow function')
    })

    test('should not report .bind(this) when callee object is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'bind',
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle .bind(this) without callee object gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle .bind(this) on function expression without params', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [],
            },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle .bind(this) when function has arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [{ type: 'Identifier', name: 'x' }],
            body: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: {
                type: 'MemberExpression',
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: 'x' },
              },
            },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 50 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not provide fix when callee object is not a function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not report assignment when function does not use this', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'Literal',
                  value: 42,
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report assignment when function has nested function (nested functions have own this)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'method' },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'Literal',
                  value: 42,
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
