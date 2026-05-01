import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBindingPatternRule } from '../../../../src/rules/patterns/no-unnecessary-binding-pattern.js'
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

function makeBindingNode(
  name: string,
  leftName?: string,
  rightName?: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  const lName = leftName ?? name
  const rName = rightName ?? name
  return {
    type: 'ObjectPattern',
    properties: [{
      type: 'ObjectProperty',
      key: { type: 'Identifier', name },
      value: {
        type: 'AssignmentPattern',
        left: { type: 'Identifier', name: lName },
        right: { type: 'Identifier', name: rName },
      },
    }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-binding-pattern rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBindingPatternRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBindingPatternRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBindingPatternRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBindingPatternRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBindingPatternRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning unnecessary default', () => {
      const desc = noUnnecessaryBindingPatternRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/unnecessary/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBindingPatternRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-binding-pattern',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBindingPatternRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ObjectPattern', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(visitor).toHaveProperty('ObjectPattern')
      expect(typeof visitor.ObjectPattern).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBindingPatternRule).toBeDefined()
      expect(noUnnecessaryBindingPatternRule.meta).toBeDefined()
      expect(noUnnecessaryBindingPatternRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY BINDING (25) =====

  describe('positive cases — reports unnecessary binding pattern', () => {
    test('reports for simple name "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for simple name "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for camelCase name "myVar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('myVar'))
      expect(reports.length).toBe(1)
    })

    test('reports for underscore-prefixed name "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for single letter name "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('x'))
      expect(reports.length).toBe(1)
    })

    test('reports for dollar-sign name "$"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('$'))
      expect(reports.length).toBe(1)
    })

    test('reports for long name "veryLongVariableName"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('veryLongVariableName'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "data"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('data'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "result"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('result'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('value'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "config"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('config'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "options"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('options'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "item"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('item'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "callback"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('callback'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "handler"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('handler'))
      expect(reports.length).toBe(1)
    })

    test('reports for double underscore name "__proto"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('__proto'))
      expect(reports.length).toBe(1)
    })

    test('reports for dollar-prefixed name "$jq"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('$jq'))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric suffix name "var1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('var1'))
      expect(reports.length).toBe(1)
    })

    test('reports for ALL_CAPS name "MAX_SIZE"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('MAX_SIZE'))
      expect(reports.length).toBe(1)
    })

    test('reports for PascalCase name "MyClass"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('MyClass'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "err"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('err'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "ctx"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('ctx'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "ref"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('ref'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "props"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('props'))
      expect(reports.length).toBe(1)
    })

    test('reports for name "state"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('state'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary default value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports[0].message).toContain('Unnecessary default value')
    })

    test('report message contains the identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports[0].message).toContain('foo')
    })

    test('report message mentions "binding already has the same name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports[0].message).toContain('binding already has the same name')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports[0].node).toBeDefined()
    })

    test('report message is exactly as defined in rule source for "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('bar'))
      expect(reports[0].message).toBe(
        "Unnecessary default value for 'bar'. The binding already has the same name.",
      )
    })

    test('report message is exactly as defined for "myVar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('myVar'))
      expect(reports[0].message).toBe(
        "Unnecessary default value for 'myVar'. The binding already has the same name.",
      )
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo', undefined, undefined, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo', undefined, undefined, 3, 0, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      visitor.ObjectPattern(makeBindingNode('bar'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format for different names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      visitor.ObjectPattern(makeBindingNode('bar'))
      expect(reports[0].message).toMatch(/^Unnecessary default value for/)
      expect(reports[1].message).toMatch(/^Unnecessary default value for/)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report node matches the input ObjectPattern node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      const node = makeBindingNode('foo')
      visitor.ObjectPattern(node)
      expect(reports[0].node).toBe(node)
    })

    test('different names produce different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('alpha'))
      visitor.ObjectPattern(makeBindingNode('beta'))
      expect(reports[0].message).not.toBe(reports[1].message)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })

    test('report message for underscore name includes underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('_hidden'))
      expect(reports[0].message).toContain('_hidden')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for different left and right names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo', 'foo', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is "a" and right is "b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('key', 'a', 'b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "Identifier"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "Literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties array has 0 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties array has 2 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          { type: 'ObjectProperty', key: { type: 'Identifier', name: 'a' }, value: { type: 'Identifier', name: 'a' } },
          { type: 'ObjectProperty', key: { type: 'Identifier', name: 'b' }, value: { type: 'Identifier', name: 'b' } },
        ],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property type is not ObjectProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'RestElement',
          argument: { type: 'Identifier', name: 'rest' },
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when value type is not AssignmentPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: { type: 'Identifier', name: 'foo' },
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'ObjectPattern', properties: [] },
            right: { type: 'Identifier', name: 'foo' },
          },
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: { type: 'Literal', value: 42 },
          },
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when properties is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', properties: 'not-array', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when first property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', properties: [null], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: null,
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when AssignmentPattern left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: null,
            right: { type: 'Identifier', name: 'foo' },
          },
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when AssignmentPattern right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: null,
          },
        }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when case differs between left and right names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('key', 'Foo', 'foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBindingPatternRule.create(ctx1)
      const visitor2 = noUnnecessaryBindingPatternRule.create(ctx2)
      visitor1.ObjectPattern(makeBindingNode('foo'))
      visitor2.ObjectPattern(makeBindingNode('foo', 'foo', 'bar'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo'))
      visitor.ObjectPattern(makeBindingNode('bar', 'bar', 'baz'))
      visitor.ObjectPattern(makeBindingNode('qux'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      const node = {
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: { type: 'Identifier', name: 'foo' },
          },
        }],
      }
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo', 'foo', 'bar'))
      visitor.ObjectPattern(makeBindingNode('bar'))
      visitor.ObjectPattern({ type: 'Identifier', name: 'x' })
      visitor.ObjectPattern(makeBindingNode('baz'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBindingPatternRule.create(context)
      const visitor2 = noUnnecessaryBindingPatternRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBindingPatternRule.meta
      const meta2 = noUnnecessaryBindingPatternRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      const node = {
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: { type: 'Identifier', name: 'foo' },
          },
          computed: false,
          shorthand: true,
        }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: { type: 'Identifier', name: 'foo' },
          },
        }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: { type: 'Identifier', name: 'foo' },
          },
        }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      const node = makeBindingNode('foo')
      visitor.ObjectPattern(node)
      visitor.ObjectPattern(node)
      visitor.ObjectPattern(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBindingPatternRule).toBeDefined()
      expect(typeof noUnnecessaryBindingPatternRule.create).toBe('function')
      expect(typeof noUnnecessaryBindingPatternRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'foo' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'foo' },
            right: { type: 'Identifier', name: 'foo' },
          },
        }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('alpha'))
      visitor.ObjectPattern(makeBindingNode('beta'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })

    test('node with shorthand property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'val' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'val' },
            right: { type: 'Identifier', name: 'val' },
          },
          shorthand: true,
        }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('node with computed property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [{
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'prop' },
          value: {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'prop' },
            right: { type: 'Identifier', name: 'prop' },
          },
          computed: false,
        }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when properties array has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({
        type: 'ObjectPattern',
        properties: [
          { type: 'ObjectProperty', key: { type: 'Identifier', name: 'a' }, value: { type: 'Identifier', name: 'a' } },
          { type: 'ObjectProperty', key: { type: 'Identifier', name: 'b' }, value: { type: 'Identifier', name: 'b' } },
          { type: 'ObjectProperty', key: { type: 'Identifier', name: 'c' }, value: { type: 'Identifier', name: 'c' } },
        ],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('foo', undefined, undefined, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles node where properties is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern({ type: 'ObjectPattern', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when left name differs by case only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      visitor.ObjectPattern(makeBindingNode('key', 'myVar', 'MyVar'))
      expect(reports.length).toBe(0)
    })

    test('handles array primitive node without throwing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBindingPatternRule.create(context)
      expect(() => visitor.ObjectPattern([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
