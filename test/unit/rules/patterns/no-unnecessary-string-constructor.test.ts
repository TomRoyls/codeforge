import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-string-constructor.js'
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

function makeStringCallNode(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'String' },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== TESTS (95 total) =====

describe('no-unnecessary-string-constructor rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning String', () => {
      const desc = noUnnecessaryStringConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/string/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringConstructorRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-constructor.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringConstructorRule).toBeDefined()
      expect(noUnnecessaryStringConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryStringConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (27) =====

  describe('positive cases — reports unnecessary String()', () => {
    test('reports String("hello") — double-quoted string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports String("world") — different string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'world' }))
      expect(reports.length).toBe(1)
    })

    test('reports String("") — empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports String("a") — single character string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'a' }))
      expect(reports.length).toBe(1)
    })

    test('reports String("hello world") — string with space', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello world' }))
      expect(reports.length).toBe(1)
    })

    test('reports String with StringLiteral type node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'StringLiteral', value: 'test' }))
      expect(reports.length).toBe(1)
    })

    test('reports String with StringLiteral type and empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'StringLiteral', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports String(`hello`) — template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [], quasis: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports String(``) — empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports String(`some template`) — template with quasis but no expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [], quasis: [{ type: 'TemplateElement' }] }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary String() on string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message).toMatch(/Unnecessary String\(\) call/)
    })

    test('report message for string literal is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message).toBe(
        'Unnecessary String() call on a string literal. The value is already a string.',
      )
    })

    test('report message for template literal is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [] }))
      expect(reports[0].message).toBe(
        'Unnecessary String() call on a template literal without expressions. The value is already a string.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      const node = makeStringCallNode({ type: 'Literal', value: 'hello' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'a' }))
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('string literal report and template literal report have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [] }))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('reports String with string containing special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello\nworld' }))
      expect(reports.length).toBe(1)
    })

    test('reports String with string containing unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: '🎉' }))
      expect(reports.length).toBe(1)
    })

    test('reports String with very long string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      const longStr = 'a'.repeat(1000)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: longStr }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports String with string literal containing whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: '   ' }))
      expect(reports.length).toBe(1)
    })

    test('reports String with string literal containing tabs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: '\t\t' }))
      expect(reports.length).toBe(1)
    })

    test('reports String with multi-line template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [], quasis: [{ type: 'TemplateElement', value: { raw: 'line1\nline2', cooked: 'line1\nline2' } }] }))
      expect(reports.length).toBe(1)
    })

    test('reports String(StringLiteral) with non-ASCII string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'StringLiteral', value: '日本語' }))
      expect(reports.length).toBe(1)
    })

    test('reports String(StringLiteral) with emoji string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'StringLiteral', value: '🚀🔥' }))
      expect(reports.length).toBe(1)
    })

    test('reports String(StringLiteral) with single character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'StringLiteral', value: 'x' }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report String(42) — number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(0) — zero number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(true) — boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(false) — boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(null) — null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(x) — identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(obj) — identifier with different name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Identifier', name: 'obj' }))
      expect(reports.length).toBe(0)
    })

    test('does not report String() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report String("a", "b") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Number("42") — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Boolean("true") — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Literal', value: 'true' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report MyFunc("hello") — custom function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'MyFunc' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report String(`hello ${name}`) — template with expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [{ type: 'Identifier', name: 'name' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(`a ${b} c`) — template with one expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [{ type: 'Identifier', name: 'b' }], quasis: [{ type: 'TemplateElement' }, { type: 'TemplateElement' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(`a ${b} ${c}`) — template with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: [{ type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report String({}) — ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report String([]) — ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(fn()) — CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(3.14) — float literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(-1) — negative number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'String' } },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: 'hello' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: 'hello' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'String' }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }, { type: 'Literal', value: 'c' }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "string" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'string' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report String(BinaryExpression) — binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(ConditionalExpression) — ternary argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type as top-level', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type as top-level', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report String(undefined) — undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report String(/regex/) — regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [undefined],
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
      const visitor1 = noUnnecessaryStringConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryStringConstructorRule.create(ctx2)
      visitor1.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      visitor2.CallExpression(makeStringCallNode({ type: 'Literal', value: 42 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'world' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports for string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports for template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'TemplateLiteral', expressions: [] }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }))
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 42 }))
      visitor.CallExpression(makeStringCallNode({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'world' }))
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringConstructorRule.create(context)
      const visitor2 = noUnnecessaryStringConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringConstructorRule.meta
      const meta2 = noUnnecessaryStringConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
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
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      const node = makeStringCallNode({ type: 'Literal', value: 'hello' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringConstructorRule).toBeDefined()
      expect(typeof noUnnecessaryStringConstructorRule.create).toBe('function')
      expect(typeof noUnnecessaryStringConstructorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'Literal', value: 'hello' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when TemplateLiteral expressions is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorRule.create(context)
      visitor.CallExpression(makeStringCallNode({ type: 'TemplateLiteral', expressions: 'not-array' }))
      expect(reports.length).toBe(0)
    })
  })
})
