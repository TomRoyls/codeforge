import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseResolveRule } from '../../../../src/rules/patterns/no-unnecessary-promise-resolve.js'
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

function makeExprStmt(
  expression: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makePromiseResolveCall(args: unknown[] = []): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Promise' },
      property: { type: 'Identifier', name: 'resolve' },
    },
    arguments: args,
    loc: makeLoc(1, 0, 1, 20),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-resolve rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.resolve', () => {
      const desc = noUnnecessaryPromiseResolveRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-promise-resolve.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseResolveRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseResolveRule).toBeDefined()
      expect(noUnnecessaryPromiseResolveRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseResolveRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Promise.resolve', () => {
    test('reports for Promise.resolve(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Identifier', name: 'x' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Identifier', name: 'undefined' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: null }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: true }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 'hello' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'ObjectExpression', properties: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve([])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'ArrayExpression', elements: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve(fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }])))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Promise.resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      expect(reports[0].message).toMatch(/Promise\.resolve/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      expect(reports[0].message).toBe(
        'Unnecessary Promise.resolve() as a statement. The resolved value is discarded. Remove or chain the result.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the CallExpression node inside ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const callNode = makePromiseResolveCall([{ type: 'Literal', value: 42 }])
      visitor.ExpressionStatement(makeExprStmt(callNode))
      expect(reports[0].node).toBe(callNode)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const callNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(5, 10, 5, 30),
      }
      visitor.ExpressionStatement(makeExprStmt(callNode))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 1 }])))
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 2 }])))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 1 }])))
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Identifier', name: 'x' }])))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Promise.resolve with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Promise.resolve with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'TemplateLiteral', quasis: [], expressions: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve with spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }])))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for foo.resolve(42) — not Promise object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all([...])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race([...])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'race' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled([...])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.any([...])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'any' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for regular function call fn()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      expect(() => visitor.ExpressionStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getPromise' }, arguments: [] },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'resolve' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is not "Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is not "resolve"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolvee' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for node type that is not ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is ThisExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Resolve" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'Resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "resolv" (substring)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolv' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for PROMISE.resolve (uppercase object name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'PROMISE' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement with non-call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseResolveRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseResolveRule.create(ctx2)
      visitor1.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      visitor2.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 1 }])))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }))
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Identifier', name: 'x' }])))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: makePromiseResolveCall([{ type: 'Literal', value: 42 }]),
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const callNode = makePromiseResolveCall([{ type: 'Literal', value: 42 }])
      const node = {
        type: 'ExpressionStatement',
        expression: callNode,
      }
      visitor.ExpressionStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      // valid: Promise.all
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }))
      // invalid: Promise.resolve(42)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }])))
      // valid: foo.resolve(42)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }))
      // invalid: Promise.resolve(x)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Identifier', name: 'x' }])))
      // valid: non-call expression
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseResolveRule.create(context)
      const visitor2 = noUnnecessaryPromiseResolveRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseResolveRule.meta
      const meta2 = noUnnecessaryPromiseResolveRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: makePromiseResolveCall([{ type: 'Literal', value: 42 }]),
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makePromiseResolveCall([{ type: 'Literal', value: 42 }]),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const callNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: callNode,
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const node = makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 42 }]))
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseResolveRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseResolveRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseResolveRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: makePromiseResolveCall([{ type: 'Literal', value: 42 }]),
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const callNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(10, 4, 10, 25),
      }
      visitor.ExpressionStatement(makeExprStmt(callNode))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: 1 }])))
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Identifier', name: 'x' }])))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles computed member expression property (non-computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const call = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'resolve' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(makeExprStmt(call))
      expect(reports.length).toBe(0)
    })

    test('reports for Promise.resolve with regex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'Literal', value: /test/ }])))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.resolve with NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement(makeExprStmt(makePromiseResolveCall([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] }])))
      expect(reports.length).toBe(1)
    })

    test('report node is the CallExpression, not the ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      const callNode = makePromiseResolveCall([{ type: 'Literal', value: 42 }])
      visitor.ExpressionStatement(makeExprStmt(callNode))
      expect(reports[0].node).toBe(callNode)
      expect(reports[0].node).toHaveProperty('type', 'CallExpression')
    })

    test('does not report for AwaitExpression wrapping Promise.resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseResolveRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: makePromiseResolveCall([{ type: 'Literal', value: 42 }]),
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })
  })
})
