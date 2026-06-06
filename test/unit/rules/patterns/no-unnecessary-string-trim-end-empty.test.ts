import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringTrimEndEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-trim-end-empty.js'
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

function makeEmptyStringLiteral(): unknown {
  return { type: 'Literal', value: '' }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-trim-end-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning trimEnd or trimRight', () => {
      const desc = noUnnecessaryStringTrimEndEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/trimend|trimright/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-end-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule).toBeDefined()
      expect(noUnnecessaryStringTrimEndEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringTrimEndEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary trimEnd/trimRight on empty string', () => {
    test('reports for \'\'.trimEnd()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports.length).toBe(1)
    })

    test('reports for \'\'.trimRight()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions trimEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports[0].message).toMatch(/trimEnd/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports[0].message).toBe(
        `''.trimEnd() on an empty string is unnecessary.`,
      )
    })

    test('report message for trimRight is same as trimEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports[0].message).toBe(
        `''.trimEnd() on an empty string is unnecessary.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'trimEnd')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports trimEnd at various line positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', [], 42, 7, 42, 22))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports trimEnd at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', [], 1, 0, 1, 16))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports trimEnd at multi-line span', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', [], 3, 10, 5, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('reports trimEnd on empty string literal with explicit zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', []))
      expect(reports.length).toBe(1)
    })

    test('reports trimRight on empty string literal with explicit zero args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight', []))
      expect(reports.length).toBe(1)
    })

    test('report for trimRight has correct loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight', [], 7, 3, 7, 20))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('report for trimRight has correct node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'trimRight')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports three trimEnd calls result in three reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports.length).toBe(3)
    })

    test('reports mixed trimEnd and trimRight calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports.length).toBe(3)
    })

    test('reports trimEnd on empty string with node containing extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports trimRight on empty string with node containing extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimRight' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with node containing _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports trimEnd with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports trimEnd with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports trimEnd without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports trimEnd without loc uses default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.trimEnd() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trimRight() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'hello\'.trimEnd() — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'hello\'.trimRight() — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'trimRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.trimStart() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.trim() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.trimLeft() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \'\'.padEnd() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'padEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'trimEnd' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "trimStart"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "trimend" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimend'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "trimright" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimright'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'trimEnd' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'trimEnd' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when object is Literal type (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'trimEnd'))
      expect(reports.length).toBe(1)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'trimEnd' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for \'a\'.trimEnd() — single char non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'a' }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for \' \'.trimEnd() — whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: ' ' }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimEndEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringTrimEndEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimEnd'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringTrimEndEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringTrimEndEmptyRule.meta
      const meta2 = noUnnecessaryStringTrimEndEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'trimEnd')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringTrimEndEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringTrimEndEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringTrimEndEmptyRule.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports.length).toBe(2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression with computed: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when computed: true with Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimEnd' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments.length > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is non-empty array for trimRight', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when StringLiteral value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: null }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when StringLiteral value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: undefined }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when StringLiteral value is non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'test string' }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when StringLiteral has no value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal' }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('visitor does not report for ArrayExpression object type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimEndEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'trimEnd'))
      expect(reports.length).toBe(0)
    })
  })
})
