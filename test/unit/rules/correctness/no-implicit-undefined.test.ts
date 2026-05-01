import { describe, expect, test, vi } from 'vitest'
import { noImplicitUndefinedRule } from '../../../../src/rules/correctness/no-implicit-undefined.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'return undefined',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeReturnUndefined(line = 2, startCol = 4): unknown {
  return {
    type: 'ReturnStatement',
    argument: { type: 'Identifier', name: 'undefined' },
    loc: makeLoc(line, startCol, line, startCol + 16),
  }
}

describe('no-implicit-undefined rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noImplicitUndefinedRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noImplicitUndefinedRule.meta.severity).toBe('warn')
    })

    test('should have correct category "correctness"', () => {
      expect(noImplicitUndefinedRule.meta.docs?.category).toBe('correctness')
    })

    test('should not be recommended', () => {
      expect(noImplicitUndefinedRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noImplicitUndefinedRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning undefined and return', () => {
      const desc = noImplicitUndefinedRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/undefined/)
      expect(desc).toMatch(/return/)
    })

    test('should have correct docs URL', () => {
      expect(noImplicitUndefinedRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-implicit-undefined',
      )
    })

    test('should have empty schema', () => {
      expect(noImplicitUndefinedRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noImplicitUndefinedRule).toBeDefined()
      expect(noImplicitUndefinedRule.meta).toBeDefined()
      expect(noImplicitUndefinedRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports return undefined', () => {
    test('reports return undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports.length).toBe(1)
    })

    test('message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('message contains "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toContain('undefined')
    })

    test('message contains "return"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toMatch(/return/i)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      const node = makeReturnUndefined()
      visitor.ReturnStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports accumulation of multiple return undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      visitor.ReturnStatement(makeReturnUndefined())
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports.length).toBe(3)
    })

    test('message matches expected full text', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toBe(
        'Unnecessary return of `undefined`. Functions return undefined by default when no value is specified.',
      )
    })

    test('message contains "Functions return"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toContain('Functions return')
    })

    test('report loc has correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(5, 4))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc has correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(5, 8))
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report loc has correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(10, 0))
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('report loc has correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(2, 4))
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('reports with different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(1, 0))
      visitor.ReturnStatement(makeReturnUndefined(10, 0))
      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('message contains backtick-wrapped undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toContain('`undefined`')
    })

    test('message contains "by default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toContain('by default')
    })

    test('reports return undefined at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports return undefined at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(500, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('message contains "no value is specified"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0].message).toContain('no value is specified')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report return; (null argument)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(2, 4, 2, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return null', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: null },
        loc: makeLoc(2, 4, 2, 16),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 0 },
        loc: makeLoc(2, 4, 2, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return false', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: false },
        loc: makeLoc(2, 4, 2, 17),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: '' },
        loc: makeLoc(2, 4, 2, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return {}', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ObjectExpression', properties: [] },
        loc: makeLoc(2, 4, 2, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return foo (different identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(2, 4, 2, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is Literal — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is CallExpression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is MemberExpression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is BinaryExpression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is ConditionalExpression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is ArrowFunctionExpression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is ArrayExpression — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return true', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: true },
        loc: makeLoc(2, 4, 2, 16),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'hello' },
        loc: makeLoc(2, 4, 2, 19),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report identifier named "null"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'null' },
        loc: makeLoc(2, 4, 2, 16),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report identifier named "void"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'void' },
        loc: makeLoc(2, 4, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return number 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: makeLoc(2, 4, 2, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
          expressions: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Set' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return myVar identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'myVar' },
        loc: makeLoc(2, 4, 2, 17),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report return result identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'result' },
        loc: makeLoc(2, 4, 2, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report identifier named Undefined (capital U)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'Undefined' },
        loc: makeLoc(2, 4, 2, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noImplicitUndefinedRule.create(ctx1)
      const visitor2 = noImplicitUndefinedRule.create(ctx2)

      visitor1.ReturnStatement(makeReturnUndefined())
      visitor2.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: makeLoc(2, 4, 2, 14),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      visitor.ReturnStatement(makeReturnUndefined(3, 0))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
      }
      visitor.ReturnStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noImplicitUndefinedRule.create(context)
      const visitor2 = noImplicitUndefinedRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid and invalid reports count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(2, 4, 2, 10),
      })
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        loc: makeLoc(3, 4, 3, 14),
      })
      visitor.ReturnStatement(makeReturnUndefined(4, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(5, 4, 5, 14),
      })
      expect(reports.length).toBe(2)
    })

    test('multiple return undefined in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(1, 0))
      visitor.ReturnStatement(makeReturnUndefined(2, 0))
      visitor.ReturnStatement(makeReturnUndefined(3, 0))
      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('argument undefined property missing — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        loc: makeLoc(2, 4, 2, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is string "undefined" (Literal) — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 'undefined' },
        loc: makeLoc(2, 4, 2, 24),
      })
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 20),
        extra: { parenthesized: true },
        parent: { type: 'BlockStatement' },
        trailingComments: [],
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('return undefined in nested structure reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(5, 8, 5, 24),
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('toASTNode(null argument) returns null — no report', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(2, 4, 2, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports return undefined with identifier extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined', loc: makeLoc(2, 11, 2, 20) },
        loc: makeLoc(2, 4, 2, 20),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is the same reference across accesses', () => {
      const meta1 = noImplicitUndefinedRule.meta
      const meta2 = noImplicitUndefinedRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noImplicitUndefinedRule', () => {
      expect(noImplicitUndefinedRule).toBeDefined()
      expect(typeof noImplicitUndefinedRule.create).toBe('function')
      expect(typeof noImplicitUndefinedRule.meta).toBe('object')
    })

    test('message consistency across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      visitor.ReturnStatement(makeReturnUndefined(3, 0))
      const allSameMessage = reports.every(
        r => r.message === 'Unnecessary return of `undefined`. Functions return undefined by default when no value is specified.',
      )
      expect(allSameMessage).toBe(true)
    })

    test('report descriptor has all three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties on argument identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'Identifier',
          name: 'undefined',
          loc: makeLoc(2, 11, 2, 20),
          typeAnnotation: { type: 'TSTypeAnnotation' },
          optional: true,
        },
        loc: makeLoc(2, 4, 2, 20),
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('report loc end values are populated', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement(makeReturnUndefined(3, 8))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('does not report when argument is a string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 'undefined',
        loc: makeLoc(2, 4, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 42,
        loc: makeLoc(2, 4, 2, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'YieldExpression',
          argument: { type: 'Identifier', name: 'value' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'SequenceExpression',
          expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'items' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('meta docs has description string', () => {
      expect(typeof noImplicitUndefinedRule.meta.docs?.description).toBe('string')
      expect(noImplicitUndefinedRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta schema is an array', () => {
      expect(Array.isArray(noImplicitUndefinedRule.meta.schema)).toBe(true)
    })

    test('handles node type as non-string', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 123,
        argument: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report ClassExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitUndefinedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'ClassExpression',
          body: { type: 'ClassBody', body: [] },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
