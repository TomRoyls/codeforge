import { describe, expect, test, vi } from 'vitest'
import { noPropertyRenameRule } from '../../../../src/rules/patterns/no-property-rename.js'
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

function makeIdentifier(name: string, locLine = 1, locCol = 0) {
  return {
    type: 'Identifier',
    name,
    loc: makeLoc(locLine, locCol, locLine, locCol + name.length),
  }
}

function makeObjectPattern(properties: unknown[], locLine = 1, locCol = 0) {
  return {
    type: 'ObjectPattern',
    properties,
    loc: makeLoc(locLine, locCol, locLine, locCol + 20),
  }
}

function makeProperty(key: unknown, value: unknown, locLine = 1, locCol = 0) {
  return {
    type: 'Property',
    key,
    value,
    loc: makeLoc(locLine, locCol, locLine, locCol + 10),
  }
}

// ===== META TESTS (8) =====

describe('no-property-rename rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noPropertyRenameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noPropertyRenameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noPropertyRenameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noPropertyRenameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noPropertyRenameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning property rename', () => {
      const desc = noPropertyRenameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/renam/)
    })

    test('should have correct docs URL', () => {
      expect(noPropertyRenameRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-property-rename',
      )
    })

    test('should have empty schema', () => {
      expect(noPropertyRenameRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ObjectPattern', () => {
      const { context } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(visitor).toHaveProperty('ObjectPattern')
      expect(typeof visitor.ObjectPattern).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noPropertyRenameRule).toBeDefined()
      expect(noPropertyRenameRule.meta).toBeDefined()
      expect(noPropertyRenameRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS RENAME (30) =====

  describe('positive cases — reports property rename', () => {
    test('reports single renamed property { foo: bar }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('foo'), makeIdentifier('bar'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('report message contains "Property rename detected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('foo'), makeIdentifier('bar'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].message).toContain('Property rename detected')
    })

    test('report message contains original key name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('sourceName'), makeIdentifier('targetName'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].message).toContain('sourceName')
    })

    test('report message contains renamed value name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('sourceName'), makeIdentifier('targetName'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].message).toContain('targetName')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].message).toBe(
        "Property rename detected: 'a' renamed to 'b'. Consider using consistent naming.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('x'), makeIdentifier('y'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('x'), makeIdentifier('y'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the Property node with rename', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('x'), makeIdentifier('y'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].node).toBe(prop)
    })

    test('reports rename with single character names { a: b }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports rename with long names { veryLongPropertyName: shortName }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('veryLongPropertyName'), makeIdentifier('shortName'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports rename with underscore names { _private: _internal }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('_private'), makeIdentifier('_internal'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports rename among multiple properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('a'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('c'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2]))
      expect(reports.length).toBe(1)
    })

    test('reports each renamed property separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('x'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('y'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2]))
      expect(reports.length).toBe(2)
    })

    test('reports correct message for each renamed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('x'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('y'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2]))
      expect(reports[0].message).toBe(
        "Property rename detected: 'a' renamed to 'x'. Consider using consistent naming.",
      )
      expect(reports[1].message).toBe(
        "Property rename detected: 'b' renamed to 'y'. Consider using consistent naming.",
      )
    })

    test('report loc values are preserved from Property node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('foo'), makeIdentifier('bar'), 5, 10)
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for ObjectPattern with only one renamed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('data'), makeIdentifier('result'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple ObjectPattern calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      const prop2 = makeProperty(makeIdentifier('c'), makeIdentifier('d'))
      visitor.ObjectPattern(makeObjectPattern([prop1]))
      visitor.ObjectPattern(makeObjectPattern([prop2]))
      expect(reports.length).toBe(2)
    })

    test('reports rename in mixed shorthand and renamed properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('x'), makeIdentifier('x'))
      const prop2 = makeProperty(makeIdentifier('y'), makeIdentifier('z'))
      const prop3 = makeProperty(makeIdentifier('w'), makeIdentifier('w'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2, prop3]))
      expect(reports.length).toBe(1)
    })

    test('reports rename with dollar sign names { $data: $result }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('$data'), makeIdentifier('$result'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports rename with numeric-like names { prop1: prop2 }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('prop1'), makeIdentifier('prop2'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports rename with camelCase names { myProp: myOtherProp }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('myProp'), makeIdentifier('myOtherProp'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports rename with ALL_CAPS names { MAX: LIMIT }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('MAX'), makeIdentifier('LIMIT'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports three renamed properties in single ObjectPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('x'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('y'))
      const prop3 = makeProperty(makeIdentifier('c'), makeIdentifier('z'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2, prop3]))
      expect(reports.length).toBe(3)
    })

    test('reports correctly when first property is renamed', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('renamed'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a')
    })

    test('reports correctly when last property is renamed', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('a'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('renamed'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('reports correctly when middle property is renamed', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('a'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('middle'))
      const prop3 = makeProperty(makeIdentifier('c'), makeIdentifier('c'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2, prop3]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('x'), makeIdentifier('y'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports rename when key and value differ only by case { name: Name }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('name'), makeIdentifier('Name'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports for Property node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = {
        type: 'Property',
        key: makeIdentifier('foo'),
        value: makeIdentifier('bar'),
        shorthand: false,
        computed: false,
        method: false,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectPattern with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      const node = makeObjectPattern([prop])
      node._parent = { type: 'VariableDeclarator' }
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for shorthand property { foo: foo }', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('foo'), makeIdentifier('foo'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for multiple shorthand properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('a'))
      const prop2 = makeProperty(makeIdentifier('b'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([prop1, prop2]))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty ObjectPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern(makeObjectPattern([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', properties: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties is a non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', properties: 'bad', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with Literal key', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = {
        type: 'Property',
        key: { type: 'Literal', value: 'foo', loc: makeLoc(1, 0, 1, 3) },
        value: makeIdentifier('bar'),
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with Literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = {
        type: 'Property',
        key: makeIdentifier('foo'),
        value: { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for RestElement in properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const rest = { type: 'RestElement', argument: makeIdentifier('rest'), loc: makeLoc(1, 0, 1, 5) }
      visitor.ObjectPattern(makeObjectPattern([rest]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with null key', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: null, value: makeIdentifier('bar'), loc: makeLoc(1, 0, 1, 10) }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: makeIdentifier('foo'), value: null, loc: makeLoc(1, 0, 1, 10) }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with missing key', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', value: makeIdentifier('bar'), loc: makeLoc(1, 0, 1, 10) }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with missing value', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: makeIdentifier('foo'), loc: makeLoc(1, 0, 1, 10) }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Property node type in properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const expr = { type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 5) }
      visitor.ObjectPattern(makeObjectPattern([expr]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with MemberExpression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const memberKey = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('prop'),
        loc: makeLoc(1, 0, 1, 8),
      }
      const prop = { type: 'Property', key: memberKey, value: makeIdentifier('val'), loc: makeLoc(1, 0, 1, 12) }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with MemberExpression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const memberVal = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('prop'),
        loc: makeLoc(1, 0, 1, 8),
      }
      const prop = { type: 'Property', key: makeIdentifier('val'), value: memberVal, loc: makeLoc(1, 0, 1, 12) }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      expect(() => visitor.ObjectPattern([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with empty string key name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier(''), makeIdentifier('bar'))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with empty string value name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('foo'), makeIdentifier(''))
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Property with undefined key name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = {
        type: 'Property',
        key: { type: 'Identifier', loc: makeLoc(1, 0, 1, 3) },
        value: makeIdentifier('bar'),
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noPropertyRenameRule.create(ctx1)
      const visitor2 = noPropertyRenameRule.create(ctx2)
      const prop1 = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      const prop2 = makeProperty(makeIdentifier('x'), makeIdentifier('x'))
      visitor1.ObjectPattern(makeObjectPattern([prop1]))
      visitor2.ObjectPattern(makeObjectPattern([prop2]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('a'), makeIdentifier('b'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('x'), makeIdentifier('x'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('c'), makeIdentifier('d'))]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: makeIdentifier('a'), value: makeIdentifier('b') }
      const node = { type: 'ObjectPattern', properties: [prop] }
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: makeIdentifier('a'), value: makeIdentifier('b') }
      const node = { type: 'ObjectPattern', properties: [prop] }
      visitor.ObjectPattern(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('a'), makeIdentifier('a'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('b'), makeIdentifier('c'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('d'), makeIdentifier('d'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('e'), makeIdentifier('f'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('g'), makeIdentifier('g'))]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noPropertyRenameRule.create(context)
      const visitor2 = noPropertyRenameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noPropertyRenameRule.meta
      const meta2 = noPropertyRenameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      const node = makeObjectPattern([prop])
      visitor.ObjectPattern(node)
      visitor.ObjectPattern(node)
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noPropertyRenameRule).toBeDefined()
      expect(typeof noPropertyRenameRule.create).toBe('function')
      expect(typeof noPropertyRenameRule.meta).toBe('object')
    })

    test('handles ObjectPattern with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      const node = {
        type: 'ObjectPattern',
        properties: [prop],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        _parent: {},
      }
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(1)
    })

    test('handles Property with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: makeIdentifier('a'), value: makeIdentifier('b'), loc: {} }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
    })

    test('handles Property with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = { type: 'Property', key: makeIdentifier('a'), value: makeIdentifier('b'), loc: { start: { line: 3, column: 5 } } }
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles null element in properties array', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([null, prop]))
      expect(reports.length).toBe(1)
    })

    test('handles undefined element in properties array', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([undefined, prop]))
      expect(reports.length).toBe(1)
    })

    test('handles string element in properties array', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern(['bad', prop]))
      expect(reports.length).toBe(1)
    })

    test('handles number element in properties array', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'))
      visitor.ObjectPattern(makeObjectPattern([42, prop]))
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific Property location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const prop = makeProperty(makeIdentifier('a'), makeIdentifier('b'), 10, 4)
      visitor.ObjectPattern(makeObjectPattern([prop]))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('does not report when all properties are shorthand', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const props = ['a', 'b', 'c', 'd', 'e'].map(name =>
        makeProperty(makeIdentifier(name), makeIdentifier(name))
      )
      visitor.ObjectPattern(makeObjectPattern(props))
      expect(reports.length).toBe(0)
    })

    test('reports correct count with many properties mixed', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      const props = [
        makeProperty(makeIdentifier('a'), makeIdentifier('a')),
        makeProperty(makeIdentifier('b'), makeIdentifier('renamedB')),
        makeProperty(makeIdentifier('c'), makeIdentifier('c')),
        makeProperty(makeIdentifier('d'), makeIdentifier('renamedD')),
        makeProperty(makeIdentifier('e'), makeIdentifier('e')),
      ]
      visitor.ObjectPattern(makeObjectPattern(props))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertyRenameRule.create(context)
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('a'), makeIdentifier('x'))]))
      visitor.ObjectPattern(makeObjectPattern([makeProperty(makeIdentifier('b'), makeIdentifier('y'))]))
      expect(reports[0].message).toMatch(/^Property rename detected:/)
      expect(reports[1].message).toMatch(/^Property rename detected:/)
    })
  })
})
