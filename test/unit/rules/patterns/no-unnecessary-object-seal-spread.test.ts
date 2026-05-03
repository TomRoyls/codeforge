import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectSealSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-seal-spread.js'
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

function makeObjectSealSpreadCall(
  spreadArgName = 'items',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'seal' },
    },
    arguments: [
      { type: 'SpreadElement', argument: { type: 'Identifier', name: spreadArgName } },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-seal-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.seal', () => {
      const desc = noUnnecessaryObjectSealSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object\.seal/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-seal-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectSealSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectSealSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectSealSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectSealSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports Object.seal(...items) with spread', () => {
    test('reports for Object.seal(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.seal(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('args'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.seal(...data)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('data'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.seal(...list)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('list'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.seal and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall())
      expect(reports[0].message).toMatch(/Object\.seal/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall())
      expect(reports[0].message).toBe(
        'Object.seal(...items) with spread is unusual. seal() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      const node = makeObjectSealSpreadCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items', 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items'))
      visitor.CallExpression(makeObjectSealSpreadCall('args'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items'))
      visitor.CallExpression(makeObjectSealSpreadCall('args'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] },
          },
        ],
        loc: makeLoc(1, 0, 1, 35),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'ArrayExpression', elements: [] },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'ObjectExpression', properties: [] },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'x' },
              consequent: { type: 'Identifier', name: 'a' },
              alternate: { type: 'Identifier', name: 'b' },
            },
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
          },
        ],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with yield expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'YieldExpression', argument: null },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with await expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with sequence expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with parenthesized expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'x' } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with type cast expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'TypeCastExpression', expression: { type: 'Identifier', name: 'x' }, typeAnnotation: {} },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'Literal', value: 42 },
          },
        ],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with tagged template expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for spread with class expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          {
            type: 'SpreadElement',
            argument: { type: 'ClassExpression', id: null, body: { type: 'ClassBody', body: [] } },
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.seal(obj) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal({}) — object literal without spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'freeze' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'assign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.seal(...items) — non-Object callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.seal(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'MyObject' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
          { type: 'Identifier', name: 'extra' },
        ],
        loc: makeLoc(1, 0, 1, 35),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal("seal") — computed member with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Seal" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'Seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal when arg is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectSealSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectSealSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectSealSpreadCall())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeObjectSealSpreadCall('args'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeObjectSealSpreadCall('data'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'MyObject' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectSealSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectSealSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectSealSpreadRule.meta
      const meta2 = noUnnecessaryObjectSealSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      const node = makeObjectSealSpreadCall()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectSealSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectSealSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectSealSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items', 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealSpreadRule.create(context)
      visitor.CallExpression(makeObjectSealSpreadCall('items'))
      visitor.CallExpression(makeObjectSealSpreadCall('args'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
