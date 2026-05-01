import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryThenRule } from '../../../../src/rules/patterns/no-unnecessary-then.js'
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

function makeThenNode(
  objectName = 'promise',
  bodyCalleeName = 'fn',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'then' },
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: bodyCalleeName },
          arguments: [],
        },
      },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-then rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryThenRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryThenRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryThenRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryThenRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryThenRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning .then()', () => {
      const desc = noUnnecessaryThenRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\.then/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryThenRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-then',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryThenRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryThenRule).toBeDefined()
      expect(noUnnecessaryThenRule.meta).toBeDefined()
      expect(noUnnecessaryThenRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY THEN (25) =====

  describe('positive cases — reports unnecessary .then()', () => {
    test('reports for promise.then(() => fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports.length).toBe(1)
    })

    test('reports for different promise object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('fetch'))
      expect(reports.length).toBe(1)
    })

    test('reports for different callback callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('result', 'process'))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.then(() => handler())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('obj', 'handler'))
      expect(reports.length).toBe(1)
    })

    test('reports for data.then(() => save())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('data', 'save'))
      expect(reports.length).toBe(1)
    })

    test('reports for response.then(() => parse())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('response', 'parse'))
      expect(reports.length).toBe(1)
    })

    test('reports for request.then(() => log())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('request', 'log'))
      expect(reports.length).toBe(1)
    })

    test('reports when arrow body callee is MemberExpression call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'p' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'console' },
              property: { type: 'Identifier', name: 'log' },
            },
            arguments: [],
          },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arrow body has arguments in the call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'p' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Literal', value: 42 }],
          },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for single-letter promise name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p'))
      expect(reports.length).toBe(1)
    })

    test('reports for promise.then(() => doSomething())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('promise', 'doSomething'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary .then()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].message).toContain('Unnecessary .then()')
    })

    test('report message mentions "no-parameter arrow function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].message).toContain('no-parameter arrow function')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].message).toBe(
        'Unnecessary .then() wrapper with no-parameter arrow function.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      visitor.CallExpression(makeThenNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('a', 'fn1'))
      visitor.CallExpression(makeThenNode('b', 'fn2'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node = makeThenNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for deeply nested promise.then(() => run())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('chain', 'run'))
      expect(reports.length).toBe(1)
    })

    test('reports for short object and callee names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('x', 'y'))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore-prefixed names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('_promise', '_handle'))
      expect(reports.length).toBe(1)
    })

    test('reports for dollar-sign names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('$http', '$apply'))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-word names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('myPromise', 'myCallback'))
      expect(reports.length).toBe(1)
    })

    test('reports for async-like names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('asyncTask', 'onComplete'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p', 'fn', 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p', 'fn', 3, 0, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report loc has correct start structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('report loc has correct end structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0].loc?.end).toEqual({ line: 1, column: 30 })
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report node is the AST node object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node = makeThenNode()
      visitor.CallExpression(node)
      expect(typeof reports[0].node).toBe('object')
      expect(reports[0].node).not.toBeNull()
    })

    test('report node has type CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      const reportedNode = reports[0].node as Record<string, unknown>
      expect(reportedNode.type).toBe('CallExpression')
    })

    test('report node has callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      const reportedNode = reports[0].node as Record<string, unknown>
      expect(reportedNode.callee).toBeDefined()
    })

    test('report node callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      const reportedNode = reports[0].node as Record<string, unknown>
      const callee = reportedNode.callee as Record<string, unknown>
      expect(callee.type).toBe('MemberExpression')
    })

    test('report for node at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p', 'fn', 1, 0, 1, 25))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report for node at arbitrary location line 42 column 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p', 'fn', 42, 100, 42, 130))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('report for node spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p', 'fn', 1, 0, 3, 15))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('multiple reports each have unique node references', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node1 = makeThenNode()
      const node2 = makeThenNode()
      visitor.CallExpression(node1)
      visitor.CallExpression(node2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
      expect(reports[0].node).not.toBe(reports[1].node)
    })

    test('multiple reports each have correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      visitor.CallExpression(makeThenNode('other', 'cb'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(42)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'then' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "then"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'catch' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Then" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'Then' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has 2 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'err' }, arguments: [] } },
        ],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is FunctionExpression not ArrowFunction', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow function has 1 parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow function has 2 parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
          body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is Identifier not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'result' },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Literal', value: 'then' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'notAnObject',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: 'notAnArray',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: ['callback'],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: null,
        }],
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
      const visitor1 = noUnnecessaryThenRule.create(ctx1)
      const visitor2 = noUnnecessaryThenRule.create(ctx2)
      visitor1.CallExpression(makeThenNode())
      visitor2.CallExpression({ type: 'Identifier', name: 'x' })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode())
      visitor.CallExpression({ type: 'Identifier', name: 'x' })
      visitor.CallExpression(makeThenNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node = makeThenNode()
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node = makeThenNode()
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'x' })
      visitor.CallExpression(makeThenNode())
      visitor.CallExpression({ type: 'Literal', value: 42 })
      visitor.CallExpression(makeThenNode())
      visitor.CallExpression({ type: 'MemberExpression', object: {}, property: {} })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryThenRule.create(context)
      const visitor2 = noUnnecessaryThenRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryThenRule.meta
      const meta2 = noUnnecessaryThenRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node = {
        ...makeThenNode(),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        ...makeThenNode(),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        ...makeThenNode(),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      const node = makeThenNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryThenRule).toBeDefined()
      expect(typeof noUnnecessaryThenRule.create).toBe('function')
      expect(typeof noUnnecessaryThenRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        ...makeThenNode(),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(makeThenNode('p', 'fn', 10, 4, 12, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('does not report when arrow params is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: 'invalid',
          body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression([])
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "THEN" uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryThenRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'THEN' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })
  })
})
