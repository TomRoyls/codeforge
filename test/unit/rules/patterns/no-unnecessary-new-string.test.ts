import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewStringRule } from '../../../../src/rules/patterns/no-unnecessary-new-string.js'
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

function makeNewExpr(
  calleeName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-new-string rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewStringRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewStringRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewStringRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryNewStringRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewStringRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning String', () => {
      const desc = noUnnecessaryNewStringRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/string/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewStringRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-new-string.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewStringRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewStringRule).toBeDefined()
      expect(noUnnecessaryNewStringRule.meta).toBeDefined()
      expect(noUnnecessaryNewStringRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (34) =====

  describe('positive cases — reports new String()', () => {
    test('reports for new String() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports.length).toBe(1)
    })

    test('reports for new String("") with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String("hello") with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(42) with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(true) with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(null) with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(x) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(obj.prop) with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(fn()) with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(template) with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(a, b) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(undefined) with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(0) with zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(false) with false argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String([...arr]) with spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(obj) with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String([1,2]) with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(cond ? a : b) with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(() => {}) with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(/regex/) with regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary use of new String', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].message).toMatch(/new String/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].message).toBe(
        'Unnecessary use of new String(). Use a string literal instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      const node = makeNewExpr('String')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'test' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for new String(NaN) with NaN argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String(Infinity) with Infinity argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new String with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Boolean'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Promise'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Date'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyCustomClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('MyCustomClass'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new string() — lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('string'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new STRING() — uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('STRING'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Str() — partial name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Str'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new StringWrapper() — extended name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('StringWrapper'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ns' },
          property: { type: 'Identifier', name: 'String' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Literal', value: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Function'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Symbol() — no Symbol constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Symbol'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewStringRule.create(ctx1)
      const visitor2 = noUnnecessaryNewStringRule.create(ctx2)
      visitor1.NewExpression(makeNewExpr('String'))
      visitor2.NewExpression(makeNewExpr('Number'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Number'))
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('Number'))
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('Boolean'))
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'x' }]))
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewStringRule.create(context)
      const visitor2 = noUnnecessaryNewStringRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewStringRule.meta
      const meta2 = noUnnecessaryNewStringRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
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
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      const node = makeNewExpr('String')
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewStringRule).toBeDefined()
      expect(typeof noUnnecessaryNewStringRule.create).toBe('function')
      expect(typeof noUnnecessaryNewStringRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewStringRule.create(context)
      visitor.NewExpression(makeNewExpr('String'))
      visitor.NewExpression(makeNewExpr('String', [{ type: 'Literal', value: 'test' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
