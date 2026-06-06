import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryVoidOperatorRule } from '../../../../src/rules/patterns/no-unnecessary-void-operator.js'
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

function makeVoidNode(
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'void',
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-void-operator rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning void', () => {
      const desc = noUnnecessaryVoidOperatorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/void/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-void-operator.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryVoidOperatorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryVoidOperatorRule).toBeDefined()
      expect(noUnnecessaryVoidOperatorRule.meta).toBeDefined()
      expect(noUnnecessaryVoidOperatorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (29) =====

  describe('positive cases — reports unnecessary void', () => {
    test('reports void 0 — NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports void 42 — NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports void 3.14 — NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports void -1 — NumericLiteral with negative value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports void 1e6 — NumericLiteral with large value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 1e6 }))
      expect(reports.length).toBe(1)
    })

    test('reports void 0.5 — NumericLiteral with float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0.5 }))
      expect(reports.length).toBe(1)
    })

    test('reports void "hello" — StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports void "" — StringLiteral empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports void "world" — StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'world' }))
      expect(reports.length).toBe(1)
    })

    test('reports void true — BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'BooleanLiteral', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports void false — BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'BooleanLiteral', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports void null — NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'NullLiteral' }))
      expect(reports.length).toBe(1)
    })

    test('reports void 0 — Literal with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports void 42 — Literal with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports void "hello" — Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports void "" — Literal with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports void true — Literal with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: true }))
      expect(reports.length).toBe(1)
    })

    test('reports void false — Literal with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: false }))
      expect(reports.length).toBe(1)
    })

    test('reports void null — Literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: null }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary void', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports[0].message).toMatch(/void/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports[0].message).toBe(
        'Unnecessary void operator on a literal. `void literal` always returns undefined regardless.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      const node = makeVoidNode({ type: 'Literal', value: 0 })
      visitor.UnaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }, 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'x' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'x' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports void with multi-char string — StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'abcdef' }))
      expect(reports.length).toBe(1)
    })

    test('reports void with long string — StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'a'.repeat(100) }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for void with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with nested UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'UnaryExpression', operator: 'void', argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with ThisExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'ThisExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'x' }, prefix: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void with AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ! operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for - operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for + operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ~ operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for delete operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', argument: { type: 'Literal', value: 0 }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'void', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'void', argument: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryVoidOperatorRule.create(ctx1)
      const visitor2 = noUnnecessaryVoidOperatorRule.create(ctx2)
      visitor1.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      visitor2.UnaryExpression(makeVoidNode({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      visitor.UnaryExpression(makeVoidNode({ type: 'Identifier', name: 'x' }))
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'y' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Identifier', name: 'x' }))
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      visitor.UnaryExpression(makeVoidNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 'a' }))
      visitor.UnaryExpression(makeVoidNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryVoidOperatorRule.create(context)
      const visitor2 = noUnnecessaryVoidOperatorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryVoidOperatorRule.meta
      const meta2 = noUnnecessaryVoidOperatorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      const node = makeVoidNode({ type: 'Literal', value: 0 })
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryVoidOperatorRule).toBeDefined()
      expect(typeof noUnnecessaryVoidOperatorRule.create).toBe('function')
      expect(typeof noUnnecessaryVoidOperatorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }, 10, 4, 10, 15))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryVoidOperatorRule.create(context)
      visitor.UnaryExpression(makeVoidNode({ type: 'Literal', value: 0 }))
      visitor.UnaryExpression(makeVoidNode({ type: 'NullLiteral' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
