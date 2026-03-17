import { describe, test, expect, vi } from 'vitest'
import { noSetterReturnRule } from '../../../../src/rules/patterns/no-setter-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'set x(value) {}',
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

  return { context, reports }
}

function createMethodDefinition(
  kind: 'get' | 'set' | 'method',
  body: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MethodDefinition',
    kind,
    key: { type: 'Identifier', name: 'x' },
    value: {
      type: 'FunctionExpression',
      body,
      params: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createEmptyBlockStatement(): unknown {
  return {
    type: 'BlockStatement',
    body: [],
  }
}

function createBlockStatementWithReturn(value: unknown | null | undefined): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'ReturnStatement',
        value,
      },
    ],
  }
}

function createBlockStatementWithIfReturn(hasValue: boolean): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'condition' },
        consequent: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              value: hasValue ? { type: 'Literal', value: 5 } : null,
            },
          ],
        },
        alternate: null,
      },
    ],
  }
}

function createBlockStatementWithNestedFunction(hasReturnValue: boolean): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'fn' },
            init: {
              type: 'FunctionExpression',
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    value: hasReturnValue ? { type: 'Literal', value: 10 } : null,
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  }
}

describe('no-setter-return rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSetterReturnRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSetterReturnRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSetterReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSetterReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention setter in description', () => {
      expect(noSetterReturnRule.meta.docs?.description.toLowerCase()).toContain('setter')
    })
  })

  describe('create', () => {
    test('should return visitor with MethodDefinition method', () => {
      const { context } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('MethodDefinition should be a function', () => {
      const { context } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      expect(typeof visitor.MethodDefinition).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report setter with no return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createEmptyBlockStatement())
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(undefined))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(null))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'get',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular method with return value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'method',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return in nested function', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithNestedFunction(true))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return in if block without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithIfReturn(false))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with only early return without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(null))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with multiple returns without values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          { type: 'ReturnStatement', value: null },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          { type: 'ReturnStatement', value: undefined },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report setter with return statement and value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 'test' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Identifier', name: 'x' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '+',
          right: { type: 'Literal', value: 1 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return in if block with value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithIfReturn(true))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return in nested block', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'condition' },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'IfStatement',
                  test: { type: 'Identifier', name: 'inner' },
                  consequent: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ReturnStatement',
                        value: { type: 'Literal', value: 10 },
                      },
                    ],
                  },
                  alternate: null,
                },
              ],
            },
            alternate: null,
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return in nested try-catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'TryStatement',
            block: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  value: { type: 'Literal', value: 5 },
                },
              ],
            },
            handler: null,
            finalizer: null,
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: true }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        5,
        10,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report each setter that returns a value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 3 }),
        ),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without kind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: createEmptyBlockStatement(),
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body in value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      delete (node as Record<string, unknown>).loc

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeUndefined()
    })

    test('should handle non-MethodDefinition node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'x',
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })
})
