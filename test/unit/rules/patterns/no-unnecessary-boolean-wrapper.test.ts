import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBooleanWrapperRule } from '../../../../src/rules/patterns/no-unnecessary-boolean-wrapper.js'
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

function makeBooleanCallNode(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Boolean' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-boolean-wrapper rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Boolean', () => {
      const desc = noUnnecessaryBooleanWrapperRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/boolean/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-boolean-wrapper.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBooleanWrapperRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBooleanWrapperRule).toBeDefined()
      expect(noUnnecessaryBooleanWrapperRule.meta).toBeDefined()
      expect(noUnnecessaryBooleanWrapperRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary Boolean()', () => {
    test('reports for Boolean(value)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'value' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with string Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with boolean Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with null Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x, y) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary Boolean() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      expect(reports[0].message).toMatch(/Boolean/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      expect(reports[0].message).toBe(
        'Unnecessary Boolean() call. Use a double negation (!!value) or direct truthiness check instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      const node = makeBooleanCallNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Boolean(x) with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Boolean(x) with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for String(value) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number(value) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object(value) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array(value) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Symbol(value) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BigInt(value) — wrong callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for customFunction() — non-builtin name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'customFunction' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean() — lowercase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'boolean' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BOOLEAN() — uppercase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BOOLEAN' },
        arguments: [{ type: 'Identifier', name: 'value' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for member expression obj.Boolean()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'Boolean' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a CallExpression (IIFE)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: 'Boolean', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: 42, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has type Identifier but name is "parseBoolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseBoolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has type Identifier but name is "toBoolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'toBoolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee Identifier has no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Boolean' }, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBooleanWrapperRule.create(ctx1)
      const visitor2 = noUnnecessaryBooleanWrapperRule.create(ctx2)
      visitor1.CallExpression(makeBooleanCallNode())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBooleanWrapperRule.create(context)
      const visitor2 = noUnnecessaryBooleanWrapperRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBooleanWrapperRule.meta
      const meta2 = noUnnecessaryBooleanWrapperRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
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
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      const node = makeBooleanCallNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBooleanWrapperRule).toBeDefined()
      expect(typeof noUnnecessaryBooleanWrapperRule.create).toBe('function')
      expect(typeof noUnnecessaryBooleanWrapperRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode([], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles node with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      const manyArgs = Array.from({ length: 10 }, (_, i) => ({ type: 'Identifier', name: `arg${i}` }))
      visitor.CallExpression(makeBooleanCallNode(manyArgs))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression(makeBooleanCallNode())
      visitor.CallExpression(makeBooleanCallNode([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for callee that is a ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBooleanWrapperRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'ThisExpression' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
