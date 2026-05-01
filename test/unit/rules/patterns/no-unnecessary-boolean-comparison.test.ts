import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBooleanComparisonRule } from '../../../../src/rules/patterns/no-unnecessary-boolean-comparison.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'x === true',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeBinaryExpr(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  col = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(line, col, line, col + 10),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name, loc: makeLoc(1, 0, 1, name.length) }
}

function makeBooleanLiteral(value: boolean): unknown {
  return { type: 'BooleanLiteral', value, loc: makeLoc(1, 0, 1, String(value).length) }
}

describe('no-unnecessary-boolean-comparison rule', () => {

  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning boolean and comparison', () => {
      const desc = noUnnecessaryBooleanComparisonRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/boolean/)
      expect(desc).toMatch(/comparison/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-boolean-comparison',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBooleanComparisonRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBooleanComparisonRule).toBeDefined()
      expect(noUnnecessaryBooleanComparisonRule.meta).toBeDefined()
      expect(noUnnecessaryBooleanComparisonRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES: === true (4) =====
  describe('positive cases — === true', () => {
    test('reports x === true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports true === x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(true), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for === true suggests "Use the variable directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toContain('Use the variable directly')
    })

    test('message for === true contains "Unnecessary comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toContain('Unnecessary comparison')
    })
  })

  // ===== POSITIVE CASES: === false (4) =====
  describe('positive cases — === false', () => {
    test('reports x === false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports false === x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(false), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for === false suggests "Use negation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toContain('Use negation')
    })

    test('message for === false contains "!variable"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toContain('!variable')
    })
  })

  // ===== POSITIVE CASES: == true (3) =====
  describe('positive cases — == true', () => {
    test('reports x == true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports true == x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeBooleanLiteral(true), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for == true suggests "Use the variable directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toContain('Use the variable directly')
    })
  })

  // ===== POSITIVE CASES: == false (3) =====
  describe('positive cases — == false', () => {
    test('reports x == false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports false == x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeBooleanLiteral(false), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for == false suggests "Use negation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toContain('Use negation')
    })
  })

  // ===== POSITIVE CASES: !== true (4) =====
  describe('positive cases — !== true', () => {
    test('reports x !== true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports true !== x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeBooleanLiteral(true), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for !== true suggests "Use the negated variable directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toContain('Use the negated variable directly')
    })

    test('message for !== true does not suggest double negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).not.toContain('!!variable')
    })
  })

  // ===== POSITIVE CASES: !== false (4) =====
  describe('positive cases — !== false', () => {
    test('reports x !== false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports false !== x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeBooleanLiteral(false), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for !== false suggests "Use double negation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toContain('Use double negation')
    })

    test('message for !== false contains "!!variable"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toContain('!!variable')
    })
  })

  // ===== POSITIVE CASES: != true (3) =====
  describe('positive cases — != true', () => {
    test('reports x != true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports true != x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeBooleanLiteral(true), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for != true suggests "Use the negated variable directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toContain('Use the negated variable directly')
    })
  })

  // ===== POSITIVE CASES: != false (3) =====
  describe('positive cases — != false', () => {
    test('reports x != false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports false != x (boolean on left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeBooleanLiteral(false), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('message for != false suggests "Use double negation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toContain('Use double negation')
    })
  })

  // ===== REPORT PROPERTIES (5) =====
  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true), 5, 3))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('report message starts with "Unnecessary comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toMatch(/^Unnecessary comparison/)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('a'), makeBooleanLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('b'), makeBooleanLiteral(false)))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('c'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — NON-EQUALITY OPERATORS (7) =====
  describe('negative cases — non-equality operators', () => {
    test('does not report x < true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report x > false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report x <= true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<=', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report x >= false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>=', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report x + true (arithmetic)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(0)
    })

    test('does not report x - false (arithmetic)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(0)
    })

    test('does not report x * true (arithmetic)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NO BOOLEAN LITERAL (5) =====
  describe('negative cases — no boolean literal', () => {
    test('does not report x === y (no boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report x !== y (no boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report x === 1 (number literal, not boolean)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const numLiteral = { type: 'NumericLiteral', value: 1, loc: makeLoc(1, 0, 1, 1) }
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), numLiteral))
      expect(reports.length).toBe(0)
    })

    test('does not report x === "true" (string literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const strLiteral = { type: 'StringLiteral', value: 'true', loc: makeLoc(1, 0, 1, 6) }
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), strLiteral))
      expect(reports.length).toBe(0)
    })

    test('does not report x === null (null literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const nullLiteral = { type: 'NullLiteral', loc: makeLoc(1, 0, 1, 4) }
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), nullLiteral))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — WRONG NODE TYPE (6) =====
  describe('negative cases — wrong node type', () => {
    test('does not report Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = { type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'a' },
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'BooleanLiteral', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BooleanLiteral', value: true },
        alternate: { type: 'BooleanLiteral', value: false },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES — NULL/UNDEFINED/INVALID INPUTS (7) =====
  describe('edge cases — invalid inputs', () => {
    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles string primitive node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles number primitive node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles BinaryExpression with missing operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles BinaryExpression with missing left and right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES — SEPARATE VISITOR STATE (3) =====
  describe('edge cases — visitor state', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBooleanComparisonRule.create(ctx1)
      const visitor2 = noUnnecessaryBooleanComparisonRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      visitor2.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeIdentifier('y')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBooleanComparisonRule.create(context)
      const visitor2 = noUnnecessaryBooleanComparisonRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor accumulates reports correctly across mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('a'), makeBooleanLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdentifier('b'), makeBooleanLiteral(false)))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('c'), makeBooleanLiteral(false)))
      expect(reports.length).toBe(2)
    })
  })

  // ===== MESSAGE CONTENT VERIFICATION (6) =====
  describe('message content verification', () => {
    test('=== true message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use the variable directly (it is already a boolean).',
      )
    })

    test('=== false message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use negation (!variable) for clarity.',
      )
    })

    test('!== true message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use the negated variable directly.',
      )
    })

    test('!== false message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use double negation (!!variable) for clarity.',
      )
    })

    test('== true message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use the variable directly (it is already a boolean).',
      )
    })

    test('!= false message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use double negation (!!variable) for clarity.',
      )
    })
  })

  // ===== BOOLEAN ON LEFT SIDE — SPECIFIC BEHAVIORS (4) =====
  describe('boolean on left side', () => {
    test('true === x uses left side as booleanSide', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(true), makeIdentifier('x')))
      expect(reports[0].message).toContain('Use the variable directly')
    })

    test('false === x uses left side as booleanSide', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(false), makeIdentifier('x')))
      expect(reports[0].message).toContain('Use negation')
    })

    test('true !== x uses left side as booleanSide', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeBooleanLiteral(true), makeIdentifier('x')))
      expect(reports[0].message).toContain('Use the negated variable directly')
    })

    test('false !== x uses left side as booleanSide', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeBooleanLiteral(false), makeIdentifier('x')))
      expect(reports[0].message).toContain('Use double negation')
    })
  })

  // ===== NODE WITHOUT LOC (3) =====
  describe('node without loc', () => {
    test('reports even when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('uses default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('uses specific location when node has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
        loc: makeLoc(10, 5, 10, 15),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  // ===== ADDITIONAL COVERAGE (3) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBooleanComparisonRule.meta
      const meta2 = noUnnecessaryBooleanComparisonRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('all reports follow same message pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('a'), makeBooleanLiteral(true)))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('b'), makeBooleanLiteral(false)))
      for (const r of reports) {
        expect(r.message).toContain('Unnecessary comparison with boolean literal')
      }
    })

    test('handles node with extra properties without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10] as [number, number],
        extra: true,
        parent: {},
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
        loc: {},
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeIdentifier('x'),
        right: makeBooleanLiteral(true),
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('== false message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeBooleanLiteral(false)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use negation (!variable) for clarity.',
      )
    })

    test('!= true message is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeBooleanLiteral(true)))
      expect(reports[0].message).toBe(
        'Unnecessary comparison with boolean literal. Use the negated variable directly.',
      )
    })

    test('handles BinaryExpression with both sides as BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeBooleanLiteral(true), makeBooleanLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('does not report x === undefined (undefined literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const undefinedLiteral = { type: 'UndefinedLiteral', loc: makeLoc(1, 0, 1, 9) }
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), undefinedLiteral))
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression node type with boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanComparisonRule.create(context)
      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'BooleanLiteral', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
