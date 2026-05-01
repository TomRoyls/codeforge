import { describe, expect, test, vi } from 'vitest'
import { noComputedKeysRule } from '../../../../src/rules/patterns/no-computed-keys.js'
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
    getSource: () => "const obj = { ['name']: 'foo' }",
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

function makeComputedProperty(
  keyValue: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'Property',
    computed: true,
    key: { type: 'Literal', value: keyValue },
    value: { type: 'Identifier', name: 'val' },
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-computed-keys rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noComputedKeysRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noComputedKeysRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noComputedKeysRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noComputedKeysRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noComputedKeysRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning computed and property', () => {
      const desc = noComputedKeysRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/computed/)
      expect(desc).toMatch(/property/)
    })

    test('should have correct docs URL', () => {
      expect(noComputedKeysRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-computed-keys',
      )
    })

    test('should have empty schema', () => {
      expect(noComputedKeysRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Property', () => {
      const { context } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      expect(visitor).toHaveProperty('Property')
      expect(typeof visitor.Property).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noComputedKeysRule).toBeDefined()
      expect(noComputedKeysRule.meta).toBeDefined()
      expect(noComputedKeysRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports computed key with valid identifier', () => {
    test('reports { [\'name\']: \'foo\' } — computed key with valid identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'age\']: 25 } — different valid identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('age'))
      expect(reports.length).toBe(1)
    })

    test('message contains "computed property"', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].message.toLowerCase()).toContain('computed property')
    })

    test('message mentions "static"', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].message.toLowerCase()).toContain('static')
    })

    test('message contains the key name "name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].message).toContain('name')
    })

    test('message contains the key name "age"', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('age'))
      expect(reports[0].message).toContain('age')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = makeComputedProperty('name')
      visitor.Property(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports { [\'$el\']: document } — dollar sign start', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('$el'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'_private\']: 1 } — underscore start', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'foo123\']: \'bar\' } — alphanumeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('foo123'))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      visitor.Property(makeComputedProperty('age'))
      visitor.Property(makeComputedProperty('foo'))
      expect(reports.length).toBe(3)
    })

    test('reports { [\'camelCase\']: true } — camelCase identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('camelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'PascalCase\']: class {} } — PascalCase identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('PascalCase'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'_$mixed\']: 1 } — mixed $ and _', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('_$mixed'))
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports.length).toBe(1)
    })

    test('report loc start has correct values', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('report loc end has correct values', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].loc?.end).toEqual({ line: 1, column: 20 })
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report { name: \'foo\' } — static key, computed: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: false,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'foo-bar\']: \'baz\' } — hyphen in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('foo-bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'foo.bar\']: \'baz\' } — dot in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('foo.bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'foo bar\']: \'baz\' } — space in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('foo bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'123abc\']: \'baz\' } — starts with digit', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('123abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'\']: \'baz\' } — empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty(''))
      expect(reports.length).toBe(0)
    })

    test('does not report { [42]: \'baz\' } — number literal key', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 42 },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report { [expr]: \'baz\' } — Identifier expression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'expr' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Property node — VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      expect(() => visitor.Property(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      expect(() => visitor.Property(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Property with key as Identifier (not Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'dynamicKey' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property with null key', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: null,
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property with undefined key', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: undefined,
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property with missing key property', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property where key.value is number', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 3.14 },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property where key.value is boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: true },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property where key.value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: null },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property where key.value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: undefined },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property where key.type is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — no type Property', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      expect(() => visitor.Property({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'foo!\']: 1 } — exclamation mark', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('foo!'))
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      expect(() => visitor.Property('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      expect(() => visitor.Property(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'a@b\']: 1 } — at sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('a@b'))
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'a#b\']: 1 } — hash', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('a#b'))
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'kebab-case\']: 1 } — kebab-case', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('kebab-case'))
      expect(reports.length).toBe(0)
    })

    test('does not report Property with computed undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report { [\'  \']: 1 } — spaces only', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('  '))
      expect(reports.length).toBe(0)
    })

    test('does not report Property where key has no value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', raw: '"name"' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property with computed: 0 — falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: 0,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Property with computed: \'\' — falsy', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: '',
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noComputedKeysRule.create(ctx1)
      const visitor2 = noComputedKeysRule.create(ctx2)

      visitor1.Property(makeComputedProperty('name'))
      visitor2.Property({
        type: 'Property',
        computed: false,
        key: { type: 'Literal', value: 'age' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('a'))
      visitor.Property(makeComputedProperty('b'))
      visitor.Property(makeComputedProperty('c'))
      visitor.Property(makeComputedProperty('d'))
      expect(reports.length).toBe(4)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
      }
      visitor.Property(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      // reports — valid identifier
      visitor.Property(makeComputedProperty('name'))
      // does NOT report — hyphen
      visitor.Property(makeComputedProperty('foo-bar'))
      // reports — valid identifier
      visitor.Property(makeComputedProperty('age'))
      // does NOT report — not Property type
      visitor.Property({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: makeLoc(3, 0, 3, 10),
      })
      // reports — valid identifier
      visitor.Property(makeComputedProperty('foo'))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      visitor.Property(makeComputedProperty('name'))
      visitor.Property(makeComputedProperty('name'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noComputedKeysRule.create(context)
      const visitor2 = noComputedKeysRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('computed key with empty string does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty(''))
      expect(reports.length).toBe(0)
    })

    test('handles Property with key.value as RegExp — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: /test/ },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('handles Property with key.value as plain object — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: { nested: true } },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('bare Property node (only type) does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = { type: 'Property' }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('node with extra properties still reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        method: false,
        shorthand: false,
        kind: 'init',
        optional: false,
        leadingComments: [],
        trailingComments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('Property with computed: NaN does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: NaN,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('Property with computed: null does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: null,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('node with loc having only start property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'name' },
        value: { type: 'Identifier', name: 'val' },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noComputedKeysRule.meta
      const meta2 = noComputedKeysRule.meta
      expect(meta1).toBe(meta2)
    })

    test('all violation messages for same key are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      visitor.Property(makeComputedProperty('name'))
      visitor.Property(makeComputedProperty('name'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('reports { [\'$\']: ... } — single dollar sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('$'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'_\']: ... } — single underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('_'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'a\']: ... } — single letter', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('a'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'Z\']: ... } — single uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('Z'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'$$\']: ... } — double dollar', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('$$'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'__proto__\']: ... } — special but valid pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('__proto__'))
      expect(reports.length).toBe(1)
    })

    test('does not report { [\'a+b\']: 1 } — plus sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('a+b'))
      expect(reports.length).toBe(0)
    })

    test('reports with node containing extra properties — verifies robustness', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'myKey', raw: '"myKey"' },
        value: { type: 'Identifier', name: 'val', typeAnnotation: null },
        loc: makeLoc(1, 0, 1, 20),
        parent: { type: 'ObjectExpression' },
        range: [0, 20],
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('does not report { [\'123\']: 1 } — all digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('123'))
      expect(reports.length).toBe(0)
    })

    test('message format contains backtick-wrapped key name', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('name'))
      expect(reports[0].message).toContain('`name`')
    })

    test('reports { [\'foo_bar_baz\']: ... } — underscores in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('foo_bar_baz'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'$$_$$\']: ... } — mixed dollar and underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('$$_$$'))
      expect(reports.length).toBe(1)
    })

    test('reports { [\'A1_B2\']: ... } — mixed case and digits', () => {
      const { context, reports } = createMockContext()
      const visitor = noComputedKeysRule.create(context)
      visitor.Property(makeComputedProperty('A1_B2'))
      expect(reports.length).toBe(1)
    })
  })
})
