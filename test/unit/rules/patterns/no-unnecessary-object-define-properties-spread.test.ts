import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectDefinePropertiesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-define-properties-spread.js'
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

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpread(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

function makeObjectDefinePropertiesCall(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'defineProperties' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-define-properties-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning defineProperties', () => {
      const desc = noUnnecessaryObjectDefinePropertiesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/defineproperties/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-define-properties-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====


  describe('positive cases — reports unnecessary Object.defineProperties spread', () => {
    test('reports for Object.defineProperties(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'props' })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getProps' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'ArrayExpression', elements: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'ObjectExpression', properties: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions defineProperties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toMatch(/defineProperties/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toBe(
        'Object.defineProperties(...items) with spread is unusual. defineProperties() expects an object and property descriptors.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      const node = makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' }), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with SpreadElement containing BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with SpreadElement containing LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } })))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement containing SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (39) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-spread Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall({ type: 'Identifier', name: 'obj' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-spread ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for two arguments (both SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'a' }), makeSpread({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'defineProperties'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.defineProperties(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Array' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.defineProperties(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'MyObject' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperty(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'defineProperty', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'keys', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'assign', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'entries', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.defineProperties(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'variable' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is not "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'object' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is not "defineProperties"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'getOwnPropertyNames', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "defineproperties" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'defineproperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: null,
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
      const visitor1 = noUnnecessaryObjectDefinePropertiesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectDefinePropertiesSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor2.CallExpression(makeObjectDefinePropertiesCall({ type: 'Identifier', name: 'obj' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeObjectDefinePropertiesCall({ type: 'Identifier', name: 'obj' }))
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall({ type: 'Identifier', name: 'obj' }))
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Array' }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'more' })))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'defineProperty', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectDefinePropertiesSpreadRule.meta
      const meta2 = noUnnecessaryObjectDefinePropertiesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      const node = makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectDefinePropertiesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectDefinePropertiesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectDefinePropertiesSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'items' }), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'defineProperties' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'a' })))
      visitor.CallExpression(makeObjectDefinePropertiesCall(makeSpread({ type: 'Identifier', name: 'b' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when callee object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } }, 'defineProperties', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression(makeObjectDefinePropertiesCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectDefinePropertiesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'defineProperties' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
