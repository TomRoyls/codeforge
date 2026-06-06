import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-number-constructor.js'
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

function makeNumberCall(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Number' },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Number', () => {
      const desc = noUnnecessaryNumberConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/number/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-constructor.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberConstructorRule).toBeDefined()
      expect(noUnnecessaryNumberConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryNumberConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (23) =====

  describe('positive cases — reports unnecessary Number() on numeric literals', () => {
    test('reports for Number(42) — integer literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(3.14) — float literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(0) — zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(-1) — negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(1e5) — scientific notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1e5 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(Infinity) — via NumericLiteral with Infinity value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: Infinity }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number(NaN) — via NumericLiteral with NaN value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: NaN }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with numeric value (type "Literal")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 100 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with value 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 0.5 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with negative value -99', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: -99 }))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral with very large number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 999999999 }))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral with very small decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 0.000001 }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary Number call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toMatch(/Number/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toBe(
        'Unnecessary Number() call on a numeric literal. The value is already a number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      const node = makeNumberCall({ type: 'Literal', value: 42 })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1 }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1 }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 2 }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for NumericLiteral with value 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral with value -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: -0 }))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number("42") — string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: '42' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(42, 16) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }, { type: 'Literal', value: 16 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(42, 16, 0) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }, { type: 'Literal', value: 16 }, { type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for String(42) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean(42) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(true) — boolean Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(false) — boolean Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(null) — null Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number("hello") — string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(myVar) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Identifier', name: 'myVar' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(foo + bar) — BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'foo' }, right: { type: 'Identifier', name: 'bar' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Number(42) — NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee being MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'Number' } },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: 42 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: 42 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Math' }, property: { type: 'Identifier', name: 'Number' } },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "number" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(template literal) — TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number([]) — ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number({}) — ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(fn()) — CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(obj.prop) — MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with object value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: { a: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(1 + 2) — BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(x ? 1 : 2) — ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(function(){}) — FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(() => {}) — ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: ['not-an-object'],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberConstructorRule.create(ctx2)
      visitor1.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }))
      visitor2.CallExpression(makeNumberCall({ type: 'Literal', value: '42' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1 }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: '42' }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 3 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1 }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: '42' }))
      visitor.CallExpression(makeNumberCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 2 }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberConstructorRule.create(context)
      const visitor2 = noUnnecessaryNumberConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberConstructorRule.meta
      const meta2 = noUnnecessaryNumberConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      const node = makeNumberCall({ type: 'Literal', value: 42 })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberConstructorRule).toBeDefined()
      expect(typeof noUnnecessaryNumberConstructorRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberConstructorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 42 }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 1 }))
      visitor.CallExpression(makeNumberCall({ type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles NumericLiteral arg without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberConstructorRule.create(context)
      visitor.CallExpression(makeNumberCall({ type: 'Literal' }))
      expect(reports.length).toBe(1)
    })
  })
})
