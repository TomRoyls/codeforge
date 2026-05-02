import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectKeysLength } from '../../../../src/rules/patterns/no-unnecessary-object-keys-length.js'
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

function makeObjectKeysLengthNode(
  argName = 'obj',
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
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [{ type: 'Identifier', name: argName }],
      },
      property: { type: 'Identifier', name: 'length' },
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeObjectKeysMethodNode(methodName: string, argName = 'obj'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [{ type: 'Identifier', name: argName }],
      },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [],
    loc: makeLoc(1, 0, 1, 20),
  }
}

function makeObjectMethodLengthNode(methodName: string, argName = 'obj'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: methodName },
        },
        arguments: [{ type: 'Identifier', name: argName }],
      },
      property: { type: 'Identifier', name: 'length' },
    },
    arguments: [],
    loc: makeLoc(1, 0, 1, 30),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-keys-length rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectKeysLength.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectKeysLength.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectKeysLength.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectKeysLength.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectKeysLength.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.keys', () => {
      const desc = noUnnecessaryObjectKeysLength.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object\.keys/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectKeysLength.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-keys-length.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectKeysLength.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectKeysLength).toBeDefined()
      expect(noUnnecessaryObjectKeysLength.meta).toBeDefined()
      expect(noUnnecessaryObjectKeysLength.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (26) =====

  describe('positive cases — reports Object.keys(x).length', () => {
    test('reports for Object.keys(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(data).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('data'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(state).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('state'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(props).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('props'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(config).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('config'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(item).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('item'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(options).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('options'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(result).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('result'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(map).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('map'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(record).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('record'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.keys(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      expect(reports[0].message).toMatch(/Object\.keys/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      expect(reports[0].message).toBe(
        'Object.keys(obj).length can be replaced with Object.getOwnPropertyNames(obj).length or a simple count approach if only checking emptiness.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      const node = makeObjectKeysLengthNode('obj')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj', 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      visitor.CallExpression(makeObjectKeysLengthNode('data'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      visitor.CallExpression(makeObjectKeysLengthNode('data'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.keys with single-letter argument name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('x'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys with long argument name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('veryLongVariableName123'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj', 10, 4, 10, 35))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports for Object.keys with argument named "this"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('_this'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(response).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('response'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(context).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('context'))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.keys(payload).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('payload'))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.keys(obj).map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('values'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('entries'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertyNames(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('getOwnPropertyNames'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.getOwnPropertySymbols(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('getOwnPropertySymbols'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('assign'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(obj).length', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('freeze'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.length — simple member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.length — not a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj) — no .length access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when Object.keys has zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when Object.keys has two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'extra' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee object is not "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'MyObj' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner method is not "keys"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectMethodLengthNode('values'))
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: true,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Literal', value: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer property name is "Length" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'Length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Object' } },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 40),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Literal', value: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when inner object is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'someVar' },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when outer property name is "size" instead of "length"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('size'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).find', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).some', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('some'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).every', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).includes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('includes'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).join', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('join'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(obj).sort', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysMethodNode('sort'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectKeysLength.create(ctx1)
      const visitor2 = noUnnecessaryObjectKeysLength.create(ctx2)
      visitor1.CallExpression(makeObjectKeysLengthNode('obj'))
      visitor2.CallExpression(makeObjectMethodLengthNode('values'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      visitor.CallExpression(makeObjectMethodLengthNode('values'))
      visitor.CallExpression(makeObjectKeysLengthNode('data'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      visitor.CallExpression(makeObjectMethodLengthNode('values'))
      visitor.CallExpression(makeObjectKeysMethodNode('map'))
      visitor.CallExpression(makeObjectKeysLengthNode('data'))
      visitor.CallExpression(makeObjectMethodLengthNode('entries'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectKeysLength.create(context)
      const visitor2 = noUnnecessaryObjectKeysLength.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectKeysLength.meta
      const meta2 = noUnnecessaryObjectKeysLength.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      const node = makeObjectKeysLengthNode('obj')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectKeysLength).toBeDefined()
      expect(typeof noUnnecessaryObjectKeysLength.create).toBe('function')
      expect(typeof noUnnecessaryObjectKeysLength.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: { type: 'Identifier', name: 'Object' },
              property: { type: 'Identifier', name: 'keys' },
            },
            arguments: [{ type: 'Identifier', name: 'obj' }],
          },
          property: { type: 'Identifier', name: 'length' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj', 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectKeysLength.create(context)
      visitor.CallExpression(makeObjectKeysLengthNode('obj'))
      visitor.CallExpression(makeObjectKeysLengthNode('data'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})
