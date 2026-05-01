import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryDoubleEqualsRule } from '../../../../src/rules/patterns/no-unnecessary-double-equals.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
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
    getSource: () => '[]',
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

function makeBinaryExpr(
  operator: string,
  left: unknown,
  right: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdent(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-double-equals rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning equality', () => {
      const desc = noUnnecessaryDoubleEqualsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/equality/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-double-equals.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDoubleEqualsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryDoubleEqualsRule).toBeDefined()
      expect(noUnnecessaryDoubleEqualsRule.meta).toBeDefined()
      expect(noUnnecessaryDoubleEqualsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — == OPERATOR (19) =====

  describe('positive cases — reports == operator', () => {
    test('reports for identifier == identifier (x == y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(1)
    })

    test('reports for literal == literal (1 == 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeLiteral(1), makeLiteral(2)))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier == null (a == null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier == undefined (a == undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports for true == false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeLiteral(true), makeLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string == non-empty string ("" == "hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeLiteral(''), makeLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression == value (fn() == x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdent('fn'), arguments: [] }
      visitor.BinaryExpression(makeBinaryExpr('==', callExpr, makeIdent('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for value == call expression (x == fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdent('fn'), arguments: [] }
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), callExpr))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression == value (a.b == c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const memberExpr = { type: 'MemberExpression', object: makeIdent('a'), property: makeIdent('b') }
      visitor.BinaryExpression(makeBinaryExpr('==', memberExpr, makeIdent('c')))
      expect(reports.length).toBe(1)
    })

    test('reports for computed member == value (arr[0] == val)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const computedMember = { type: 'MemberExpression', object: makeIdent('arr'), property: makeLiteral(0), computed: true }
      visitor.BinaryExpression(makeBinaryExpr('==', computedMember, makeIdent('val')))
      expect(reports.length).toBe(1)
    })

    test('reports for nested binary == value ((a + b) == c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const nestedBinary = makeBinaryExpr('+', makeIdent('a'), makeIdent('b'))
      visitor.BinaryExpression(makeBinaryExpr('==', nestedBinary, makeIdent('c')))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier == 0 (x == 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('report message for == mentions ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y')))
      expect(reports[0].message).toContain('===')
    })

    test('report has loc property for ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node for ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const node = makeBinaryExpr('==', makeIdent('x'), makeIdent('y'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node for ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y'), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple == calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('c'), makeIdent('d')))
      expect(reports.length).toBe(2)
    })

    test('all == reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeLiteral(1), makeLiteral(2)))
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== POSITIVE CASES — != OPERATOR (19) =====

  describe('positive cases — reports != operator', () => {
    test('reports for identifier != identifier (x != y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(1)
    })

    test('reports for literal != literal (1 != 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeLiteral(1), makeLiteral(2)))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier != null (a != null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('a'), makeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier != undefined (a != undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('a'), makeIdent('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports for true != false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeLiteral(true), makeLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string != non-empty string ("" != "hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeLiteral(''), makeLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression != value (fn() != x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdent('fn'), arguments: [] }
      visitor.BinaryExpression(makeBinaryExpr('!=', callExpr, makeIdent('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for value != call expression (x != fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdent('fn'), arguments: [] }
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), callExpr))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression != value (a.b != c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const memberExpr = { type: 'MemberExpression', object: makeIdent('a'), property: makeIdent('b') }
      visitor.BinaryExpression(makeBinaryExpr('!=', memberExpr, makeIdent('c')))
      expect(reports.length).toBe(1)
    })

    test('reports for computed member != value (arr[0] != val)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const computedMember = { type: 'MemberExpression', object: makeIdent('arr'), property: makeLiteral(0), computed: true }
      visitor.BinaryExpression(makeBinaryExpr('!=', computedMember, makeIdent('val')))
      expect(reports.length).toBe(1)
    })

    test('reports for nested binary != value ((a + b) != c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const nestedBinary = makeBinaryExpr('+', makeIdent('a'), makeIdent('b'))
      visitor.BinaryExpression(makeBinaryExpr('!=', nestedBinary, makeIdent('c')))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier != 0 (x != 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('report message for != mentions !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports[0].message).toContain('!==')
    })

    test('report has loc property for !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node for !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const node = makeBinaryExpr('!=', makeIdent('x'), makeIdent('y'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node for !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y'), 8, 4, 8, 25))
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('accumulates reports across multiple != calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('c'), makeIdent('d')))
      expect(reports.length).toBe(2)
    })

    test('report descriptor has all expected properties for !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (27) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for === operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for <= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<=', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for >= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>=', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for * operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for / operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('/', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for % operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('%', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for && operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('&&', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for || operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('||', makeIdent('x'), makeIdent('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('instanceof', makeIdent('x'), makeIdent('Y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('in', makeIdent('x'), makeIdent('obj')))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: makeIdent('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: makeIdent('a'), property: makeIdent('b'), loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({ type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryDoubleEqualsRule.create(ctx1)
      const visitor2 = noUnnecessaryDoubleEqualsRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor2.BinaryExpression(makeBinaryExpr('===', makeIdent('a'), makeIdent('b')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('c'), makeIdent('d')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdent('x'),
        right: makeIdent('y'),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '!=',
        left: makeIdent('x'),
        right: makeIdent('y'),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdent('a'), makeIdent('b')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryDoubleEqualsRule.create(context)
      const visitor2 = noUnnecessaryDoubleEqualsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryDoubleEqualsRule.meta
      const meta2 = noUnnecessaryDoubleEqualsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdent('x'),
        right: makeIdent('y'),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!=',
        left: makeIdent('x'),
        right: makeIdent('y'),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdent('x'),
        right: makeIdent('y'),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      const node = makeBinaryExpr('==', makeIdent('x'), makeIdent('y'))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryDoubleEqualsRule).toBeDefined()
      expect(typeof noUnnecessaryDoubleEqualsRule.create).toBe('function')
      expect(typeof noUnnecessaryDoubleEqualsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdent('x'),
        right: makeIdent('y'),
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y'), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('both == and != report in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('c'), makeIdent('d')))
      expect(reports.length).toBe(2)
    })

    test('== message is exactly as expected', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y')))
      expect(reports[0].message).toBe(
        'Unnecessary == operator. Use === for strict equality comparison.',
      )
    })

    test('!= message is exactly as expected', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports[0].message).toBe(
        'Unnecessary != operator. Use !== for strict equality comparison.',
      )
    })

    test('== and != have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('x'), makeIdent('y')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('x'), makeIdent('y')))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('mixed operators only report == and !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdent('a'), makeIdent('b')))
      expect(reports.length).toBe(2)
    })

    test('total report count matches for complex mixed scenario', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDoubleEqualsRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeLiteral(1), makeLiteral(2)))
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdent('a'), makeIdent('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeLiteral(true), makeLiteral(false)))
      visitor.BinaryExpression(makeBinaryExpr('>', makeIdent('a'), makeIdent('b')))
      expect(reports.length).toBe(4)
    })
  })
})
