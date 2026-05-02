import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringPadStartZero } from '../../../../src/rules/patterns/no-unnecessary-string-pad-start-zero.js'
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
  args: unknown[] = [{ type: 'NumericLiteral', value: 0 }],
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

describe('no-unnecessary-string-pad-start-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringPadStartZero.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringPadStartZero.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringPadStartZero.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringPadStartZero.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringPadStartZero.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning padStart', () => {
      const desc = noUnnecessaryStringPadStartZero.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/padstart/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringPadStartZero.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-pad-start-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringPadStartZero.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringPadStartZero).toBeDefined()
      expect(noUnnecessaryStringPadStartZero.meta).toBeDefined()
      expect(noUnnecessaryStringPadStartZero.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports padStart(0)', () => {
    test('reports for identifier.padStart(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal "hello".padStart(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.padStart(0) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().padStart(0) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for this.padStart(0) — ThisExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (a + b).padStart(0) — BinaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for [].padStart(0) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Foo().padStart(0) — NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (x ? a : b).padStart(0) — ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions padStart', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports[0].message).toMatch(/padStart/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports[0].message).toBe(
        'String.prototype.padStart(0) has no effect. The string length is unchanged.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for (function(){}).padStart(0) — FunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (void x).padStart(0) — UnaryExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (a && b).padStart(0) — LogicalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (a = b).padStart(0) — AssignmentExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (await x).padStart(0) — AwaitExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for `hello`.padStart(0) — TemplateLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (a, b).padStart(0) — SequenceExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for ({}).padStart(0) — ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for (() => {}).padStart(0) — ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'padStart'))
      expect(reports.length).toBe(1)
    })

    test('reports for tag`hello`.padStart(0) — TaggedTemplateExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }, 'padStart'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for padStart(5) — non-zero positive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(1) — non-zero positive small', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(-1) — negative value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(0.5) — non-integer value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(100) — large positive value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart("0") — Literal string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart(0, "x") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 0 }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for padStart() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for padEnd(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report for repeat(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'repeat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for charAt(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt'))
      expect(reports.length).toBe(0)
    })

    test('does not report for startsWith(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith'))
      expect(reports.length).toBe(0)
    })

    test('does not report for padstart(0) — lowercase method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padstart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'padStart' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "padEnd"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
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
      const visitor = noUnnecessaryStringPadStartZero.create(context)
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

    test('does not report when property name is "PadStart" — different case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'PadStart'))
      expect(reports.length).toBe(0)
    })

    test('does not report for argument type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getLen' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for argument type MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'len' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for argument type Literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for argument type Literal with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringPadStartZero.create(ctx1)
      const visitor2 = noUnnecessaryStringPadStartZero.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padEnd'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringPadStartZero.create(context)
      const visitor2 = noUnnecessaryStringPadStartZero.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringPadStartZero.meta
      const meta2 = noUnnecessaryStringPadStartZero.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
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
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
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
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringPadStartZero).toBeDefined()
      expect(typeof noUnnecessaryStringPadStartZero.create).toBe('function')
      expect(typeof noUnnecessaryStringPadStartZero.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart', [{ type: 'NumericLiteral', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'padStart' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'padStart' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringPadStartZero.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'padStart'))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'padStart'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
