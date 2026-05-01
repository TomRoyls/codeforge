import { describe, expect, test, vi } from 'vitest'
import { noFloatingPromisesReturnedRule } from '../../../../src/rules/patterns/no-floating-promises-returned.js'
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
    getSource: () => 'return fetchAsync();',
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
  calleeName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: calleeName },
      arguments: [],
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-floating-promises-returned rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noFloatingPromisesReturnedRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noFloatingPromisesReturnedRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noFloatingPromisesReturnedRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noFloatingPromisesReturnedRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noFloatingPromisesReturnedRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning async or promise', () => {
      const desc = noFloatingPromisesReturnedRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/async|promise/)
    })

    test('should have correct docs URL', () => {
      expect(noFloatingPromisesReturnedRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-floating-promises-returned',
      )
    })

    test('should have empty schema', () => {
      expect(noFloatingPromisesReturnedRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noFloatingPromisesReturnedRule).toBeDefined()
      expect(noFloatingPromisesReturnedRule.meta).toBeDefined()
      expect(noFloatingPromisesReturnedRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS FLOATING PROMISE (25) =====

  describe('positive cases — reports floating promise', () => {
    test('reports for return fetchAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return loadDataAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('loadDataAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return saveAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('saveAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return processAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('processAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return initializeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('initializeAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return queryAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('queryAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return executeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('executeAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return updateAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('updateAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return deleteAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('deleteAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return sendAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('sendAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return transformAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('transformAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return validateAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('validateAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return readAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('readAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return writeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('writeAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return parseAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('parseAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return computeAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('computeAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return renderAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('renderAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return connectAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('connectAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return downloadAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('downloadAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return uploadAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('uploadAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return refreshAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('refreshAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return handleAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('handleAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return dispatchAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('dispatchAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return compileAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('compileAsync'))
      expect(reports.length).toBe(1)
    })

    test('reports for return doSomethingAsync()', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('doSomethingAsync'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports[0].message).toBe('Floating Promise returned without being awaited.')
    })

    test('report message mentions "Floating Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports[0].message).toContain('Floating Promise')
    })

    test('report message mentions "awaited"', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports[0].message).toContain('awaited')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ReturnStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      const node = makeReturnNode('fetchAsync')
      visitor.ReturnStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync', 3, 2, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      visitor.ReturnStatement(makeReturnNode('loadDataAsync'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      visitor.ReturnStatement(makeReturnNode('saveAsync'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      const node = makeReturnNode('fetchAsync')
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync', 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      visitor.ReturnStatement(makeReturnNode('loadDataAsync'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('visitor accumulates mixed valid/invalid reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' }, arguments: [] }, loc: makeLoc(1, 0, 1, 10) })
      visitor.ReturnStatement(makeReturnNode('saveAsync'))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for return fetch() (non-async name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetch'))
      expect(reports.length).toBe(0)
    })

    test('does not report for return getData() (non-async name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('getData'))
      expect(reports.length).toBe(0)
    })

    test('does not report for return save() (non-async name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('save'))
      expect(reports.length).toBe(0)
    })

    test('does not report for return process() (non-async name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('process'))
      expect(reports.length).toBe(0)
    })

    test('does not report for return null', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for return undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: undefined,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for return with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for return with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'api' },
            property: { type: 'Identifier', name: 'fetchAsync' },
          },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for return with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 'hello',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for name ending with Async in different case (async)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetchasync'))
      expect(reports.length).toBe(0)
    })

    test('does not report for name with Async in the middle (AsyncLoad)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('AsyncLoad'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'methodAsync' },
          },
          arguments: [],
        },
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
      const visitor1 = noFloatingPromisesReturnedRule.create(ctx1)
      const visitor2 = noFloatingPromisesReturnedRule.create(ctx2)
      visitor1.ReturnStatement(makeReturnNode('fetchAsync'))
      visitor2.ReturnStatement(makeReturnNode('fetch'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchAsync' },
          arguments: [],
        },
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchAsync' },
          arguments: [],
        },
      }
      visitor.ReturnStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchAsync' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        leadingComments: [],
      }
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchAsync' },
          arguments: [],
        },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchAsync' },
          arguments: [],
        },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noFloatingPromisesReturnedRule.create(context)
      const visitor2 = noFloatingPromisesReturnedRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noFloatingPromisesReturnedRule.meta
      const meta2 = noFloatingPromisesReturnedRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noFloatingPromisesReturnedRule).toBeDefined()
      expect(typeof noFloatingPromisesReturnedRule.create).toBe('function')
      expect(typeof noFloatingPromisesReturnedRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fetchAsync' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement(makeReturnNode('fetch'))
      visitor.ReturnStatement(makeReturnNode('fetchAsync'))
      visitor.ReturnStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      visitor.ReturnStatement(makeReturnNode('saveAsync'))
      visitor.ReturnStatement(makeReturnNode('process'))
      expect(reports.length).toBe(2)
    })

    test('handles node with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 42,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: true,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: [],
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with callee missing name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: null,
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with callee as non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: 'stringCallee',
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles ReturnStatement with empty string callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesReturnedRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: '' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})
