import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringTrimStartEmptyRule } from '../../../../src/rules/patterns/no-unnecessary-string-trim-start-empty.js'
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

function makeEmptyStringLiteral(): unknown {
  return { type: 'Literal', value: '' }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-trim-start-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning trimStart or trimLeft', () => {
      const desc = noUnnecessaryStringTrimStartEmptyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/trimstart|trimleft/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-trim-start-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule).toBeDefined()
      expect(noUnnecessaryStringTrimStartEmptyRule.meta).toBeDefined()
      expect(noUnnecessaryStringTrimStartEmptyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary trimStart/trimLeft on empty string', () => {
    test('reports for empty string trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string trimLeft', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports[0].message).toMatch(/trimStart/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports[0].message).toBe(
        `''.trimStart() on an empty string is unnecessary.`,
      )
    })

    test('report message is same for trimLeft', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports[0].message).toBe(
        `''.trimStart() on an empty string is unnecessary.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'trimStart')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for empty string trimStart with zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', []))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string trimLeft with zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft', []))
      expect(reports.length).toBe(1)
    })

    test('reports for consecutive trimStart calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports.length).toBe(3)
    })

    test('reports for alternating trimStart and trimLeft calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      expect(reports.length).toBe(3)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [], 3, 5, 7, 12))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('reports for trimStart on empty string at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [], 42, 0, 42, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('reports for trimLeft on empty string at different column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft', [], 1, 15, 1, 35))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('reports for empty string with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty string with _parent property on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object has additional StringLiteral properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '', raw: "''" }, 'trimStart'))
      expect(reports.length).toBe(1)
    })

    test('reports trimStart with empty string regardless of loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [], 100, 50, 100, 70))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports trimStart on empty string with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports trimStart on empty string with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports trimLeft on empty string without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimLeft' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'trimStart')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-empty string trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-empty string trimLeft', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'trimLeft'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.trimStart() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.trimLeft() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimLeft'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string trimEnd — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string trim — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trim'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string trimRight — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with other method names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'toUpperCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with arguments to trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string with arguments to trimLeft', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "trimstart" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimstart'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "trimleft" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimleft'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'trimStart' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'trimStart' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
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
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
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

    test('does not report for empty string with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for whitespace-only string trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: ' ' }, 'trimStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for space character string trimStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '  ' }, 'trimStart'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimStartEmptyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringTrimStartEmptyRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimStart'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimLeft' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimEnd'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const visitor2 = noUnnecessaryStringTrimStartEmptyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringTrimStartEmptyRule.meta
      const meta2 = noUnnecessaryStringTrimStartEmptyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
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

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      const node = makeCallNode(makeEmptyStringLiteral(), 'trimStart')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringTrimStartEmptyRule).toBeDefined()
      expect(typeof noUnnecessaryStringTrimStartEmptyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringTrimStartEmptyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimLeft' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (not computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Identifier', name: 'trimStart' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeEmptyStringLiteral(),
          property: { type: 'Literal', value: 'trimStart' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringTrimStartEmptyRule.create(context)
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimStart'))
      visitor.CallExpression(makeCallNode(makeEmptyStringLiteral(), 'trimLeft'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
