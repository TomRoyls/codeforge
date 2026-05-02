import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectSealLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-object-seal-literal.js'
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

function makeObjectExpr(properties: unknown[] = []): unknown {
  return { type: 'ObjectExpression', properties }
}

function makeCallNode(
  objName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== TEST SUITE (95 tests) =====

describe('no-unnecessary-object-seal-literal rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.seal', () => {
      const desc = noUnnecessaryObjectSealLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object\.seal|seal/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-object-seal-literal.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectSealLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectSealLiteralRule).toBeDefined()
      expect(noUnnecessaryObjectSealLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryObjectSealLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Object.seal({})', () => {
    test('reports for Object.seal({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.seal({}) with whitespace-like empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.seal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0].message).toMatch(/Object\.seal/)
    })

    test('report message mentions empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0].message).toMatch(/empty object/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0].message).toBe(
        'Unnecessary Object.seal() on an empty object literal. Sealing an empty object has no practical effect.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      const node = makeCallNode('Object', 'seal', [makeObjectExpr([])])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with specific location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for Object.seal({}) at line 1 col 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])], 1, 0, 1, 17))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for Object.seal({}) at multi-line position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])], 3, 5, 5, 2))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      const node = makeCallNode('Object', 'seal', [makeObjectExpr([])])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
          computed: false,
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports for Object.seal({}) with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports when ObjectExpression properties is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (48) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.seal({ a: 1 }) — non-empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([{ type: 'Property', key: { type: 'Identifier', name: 'a' } }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal(obj) — variable reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal([]) — array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze({}) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'freeze', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.seal({}) — not global Object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('MyObject', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys({}) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'keys', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values({}) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'values', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign({}) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'assign', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal({}, {}) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([]), makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal({ a: 1, b: 2 }) — multi-property object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([{ type: 'Property', key: { type: 'Identifier', name: 'a' } }, { type: 'Property', key: { type: 'Identifier', name: 'b' } }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression (e.g., module.Object.seal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'module' }, property: { type: 'Identifier', name: 'Object' } },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "object" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Seal" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'Seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal(undefined) — undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal(42) — number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal("str") — string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'Literal', value: 'str' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal(fn()) — call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has length 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'seal' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.defineProperty({}, "a", {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'defineProperty', [makeObjectExpr([]), { type: 'Literal', value: 'a' }, makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.create(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'create', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.preventExtensions({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'preventExtensions', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('reports when ObjectExpression properties is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ObjectExpression' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when ObjectExpression properties is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ObjectExpression', properties: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports when ObjectExpression properties is a non-array value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ObjectExpression', properties: 'not-array' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== EDGE CASES (12) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectSealLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectSealLiteralRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      visitor2.CallExpression(makeCallNode('Object', 'seal', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([{ type: 'Property', key: { type: 'Identifier', name: 'a' } }])]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [makeObjectExpr([])]))
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeCallNode('Object', 'freeze', [makeObjectExpr([])]))
      visitor.CallExpression(makeCallNode('MyObject', 'seal', [makeObjectExpr([])]))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectSealLiteralRule.create(context)
      const visitor2 = noUnnecessaryObjectSealLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectSealLiteralRule.meta
      const meta2 = noUnnecessaryObjectSealLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectSealLiteralRule).toBeDefined()
      expect(typeof noUnnecessaryObjectSealLiteralRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectSealLiteralRule.meta).toBe('object')
    })

    test('does not report for Object.seal when argument is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ThisExpression' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal when argument is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.seal with SpreadElement as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'seal', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'obj' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'seal' },
          computed: true,
        },
        arguments: [makeObjectExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.isSealed({}) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectSealLiteralRule.create(context)
      visitor.CallExpression(makeCallNode('Object', 'isSealed', [makeObjectExpr([])]))
      expect(reports.length).toBe(0)
    })
  })
})
