import { describe, test, expect, vi } from 'vitest'
import { noFuncAssignRule } from '../../../../src/rules/patterns/no-func-assign.js'
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
    getSource: () => 'const foo = function() {};',
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

function createAssignmentExpression(right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name: 'MyFunc',
    },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createArrowFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createCallExpression(calleeName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: [],
  }
}

describe('no-func-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noFuncAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFuncAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFuncAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noFuncAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noFuncAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noFuncAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention function in description', () => {
      expect(noFuncAssignRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should mention reassigning in description', () => {
      expect(noFuncAssignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('reporting function assignment violations', () => {
    test('should report assignment with FunctionExpression on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should report assignment with ArrowFunctionExpression on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should report correct location for function assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 10, 5)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report appropriate error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })
  })

  describe('not reporting non-function assignments', () => {
    test('should not report assignment with Identifier on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('MyVar'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with Literal on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(42))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with CallExpression on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createCallExpression('getFunc'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const objectLiteral = {
        type: 'ObjectExpression',
        properties: [],
      }
      const node = createAssignmentExpression(objectLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const arrayLiteral = {
        type: 'ArrayExpression',
        elements: [],
      }
      const node = createAssignmentExpression(arrayLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with null', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(null))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(undefined))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(true))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral('hello'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle assignment without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(null)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: null,
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({})
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration (not Expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const functionDeclaration = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'MyFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(functionDeclaration)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash with malformed right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'InvalidType' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'Identifier',
          name: 'x',
        },
      }
      const node = createAssignmentExpression(arrowExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(arrowExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function with id', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'named' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(funcExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function with parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(funcExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should include function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('function')
    })

    test('should include reassigning in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('reassign')
    })

    test('should use clear error language', () => {
      const { context, reports } = createMockContext()
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })
  })
})
