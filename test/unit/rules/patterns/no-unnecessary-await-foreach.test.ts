import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAwaitForeachRule } from '../../../../src/rules/patterns/no-unnecessary-await-foreach.js'
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
    getSource: () => 'for await (const x of items) {}',
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

function makeForOfNode(
  awaitVal: boolean,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'ForOfStatement',
    await: awaitVal,
    left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
    right: { type: 'Identifier', name: 'items' },
    body: { type: 'BlockStatement', body: [] },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-await-foreach rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning for-of or await', () => {
      const desc = noUnnecessaryAwaitForeachRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/for-of|await/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-await-foreach',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAwaitForeachRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ForOfStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(visitor).toHaveProperty('ForOfStatement')
      expect(typeof visitor.ForOfStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAwaitForeachRule).toBeDefined()
      expect(noUnnecessaryAwaitForeachRule.meta).toBeDefined()
      expect(noUnnecessaryAwaitForeachRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS AWAIT IN FOR-OF (25) =====

  describe('positive cases — reports await in for-of', () => {
    test('reports for ForOfStatement with await true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true at line 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 5, 0, 5, 30))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true at line 1 col 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 1, 10, 1, 40))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true at multi-line range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 3, 2, 7, 4))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true at line 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 100, 0, 100, 35))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true at col 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 1, 50, 1, 80))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true and zero start col', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 1, 0, 1, 25))
      expect(reports.length).toBe(1)
    })

    test('reports for ForOfStatement with await true and large line range', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 1, 0, 50, 1))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary await"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).toContain('Unnecessary await')
    })

    test('report message mentions "for-of loop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).toContain('for-of loop')
    })

    test('report message mentions "synchronously"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).toContain('synchronously')
    })

    test('report message mentions "async iterables"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).toContain('async iterables')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ForOfStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = makeForOfNode(true)
      visitor.ForOfStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).toBe(
        'Unnecessary await in for-of loop. The loop iterates synchronously even with async iterables.',
      )
    })

    test('reports only once per ForOfStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      visitor.ForOfStatement(makeForOfNode(true, 5, 0, 5, 30))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc start line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 10, 4, 10, 34))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc end matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 10, 4, 10, 34))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(34)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with different right expression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'process' } },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 5, 10, 5, 40))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 5, 10, 8, 5))
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 5, 10, 8, 5))
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message does not contain undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).not.toContain('undefined')
    })

    test('report message does not contain null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].message).not.toContain('null')
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report loc has start and end objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].loc?.start.line).toBeDefined()
      expect(reports[0].loc?.start.column).toBeDefined()
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].loc?.end.line).toBeDefined()
      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('report loc start line is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report node is not null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].node).not.toBeNull()
    })

    test('report node is not undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports[0].node).not.toBeUndefined()
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for ForOfStatement with await false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(false))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement with await undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(undefined as unknown as boolean))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement without await property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForInStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({
        type: 'ForInStatement',
        left: { type: 'Identifier', name: 'key' },
        right: { type: 'Identifier', name: 'obj' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement with await as string "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: 'true',
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement with await as number 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: 1,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement with await as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: { value: true },
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement with await as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: null,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAwaitForeachRule.create(ctx1)
      const visitor2 = noUnnecessaryAwaitForeachRule.create(ctx2)
      visitor1.ForOfStatement(makeForOfNode(true))
      visitor2.ForOfStatement(makeForOfNode(false))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      visitor.ForOfStatement(makeForOfNode(false))
      visitor.ForOfStatement(makeForOfNode(true))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = { type: 'ForOfStatement', await: true }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = { type: 'ForOfStatement', await: true }
      visitor.ForOfStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(false))
      visitor.ForOfStatement(makeForOfNode(true))
      visitor.ForOfStatement(makeForOfNode(false))
      visitor.ForOfStatement(makeForOfNode(true))
      visitor.ForOfStatement(makeForOfNode(false))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAwaitForeachRule.create(context)
      const visitor2 = noUnnecessaryAwaitForeachRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAwaitForeachRule.meta
      const meta2 = noUnnecessaryAwaitForeachRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = { type: 'ForOfStatement', await: true, loc: {} }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = { type: 'ForOfStatement', await: true, loc: { start: { line: 3, column: 5 } } }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = makeForOfNode(true)
      visitor.ForOfStatement(node)
      visitor.ForOfStatement(node)
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAwaitForeachRule).toBeDefined()
      expect(typeof noUnnecessaryAwaitForeachRule.create).toBe('function')
      expect(typeof noUnnecessaryAwaitForeachRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true))
      visitor.ForOfStatement(makeForOfNode(true, 5, 0, 5, 30))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      visitor.ForOfStatement(makeForOfNode(true, 10, 4, 10, 34))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(34)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles ForOfStatement with truthy await that is not exactly true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: 'yes',
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles ForOfStatement with await as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: '',
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with deeply nested properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForOfStatement',
        await: true,
        left: {
          type: 'VariableDeclaration',
          declarations: [{
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'item' },
            init: null,
          }],
          kind: 'const',
        },
        right: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'asyncFn' },
        },
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: { type: 'Identifier', name: 'process' },
          }],
        },
        loc: makeLoc(1, 0, 3, 2),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for ForOfStatement with ForAwaitOfStatement type string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      const node = {
        type: 'ForAwaitOfStatement',
        await: true,
        left: { type: 'VariableDeclaration', declarations: [], kind: 'const' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ForOfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles calling visitor with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAwaitForeachRule.create(context)
      expect(() => visitor.ForOfStatement()).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
