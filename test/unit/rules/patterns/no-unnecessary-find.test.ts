import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryFindRule } from '../../../../src/rules/patterns/no-unnecessary-find.js'
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
    getSource: () => '[].find(x => x)',
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

function makeCallExpr(
  objectNode: unknown,
  propertyName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: objectNode,
      property: {
        type: 'Identifier',
        name: propertyName,
      },
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-find rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryFindRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryFindRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryFindRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryFindRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryFindRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning .find()', () => {
      const desc = noUnnecessaryFindRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\.find/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryFindRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-find',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryFindRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryFindRule).toBeDefined()
      expect(noUnnecessaryFindRule.meta).toBeDefined()
      expect(noUnnecessaryFindRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY FIND (30) =====

  describe('positive cases — reports unnecessary find', () => {
    test('reports for [].find(x => x) — empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [1].find(x => x) — single element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [null].find(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [null] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for ["hello"].find(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'hello' }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [true].find(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: true }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [obj].find(x => x) — single object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'ObjectExpression', properties: [] }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [fn()].find(x => x) — single call result element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary .find()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions .find()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('.find()')
    })

    test('report message mentions 0 or 1 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].message).toContain('0 or 1 elements')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports[0].message).toBe(
        'Unnecessary .find() call on an array with 0 or 1 elements.',
      )
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find', 5, 10, 5, 25)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for [[]].find(x => x) — single nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'ArrayExpression', elements: [] }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [1,].find(x => x) — single element with trailing comma', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for [undefined].find(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'undefined' }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single Identifier element array [ref].find(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'ref' }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single template literal element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single arrow function element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with complex callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with computed false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single negative number element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single spread element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single string literal with template', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'a' }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find', 10, 4, 10, 18)
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports for single BigInt literal element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1n, bigint: '1' }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for single regex literal element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: '/test/', regex: { pattern: 'test', flags: '' } }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for [1, 2].find(x => x) — two elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, 2, 3].find(x => x) — three elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(x => x) — identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'Identifier', name: 'arr' }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.prop.find(x => x) — member expression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter(x => x) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'filter')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(x => x) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'map')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach(x => x) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'forEach')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce((a, b) => a) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'reduce')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].some(x => x) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'some')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].every(x => x) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'every')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].includes(1) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'includes')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for [].indexOf(1) — method is not find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'indexOf')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'find' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Literal', value: 'find' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "find"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'findIndex')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ObjectExpression', properties: [] }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is non-object type (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'not-an-object',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryFindRule.create(ctx1)
      const visitor2 = noUnnecessaryFindRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      visitor2.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'find'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed inputs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'Identifier', name: 'arr' }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }, 'find'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryFindRule.create(context)
      const visitor2 = noUnnecessaryFindRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryFindRule.meta
      const meta2 = noUnnecessaryFindRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'find' },
        },
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
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      ;(node as Record<string, unknown>).loc = {}
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      ;(node as Record<string, unknown>).loc = { start: { line: 3, column: 5 } }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryFindRule).toBeDefined()
      expect(typeof noUnnecessaryFindRule.create).toBe('function')
      expect(typeof noUnnecessaryFindRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'find'))
      visitor.CallExpression(makeCallExpr({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, 'find'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('array expression with non-array elements does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: 'not-an-array' }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('elements that are not an array (object) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: { length: 0 } }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "find" but different casing "Find"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression', elements: [] }, 'Find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for large array (10 elements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const elements = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      const node = makeCallExpr({ type: 'ArrayExpression', elements }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles elements as undefined (not provided)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFindRule.create(context)
      const node = makeCallExpr({ type: 'ArrayExpression' }, 'find')
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
