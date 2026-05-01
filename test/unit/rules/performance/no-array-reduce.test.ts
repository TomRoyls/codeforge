import { describe, expect, test, vi } from 'vitest'
import { noArrayReduceRule } from '../../../../src/rules/performance/no-array-reduce.js'
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
    getSource: () => 'arr.reduce(fn)',
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

function makeReduceCall(
  objName = 'arr',
  args: unknown[] = [{ type: 'Identifier', name: 'fn' }],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: objName },
      property: { type: 'Identifier', name: 'reduce' },
    },
    arguments: args,
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-array-reduce rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noArrayReduceRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noArrayReduceRule.meta.severity).toBe('warn')
    })

    test('should have correct category "performance"', () => {
      expect(noArrayReduceRule.meta.docs?.category).toBe('performance')
    })

    test('should not be recommended', () => {
      expect(noArrayReduceRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noArrayReduceRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning reduce', () => {
      const desc = noArrayReduceRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reduce/)
    })

    test('should have correct docs URL', () => {
      expect(noArrayReduceRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-array-reduce',
      )
    })

    test('should have empty schema', () => {
      expect(noArrayReduceRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noArrayReduceRule).toBeDefined()
      expect(noArrayReduceRule.meta).toBeDefined()
      expect(noArrayReduceRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports reduce calls', () => {
    test('reports arr.reduce(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports.length).toBe(1)
    })

    test('reports arr.reduce(fn, init)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(
        makeReduceCall('arr', [
          { type: 'Identifier', name: 'fn' },
          { type: 'Literal', value: 0 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('message mentions "reduce"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message.toLowerCase()).toContain('reduce')
    })

    test('message mentions "for...of"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message).toContain('for...of')
    })

    test('message mentions "map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message.toLowerCase()).toContain('map')
    })

    test('message mentions "filter"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message.toLowerCase()).toContain('filter')
    })

    test('message mentions "flatMap"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message.toLowerCase()).toContain('flatmap')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = makeReduceCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('arr1'))
      visitor.CallExpression(makeReduceCall('arr2'))
      visitor.CallExpression(makeReduceCall('arr3'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('arr', undefined, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('reports data.reduce(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('data'))
      expect(reports.length).toBe(1)
    })

    test('reports items.reduce(fn, 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(
        makeReduceCall('items', [
          { type: 'Identifier', name: 'fn' },
          { type: 'Literal', value: 0 },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports.length).toBe(1)
    })

    test('reports result.reduce(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('result'))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('a'))
      visitor.CallExpression(makeReduceCall('b'))
      visitor.CallExpression(makeReduceCall('c'))
      visitor.CallExpression(makeReduceCall('d'))
      expect(reports.length).toBe(4)
    })

    test('reports list.reduce(fn, {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(
        makeReduceCall('list', [
          { type: 'Identifier', name: 'fn' },
          { type: 'ObjectExpression', properties: [] },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports nums.reduce(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('nums'))
      expect(reports.length).toBe(1)
    })

    test('reports values.reduce(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('values'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report arr.map(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.filter(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.forEach(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.find(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.some(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.every(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.reduce() without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report computed member arr["reduce"](fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Identifier property (StringLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-MemberExpression callee (direct call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'reduce' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report standalone identifier reduce(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'reduce' },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.then(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'then' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles empty object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report arr.sort(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'sort' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.concat(other)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [{ type: 'Identifier', name: 'other' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.includes(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.indexOf(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.join(s)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'join' },
        },
        arguments: [{ type: 'Identifier', name: 's' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.pop()', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'pop' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.push(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reverse' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.splice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 17),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.catch(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'catch' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.finally(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'finally' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report NewExpression with reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 17),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arr.flatMap(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flatMap' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noArrayReduceRule.create(ctx1)
      const visitor2 = noArrayReduceRule.create(ctx2)
      visitor1.CallExpression(makeReduceCall('arr'))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('a'))
      visitor.CallExpression(makeReduceCall('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('arr1'))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr2' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(2, 0, 2, 12),
      })
      visitor.CallExpression(makeReduceCall('arr3'))
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: makeLoc(3, 0, 3, 10),
      })
      visitor.CallExpression(makeReduceCall('arr4'))
      expect(reports.length).toBe(3)
    })

    test('ThisExpression as object reports reduce call', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('nested MemberExpression object (a.b.reduce) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 17),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      visitor.CallExpression(makeReduceCall())
      visitor.CallExpression(makeReduceCall())
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noArrayReduceRule.create(context)
      const visitor2 = noArrayReduceRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('arr', undefined, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('CallExpression with null callee does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('MemberExpression with null object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('MemberExpression with null property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('undefined arguments property does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('arguments is empty array does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noArrayReduceRule.meta
      const meta2 = noArrayReduceRule.meta
      expect(meta1).toBe(meta2)
    })

    test('chained reduce calls produce reports for each', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const innerCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn1' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      const outerCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: innerCall,
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn2' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(innerCall)
      visitor.CallExpression(outerCall)
      expect(reports.length).toBe(2)
    })

    test('all violation messages are identical for the same rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall('a'))
      visitor.CallExpression(makeReduceCall('b'))
      visitor.CallExpression(makeReduceCall('c'))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('reduceRight is NOT detected as reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('message mentions "readability"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message.toLowerCase()).toContain('readability')
    })

    test('message mentions "maintainability"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message.toLowerCase()).toContain('maintainability')
    })

    test('message mentions "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(makeReduceCall())
      expect(reports[0].message).toContain('Unexpected')
    })

    test('reports arr.reduce with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(
        makeReduceCall('arr', [
          {
            type: 'ArrowFunctionExpression',
            params: [
              { type: 'Identifier', name: 'acc' },
              { type: 'Identifier', name: 'cur' },
            ],
            body: { type: 'Identifier', name: 'acc' },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports arr.reduce with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(
        makeReduceCall('arr', [
          {
            type: 'FunctionExpression',
            id: { type: 'Identifier', name: 'reducer' },
            params: [
              { type: 'Identifier', name: 'acc' },
              { type: 'Identifier', name: 'cur' },
            ],
            body: { type: 'BlockStatement', body: [] },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with multi-line location', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(3, 2, 7, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('reports with CallExpression object (getArr().reduce(fn))', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getArr' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression object ([1,2,3].reduce(fn))', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'ArrayExpression',
            elements: [
              { type: 'Literal', value: 1 },
              { type: 'Literal', value: 2 },
              { type: 'Literal', value: 3 },
            ],
          },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with ObjectExpression object as caller', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'ObjectExpression',
            properties: [],
          },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression chain (obj.arr.reduce(fn))', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'arr' },
          },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with arrow fn callback having 2 args (acc, cur)', () => {
      const { context, reports } = createMockContext()
      const visitor = noArrayReduceRule.create(context)
      visitor.CallExpression(
        makeReduceCall('arr', [
          {
            type: 'ArrowFunctionExpression',
            params: [
              { type: 'Identifier', name: 'acc' },
              { type: 'Identifier', name: 'cur' },
            ],
            body: {
              type: 'BinaryExpression',
              operator: '+',
              left: { type: 'Identifier', name: 'acc' },
              right: { type: 'Identifier', name: 'cur' },
            },
          },
          { type: 'Literal', value: 0 },
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })
})
