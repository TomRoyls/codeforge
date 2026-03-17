import { describe, test, expect, vi } from 'vitest'
import { noExAssignRule } from '../../../../src/rules/patterns/no-ex-assign.js'
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
    getSource: () => 'try {} catch (e) { e = 1 }',
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

function createCatchClauseWithIdentifier(line = 1, column = 0, name = 'err'): unknown {
  const paramStartCol = column + 10
  const paramEndCol = paramStartCol + name.length
  const endCol = column + 20
  return {
    type: 'CatchClause',
    param: {
      type: 'Identifier',
      name,
      loc: {
        start: { line: line, column: paramStartCol },
        end: { line: line, column: paramEndCol },
      },
    },
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol },
    },
  }
}

function createCatchClauseWithPattern(line = 1, column = 0): unknown {
  const endCol = column + 20
  return {
    type: 'CatchClause',
    param: {
      type: 'ObjectPattern',
      properties: [],
    },
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol },
    },
  }
}

function createCatchClauseWithoutParam(line = 1, column = 0): unknown {
  const endCol = column + 20
  return {
    type: 'CatchClause',
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol },
    },
  }
}

function createAssignmentToCatchParam(line = 1, column = 0, name = 'err'): unknown {
  const endCol = column + name.length
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name,
      loc: { start: { line: line, column: column }, end: { line: line, column: endCol } },
    },
    right: {
      type: 'Literal',
      value: 1,
      loc: { start: { line: line, column: endCol + 2 }, end: { line: line, column: endCol + 3 } },
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol + 3 },
    },
  }
}

function createAssignmentToNonCatchParam(line = 1, column = 0, name = 'x'): unknown {
  const endCol = column + name.length
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name,
      loc: { start: { line: line, column: column }, end: { line: line, column: endCol } },
    },
    right: {
      type: 'Literal',
      value: 1,
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol + 2 },
    },
  }
}

function createCompoundAssignmentToCatchParam(line = 1, column = 0, name = 'err'): unknown {
  const endCol = column + name.length
  return {
    type: 'AssignmentExpression',
    operator: '+=',
    left: {
      type: 'Identifier',
      name,
      loc: { start: { line: line, column: column }, end: { line: line, column: endCol } },
    },
    right: {
      type: 'Literal',
      value: 1,
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol + 3 },
    },
  }
}

function createAssignmentToMemberExpression(line = 1, column = 0): unknown {
  const endCol = column + 15
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'err' },
      property: { type: 'Identifier', name: 'message' },
      computed: false,
    },
    right: {
      type: 'Literal',
      value: 'test',
    },
    loc: {
      start: { line: line, column: column },
      end: { line: line, column: endCol },
    },
  }
}

function createNonCatchClauseNode(): unknown {
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createCatchClauseWithNullParam(): unknown {
  return {
    type: 'CatchClause',
    param: null,
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createCatchClauseWithIdentifierWithoutLoc(): unknown {
  return {
    type: 'CatchClause',
    param: {
      type: 'Identifier',
      name: 'error',
    },
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-ex-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noExAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noExAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noExAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noExAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention reassigning in description', () => {
      expect(noExAssignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })

    test('should mention catch in description', () => {
      expect(noExAssignRule.meta.docs?.description.toLowerCase()).toContain('catch')
    })

    test('should have empty schema', () => {
      expect(noExAssignRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noExAssignRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CatchClause method', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(visitor).toHaveProperty('CatchClause')
    })

    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should return object with only CatchClause and AssignmentExpression methods', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['AssignmentExpression', 'CatchClause'])
    })
  })

  describe('tracking catch parameters', () => {
    test('should track catch parameter name', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))

      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(1, 5, 'error')),
      ).not.toThrow()
    })

    test('should track multiple different catch parameter names', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err1'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'err2'))

      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(1, 5, 'err1')),
      ).not.toThrow()
      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(1, 5, 'err2')),
      ).not.toThrow()
    })

    test('should not track non-Identifier parameters', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createCatchClauseWithPattern())).not.toThrow()
    })

    test('should handle catch clause without parameter', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createCatchClauseWithoutParam())).not.toThrow()
    })

    test('should track catch parameter with common name', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))

      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(1, 5, 'e')),
      ).not.toThrow()
    })
  })

  describe('detecting reassignment of catch parameters', () => {
    test('should report assignment to catch parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Do not reassign')
      expect(reports[0].message).toContain("'error'")
    })

    test('should not report assignment to non-catch parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'x'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment before catch clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentToCatchParam(1, 0, 'error'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'error'))

      expect(reports.length).toBe(0)
    })

    test('should report compound assignment to catch parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createCompoundAssignmentToCatchParam(2, 0, 'err'))

      expect(reports.length).toBe(1)
    })

    test('should not report assignment to member expression on catch param', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToMemberExpression(2, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(5, 10, 'e'))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report only once for same reassignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'error'))

      expect(reports.length).toBe(2)
    })

    test('should handle multiple catch clauses correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err1'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'err2'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'err1'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(4, 0, 'err2'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'err1'")
      expect(reports[1].message).toContain("'err2'")
    })
  })

  describe('edge cases', () => {
    test('should handle null CatchClause node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(null)).not.toThrow()
    })

    test('should handle undefined CatchClause node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(undefined)).not.toThrow()
    })

    test('should handle null AssignmentExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined AssignmentExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-CatchClause node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createNonCatchClauseNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with null param', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createCatchClauseWithNullParam())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment without left identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      const assignment = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(assignment)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      const assignment = {
        type: 'AssignmentExpression',
        operator: '=',
        right: { type: 'Literal', value: 1 },
      }

      expect(() => visitor.AssignmentExpression(assignment)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch clause identifier without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifierWithoutLoc())
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))

      expect(reports.length).toBe(1)
    })

    test('should handle assignment without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      const assignment = createAssignmentToCatchParam(2, 0, 'e') as Record<string, unknown>
      delete assignment.loc

      expect(() => visitor.AssignmentExpression(assignment)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node for CatchClause', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node for AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node for both methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause([])).not.toThrow()
      expect(() => visitor.AssignmentExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
