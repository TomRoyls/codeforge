import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryElseRule } from '../../../../src/rules/patterns/no-unnecessary-else.js'
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
    getSource: () => '',
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

function makeIfNode(
  lastBodyType = 'ReturnStatement',
  opts: {
    hasAlternate?: boolean
    alternateType?: string
    consequentType?: string
    consequentBody?: unknown[]
    loc?: unknown
  } = {},
): unknown {
  const {
    hasAlternate = true,
    alternateType = 'BlockStatement',
    consequentType = 'BlockStatement',
    consequentBody,
    loc = makeLoc(1, 0, 1, 10),
  } = opts

  const body = consequentBody ?? [{ type: lastBodyType, argument: null }]
  const node: Record<string, unknown> = {
    type: 'IfStatement',
    test: { type: 'Identifier', name: 'cond' },
    consequent:
      consequentType === 'BlockStatement'
        ? { type: 'BlockStatement', body }
        : { type: consequentType },
    loc,
  }

  if (hasAlternate) {
    if (alternateType === 'BlockStatement') {
      node.alternate = {
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } },
        ],
      }
    } else {
      node.alternate = { type: alternateType }
    }
  }

  return node
}

// ===== META TESTS (8) =====

describe('no-unnecessary-else rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryElseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryElseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryElseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryElseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryElseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unnecessary else', () => {
      const desc =
        noUnnecessaryElseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/else/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryElseRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-else',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryElseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryElseRule).toBeDefined()
      expect(noUnnecessaryElseRule.meta).toBeDefined()
      expect(noUnnecessaryElseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====

  describe('positive cases — reports unnecessary else', () => {
    test('reports for ReturnStatement as last body with BlockStatement alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for ThrowStatement as last body with BlockStatement alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ThrowStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for BreakStatement as last body with BlockStatement alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement as last body with BlockStatement alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for ReturnStatement with argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Identifier', name: 'value' },
            },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ThrowStatement with new Error argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ThrowStatement', {
          consequentBody: [
            {
              type: 'ThrowStatement',
              argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' } },
            },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with multiple statements before ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
            { type: 'ReturnStatement', argument: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with multiple statements before ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ThrowStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
            { type: 'ThrowStatement', argument: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with multiple statements before BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('BreakStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
            { type: 'BreakStatement', label: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with multiple statements before ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ContinueStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
            { type: 'ContinueStatement', label: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with alternate containing single statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports with alternate containing multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node: Record<string, unknown> = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'b' } },
          ],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports with alternate containing empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node: Record<string, unknown> = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports with consequent having expression then return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [
            {
              type: 'ExpressionStatement',
              expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
            },
            { type: 'ReturnStatement', argument: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with consequent having variable declaration then throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ThrowStatement', {
          consequentBody: [
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
            { type: 'ThrowStatement', argument: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ReturnStatement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [{ type: 'ReturnStatement', argument: null }],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when BreakStatement has label', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('BreakStatement', {
          consequentBody: [
            { type: 'BreakStatement', label: { type: 'Identifier', name: 'outer' } },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when ContinueStatement has label', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ContinueStatement', {
          consequentBody: [
            { type: 'ContinueStatement', label: { type: 'Identifier', name: 'loop' } },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with consequent having 5 statements ending in return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: {} },
            { type: 'VariableDeclaration', kind: 'let', declarations: [] },
            { type: 'ExpressionStatement', expression: {} },
            { type: 'ExpressionStatement', expression: {} },
            { type: 'ReturnStatement', argument: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports only once per qualifying IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      visitor.IfStatement(makeIfNode('ThrowStatement'))
      expect(reports.length).toBe(2)
    })

    test('reports for ThrowStatement with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ThrowStatement', {
          consequentBody: [
            { type: 'ThrowStatement', argument: { type: 'Literal', value: 'error' } },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('all four terminal statement types produce report individually', () => {
      const types = ['ReturnStatement', 'ThrowStatement', 'BreakStatement', 'ContinueStatement']
      for (const t of types) {
        const { context, reports } = createMockContext()
        const visitor = noUnnecessaryElseRule.create(context)
        visitor.IfStatement(makeIfNode(t))
        expect(reports.length).toBe(1)
      }
    })

    test('reports with alternate containing return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node: Record<string, unknown> = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 0 } }],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports with consequent having single return and alternate having single expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports[0].message).toBe(
        'Unnecessary else block after conditional return/throw.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc has start property with line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc has start property with column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc has end property with line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('report loc has end property with column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report node matches input IfStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node = makeIfNode('ReturnStatement')
      visitor.IfStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { loc: makeLoc(3, 5, 3, 20) }),
      )
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report descriptor has message loc and node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message contains "else"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports[0].message).toContain('else')
    })

    test('report message contains "return/throw"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      expect(reports[0].message).toContain('return/throw')
    })

    test('report preserves specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { loc: makeLoc(10, 4, 12, 8) }),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('all reports have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      visitor.IfStatement(makeIfNode('ThrowStatement'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc end values preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { loc: makeLoc(1, 0, 5, 30) }),
      )
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })
  })

  // ===== NEGATIVE CASES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when alternate is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement', { hasAlternate: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node: Record<string, unknown> = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is IfStatement not BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { alternateType: 'IfStatement' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when alternate is ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { alternateType: 'ExpressionStatement' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is ExpressionStatement not BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { consequentType: 'ExpressionStatement' }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent body is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { consequentBody: [] }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ExpressionStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('VariableDeclaration', {
          consequentBody: [
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('FunctionDeclaration', {
          consequentBody: [
            { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] } },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('IfStatement', {
          consequentBody: [
            { type: 'IfStatement', test: {}, consequent: {} },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ForStatement', {
          consequentBody: [
            { type: 'ForStatement', init: null, test: null, update: null, body: {} },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('WhileStatement', {
          consequentBody: [
            { type: 'WhileStatement', test: {}, body: {} },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is SwitchStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('SwitchStatement', {
          consequentBody: [
            { type: 'SwitchStatement', discriminant: {}, cases: [] },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when last body item is TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('TryStatement', {
          consequentBody: [
            { type: 'TryStatement', block: { type: 'BlockStatement', body: [] } },
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      expect(() => visitor.IfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      expect(() => visitor.IfStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'ExpressionStatement',
        expression: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: {},
        consequent: null,
        alternate: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: {},
        consequent: 'not-a-block',
        alternate: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when consequent body is not array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'IfStatement',
        test: {},
        consequent: { type: 'BlockStatement', body: 'not-array' },
        alternate: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'Identifier',
        name: 'foo',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'Literal',
        value: 42,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryElseRule.create(ctx1)
      const visitor2 = noUnnecessaryElseRule.create(ctx2)
      visitor1.IfStatement(makeIfNode('ReturnStatement'))
      visitor2.IfStatement(
        makeIfNode('ExpressionStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
          ],
        }),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      visitor.IfStatement(makeIfNode('ExpressionStatement', { consequentBody: [{ type: 'ExpressionStatement', expression: {} }] }))
      visitor.IfStatement(makeIfNode('ThrowStatement'))
      visitor.IfStatement(makeIfNode('ReturnStatement', { hasAlternate: false }))
      visitor.IfStatement(makeIfNode('BreakStatement'))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: {} }],
        },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: {} }],
        },
      }
      visitor.IfStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(makeIfNode('ReturnStatement'))
      visitor.IfStatement(makeIfNode('ExpressionStatement', { consequentBody: [{ type: 'ExpressionStatement', expression: {} }] }))
      visitor.IfStatement(makeIfNode('ThrowStatement'))
      visitor.IfStatement(makeIfNode('ReturnStatement', { hasAlternate: false }))
      visitor.IfStatement(makeIfNode('ContinueStatement'))
      expect(reports.length).toBe(3)
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryElseRule.create(context)
      const visitor2 = noUnnecessaryElseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryElseRule.meta
      const meta2 = noUnnecessaryElseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: {} }],
        },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10] as [number, number],
        extra: true,
        parent: {},
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { loc: {} }),
      )
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          loc: { start: { line: 3, column: 5 } },
        }),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node = makeIfNode('ReturnStatement')
      visitor.IfStatement(node)
      visitor.IfStatement(node)
      visitor.IfStatement(node)
      expect(reports.length).toBe(3)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { loc: makeLoc(1, 0, 1, 10) }),
      )
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: {} }],
        },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(2)
    })

    test('handles consequent body where last item is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: {} },
            null,
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('handles consequent body where last item is string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: {} },
            'not-an-object',
          ],
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('many body items last ThrowStatement reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ThrowStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: {} },
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
            { type: 'ExpressionStatement', expression: {} },
            { type: 'ExpressionStatement', expression: {} },
            { type: 'ThrowStatement', argument: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('many body items last BreakStatement reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('BreakStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: {} },
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
            { type: 'ExpressionStatement', expression: {} },
            { type: 'BreakStatement', label: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('many body items last ContinueStatement reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ContinueStatement', {
          consequentBody: [
            { type: 'ExpressionStatement', expression: {} },
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
            { type: 'ContinueStatement', label: null },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific multi-line location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      visitor.IfStatement(
        makeIfNode('ReturnStatement', { loc: makeLoc(5, 2, 15, 30) }),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('handles alternate as non-BlockStatement object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node: Record<string, unknown> = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'ExpressionStatement',
          expression: { type: 'Identifier', name: 'x' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with range property alongside loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryElseRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: {} }],
        },
        loc: makeLoc(7, 3, 9, 15),
        range: [50, 120] as [number, number],
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })
  })
})
