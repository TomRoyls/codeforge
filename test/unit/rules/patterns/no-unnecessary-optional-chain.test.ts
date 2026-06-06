import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryOptionalChainRule } from '../../../../src/rules/patterns/no-unnecessary-optional-chain.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
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
    getSource: () => 'this?.prop',
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

function makeMemberExpr(
  optional: boolean,
  object: unknown,
  property: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'MemberExpression',
    optional,
    object,
    property,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name, loc: makeLoc(1, 0, 1, name.length) }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-optional-chain rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryOptionalChainRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryOptionalChainRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryOptionalChainRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryOptionalChainRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning optional chaining', () => {
      const desc = noUnnecessaryOptionalChainRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/optional/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryOptionalChainRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-optional-chain',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryOptionalChainRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryOptionalChainRule).toBeDefined()
      expect(noUnnecessaryOptionalChainRule.meta).toBeDefined()
      expect(noUnnecessaryOptionalChainRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — THIS EXPRESSION (12) =====

  describe('positive cases — ThisExpression', () => {
    test('reports this?.prop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "this" for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toContain('this')
    })

    test('report message says "never null or undefined" for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toContain('never null or undefined')
    })

    test('report has loc property for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the MemberExpression for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports this?.method with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, { type: 'Literal', value: 'method' })
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports this?.prop with specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(5, 2, 5, 6) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'), 5, 2, 5, 12)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('reports ThisExpression with exact message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toBe(
        "Optional chaining on 'this' is unnecessary. 'this' is never null or undefined.",
      )
    })

    test('accumulates reports for multiple ThisExpression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr1 = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const thisExpr2 = { type: 'ThisExpression', loc: makeLoc(2, 0, 2, 4) }
      visitor.MemberExpression(makeMemberExpr(true, thisExpr1, makeIdentifier('a')))
      visitor.MemberExpression(makeMemberExpr(true, thisExpr2, makeIdentifier('b')))
      expect(reports.length).toBe(2)
    })

    test('report loc has both start and end for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'), 3, 5, 3, 15)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc end values preserved for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'), 7, 1, 7, 11)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(11)
    })
  })

  // ===== POSITIVE CASES — NEW EXPRESSION (10) =====

  describe('positive cases — NewExpression', () => {
    test('reports new Foo()?.bar', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "new expression" for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports[0].message.toLowerCase()).toContain('new expression')
    })

    test('report message says "never null" for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toContain('never null')
    })

    test('report has loc for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('report node matches for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports new Foo()?.bar with exact message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toBe(
        "Optional chaining on a new expression is unnecessary. The result of 'new' is never null.",
      )
    })

    test('reports NewExpression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Obj'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, { type: 'Literal', value: 'key' })
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports NewExpression with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Map'), arguments: [makeIdentifier('entries')], loc: makeLoc(1, 0, 1, 15) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('get'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('NewExpression location preserved in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(10, 0, 10, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'), 10, 0, 10, 14)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('accumulates reports for multiple NewExpression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr1 = { type: 'NewExpression', callee: makeIdentifier('A'), arguments: [], loc: makeLoc(1, 0, 1, 6) }
      const newExpr2 = { type: 'NewExpression', callee: makeIdentifier('B'), arguments: [], loc: makeLoc(2, 0, 2, 6) }
      visitor.MemberExpression(makeMemberExpr(true, newExpr1, makeIdentifier('x')))
      visitor.MemberExpression(makeMemberExpr(true, newExpr2, makeIdentifier('y')))
      expect(reports.length).toBe(2)
    })
  })

  // ===== POSITIVE CASES — ARRAY EXPRESSION (8) =====

  describe('positive cases — ArrayExpression', () => {
    test('reports []?.length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "array literal" for ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'))
      visitor.MemberExpression(node)
      expect(reports[0].message.toLowerCase()).toContain('array literal')
    })

    test('report message says "never null or undefined" for ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toContain('never null or undefined')
    })

    test('reports ArrayExpression with exact message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toBe(
        "Optional chaining on an array literal is unnecessary. Array literals are never null or undefined.",
      )
    })

    test('reports [1,2,3]?.length with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }], loc: makeLoc(1, 0, 1, 7) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report node matches for ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'))
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('ArrayExpression location preserved in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(4, 3, 4, 5) }
      const node = makeMemberExpr(true, arrExpr, makeIdentifier('length'), 4, 3, 4, 15)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('reports ArrayExpression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, arrExpr, { type: 'Literal', value: 0 })
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — OBJECT EXPRESSION (8) =====

  describe('positive cases — ObjectExpression', () => {
    test('reports {}?.key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('key'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "object literal" for ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('key'))
      visitor.MemberExpression(node)
      expect(reports[0].message.toLowerCase()).toContain('object literal')
    })

    test('report message says "never null or undefined" for ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('key'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toContain('never null or undefined')
    })

    test('reports ObjectExpression with exact message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('key'))
      visitor.MemberExpression(node)
      expect(reports[0].message).toBe(
        "Optional chaining on an object literal is unnecessary. Object literals are never null or undefined.",
      )
    })

    test('reports {a:1}?.a with properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [{ type: 'Property', key: makeIdentifier('a') }], loc: makeLoc(1, 0, 1, 6) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('a'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report node matches for ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('key'))
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('ObjectExpression location preserved in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(6, 1, 6, 3) }
      const node = makeMemberExpr(true, objExpr, makeIdentifier('key'), 6, 1, 6, 10)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(6)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('reports ObjectExpression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) }
      const node = makeMemberExpr(true, objExpr, { type: 'Literal', value: 'key' })
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-optional MemberExpression with Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const node = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for optional MemberExpression with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const node = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) }
      const node = makeMemberExpr(true, callExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const innerMember = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      const node = makeMemberExpr(true, innerMember, makeIdentifier('c'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const binExpr = { type: 'BinaryExpression', operator: '+', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 5) }
      const node = makeMemberExpr(true, binExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression(makeIdentifier('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'MemberExpression', optional: true, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'MemberExpression', optional: true, object: null, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'MemberExpression', optional: true, object: 'string', property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when optional is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(false, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when optional is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = { type: 'MemberExpression', object: thisExpr, property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 5) }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const logExpr = { type: 'LogicalExpression', operator: '||', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 7) }
      const node = makeMemberExpr(true, logExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (22) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryOptionalChainRule.create(ctx1)
      const visitor2 = noUnnecessaryOptionalChainRule.create(ctx2)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      visitor1.MemberExpression(makeMemberExpr(true, thisExpr, makeIdentifier('prop')))
      visitor2.MemberExpression(makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryOptionalChainRule.create(context)
      const visitor2 = noUnnecessaryOptionalChainRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryOptionalChainRule.meta
      const meta2 = noUnnecessaryOptionalChainRule.meta
      expect(meta1).toBe(meta2)
    })

    test('node without loc still reports for ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression' }
      const node = { type: 'MemberExpression', optional: true, object: thisExpr, property: makeIdentifier('prop') }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression' }
      const node = { type: 'MemberExpression', optional: true, object: thisExpr, property: makeIdentifier('prop') }
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      visitor.MemberExpression(makeMemberExpr(true, thisExpr, makeIdentifier('a')))
      visitor.MemberExpression(makeMemberExpr(true, makeIdentifier('x'), makeIdentifier('y')))
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) }
      visitor.MemberExpression(makeMemberExpr(true, arrExpr, makeIdentifier('length')))
      visitor.MemberExpression(makeMemberExpr(false, thisExpr, makeIdentifier('b')))
      expect(reports.length).toBe(2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4), extra: true }
      const node = { type: 'MemberExpression', optional: true, object: thisExpr, property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 6), range: [0, 6], _parent: {} }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: {} }
      const node = { type: 'MemberExpression', optional: true, object: thisExpr, property: makeIdentifier('prop'), loc: {} }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: { start: { line: 3, column: 5 } } }
      const node = { type: 'MemberExpression', optional: true, object: thisExpr, property: makeIdentifier('prop'), loc: { start: { line: 3, column: 5 } } }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      visitor.MemberExpression(node)
      visitor.MemberExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule name is exported correctly', () => {
      expect(noUnnecessaryOptionalChainRule).toBeDefined()
      expect(typeof noUnnecessaryOptionalChainRule.create).toBe('function')
      expect(typeof noUnnecessaryOptionalChainRule.meta).toBe('object')
    })

    test('reports only once per node for same ThisExpression chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles optional set to 0 (falsy number) on outer node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = { type: 'MemberExpression', optional: 0, object: thisExpr, property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 5) }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles optional set to empty string (falsy) on outer node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = { type: 'MemberExpression', optional: '', object: thisExpr, property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 5) }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values preserved for NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(10, 4, 10, 12) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'), 10, 4, 10, 18)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('different object types produce different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      visitor.MemberExpression(makeMemberExpr(true, thisExpr, makeIdentifier('a')))
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(2, 0, 2, 8) }
      visitor.MemberExpression(makeMemberExpr(true, newExpr, makeIdentifier('b')))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('all four types produce unique messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      visitor.MemberExpression(makeMemberExpr(true, thisExpr, makeIdentifier('a')))
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(2, 0, 2, 8) }
      visitor.MemberExpression(makeMemberExpr(true, newExpr, makeIdentifier('b')))
      const arrExpr = { type: 'ArrayExpression', elements: [], loc: makeLoc(3, 0, 3, 2) }
      visitor.MemberExpression(makeMemberExpr(true, arrExpr, makeIdentifier('c')))
      const objExpr = { type: 'ObjectExpression', properties: [], loc: makeLoc(4, 0, 4, 2) }
      visitor.MemberExpression(makeMemberExpr(true, objExpr, makeIdentifier('d')))
      expect(reports.length).toBe(4)
      const messages = new Set(reports.map(r => r.message))
      expect(messages.size).toBe(4)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = { type: 'MemberExpression', optional: true, object: thisExpr, property: makeIdentifier('prop'), loc: makeLoc(1, 0, 1, 6), _parent: {} }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('rule returns early for ThisExpression before checking other types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const node = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('this')
      expect(reports[0].message).not.toContain('new expression')
    })

    test('rule returns early for NewExpression before checking array/object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('Foo'), arguments: [], loc: makeLoc(1, 0, 1, 8) }
      const node = makeMemberExpr(true, newExpr, makeIdentifier('bar'))
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('new expression')
      expect(reports[0].message).not.toContain('array')
    })

    test('visitor accumulates reports correctly across all four types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      visitor.MemberExpression(makeMemberExpr(true, thisExpr, makeIdentifier('a')))
      visitor.MemberExpression(makeMemberExpr(true, makeIdentifier('x'), makeIdentifier('y')))
      const newExpr = { type: 'NewExpression', callee: makeIdentifier('C'), arguments: [], loc: makeLoc(3, 0, 3, 6) }
      visitor.MemberExpression(makeMemberExpr(true, newExpr, makeIdentifier('b')))
      expect(reports.length).toBe(2)
    })
  })
})
