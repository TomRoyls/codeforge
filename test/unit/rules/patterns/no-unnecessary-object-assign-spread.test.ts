import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectAssignSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-assign-spread.js'
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

function makeObjectAssignCall(
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'assign' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-assign-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.assign', () => {
      const desc = noUnnecessaryObjectAssignSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object\.assign/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-assign-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectAssignSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectAssignSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectAssignSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectAssignSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Object.assign(...spread)', () => {
    test('reports for Object.assign(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...arr) with array identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...obj) with object identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'obj' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...getItems()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...foo.bar) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...[1, 2, 3]) with array expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...args) with simple args identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...x) with single-letter identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.assign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Object\.assign/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Object.assign(...items) with spread is unusual. assign() expects a target and sources.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      const node = makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.assign(...conditional) with conditional expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...obj.props) with computed member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' }, computed: true })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...fn()) with member call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...template) with template literal spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...(a && b)) with logical expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.assign(...{ a: 1 }) with object expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.assign(...new Map()) with new expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.assign(target, source) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }, { type: 'Identifier', name: 'source' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(target, source1, source2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }, { type: 'Identifier', name: 'source1' }, { type: 'Identifier', name: 'source2' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(target) — single non-spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'entries' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.assign(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObject' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for object.assign(...items) — lowercase "object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for assign(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'assign' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object[assign](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object["assign"](...items) — computed string member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'assign' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ObjectExpression instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ArrayExpression instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Assign" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'Assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectAssignSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectAssignSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }, { type: 'Identifier', name: 'source' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }, { type: 'Identifier', name: 'source' }]))
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }, { type: 'Identifier', name: 'source' }]))
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeObjectAssignCall([]))
      visitor.CallExpression(makeObjectAssignCall([{ type: 'Identifier', name: 'target' }]))
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectAssignSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectAssignSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectAssignSpreadRule.meta
      const meta2 = noUnnecessaryObjectAssignSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      const node = makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectAssignSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectAssignSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectAssignSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false explicitly set', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'assign' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([{ type: 'SpreadElement', argument: null }]))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with nested SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression(makeObjectAssignCall([makeSpreadElement(makeSpreadElement({ type: 'Identifier', name: 'deep' }))]))
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectAssignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
