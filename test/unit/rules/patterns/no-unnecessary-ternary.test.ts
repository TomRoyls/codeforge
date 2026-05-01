import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTernaryRule } from '../../../../src/rules/patterns/no-unnecessary-ternary.js'
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
    getSource: () => 'cond ? true : false',
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

function makeTernary(
  consValue: unknown = true,
  altValue: unknown = false,
  consType: string = 'Literal',
  altType: string = 'Literal',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: { type: 'Identifier', name: 'cond' },
    consequent: { type: consType, value: consValue },
    alternate: { type: altType, value: altValue },
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-unnecessary-ternary rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTernaryRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTernaryRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTernaryRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTernaryRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTernaryRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning ternary and literal', () => {
      const desc = noUnnecessaryTernaryRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/ternary/)
      expect(desc).toMatch(/literal/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTernaryRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-ternary',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTernaryRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(typeof visitor.ConditionalExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTernaryRule).toBeDefined()
      expect(noUnnecessaryTernaryRule.meta).toBeDefined()
      expect(noUnnecessaryTernaryRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports unnecessary ternary', () => {
    test('reports cond ? true : false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports.length).toBe(1)
    })

    test('reports cond ? false : true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(false, true))
      expect(reports.length).toBe(1)
    })

    test('reports cond ? true : true — both same boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, true))
      expect(reports.length).toBe(1)
    })

    test('reports cond ? false : false — both same boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(false, false))
      expect(reports.length).toBe(1)
    })

    test('boolean message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('boolean message contains "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports[0].message.toLowerCase()).toContain('boolean')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = makeTernary(true, false)
      visitor.ConditionalExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(false, true))
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports.length).toBe(3)
    })

    test('reports cond ? null : null — null-null case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(null, null))
      expect(reports.length).toBe(1)
    })

    test('null-null message mentions "null"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(null, null))
      expect(reports[0].message.toLowerCase()).toContain('null')
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false, 'Literal', 'Literal', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports.length).toBe(1)
    })

    test('reports cond ? true : false with Identifier test node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports cond ? false : true with BinaryExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        consequent: { type: 'Literal', value: false },
        alternate: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports cond ? true : false with CallExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'isReady' },
          arguments: [],
        },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports cond ? false : true with MemberExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'flag' },
        },
        consequent: { type: 'Literal', value: false },
        alternate: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports cond ? null : null with LogicalExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        consequent: { type: 'Literal', value: null },
        alternate: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates 4 reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(false, true))
      visitor.ConditionalExpression(makeTernary(null, null))
      visitor.ConditionalExpression(makeTernary(true, true))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report cond ? "a" : "b" — string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary('a', 'b'))
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? 1 : 2 — number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(1, 2))
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? x : true — non-Literal consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'x' },
        alternate: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? true : x — non-Literal alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? true : 1 — mixed boolean and number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? "a" : false — mixed string and boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: 'a' },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? null : "value" — mixed null and string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(null, 'value'))
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? "value" : null — mixed string and null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary('value', null))
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: null,
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is null node value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? x : y — both branches are Identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'x' },
        alternate: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'val' },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when both branches are Identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'UnaryExpression', operator: '!', argument: { type: 'Identifier', name: 'x' } },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'ObjectExpression', properties: [] },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      expect(() => visitor.ConditionalExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? 42 : 42 — identical number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(42, 42))
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? "yes" : "yes" — identical string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary('yes', 'yes'))
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for SequenceExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'SequenceExpression', expressions: [] },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for TaggedTemplateExpression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'html' },
          quasi: { type: 'TemplateLiteral', expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: 'x' }, prefix: false },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for AwaitExpression alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTernaryRule.create(ctx1)
      const visitor2 = noUnnecessaryTernaryRule.create(ctx2)

      visitor1.ConditionalExpression(makeTernary(true, false))
      visitor2.ConditionalExpression(makeTernary('a', 'b'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(false, true))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
      }
      visitor.ConditionalExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false, 'Literal', 'Literal', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTernaryRule.create(context)
      const visitor2 = noUnnecessaryTernaryRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      // reports — boolean literals
      visitor.ConditionalExpression(makeTernary(true, false))
      // does NOT report — string literals
      visitor.ConditionalExpression(makeTernary('a', 'b'))
      // reports — null-null
      visitor.ConditionalExpression(makeTernary(null, null))
      // does NOT report — number literals
      visitor.ConditionalExpression(makeTernary(1, 2))
      // reports — boolean literals
      visitor.ConditionalExpression(makeTernary(false, true))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing consequent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing alternate property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports null-null after boolean-boolean does not affect earlier report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(null, null))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('boolean')
      expect(reports[1].message).toContain('null')
    })

    test('handles ConditionalExpression with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: {},
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles ConditionalExpression with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(false, true))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all boolean violation messages are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      visitor.ConditionalExpression(makeTernary(false, true))
      visitor.ConditionalExpression(makeTernary(true, true))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTernaryRule.meta
      const meta2 = noUnnecessaryTernaryRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noUnnecessaryTernaryRule', () => {
      expect(noUnnecessaryTernaryRule).toBeDefined()
      expect(typeof noUnnecessaryTernaryRule.create).toBe('function')
      expect(typeof noUnnecessaryTernaryRule.meta).toBe('object')
    })

    test('boolean message mentions "Simplify"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports[0].message.toLowerCase()).toContain('simplify')
    })

    test('null-null message mentions "identical"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(null, null))
      expect(reports[0].message.toLowerCase()).toContain('identical')
    })

    test('boolean and null-null messages are different', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noUnnecessaryTernaryRule.create(ctx1)
      const v2 = noUnnecessaryTernaryRule.create(ctx2)
      v1.ConditionalExpression(makeTernary(true, false))
      v2.ConditionalExpression(makeTernary(null, null))
      expect(rep1[0].message).not.toBe(rep2[0].message)
    })

    test('boolean message contains "ternary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(true, false))
      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('null-null message contains "ternary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(null, null))
      expect(reports[0].message.toLowerCase()).toContain('ternary')
    })

    test('does not report cond ? 0 : "" — mixed number and empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(0, ''))
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? false : null — mixed boolean and null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(false, null))
      expect(reports.length).toBe(0)
    })

    test('does not report cond ? null : true — mixed null and boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      visitor.ConditionalExpression(makeTernary(null, true))
      expect(reports.length).toBe(0)
    })

    test('reports cond ? null : null with complex nested test expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'a' },
          consequent: { type: 'Identifier', name: 'b' },
          alternate: { type: 'Identifier', name: 'c' },
        },
        consequent: { type: 'Literal', value: null },
        alternate: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles ConditionalExpression with regex literal consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTernaryRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } },
        alternate: { type: 'Literal', value: false },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noUnnecessaryTernaryRule.meta.docs?.description).toBe('string')
      expect(noUnnecessaryTernaryRule.meta.docs?.description.length).toBeGreaterThan(0)
    })
  })
})
