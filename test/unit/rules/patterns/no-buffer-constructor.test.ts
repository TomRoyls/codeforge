import { describe, expect, test, vi } from 'vitest'
import { noBufferConstructorRule } from '../../../../src/rules/patterns/no-buffer-constructor.js'
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
    getSource: () => 'Buffer()',
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
  calleeName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
  args: unknown[] = [],
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNewExpr(
  calleeName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
  args: unknown[] = [],
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-buffer-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noBufferConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noBufferConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noBufferConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noBufferConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noBufferConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Buffer', () => {
      const desc = noBufferConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('buffer')
    })

    test('should have correct docs URL', () => {
      expect(noBufferConstructorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-buffer-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noBufferConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })
  })

  // ===== POSITIVE CASES — CALL EXPRESSION REPORTS BUFFER (20) =====

  describe('positive cases — CallExpression reports Buffer()', () => {
    test('reports Buffer() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports.length).toBe(1)
    })

    test('reports Buffer() with one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 1, 0, 1, 12, [{ type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(1)
    })

    test('reports Buffer() with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 1, 0, 1, 18, [{ type: 'Literal', value: 'abc' }, { type: 'Literal', value: 'utf8' }]))
      expect(reports.length).toBe(1)
    })

    test('report message for CallExpression mentions deprecated', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toContain('deprecated')
    })

    test('report message for CallExpression mentions Buffer.alloc()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toContain('Buffer.alloc()')
    })

    test('report message for CallExpression mentions Buffer.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toContain('Buffer.from()')
    })

    test('report message for CallExpression starts with backtick Buffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toContain('`Buffer()`')
    })

    test('report has loc property for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = makeCallExpr('Buffer')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message is exactly as defined for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toBe(
        '`Buffer()` constructor is deprecated. Use `Buffer.alloc()` or `Buffer.from()` instead.',
      )
    })

    test('reports Buffer() on different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 42, 0, 42, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('accumulates reports across multiple Buffer() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports.length).toBe(2)
    })

    test('all CallExpression reports have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports Buffer() with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 1, 0, 1, 10, []))
      expect(reports.length).toBe(1)
    })

    test('reports Buffer() with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 1, 0, 1, 25, [
        { type: 'Literal', value: 16 },
        { type: 'Literal', value: 'hex' },
        { type: 'Literal', value: true },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports Buffer() at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 1, 0, 1, 9))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports Buffer() at large line and column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 500, 200, 500, 210))
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('reports Buffer() on multiline span', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer', 3, 5, 5, 12))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report descriptor has all expected properties for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== POSITIVE CASES — NEW EXPRESSION REPORTS NEW BUFFER (20) =====

  describe('positive cases — NewExpression reports new Buffer()', () => {
    test('reports new Buffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports.length).toBe(1)
    })

    test('reports new Buffer() with one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 1, 0, 1, 16, [{ type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(1)
    })

    test('reports new Buffer() with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 1, 0, 1, 22, [{ type: 'Literal', value: 'abc' }, { type: 'Literal', value: 'utf8' }]))
      expect(reports.length).toBe(1)
    })

    test('report message for NewExpression mentions deprecated', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toContain('deprecated')
    })

    test('report message for NewExpression mentions Buffer.alloc()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toContain('Buffer.alloc()')
    })

    test('report message for NewExpression mentions Buffer.from()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toContain('Buffer.from()')
    })

    test('report message for NewExpression starts with backtick new Buffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toContain('`new Buffer()`')
    })

    test('report has loc property for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = makeNewExpr('Buffer')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 8, 4, 8, 18))
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report message is exactly as defined for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toBe(
        '`new Buffer()` constructor is deprecated. Use `Buffer.alloc()` or `Buffer.from()` instead.',
      )
    })

    test('reports new Buffer() on different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 99, 0, 99, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99)
    })

    test('accumulates reports across multiple new Buffer() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports.length).toBe(2)
    })

    test('all NewExpression reports have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports new Buffer() with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 1, 0, 1, 10, []))
      expect(reports.length).toBe(1)
    })

    test('reports new Buffer() with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 1, 0, 1, 29, [
        { type: 'Literal', value: 16 },
        { type: 'Literal', value: 'hex' },
        { type: 'Literal', value: true },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports new Buffer() at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 1, 0, 1, 13))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports new Buffer() at large line and column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 600, 300, 600, 314))
      expect(reports[0].loc?.start.line).toBe(600)
      expect(reports[0].loc?.start.column).toBe(300)
    })

    test('reports new Buffer() on multiline span', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer', 7, 2, 9, 15))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.end.line).toBe(9)
    })

    test('report descriptor has all expected properties for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — CALL EXPRESSION DOES NOT REPORT (15) =====

  describe('negative cases — CallExpression does NOT report', () => {
    test('does not report for non-Buffer call like Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('log'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Buffer.alloc() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Buffer' }, property: { type: 'Identifier', name: 'alloc' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Buffer.from() member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Buffer' }, property: { type: 'Identifier', name: 'from' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for call with callee type FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for call with missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for call with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for call with callee having no type', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { name: 'Buffer' }, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for lowercase buffer() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('buffer'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BUFFER() uppercase call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('BUFFER'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NEW EXPRESSION DOES NOT REPORT (15) =====

  describe('negative cases — NewExpression does NOT report', () => {
    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Buffer' }, property: { type: 'Identifier', name: 'alloc' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 19),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for new expression with missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new expression with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new expression with callee having no type', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: { name: 'Buffer' }, arguments: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new buffer() lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('buffer'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new BUFFER() uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('BUFFER'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('CallExpression and NewExpression report different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('CallExpression message says Buffer() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      expect(reports[0].message).toContain('`Buffer()`')
    })

    test('NewExpression message says new Buffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.NewExpression(makeNewExpr('Buffer'))
      expect(reports[0].message).toContain('`new Buffer()`')
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noBufferConstructorRule.create(ctx1)
      const visitor2 = noBufferConstructorRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('Buffer'))
      visitor2.CallExpression(makeCallExpr('Array'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly from both visitors', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Buffer'))
      visitor.NewExpression(makeNewExpr('Buffer'))
      visitor.CallExpression(makeCallExpr('Array'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Identifier', name: 'Buffer' }, arguments: [] }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = { type: 'NewExpression', callee: { type: 'Identifier', name: 'Buffer' }, arguments: [] }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = { type: 'CallExpression', callee: { type: 'Identifier', name: 'Buffer' }, arguments: [] }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      visitor.CallExpression(makeCallExpr('Array'))
      visitor.CallExpression(makeCallExpr('Buffer'))
      visitor.NewExpression(makeNewExpr('Error'))
      visitor.NewExpression(makeNewExpr('Buffer'))
      visitor.CallExpression(makeCallExpr('Promise'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noBufferConstructorRule.create(context)
      const visitor2 = noBufferConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noBufferConstructorRule.meta
      const meta2 = noBufferConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles CallExpression node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Buffer' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles NewExpression node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noBufferConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Buffer' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14],
        leadingComments: [],
        _parent: {},
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})
