import { describe, expect, test, vi } from 'vitest'
import { noUselessComputedKeyRule } from '../../../../src/rules/patterns/no-useless-computed-key.js'
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
    getSource: () => '({ [foo]: 1 })',
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
  computed: boolean,
  keyType: string,
  keyValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'Property',
    computed,
    key: {
      type: keyType,
      ...(keyType === 'Identifier' ? { name: keyValue } : { value: keyValue }),
      _parent: null,
      loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    },
    value: { type: 'Literal', value: 1 },
    _parent: null,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-useless-computed-key rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessComputedKeyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessComputedKeyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessComputedKeyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessComputedKeyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessComputedKeyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning computed property key', () => {
      const desc = noUselessComputedKeyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/computed/)
    })

    test('should have correct docs URL', () => {
      expect(noUselessComputedKeyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-computed-key',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessComputedKeyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Property', () => {
      const { context } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(visitor).toHaveProperty('Property')
      expect(typeof visitor.Property).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessComputedKeyRule).toBeDefined()
      expect(noUselessComputedKeyRule.meta).toBeDefined()
      expect(noUselessComputedKeyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS USELESS COMPUTED KEY (30) =====

  describe('positive cases — reports useless computed key', () => {
    test('reports computed Identifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'bar'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary computed property key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports[0].message).toContain('Unnecessary computed property key')
    })

    test('report message suggests using literal key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports[0].message).toContain('literal key')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Property node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = makePropertyNode(true, 'Identifier', 'foo')
      visitor.Property(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports[0].message).toBe(
        'Unnecessary computed property key. Use a literal key instead.',
      )
    })

    test('reports computed Identifier with different name "myKey"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'myKey'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier with single char name "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'x'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', ''))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with multi-word value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'hello world'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier with underscore prefix "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', '_private'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier with dollar sign "$ref"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', '$ref'))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'a'))
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'b'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'a'))
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'b'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports computed Identifier with camelCase name "myPropertyName"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'myPropertyName'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with numeric string value "123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', '123'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with dash "my-key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'my-key'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with space "my key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'my key'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier "name" in object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'name'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral "class" reserved word as key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'class'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with unicode content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'café'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier with long name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'thisIsAVeryLongPropertyName'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with single char value "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'a'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier with ALL_CAPS name "CONSTANT"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'CONSTANT'))
      expect(reports.length).toBe(1)
    })

    test('reports computed StringLiteral with path-like value "a/b/c"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'a/b/c'))
      expect(reports.length).toBe(1)
    })

    test('reports computed Identifier with numeric suffix "prop1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'prop1'))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for non-computed Identifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(false, 'Identifier', 'foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-computed StringLiteral key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(false, 'StringLiteral', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed NumericLiteral key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'NumericLiteral', '42'))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed TemplateLiteral key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
          loc: makeLoc(1, 0, 1, 10),
        },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for computed MemberExpression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
          loc: makeLoc(1, 0, 1, 10),
        },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for computed CallExpression key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
          loc: makeLoc(1, 0, 1, 10),
        },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      expect(() => visitor.Property([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "ObjectExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "CallExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "BinaryExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "Identifier"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: false,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: 0,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: '',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when computed is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: null,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: null,
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: 'foo',
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is "Literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 'foo', loc: makeLoc(1, 0, 1, 5) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is "NumericLiteral"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is "BooleanLiteral"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'BooleanLiteral', value: true, loc: makeLoc(1, 0, 1, 4) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is "BinaryExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is "ArrowFunctionExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when key type is "ConditionalExpression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 10) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type as visitor input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type as visitor input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type as visitor input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type as visitor input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessComputedKeyRule.create(ctx1)
      const visitor2 = noUselessComputedKeyRule.create(ctx2)
      visitor1.Property(makePropertyNode(true, 'Identifier', 'foo'))
      visitor2.Property(makePropertyNode(false, 'Identifier', 'bar'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'a'))
      visitor.Property(makePropertyNode(false, 'Identifier', 'b'))
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'c'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
      }
      visitor.Property(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(false, 'Identifier', 'a'))
      visitor.Property(makePropertyNode(true, 'Identifier', 'b'))
      visitor.Property(makePropertyNode(true, 'NumericLiteral', '42'))
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'd'))
      visitor.Property(makePropertyNode(false, 'StringLiteral', 'e'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessComputedKeyRule.create(context)
      const visitor2 = noUselessComputedKeyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUselessComputedKeyRule.meta
      const meta2 = noUselessComputedKeyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        method: false,
        shorthand: false,
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: {},
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = makePropertyNode(true, 'Identifier', 'foo')
      visitor.Property(node)
      visitor.Property(node)
      visitor.Property(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUselessComputedKeyRule).toBeDefined()
      expect(typeof noUselessComputedKeyRule.create).toBe('function')
      expect(typeof noUselessComputedKeyRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo', _parent: {} },
        value: { type: 'Literal', value: 1 },
        _parent: { type: 'ObjectExpression' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'a'))
      visitor.Property(makePropertyNode(true, 'StringLiteral', 'b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('computed with truthy number 1 does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: 1,
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('computed with truthy string "yes" does report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: 'yes',
        key: { type: 'Identifier', name: 'foo' },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      visitor.Property(makePropertyNode(true, 'Identifier', 'foo', 10, 4, 10, 15))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('does not report when key type is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 5) },
        value: { type: 'Literal', value: 1 },
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(0)
    })

    test('node without key object but computed true does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      expect(() => visitor.Property(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('computed property with shorthand true does not affect reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessComputedKeyRule.create(context)
      const node = {
        type: 'Property',
        computed: true,
        key: { type: 'Identifier', name: 'foo', _parent: null },
        value: { type: 'Literal', value: 1 },
        shorthand: true,
        _parent: null,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Property(node)
      expect(reports.length).toBe(1)
    })
  })
})
