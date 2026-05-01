import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReturnValueRule } from '../../../../src/rules/patterns/no-unnecessary-return-value.js'
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

function makeReturnNode(
  argument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-return-value rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReturnValueRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReturnValueRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReturnValueRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReturnValueRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReturnValueRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning return', () => {
      const desc = noUnnecessaryReturnValueRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/return/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReturnValueRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-return-value',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReturnValueRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReturnValueRule).toBeDefined()
      expect(noUnnecessaryReturnValueRule.meta).toBeDefined()
      expect(noUnnecessaryReturnValueRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS RETURN UNDEFINED (25) =====

  describe('positive cases — reports return undefined', () => {
    test('reports for ReturnStatement with argument identifier undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(1)
    })

    test('reports with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].message).toBe("Unnecessary 'return undefined'.")
    })

    test('reports for return undefined at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 1, 0, 1, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for return undefined at different location line 5 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 5, 10, 5, 28))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for return undefined at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 100, 0, 100, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('reports for return undefined spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 3, 5, 4, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('reports for return undefined with zero start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 2, 0, 2, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for node at end of file position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 250, 40, 250, 58))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(250)
      expect(reports[0].loc?.start.column).toBe(40)
    })

    test('reports for return undefined inside a function body location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 10, 4, 10, 22))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports for argument identifier with exact type and name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(2)
    })

    test('reports when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 10),
        leadingComments: [],
        trailingComments: [],
        range: [0, 18],
      })
      expect(reports.length).toBe(1)
    })

    test('reports when argument has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined', loc: makeLoc(1, 7, 1, 16), range: [7, 16] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for single occurrence in a simple function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for return undefined with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 1, 50, 1, 68))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('reports for return undefined at end column 0 of next line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 7, 2, 8, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('reports for return undefined inside nested block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 15, 8, 15, 26))
      expect(reports.length).toBe(1)
    })

    test('reports for return undefined inside arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 3, 2, 3, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for return undefined at top level location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 1, 0, 1, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('reports three separate return undefined calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(3)
    })

    test('reports for return undefined with node at column 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 4, 2, 4, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('reports for return undefined spanning to column 30', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 6, 0, 6, 30))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].message).toBe("Unnecessary 'return undefined'.")
    })

    test('reports for return undefined at very high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 999, 0, 999, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ReturnStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      const node = makeReturnNode({ type: 'Identifier', name: 'undefined' })
      visitor.ReturnStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line matches node loc start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 7, 3, 7, 21))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc start column matches node loc start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 7, 3, 7, 21))
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('report loc end line matches node loc end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 7, 3, 9, 5))
      expect(reports[0].loc?.end.line).toBe(9)
    })

    test('report loc end column matches node loc end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 7, 3, 7, 21))
      expect(reports[0].loc?.end.column).toBe(21)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message contains Unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains return undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].message).toContain('return undefined')
    })

    test('report loc values are preserved from node with custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 12, 6, 12, 24))
      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('multiple reports each have correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports[0].message).toBe("Unnecessary 'return undefined'.")
      expect(reports[1].message).toBe("Unnecessary 'return undefined'.")
    })

    test('multiple reports preserve individual loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 1, 0, 1, 18))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 5, 2, 5, 20))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('multiple reports preserve individual node references', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      const node1 = makeReturnNode({ type: 'Identifier', name: 'undefined' })
      const node2 = makeReturnNode({ type: 'Identifier', name: 'undefined' })
      visitor.ReturnStatement(node1)
      visitor.ReturnStatement(node2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
    })

    test('report loc is defined when node has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 3, 1, 3, 19))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for ReturnStatement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode(undefined))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with identifier named foo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'foo' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with identifier named bar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'bar' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with identifier named null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'null' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with string Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with identifier named Undefined (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'Undefined' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with identifier named UNDEFINED', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'UNDEFINED' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 'undefined', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReturnValueRule.create(ctx1)
      const visitor2 = noUnnecessaryReturnValueRule.create(ctx2)
      visitor1.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor2.ReturnStatement(makeReturnNode(null))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode(null))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      const node = { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'undefined' } }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReturnValueRule.create(context)
      const visitor2 = noUnnecessaryReturnValueRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReturnValueRule.meta
      const meta2 = noUnnecessaryReturnValueRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReturnValueRule).toBeDefined()
      expect(typeof noUnnecessaryReturnValueRule.create).toBe('function')
      expect(typeof noUnnecessaryReturnValueRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'undefined' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode(null))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'foo' }))
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }))
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      const node = makeReturnNode({ type: 'Identifier', name: 'undefined' })
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(3)
    })

    test('does not report for primitive number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('argument with type Identifier but missing name does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier' }))
      expect(reports.length).toBe(0)
    })

    test('argument with name undefined but wrong type does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Literal', name: 'undefined' }))
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'Identifier', name: 'undefined' }, 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('does not report for ReturnStatement with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement(makeReturnNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} }))
      expect(reports.length).toBe(0)
    })

    test('argument that is number type does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnValueRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })
})
