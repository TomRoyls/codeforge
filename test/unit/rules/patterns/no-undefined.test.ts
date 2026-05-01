import { describe, expect, test, vi } from 'vitest'
import { noUndefinedRule } from '../../../../src/rules/patterns/no-undefined.js'
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

function makeIdentNode(
  name: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 9,
): unknown {
  return {
    type: 'Identifier',
    name,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    _parent: { type: 'Program', body: [] },
  }
}

// ===== META TESTS (8) =====

describe('no-undefined rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUndefinedRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUndefinedRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUndefinedRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUndefinedRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUndefinedRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning undefined', () => {
      const desc = noUndefinedRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/undefined/)
    })

    test('should have correct docs URL', () => {
      expect(noUndefinedRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-undefined',
      )
    })

    test('should have empty schema', () => {
      expect(noUndefinedRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Identifier', () => {
      const { context } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      expect(visitor).toHaveProperty('Identifier')
      expect(typeof visitor.Identifier).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUndefinedRule).toBeDefined()
      expect(noUndefinedRule.meta).toBeDefined()
      expect(noUndefinedRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNDEFINED IDENTIFIER (30) =====

  describe('positive cases — reports undefined identifier', () => {
    test('reports for identifier with name "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].message).toContain('undefined')
    })

    test('report message mentions "void 0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].message).toContain('void 0')
    })

    test('report message mentions "typed null check"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].message).toContain('typed null check')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = makeIdentNode('undefined')
      visitor.Identifier(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].message).toBe(
        'Unexpected use of \'undefined\'. Consider using a typed null check or void 0 instead.',
      )
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined', 5, 10, 5, 19))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined', 3, 2, 3, 11))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('reports for undefined at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined', 1, 0, 1, 9))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for undefined at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined', 500, 20, 500, 29))
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports only once per identifier call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for undefined identifier in variable reference context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(2, 4, 2, 13),
        _parent: { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in comparison context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(10, 8, 10, 17),
        _parent: { type: 'BinaryExpression', operator: '===' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in return statement context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(7, 11, 7, 20),
        _parent: { type: 'ReturnStatement' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in assignment context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(4, 12, 4, 21),
        _parent: { type: 'AssignmentExpression', operator: '=' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in call expression context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(1, 0, 1, 9),
        _parent: { type: 'CallExpression', callee: {} },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in conditional expression context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(15, 5, 15, 14),
        _parent: { type: 'ConditionalExpression' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in function parameter default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(1, 20, 1, 29),
        _parent: { type: 'AssignmentPattern' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(3, 1, 3, 10),
        _parent: { type: 'ArrayExpression', elements: [] },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in object property value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(6, 7, 6, 16),
        _parent: { type: 'Property', key: { type: 'Identifier', name: 'value' } },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(8, 7, 8, 16),
        _parent: { type: 'UnaryExpression', operator: 'typeof' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(2, 0, 2, 9),
        _parent: { type: 'LogicalExpression', operator: '||' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(1, 0, 1, 9),
        _parent: { type: 'MemberExpression', object: {}, property: {} },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in template literal expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(11, 3, 11, 12),
        _parent: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in switch case test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(20, 8, 20, 17),
        _parent: { type: 'SwitchCase' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(9, 4, 9, 13),
        _parent: { type: 'NewExpression', callee: {}, arguments: [] },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports for undefined identifier in throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(12, 6, 12, 15),
        _parent: { type: 'ThrowStatement' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for identifier named "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "myVar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('myVar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "NULL"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('NULL'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "Undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('Undefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "UNDEFINED"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('UNDEFINED'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "isUndefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('isUndefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "notUndefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('notUndefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty name identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('x'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "result"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('result'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "data"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('data'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('value'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "null"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('null'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier named "void0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('void0'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({})
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(42)
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier([])
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier with numeric name 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 0, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier with name property missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier with null name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (24) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUndefinedRule.create(ctx1)
      const visitor2 = noUndefinedRule.create(ctx2)
      visitor1.Identifier(makeIdentNode('undefined'))
      visitor2.Identifier(makeIdentNode('foo'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      visitor.Identifier(makeIdentNode('foo'))
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = { type: 'Identifier', name: 'undefined' }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = { type: 'Identifier', name: 'undefined' }
      visitor.Identifier(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('foo'))
      visitor.Identifier(makeIdentNode('undefined'))
      visitor.Identifier(makeIdentNode('bar'))
      visitor.Identifier(makeIdentNode('undefined'))
      visitor.Identifier(makeIdentNode('baz'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUndefinedRule.create(context)
      const visitor2 = noUndefinedRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUndefinedRule.meta
      const meta2 = noUndefinedRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(1, 0, 1, 9),
        range: [0, 9],
        extra: true,
        _parent: {},
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'undefined', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'undefined', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = makeIdentNode('undefined')
      visitor.Identifier(node)
      visitor.Identifier(node)
      visitor.Identifier(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUndefinedRule).toBeDefined()
      expect(typeof noUndefinedRule.create).toBe('function')
      expect(typeof noUndefinedRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'undefined', loc: makeLoc(1, 0, 1, 9), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined'))
      visitor.Identifier(makeIdentNode('undefined'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 'undefined', loc: makeLoc(1, 0, 1, 9), range: [10, 19] })
      expect(reports.length).toBe(1)
    })

    test('does not report for Identifier named "defined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('defined'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier named "undefinedValue"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefinedValue'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier named "myUndefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('myUndefined'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier named "undefinedly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefinedly'))
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier(makeIdentNode('undefined', 10, 4, 10, 13))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('does not report for Identifier with boolean name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: true, loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier with object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: { toString: () => 'undefined' }, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('reports for undefined identifier in yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUndefinedRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'undefined',
        loc: makeLoc(14, 7, 14, 16),
        _parent: { type: 'YieldExpression' },
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })
  })
})
