import { describe, test, expect } from 'vitest'
import { noExAssignRule } from '../../../../src/rules/patterns/no-ex-assign.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(visitor).toHaveProperty('CatchClause')
    })

    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should return object with only CatchClause and AssignmentExpression methods', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['AssignmentExpression', 'CatchClause'])
    })
  })

  describe('tracking catch parameters', () => {
    test('should track catch parameter name', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))

      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(1, 5, 'error')),
      ).not.toThrow()
    })

    test('should track multiple different catch parameter names', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
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
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createCatchClauseWithPattern())).not.toThrow()
    })

    test('should handle catch clause without parameter', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createCatchClauseWithoutParam())).not.toThrow()
    })

    test('should track catch parameter with common name', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))

      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(1, 5, 'e')),
      ).not.toThrow()
    })
  })

  describe('detecting reassignment of catch parameters', () => {
    test('should report assignment to catch parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Do not reassign')
      expect(reports[0].message).toContain("'error'")
    })

    test('should not report assignment to non-catch parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'x'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment before catch clause', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentToCatchParam(1, 0, 'error'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'error'))

      expect(reports.length).toBe(0)
    })

    test('should report compound assignment to catch parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createCompoundAssignmentToCatchParam(2, 0, 'err'))

      expect(reports.length).toBe(1)
    })

    test('should not report assignment to member expression on catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToMemberExpression(2, 0))

      expect(reports.length).toBe(0)
    })

    test('should report correct location for reassignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(5, 10, 'e'))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report only once for same reassignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'error'))

      expect(reports.length).toBe(2)
    })

    test('should handle multiple catch clauses correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
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
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(null)).not.toThrow()
    })

    test('should handle undefined CatchClause node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(undefined)).not.toThrow()
    })

    test('should handle null AssignmentExpression node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined AssignmentExpression node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-CatchClause node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createNonCatchClauseNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with null param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(createCatchClauseWithNullParam())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment without left identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
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
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
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
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifierWithoutLoc())
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))

      expect(reports.length).toBe(1)
    })

    test('should handle assignment without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      const assignment = createAssignmentToCatchParam(2, 0, 'e') as Record<string, unknown>
      delete assignment.loc

      expect(() => visitor.AssignmentExpression(assignment)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node for CatchClause', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node for both methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)

      expect(() => visitor.CatchClause([])).not.toThrow()
      expect(() => visitor.AssignmentExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('various catch parameter names', () => {
    test('should detect reassignment of catch param named "e"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'e'")
    })

    test('should detect reassignment of catch param named "err"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'err'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'err'")
    })

    test('should detect reassignment of catch param named "error"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'error'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'error'")
    })

    test('should detect reassignment of catch param named "exception"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'exception'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'exception'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'exception'")
    })

    test('should detect reassignment of catch param named "ex"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'ex'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'ex'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'ex'")
    })

    test('should detect reassignment of catch param named "exc"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'exc'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'exc'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'exc'")
    })

    test('should detect reassignment of catch param with underscore prefix "_err"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, '_err'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, '_err'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'_err'")
    })

    test('should detect reassignment of catch param with dollar sign "$err"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, '$err'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, '$err'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'$err'")
    })

    test('should detect reassignment of single letter catch param "x"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'x'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'x'))
      expect(reports.length).toBe(1)
    })

    test('should detect reassignment of long descriptive catch param name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'caughtNetworkException'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'caughtNetworkException'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'caughtNetworkException'")
    })
  })

  describe('assignment operators', () => {
    test('should report = assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should report += assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createCompoundAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should report -= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '-=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 4 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report *= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '*=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 4 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report /= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '/=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 4 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report %= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '%=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 4 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report <<= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '<<=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report >>= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '>>=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report >>>= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '>>>=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report &= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '&=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 0xff },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report |= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '|=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 0x0f },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ^= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '^=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 0x01 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report **= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '**=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report &&= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '&&=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ||= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '||=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ??= assignment to catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '??=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('various non-identifier left-hand sides', () => {
    test('should not report assignment to MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToMemberExpression(2, 0))
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to computed member expression err["msg"]', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'err' },
          property: { type: 'Literal', value: 'msg' },
          computed: true,
        },
        right: { type: 'Literal', value: 'test' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ObjectPattern', properties: [] },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ArrayPattern', elements: [] },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report assignment when left is CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        right: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when left is missing entirely', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        right: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('multiple catch clauses and scoping', () => {
    test('should track three separate catch clauses', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'a'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'b'))
      visitor.CatchClause(createCatchClauseWithIdentifier(3, 0, 'c'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(4, 0, 'a'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(5, 0, 'b'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(6, 0, 'c'))
      expect(reports.length).toBe(3)
    })

    test('should track reused catch parameter name in nested catches', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should not confuse variables with same name outside catch', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentToCatchParam(1, 0, 'x'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'x'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'x'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'x'")
    })

    test('should handle interleaved catch clauses and assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e1'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e1'))
      visitor.CatchClause(createCatchClauseWithIdentifier(3, 0, 'e2'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(4, 0, 'e2'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'e1'")
      expect(reports[1].message).toContain("'e2'")
    })

    test('should handle five catch params with selective assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'p1'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'p2'))
      visitor.CatchClause(createCatchClauseWithIdentifier(3, 0, 'p3'))
      visitor.CatchClause(createCatchClauseWithIdentifier(4, 0, 'p4'))
      visitor.CatchClause(createCatchClauseWithIdentifier(5, 0, 'p5'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(10, 0, 'p2'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(11, 0, 'p4'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'p2'")
      expect(reports[1].message).toContain("'p4'")
    })

    test('should handle assignment to variable matching unrelated catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'myErr'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'otherVar'))
      expect(reports.length).toBe(0)
    })

    test('should not report assignment to different name that looks similar', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'error'))
      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for catch param names', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'Err'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'Err'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'Err'")
    })
  })

  describe('location reporting', () => {
    test('should report start line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(1, 0, 'e'))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report start line 10 column 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(10, 5, 'e'))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report start line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(100, 50, 'e'))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from assignment node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 4, 'err'))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('should report location for each of multiple reassignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(5, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(10, 2, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(15, 4, 'e'))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[2].loc?.start.line).toBe(15)
      expect(reports[1].loc?.start.column).toBe(2)
      expect(reports[2].loc?.start.column).toBe(4)
    })
  })

  describe('message format', () => {
    test('should include param name in message with single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'myError'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'myError'))
      expect(reports[0].message).toBe("Do not reassign the catch parameter 'myError'.")
    })

    test('should include "Do not reassign" prefix in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports[0].message).toContain('Do not reassign')
    })

    test('should include "catch parameter" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports[0].message).toContain('catch parameter')
    })

    test('should have correct message for short param name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports[0].message).toBe("Do not reassign the catch parameter 'e'.")
    })

    test('should have correct message for long param name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'caughtError'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'caughtError'))
      expect(reports[0].message).toBe("Do not reassign the catch parameter 'caughtError'.")
    })
  })

  describe('catch clause param types', () => {
    test('should not report for ObjectPattern catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithPattern())
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'x'))
      expect(reports.length).toBe(0)
    })

    test('should not report for ArrayPattern catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: {
          type: 'ArrayPattern',
          elements: [],
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'x'))
      expect(reports.length).toBe(0)
    })

    test('should not report for null catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithNullParam())
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should not report for missing catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithoutParam())
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should track Identifier catch param but not ObjectPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'idErr'))
      visitor.CatchClause(createCatchClauseWithPattern())
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'idErr'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'idErr'")
    })

    test('should not crash with RestElement catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: {
          type: 'RestElement',
          argument: { type: 'Identifier', name: 'args' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'args'))
      expect(reports.length).toBe(0)
    })

    test('should not crash with AssignmentPattern catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: {
          type: 'AssignmentPattern',
          left: { type: 'Identifier', name: 'e' },
          right: { type: 'Literal', value: null },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(0)
    })
  })

  describe('malformed and unusual AST nodes', () => {
    test('should handle boolean node for CatchClause', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause(true)).not.toThrow()
    })

    test('should handle boolean node for AssignmentExpression', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(false)).not.toThrow()
    })

    test('should handle number node for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object for CatchClause', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CatchClause with wrong type but valid param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'FunctionDeclaration',
        param: { type: 'Identifier', name: 'e' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'e' },
        right: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle CatchClause param with numeric name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 123 },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, '123')),
      ).not.toThrow()
    })

    test('should handle AssignmentExpression left with numeric name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 999 },
        right: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle CatchClause with undefined param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: undefined,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should handle node with null prototype', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      const node = Object.create(null)
      node.type = 'CatchClause'
      node.param = { type: 'Identifier', name: 'e' }
      node.body = { type: 'BlockStatement', body: [] }
      expect(() => visitor.CatchClause(node)).not.toThrow()
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should handle CatchClause where param.name is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(() =>
        visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'undefined')),
      ).not.toThrow()
    })

    test('should handle AssignmentExpression where left.name is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle Date object as CatchClause node', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause(new Date())).not.toThrow()
    })

    test('should handle RegExp object as AssignmentExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.AssignmentExpression(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle nested object as CatchClause', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      const deep = {
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'deep' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CatchClause(deep)).not.toThrow()
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'deep'))
      expect(reports.length).toBe(1)
    })
  })

  describe('repeated operations', () => {
    test('should report on each of ten reassignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(createAssignmentToCatchParam(i + 2, 0, 'e'))
      }
      expect(reports.length).toBe(10)
    })

    test('should report on 20 consecutive reassignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      for (let i = 0; i < 20; i++) {
        visitor.AssignmentExpression(createAssignmentToCatchParam(i + 2, 0, 'err'))
      }
      expect(reports.length).toBe(20)
    })

    test('should track catch param after many assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      for (let i = 0; i < 50; i++) {
        visitor.AssignmentExpression(createAssignmentToNonCatchParam(i + 2, 0, 'x'))
      }
      visitor.AssignmentExpression(createAssignmentToCatchParam(53, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should handle registering same catch param name twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.CatchClause(createCatchClauseWithIdentifier(2, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should handle many different catch params', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      const names = ['a', 'b', 'c', 'd', 'ee', 'ff', 'gg', 'hh']
      names.forEach((name, i) => {
        visitor.CatchClause(createCatchClauseWithIdentifier(i + 1, 0, name))
      })
      names.forEach((name, i) => {
        visitor.AssignmentExpression(createAssignmentToCatchParam(names.length + i + 1, 0, name))
      })
      expect(reports.length).toBe(names.length)
    })

    test('should handle alternating catch and assignment calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'a1'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'a1'))
      visitor.CatchClause(createCatchClauseWithIdentifier(3, 0, 'b1'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(4, 0, 'b1'))
      visitor.CatchClause(createCatchClauseWithIdentifier(5, 0, 'c1'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(6, 0, 'c1'))
      expect(reports.length).toBe(3)
    })
  })

  describe('independent visitor instances', () => {
    test('should have separate state per visitor instance', () => {
      const ctx1 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const ctx2 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor1 = noExAssignRule.create(ctx1.context)
      const visitor2 = noExAssignRule.create(ctx2.context)

      visitor1.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err1'))
      visitor2.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err2'))

      visitor1.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'err1'))
      visitor2.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'err2'))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
      expect(ctx1.reports[0].message).toContain("'err1'")
      expect(ctx2.reports[0].message).toContain("'err2'")
    })

    test('visitor1 should not detect param tracked by visitor2', () => {
      const ctx1 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const ctx2 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor1 = noExAssignRule.create(ctx1.context)
      const visitor2 = noExAssignRule.create(ctx2.context)

      visitor2.CatchClause(createCatchClauseWithIdentifier(1, 0, 'exclusive'))
      visitor1.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'exclusive'))

      expect(ctx1.reports.length).toBe(0)
      expect(ctx2.reports.length).toBe(0)
    })

    test('three independent visitors should not interfere', () => {
      const ctx1 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const ctx2 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const ctx3 = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const v1 = noExAssignRule.create(ctx1.context)
      const v2 = noExAssignRule.create(ctx2.context)
      const v3 = noExAssignRule.create(ctx3.context)

      v1.CatchClause(createCatchClauseWithIdentifier(1, 0, 'alpha'))
      v2.CatchClause(createCatchClauseWithIdentifier(1, 0, 'beta'))
      v3.CatchClause(createCatchClauseWithIdentifier(1, 0, 'gamma'))

      v1.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'alpha'))
      v2.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'beta'))
      v3.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'gamma'))

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
      expect(ctx3.reports.length).toBe(1)
      expect(ctx1.reports[0].message).toContain("'alpha'")
      expect(ctx2.reports[0].message).toContain("'beta'")
      expect(ctx3.reports[0].message).toContain("'gamma'")
    })
  })

  describe('no false positives for similar patterns', () => {
    test('should not report UpdateExpression on catch param', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'err' },
        prefix: false,
      })
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'err' },
        right: { type: 'Literal', value: null },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for catch param used in conditional', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'err' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for assignment to non-tracked similar name err2', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'err2'))
      expect(reports.length).toBe(0)
    })

    test('should not report for assignment to myErr when tracking err', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'myErr'))
      expect(reports.length).toBe(0)
    })

    test('should not report for error_ when tracking error', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'error_'))
      expect(reports.length).toBe(0)
    })

    test('should not report for Error (capitalized) when tracking error (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'error'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'Error'))
      expect(reports.length).toBe(0)
    })

    test('should not report for arr when tracking err', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'arr'))
      expect(reports.length).toBe(0)
    })
  })

  describe('destructured catch parameters', () => {
    test('should not track ObjectPattern with property named same as assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'message' },
              value: { type: 'Identifier', name: 'msg' },
            },
          ],
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'msg'))
      expect(reports.length).toBe(0)
    })

    test('should not track ArrayPattern with element', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: {
          type: 'ArrayPattern',
          elements: [{ type: 'Identifier', name: 'first' }],
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'first'))
      expect(reports.length).toBe(0)
    })
  })

  describe('catch clause body variations', () => {
    test('should handle catch with empty block body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should handle catch clause with guard/body as non-block', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e' },
        body: { type: 'ExpressionStatement', expression: { type: 'Literal', value: 0 } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })
  })

  describe('loc variations on report', () => {
    test('should produce report with loc having both start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 5, 'e'))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toEqual({ line: 3, column: 5 })
      expect(reports[0].loc?.end).toEqual({ line: 3, column: 9 })
    })

    test('should use default loc when assignment has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      const assignment = createAssignmentToCatchParam(2, 0, 'e') as Record<string, unknown>
      delete assignment.loc
      visitor.AssignmentExpression(assignment)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default loc when loc.start is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'e' },
        right: { type: 'Literal', value: 1 },
        loc: {},
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with string line numbers gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'e' },
        right: { type: 'Literal', value: 1 },
        loc: {
          start: { line: '5', column: '10' },
          end: { line: '5', column: '11' },
        },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('combined catch and assignment scenarios', () => {
    test('should report when catch param is reassigned via compound operator after value usage', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'ex'))
      visitor.AssignmentExpression(createCompoundAssignmentToCatchParam(3, 0, 'ex'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'ex'")
    })

    test('should report when catch param is reassigned via simple = after member access', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToMemberExpression(2, 0))
      visitor.AssignmentExpression(createAssignmentToCatchParam(3, 0, 'err'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'err'")
    })

    test('should handle catch followed by many non-matching assignments then one match', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'target'))
      for (let i = 0; i < 15; i++) {
        visitor.AssignmentExpression(createAssignmentToNonCatchParam(i + 2, 0, `other${i}`))
      }
      visitor.AssignmentExpression(createAssignmentToCatchParam(18, 0, 'target'))
      expect(reports.length).toBe(1)
    })

    test('should correctly handle shadowing with same name from different catch', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      visitor.CatchClause(createCatchClauseWithIdentifier(3, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(4, 0, 'e'))
      expect(reports.length).toBe(2)
    })

    test('should handle catch with no param then assignment to same name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithoutParam())
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should handle catch param named like JS built-in (undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'undefined'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'undefined'))
      expect(reports.length).toBe(1)
    })

    test('should handle catch param named like JS built-in (NaN)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'NaN'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'NaN'))
      expect(reports.length).toBe(1)
    })

    test('should handle catch param named like JS built-in (Infinity)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'Infinity'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'Infinity'))
      expect(reports.length).toBe(1)
    })

    test('should handle catch param with unicode name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err\u00F1'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'err\u00F1'))
      expect(reports.length).toBe(1)
    })

    test('should handle catch param that is a keyword-like name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'catch'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'catch'))
      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor shape', () => {
    test('should always include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should include loc in report when assignment has loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should produce loc with correct structure', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 4, 'e'))
      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toHaveProperty('line')
      expect(loc?.start).toHaveProperty('column')
      expect(loc?.end).toHaveProperty('line')
      expect(loc?.end).toHaveProperty('column')
    })
  })

  describe('context interaction', () => {
    test('should call context.report exactly once for one reassignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should not call context.report when no catch clause visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.AssignmentExpression(createAssignmentToCatchParam(1, 0, 'e'))
      expect(reports.length).toBe(0)
    })

    test('should not call context.report for non-matching assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'x'))
      expect(reports.length).toBe(0)
    })

    test('should work correctly when getFilePath returns different paths', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should work correctly when getSource returns different content', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'console.log("hello")',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })
  })

  describe('return value structure', () => {
    test('CatchClause visitor should be a function', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(typeof visitor.CatchClause).toBe('function')
    })

    test('AssignmentExpression visitor should be a function', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('create should return a non-null object', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })

    test('visitor should have exactly 2 keys', () => {
      const { context } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(Object.keys(visitor).length).toBe(2)
    })
  })

  describe('deeply nested/malformed structures', () => {
    test('should handle AssignmentExpression where left is an empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {},
        right: { type: 'Literal', value: 1 },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle catch param where name is empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, ''))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, ''))
      expect(reports.length).toBe(1)
    })

    test('should handle assignment where name is empty string and catch param is not', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, ''))
      expect(reports.length).toBe(0)
    })

    test('should handle node with circular reference without crashing', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      const circular: Record<string, unknown> = { type: 'CatchClause' }
      circular.self = circular
      circular.param = { type: 'Identifier', name: 'e' }
      circular.body = { type: 'BlockStatement', body: [] }
      circular.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }
      expect(() => visitor.CatchClause(circular)).not.toThrow()
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should handle frozen object as CatchClause node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      const node = Object.freeze({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'frozen' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(() => visitor.CatchClause(node)).not.toThrow()
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'frozen'))
      expect(reports.length).toBe(1)
    })

    test('should handle sealed object as AssignmentExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      const assignment = Object.seal(createAssignmentToCatchParam(2, 0, 'e'))
      visitor.AssignmentExpression(assignment)
      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with extra unexpected properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'e', extra: true, meta: { foo: 'bar' } },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
        extraProp: 'should be ignored',
      })
      expect(reports.length).toBe(1)
    })

    test('should handle CatchClause with extra unexpected properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: { type: 'Identifier', name: 'e', extra: true },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        guard: null,
        handler: null,
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'e'))
      expect(reports.length).toBe(1)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Map object as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle WeakRef as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      const ref = new WeakRef({ type: 'CatchClause' })
      expect(() => visitor.CatchClause(ref)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Promise as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      expect(() => visitor.CatchClause(Promise.resolve({}))).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('rule meta consistency', () => {
    test('meta.type should be one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noExAssignRule.meta.type)
    })

    test('meta.severity should be one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(noExAssignRule.meta.severity)
    })

    test('meta.docs should be defined', () => {
      expect(noExAssignRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noExAssignRule.meta.docs?.description).toBe('string')
      expect(noExAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta should not have deprecated set to true', () => {
      expect(noExAssignRule.meta.deprecated).toBeFalsy()
    })

    test('meta should not have replacedBy', () => {
      expect(noExAssignRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noExAssignRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta.docs.url should be undefined or a string', () => {
      if (noExAssignRule.meta.docs?.url !== undefined) {
        expect(typeof noExAssignRule.meta.docs?.url).toBe('string')
      }
    })
  })

  describe('additional real-world patterns', () => {
    test('should not report for variable declared inside catch block', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'localVar'))
      expect(reports.length).toBe(0)
    })

    test('should detect reassignment when catch param is "catchErr"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'catchErr'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'catchErr'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'catchErr'")
    })

    test('should detect reassignment when catch param is "result"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'result'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'result'))
      expect(reports.length).toBe(1)
    })

    test('should detect reassignment when catch param is "data"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'data'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'data'))
      expect(reports.length).toBe(1)
    })

    test('should not report member assignment err.stack = "test"', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'err' },
          property: { type: 'Identifier', name: 'stack' },
          computed: false,
        },
        right: { type: 'Literal', value: 'test' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report err.message += " extra" member compound assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'err' },
          property: { type: 'Identifier', name: 'message' },
          computed: false,
        },
        right: { type: 'Literal', value: ' extra' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should report err = undefined explicit undefined assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'err',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
        },
        right: { type: 'Identifier', name: 'undefined' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 14 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report err = null assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'err',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
        },
        right: { type: 'Literal', value: null },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report err = err + 1 self-referential assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'err',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
        },
        right: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'err' },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should not report assignment in catch block to outer variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'outerVar'))
      expect(reports.length).toBe(0)
    })

    test('should not report for catch param named same as global', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'console'))
      visitor.AssignmentExpression(createAssignmentToNonCatchParam(2, 0, 'other'))
      expect(reports.length).toBe(0)
    })

    test('should report when catch param reassigned with ternary right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: {
          type: 'ConditionalExpression',
          test: { type: 'Literal', value: true },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should not report for logical expression (not assignment)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'err' },
        right: { type: 'Literal', value: 'default' },
      })
      expect(reports.length).toBe(0)
    })

    test('should report when catch param name is "w" (single uncommon letter)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'w'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'w'))
      expect(reports.length).toBe(1)
    })

    test('should report when catch param name is "z" (single uncommon letter)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'z'))
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'z'))
      expect(reports.length).toBe(1)
    })

    test('should handle 30 non-matching assignments before a match', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'needle'))
      for (let i = 0; i < 30; i++) {
        visitor.AssignmentExpression(createAssignmentToNonCatchParam(i + 2, 0, `haystack${i}`))
      }
      visitor.AssignmentExpression(createAssignmentToCatchParam(33, 0, 'needle'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'needle'")
    })

    test('should handle catch with deeply nested param structure gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause({
        type: 'CatchClause',
        param: {
          type: 'ObjectPattern',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'message' },
              value: {
                type: 'AssignmentPattern',
                left: { type: 'Identifier', name: 'msg' },
                right: { type: 'Literal', value: '' },
              },
            },
          ],
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor.AssignmentExpression(createAssignmentToCatchParam(2, 0, 'msg'))
      expect(reports.length).toBe(0)
    })

    test('should not report for chained member expression err.a.b.c = 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'err' },
              property: { type: 'Identifier', name: 'a' },
              computed: false,
            },
            property: { type: 'Identifier', name: 'b' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'c' },
          computed: false,
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for assignment to window.err when tracking err', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'err' },
          computed: false,
        },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should report catch param reassignment with function as right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report catch param reassignment with arrow function as right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'e'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'e',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
        },
        right: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report catch param reassignment with object as right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} catch (e) { e = 1 }' })
      const visitor = noExAssignRule.create(context)
      visitor.CatchClause(createCatchClauseWithIdentifier(1, 0, 'err'))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'err',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 3 } },
        },
        right: { type: 'ObjectExpression', properties: [] },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
      })
      expect(reports.length).toBe(1)
    })
  })
})
