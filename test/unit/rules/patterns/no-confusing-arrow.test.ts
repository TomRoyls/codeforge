import { describe, expect, test, vi } from 'vitest'
import { noConfusingArrowRule } from '../../../../src/rules/patterns/no-confusing-arrow.js'
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
    getSource: () => 'const f = (x) => x ? a : b',
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

function makeVarDeclArrowTernary(
  name = 'f',
  paramList: unknown[] = [{ type: 'Identifier', name: 'x' }],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init: {
      type: 'ArrowFunctionExpression',
      params: paramList,
      body: {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      },
    },
    loc: makeLoc(line, column, line, column + 25),
  }
}

describe('no-confusing-arrow rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noConfusingArrowRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noConfusingArrowRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noConfusingArrowRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noConfusingArrowRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noConfusingArrowRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning arrow functions and conditional', () => {
      const desc = noConfusingArrowRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/arrow/)
      expect(desc).toMatch(/conditional/)
    })

    test('should have correct docs URL', () => {
      expect(noConfusingArrowRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-confusing-arrow',
      )
    })

    test('should have empty schema', () => {
      expect(noConfusingArrowRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noConfusingArrowRule).toBeDefined()
      expect(noConfusingArrowRule.meta).toBeDefined()
      expect(noConfusingArrowRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports arrow with ternary body', () => {
    test('reports const f = (x) => x ? a : b — arrow with ternary body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports.length).toBe(1)
    })

    test('reports const f = (x) => condition ? trueVal : falseVal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'condition' },
            consequent: { type: 'Identifier', name: 'trueVal' },
            alternate: { type: 'Identifier', name: 'falseVal' },
          },
        },
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports const f = x => x ? 1 : 0 — no parens on param', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports const f = (x, y) => x > y ? x : y — multi-param', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [
            { type: 'Identifier', name: 'x' },
            { type: 'Identifier', name: 'y' },
          ],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'BinaryExpression', operator: '>' },
            consequent: { type: 'Identifier', name: 'x' },
            alternate: { type: 'Identifier', name: 'y' },
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports let result = (a) => a ? b : c — let declarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('result'))
      expect(reports.length).toBe(1)
    })

    test('message mentions "arrow functions"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].message.toLowerCase()).toContain('arrow function')
    })

    test('message mentions "conditional expression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].message.toLowerCase()).toContain('conditional')
    })

    test('message mentions "if/else"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].message).toContain('if/else')
    })

    test('message mentions "parens"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].message.toLowerCase()).toContain('paren')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = makeVarDeclArrowTernary()
      visitor.VariableDeclarator(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f1'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f2'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f3'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f', undefined, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(33)
    })

    test('reports const getMax = (a, b) => a > b ? a : b', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('getMax'))
      expect(reports.length).toBe(1)
    })

    test('reports with zero-param arrow returning ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'flag' },
            consequent: { type: 'Literal', value: 1 },
            alternate: { type: 'Literal', value: 0 },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports arrow with nested ternary as body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'y' },
              consequent: { type: 'Identifier', name: 'a' },
              alternate: { type: 'Identifier', name: 'b' },
            },
            alternate: { type: 'Identifier', name: 'c' },
          },
        },
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports.length).toBe(1)
    })

    test('reports arrow with single rest-param returning ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'args' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f1'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f2'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f3'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f4'))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report const f = (x) => { return x ? a : b } — block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'ConditionalExpression',
                  test: { type: 'Identifier', name: 'x' },
                  consequent: { type: 'Identifier', name: 'a' },
                  alternate: { type: 'Identifier', name: 'b' },
                },
              },
            ],
          },
        },
        loc: makeLoc(1, 0, 1, 35),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x + 1 — BinaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 1 },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x — Identifier body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => someCall() — CallExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'someCall' },
            arguments: [],
          },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => ({ key: x ? a : b }) — ObjectExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ObjectExpression',
            properties: [],
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => [x ? a : b] — ArrayExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ArrayExpression',
            elements: [],
          },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = function(x) { return x ? a : b } — FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'FunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BlockStatement',
            body: [],
          },
        },
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report f = (x) => x ? a : b — AssignmentExpression, not VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'f' },
        right: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when init is not ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'makeFn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const obj = { method: () => x ? a : b } — Property, not VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'method' },
        value: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      expect(() => visitor.VariableDeclarator({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty source — node without relevant properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report const x = 5 — no init, no arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x ?? y — LogicalExpression, not Conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'LogicalExpression',
            operator: '??',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'y' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x && y — LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'LogicalExpression',
            operator: '&&',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'y' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x || y — LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'y' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with null init', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with missing init property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunction with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: null,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunction with block body containing ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'ConditionalExpression',
                  test: { type: 'Identifier', name: 'x' },
                  consequent: { type: 'Identifier', name: 'a' },
                  alternate: { type: 'Identifier', name: 'b' },
                },
              },
            ],
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      expect(() => visitor.VariableDeclarator('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      expect(() => visitor.VariableDeclarator(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => typeof x — UnaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'UnaryExpression',
            operator: 'typeof',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => new Foo() — NewExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Foo' },
            arguments: [],
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x === 1 — BinaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BinaryExpression',
            operator: '===',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 1 },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => -x — UnaryExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'UnaryExpression',
            operator: '-',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x++ — UpdateExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'UpdateExpression',
            operator: '++',
            argument: { type: 'Identifier', name: 'x' },
            prefix: false,
          },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x ? a : b where init is NOT ArrowFunction — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: { type: 'Literal', value: 'arrow' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with TaggedTemplateExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'html' },
          quasi: { type: 'TemplateLiteral', expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-VariableDeclarator node type — ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report VariableDeclarator with SequenceExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
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
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noConfusingArrowRule.create(ctx1)
      const visitor2 = noConfusingArrowRule.create(ctx2)

      visitor1.VariableDeclarator(makeVarDeclArrowTernary('f'))
      visitor2.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'g' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 15),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f1'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f2'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('VariableDeclarator with null init — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('VariableDeclarator with undefined init — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('ArrowFunction with null body — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: null,
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('ArrowFunction with block body containing ternary — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BlockStatement',
            body: [],
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f', undefined, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noConfusingArrowRule.create(context)
      const visitor2 = noConfusingArrowRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      // reports — arrow with ternary
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f1'))
      // does NOT report — arrow with Identifier body
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f2' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(2, 0, 2, 15),
      })
      // reports — arrow with ternary
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f3'))
      // does NOT report — not a VariableDeclarator type
      visitor.VariableDeclarator({
        type: 'AssignmentExpression',
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports — arrow with ternary
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f4'))
      expect(reports.length).toBe(3)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
      }
      visitor.VariableDeclarator(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports.length).toBe(3)
    })

    test('handles node with missing init property — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles VariableDeclarator with empty params array on arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f', []))
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f1'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('f2'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary('a'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('b'))
      visitor.VariableDeclarator(makeVarDeclArrowTernary('c'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is frozen or deeply equal across multiple accesses', () => {
      const meta1 = noConfusingArrowRule.meta
      const meta2 = noConfusingArrowRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noConfusingArrowRule', () => {
      expect(noConfusingArrowRule).toBeDefined()
      expect(typeof noConfusingArrowRule.create).toBe('function')
      expect(typeof noConfusingArrowRule.meta).toBe('object')
    })

    test('message mentions "regular function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      visitor.VariableDeclarator(makeVarDeclArrowTernary())
      expect(reports[0].message.toLowerCase()).toContain('regular function')
    })

    test('does not report const f = (x) => x instanceof Foo — BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'BinaryExpression',
            operator: 'instanceof',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'Foo' },
          },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => await x — AwaitExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'AwaitExpression',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => yield x — YieldExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'YieldExpression',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('reports const f = (x) => x ? "yes" : "no" — Literal consequent/alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Literal', value: 'yes' },
            alternate: { type: 'Literal', value: 'no' },
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('does not report const f = (x) => x => y ? a : b — nested arrow, outer body is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'y' }],
            body: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'y' },
              consequent: { type: 'Identifier', name: 'a' },
              alternate: { type: 'Identifier', name: 'b' },
            },
          },
        },
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('handles VariableDeclarator with destructured id', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'flag' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('does not report VariableDeclarator with SequenceExpression body arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'SequenceExpression',
            expressions: [
              { type: 'Identifier', name: 'x' },
              { type: 'Identifier', name: 'y' },
            ],
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('reports arrow with async flag still detected as arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          async: true,
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(1)
    })

    test('does not report VariableDeclarator with MemberExpression init', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report const f = (x) => x ? a : b — AssignmentExpression wrapper', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'f' },
        right: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arrow returning TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'TemplateLiteral',
            expressions: [{ type: 'Identifier', name: 'x' }],
            quasis: [],
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arrow returning AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConfusingArrowRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'f' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: {
            type: 'AssignmentExpression',
            operator: '=',
            left: { type: 'Identifier', name: 'y' },
            right: { type: 'Identifier', name: 'x' },
          },
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.VariableDeclarator(node)
      expect(reports.length).toBe(0)
    })
  })
})
