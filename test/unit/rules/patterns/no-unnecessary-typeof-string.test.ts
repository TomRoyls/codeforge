import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTypeofStringRule } from '../../../../src/rules/patterns/no-unnecessary-typeof-string.js'
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
  locEndCol = 30,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeTypeof(arg: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument: arg,
    prefix: true,
  }
}

function makeStringLiteral(value: string): unknown {
  return { type: 'Literal', value }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function makeTemplateLiteral(expressions: unknown[] = [], quasis: unknown[] = []): unknown {
  return { type: 'TemplateLiteral', expressions, quasis }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-typeof-string rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTypeofStringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTypeofStringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTypeofStringRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTypeofStringRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTypeofStringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning typeof', () => {
      const desc = noUnnecessaryTypeofStringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/typeof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTypeofStringRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-typeof-string.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTypeofStringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTypeofStringRule).toBeDefined()
      expect(noUnnecessaryTypeofStringRule.meta).toBeDefined()
      expect(noUnnecessaryTypeofStringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary typeof string', () => {
    test('reports for typeof "hello" === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof "world" === "string" with Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral('world')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof "hello" !== "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof empty template literal === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeTemplateLiteral([])), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof single-char string literal === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof empty string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof long string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('this is a very long string literal value')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof string with special chars === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello\nworld')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof string with unicode === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('こんにちは')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof emoji string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('🚀')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof string !== "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeLiteral('test')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports when right side is Literal with value "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('x')), makeLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports when both sides use Literal nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral('foo')), makeLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary typeof', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports[0].message).toMatch(/typeof/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports[0].message).toBe(
        'Unnecessary typeof check on a string literal. The result is always "string".',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      const node = makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string'), 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeStringLiteral('b')), makeStringLiteral('string')))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeStringLiteral('b')), makeStringLiteral('string')))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for typeof template literal with empty expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeTemplateLiteral([])), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof template literal with quasis but no expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeTemplateLiteral([], [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }])), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof StringLiteral argument !== "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeStringLiteral('abc')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('x')), makeStringLiteral('string')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for typeof space string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral(' ')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof multi-line string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('line1\nline2')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof tab string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('\t')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof number-as-string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('123')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof "true" === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('true')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof "null" === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('null')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof Literal with string value === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof Literal with empty string === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral('')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('accumulates three reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('b')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('c')), makeStringLiteral('string')))
      expect(reports.length).toBe(3)
    })

    test('reports for typeof string with escape sequences === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello\\nworld')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })

    test('reports for typeof "undefined" === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('undefined')), makeStringLiteral('string')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for typeof variable === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'Identifier', name: 'x' }), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof 42 === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(42)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof true === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(true)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof null === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(null)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "hello" === "string" (no typeof)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('hello'), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'Identifier', name: 'x' }), makeStringLiteral('number')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x == "string" (loose equality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x != "string" (loose inequality)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x > "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x + "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when right side is not a string type (Literal with number value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeLiteral(42)))
      expect(reports.length).toBe(0)
    })

    test('does not report when right side is a variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), { type: 'Identifier', name: 'str' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when right side is Literal with non-string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeLiteral(42)))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof template literal with expressions === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeTemplateLiteral([{ type: 'Identifier', name: 'x' }])), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof template literal with multiple expressions === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeTemplateLiteral([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }])), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not typeof UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' }, prefix: true }, makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', { type: 'Identifier', name: 'x' }, makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is a number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(42)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is a boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(false)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(null)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is a regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeLiteral(/test/)), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is an array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'ArrayExpression', elements: [] }), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'ObjectExpression', properties: [] }), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is a function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is a call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }), makeStringLiteral('string')))
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'UnaryExpression', operator: 'typeof', argument: undefined, prefix: true },
        right: makeStringLiteral('string'),
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeof argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'UnaryExpression', operator: 'typeof', argument: null, prefix: true },
        right: makeStringLiteral('string'),
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right side is Literal with value "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeLiteral('number')))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof x === "boolean" (Literal, not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeLiteral('boolean')))
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTypeofStringRule.create(ctx1)
      const visitor2 = noUnnecessaryTypeofStringRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string')))
      visitor2.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'Identifier', name: 'x' }), makeStringLiteral('string')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'Identifier', name: 'x' }), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('b')), makeStringLiteral('string')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeStringLiteral('hello')),
        right: makeStringLiteral('string'),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeStringLiteral('hello')),
        right: makeStringLiteral('string'),
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof({ type: 'Identifier', name: 'x' }), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeStringLiteral('hello'), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('b')), makeLiteral('number')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeStringLiteral('c')), makeStringLiteral('string')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTypeofStringRule.create(context)
      const visitor2 = noUnnecessaryTypeofStringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTypeofStringRule.meta
      const meta2 = noUnnecessaryTypeofStringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeStringLiteral('hello')),
        right: makeStringLiteral('string'),
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeStringLiteral('hello')),
        right: makeStringLiteral('string'),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeStringLiteral('hello')),
        right: makeStringLiteral('string'),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      const node = makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string'))
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTypeofStringRule).toBeDefined()
      expect(typeof noUnnecessaryTypeofStringRule.create).toBe('function')
      expect(typeof noUnnecessaryTypeofStringRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: makeTypeof(makeStringLiteral('hello')),
        right: makeStringLiteral('string'),
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('hello')), makeStringLiteral('string'), 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTypeofStringRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeTypeof(makeStringLiteral('a')), makeStringLiteral('string')))
      visitor.BinaryExpression(makeBinaryExpr('!==', makeTypeof(makeStringLiteral('b')), makeStringLiteral('string')))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
