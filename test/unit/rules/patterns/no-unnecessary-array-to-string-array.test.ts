import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToStringArray } from '../../../../src/rules/patterns/no-unnecessary-array-to-string-array.js'
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

// Helper: creates an Array.from(x.toString()) AST node
function makeArrayFromToString(
  innerObjectName = 'arr',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Array' },
      property: { type: 'Identifier', name: 'from' },
    },
    arguments: [
      {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: innerObjectName },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
      },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-string-array rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToStringArray.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToStringArray.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToStringArray.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToStringArray.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToStringArray.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array.from', () => {
      const desc = noUnnecessaryArrayToStringArray.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array\.from/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayToStringArray.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-to-string-array.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToStringArray.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToStringArray).toBeDefined()
      expect(noUnnecessaryArrayToStringArray.meta).toBeDefined()
      expect(noUnnecessaryArrayToStringArray.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports Array.from(x.toString())', () => {
    test('reports for Array.from(arr.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('arr'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(x.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('x'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(obj.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('obj'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(data.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('data'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(result.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('result'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(values.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('values'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(items.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('items'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(list.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('list'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(myVar.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('myVar'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(buffer.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('buffer'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(response.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('response'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(config.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('config'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(output.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('output'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from(input.toString())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('input'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Array.from', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].message).toMatch(/Array\.from/)
    })

    test('report message mentions toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].message).toMatch(/toString/)
    })

    test('report message mentions split', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].message).toMatch(/split/)
    })

    test('report message mentions characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].message).toMatch(/characters/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].message).toBe(
        `Array.from(arr.toString()) splits a string into characters. Use arr.split('') directly if that is the intent.`,
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      const node = makeArrayFromToString()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('arr', 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('arr'))
      visitor.CallExpression(makeArrayFromToString('obj'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('arr'))
      visitor.CallExpression(makeArrayFromToString('obj'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Array.from with toString on single-letter identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with toString on underscore identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with toString on dollar identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('$jquery'))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from with toString on long identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('someVeryLongVariableName'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (43) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Array.from(arr) — no inner toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(arr.toString(), fn) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
          { type: 'Identifier', name: 'fn' },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.isArray(arr.toString()) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'isArray' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyArray.from(arr.toString()) — different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'MyArray' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(arr.join()) — different inner method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'join' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(arr.valueOf()) — different inner method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'valueOf' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(arr.toLocaleString()) — different inner method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toLocaleString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(String(arr)) — inner arg not a member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'String' },
            arguments: [{ type: 'Identifier', name: 'arr' }],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Array' } },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer object name is "array" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer object name is "ARRAY" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'ARRAY' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer property name is "of" instead of "from"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report with 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report with 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
          { type: 'Identifier', name: 'fn' },
          { type: 'Identifier', name: 'thisArg' },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner arg is not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'toString' },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee computed is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: true,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner property name is "tostring" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'tostring' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner property name is "ToString" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'ToString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Literal', value: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: null,
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })


    test('does not report when outer callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: null,
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toString() alone — not wrapped in Array.from', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayToStringArray.create(ctx1)
      const visitor2 = noUnnecessaryArrayToStringArray.create(ctx2)
      visitor1.CallExpression(makeArrayFromToString('arr'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression(makeArrayFromToString('arr'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.CallExpression(makeArrayFromToString('obj'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToStringArray.create(context)
      const visitor2 = noUnnecessaryArrayToStringArray.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToStringArray.meta
      const meta2 = noUnnecessaryArrayToStringArray.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      const node = {
        ...makeArrayFromToString(),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      const node = makeArrayFromToString()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToStringArray).toBeDefined()
      expect(typeof noUnnecessaryArrayToStringArray.create).toBe('function')
      expect(typeof noUnnecessaryArrayToStringArray.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToStringArray.create(context)
      // Invalid: Array.from(arr.toString()) - should report
      visitor.CallExpression(makeArrayFromToString('arr'))
      // Valid: Array.from(arr) - should not report
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [{ type: 'Identifier', name: 'arr' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      // Valid: arr.toString() alone - should not report
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      // Invalid: Array.from(obj.toString()) - should report
      visitor.CallExpression(makeArrayFromToString('obj'))
      // Valid: Array.isArray(arr.toString()) - should not report
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'isArray' },
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'toString' },
            },
            arguments: [],
          },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(2)
    })
  })
})
