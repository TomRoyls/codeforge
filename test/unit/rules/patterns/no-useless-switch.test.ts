import { describe, expect, test, vi } from 'vitest'
import { noUselessSwitchRule } from '../../../../src/rules/patterns/no-useless-switch.js'
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
    getSource: () => 'switch (x) { default: break; }',
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

function makeSwitchWithOnlyDefault(
  defaultBody: unknown[] = [{ type: 'BreakStatement' }],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'x' },
    cases: [
      {
        type: 'SwitchCase',
        test: null,
        consequent: defaultBody,
      },
    ],
    loc: makeLoc(line, column, line, column + 30),
  }
}

describe('no-useless-switch rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessSwitchRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessSwitchRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessSwitchRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessSwitchRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessSwitchRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning switch and default', () => {
      const desc = noUselessSwitchRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/switch/)
      expect(desc).toMatch(/default/)
    })

    test('should have correct docs URL', () => {
      expect(noUselessSwitchRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-switch',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessSwitchRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with SwitchStatement', () => {
      const { context } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(visitor).toHaveProperty('SwitchStatement')
      expect(typeof visitor.SwitchStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessSwitchRule).toBeDefined()
      expect(noUselessSwitchRule.meta).toBeDefined()
      expect(noUselessSwitchRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports switch with only default case', () => {
    test('reports switch with single default case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(1)
    })

    test('reports switch with default containing break', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'val' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('message contains "switch"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports[0].message.toLowerCase()).toContain('switch')
    })

    test('message contains "default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports[0].message.toLowerCase()).toContain('default')
    })

    test('message mentions "if statement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports[0].message.toLowerCase()).toContain('if statement')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = makeSwitchWithOnlyDefault()
      visitor.SwitchStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault([{ type: 'BreakStatement' }], 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(38)
    })

    test('reports multiple switch-only-default violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(3)
    })

    test('reports switch with default containing return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch with default containing expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'ExpressionStatement',
                expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'doSomething' }, arguments: [] },
              },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch with empty default case body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch with complex default body containing multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'ExpressionStatement',
                expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'log' }, arguments: [] },
              },
              { type: 'BreakStatement' },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(4)
    })

    test('reports switch with default having assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '=',
                  left: { type: 'Identifier', name: 'result' },
                  right: { type: 'Literal', value: 0 },
                },
              },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 35),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch where discriminant is a complex expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 35),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch with default containing throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'ThrowStatement',
                argument: {
                  type: 'NewExpression',
                  callee: { type: 'Identifier', name: 'Error' },
                  arguments: [{ type: 'Literal', value: 'fail' }],
                },
              },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch with default containing if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'IfStatement',
                test: { type: 'Identifier', name: 'flag' },
                consequent: { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
              },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 45),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports switch with default containing variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'VariableDeclaration',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'y' },
                    init: { type: 'Literal', value: 10 },
                  },
                ],
                kind: 'const',
              },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report switch with one case clause', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 1 },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with multiple case clauses', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 1 },
            consequent: [{ type: 'BreakStatement' }],
          },
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 2 },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 50),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case AND default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 1 },
            consequent: [{ type: 'BreakStatement' }],
          },
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 50),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if-else statement — IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-SwitchStatement node — ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-SwitchStatement node — VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(() => visitor.SwitchStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(() => visitor.SwitchStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-SwitchStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(() => visitor.SwitchStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report empty switch — no cases at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with only case and no default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 'a' },
            consequent: [{ type: 'BreakStatement' }],
          },
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 'b' },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(() => visitor.SwitchStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(() => visitor.SwitchStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SwitchStatement with cases not being an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: 'not an array',
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SwitchStatement with cases being null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SwitchStatement with cases being undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with many case clauses and default at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { type: 'SwitchCase', test: { type: 'Literal', value: 1 }, consequent: [{ type: 'BreakStatement' }] },
          { type: 'SwitchCase', test: { type: 'Literal', value: 2 }, consequent: [{ type: 'BreakStatement' }] },
          { type: 'SwitchCase', test: { type: 'Literal', value: 3 }, consequent: [{ type: 'BreakStatement' }] },
          { type: 'SwitchCase', test: null, consequent: [{ type: 'BreakStatement' }] },
        ],
        loc: makeLoc(1, 0, 1, 80),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case using MemberExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'key' },
            },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case using Identifier test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Identifier', name: 'someConst' },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case using string literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'action' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 'ADD' },
            consequent: [{ type: 'BreakStatement' }],
          },
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 'DELETE' },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 60),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case using template literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case having undefined test (not null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: undefined,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessSwitchRule.create(ctx1)
      const visitor2 = noUselessSwitchRule.create(ctx2)

      visitor1.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor2.SwitchStatement({
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { type: 'SwitchCase', test: { type: 'Literal', value: 1 }, consequent: [{ type: 'BreakStatement' }] },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      // reports — switch with only default
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      // does NOT report — switch with case clauses
      visitor.SwitchStatement({
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { type: 'SwitchCase', test: { type: 'Literal', value: 1 }, consequent: [{ type: 'BreakStatement' }] },
        ],
        loc: makeLoc(2, 0, 2, 30),
      })
      // reports — switch with only default
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      // does NOT report — IfStatement node type
      visitor.SwitchStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(3, 0, 3, 20),
      })
      // reports — switch with only default
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(3)
    })

    test('default location is used when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
      }
      visitor.SwitchStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('switch with empty default case body still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('switch with complex default body still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'ExpressionStatement',
                expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
              },
              {
                type: 'IfStatement',
                test: { type: 'Identifier', name: 'y' },
                consequent: { type: 'BlockStatement', body: [] },
              },
              { type: 'BreakStatement' },
            ],
          },
        ],
        loc: makeLoc(1, 0, 3, 5),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessSwitchRule.create(context)
      const visitor2 = noUselessSwitchRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(3)
    })

    test('handles SwitchStatement with cases containing null entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [null],
        loc: makeLoc(1, 0, 1, 20),
      }

      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('location with specific line/column values preserved in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = makeSwitchWithOnlyDefault([{ type: 'BreakStatement' }], 10, 4)
      visitor.SwitchStatement(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles switch where cases array contains non-SwitchCase objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { type: 'Literal', value: 1 },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles SwitchStatement without discriminant property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles boolean false as node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      expect(() => visitor.SwitchStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noUselessSwitchRule.meta
      const meta2 = noUselessSwitchRule.meta
      expect(meta1).toBe(meta2)
    })

    test('switch with multiple default cases — reports since no non-default cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          { type: 'SwitchCase', test: null, consequent: [{ type: 'BreakStatement' }] },
          { type: 'SwitchCase', test: null, consequent: [{ type: 'BreakStatement' }] },
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('switch with default having break reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('switch with default having return reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              { type: 'ReturnStatement', argument: { type: 'Literal', value: 0 } },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })

    test('rule name is exported as noUselessSwitchRule', () => {
      expect(noUselessSwitchRule).toBeDefined()
      expect(typeof noUselessSwitchRule.create).toBe('function')
      expect(typeof noUselessSwitchRule.meta).toBe('object')
    })

    test('does not report switch with case using BooleanLiteral test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'BooleanLiteral', value: true },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report switch with case using numeric literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'NumericLiteral', value: 42 },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('message mentions removing the switch', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      visitor.SwitchStatement(makeSwitchWithOnlyDefault())
      expect(reports[0].message.toLowerCase()).toContain('switch')
    })

    test('switch with case clause using 0 as test value does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 0 },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('switch with case clause using empty string as test value does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: '' },
            consequent: [{ type: 'BreakStatement' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(0)
    })

    test('meta description is non-empty string', () => {
      expect(typeof noUselessSwitchRule.meta.docs?.description).toBe('string')
      expect(noUselessSwitchRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('meta docs URL follows the expected pattern', () => {
      const url = noUselessSwitchRule.meta.docs?.url
      expect(url).toMatch(/^https:\/\/codeforge\.dev\/docs\/rules\//)
    })

    test('switch with only default and fall-through consequent reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessSwitchRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [
          {
            type: 'SwitchCase',
            test: null,
            consequent: [
              {
                type: 'ExpressionStatement',
                expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'handleDefault' }, arguments: [] },
              },
            ],
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.SwitchStatement(node)
      expect(reports.length).toBe(1)
    })
  })
})
