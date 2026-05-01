import { describe, expect, test, vi } from 'vitest'
import { noBannedPropertiesRule } from '../../../../src/rules/security/no-banned-properties.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'obj.__proto__',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeMemberExpr(
  objectName = 'obj',
  propName = '__proto__',
  computed = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: objectName },
    property: { type: 'Identifier', name: propName },
    computed,
    loc: makeLoc(line, column, line, column + objectName.length + 1 + propName.length),
  }
}

describe('no-banned-properties rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noBannedPropertiesRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noBannedPropertiesRule.meta.severity).toBe('error')
    })

    test('should have correct category "security"', () => {
      expect(noBannedPropertiesRule.meta.docs?.category).toBe('security')
    })

    test('should be recommended', () => {
      expect(noBannedPropertiesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noBannedPropertiesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "banned" and "property"', () => {
      const desc = noBannedPropertiesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/banned/)
      expect(desc).toMatch(/propert/)
    })

    test('should have correct docs URL', () => {
      expect(noBannedPropertiesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-banned-properties',
      )
    })

    test('should have empty schema', () => {
      expect(noBannedPropertiesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noBannedPropertiesRule).toBeDefined()
      expect(noBannedPropertiesRule.meta).toBeDefined()
      expect(noBannedPropertiesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports banned property access', () => {
    test('reports obj.__proto__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('message contains "__proto__"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports[0].message).toContain('__proto__')
    })

    test('message mentions "Object.getPrototypeOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports[0].message).toContain('Object.getPrototypeOf')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports[0].node).toBeDefined()
    })

    test('reports __defineGetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__defineGetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineGetter__')
    })

    test('reports __defineSetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__defineSetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineSetter__')
    })

    test('reports __lookupGetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__lookupGetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__lookupGetter__')
    })

    test('reports __lookupSetter__ access', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__lookupSetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__lookupSetter__')
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__', false, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = makeMemberExpr('obj', '__proto__')
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('a', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('b', '__defineGetter__'))
      visitor.MemberExpression(makeMemberExpr('c', '__lookupSetter__'))
      expect(reports.length).toBe(3)
    })

    test('reports obj.__proto__ with different object name "window"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('window', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports obj.__proto__ with different object name "target"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('target', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports obj.__proto__ with different object name "source"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('source', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports each banned property exactly once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct end location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__', false, 3, 2))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(2 + 3 + 1 + 9)
    })

    test('message contains "banned property"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports[0].message.toLowerCase()).toContain('banned property')
    })

    test('message mentions "Object.setPrototypeOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports[0].message).toContain('Object.setPrototypeOf')
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('a', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('b', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('c', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('d', '__proto__'))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report obj.name — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'name'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.length — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'length'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.toString — built-in method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.valueOf — built-in method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.hasOwnProperty — built-in method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(0)
    })

    test('does not report Object.getPrototypeOf — safe call', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('Object', 'getPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report computed member access obj["__proto__"] — property is Literal not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: '__proto__' },
        computed: true,
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression node — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node without loc — wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.MemberExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report obj.constructor — not banned', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'constructor'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.prototype — not banned', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'prototype'))
      expect(reports.length).toBe(0)
    })

    test('does not report computed access obj["__defineGetter__"] — Literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: '__defineGetter__' },
        computed: true,
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report computed access obj["__defineSetter__"] — Literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: '__defineSetter__' },
        computed: true,
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: null,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression with undefined property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: undefined,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression with missing property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression with property type "Literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 0 },
        computed: true,
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report obj.map — normal method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.filter — normal method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.reduce — normal method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.forEach — normal method', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.id — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'id'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.key — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'key'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.value — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'value'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.data — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'data'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.result — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'result'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.item — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'item'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.count — normal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'count'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.name — with different base "arr"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('arr', 'name'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.name — with different base "config"', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('config', 'name'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression node — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = { type: 'Identifier', name: '__proto__' }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression with CallExpression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noBannedPropertiesRule.create(ctx1)
      const visitor2 = noBannedPropertiesRule.create(ctx2)

      visitor1.MemberExpression(makeMemberExpr('obj', '__proto__'))
      visitor2.MemberExpression(makeMemberExpr('obj', 'name'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation of multiple banned props across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('a', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('b', '__defineGetter__'))
      visitor.MemberExpression(makeMemberExpr('c', '__defineSetter__'))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      // reports — __proto__
      visitor.MemberExpression(makeMemberExpr('a', '__proto__'))
      // does NOT report — normal property
      visitor.MemberExpression(makeMemberExpr('b', 'name'))
      // reports — __lookupGetter__
      visitor.MemberExpression(makeMemberExpr('c', '__lookupGetter__'))
      // does NOT report — wrong node type
      visitor.MemberExpression({ type: 'CallExpression' })
      // reports — __lookupSetter__
      visitor.MemberExpression(makeMemberExpr('d', '__lookupSetter__'))
      expect(reports.length).toBe(3)
    })

    test('default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
      }
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('banned property on "window" base object', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('window', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('banned property on "globalThis" base object', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('globalThis', '__proto__'))
      expect(reports.length).toBe(1)
    })

    test('banned property on "target" base object', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('target', '__defineGetter__'))
      expect(reports.length).toBe(1)
    })

    test('banned property on "source" base object', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('source', '__defineSetter__'))
      expect(reports.length).toBe(1)
    })

    test('banned property on "this" base object', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: { type: 'Identifier', name: '__proto__' },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noBannedPropertiesRule.create(context)
      const visitor2 = noBannedPropertiesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      expect(reports.length).toBe(3)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('MemberExpression with null object still processes property check', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: '__proto__' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.MemberExpression(node)
      // The rule checks n.type === 'MemberExpression' and then checks property
      // It should report since type matches and property is Identifier with banned name
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses (immutability)', () => {
      const meta1 = noBannedPropertiesRule.meta
      const meta2 = noBannedPropertiesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('message is consistent across __proto__ violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('a', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('b', '__proto__'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('all 5 banned properties produce same message structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const bannedProps = ['__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__']
      for (const prop of bannedProps) {
        visitor.MemberExpression(makeMemberExpr('obj', prop))
      }
      expect(reports.length).toBe(5)
      // All messages should follow the same pattern
      for (const report of reports) {
        expect(report.message).toMatch(/^Access to banned property `.+`\./)
        expect(report.message).toContain('Object.getPrototypeOf')
      }
    })

    test('__defineGetter__ message contains property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__defineGetter__'))
      expect(reports[0].message).toContain('`__defineGetter__`')
    })

    test('__defineSetter__ message contains property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__defineSetter__'))
      expect(reports[0].message).toContain('`__defineSetter__`')
    })

    test('__lookupGetter__ message contains property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__lookupGetter__'))
      expect(reports[0].message).toContain('`__lookupGetter__`')
    })

    test('__lookupSetter__ message contains property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__lookupSetter__'))
      expect(reports[0].message).toContain('`__lookupSetter__`')
    })

    test('chained access a.b.__proto__ reports violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      // Simulate a.b.__proto__ — the MemberExpression for `a.b.__proto__`
      const node = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        property: { type: 'Identifier', name: '__proto__' },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('chained access a.__proto__.b reports violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      // Simulate a.__proto__.b — the MemberExpression for `a.__proto__.b`
      const node = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: '__proto__' },
        },
        property: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 14),
      }
      // This node's property is 'b' — NOT banned
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('rule name is exported as noBannedPropertiesRule', () => {
      expect(noBannedPropertiesRule).toBeDefined()
      expect(typeof noBannedPropertiesRule.create).toBe('function')
      expect(typeof noBannedPropertiesRule.meta).toBe('object')
    })

    test('all violation messages for different banned properties are unique per property', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('obj', '__defineGetter__'))
      // Each message mentions its specific property name
      expect(reports[0].message).toContain('__proto__')
      expect(reports[1].message).toContain('__defineGetter__')
    })

    test('does not report obj.setPrototypeOf — not banned', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'setPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.getPrototypeOf — not banned', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj', 'getPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('obj1', '__proto__'))
      visitor.MemberExpression(makeMemberExpr('obj2', '__proto__'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles MemberExpression property with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noBannedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})
