import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberIsnanLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-number-isnan-literal.js'
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

function makeNumberIsNaNCall(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Number' },
      property: { type: 'Identifier', name: 'isNaN' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-isnan-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Number.isNaN', () => {
      const desc = noUnnecessaryNumberIsnanLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/number\.isnan/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-number-isnan-literal.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule).toBeDefined()
      expect(noUnnecessaryNumberIsnanLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryNumberIsnanLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary Number.isNaN on literals', () => {
    test('reports for Number.isNaN(42) — NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(0) — zero NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(-1) — negative NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(3.14) — float NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN("hello") — StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN("") — empty StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN("42") — numeric string StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: '42' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(true) — BooleanLiteral true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(false) — BooleanLiteral false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(null) — NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(10n) — BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BigIntLiteral', value: 10n }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(0n) — zero BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BigIntLiteral', value: 0n }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(`hello`) — TemplateLiteral without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [], quasis: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(``) — empty TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Number.isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toMatch(/Number\.isNaN/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toBe(
        'Unnecessary Number.isNaN() call on a literal value. Number.isNaN() always returns false for literal values.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      const node = makeNumberIsNaNCall({ type: 'Literal', value: 42 })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BooleanLiteral', value: true }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Number.isNaN(Infinity) — NumericLiteral Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: Infinity }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN("NaN") — StringLiteral "NaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'NaN' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(999999) — large NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 999999 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(`template`) — TemplateLiteral with text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [], quasis: [{ type: 'TemplateElement', value: { raw: 'template', cooked: 'template' } }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(`a`) — single char TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'NullLiteral' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Number.isNaN(1e10) — scientific notation NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 1e10 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(0.001) — small decimal NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 0.001 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(100n) — large BigIntLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BigIntLiteral', value: 100n }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN("multiline\nstring") — StringLiteral with newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'multiline\nstring' }))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }, 3, 0, 3, 18))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('accumulates three reports correctly for all literal types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 1 }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'x' }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(3)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number.isNaN(someVar) — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Identifier', name: 'someVar' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(x + y) — BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(42, extra) — wrong arg count', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }, { type: 'Identifier', name: 'extra' }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(42) — global isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(`hello ${x}`) — TemplateLiteral with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [{ type: 'Identifier', name: 'x' }], quasis: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(`a${b}c`) — TemplateLiteral with one expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [{ type: 'Identifier', name: 'b' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(`${x}${y}`) — TemplateLiteral with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'TemplateLiteral', expressions: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObj.isNaN(42) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObj' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(42) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt("42") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(foo()) — CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(obj.val) — MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN([1,2]) — ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN({}) — ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(undefined) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isisNaN(42) — typo in method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isisNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: 42 }], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: 42 }], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'isNaN' }, arguments: [{ type: 'Literal', value: 42 }], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(x * y) — BinaryExpression with multiply', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(-x) — UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(void 0) — UnaryExpression void', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isisNaN(42) — lowercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isnan' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsnanLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberIsnanLiteralRule.create(ctx2)
      visitor1.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      visitor2.CallExpression(makeNumberIsNaNCall({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'a' }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsnanLiteralRule.create(context)
      const visitor2 = noUnnecessaryNumberIsnanLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberIsnanLiteralRule.meta
      const meta2 = noUnnecessaryNumberIsnanLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      const node = makeNumberIsNaNCall({ type: 'Literal', value: 42 })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberIsnanLiteralRule).toBeDefined()
      expect(typeof noUnnecessaryNumberIsnanLiteralRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberIsnanLiteralRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'NullLiteral' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  describe('ESTree literal compatibility', () => {
    test('reports Number.isNaN(42) with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports Number.isNaN("hello") with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports Number.isNaN(null) with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('reports Number.isNaN(true) with ESTree Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsnanLiteralRule.create(context)
      visitor.CallExpression(makeNumberIsNaNCall({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })
  })
})
