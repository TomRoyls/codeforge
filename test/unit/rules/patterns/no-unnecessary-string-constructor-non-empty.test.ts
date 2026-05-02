import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringConstructorNonEmptyRule } from '../../../../src/rules/patterns/index.js'
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

function makeNewStringNode(arg: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'String' },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-constructor-non-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning String', () => {
      const desc = noUnnecessaryStringConstructorNonEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/string/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-constructor-non-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule).toBeDefined()
      expect(noUnnecessaryStringConstructorNonEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringConstructorNonEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports new String with StringLiteral', () => {
    test('reports for new String("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'world' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'a' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(" ") — space character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: ' ' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String("multi word string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'multi word string' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String("") — empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with unicode content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '\u0041' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '!@#$%^&*()' }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions String object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'test' }))
      expect(reports[0].message).toMatch(/String/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'x' }))
      expect(reports[0].message).toBe(
        `new String('...') creates a String object, not a primitive. Use the literal directly.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'abc' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'abc' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      const node = makeNewStringNode({ type: 'StringLiteral', value: 'abc' })
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'x' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'a' }))
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'a' }))
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for new String with emoji content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '🎉' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with escaped characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'line1\nline2' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '\n' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '\t' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with very long string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'a'.repeat(1000) }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with numbers in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '12345' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with quotes inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: "it's" }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with backslash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'C:\\path\\to\\file' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with HTML content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '<div>hello</div>' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with path-like string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: '/usr/local/bin' }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'abc' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'x' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for String("hello") call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String with two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'a' }, { type: 'StringLiteral', value: 'b' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Number(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'StringLiteral', value: '5' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Boolean(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'StringLiteral', value: 'true' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object("str")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [{ type: 'StringLiteral', value: 'str' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array("str")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'StringLiteral', value: 'str' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Foo("str")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [{ type: 'StringLiteral', value: 'str' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String(template literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String(identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'myVar' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String(numeric literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'NumericLiteral', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String(boolean literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String(null argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'NullLiteral' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new String(undefined argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [{ type: 'StringLiteral', value: 'x' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [{ type: 'StringLiteral', value: 'x' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'String' } },
        arguments: [{ type: 'StringLiteral', value: 'x' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'String' } },
        arguments: [{ type: 'StringLiteral', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is not "String"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'string' },
        arguments: [{ type: 'StringLiteral', value: 'x' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'NumericLiteral', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringConstructorNonEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringConstructorNonEmptyRule.create(ctx2)
      visitor1.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'hello' }))
      visitor2.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'StringLiteral', value: '5' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'a' }))
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'StringLiteral', value: '5' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'hello' }))
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'world' }))
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'NumericLiteral', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringConstructorNonEmptyRule.meta
      const meta2 = noUnnecessaryStringConstructorNonEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      const node = makeNewStringNode({ type: 'StringLiteral', value: 'test' })
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringConstructorNonEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringConstructorNonEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringConstructorNonEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'x' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles callee that is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'StringLiteral', value: 'test' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringConstructorNonEmptyRule.create(context)
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'a' }))
      visitor.NewExpression(makeNewStringNode({ type: 'StringLiteral', value: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
