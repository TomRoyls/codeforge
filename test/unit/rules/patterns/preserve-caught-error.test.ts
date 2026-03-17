import { describe, test, expect, vi } from 'vitest'
import { preserveCaughtErrorRule } from '../../../../src/rules/patterns/preserve-caught-error.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'try { } catch (e) { }',
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

function createCatchClause(param: unknown, body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CatchClause',
    param,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: name.length },
    },
  }
}

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createExpressionStatement(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createReturnStatement(argument: unknown): unknown {
  return {
    type: 'ReturnStatement',
    argument,
  }
}

function createAssignmentExpression(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
  }
}

describe('preserve-caught-error rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(preserveCaughtErrorRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(preserveCaughtErrorRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(preserveCaughtErrorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preserveCaughtErrorRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention error in description', () => {
      expect(preserveCaughtErrorRule.meta.docs?.description.toLowerCase()).toContain('error')
    })

    test('should have empty schema', () => {
      expect(preserveCaughtErrorRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(preserveCaughtErrorRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CatchClause method', () => {
      const { context } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      expect(visitor).toHaveProperty('CatchClause')
      expect(typeof visitor.CatchClause).toBe('function')
    })
  })

  describe('detecting unused caught errors', () => {
    test('should report catch clause with unused error identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('error')
      expect(reports[0].message).toContain('not used')
    })

    test('should report catch clause with unused error variable named e', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('e')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('e')
    })

    test('should report catch clause with unused error variable named err', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('err')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('err')
    })

    test('should report catch clause with unused error variable in body with different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('otherVar'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body, 42, 10))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('not reporting valid catch clauses', () => {
    test('should not report catch clause with used error in expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createExpressionStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report catch clause with used error in call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('console.log'), [createIdentifier('error')]),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report catch clause with used error in return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([createReturnStatement(createIdentifier('error'))])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should not report catch clause with used error in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression(createIdentifier('savedError'), createIdentifier('error')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should report catch clause with used error in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([
        createExpressionStatement(
          createMemberExpression(createIdentifier('error'), createIdentifier('message')),
        ),
      ])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should not report catch clause without param', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const body = createBlockStatement([])
      const node = {
        type: 'CatchClause',
        body,
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention not used in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message.toLowerCase()).toContain('not used')
    })

    test('should mention error variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('myError')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain('myError')
    })

    test('should suggest catch without param syntax in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports[0].message).toContain('catch { }')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      expect(() => visitor.CatchClause(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      expect(() => visitor.CatchClause(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      expect(() => visitor.CatchClause('string')).not.toThrow()
      expect(() => visitor.CatchClause(123)).not.toThrow()
      expect(() => visitor.CatchClause(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        param: createIdentifier('error'),
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without param property', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: createIdentifier('error'),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      const node = createCatchClause(param, body)
      delete (node as Record<string, unknown>).loc
      visitor.CatchClause(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle catch clause with non-Identifier param', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'Literal', value: 'error' }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with null param', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: null,
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with undefined param', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: createIdentifier('error'),
        body: null,
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'CatchClause',
        param: createIdentifier('error'),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preserveCaughtErrorRule.create(context)

      const param = createIdentifier('error')
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle catch clause with incorrect type', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const node = {
        type: 'NotCatchClause',
        param: createIdentifier('error'),
        body: createBlockStatement([]),
      }
      visitor.CatchClause(node)

      expect(reports.length).toBe(0)
    })

    test('should handle param without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'Identifier' }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })

    test('should handle param with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = preserveCaughtErrorRule.create(context)

      const param = { type: 'Identifier', name: 123 as unknown as string }
      const body = createBlockStatement([])
      visitor.CatchClause(createCatchClause(param, body))

      expect(reports.length).toBe(1)
    })
  })
})
