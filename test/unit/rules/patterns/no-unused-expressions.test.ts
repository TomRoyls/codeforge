import { describe, test, expect, vi } from 'vitest'
import { noUnusedExpressionsRule } from '../../../../src/rules/patterns/no-unused-expressions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createExpressionStatement(
  expression: unknown,
  lineNumber: number = 1,
  column: number = 0,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression: expression,
    loc: {
      start: { line: lineNumber, column: column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

function createBinaryExpression(operator: string, left?: unknown, right?: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator: operator,
    left: left || { type: 'Literal', value: 1 },
    right: right || { type: 'Literal', value: 2 },
  }
}

function createLogicalExpression(operator: string, left?: unknown, right?: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator: operator,
    left: left || { type: 'Identifier', name: 'a' },
    right: right || { type: 'Identifier', name: 'b' },
  }
}

function createCallExpression(callee?: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: callee || { type: 'Identifier', name: 'func' },
  }
}

function createAssignmentExpression(operator = '=', left?: unknown, right?: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: operator,
    left: left || { type: 'Identifier', name: 'x' },
    right: right || { type: 'Literal', value: 1 },
  }
}

function createUpdateExpression(operator: string, argument?: unknown): unknown {
  return {
    type: 'UpdateExpression',
    operator: operator,
    argument: argument || { type: 'Identifier', name: 'x' },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name: name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value: value }
}

describe('no-unused-expressions rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnusedExpressionsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnusedExpressionsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnusedExpressionsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnusedExpressionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnusedExpressionsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnusedExpressionsRule.meta.fixable).toBeUndefined()
    })

    test('should mention unused expressions in description', () => {
      const desc = noUnusedExpressionsRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/unused/)
      expect(desc).toMatch(/expression/)
    })

    test('should have empty schema array', () => {
      expect(noUnusedExpressionsRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with ExpressionStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })
  })

  describe('detecting comparison expressions', () => {
    test('should report strict equality expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('===')))

      expect(reports.length).toBe(1)
    })

    test('should report strict inequality expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('!==')))

      expect(reports.length).toBe(1)
    })

    test('should report loose equality expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('==')))

      expect(reports.length).toBe(1)
    })

    test('should report loose inequality expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('!=')))

      expect(reports.length).toBe(1)
    })

    test('should report less than expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('<')))

      expect(reports.length).toBe(1)
    })

    test('should report greater than expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('>')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting arithmetic expressions', () => {
    test('should report addition expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })

    test('should report subtraction expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('-')))

      expect(reports.length).toBe(1)
    })

    test('should report multiplication expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('*')))

      expect(reports.length).toBe(1)
    })

    test('should report division expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('/')))

      expect(reports.length).toBe(1)
    })

    test('should report modulo expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('%')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting logical expressions', () => {
    test('should report logical AND expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('&&')))

      expect(reports.length).toBe(1)
    })

    test('should report logical OR expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('||')))

      expect(reports.length).toBe(1)
    })

    test('should report nullish coalescing expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('??')))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting literal and identifier expressions', () => {
    test('should report numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(42)))

      expect(reports.length).toBe(1)
    })

    test('should report string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral('hello')))

      expect(reports.length).toBe(1)
    })

    test('should report boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createLiteral(true)))

      expect(reports.length).toBe(1)
    })

    test('should report identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createIdentifier('x')))

      expect(reports.length).toBe(1)
    })
  })

  describe('NOT reporting valid expressions with side effects', () => {
    test('should NOT report assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report compound assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('+=')))
      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('-=')))
      visitor.ExpressionStatement(createExpressionStatement(createAssignmentExpression('*=')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createCallExpression()))

      expect(reports.length).toBe(0)
    })

    test('should NOT report increment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUpdateExpression('++')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report decrement expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createUpdateExpression('--')))

      expect(reports.length).toBe(0)
    })

    test('should NOT report new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Class' },
      }
      visitor.ExpressionStatement(createExpressionStatement(newExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const awaitExpr = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }
      visitor.ExpressionStatement(createExpressionStatement(awaitExpr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const yieldExpr = {
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
      }
      visitor.ExpressionStatement(createExpressionStatement(yieldExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting nested expressions without side effects', () => {
    test('should report binary expression with literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createLiteral(1), createLiteral(2))
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })

    test('should report logical expression with identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression('&&')
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(1)
    })
  })

  describe('nested expressions with side effects', () => {
    test('should NOT report binary expression with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createBinaryExpression('+', createAssignmentExpression('='), createLiteral(1))
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })

    test('should NOT report logical expression with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const expr = createLogicalExpression('&&', createIdentifier('x'), createCallExpression())
      visitor.ExpressionStatement(createExpressionStatement(expr))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      expect(() => visitor.ExpressionStatement('string')).not.toThrow()
      expect(() => visitor.ExpressionStatement(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        expression: createBinaryExpression('+'),
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle null expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: null,
      }
      visitor.ExpressionStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

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
        getSource: () => 'x + 1',
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

      const visitor = noUnusedExpressionsRule.create(context)
      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention unused expression in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports[0].message).toContain('Unused expression')
    })

    test('should mention no effect in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))

      expect(reports[0].message).toContain('no effect')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+')))
      visitor.ExpressionStatement(createExpressionStatement(createLogicalExpression('&&')))

      expect(reports[0].message).toBe('Unused expression - this code has no effect')
      expect(reports[1].message).toBe('Unused expression - this code has no effect')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for unused expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedExpressionsRule.create(context)

      visitor.ExpressionStatement(createExpressionStatement(createBinaryExpression('+'), 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })
})
