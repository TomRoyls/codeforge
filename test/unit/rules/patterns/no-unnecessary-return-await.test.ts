import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReturnAwaitRule } from '../../../../src/rules/patterns/no-unnecessary-return-await.js'
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
    getSource: () => 'return await promise',
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

function makeReturnAwaitNode(
  awaitArgName = 'promise',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ReturnStatement',
    argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: awaitArgName } },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-return-await rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning return await', () => {
      const desc = noUnnecessaryReturnAwaitRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/return.*await/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-return-await',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReturnAwaitRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReturnAwaitRule).toBeDefined()
      expect(noUnnecessaryReturnAwaitRule.meta).toBeDefined()
      expect(noUnnecessaryReturnAwaitRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY RETURN AWAIT (25) =====

  describe('positive cases — reports unnecessary return await', () => {
    test('reports for return await identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports.length).toBe(1)
    })

    test('reports for return await with different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('result'))
      expect(reports.length).toBe(1)
    })

    test('reports for return await with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' }, arguments: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } },
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with nested call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getData' }, arguments: [] },
        },
        loc: makeLoc(3, 4, 3, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with long identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('myLongPromiseVariableName'))
      expect(reports.length).toBe(1)
    })

    test('reports for return await on different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('p', 5, 2, 5, 18))
      expect(reports.length).toBe(1)
    })

    test('reports for return await at column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('x', 1, 8, 1, 28))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('a'))
      visitor.ReturnStatement(makeReturnAwaitNode('b'))
      expect(reports.length).toBe(2)
    })

    test('reports for return await with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} },
        },
        loc: makeLoc(1, 0, 1, 35),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with array expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'ArrayExpression', elements: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'ObjectExpression', properties: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with new expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Promise' }, arguments: [] },
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with arrow function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: {} }, arguments: [] },
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'asyncFn' }, arguments: [] },
        },
        loc: makeLoc(2, 4, 2, 28),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with await expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'nested' } },
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with type cast expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'TSAsExpression', expression: {}, typeAnnotation: {} },
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with tagged template', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'TaggedTemplateExpression', tag: {}, quasi: {} },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'val' } },
        },
        loc: makeLoc(1, 0, 1, 22),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with assignment expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'AssignmentExpression', operator: '=', left: {}, right: {} },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'LogicalExpression', operator: '&&', left: {}, right: {} },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with sequence expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'SequenceExpression', expressions: [] },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for return await with yield expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'YieldExpression', argument: null },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary return await"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0].message).toContain('Unnecessary return await')
    })

    test('report message mentions "Remove the await"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0].message).toContain('Remove the await')
    })

    test('report message mentions "plain return"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0].message.toLowerCase()).toContain('plain return')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report loc start line matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('p', 7, 3, 7, 22))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc start column matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('p', 7, 3, 7, 22))
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('report loc end line matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('p', 7, 3, 7, 22))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report loc end column matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('p', 7, 3, 7, 22))
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0].message).toBe(
        'Unnecessary return await. Remove the await or use a plain return.',
      )
    })

    test('report node matches the input ReturnStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      const node = makeReturnAwaitNode()
      visitor.ReturnStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('a'))
      visitor.ReturnStatement(makeReturnAwaitNode('b'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report reports only once per node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode())
      expect(reports.length).toBe(1)
    })

    test('multiple reports accumulate correctly with individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('a'))
      visitor.ReturnStatement(makeReturnAwaitNode('b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with non-await argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: undefined,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 'not-an-object',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 42,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'CallExpression', callee: {}, arguments: [] },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'MemberExpression', object: {}, property: {} },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ObjectExpression', properties: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReturnAwaitRule.create(ctx1)
      const visitor2 = noUnnecessaryReturnAwaitRule.create(ctx2)
      visitor1.ReturnStatement(makeReturnAwaitNode())
      visitor2.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('a'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.ReturnStatement(makeReturnAwaitNode('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
      }
      visitor.ReturnStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('a'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.ReturnStatement({
        type: 'ExpressionStatement',
        expression: {},
        loc: makeLoc(1, 0, 1, 1),
      })
      visitor.ReturnStatement(makeReturnAwaitNode('b'))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReturnAwaitRule.create(context)
      const visitor2 = noUnnecessaryReturnAwaitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReturnAwaitRule.meta
      const meta2 = noUnnecessaryReturnAwaitRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      const node = makeReturnAwaitNode()
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReturnAwaitRule).toBeDefined()
      expect(typeof noUnnecessaryReturnAwaitRule.create).toBe('function')
      expect(typeof noUnnecessaryReturnAwaitRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement(makeReturnAwaitNode('p', 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('handles node with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: true,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument has wrong type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'SomeOtherExpression', name: 'value' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with argument that is an empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {},
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles AwaitExpression as non-argument child', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ExpressionStatement',
        expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ArrowFunctionExpression', params: [], body: {} },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReturnAwaitRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})
