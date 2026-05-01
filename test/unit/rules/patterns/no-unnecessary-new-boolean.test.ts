import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewBooleanRule } from '../../../../src/rules/patterns/no-unnecessary-new-boolean.js'
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
    getSource: () => 'new Boolean(true)',
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

function makeNewExprNode(
  callee: unknown,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-new-boolean rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewBooleanRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewBooleanRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewBooleanRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryNewBooleanRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewBooleanRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Boolean', () => {
      const desc = noUnnecessaryNewBooleanRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/boolean/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewBooleanRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-new-boolean.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewBooleanRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewBooleanRule).toBeDefined()
      expect(noUnnecessaryNewBooleanRule.meta).toBeDefined()
      expect(noUnnecessaryNewBooleanRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary new Boolean', () => {
    test('reports for new Boolean() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean("string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: 'string' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(x) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(f()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'f' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(obj.prop) — member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean(a, b, c) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      expect(reports[0].message).toMatch(/Boolean/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      expect(reports[0].message).toBe(
        'Unnecessary use of new Boolean(). Use a boolean literal instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      const node = makeNewExprNode({ type: 'Identifier', name: 'Boolean' })
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for new Boolean() with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean() with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean() with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean() with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean() with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Boolean() with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'String' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Number()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Number' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Array' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Object' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Map' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Set' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Error' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Promise' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'RegExp' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Date' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyCustomClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'MyCustomClass' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new boolean() (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'boolean' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Boolean() call expression (not new)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression (new foo.Boolean())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'foo' },
        property: { type: 'Identifier', name: 'Boolean' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'Boolean' }, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for LogicalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'LogicalExpression', operator: '&&', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "BOOLEAN" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'BOOLEAN' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is object without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ name: 'Boolean' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Function' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Proxy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Proxy' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'WeakMap' }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewBooleanRule.create(ctx1)
      const visitor2 = noUnnecessaryNewBooleanRule.create(ctx2)
      visitor1.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      visitor2.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'String' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'String' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Number' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'String' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: true }]))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Object' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewBooleanRule.create(context)
      const visitor2 = noUnnecessaryNewBooleanRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewBooleanRule.meta
      const meta2 = noUnnecessaryNewBooleanRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
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
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
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
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      const node = makeNewExprNode({ type: 'Identifier', name: 'Boolean' })
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewBooleanRule).toBeDefined()
      expect(typeof noUnnecessaryNewBooleanRule.create).toBe('function')
      expect(typeof noUnnecessaryNewBooleanRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report for new expression with computed member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ns' },
          property: { type: 'Literal', value: 'Boolean' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }))
      visitor.NewExpression(makeNewExprNode({ type: 'Identifier', name: 'Boolean' }, [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles NewExpression node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewBooleanRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })
  })
})
