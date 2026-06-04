import { describe, expect, test, vi } from 'vitest'
import { noMisleadingAssertionRule } from '../../../../src/rules/correctness/no-misleading-assertion.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

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
    getSource: () => 'assertTrue(true)',
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

function makeCallExpr(calleeName: string, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(line, column, line, column + 20),
  }
}

function makeBoolLiteral(value: boolean, line = 1, column = 0): unknown {
  return {
    type: 'BooleanLiteral',
    value,
    loc: makeLoc(line, column, line, column + String(value).length),
  }
}

function makeStringLiteral(value: string, line = 1, column = 0): unknown {
  return {
    type: 'StringLiteral',
    value,
    loc: makeLoc(line, column, line, column + value.length + 2),
  }
}

function makeNumericLiteral(value: number, line = 1, column = 0): unknown {
  return {
    type: 'NumericLiteral',
    value,
    loc: makeLoc(line, column, line, column + String(value).length),
  }
}

describe('no-misleading-assertion rule', () => {

  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noMisleadingAssertionRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noMisleadingAssertionRule.meta.severity).toBe('error')
    })

    test('should have correct category "correctness"', () => {
      expect(noMisleadingAssertionRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noMisleadingAssertionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noMisleadingAssertionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning misleading', () => {
      const desc = noMisleadingAssertionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/misleading/)
    })

    test('should have correct docs URL', () => {
      expect(noMisleadingAssertionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-misleading-assertion',
      )
    })

    test('should have empty schema', () => {
      expect(noMisleadingAssertionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMisleadingAssertionRule).toBeDefined()
      expect(noMisleadingAssertionRule.meta).toBeDefined()
      expect(noMisleadingAssertionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES: BooleanLiteral true (10) =====
  describe('positive cases — BooleanLiteral true', () => {
    test('reports assertTrue(true) as always true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('reports assert(true) as always true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assert', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('reports expect(true) as always true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('expect', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('reports assertThat(true) as always true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertThat', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always true')
    })

    test('true report message mentions literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      expect(reports[0].message).toContain('literal `true`')
    })

    test('true report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('true report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      expect(reports[0].node).toBeDefined()
    })

    test('true report node matches original CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      const node = makeCallExpr('assertTrue', [makeBoolLiteral(true)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('true report loc has correct start line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)], 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('true report loc has correct end line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)], 3, 4))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24)
    })
  })

  // ===== POSITIVE CASES: BooleanLiteral false (7) =====
  describe('positive cases — BooleanLiteral false', () => {
    test('reports assertTrue(false) as always false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(false)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('reports assert(false) as always false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assert', [makeBoolLiteral(false)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('reports expect(false) as always false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('expect', [makeBoolLiteral(false)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('reports assertThat(false) as always false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertThat', [makeBoolLiteral(false)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always false')
    })

    test('false report message mentions literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(false)]))
      expect(reports[0].message).toContain('literal `false`')
    })

    test('false report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(false)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('false report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(false)]))
      expect(reports[0].node).toBeDefined()
    })
  })

  // ===== POSITIVE CASES: StringLiteral empty (7) =====
  describe('positive cases — empty StringLiteral', () => {
    test('reports assertTrue("") as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('reports assert("") as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assert', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('reports expect("") as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('expect', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('reports assertThat("") as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertThat', [makeStringLiteral('')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('empty string report mentions empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('')]))
      expect(reports[0].message).toContain('empty string')
    })

    test('empty string report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('empty string report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('')]))
      expect(reports[0].node).toBeDefined()
    })
  })

  // ===== POSITIVE CASES: NumericLiteral 0 (7) =====
  describe('positive cases — NumericLiteral 0', () => {
    test('reports assertTrue(0) as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('reports assert(0) as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assert', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('reports expect(0) as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('expect', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('reports assertThat(0) as always falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertThat', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('zero report mentions literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(0)]))
      expect(reports[0].message).toContain('literal `0`')
    })

    test('zero report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('zero report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(0)]))
      expect(reports[0].node).toBeDefined()
    })
  })

  // ===== NEGATIVE CASES: Wrong callee names (5) =====
  describe('negative cases — non-assertion callee names', () => {
    test('does not report console.log(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('console.log', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(0)
    })

    test('does not report verify(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('verify', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(0)
    })

    test('does not report check(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('check', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(0)
    })

    test('does not report require(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('require', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(0)
    })

    test('does not report should(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('should', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES: Valid arguments (8) =====
  describe('negative cases — valid argument values', () => {
    test('does not report assertTrue with non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report assertTrue with positive number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report assertTrue with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report assertTrue with decimal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(3.14)]))
      expect(reports.length).toBe(0)
    })

    test('does not report assert with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assert', [{ type: 'Identifier', name: 'condition' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report expect with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('expect', [makeCallExpr('getValue', [])]))
      expect(reports.length).toBe(0)
    })

    test('does not report assertThat with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertThat', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report assertTrue with number 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES: Malformed nodes (8) =====
  describe('negative cases — malformed nodes', () => {
    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('handles node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assertTrue' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', []))
      expect(reports.length).toBe(0)
    })

    test('handles callee that is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'assert' }, property: { type: 'Identifier', name: 'true' } },
        arguments: [makeBoolLiteral(true)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES: Other AST node types as first arg (6) =====
  describe('negative cases — other argument types', () => {
    test('does not report BinaryExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report ArrayExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{
        type: 'ArrayExpression',
        elements: [],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report ObjectExpression as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{
        type: 'ObjectExpression',
        properties: [],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Literal as first arg (wrong type name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{
        type: 'Literal',
        value: true,
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral as first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisleadingAssertionRule.create(ctx1)
      const visitor2 = noMisleadingAssertionRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      visitor2.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(42)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('assert', [makeBoolLiteral(false)]))
      visitor.CallExpression(makeCallExpr('expect', [makeStringLiteral('')]))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assertTrue' },
        arguments: [makeBoolLiteral(true)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assertTrue' },
        arguments: [makeBoolLiteral(true)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMisleadingAssertionRule.create(context)
      const visitor2 = noMisleadingAssertionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid and invalid reports count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(42)]))
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('ok')]))
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(false)]))
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      expect(reports.length).toBe(3)
    })

    test('BooleanLiteral with undefined value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'BooleanLiteral', value: undefined }]))
      expect(reports.length).toBe(0)
    })

    test('StringLiteral with non-empty string does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('non-empty')]))
      expect(reports.length).toBe(0)
    })

    test('NumericLiteral with non-zero does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(99)]))
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)], 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assertTrue' },
        arguments: [makeBoolLiteral(true)],
        extra: { parenthesized: true },
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('rule meta is the same reference across accesses', () => {
      const meta1 = noMisleadingAssertionRule.meta
      const meta2 = noMisleadingAssertionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message consistency across all assertion names for true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('assert', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('expect', [makeBoolLiteral(true)]))
      visitor.CallExpression(makeCallExpr('assertThat', [makeBoolLiteral(true)]))
      const allContainTrue = reports.every(r => r.message.includes('always true'))
      expect(allContainTrue).toBe(true)
    })
  })

  // ===== ADDITIONAL CASES (7) =====
  describe('additional coverage', () => {
    test('StringLiteral without value property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'StringLiteral', loc: makeLoc(1, 0, 1, 2) }]))
      expect(reports.length).toBe(0)
    })

    test('NumericLiteral without value property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'NumericLiteral', loc: makeLoc(1, 0, 1, 1) }]))
      expect(reports.length).toBe(0)
    })

    test('callee Identifier without name does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [makeBoolLiteral(true)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('arguments with undefined first element does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assertTrue' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [null]))
      expect(reports.length).toBe(0)
    })

    test('assertion with extra arguments still checks first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(true), makeStringLiteral('message')]))
      expect(reports.length).toBe(1)
    })

    test('handles node with NaN as NumericLiteral value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'NumericLiteral', value: NaN }]))
      expect(reports.length).toBe(0)
    })

    test('handles node with Infinity as NumericLiteral value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'NumericLiteral', value: Infinity }]))
      expect(reports.length).toBe(0)
    })

    test('StringLiteral with undefined value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'StringLiteral', value: undefined }]))
      expect(reports.length).toBe(0)
    })

    test('message consistency across all assertion names for empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallExpr('assert', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallExpr('expect', [makeStringLiteral('')]))
      visitor.CallExpression(makeCallExpr('assertThat', [makeStringLiteral('')]))
      const allContainFalsy = reports.every(r => r.message.includes('always falsy'))
      expect(allContainFalsy).toBe(true)
    })

    test('message consistency across all assertion names for zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallExpr('assert', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallExpr('expect', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallExpr('assertThat', [makeNumericLiteral(0)]))
      const allContainFalsy = reports.every(r => r.message.includes('always falsy'))
      expect(allContainFalsy).toBe(true)
    })

    test('message consistency across all assertion names for false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [makeBoolLiteral(false)]))
      visitor.CallExpression(makeCallExpr('assert', [makeBoolLiteral(false)]))
      visitor.CallExpression(makeCallExpr('expect', [makeBoolLiteral(false)]))
      visitor.CallExpression(makeCallExpr('assertThat', [makeBoolLiteral(false)]))
      const allContainFalse = reports.every(r => r.message.includes('always false'))
      expect(allContainFalse).toBe(true)
    })
  })

  describe('ESTree literal compatibility', () => {
    test('reports assertion with ESTree Literal empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty string')
    })

    test('reports assertion with ESTree Literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('always falsy')
    })

    test('does not report assertion with ESTree Literal non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report assertion with ESTree Literal non-zero number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingAssertionRule.create(context)
      visitor.CallExpression(makeCallExpr('assertTrue', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })
  })
})
