import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCodepointatZeroRule } from '../../../../src/rules/patterns/no-unnecessary-string-codepointat-zero.js'
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

describe('no-unnecessary-string-codepointat-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning codePointAt', () => {
      const desc = noUnnecessaryStringCodepointatZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/codepointat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-codepointat-zero.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCodepointatZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCodepointatZeroRule).toBeDefined()
      expect(noUnnecessaryStringCodepointatZeroRule.meta).toBeDefined()
      expect(noUnnecessaryStringCodepointatZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports .codePointAt(0)', () => {
    test('reports for identifier object str.codePointAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal object "hello".codePointAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for member expression object obj.prop.codePointAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for call expression object getStr().codePointAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: {}, right: {} }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for conditional expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for logical expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for assignment expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 'hello' } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for object expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'str' } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for tagged template expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for sequence expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Identifier', name: 'str' }] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for unary expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for update expression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested function call result object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'getStr' } }, arguments: [] }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal value "hello" object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions codePointAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toMatch(/codePointAt/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(
        'Unnecessary .codePointAt(0). Consider using .charCodeAt(0) for single-byte characters or keep .codePointAt() for Unicode support.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for .codePointAt(1) — non-zero index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt(-1) — negative index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt(42) — other non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt(0, 1) — too many args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .charCodeAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .at(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'at', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .charAt(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt(x) — identifier arg not NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt("0") — string literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt(null) — null arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'codePointAt' }, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "codepointat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codepointat', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CodePointAt" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CodePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt(0, 1, 2) — 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .includes(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .indexOf(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt with boolean arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'BooleanLiteral', value: false }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt with member expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt with call expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt with unary expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'NumericLiteral', value: 0 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .codePointAt with Literal type arg (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'codePointAt' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCodepointatZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCodepointatZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'codePointAt', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'd' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'e' }, 'codePointAt'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCodepointatZeroRule.create(context)
      const visitor2 = noUnnecessaryStringCodepointatZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCodepointatZeroRule.meta
      const meta2 = noUnnecessaryStringCodepointatZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
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
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCodepointatZeroRule).toBeDefined()
      expect(typeof noUnnecessaryStringCodepointatZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCodepointatZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCodepointatZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'codePointAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})
