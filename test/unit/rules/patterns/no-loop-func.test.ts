import { describe, test, expect, vi } from 'vitest'
import { noLoopFuncRule } from '../../../../src/rules/patterns/no-loop-func.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'for (;;) {}',
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
    config: { rules: { 'no-loop-func': ['error', options] } },
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

// Factory functions for creating AST nodes
function createForStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ForStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createForInStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ForInStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createForOfStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createWhileStatement(body: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createBlockStatement(body: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body,
  }
}

function createFunctionDeclaration(name = 'myFunc'): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createArrowFunctionExpression(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createIfStatement(consequent: unknown, alternate: unknown = null): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent,
    alternate,
  }
}

function createExpressionStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: { type: 'Literal', value: 1 },
  }
}

describe('no-loop-func rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noLoopFuncRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noLoopFuncRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noLoopFuncRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noLoopFuncRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noLoopFuncRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noLoopFuncRule.meta.fixable).toBeUndefined()
    })

    test('should mention loop in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('loop')
    })

    test('should mention function in description', () => {
      const desc = noLoopFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('function')
    })

    test('should have empty schema array', () => {
      expect(noLoopFuncRule.meta.schema).toEqual([])
    })

    test('should have documentation URL', () => {
      expect(noLoopFuncRule.meta.docs?.url).toBe('https://codeforge.dev/docs/rules/no-loop-func')
    })
  })

  describe('create', () => {
    test('should return visitor object with ForStatement method', () => {
      const { context } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForStatement')
    })

    test('should return visitor object with ForInStatement method', () => {
      const { context } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForInStatement')
    })

    test('should return visitor object with ForOfStatement method', () => {
      const { context } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('ForOfStatement')
    })

    test('should return visitor object with WhileStatement method', () => {
      const { context } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(visitor).toHaveProperty('WhileStatement')
    })
  })

  describe('detecting function declarations in ForStatement', () => {
    test('should report FunctionDeclaration inside for loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message).toContain('for loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside for loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside for loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report function in nested body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      // Function directly in body (not in BlockStatement)
      visitor.ForStatement(createForStatement(createFunctionDeclaration()))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in for loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting function declarations in ForInStatement', () => {
    test('should report FunctionDeclaration inside for-in loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in for-in loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports[0].message).toContain('for-in loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside for-in loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside for-in loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in for-in loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting function declarations in ForOfStatement', () => {
    test('should report FunctionDeclaration inside for-of loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in for-of loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports[0].message).toContain('for-of loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside for-of loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside for-of loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in for-of loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting function declarations in WhileStatement', () => {
    test('should report FunctionDeclaration inside while loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for FunctionDeclaration in while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports[0].message).toContain('while loop')
      expect(reports[0].message).toContain('function')
    })

    test('should report FunctionExpression inside while loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionExpression()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression inside while loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createArrowFunctionExpression()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should not report when no function in while loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createExpressionStatement()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(0)
    })
  })

  describe('nested function detection', () => {
    test('should detect function inside IfStatement consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createFunctionDeclaration())
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function inside IfStatement alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createExpressionStatement(), createFunctionDeclaration())
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function deeply nested in if-else chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      // if (...) { } else if (...) { function foo() {} }
      const nestedIf = createIfStatement(createFunctionDeclaration())
      const ifStmt = createIfStatement(createExpressionStatement(), nestedIf)
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should detect function in nested BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const innerBlock = createBlockStatement([createFunctionDeclaration()])
      const outerBlock = createBlockStatement([innerBlock])
      visitor.ForStatement(createForStatement(outerBlock))

      expect(reports.length).toBe(1)
    })

    test('should detect multiple functions in loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([
        createFunctionDeclaration('func1'),
        createFunctionDeclaration('func2'),
      ])
      visitor.ForStatement(createForStatement(body))

      // Still reports once per loop statement
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node for ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node for ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node for ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForStatement('string')).not.toThrow()
      expect(() => visitor.ForStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for ForInStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForInStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.ForOfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node for WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const node = { type: 'ForStatement' }
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const node = { type: 'ForStatement', body: null }
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined rule config', () => {
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
        getSource: () => 'for (;;) { function foo() {} }',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noLoopFuncRule.create(context)
      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(1)
    })

    test('should handle IfStatement with null alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const ifStmt = createIfStatement(createExpressionStatement(), null)
      const body = createBlockStatement([ifStmt])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle unknown node type in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([{ type: 'UnknownStatement' }])
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })

    test('should handle body as non-array in BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = { type: 'BlockStatement', body: 'not-an-array' }
      visitor.ForStatement(createForStatement(body))

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for ForStatement with function', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position for ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for ForInStatement with function', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body, 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for ForOfStatement with function', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body, 20, 12))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report correct location for WhileStatement with function', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body, 25, 3))

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('message quality', () => {
    test('should mention loop in ForStatement message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message).toContain('for loop')
    })

    test('should mention loop in ForInStatement message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForInStatement(createForInStatement(body))

      expect(reports[0].message).toContain('for-in loop')
    })

    test('should mention loop in ForOfStatement message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForOfStatement(createForOfStatement(body))

      expect(reports[0].message).toContain('for-of loop')
    })

    test('should mention loop in WhileStatement message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports[0].message).toContain('while loop')
    })

    test('should mention function in all messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(4)
      reports.forEach((report) => {
        expect(report.message).toContain('function')
      })
    })

    test('should mention moving function outside in messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))

      expect(reports[0].message.toLowerCase()).toContain('move')
    })

    test('should have unique messages for each loop type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      const messages = reports.map((r) => r.message)
      // All should be unique
      expect(new Set(messages).size).toBe(4)
    })
  })

  describe('multiple loop types in same context', () => {
    test('should report for all loop types independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const body = createBlockStatement([createFunctionDeclaration()])
      visitor.ForStatement(createForStatement(body))
      visitor.ForInStatement(createForInStatement(body))
      visitor.ForOfStatement(createForOfStatement(body))
      visitor.WhileStatement(createWhileStatement(body))

      expect(reports.length).toBe(4)
    })

    test('should only report for loops with functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noLoopFuncRule.create(context)

      const bodyWithFunction = createBlockStatement([createFunctionDeclaration()])
      const bodyWithoutFunction = createBlockStatement([createExpressionStatement()])

      visitor.ForStatement(createForStatement(bodyWithFunction))
      visitor.ForInStatement(createForStatement(bodyWithoutFunction))
      visitor.ForOfStatement(createForOfStatement(bodyWithFunction))
      visitor.WhileStatement(createWhileStatement(bodyWithoutFunction))

      expect(reports.length).toBe(2)
    })
  })
})
