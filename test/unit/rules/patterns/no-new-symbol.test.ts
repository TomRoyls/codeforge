import { describe, expect, test, vi } from 'vitest'
import { noNewSymbolRule } from '../../../../src/rules/patterns/no-new-symbol.js'
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
    getSource: () => 'new Symbol()',
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
    parserServices: {
      esTreeNodeToTSNodeMap: new Map(),
      tsNodeToESTreeNodeMap: new Map(),
    },
  } as unknown as RuleContext
  return { context, reports }
}

function makeNewExpressionNode(
  calleeName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 14,
  args: unknown[] = [],
): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-new-symbol rule', () => {
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noNewSymbolRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noNewSymbolRule.meta.severity).toBe('error')
    })

    test('should have correct category "patterns"', () => {
      expect(noNewSymbolRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noNewSymbolRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noNewSymbolRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Symbol', () => {
      const desc = noNewSymbolRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('symbol')
    })

    test('should have correct docs URL', () => {
      expect(noNewSymbolRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-new-symbol',
      )
    })

    test('should have empty schema', () => {
      expect(noNewSymbolRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noNewSymbolRule).toBeDefined()
      expect(noNewSymbolRule.meta).toBeDefined()
      expect(noNewSymbolRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS NEW SYMBOL (30) =====

  describe('positive cases — reports new Symbol()', () => {
    test('reports for new Symbol() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol("description")', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 20, [{ type: 'StringLiteral', value: 'description' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 14, [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 16, [{ type: 'NullLiteral' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 21, [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 17, [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 16, [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol([])', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 16, [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports with correct message about Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports[0].message).toContain('Symbol')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      const node = makeNewExpressionNode('Symbol')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports.length).toBe(2)
    })

    test('reports for Symbol with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 25, [
        { type: 'StringLiteral', value: 'a' },
        { type: 'StringLiteral', value: 'b' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports[0].message).toBe(
        'Symbol cannot be called as a constructor. Use Symbol() without new.',
      )
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 5, 10, 5, 24))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports with node that has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14] as [number, number],
        extra: true,
        leadingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with node that has range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14] as [number, number],
      })
      expect(reports.length).toBe(1)
    })

    test('separate create() calls report independently', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noNewSymbolRule.create(ctx1)
      const visitor2 = noNewSymbolRule.create(ctx2)
      visitor1.NewExpression(makeNewExpressionNode('Symbol'))
      visitor2.NewExpression(makeNewExpressionNode('Array'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('reports when callee Identifier has value property set to "Symbol"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', value: 'Symbol', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('all reports have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      visitor.NewExpression(makeNewExpressionNode('Symbol', 2, 0, 2, 14))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Symbol with empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 16, [{ type: 'StringLiteral', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Symbol inside complex expression context', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(3, 8, 3, 22),
        parent: { type: 'VariableDeclarator' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports for Symbol with object argument node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 20, [
        { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'x' } }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Symbol with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 30, [
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Symbol with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports only once per new Symbol() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports.length).toBe(1)
    })

    test('reports for Symbol with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 1, 0, 1, 22, [{ type: 'StringLiteral', value: 'mySymbol' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Symbol with callee value property overriding name', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', value: 'Symbol', name: 'Other' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Date'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('RegExp'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Promise'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('MyClass'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Foo()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new SymbolAlias()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('SymbolAlias'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with Symbol callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'Symbol' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for lowercase "symbol"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('symbol'))
      expect(reports.length).toBe(0)
    })

    test('does not report for uppercase "SYMBOL"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('SYMBOL'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        arguments: [],
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
      const visitor1 = noNewSymbolRule.create(ctx1)
      const visitor2 = noNewSymbolRule.create(ctx2)
      visitor1.NewExpression(makeNewExpressionNode('Symbol'))
      visitor2.NewExpression(makeNewExpressionNode('Array'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      visitor.NewExpression(makeNewExpressionNode('Map'))
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      visitor.NewExpression(makeNewExpressionNode('Set'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noNewSymbolRule.create(context)
      const visitor2 = noNewSymbolRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noNewSymbolRule.meta
      const meta2 = noNewSymbolRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14] as [number, number],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      const node = makeNewExpressionNode('Symbol')
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noNewSymbolRule).toBeDefined()
      expect(typeof noNewSymbolRule.create).toBe('function')
      expect(typeof noNewSymbolRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol'))
      visitor.NewExpression(makeNewExpressionNode('Symbol', 2, 0, 2, 14))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('callee with value as empty string does not report even if name is Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', value: '', name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('callee with value as null and name as Symbol does report', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', value: null, name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with callee as non-Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], name: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('callee with only value property reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', value: 'Symbol' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Symbol', 10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('handles node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewSymbolRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })
  })
})
