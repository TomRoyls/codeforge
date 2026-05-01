import { describe, expect, test, vi } from 'vitest'
import { noInvalidUseBeforeDefRule } from '../../../../src/rules/correctness/no-invalid-use-before-def.js'
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
    getSource: () => 'const x = x',
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

function makeSelfAssign(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init: { type: 'Identifier', name },
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-invalid-use-before-def rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noInvalidUseBeforeDefRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noInvalidUseBeforeDefRule.meta.severity).toBe('warn')
    })

    test('should have correct category "correctness"', () => {
      expect(noInvalidUseBeforeDefRule.meta.docs?.category).toBe('correctness')
    })

    test('should not be recommended', () => {
      expect(noInvalidUseBeforeDefRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noInvalidUseBeforeDefRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning variable and assignment', () => {
      const desc = noInvalidUseBeforeDefRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/variable/)
      expect(desc).toMatch(/assign/)
    })

    test('should have correct docs URL', () => {
      expect(noInvalidUseBeforeDefRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-invalid-use-before-def',
      )
    })

    test('should have empty schema', () => {
      expect(noInvalidUseBeforeDefRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noInvalidUseBeforeDefRule).toBeDefined()
      expect(noInvalidUseBeforeDefRule.meta).toBeDefined()
      expect(noInvalidUseBeforeDefRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports self-assignment', () => {
    test('reports const x = x — identifier self-assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports.length).toBe(1)
    })

    test('reports let y = y — let declarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('y'))
      expect(reports.length).toBe(1)
    })

    test('reports var z = z — var declarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('z'))
      expect(reports.length).toBe(1)
    })

    test('message mentions the variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('myVar'))
      expect(reports[0].message).toContain('myVar')
    })

    test('message mentions "mistake"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].message).toMatch(/mistake/i)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = makeSelfAssign('x')
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('a'))
      visitor.VariableDeclarator(makeSelfAssign('b'))
      visitor.VariableDeclarator(makeSelfAssign('c'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports const foo = foo — longer variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('foo'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('reports const _private = _private — underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('_private'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('reports const $jquery = $jquery — dollar prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('$jquery'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('message contains backtick-wrapped variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('target'))
      expect(reports[0].message).toContain('`target`')
    })

    test('message contains "assigned to itself"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].message).toContain('assigned to itself')
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports.length).toBe(1)
    })

    test('reports const camelCase = camelCase — camelCase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('camelCase'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('camelCase')
    })

    test('reports const UPPER_CASE = UPPER_CASE — constant-style name', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('UPPER_CASE'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('UPPER_CASE')
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('a'))
      visitor.VariableDeclarator(makeSelfAssign('b'))
      visitor.VariableDeclarator(makeSelfAssign('c'))
      visitor.VariableDeclarator(makeSelfAssign('d'))
      expect(reports.length).toBe(4)
    })

    test('reports const num1 = num1 — name with digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('num1'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('num1')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report const x = 5 — Literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const x = y — different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const x = fn() — CallExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is non-Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is null — no initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type — ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles wrong node type — Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when id is MemberExpression (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is CallExpression (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [{ type: 'Identifier', name: 'x' }],
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'ArrayExpression',
          elements: [{ type: 'Identifier', name: 'x' }],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'ObjectExpression',
          properties: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id and init have different identifier names', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression — not VariableDeclarator type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id is ObjectPattern (destructuring)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id is ArrayPattern (destructuring)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ArrayPattern', elements: [] },
        init: { type: 'Identifier', name: 'arr' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'fn' },
        init: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'fn' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'UnaryExpression',
          operator: '-',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Foo' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is TaggedTemplateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'html' },
          quasi: { type: 'TemplateLiteral', expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when init is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when id is non-ObjectPattern but init is same Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'x' } }] },
        init: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: {
          type: 'YieldExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property node — not VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'x' },
        value: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noInvalidUseBeforeDefRule.create(ctx1)
      const visitor2 = noInvalidUseBeforeDefRule.create(ctx2)

      visitor1.VariableDeclarator(makeSelfAssign('x'))
      visitor2.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'y' },
        init: { type: 'Identifier', name: 'z' },
        loc: makeLoc(1, 0, 1, 10),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('a'))
      visitor.VariableDeclarator(makeSelfAssign('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'x' },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      // reports — self-assign
      visitor.VariableDeclarator(makeSelfAssign('a'))
      // does NOT report — different names
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'b' },
        init: { type: 'Identifier', name: 'c' },
        loc: makeLoc(2, 0, 2, 10),
      })
      // reports — self-assign
      visitor.VariableDeclarator(makeSelfAssign('d'))
      // does NOT report — not VariableDeclarator type
      visitor.VariableDeclarator({
        type: 'AssignmentExpression',
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports — self-assign
      visitor.VariableDeclarator(makeSelfAssign('e'))
      expect(reports.length).toBe(3)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier', name: 'x' },
      }
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noInvalidUseBeforeDefRule.create(context)
      const visitor2 = noInvalidUseBeforeDefRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      visitor.VariableDeclarator(makeSelfAssign('x'))
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing init property — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('destructuring pattern id with ObjectPattern — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('undefined name in init does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node where id is null — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: null,
        init: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles node where id is undefined — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        init: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('undefined name in id does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier' },
        init: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('both names undefined — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier' },
        init: { type: 'Identifier' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('a'))
      visitor.VariableDeclarator(makeSelfAssign('b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('`a`')
      expect(reports[1].message).toContain('`b`')
    })

    test('message is consistent for same variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noInvalidUseBeforeDefRule.meta
      const meta2 = noInvalidUseBeforeDefRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noInvalidUseBeforeDefRule', () => {
      expect(noInvalidUseBeforeDefRule).toBeDefined()
      expect(typeof noInvalidUseBeforeDefRule.create).toBe('function')
      expect(typeof noInvalidUseBeforeDefRule.meta).toBe('object')
    })

    test('message mentions "likely a mistake"', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].message).toContain('likely a mistake')
    })

    test('var declaration detected — var myVar = myVar', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('myVar'))
      expect(reports.length).toBe(1)
    })

    test('let declaration detected — let counter = counter', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('counter'))
      expect(reports.length).toBe(1)
    })

    test('const declaration detected — const value = value', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('value'))
      expect(reports.length).toBe(1)
    })

    test('null init does not cause error', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined name in init Identifier — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Identifier' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('various variable names all detected', () => {
      const names = ['a', 'b', 'c', 'd', 'e']
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      for (const name of names) {
        visitor.VariableDeclarator(makeSelfAssign(name))
      }
      expect(reports.length).toBe(5)
    })

    test('report loc start and end are different objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidUseBeforeDefRule.create(context)
      visitor.VariableDeclarator(makeSelfAssign('x'))
      expect(reports[0].loc?.start).not.toBe(reports[0].loc?.end)
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noInvalidUseBeforeDefRule.meta.docs?.description).toBe('string')
      expect(noInvalidUseBeforeDefRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

  })
})
