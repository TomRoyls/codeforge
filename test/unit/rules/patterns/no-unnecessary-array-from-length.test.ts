import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFromLengthRule } from '../../../../src/rules/patterns/no-unnecessary-array-from-length.js'
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

function makeArrayFromNode(arg: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Array' },
      property: { type: 'Identifier', name: 'from' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-from-length rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array.from', () => {
      const desc = noUnnecessaryArrayFromLengthRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array\.from/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-from-length.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFromLengthRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFromLengthRule).toBeDefined()
      expect(noUnnecessaryArrayFromLengthRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFromLengthRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (26) =====

  describe('positive cases — reports unnecessary Array.from(x.length)', () => {
    test('reports for Array.from(x.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(arr.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(data.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'data' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(items.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'items' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(list.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'list' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Array.from(x.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0].message).toMatch(/Array\.from/)
    })

    test('report message mentions Array(x.length) as alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0].message).toMatch(/Array\(x\.length\)/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      const node = makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0].message).toBe(
        'Array.from(x.length) creates an array from the length value, not an array of that length. Use Array(x.length) or Array.from({ length: x.length }) instead.',
      )
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Array.from(result.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'result' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(values.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'values' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(nodes.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'nodes' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(buffer.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'buffer' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(str.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'str' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(collection.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'collection' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(input.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'input' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(size.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'size' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(vec.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'vec' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(bytes.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'bytes' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(array.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'array' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(target.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'target' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Array.from() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(set)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'Identifier', name: 'set' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(map)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'Identifier', name: 'map' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyArray.from(x.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'MyArray' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 24),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of(x.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.isArray(x.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'isArray' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 24),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(x.size)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'size' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(x.count)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'count' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(x.len)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'len' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(x.length, fn) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'length' } },
          { type: 'Identifier', name: 'fn' },
        ],
        loc: makeLoc(1, 0, 1, 24),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(x.length, fn, thisArg) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'length' } },
          { type: 'Identifier', name: 'fn' },
          { type: 'ThisExpression' },
        ],
        loc: makeLoc(1, 0, 1, 32),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from({ length: x.length })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'length' },
          value: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'x' },
            property: { type: 'Identifier', name: 'length' },
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Identifier', name: 'x' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Literal', value: 'length' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(x.length) where arg property is "Length" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'Length' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "array" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 24),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with argument being a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'Literal', value: 5 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from with argument being a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getLen' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg object is not an Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(1)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFromLengthRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFromLengthRule.create(ctx2)
      visitor1.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor2.CallExpression(makeArrayFromNode({ type: 'Identifier', name: 'set' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor.CallExpression(makeArrayFromNode({ type: 'Identifier', name: 'set' }))
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({ type: 'Identifier', name: 'set' }))
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor.CallExpression(makeArrayFromNode({ type: 'Literal', value: 5 }))
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor.CallExpression(makeArrayFromNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFromLengthRule.create(context)
      const visitor2 = noUnnecessaryArrayFromLengthRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFromLengthRule.meta
      const meta2 = noUnnecessaryArrayFromLengthRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      const node = makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFromLengthRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFromLengthRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFromLengthRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'x' },
          property: { type: 'Identifier', name: 'length' },
        }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Identifier', name: 'length' },
      }))
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
      }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles computed member expression on argument object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression(makeArrayFromNode({
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'x' },
        property: { type: 'Literal', value: 'length' },
      }))
      expect(reports.length).toBe(0)
    })

    test('handles null argument in arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromLengthRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })
  })
})
