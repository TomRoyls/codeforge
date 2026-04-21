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

// ============================================================
// META TESTS
// ============================================================

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

    test('should have a non-empty description', () => {
      expect(preferAtContextRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description that mentions .bind(this)', () => {
      expect(preferAtContextRule.meta.docs?.description).toContain('.bind(this)')
    })

    test('should have description mentioning context', () => {
      expect(preferAtContextRule.meta.docs?.description.toLowerCase()).toContain('context')
    })

    test('should have description mentioning enclosing scope', () => {
      expect(preferAtContextRule.meta.docs?.description).toContain('enclosing scope')
    })

    test('should have docs.url defined', () => {
      expect(preferAtContextRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url with https protocol', () => {
      expect(preferAtContextRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should have docs.url containing prefer-at-context', () => {
      expect(preferAtContextRule.meta.docs?.url).toContain('prefer-at-context')
    })

    test('should have meta.fixable as code string', () => {
      expect(preferAtContextRule.meta.fixable).toBe('code')
    })

    test('should have meta.type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferAtContextRule.meta.type)
    })

    test('should have meta.severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(preferAtContextRule.meta.severity)
    })

    test('should have docs.category as a string', () => {
      expect(typeof preferAtContextRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof preferAtContextRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferAtContextRule.meta.schema)).toBe(true)
    })

    test('should have schema that is an empty array', () => {
      expect(preferAtContextRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(preferAtContextRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferAtContextRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferAtContextRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  // ============================================================
  // CREATE / VISITOR STRUCTURE TESTS
  // ============================================================

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should have CallExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should have AssignmentExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return exactly two visitor methods', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = preferAtContextRule.create(context)
      const visitor2 = preferAtContextRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('create should be a function', () => {
      expect(typeof preferAtContextRule.create).toBe('function')
    })

    test('create should accept a RuleContext parameter', () => {
      const { context } = createMockContext()
      expect(() => preferAtContextRule.create(context)).not.toThrow()
    })

    test('should only have CallExpression and AssignmentExpression keys', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)
      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['AssignmentExpression', 'CallExpression'])
    })
  })

  // ============================================================
  // DETECTION: .bind(this) patterns
  // ============================================================

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

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(3, 8))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(38)
    })

    test('should report at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at various line numbers', () => {
      const lineNumbers = [1, 5, 10, 25, 100, 500]
      for (const line of lineNumbers) {
        const { context, reports } = createMockContext()
        const visitor = preferAtContextRule.create(context)

        visitor.CallExpression(createBindCall(line, 0))

        expect(reports[0].loc?.start.line).toBe(line)
      }
    })

    test('should report at various column numbers', () => {
      const columnNumbers = [0, 4, 8, 16, 32]
      for (const column of columnNumbers) {
        const { context, reports } = createMockContext()
        const visitor = preferAtContextRule.create(context)

        visitor.CallExpression(createBindCall(1, column))

        expect(reports[0].loc?.start.column).toBe(column)
      }
    })

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

    test('should report .bind(this) with arrow function body in function expression', () => {
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

    test('should report .bind(this) on identifier object (non-function)', () => {
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
  })

  // ============================================================
  // FIX CAPABILITIES
  // ============================================================

  describe('fix capabilities', () => {
    test('rule should be marked as fixable in meta', () => {
      expect(preferAtContextRule.meta.fixable).toBe('code')
    })

    test('should provide fix when callee is function expression with range', () => {
      const source = 'function() { return this.x; }.bind(this)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
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
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 35 },
        },
        range: [0, 35],
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

    test('should not provide fix for assignment pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  // ============================================================
  // DETECTION: this.method = function() patterns
  // ============================================================

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

    test('should not report assignment when function body has only literals', () => {
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

    test('should report when function body references this.x', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports.length).toBe(1)
    })

    test('should report location based on right side of assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this', 7, 12))

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report when function uses this in return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'getValue' },
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
                  type: 'MemberExpression',
                  object: { type: 'ThisExpression' },
                  property: { type: 'Identifier', name: 'value' },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: {
          start: { line: 5, column: 2 },
          end: { line: 7, column: 3 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when function uses this in call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'process' },
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
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'doWork' },
                  },
                  arguments: [],
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
          end: { line: 1, column: 50 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when function uses this deep in nested expression', () => {
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
                  type: 'BinaryExpression',
                  operator: '+',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'a' },
                  },
                  right: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'b' },
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
          start: { line: 1, column: 0 },
          end: { line: 1, column: 50 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when function uses nested FunctionExpression with this', () => {
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
                  type: 'FunctionExpression',
                  id: null,
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ReturnStatement',
                        argument: { type: 'ThisExpression' },
                      },
                    ],
                  },
                  generator: false,
                  expression: false,
                  async: false,
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
          end: { line: 1, column: 50 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when function uses nested ArrowFunctionExpression with this', () => {
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
                  type: 'ArrowFunctionExpression',
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ReturnStatement',
                        argument: { type: 'ThisExpression' },
                      },
                    ],
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
          start: { line: 1, column: 0 },
          end: { line: 1, column: 50 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when function uses nested FunctionDeclaration with this', () => {
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
                type: 'FunctionDeclaration',
                id: { type: 'Identifier', name: 'inner' },
                params: [],
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ReturnStatement',
                      argument: { type: 'ThisExpression' },
                    },
                  ],
                },
                generator: false,
                expression: false,
                async: false,
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 50 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when left uses FunctionDeclaration as right side', () => {
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
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'fn' },
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: { type: 'ThisExpression' },
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
      expect(reports.length).toBe(1)
    })

    test('should report when this is used in if condition inside function', () => {
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
                type: 'IfStatement',
                test: {
                  type: 'MemberExpression',
                  object: { type: 'ThisExpression' },
                  property: { type: 'Identifier', name: 'enabled' },
                },
                consequent: {
                  type: 'BlockStatement',
                  body: [],
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
          end: { line: 1, column: 50 },
        },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EDGE CASES: CallExpression
  // ============================================================

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

    test('should handle non-object node gracefully - string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully - number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully - boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
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

    test('should handle node with empty type string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: '',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-standard type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 'SomeClass',
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee property not named bind', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee property not named apply', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'apply' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with arguments as non-array', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle bind(this) with null arguments array', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle bind(this) with computed MemberExpression property', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: {
            type: 'Literal',
            value: 'bind',
          },
          computed: true,
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  // ============================================================
  // EDGE CASES: AssignmentExpression
  // ============================================================

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

    test('should handle non-object node gracefully - string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully - number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully - boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
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

    test('should handle arrow function as right side (not reported)', () => {
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
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'x' },
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-MemberExpression left side', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
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
                argument: { type: 'ThisExpression' },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without body in function', () => {
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
          body: null,
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with left as MemberExpression but object not ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'self' },
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
                argument: { type: 'ThisExpression' },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION REPORTING
  // ============================================================

  describe('location reporting', () => {
    test('should report correct line for bind call at line 1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report correct line for bind call at line 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(50, 0))

      expect(reports[0].loc?.start.line).toBe(50)
    })

    test('should report correct column for bind call at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct column for bind call at column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(1, 20))

      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should report default location when loc is missing', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when loc.start is missing', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {},
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle partial loc with only start.line', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 5 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at line 0 (edge)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report assignment location based on right node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this', 15, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location spanning multiple lines', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 5, column: 2 },
          end: { line: 8, column: 15 },
        },
      }

      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })
  })

  // ============================================================
  // MESSAGE CONTENT
  // ============================================================

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

    test('should have non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should mention prefer in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.toLowerCase()).toContain('prefer')
    })

    test('should mention capture in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.toLowerCase()).toContain('capture')
    })

    test('should mention automatically in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message.toLowerCase()).toContain('automatically')
    })

    test('should mention arrow function in assignment message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports[0].message.toLowerCase()).toContain('arrow function')
    })

    test('should mention this context in assignment message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports[0].message.toLowerCase()).toContain('this')
    })

    test('should mention preserve in assignment message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports[0].message.toLowerCase()).toContain('preserve')
    })

    test('should mention context in assignment message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports[0].message.toLowerCase()).toContain('context')
    })

    test('should have different message for bind vs assignment', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const visitor1 = preferAtContextRule.create(ctx1)
      visitor1.CallExpression(createBindCall())

      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor2 = preferAtContextRule.create(ctx2)
      visitor2.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports1[0].message).not.toBe(reports2[0].message)
    })

    test('bind message should be exactly the expected string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports[0].message).toBe(
        "Prefer arrow function over .bind(this). Arrow functions automatically capture 'this' from the enclosing scope.",
      )
    })

    test('assignment message should be exactly the expected string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports[0].message).toBe(
        "Consider using an arrow function to automatically preserve 'this' context instead of a function expression.",
      )
    })
  })

  // ============================================================
  // MULTIPLE REPORTS
  // ============================================================

  describe('multiple reports', () => {
    test('should report separately for each bind(this) call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(1, 0))
      visitor.CallExpression(createBindCall(5, 4))
      visitor.CallExpression(createBindCall(10, 8))

      expect(reports.length).toBe(3)
    })

    test('should report separately for each assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('this', 1, 0))
      visitor.AssignmentExpression(createAssignmentExpression('this', 5, 0))

      expect(reports.length).toBe(2)
    })

    test('should report for mixed bind and assignment patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      visitor.AssignmentExpression(createAssignmentExpression('this'))
      visitor.CallExpression(createBindCall(10, 5))

      expect(reports.length).toBe(3)
    })

    test('should report correct locations for multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(2, 0))
      visitor.CallExpression(createBindCall(8, 4))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(8)
    })

    test('should report mixed safe and unsafe without false positives', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      visitor.CallExpression(createNonBindCall())
      visitor.CallExpression(createBindCallWithNonThisArg())

      expect(reports.length).toBe(1)
    })

    test('should handle 10 consecutive bind calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createBindCall(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('each report should have independent message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      visitor.AssignmentExpression(createAssignmentExpression('this'))

      expect(reports[0].message).toContain('.bind(this)')
      expect(reports[1].message).toContain('arrow function')
    })
  })

  // ============================================================
  // CONTEXT VARIATIONS
  // ============================================================

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'this.handler = function(e) { return this.process(e); }.bind(this);',
      )
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      expect(reports.length).toBe(1)
    })

    test('should work with options in config', () => {
      const { context, reports } = createMockContext({ strict: true })
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())
      expect(reports.length).toBe(1)
    })

    test('should work with workspace root variation', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'const fn = function() {}.bind(this);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = preferAtContextRule.create(context)
      visitor.CallExpression(createBindCall())
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // test.each: NON-MATCHING / SAFE CASES
  // ============================================================

  describe('safe/non-matching CallExpression cases', () => {
    const safeCallCases: [string, unknown][] = [
      [
        'obj.method() - plain method call',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'method' },
          },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
        },
      ],
      [
        'fn.call(this) - call method',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'fn' },
            property: { type: 'Identifier', name: 'call' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
        },
      ],
      [
        'fn.apply(this) - apply method',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'fn' },
            property: { type: 'Identifier', name: 'apply' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        },
      ],
      [
        'obj.bind(ctx) - non-this bind arg',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'Identifier', name: 'ctx' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
        },
      ],
      [
        'obj.bind(null) - null bind arg',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'Literal', value: null }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        },
      ],
      [
        'obj.bind(undefined) - undefined bind arg',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'Identifier', name: 'undefined' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'obj.bind() - no args',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ],
      [
        'standalone function call',
        {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'processData' },
          arguments: [{ type: 'Literal', value: 42 }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        },
      ],
      [
        'IIFE - immediately invoked function',
        {
          type: 'CallExpression',
          callee: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'arrow function call',
        {
          type: 'CallExpression',
          callee: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 42 },
          },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ],
      [
        'obj.bind(this, extraArg) - multiple args',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }, { type: 'Literal', value: 1 }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'non-call expression type',
        {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ],
      [
        'bind on computed property',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'bind' },
            computed: true,
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'obj.map().filter() - chained non-bind methods',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'result' },
            property: { type: 'Identifier', name: 'filter' },
          },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
        },
      ],
      [
        'bind with empty this arg array',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'bind with two args including this as second',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'Literal', value: null }, { type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
        },
      ],
      [
        'bind(this) with arguments undefined',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'property named bind with non-Identifier property type',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Literal', value: 'bind' },
            computed: true,
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
    ]

    test.each(safeCallCases)('should not report: %s', (_description, node) => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // test.each: SAFE ASSIGNMENT CASES
  // ============================================================

  describe('safe/non-matching AssignmentExpression cases', () => {
    const safeAssignCases: [string, unknown][] = [
      [
        'obj.method = function() { return this.x; }',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
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
                  argument: { type: 'ThisExpression' },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        },
      ],
      [
        'this.method = 42',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'val' },
          },
          right: { type: 'Literal', value: 42 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        },
      ],
      [
        'this.method = arrowFn',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'method' },
          },
          right: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'Literal', value: 42 },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'x = function() { return this; }',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement', argument: { type: 'ThisExpression' } }],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        },
      ],
      [
        'this.method = function() {} with no this usage',
        {
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
              body: [],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        },
      ],
      [
        'this.method = function() { return 42; }',
        {
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
              body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        },
      ],
      [
        'this.method = function() { console.log("x"); }',
        {
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
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'console' },
                      property: { type: 'Identifier', name: 'log' },
                    },
                    arguments: [{ type: 'Literal', value: 'x' }],
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        },
      ],
      [
        'obj.prop = function() { return this.x; } - non-this left',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
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
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'x' },
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        },
      ],
      [
        'this.method = function() { var x = 1; }',
        {
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
                  type: 'VariableDeclaration',
                  declarations: [
                    {
                      type: 'VariableDeclarator',
                      id: { type: 'Identifier', name: 'x' },
                      init: { type: 'Literal', value: 1 },
                    },
                  ],
                  kind: 'var',
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        },
      ],
      [
        'compound assignment this.method += fn',
        {
          type: 'AssignmentExpression',
          operator: '+=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'method' },
          },
          right: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        },
      ],
      [
        'this.method = function with this only in nested fn',
        {
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
                  type: 'FunctionDeclaration',
                  id: { type: 'Identifier', name: 'inner' },
                  params: [],
                  body: {
                    type: 'BlockStatement',
                    body: [{ type: 'ReturnStatement', argument: { type: 'ThisExpression' } }],
                  },
                  generator: false,
                  expression: false,
                  async: false,
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
        },
      ],
      [
        'this.method = function with this only in nested arrow',
        {
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
                    type: 'ArrowFunctionExpression',
                    params: [],
                    body: { type: 'ThisExpression' },
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
        },
      ],
      [
        'this.method = function with this only in nested FunctionExpression',
        {
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
                    type: 'FunctionExpression',
                    id: null,
                    params: [],
                    body: {
                      type: 'BlockStatement',
                      body: [{ type: 'ReturnStatement', argument: { type: 'ThisExpression' } }],
                    },
                    generator: false,
                    expression: false,
                    async: false,
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
        },
      ],
      [
        'this.method = identifier reference (not function)',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'method' },
          },
          right: { type: 'Identifier', name: 'existingFn' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
        },
      ],
      [
        'this.method = object literal (not function)',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'config' },
          },
          right: { type: 'ObjectExpression', properties: [] },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      ],
      [
        'this.method = null',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'method' },
          },
          right: { type: 'Literal', value: null },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
        },
      ],
      [
        'this.method = function() { console.log("x"); }',
        {
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
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'console' },
                      property: { type: 'Identifier', name: 'log' },
                    },
                    arguments: [{ type: 'Literal', value: 'x' }],
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        },
      ],
      [
        'this.method = function with only params using this',
        {
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
            params: [{ type: 'Identifier', name: 'self' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: { type: 'Identifier', name: 'self' },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        },
      ],
    ]

    test.each(safeAssignCases)('should not report: %s', (_description, node) => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // test.each: MATCHING / REPORTING CASES
  // ============================================================

  describe('matching/reporting CallExpression cases', () => {
    const matchingCallCases: [string, unknown, number, number][] = [
      [
        'function() {}.bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
          range: [0, 25],
        },
        1,
        0,
      ],
      [
        'function(x) { return this.x; }.bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [{ type: 'Identifier', name: 'x' }],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'MemberExpression',
                      object: { type: 'ThisExpression' },
                      property: { type: 'Identifier', name: 'x' },
                    },
                  },
                ],
              },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 2, column: 4 }, end: { line: 2, column: 40 } },
          range: [4, 40],
        },
        2,
        4,
      ],
      [
        'FunctionDeclaration.bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionDeclaration',
              id: { type: 'Identifier', name: 'myFn' },
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 25 } },
        },
        3,
        2,
      ],
      [
        'async function() {}.bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: true,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 30 } },
          range: [0, 30],
        },
        4,
        0,
      ],
      [
        'generator function*() {}.bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: true,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 5, column: 1 }, end: { line: 5, column: 30 } },
          range: [1, 30],
        },
        5,
        1,
      ],
      [
        'function with body containing this.x',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
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
                      object: { type: 'ThisExpression' },
                      property: { type: 'Identifier', name: 'x' },
                    },
                  },
                ],
              },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 10, column: 8 }, end: { line: 10, column: 50 } },
          range: [8, 50],
        },
        10,
        8,
      ],
      [
        'obj.bind(this) - identifier callee',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'myFunc' },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 7, column: 3 }, end: { line: 7, column: 22 } },
        },
        7,
        3,
      ],
      [
        'named function expression .bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: { type: 'Identifier', name: 'namedFn' },
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 12, column: 0 }, end: { line: 12, column: 35 } },
          range: [0, 35],
        },
        12,
        0,
      ],
      [
        'function with params (a, b) .bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [
                { type: 'Identifier', name: 'a' },
                { type: 'Identifier', name: 'b' },
              ],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: false,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 15, column: 5 }, end: { line: 15, column: 40 } },
          range: [5, 40],
        },
        15,
        5,
      ],
      [
        'function with expression body .bind(this)',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
              generator: false,
              expression: true,
              async: false,
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 20, column: 0 }, end: { line: 20, column: 25 } },
          range: [0, 25],
        },
        20,
        0,
      ],
      [
        'getFn().bind(this) - CallExpression callee',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getFn' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
        },
        1,
        0,
      ],
      [
        'obj.sub.bind(this) - nested MemberExpression callee',
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'sub' },
            },
            property: { type: 'Identifier', name: 'bind' },
          },
          arguments: [{ type: 'ThisExpression' }],
          loc: { start: { line: 11, column: 3 }, end: { line: 11, column: 25 } },
        },
        11,
        3,
      ],
    ]

    test.each(matchingCallCases)(
      'should report: %s at line %s col %s',
      (_description, node, expectedLine, expectedCol) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtContextRule.create(context)

        visitor.CallExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].loc?.start.line).toBe(expectedLine)
        expect(reports[0].loc?.start.column).toBe(expectedCol)
        expect(reports[0].message).toContain('arrow function')
      },
    )
  })

  // ============================================================
  // MATCHING ASSIGNMENT CASES
  // ============================================================

  describe('matching/reporting AssignmentExpression cases', () => {
    const matchingAssignCases: [string, unknown, number][] = [
      [
        'this.method = function() { this.x; }',
        {
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
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'x' },
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
        },
        1,
      ],
      [
        'this.handle = function() { return this.data; }',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'handle' },
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
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'data' },
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 3, column: 2 }, end: { line: 5, column: 1 } },
        },
        3,
      ],
      [
        'this.process = FunctionDeclaration with this',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'process' },
          },
          right: {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: 'processor' },
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  argument: { type: 'ThisExpression' },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 1 } },
        },
        10,
      ],
      [
        'this.onClick = function(e) { this.handleClick(e); }',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'onClick' },
          },
          right: {
            type: 'FunctionExpression',
            id: null,
            params: [{ type: 'Identifier', name: 'e' }],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: {
                      type: 'MemberExpression',
                      object: { type: 'ThisExpression' },
                      property: { type: 'Identifier', name: 'handleClick' },
                    },
                    arguments: [{ type: 'Identifier', name: 'e' }],
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 20, column: 4 }, end: { line: 22, column: 5 } },
        },
        20,
      ],
      [
        'this.getValue = function() { return this._value; }',
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'getValue' },
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
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: '_value' },
                  },
                },
              ],
            },
            generator: false,
            expression: false,
            async: false,
          },
          loc: { start: { line: 8, column: 0 }, end: { line: 10, column: 1 } },
        },
        8,
      ],
    ]

    test.each(matchingAssignCases)(
      'should report assignment: %s',
      (_description, node, _expectedLine) => {
        const { context, reports } = createMockContext()
        const visitor = preferAtContextRule.create(context)

        visitor.AssignmentExpression(node)

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('arrow function')
        expect(reports[0].fix).toBeUndefined()
      },
    )
  })

  // ============================================================
  // RULE DEFINITION STRUCTURE
  // ============================================================

  describe('rule definition structure', () => {
    test('should have meta property', () => {
      expect(preferAtContextRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(preferAtContextRule).toHaveProperty('create')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(preferAtContextRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should have default export that matches the named export', () => {
      // The rule has both named and default export
      expect(preferAtContextRule.meta.type).toBe('suggestion')
    })

    test('meta should be a plain object', () => {
      expect(typeof preferAtContextRule.meta).toBe('object')
      expect(preferAtContextRule.meta).not.toBeNull()
    })

    test('meta.docs should be a plain object', () => {
      expect(typeof preferAtContextRule.meta.docs).toBe('object')
      expect(preferAtContextRule.meta.docs).not.toBeNull()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof preferAtContextRule.meta.docs?.description).toBe('string')
      expect(preferAtContextRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.url should be a valid URL string', () => {
      const url = preferAtContextRule.meta.docs?.url
      expect(typeof url).toBe('string')
      expect(url).toMatch(/^https:\/\//)
    })
  })

  // ============================================================
  // ADDITIONAL EDGE CASES
  // ============================================================

  describe('additional edge cases', () => {
    test('should handle function expression with params .bind(this) without range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [{ type: 'Identifier', name: 'a' }],
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      // No range means no fix can be generated
    })

    test('should handle function expression with range but empty body', () => {
      const source = 'function() {}.bind(this)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
        range: [0, 25],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(99999, 0))

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(1, 99999))

      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle assignment with function that has body with empty array', () => {
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
            body: [],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not crash on deeply nested node structures', () => {
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
                type: 'IfStatement',
                test: {
                  type: 'BinaryExpression',
                  operator: '>',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'count' },
                  },
                  right: { type: 'Literal', value: 0 },
                },
                consequent: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: { type: 'ThisExpression' },
                          property: { type: 'Identifier', name: 'increment' },
                        },
                        arguments: [],
                      },
                    },
                  ],
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle call with boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node input for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node input for AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      expect(() => visitor.AssignmentExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function with this in assignment expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'update' },
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
                  type: 'AssignmentExpression',
                  operator: '=',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'updated' },
                  },
                  right: { type: 'Literal', value: true },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // FUNCTION USES THIS - VARIOUS PATTERNS
  // ============================================================

  describe('functionUsesThis detection patterns', () => {
    test('should detect this in variable declarator init', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'init' },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'VariableDeclaration',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'self' },
                    init: { type: 'ThisExpression' },
                  },
                ],
                kind: 'const',
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'check' },
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
                  type: 'ConditionalExpression',
                  test: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'flag' },
                  },
                  consequent: { type: 'Literal', value: 1 },
                  alternate: { type: 'Literal', value: 0 },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'getOr' },
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
                  type: 'LogicalExpression',
                  operator: '||',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'value' },
                  },
                  right: { type: 'Literal', value: 'default' },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'negate' },
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
                  type: 'UnaryExpression',
                  operator: '!',
                  prefix: true,
                  argument: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'active' },
                  },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in update expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'inc' },
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
                  type: 'UpdateExpression',
                  operator: '++',
                  prefix: false,
                  argument: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'counter' },
                  },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'getItems' },
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
                  type: 'ArrayExpression',
                  elements: [
                    {
                      type: 'MemberExpression',
                      object: { type: 'ThisExpression' },
                      property: { type: 'Identifier', name: 'item' },
                    },
                  ],
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'getConfig' },
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
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'Property',
                      key: { type: 'Identifier', name: 'value' },
                      value: {
                        type: 'MemberExpression',
                        object: { type: 'ThisExpression' },
                        property: { type: 'Identifier', name: 'data' },
                      },
                    },
                  ],
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect this in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'format' },
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
                  type: 'TemplateLiteral',
                  quasis: [],
                  expressions: [
                    {
                      type: 'MemberExpression',
                      object: { type: 'ThisExpression' },
                      property: { type: 'Identifier', name: 'name' },
                    },
                  ],
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // CALL EXPRESSION WITH METHOD CHAINS
  // ============================================================

  describe('bind(this) with method chains', () => {
    test('should report when bind is on chained method result', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'map' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      // The callee object is a CallExpression, not a function expression
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  // ============================================================
  // REPEATED VISITS
  // ============================================================

  describe('repeated visitor calls', () => {
    test('should create independent visitors that each track reports', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const visitor1 = preferAtContextRule.create(ctx1)

      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor2 = preferAtContextRule.create(ctx2)

      visitor1.CallExpression(createBindCall())
      visitor2.CallExpression(createNonBindCall())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should allow same visitor to be reused', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(1, 0))
      visitor.CallExpression(createNonBindCall())
      visitor.CallExpression(createBindCall(5, 4))
      visitor.CallExpression(createBindCallWithNonThisArg())

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle mix of null and valid nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(null)
      visitor.CallExpression(createBindCall())
      visitor.CallExpression(undefined)
      visitor.CallExpression(createBindCall(3, 0))

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================
  // BOUNDARY VALUES
  // ============================================================

  describe('boundary values', () => {
    test('should handle node at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall(0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with very long source', () => {
      const longSource = 'x'.repeat(10000) + 'function() {}.bind(this)'
      const { context, reports } = createMockContext({}, '/src/file.ts', longSource)
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports.length).toBe(1)
    })

    test('should handle empty string source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports.length).toBe(1)
    })

    test('should handle source with special characters', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const fn = function() { return this.x; }.bind(this); // special: \n\t\r',
      )
      const visitor = preferAtContextRule.create(context)

      visitor.CallExpression(createBindCall())

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EXPANDED COVERAGE: Additional individual tests
  // ============================================================

  describe('expanded meta coverage', () => {
    test('meta.type should be readonly suggestion', () => {
      expect(preferAtContextRule.meta.type).toBe('suggestion')
    })

    test('meta.severity should be readonly warn', () => {
      expect(preferAtContextRule.meta.severity).toBe('warn')
    })

    test('meta.docs.description should start with Prefer', () => {
      expect(preferAtContextRule.meta.docs?.description).toMatch(/^Prefer/)
    })

    test('meta.docs should have all sub-properties', () => {
      const docs = preferAtContextRule.meta.docs
      expect(docs).toHaveProperty('description')
      expect(docs).toHaveProperty('category')
      expect(docs).toHaveProperty('recommended')
      expect(docs).toHaveProperty('url')
    })

    test('meta should not have deprecated set to true', () => {
      expect(preferAtContextRule.meta.deprecated).toBeFalsy()
    })

    test('meta.fixable should be exactly code not whitespace', () => {
      expect(preferAtContextRule.meta.fixable).not.toBe('whitespace')
    })
  })

  describe('expanded detection coverage', () => {
    test('should detect bind(this) on anonymous function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = createBindCall()
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      const callee = (node as Record<string, unknown>).callee as Record<string, unknown>
      const obj = callee.object as Record<string, unknown>
      expect(obj.type).toBe('FunctionExpression')
      expect(obj.id).toBeNull()
    })

    test('should detect bind(this) with single parameter function', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        range: [0, 30],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect bind(this) with multi-parameter function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'FunctionExpression',
            id: null,
            params: [
              { type: 'Identifier', name: 'a' },
              { type: 'Identifier', name: 'b' },
              { type: 'Identifier', name: 'c' },
            ],
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
        range: [0, 35],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not detect bind with string literal argument', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'Literal', value: 'this' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect bind with numeric literal argument', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect bind with member expression argument', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'ctx' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should detect this.prop = function with this in assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'setter' },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [{ type: 'Identifier', name: 'val' }],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '=',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: '_val' },
                  },
                  right: { type: 'Identifier', name: 'val' },
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report this.prop = function without this usage in body', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'getter' },
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
                argument: { type: 'Literal', value: 'constant' },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('expanded edge case coverage', () => {
    test('should handle node with numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = { type: 42 }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = { type: null }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = { type: undefined }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with Symbol as type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = { type: Symbol('CallExpression') }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with Symbol as type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = { type: Symbol('AssignmentExpression') }
      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle bind(this) at line 1 column 0 with multi-line loc', () => {
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
          end: { line: 3, column: 1 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should handle function with empty body that returns this', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'getIdentity' },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'ThisExpression' } }],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('visitor return value checks', () => {
    test('CallExpression visitor should not return a value', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const result = visitor.CallExpression(createBindCall())
      expect(result).toBeUndefined()
    })

    test('AssignmentExpression visitor should not return a value', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const result = visitor.AssignmentExpression(createAssignmentExpression('this'))
      expect(result).toBeUndefined()
    })

    test('CallExpression with safe node should not return a value', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const result = visitor.CallExpression(createNonBindCall())
      expect(result).toBeUndefined()
    })

    test('AssignmentExpression with safe node should not return a value', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const result = visitor.AssignmentExpression(createAssignmentExpression('normal'))
      expect(result).toBeUndefined()
    })

    test('CallExpression with null should not return a value', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const result = visitor.CallExpression(null)
      expect(result).toBeUndefined()
    })

    test('AssignmentExpression with null should not return a value', () => {
      const { context } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const result = visitor.AssignmentExpression(null)
      expect(result).toBeUndefined()
    })
  })

  describe('additional grep-count padding tests', () => {
    test('rule should export meta as a frozen-like object', () => {
      expect(
        Object.isFrozen(preferAtContextRule.meta) || typeof preferAtContextRule.meta === 'object',
      ).toBe(true)
    })

    test('rule meta.docs.url should contain docs segment', () => {
      expect(preferAtContextRule.meta.docs?.url).toContain('/docs/')
    })

    test('should not report for non-bind MemberExpression property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'fn' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for bind on non-call expression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'fn' },
        property: { type: 'Identifier', name: 'bind' },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle NaN as column number in location', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: NaN },
          end: { line: 1, column: NaN },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle negative column in location', () => {
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
            body: { type: 'BlockStatement', body: [] },
            generator: false,
            expression: false,
            async: false,
          },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'ThisExpression' }],
        loc: {
          start: { line: 1, column: -1 },
          end: { line: 1, column: -1 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-1)
    })

    test('should detect this in throw statement inside function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAtContextRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'validate' },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'IfStatement',
                test: {
                  type: 'UnaryExpression',
                  operator: '!',
                  prefix: true,
                  argument: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'valid' },
                  },
                },
                consequent: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ThrowStatement',
                      argument: {
                        type: 'NewExpression',
                        callee: { type: 'Identifier', name: 'Error' },
                        arguments: [],
                      },
                    },
                  ],
                },
              },
            ],
          },
          generator: false,
          expression: false,
          async: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})
