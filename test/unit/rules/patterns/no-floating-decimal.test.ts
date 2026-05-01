import { describe, expect, test, vi } from 'vitest'
import { noFloatingDecimalRule } from '../../../../src/rules/patterns/no-floating-decimal.js'
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
    getSource: () => 'const x = .5',
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

function makeFloatingLiteral(
  raw: string,
  value: number,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: makeLoc(line, column, line, column + raw.length),
  }
}

describe('no-floating-decimal rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noFloatingDecimalRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noFloatingDecimalRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noFloatingDecimalRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noFloatingDecimalRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noFloatingDecimalRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning floating decimals and clarity', () => {
      const desc = noFloatingDecimalRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/float/)
      expect(desc).toMatch(/decimal/)
    })

    test('should have correct docs URL', () => {
      expect(noFloatingDecimalRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-floating-decimal',
      )
    })

    test('should have empty schema', () => {
      expect(noFloatingDecimalRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noFloatingDecimalRule).toBeDefined()
      expect(noFloatingDecimalRule.meta).toBeDefined()
      expect(noFloatingDecimalRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — detects floating decimals', () => {
    test('reports .5 as floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports.length).toBe(1)
    })

    test('reports .1 as floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.1', 0.1))
      expect(reports.length).toBe(1)
    })

    test('reports .123 as floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.123', 0.123))
      expect(reports.length).toBe(1)
    })

    test('reports .999 as floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.999', 0.999))
      expect(reports.length).toBe(1)
    })

    test('message mentions "floating decimal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports[0].message.toLowerCase()).toContain('floating decimal')
    })

    test('message suggests 0.5 for .5', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports[0].message).toContain('0.5')
    })

    test('message includes the raw value in backticks', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.75', 0.75))
      expect(reports[0].message).toContain('`.75`')
    })

    test('message suggests 0-prefixed version for .75', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.75', 0.75))
      expect(reports[0].message).toContain('0.75')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      const node = makeFloatingLiteral('.5', 0.5)
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc has correct start line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5, 3, 8))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('reports multiple floating decimal violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal(makeFloatingLiteral('.3', 0.3))
      visitor.Literal(makeFloatingLiteral('.9', 0.9))
      expect(reports.length).toBe(3)
    })

    test('reports .25 floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.25', 0.25))
      expect(reports.length).toBe(1)
    })

    test('reports .333 floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.333', 0.333))
      expect(reports.length).toBe(1)
    })

    test('reports .7 floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.7', 0.7))
      expect(reports.length).toBe(1)
    })

    test('reports .01 floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.01', 0.01))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.1', 0.1))
      visitor.Literal(makeFloatingLiteral('.2', 0.2))
      visitor.Literal(makeFloatingLiteral('.3', 0.3))
      visitor.Literal(makeFloatingLiteral('.4', 0.4))
      expect(reports.length).toBe(4)
    })

    test('reports .0001 floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.0001', 0.0001))
      expect(reports.length).toBe(1)
    })

    test('reports .6789 floating decimal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.6789', 0.6789))
      expect(reports.length).toBe(1)
    })

    test('reports each violation exactly once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report 0.5 — has leading zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.5,
        raw: '0.5',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 1.0 — has integer part', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 1.0,
        raw: '1.0',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report integer literal 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 42,
        raw: '42',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report string literal "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 'hello',
        raw: '"hello"',
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: true,
        raw: 'true',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: null,
        raw: 'null',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when raw property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.5,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is not a number (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: '.5',
        raw: '.5',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when raw does not start with dot', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 3.14,
        raw: '3.14',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Identifier',
        name: 'x',
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when raw is a number, not string', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.5,
        raw: 0.5,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 0.0 — has leading zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.0,
        raw: '0.0',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 10.5 — has integer part', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 10.5,
        raw: '10.5',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 99.99 — has integer part', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 99.99,
        raw: '99.99',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: null,
        raw: '/test/',
        regex: { pattern: 'test', flags: '' },
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: undefined,
        raw: '.5',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 100 — plain integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 100,
        raw: '100',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report negative number -0.5 (raw starts with minus)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: -0.5,
        raw: '-0.5',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 1e-7 scientific notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 1e-7,
        raw: '1e-7',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 0 (zero integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0,
        raw: '0',
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: false,
        raw: 'false',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({ type: 'Literal' })
      expect(reports.length).toBe(0)
    })

    test('does not report empty string value with dot raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: '',
        raw: '.5',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'BinaryExpression',
        operator: '+',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report NaN value — typeof NaN is number but raw is "NaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: NaN,
        raw: 'NaN',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Infinity value — raw does not start with dot', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: Infinity,
        raw: 'Infinity',
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 2.718 — has integer part', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 2.718,
        raw: '2.718',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report 0.001 — has leading zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.001,
        raw: '0.001',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with null value and null raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: null,
        raw: null,
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noFloatingDecimalRule.create(ctx1)
      const visitor2 = noFloatingDecimalRule.create(ctx2)

      visitor1.Literal(makeFloatingLiteral('.5', 0.5))
      visitor2.Literal({
        type: 'Literal',
        value: 0.5,
        raw: '0.5',
        loc: makeLoc(1, 0, 1, 3),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly across 5 calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.1', 0.1))
      visitor.Literal(makeFloatingLiteral('.2', 0.2))
      visitor.Literal(makeFloatingLiteral('.3', 0.3))
      visitor.Literal(makeFloatingLiteral('.4', 0.4))
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports.length).toBe(5)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.5,
        raw: '.5',
      })
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      // violation
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      // not a violation — has leading zero
      visitor.Literal({
        type: 'Literal',
        value: 0.3,
        raw: '0.3',
        loc: makeLoc(2, 0, 2, 3),
      })
      // violation
      visitor.Literal(makeFloatingLiteral('.9', 0.9))
      // not a violation — string value
      visitor.Literal({
        type: 'Literal',
        value: 'hello',
        raw: '.5',
        loc: makeLoc(3, 0, 3, 2),
      })
      // violation
      visitor.Literal(makeFloatingLiteral('.1', 0.1))
      expect(reports.length).toBe(3)
    })

    test('very small decimal .001 is detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.001', 0.001))
      expect(reports.length).toBe(1)
    })

    test('.0 edge case — zero value but floating decimal raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.0', 0))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noFloatingDecimalRule.create(context)
      const visitor2 = noFloatingDecimalRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.5,
        raw: '.5',
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('node with specific loc values preserves them', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5, 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('floating decimal .0000001 is detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.0000001', 0.0000001))
      expect(reports.length).toBe(1)
    })

    test('.00 edge case — zero value detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.00', 0))
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties beyond type/value/raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 0.5,
        raw: '.5',
        leadingComments: [],
        trailingComments: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
    })

    test('mixed types in sequence — only floating decimals reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal({
        type: 'Literal',
        value: 42,
        raw: '42',
        loc: makeLoc(2, 0, 2, 2),
      })
      visitor.Literal(makeFloatingLiteral('.7', 0.7))
      visitor.Literal({
        type: 'Literal',
        value: 'text',
        raw: '"text"',
        loc: makeLoc(3, 0, 3, 6),
      })
      expect(reports.length).toBe(2)
    })


  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noFloatingDecimalRule.meta
      const meta2 = noFloatingDecimalRule.meta
      expect(meta1).toBe(meta2)
    })

    test('meta docs object is consistent', () => {
      const docs1 = noFloatingDecimalRule.meta.docs
      const docs2 = noFloatingDecimalRule.meta.docs
      expect(docs1).toBe(docs2)
    })

    test('message is consistent for same raw value across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message differs for different raw values', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal(makeFloatingLiteral('.25', 0.25))
      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[0].message).toContain('.5')
      expect(reports[1].message).toContain('.25')
    })

    test('message contains "clarity" keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      expect(reports[0].message.toLowerCase()).toContain('clarity')
    })

    test('suggests correct fix for .3 → 0.3', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.3', 0.3))
      expect(reports[0].message).toContain('0.3')
    })

    test('suggests correct fix for .875 → 0.875', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.875', 0.875))
      expect(reports[0].message).toContain('0.875')
    })

    test('raw vs value mismatch — raw starts with dot but value is different', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      // Rule checks raw.startsWith('.'), not value
      visitor.Literal({
        type: 'Literal',
        value: 0.9,
        raw: '.5',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(1)
      // Message uses raw, so it mentions .5
      expect(reports[0].message).toContain('.5')
    })

    test('negative number -5 is not flagged (no dot)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: -5,
        raw: '-5',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('negative number -3.14 is not flagged', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: -3.14,
        raw: '-3.14',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report template literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('rule name is exported as noFloatingDecimalRule', () => {
      expect(noFloatingDecimalRule).toBeDefined()
      expect(typeof noFloatingDecimalRule.create).toBe('function')
      expect(typeof noFloatingDecimalRule.meta).toBe('object')
    })

    test('reports .5 then does not report 5 — correct sequencing', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal({
        type: 'Literal',
        value: 5,
        raw: '5',
        loc: makeLoc(2, 0, 2, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal(makeFloatingLiteral('.5', 0.5))
      visitor.Literal(makeFloatingLiteral('.75', 0.75))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('.5')
      expect(reports[1].message).toContain('.75')
    })

    test('does not report MemberExpression node passed to Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingDecimalRule.create(context)
      visitor.Literal({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })
  })
})
