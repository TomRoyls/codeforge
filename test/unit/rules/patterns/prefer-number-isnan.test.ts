import { describe, test, expect, vi } from 'vitest'
import { preferNumberIsnanRule } from '../../../../src/rules/patterns/prefer-number-isnan.js'
import defaultExport from '../../../../src/rules/patterns/prefer-number-isnan.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push(descriptor)
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'isNaN(x)',
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

function makeIsNaNCall(
  arg: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'isNaN' },
    arguments: [arg],
    loc: { start: { line, column }, end: { line, column: column + 10 } },
  }
}

describe('prefer-number-isnan rule', () => {
  describe('meta', () => {
    test('should have correct category patterns', () => {
      expect(preferNumberIsnanRule.meta.docs?.category).toBe('patterns')
    })

    test('should have correct severity warn', () => {
      expect(preferNumberIsnanRule.meta.severity).toBe('warn')
    })

    test('should have correct type suggestion', () => {
      expect(preferNumberIsnanRule.meta.type).toBe('suggestion')
    })

    test('should have description mentioning Number.isNaN', () => {
      expect(preferNumberIsnanRule.meta.docs?.description).toContain('Number.isNaN')
    })

    test('should have description mentioning global isNaN', () => {
      expect(preferNumberIsnanRule.meta.docs?.description).toContain('isNaN')
    })

    test('should have docs URL', () => {
      expect(preferNumberIsnanRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-number-isnan',
      )
    })

    test('should have empty schema array', () => {
      const schema = preferNumberIsnanRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema).toHaveLength(0)
    })

    test('should not be recommended', () => {
      expect(preferNumberIsnanRule.meta.docs?.recommended).toBe(false)
    })
  })

  describe('structure', () => {
    test('create returns visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(defaultExport).toBe(preferNumberIsnanRule)
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })
  })

  describe('positive cases - reports isNaN calls', () => {
    test('reports isNaN(x) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'x' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN(value) with identifier arg named value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'value' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN(42) with number literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Literal', value: 42 }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN("hello") with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Literal', value: 'hello' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN(result) with variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'result' }))
      expect(reports).toHaveLength(1)
    })

    test('report message mentions Number.isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall())
      expect(reports[0].message).toContain('Number.isNaN')
    })

    test('report message mentions global isNaN()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall())
      expect(reports[0].message).toContain('global isNaN()')
    })

    test('report message mentions coerces non-numeric values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall())
      expect(reports[0].message).toContain('coerces non-numeric')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('multiple isNaN calls in sequence each report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'a' }, 1, 0))
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'b' }, 2, 0))
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'c' }, 3, 0))
      expect(reports).toHaveLength(3)
    })

    test('reports isNaN(getValue()) with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      const callArg = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }
      visitor.CallExpression(makeIsNaNCall(callArg))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN(obj.prop) with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      const memberArg = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.CallExpression(makeIsNaNCall(memberArg))
      expect(reports).toHaveLength(1)
    })

    test('location has correct specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'x' }, 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports isNaN with object literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN with array literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } }))
      expect(reports).toHaveLength(1)
    })

    test('report includes node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      const node = makeIsNaNCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports isNaN inside another call someFunc(isNaN(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall())
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports).toHaveLength(1)
    })

    test('visitor accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'a' }, 1, 0))
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'b' }, 2, 0))
      expect(reports).toHaveLength(2)
    })

    test('reports isNaN with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports).toHaveLength(1)
    })
  })

  describe('negative cases - does NOT report', () => {
    test('does NOT report Number.isNaN(x) - MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number.isNaN(42) - already correct', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report foo.isNaN(x) - not global isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNaN() - no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNaN(x, y) - 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNaN(x, y, z) - 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
          { type: 'Identifier', name: 'z' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report IfStatement node - non-CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'condition' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report regular function call foo()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isFinite(x) - different function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report parseInt(x) - different function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('handles null node gracefully without throwing', () => {
      const { context } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('handles undefined node gracefully without throwing', () => {
      const { context } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('does NOT report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNaN.call(null, x) - indirect call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'isNaN' },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [
          { type: 'Literal', value: null },
          { type: 'Identifier', name: 'x' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({})
      expect(reports).toHaveLength(0)
    })

    test('does NOT report non-object string node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression('not an object')
      expect(reports).toHaveLength(0)
    })

    test('does NOT report non-object number node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(42)
      expect(reports).toHaveLength(0)
    })

    test('does NOT report IsNaN(x) - different case uppercase I', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'IsNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNan(x) - different case lowercase n', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNan' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report when callee is ArrowFunction', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'ArrowFunctionExpression', body: { type: 'Literal', value: 1 } },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report console.log() - completely unrelated', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNaN.apply(null, [x]) - indirect call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'isNaN' },
          property: { type: 'Identifier', name: 'apply' },
        },
        arguments: [
          { type: 'Literal', value: null },
          { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'x' }] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report parseFloat(x) - different function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report when callee has no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report when callee is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report when callee name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report NaN as standalone identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'NaN',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report NewExpression isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Boolean(x) - unrelated function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      })
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('call with 0 args does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('call with 2 args does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('chained isNaN(getValue()) reports with 1 arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      const innerCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }
      visitor.CallExpression(makeIsNaNCall(innerCall))
      expect(reports).toHaveLength(1)
    })

    test('nested someFunc(isNaN(x)) reports inner isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      const isNaNNode = makeIsNaNCall({ type: 'Identifier', name: 'x' })
      visitor.CallExpression(isNaNNode)
      expect(reports).toHaveLength(1)
    })

    test('separate create() calls produce independent visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferNumberIsnanRule.create(ctx1)
      const visitor2 = preferNumberIsnanRule.create(ctx2)
      visitor1.CallExpression(makeIsNaNCall())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(rep1).toHaveLength(1)
      expect(rep2).toHaveLength(0)
    })

    test('visitor accumulates reports across multiple CallExpression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'a' }, 1, 0))
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'b' }, 2, 0))
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'c' }, 3, 0))
      expect(reports).toHaveLength(3)
    })

    test('report loc matches node loc exactly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'x' }, 7, 4))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      })
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('does NOT report ISNAN(x) all uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ISNAN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isnan(x) all lowercase', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isnan' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports isNaN with argument that is undefined keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'undefined' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN with argument that is null keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Literal', value: null }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }))
      expect(reports).toHaveLength(1)
    })

    test('mixed: isNaN(x) reports, isNaN(x,y) does not in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('node with extra properties still reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        parent: { type: 'ExpressionStatement' },
        extra: { parenthesized: false },
      })
      expect(reports).toHaveLength(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferNumberIsnanRule.create(context)
      const visitor2 = preferNumberIsnanRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('additional coverage', () => {
    test('schema is an array type', () => {
      expect(Array.isArray(preferNumberIsnanRule.meta.schema)).toBe(true)
    })

    test('docs URL contains prefer-number-isnan', () => {
      expect(preferNumberIsnanRule.meta.docs?.url).toContain('prefer-number-isnan')
    })

    test('description mentions reliable NaN checks', () => {
      expect(preferNumberIsnanRule.meta.docs?.description.toLowerCase()).toContain('reliable')
    })

    test('reports isNaN with negative number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 1 } }))
      expect(reports).toHaveLength(1)
    })

    test('reports isNaN with regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Literal', regex: { pattern: 'abc', flags: '' } }))
      expect(reports).toHaveLength(1)
    })

    test('minimal node with only type callee arguments reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 0 }],
      })
      expect(reports).toHaveLength(1)
    })

    test('does NOT report when arguments length is exactly 2', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('default export has same meta properties as named export', () => {
      expect(defaultExport.meta.type).toBe(preferNumberIsnanRule.meta.type)
      expect(defaultExport.meta.severity).toBe(preferNumberIsnanRule.meta.severity)
      expect(defaultExport.meta.docs?.category).toBe(preferNumberIsnanRule.meta.docs?.category)
    })

    test('does NOT report String(x) - unrelated function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number(x) - unrelated function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('report loc end property is preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Identifier', name: 'x' }, 3, 5))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('does NOT report isNaN.bind(obj) - not a direct call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'isNaN' },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports isNaN with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports).toHaveLength(1)
    })

    test('does NOT report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports isNaN with boolean literal argument true', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({ type: 'Literal', value: true }))
      expect(reports).toHaveLength(1)
    })

    test('meta is not deprecated', () => {
      expect(preferNumberIsnanRule.meta.deprecated).toBeFalsy()
    })

    test('reports isNaN with assignment expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsnanRule.create(context)
      visitor.CallExpression(makeIsNaNCall({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal', value: 1 },
      }))
      expect(reports).toHaveLength(1)
    })
  })
})
