import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringIncludesEmpty } from '../../../../src/rules/patterns/no-unnecessary-string-includes-empty.js'
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
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-includes-empty rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning includes', () => {
      const desc = noUnnecessaryStringIncludesEmpty.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/includes/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-includes-empty.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringIncludesEmpty.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringIncludesEmpty).toBeDefined()
      expect(noUnnecessaryStringIncludesEmpty.meta).toBeDefined()
      expect(noUnnecessaryStringIncludesEmpty.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (29) =====

  describe('positive cases — reports unnecessary includes("")', () => {
    test('reports for str.includes("") with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".includes("") with StringLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.includes("") with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.includes("") with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for callResult.includes("") with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for member.includes("") with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: '' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions includes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toMatch(/includes/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toBe(
        `String.prototype.includes('') always returns true. Use a truthy check instead.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'includes', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'includes', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for FunctionExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for long variable name .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myVeryLongStringVariableName' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained member .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } },
        'includes',
        [{ type: 'Literal', value: '' }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for TaggedTemplateExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ParenthesizedExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'str' } }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for TypeCastExpression object .includes("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TypeCastExpression', expression: { type: 'Identifier', name: 'str' }, typeAnnotation: {} }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('message mentions always returns true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports[0].message).toMatch(/always returns true/)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.includes("a") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("hello") — non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("", 0) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("", pos) — two arguments with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }, { type: 'Identifier', name: 'pos' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf("") — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith("") — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith("") — different method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('reports for str.includes() with Literal type argument (not StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('does not report for str.includes(42) — numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'includes' }, arguments: [{ type: 'Literal', value: '' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Includes" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "INCLUDES" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'INCLUDES', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "contains"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'contains', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(" ") — whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: ' ' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("\\n") — newline string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '\n' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringIncludesEmpty.create(ctx1)
      const visitor2 = noUnnecessaryStringIncludesEmpty.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'a' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringIncludesEmpty.create(context)
      const visitor2 = noUnnecessaryStringIncludesEmpty.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringIncludesEmpty.meta
      const meta2 = noUnnecessaryStringIncludesEmpty.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
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
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: '' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringIncludesEmpty).toBeDefined()
      expect(typeof noUnnecessaryStringIncludesEmpty.create).toBe('function')
      expect(typeof noUnnecessaryStringIncludesEmpty.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed member expression as non-computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesEmpty.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'includes' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: '' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
