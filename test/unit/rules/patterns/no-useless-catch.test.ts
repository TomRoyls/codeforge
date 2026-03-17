import { describe, test, expect, vi } from 'vitest'
import { noUselessCatchRule } from '../../../../src/rules/patterns/no-useless-catch.js'
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
    getSource: () => 'try {} catch (e) { throw e }',
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

function createThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'Identifier',
      name: 'e',
    },
    loc: {
      start: { line, column },
      end: { line, column: 8 },
    },
  }
}

function createBlockStatement(statements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createCatchClause(body: unknown, param = 'e', line = 1, column = 0): unknown {
  return {
    type: 'CatchClause',
    param: {
      type: 'Identifier',
      name: param,
    },
    body,
    loc: {
      start: { line, column },
      end: { line, column: 25 },
    },
  }
}

function createTryStatement(
  handler: unknown,
  finalizer: unknown = null,
  line = 1,
  column = 0,
): unknown {
  const node: Record<string, unknown> = {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 30 },
    },
  }

  if (handler) {
    node.handler = handler
  }

  if (finalizer) {
    node.finalizer = finalizer
  }

  return node
}

function createExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Identifier',
      name: 'console',
    },
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createVariableDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: [],
    kind: 'const',
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createIfStatement(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'Identifier',
      name: 'e',
    },
    consequent: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createBlockStatementWithEmptyArray(line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line, column },
      end: { line, column: 2 },
    },
  }
}

describe('no-useless-catch rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessCatchRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessCatchRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessCatchRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessCatchRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention catch in description', () => {
      expect(noUselessCatchRule.meta.docs?.description.toLowerCase()).toContain('catch')
    })

    test('should mention useless in description', () => {
      expect(noUselessCatchRule.meta.docs?.description.toLowerCase()).toContain('useless')
    })

    test('should have empty schema', () => {
      expect(noUselessCatchRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUselessCatchRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with TryStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(visitor).toHaveProperty('TryStatement')
    })

    test('TryStatement should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(typeof visitor.TryStatement).toBe('function')
    })

    test('should return object with only TryStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['TryStatement'])
    })
  })

  describe('valid cases', () => {
    test('should not report catch with multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement(), createExpressionStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with non-throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createExpressionStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createVariableDeclaration()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createIfStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report try without catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const node = createTryStatement(null)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report try with only finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const finallyBlock = createBlockStatement([])
      const node = createTryStatement(null, finallyBlock)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatementWithEmptyArray()
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with throw that is not the only statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createExpressionStatement(), createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with nested block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const nestedBlock = createBlockStatement([createThrowStatement()])
      const catchBody = createBlockStatement([nestedBlock])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with try-finally inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([
        createExpressionStatement(),
        createVariableDeclaration(),
      ])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report catch with different parameter name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody, 'error')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless catch clause')
    })

    test('should not report identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const node = createIdentifier('x')
      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report catch with single throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless catch clause')
    })

    test('should report catch that only rethrows the error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(1, 0)
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rethrows')
    })

    test('should report correct location for useless catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(1, 0)
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody, 'e', 5, 10)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report catch with single throw that throws different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Identifier', name: 'err' },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody, 'e')
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rethrows')
    })

    test('should report catch with single throw that throws new error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
        },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rethrows')
    })

    test('should report catch with finally block present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const finallyBlock = createBlockStatement([])
      const node = createTryStatement(handler, finallyBlock)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple useless catches', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const catchBody = createBlockStatement([createThrowStatement()])
      const handler = createCatchClause(catchBody)

      const node1 = createTryStatement(handler)
      const node2 = createTryStatement(handler)

      visitor.TryStatement(node1)
      visitor.TryStatement(node2)

      expect(reports.length).toBe(2)
    })

    test('should report catch with single throw that throws literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
      }
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody)
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with no parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = {
        type: 'CatchClause',
        param: null,
        body: catchBody,
      }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report catch with single throw statement in different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement(10, 5)
      const catchBody = createBlockStatement([throwStmt], 10, 0)
      const handler = createCatchClause(catchBody, 'e', 10, 0)
      const node = createTryStatement(handler, null, 10, 0)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const node = { handler: {} }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without handler property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'TryStatement' }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause' }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const handler = { type: 'CatchClause', body: null }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body without body array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement' }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-TryStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'Identifier', name: 'x' }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      expect(() => visitor.TryStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body array with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement', body: [null, null] }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle body array with undefined elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement', body: [undefined, undefined] }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch with non-object handler', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const node = { type: 'TryStatement', handler: 'string' }
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle handler without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = createCatchClause(catchBody) as Record<string, unknown>
      delete handler.loc

      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle body with statement without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const body = { type: 'BlockStatement', body: [{ notAStatement: true }] }
      const handler = { type: 'CatchClause', body }
      const node = createTryStatement(handler)
      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch with param as non-Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessCatchRule.create(context)

      const throwStmt = createThrowStatement()
      const catchBody = createBlockStatement([throwStmt])
      const handler = {
        type: 'CatchClause',
        param: { type: 'ObjectPattern', properties: [] },
        body: catchBody,
      }
      const node = createTryStatement(handler)
      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })
})
