import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryParseFloatSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-parse-float-spread.js'
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

function makeParseFloatCall(
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'parseFloat',
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-parse-float-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parseFloat', () => {
      const desc = noUnnecessaryParseFloatSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parsefloat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-parse-float-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryParseFloatSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryParseFloatSpreadRule).toBeDefined()
      expect(noUnnecessaryParseFloatSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryParseFloatSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary parseFloat spread', () => {
    test('reports for parseFloat(...items) with Identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(...arr) with different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(...obj.prop) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(...getItems()) with CallExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(...a) with BinaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(...[]) with ArrayExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parseFloat(...[1]) with non-empty ArrayExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions parseFloat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/parseFloat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'parseFloat(...items) with spread is unusual. parseFloat() expects a single string.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      const node = makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports when spread argument is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for parseFloat("123") — Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Literal', value: '123' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(123) — number Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Literal', value: 123 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseInt(...items) — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(...items) — wrong function name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.parseFloat(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'parseFloat' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.method(...items) — MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "ParseFloat" (case sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ParseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "parsefloat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parsefloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(a, b, c) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Literal', value: '42' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'str' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ArrayExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is ObjectExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "PARSEFLOAT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'PARSEFLOAT' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat(...items, extra) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is MemberExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for parseFloat with TemplateLiteral argument (not spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryParseFloatSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryParseFloatSpreadRule.create(ctx2)
      visitor1.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([{ type: 'Literal', value: '42' }]))
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(makeParseFloatCall([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryParseFloatSpreadRule.create(context)
      const visitor2 = noUnnecessaryParseFloatSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryParseFloatSpreadRule.meta
      const meta2 = noUnnecessaryParseFloatSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      const node = makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryParseFloatSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryParseFloatSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryParseFloatSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles SpreadElement with complex nested argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'getValues' },
        },
        arguments: [{ type: 'Literal', value: 1 }],
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for parseFloat with five arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      const args = Array.from({ length: 5 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeParseFloatCall(args))
      expect(reports.length).toBe(0)
    })

    test('handles when arguments[0] is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([undefined]))
      expect(reports.length).toBe(0)
    })

    test('handles when arguments is an empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([]))
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement where argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryParseFloatSpreadRule.create(context)
      visitor.CallExpression(makeParseFloatCall([makeSpreadElement(null)]))
      expect(reports.length).toBe(1)
    })
  })
})
