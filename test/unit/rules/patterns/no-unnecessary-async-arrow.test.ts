import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAsyncArrowRule } from '../../../../src/rules/patterns/no-unnecessary-async-arrow.js'
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

function makeArrowNode(
  isAsync: boolean,
  body: unknown,
  params: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: isAsync,
    params,
    body,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeBlockReturn(argument: unknown): unknown {
  return {
    type: 'BlockStatement',
    body: [{ type: 'ReturnStatement', argument }],
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-async-arrow rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning async', () => {
      const desc = noUnnecessaryAsyncArrowRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/async/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-async-arrow.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAsyncArrowRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAsyncArrowRule).toBeDefined()
      expect(noUnnecessaryAsyncArrowRule.meta).toBeDefined()
      expect(noUnnecessaryAsyncArrowRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — EXPRESSION BODY LITERAL (12) =====

  describe('positive cases — reports async arrow with literal expression body', () => {
    test('reports for async () => 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral('hello')))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(true)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(false)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => "" (empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral('')))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => 3.14', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(3.14)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => /regex/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(/test/)))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => -1 (negative number literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(-1)))
      expect(reports.length).toBe(1)
    })

    test('reports for async (x) => 100 (with parameter)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(100), [makeIdentifier('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for async (a, b) => "result" (with multiple parameters)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral('result'), [makeIdentifier('a'), makeIdentifier('b')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — EXPRESSION BODY IDENTIFIER (8) =====

  describe('positive cases — reports async arrow with identifier expression body', () => {
    test('reports for async () => x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => myVar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('myVar')))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('result')))
      expect(reports.length).toBe(1)
    })

    test('reports for async (x) => x (param as body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x'), [makeIdentifier('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => _ (underscore identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('_')))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => value (generic identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('value')))
      expect(reports.length).toBe(1)
    })

    test('reports for async (a, b, c) => total (with 3 params)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('total'), [makeIdentifier('a'), makeIdentifier('b'), makeIdentifier('c')]))
      expect(reports.length).toBe(1)
    })

    test('identifier body report message mentions simple expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x')))
      expect(reports[0].message).toMatch(/simple expression body/)
    })
  })

  // ===== POSITIVE CASES — BLOCK BODY WITH RETURN LITERAL (10) =====

  describe('positive cases — reports async arrow with block body returning literal', () => {
    test('reports for async () => { return 42 }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(42))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return "hello" }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral('hello'))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return true }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(true))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return false }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(false))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return null }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(null))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return 0 }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(0))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return "" }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(''))))
      expect(reports.length).toBe(1)
    })

    test('reports for async (x) => { return 42 } (with parameter)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(42)), [makeIdentifier('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return /regex/ }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(/pattern/))))
      expect(reports.length).toBe(1)
    })

    test('reports for async () => { return 3.14 }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(3.14))))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT VERIFICATION (5) =====

  describe('report descriptor verification', () => {
    test('literal expression body report message mentions literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      expect(reports[0].message).toBe(
        'Unnecessary async on arrow function returning a literal value. Remove async keyword.',
      )
    })

    test('identifier expression body report message mentions simple expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x')))
      expect(reports[0].message).toBe(
        'Unnecessary async on arrow function with simple expression body. Remove async if the return value is not a Promise.',
      )
    })

    test('block body literal return report message mentions literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(42))))
      expect(reports[0].message).toBe(
        'Unnecessary async on arrow function returning a literal value. Remove async keyword.',
      )
    })

    test('report has loc and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input arrow function node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      const node = makeArrowNode(true, makeLiteral(42))
      visitor.ArrowFunctionExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== NEGATIVE CASES — NOT ASYNC (4) =====

  describe('negative cases — not async', () => {
    test('does not report for () => 42 (no async)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(false, makeLiteral(42)))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => x (no async)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(false, makeIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => { return 42 } (no async)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(false, makeBlockReturn(makeLiteral(42))))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => "hello" (no async)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(false, makeLiteral('hello')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — BLOCK BODY STRUCTURE (8) =====

  describe('negative cases — block body structure issues', () => {
    test('does not report for async () => {} (empty block)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, { type: 'BlockStatement', body: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return 1; return 2 } (two statements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: [
          { type: 'ReturnStatement', argument: makeLiteral(1) },
          { type: 'ReturnStatement', argument: makeLiteral(2) },
        ],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { console.log("hi"); return 42 } (two statements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: makeIdentifier('log'), arguments: [] } },
          { type: 'ReturnStatement', argument: makeLiteral(42) },
        ],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { const x = 1 } (non-return single statement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: [{ type: 'VariableDeclaration', kind: 'const', declarations: [] }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { if (true) {} } (IfStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: [{ type: 'IfStatement', test: makeLiteral(true), consequent: { type: 'BlockStatement', body: [] }, alternate: null }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { throw new Error() } (ThrowStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: [{ type: 'ThrowStatement', argument: { type: 'NewExpression', callee: makeIdentifier('Error'), arguments: [] } }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for block body with body as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: 'not-array',
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for block body with body as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: null,
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — BLOCK BODY RETURN NON-LITERAL (8) =====

  describe('negative cases — block body return non-literal', () => {
    test('does not report for async () => { return x } (identifier return)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeIdentifier('x'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return await fetch() } (await expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn({
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: makeIdentifier('fetch'), arguments: [] },
      })))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return Promise.resolve(1) } (call expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: makeIdentifier('Promise'), property: makeIdentifier('resolve') },
        arguments: [makeLiteral(1)],
      })))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return obj.prop } (member expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn({
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('prop'),
      })))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return x + y } (binary expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn({
        type: 'BinaryExpression',
        operator: '+',
        left: makeIdentifier('x'),
        right: makeIdentifier('y'),
      })))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return } (bare return)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: null }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return [1, 2] } (array expression return)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn({
        type: 'ArrayExpression',
        elements: [makeLiteral(1), makeLiteral(2)],
      })))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => { return { key: 1 } } (object expression return)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn({
        type: 'ObjectExpression',
        properties: [],
      })))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — EXPRESSION BODY NON-LITERAL/IDENTIFIER (8) =====

  describe('negative cases — expression body non-literal/identifier', () => {
    test('does not report for async () => Promise.resolve(1) (call expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: makeIdentifier('Promise'), property: makeIdentifier('resolve') },
        arguments: [makeLiteral(1)],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => await fetch() (await expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: makeIdentifier('fetch'), arguments: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => obj.prop (member expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('prop'),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => x + y (binary expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'BinaryExpression',
        operator: '+',
        left: makeIdentifier('x'),
        right: makeIdentifier('y'),
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => [1, 2] (array expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'ArrayExpression',
        elements: [makeLiteral(1), makeLiteral(2)],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => ({ key: 1 }) (object expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'ObjectExpression',
        properties: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => fn() (call expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'CallExpression',
        callee: makeIdentifier('fn'),
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for async () => x ? 1 : 2 (conditional expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'ConditionalExpression',
        test: makeIdentifier('x'),
        consequent: makeLiteral(1),
        alternate: makeLiteral(2),
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NON-ARROW/MALFORMED NODES (7) =====

  describe('negative cases — non-arrow and malformed nodes', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      expect(() => visitor.ArrowFunctionExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression({ type: 'FunctionExpression', async: true, params: [], body: makeLiteral(42), loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      expect(() => visitor.ArrowFunctionExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (14) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAsyncArrowRule.create(ctx1)
      const visitor2 = noUnnecessaryAsyncArrowRule.create(ctx2)
      visitor1.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      visitor2.ArrowFunctionExpression(makeArrowNode(false, makeLiteral(42)))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      visitor.ArrowFunctionExpression(makeArrowNode(false, makeLiteral(42)))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: makeLiteral(42),
      }
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42), [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(false, makeLiteral(42)))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x')))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(42))))
      visitor.ArrowFunctionExpression(makeArrowNode(true, {
        type: 'CallExpression',
        callee: makeIdentifier('fn'),
        arguments: [],
      }))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeIdentifier('x'))))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAsyncArrowRule.create(context)
      const visitor2 = noUnnecessaryAsyncArrowRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAsyncArrowRule.meta
      const meta2 = noUnnecessaryAsyncArrowRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: makeLiteral(42),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: makeLiteral(42),
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: makeLiteral(42),
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      const node = makeArrowNode(true, makeLiteral(42))
      visitor.ArrowFunctionExpression(node)
      visitor.ArrowFunctionExpression(node)
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAsyncArrowRule).toBeDefined()
      expect(typeof noUnnecessaryAsyncArrowRule.create).toBe('function')
      expect(typeof noUnnecessaryAsyncArrowRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: makeLiteral(42),
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('all literal reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral('hello')))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeBlockReturn(makeLiteral(1))))
      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('literal and identifier reports have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncArrowRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeLiteral(42)))
      visitor.ArrowFunctionExpression(makeArrowNode(true, makeIdentifier('x')))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

  })
})
