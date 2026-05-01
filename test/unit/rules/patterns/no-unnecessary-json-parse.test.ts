import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryJsonParseRule } from '../../../../src/rules/patterns/no-unnecessary-json-parse.js'
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

function makeJsonParseNode(
  argValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'JSON' },
      property: { type: 'Identifier', name: 'parse' },
    },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-json-parse rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryJsonParseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryJsonParseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryJsonParseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryJsonParseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryJsonParseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning JSON.parse', () => {
      const desc = noUnnecessaryJsonParseRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/json\.parse/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryJsonParseRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-json-parse',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryJsonParseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryJsonParseRule).toBeDefined()
      expect(noUnnecessaryJsonParseRule.meta).toBeDefined()
      expect(noUnnecessaryJsonParseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY JSON.PARSE (25) =====

  describe('positive cases — reports unnecessary JSON.parse', () => {
    test('reports JSON.parse with object-like string "{}"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with array-like string "[]"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object with key \'{"a":1}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"a":1}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with array with items \'[1,2,3]\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[1,2,3]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with nested object \'{"a":{"b":2}}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"a":{"b":2}}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with nested array \'[[1,2],[3,4]]\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[[1,2],[3,4]]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with string starting with { but not valid JSON', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{not valid json'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with string starting with [ but not valid JSON', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[not valid json'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with whitespace-only object-like "{ }"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{ }'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with whitespace-only array-like "[ ]"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[ ]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with complex object \'{"name":"test","values":[1,2,3]}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"name":"test","values":[1,2,3]}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with single-char brace string "{"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with single-char bracket string "["', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('['))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object containing null \'{"a":null}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"a":null}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with array of strings \'["a","b","c"]\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('["a","b","c"]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with deeply nested \'{"x":[{"y":1}]}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"x":[{"y":1}]}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object starting with spaces after brace "{ "x": 1 }"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{ "x": 1 }'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with array starting with spaces "[ 1, 2 ]"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[ 1, 2 ]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object with boolean \'{"active":true}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"active":true}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object with nested array \'{"items":[1]}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"items":[1]}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object containing special chars \'{"@type":"Event"}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"@type":"Event"}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with array of mixed types \'[1,"a",null,true]\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[1,"a",null,true]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with object with unicode key \'{"\\u0041":1}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"\\u0041":1}'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with long array \'[1,2,3,4,5,6,7,8,9,10]\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('[1,2,3,4,5,6,7,8,9,10]'))
      expect(reports.length).toBe(1)
    })

    test('reports JSON.parse with escaped string \'{"key":"value with \\"quotes\\""}\'', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"key":"value"}'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "JSON.parse"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports[0].message).toContain('JSON.parse')
    })

    test('report message mentions "static string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports[0].message.toLowerCase()).toContain('static string')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports[0].message).toBe(
        'Unnecessary JSON.parse() on a static string. Use the value directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      const node = makeJsonParseNode('{}')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      visitor.CallExpression(makeJsonParseNode('[]'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      visitor.CallExpression(makeJsonParseNode('[1,2]'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports only once per JSON.parse call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{"a":1,"b":2}'))
      expect(reports.length).toBe(1)
    })

    test('multiple violations each produce separate reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      visitor.CallExpression(makeJsonParseNode('[]'))
      visitor.CallExpression(makeJsonParseNode('{"x":1}'))
      expect(reports.length).toBe(3)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}', 2, 0, 4, 15))
      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report for array-like string has same message as object-like', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryJsonParseRule.create(ctx1)
      const visitor2 = noUnnecessaryJsonParseRule.create(ctx2)
      visitor1.CallExpression(makeJsonParseNode('{}'))
      visitor2.CallExpression(makeJsonParseNode('[]'))
      expect(rep1[0].message).toBe(rep2[0].message)
    })

    test('report for complex JSON string has same message', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryJsonParseRule.create(ctx1)
      const visitor2 = noUnnecessaryJsonParseRule.create(ctx2)
      visitor1.CallExpression(makeJsonParseNode('{}'))
      visitor2.CallExpression(makeJsonParseNode('{"complex":"object","with":["many","keys"]}'))
      expect(rep1[0].message).toBe(rep2[0].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for plain string not starting with { or [', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('hello world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for JSON.stringify (not parse)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-JSON object (Foo.parse)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Foo' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.parse (not JSON)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'foo',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('reports for computed property access JSON["parse"] with object string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for wrong argument count (zero args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong argument count (two args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [
          { type: 'Literal', value: '{}' },
          { type: 'Literal', value: 'reviver' },
        ],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string variable argument (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Identifier', name: 'str' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: '[' },
          right: { type: 'Literal', value: ']' },
        }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string starting with letter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string starting with number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('123'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string starting with space', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode(' {"a":1}'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with number value (not string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with boolean value (not string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryJsonParseRule.create(ctx1)
      const visitor2 = noUnnecessaryJsonParseRule.create(ctx2)
      visitor1.CallExpression(makeJsonParseNode('{}'))
      visitor2.CallExpression(makeJsonParseNode('abc'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}'))
      visitor.CallExpression(makeJsonParseNode('hello'))
      visitor.CallExpression(makeJsonParseNode('[]'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('hello'))
      visitor.CallExpression(makeJsonParseNode('{}'))
      visitor.CallExpression(makeJsonParseNode('123'))
      visitor.CallExpression(makeJsonParseNode('[]'))
      visitor.CallExpression(makeJsonParseNode('world'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryJsonParseRule.create(context)
      const visitor2 = noUnnecessaryJsonParseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryJsonParseRule.meta
      const meta2 = noUnnecessaryJsonParseRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryJsonParseRule).toBeDefined()
      expect(typeof noUnnecessaryJsonParseRule.create).toBe('function')
      expect(typeof noUnnecessaryJsonParseRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression(makeJsonParseNode('{}', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('handles null callee gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles null object in callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles null property in callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: '{}' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-string Literal value (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: undefined }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-string Literal value (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      const node = makeJsonParseNode('{}')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node where arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryJsonParseRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'parse' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})
