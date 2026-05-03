import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberParseIntSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-parse-int-spread.js'
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

function makeSpreadCall(
  spreadArgument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Number' },
      property: { type: 'Identifier', name: 'parseInt' },
    },
    arguments: [
      { type: 'SpreadElement', argument: spreadArgument },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallWith(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-parse-int-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning parseInt', () => {
      const desc = noUnnecessaryNumberParseIntSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/parseint/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-parse-int-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberParseIntSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberParseIntSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Number.parseInt(...spread)', () => {
    test('reports for Number.parseInt(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.parseInt(...arr) with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toBe(
        'Number.parseInt(...items) with spread is unusual. parseInt() expects a string and optional radix.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      const node = makeSpreadCall({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with assignment expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for parseInt(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(items) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt("42") — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Literal', value: '42' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(x, 10) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }, { type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt("42", 10, "extra") — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Literal', value: '42' }, { type: 'Literal', value: 10 }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.parseInt(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Math', 'parseInt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseFloat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseFloat', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'isNaN', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isInteger(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'isInteger', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "number" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('number', 'parseInt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "NUMBER" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('NUMBER', 'parseInt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed MemberExpression Number["parseInt"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "parseint" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseint', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "PARSEINT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'PARSEINT', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Identifier', name: 'str' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt with regular identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Identifier', name: 'strVal' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt with literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Literal', value: '42' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.parseInt(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('myObj', 'parseInt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.toString(...items) — completely different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'toString', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberParseIntSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberParseIntSpreadRule.create(ctx2)
      visitor1.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      visitor2.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Identifier', name: 'str' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Identifier', name: 'str' }]))
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Identifier', name: 'str' }]))
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeCallWith('Math', 'parseInt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'values' }))
      visitor.CallExpression(makeCallWith('Number', 'parseInt', [{ type: 'Literal', value: '42' }, { type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberParseIntSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberParseIntSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberParseIntSpreadRule.meta
      const meta2 = noUnnecessaryNumberParseIntSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      const node = makeSpreadCall({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberParseIntSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberParseIntSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberParseIntSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'items' }, 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberParseIntSpreadRule.create(context)
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
