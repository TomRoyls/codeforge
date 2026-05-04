import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryCustomEventSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-custom-event-spread.js'
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
    getSource: () => 'CustomEvent()',
  }
  return { context, reports }
}

function makeCall(callee_name: string, args: unknown[], startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: callee_name },
    arguments: args,
    loc: makeLoc(startLine, startCol, endLine, endCol),
  }
}

function makeSpreadArg(inner: unknown) {
  return { type: 'SpreadElement', argument: inner, loc: makeLoc(1, 0, 1, 10) }
}

describe('no-unnecessary-custom-event-spread', () => {

  describe('reports on CustomEvent with single spread argument', () => {
    test('should report CustomEvent(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('CustomEvent')
    })

    test('should report CustomEvent(...arr)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'arr' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
    })

    test('should report CustomEvent(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('does not report when there is no spread', () => {
    test('should not report CustomEvent(x)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [{ type: 'Identifier', name: 'x' }], 1, 0, 1, 10)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })

    test('should not report CustomEvent("hello")', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [{ type: 'Literal', value: 'hello' }], 1, 0, 1, 10)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })

    test('should not report CustomEvent()', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [], 1, 0, 1, 10)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does not report for wrong function name', () => {
    test('CustomEvent rule should ignore decodeURI(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('decodeURI', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore encodeURI(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('encodeURI', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore decodeURIComponent(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('decodeURIComponent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore encodeURIComponent(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('encodeURIComponent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore eval(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('eval', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore isFinite(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('isFinite', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore isNaN(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('isNaN', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore parseFloat(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('parseFloat', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore parseInt(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('parseInt', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore console(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('console', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore alert(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('alert', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore setTimeout(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('setTimeout', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore setInterval(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('setInterval', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore fetch(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('fetch', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore require(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('require', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore import(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('import', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore module(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('module', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore exports(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('exports', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore process(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('process', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Object(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Object', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Array(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Array', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore String(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('String', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Number(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Number', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Boolean(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Boolean', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Symbol(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Symbol', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Function(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Function', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Error(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Error', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Date(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Date', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore RegExp(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('RegExp', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
    test('CustomEvent rule should ignore Map(...items)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('Map', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does not report with multiple arguments', () => {
    test('should not report CustomEvent(...items, extra)', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'extra' }], 1, 0, 1, 30)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('should not report null node', () => {
      const { context, reports } = createMockContext()
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(null)
      expect(reports).toHaveLength(0)
    })

    test('should not report undefined node', () => {
      const { context, reports } = createMockContext()
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(undefined)
      expect(reports).toHaveLength(0)
    })

    test('should not report non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!({ type: 'Literal' })
      expect(reports).toHaveLength(0)
    })

    test('should not report MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'CustomEvent' }, computed: false },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      }
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('location and structure', () => {
    test('should report with correct location line 1', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 0, 1, 15)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(15)
    })
    test('should report with correct location line 2', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 2, 5, 2, 25)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(25)
    })
    test('should report with correct location line 10', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 0, 10, 20)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })
    test('should report with correct location line 100', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 100, 8, 100, 30)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(100)
      expect(reports[0].loc?.end.column).toBe(30)
    })
    test('should report with correct location line 1', () => {
      const { context, reports } = createMockContext()
      const node = makeCall('CustomEvent', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 1, 20, 3, 15)
      noUnnecessaryCustomEventSpreadRule.create(context).CallExpression!(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })
  })
})