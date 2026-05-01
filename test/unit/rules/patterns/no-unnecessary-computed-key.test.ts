import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryComputedKeyRule } from '../../../../src/rules/patterns/no-unnecessary-computed-key.js'
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
    getSource: () => '{}',
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

function makePropertyNode(
  keyValue: string,
  computed = true,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'Property',
    computed,
    key: { type: 'Literal', value: keyValue },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-computed-key rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryComputedKeyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryComputedKeyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryComputedKeyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryComputedKeyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryComputedKeyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning computed key', () => {
      const desc = noUnnecessaryComputedKeyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/computed/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryComputedKeyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-computed-key',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryComputedKeyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Property', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(visitor).toHaveProperty('Property')
      expect(typeof visitor.Property).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryComputedKeyRule).toBeDefined()
      expect(noUnnecessaryComputedKeyRule.meta).toBeDefined()
      expect(noUnnecessaryComputedKeyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY COMPUTED KEY (25) =====

  describe('positive cases — reports unnecessary computed key', () => {
    test('reports for computed key with "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('$'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "camelCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('camelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "PascalCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('PascalCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "$dollar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('$dollar'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "__proto"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('__proto'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "a1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('a1'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "myVar2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('myVar2'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('_'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "$$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('$$'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "UPPER"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('UPPER'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "lower"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('lower'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "$var$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('$var$'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with single char "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "abc123def"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('abc123def'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "_$_$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('_$_$'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "longIdentifierName"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('longIdentifierName'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "x2y3z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('x2y3z'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('test'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('key'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('z'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "A"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('A'))
      expect(reports.length).toBe(1)
    })

    test('reports for computed key with "Z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('Z'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary computed key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0].message).toContain('Unnecessary computed key')
    })

    test('report message contains the key name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('myProp'))
      expect(reports[0].message).toContain('myProp')
    })

    test('report message mentions "Use ... directly"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0].message).toContain('directly')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0].message).toBe(
        "Unnecessary computed key ['foo']. Use 'foo' directly.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Property node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      const node = makePropertyNode('foo')
      visitor.Property(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo', true, 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has message, loc, and node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      visitor.Property(makePropertyNode('bar'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      visitor.Property(makePropertyNode('bar'))
      const msg0 = reports[0].message
      const msg1 = reports[1].message
      expect(msg0.replaceAll('foo', 'X')).toBe(msg1.replaceAll('bar', 'X'))
    })

    test('single report per matching Property node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports.length).toBe(1)
      visitor.Property(makePropertyNode('foo'))
      expect(reports.length).toBe(2)
    })

    test('reports two different keys separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('alpha'))
      visitor.Property(makePropertyNode('beta'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })

    test('report message includes bracket notation for key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0].message).toContain("['foo']")
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo', true, 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo', false))
      expect(reports.length).toBe(0)
    })

    test('does not report for numeric key value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with dash "foo-bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo-bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with space "foo bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with dot "foo.bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo.bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier key type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral key type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'TemplateLiteral', quasis: [] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal key with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal key with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for key starting with number "1abc"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('1abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(() => visitor.Property(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(() => visitor.Property(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(() => visitor.Property('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(() => visitor.Property(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(() => visitor.Property(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      expect(() => visitor.Property({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with special chars "foo!bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo!bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with operator chars "foo+bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo+bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null key property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for missing key property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key string "#hash"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('#hash'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key string "foo,bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo,bar'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryComputedKeyRule.create(ctx1)
      const visitor2 = noUnnecessaryComputedKeyRule.create(ctx2)
      visitor1.Property(makePropertyNode('foo'))
      visitor2.Property(makePropertyNode('bar', false))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      visitor.Property(makePropertyNode('bar', false))
      visitor.Property(makePropertyNode('baz'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      const node = { type: 'Property', computed: true, key: { type: 'Literal', value: 'foo' } }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      const node = { type: 'Property', computed: true, key: { type: 'Literal', value: 'foo' } }
      visitor.Property(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('valid', true))   // reports
      visitor.Property(makePropertyNode('foo-bar', true))  // no report (invalid identifier)
      visitor.Property(makePropertyNode('ok', false))      // no report (not computed)
      visitor.Property(makePropertyNode('also', true))     // reports
      visitor.Property(makePropertyNode('1bad', true))     // no report (starts with number)
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryComputedKeyRule.create(context)
      const visitor2 = noUnnecessaryComputedKeyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryComputedKeyRule.meta
      const meta2 = noUnnecessaryComputedKeyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'foo' },
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        method: false,
        shorthand: false,
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({ type: 'Property', computed: true, key: { type: 'Literal', value: 'foo' }, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({ type: 'Property', computed: true, key: { type: 'Literal', value: 'foo' }, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      const node = makePropertyNode('foo')
      visitor.Property(node)
      visitor.Property(node)
      visitor.Property(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryComputedKeyRule).toBeDefined()
      expect(typeof noUnnecessaryComputedKeyRule.create).toBe('function')
      expect(typeof noUnnecessaryComputedKeyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({ type: 'Property', computed: true, key: { type: 'Literal', value: 'foo' }, loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('alpha'))
      visitor.Property(makePropertyNode('beta'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })

    test('report loc reflects specific end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property(makePropertyNode('foo', true, 10, 4, 10, 12))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('non-object key (string primitive) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: 'not-an-object',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('non-object key (number primitive) does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: 42,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('key with undefined Literal value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('key with array Literal value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryComputedKeyRule.create(context)
      visitor.Property({
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: ['a'] },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })
})
