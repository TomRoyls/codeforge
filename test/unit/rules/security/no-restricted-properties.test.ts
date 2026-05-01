import { describe, expect, test, vi } from 'vitest'
import { noRestrictedPropertiesRule } from '../../../../src/rules/security/no-restricted-properties.js'
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

function makeMemberExpr(propName: string, computed = false, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj' },
    property: { type: 'Identifier', name: propName },
    computed,
    loc: makeLoc(line, column, line, column + 4 + propName.length),
  }
}

describe('no-restricted-properties rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRestrictedPropertiesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRestrictedPropertiesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "security"', () => {
      expect(noRestrictedPropertiesRule.meta.docs?.category).toBe('security')
    })

    test('should not be recommended', () => {
      expect(noRestrictedPropertiesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRestrictedPropertiesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "restricted" and "property"', () => {
      const desc = noRestrictedPropertiesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/restricted/)
      expect(desc).toMatch(/propert/)
    })

    test('should have correct docs URL', () => {
      expect(noRestrictedPropertiesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-restricted-properties',
      )
    })

    test('should have empty schema', () => {
      expect(noRestrictedPropertiesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRestrictedPropertiesRule).toBeDefined()
      expect(noRestrictedPropertiesRule.meta).toBeDefined()
      expect(noRestrictedPropertiesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports restricted properties', () => {
    test('reports access to __proto__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports.length).toBe(1)
    })

    test('reports access to __defineGetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      expect(reports.length).toBe(1)
    })

    test('reports access to __defineSetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineSetter__'))
      expect(reports.length).toBe(1)
    })

    test('reports access to __lookupGetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupGetter__'))
      expect(reports.length).toBe(1)
    })

    test('reports access to __lookupSetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupSetter__'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message contains "restricted property"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].message).toContain('restricted property')
    })

    test('message contains the property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].message).toContain('__proto__')
    })

    test('message contains "deprecated"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].message).toContain('deprecated')
    })

    test('report has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = makeMemberExpr('__proto__', false, 3, 5)
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('accumulation works — multiple restricted properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      visitor.MemberExpression(makeMemberExpr('__lookupSetter__'))
      expect(reports.length).toBe(3)
    })

    test('report for __defineGetter__ contains correct name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      expect(reports[0].message).toContain('__defineGetter__')
    })

    test('report for __defineSetter__ contains correct name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineSetter__'))
      expect(reports[0].message).toContain('__defineSetter__')
    })

    test('report for __lookupGetter__ contains correct name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupGetter__'))
      expect(reports[0].message).toContain('__lookupGetter__')
    })

    test('report for __lookupSetter__ contains correct name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupSetter__'))
      expect(reports[0].message).toContain('__lookupSetter__')
    })

    test('message contains "unexpected behavior"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0].message).toContain('unexpected behavior')
    })

    test('report node matches original node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = makeMemberExpr('__proto__')
      visitor.MemberExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports with location end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__', false, 2, 3))
      expect(reports[0].loc?.end.line).toBe(2)
    })

  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report regular property "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report regular property "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report computed property access obj["__proto__"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__', true))
      expect(reports.length).toBe(0)
    })

    test('does not report computed property access obj["__defineGetter__"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineGetter__', true))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression type (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'Identifier',
        name: '__proto__',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression type (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'Literal',
        value: '__proto__',
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression type (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression type (ExpressionStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: '__proto__' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression type (BlockStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression type (IfStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "toString"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('toString'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "valueOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('valueOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "constructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('constructor'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "hasOwnProperty"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('hasOwnProperty'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "length"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('length'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "prototype"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('prototype'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "apply"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('apply'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "call"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('call'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted property "bind"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('bind'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with null property child', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: null,
        computed: false,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with undefined property child', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        computed: false,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property has no name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier' },
        computed: false,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '' },
        computed: false,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "isPrototypeOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('isPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "propertyIsEnumerable"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('propertyIsEnumerable'))
      expect(reports.length).toBe(0)
    })

    test('does not report computed access for __defineSetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineSetter__', true))
      expect(reports.length).toBe(0)
    })

    test('does not report computed access for __lookupGetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupGetter__', true))
      expect(reports.length).toBe(0)
    })

    test('does not report computed access for __lookupSetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupSetter__', true))
      expect(reports.length).toBe(0)
    })

    test('does not report non-restricted name "map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('map'))
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 42,
        name: '__proto__',
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
      const visitor1 = noRestrictedPropertiesRule.create(ctx1)
      const visitor2 = noRestrictedPropertiesRule.create(ctx2)

      visitor1.MemberExpression(makeMemberExpr('__proto__'))
      visitor2.MemberExpression(makeMemberExpr('foo'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: false,
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: false,
      }
      visitor.MemberExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      visitor.MemberExpression(makeMemberExpr('foo'))
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      visitor.MemberExpression(makeMemberExpr('bar'))
      visitor.MemberExpression(makeMemberExpr('__lookupGetter__'))
      expect(reports.length).toBe(3)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__', false, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noRestrictedPropertiesRule.create(context)
      const visitor2 = noRestrictedPropertiesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports.length).toBe(3)
    })

    test('computed: undefined treated as falsy so NOT skipped', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: undefined,
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: false,
        loc: makeLoc(1, 0, 1, 13),
        extra: true,
        range: [0, 13],
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with null parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: false,
        parent: null,
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with undefined parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: false,
        parent: undefined,
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node where parent exists but is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: false,
        parent: 'not-an-object',
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(1)
    })

    test('accumulation across all 5 restricted names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const names = ['__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__']
      for (const name of names) {
        visitor.MemberExpression(makeMemberExpr(name))
      }
      expect(reports.length).toBe(5)
    })

    test('does not report when computed is truthy number 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: '__proto__' },
        computed: 1,
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noRestrictedPropertiesRule.meta
      const meta2 = noRestrictedPropertiesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule export has create and meta properties', () => {
      expect(noRestrictedPropertiesRule).toBeDefined()
      expect(typeof noRestrictedPropertiesRule.create).toBe('function')
      expect(typeof noRestrictedPropertiesRule.meta).toBe('object')
    })

    test('message is different for different restricted properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      expect(reports[0].message).toContain('__proto__')
      expect(reports[1].message).toContain('__defineGetter__')
    })

    test('each restricted property triggers correctly — __proto__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__proto__')
    })

    test('each restricted property triggers correctly — __defineGetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineGetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineGetter__')
    })

    test('each restricted property triggers correctly — __defineSetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__defineSetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__defineSetter__')
    })

    test('each restricted property triggers correctly — __lookupGetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupGetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__lookupGetter__')
    })

    test('each restricted property triggers correctly — __lookupSetter__', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__lookupSetter__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__lookupSetter__')
    })

    test('non-restricted name "proto" does not trigger', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('proto'))
      expect(reports.length).toBe(0)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__proto__'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      const node = {
        type: 42,
        name: '__proto__',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.MemberExpression(node)
      expect(reports.length).toBe(0)
    })

    test('case sensitivity — "__Proto__" is not restricted', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedPropertiesRule.create(context)
      visitor.MemberExpression(makeMemberExpr('__Proto__'))
      expect(reports.length).toBe(0)
    })

    test('meta docs description is a non-empty string', () => {
      expect(typeof noRestrictedPropertiesRule.meta.docs?.description).toBe('string')
      expect(noRestrictedPropertiesRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs URL is a string', () => {
      expect(typeof noRestrictedPropertiesRule.meta.docs?.url).toBe('string')
    })

    test('meta severity is one of valid values', () => {
      expect(['error', 'warn', 'off']).toContain(noRestrictedPropertiesRule.meta.severity)
    })

  })
})
