import { describe, test, expect, vi } from 'vitest'
import { preferNumberIsfiniteRule } from '../../../../src/rules/patterns/prefer-number-isfinite.js'
import defaultExport from '../../../../src/rules/patterns/prefer-number-isfinite.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push(descriptor)
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'isFinite(x)',
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

function makeIsFiniteCall(
  arg: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'isFinite' },
    arguments: [arg],
    loc: { start: { line, column }, end: { line, column: column + 12 } },
  }
}

function makeGlobalThisIsFiniteCall(
  arg: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'globalThis' },
      property: { type: 'Identifier', name: 'isFinite' },
      computed: false,
    },
    arguments: [arg],
    loc: { start: { line, column }, end: { line, column: column + 22 } },
  }
}

describe('prefer-number-isfinite rule', () => {
  describe('meta', () => {
    test('should have correct category patterns', () => {
      expect(preferNumberIsfiniteRule.meta.docs?.category).toBe('patterns')
    })

    test('should have correct severity warn', () => {
      expect(preferNumberIsfiniteRule.meta.severity).toBe('warn')
    })

    test('should have correct type suggestion', () => {
      expect(preferNumberIsfiniteRule.meta.type).toBe('suggestion')
    })

    test('should have description mentioning Number.isFinite', () => {
      expect(preferNumberIsfiniteRule.meta.docs?.description).toContain('Number.isFinite')
    })

    test('should have description mentioning isFinite', () => {
      expect(preferNumberIsfiniteRule.meta.docs?.description).toContain('isFinite')
    })

    test('should have docs URL', () => {
      expect(preferNumberIsfiniteRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-number-isfinite',
      )
    })

    test('should have empty schema array', () => {
      const schema = preferNumberIsfiniteRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema).toHaveLength(0)
    })

    test('should not be recommended', () => {
      expect(preferNumberIsfiniteRule.meta.docs?.recommended).toBe(false)
    })
  })

  describe('structure', () => {
    test('create returns visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(defaultExport).toBe(preferNumberIsfiniteRule)
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })
  })

  describe('positive cases - reports global isFinite calls', () => {
    test('reports isFinite(42) with number literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Literal', value: 42 }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite(x) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'x' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite(1 + 2) with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        }),
      )
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite("hello") with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Literal', value: 'hello' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite(getValue()) with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      const callArg = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }
      visitor.CallExpression(makeIsFiniteCall(callArg))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite(obj.prop) with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      const memberArg = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.CallExpression(makeIsFiniteCall(memberArg))
      expect(reports).toHaveLength(1)
    })

    test('report message mentions Number.isFinite for global isFinite', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('report message mentions global isFinite()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports[0].message).toContain('global isFinite()')
    })

    test('report message mentions non-numeric values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports[0].message).toContain('non-numeric')
    })

    test('report message mentions coerces to number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports[0].message).toContain('coerces to number')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('multiple isFinite calls in sequence each report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'a' }, 1, 0))
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'b' }, 2, 0))
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'c' }, 3, 0))
      expect(reports).toHaveLength(3)
    })

    test('report includes node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      const node = makeIsFiniteCall()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports isFinite with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }),
      )
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({
          type: 'UnaryExpression',
          operator: '-',
          argument: { type: 'Literal', value: 1 },
        }),
      )
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with array literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with object literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        }),
      )
      expect(reports).toHaveLength(1)
    })

    test('location has correct specific line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'x' }, 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports isFinite with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports).toHaveLength(1)
    })
  })

  describe('positive cases - reports globalThis.isFinite calls', () => {
    test('reports globalThis.isFinite(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall({ type: 'Literal', value: 42 }))
      expect(reports).toHaveLength(1)
    })

    test('reports globalThis.isFinite(x) with identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall({ type: 'Identifier', name: 'x' }))
      expect(reports).toHaveLength(1)
    })

    test('reports globalThis.isFinite(value) with different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall({ type: 'Identifier', name: 'value' }))
      expect(reports).toHaveLength(1)
    })

    test('reports globalThis.isFinite(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall({ type: 'Identifier', name: 'NaN' }))
      expect(reports).toHaveLength(1)
    })

    test('reports globalThis.isFinite(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeGlobalThisIsFiniteCall({ type: 'Identifier', name: 'Infinity' }),
      )
      expect(reports).toHaveLength(1)
    })

    test('globalThis.isFinite message mentions Number.isFinite', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall())
      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('globalThis.isFinite message mentions globalThis.isFinite()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall())
      expect(reports[0].message).toContain('globalThis.isFinite()')
    })

    test('globalThis.isFinite message mentions non-numeric values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall())
      expect(reports[0].message).toContain('non-numeric')
    })

    test('globalThis.isFinite message mentions coerces to number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall())
      expect(reports[0].message).toContain('coerces to number')
    })

    test('globalThis.isFinite report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeGlobalThisIsFiniteCall())
      expect(reports[0].loc).toBeDefined()
    })

    test('reports globalThis.isFinite with CallExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      const callArg = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }
      visitor.CallExpression(makeGlobalThisIsFiniteCall(callArg))
      expect(reports).toHaveLength(1)
    })

    test('reports globalThis.isFinite with MemberExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      const memberArg = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.CallExpression(makeGlobalThisIsFiniteCall(memberArg))
      expect(reports).toHaveLength(1)
    })
  })

  describe('negative cases - does NOT report', () => {
    test('does NOT report Number.isFinite(42) - correct form', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number.isFinite(x) - correct form with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number.isFinite(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number.isFinite(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 23 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report foo.isFinite(x) - not globalThis', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report window.isFinite(x) - not globalThis', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report globalThis.isNaN(x) - different method', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'isNaN' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isNaN(x) - different global function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number.isNaN(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
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

    test('does NOT report parseInt(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report parseFloat(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report obj["isFinite"](x) - computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'isFinite' },
          computed: true,
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report foo() - unrelated function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isFinite used as identifier not a call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'isFinite',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report globalThis.isFinite - member access not call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'globalThis' },
        property: { type: 'Identifier', name: 'isFinite' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isFinite.call(null, x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'isFinite' },
          property: { type: 'Identifier', name: 'call' },
        },
        arguments: [
          { type: 'Literal', value: null },
          { type: 'Identifier', name: 'x' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('handles null node gracefully without throwing', () => {
      const { context } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('handles undefined node gracefully without throwing', () => {
      const { context } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('does NOT report empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({})
      expect(reports).toHaveLength(0)
    })

    test('does NOT report non-object string node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression('not an object')
      expect(reports).toHaveLength(0)
    })

    test('does NOT report non-object number node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(42)
      expect(reports).toHaveLength(0)
    })

    test('does NOT report NewExpression isFinite', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report ArrowFunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          body: { type: 'Literal', value: 1 },
        },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report IfStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'condition' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
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

    test('does NOT report Boolean(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 11 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report String(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report Number(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      })
      expect(reports).toHaveLength(0)
    })

    test('isFinite with no arguments still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('isFinite with multiple arguments still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('globalThis.isFinite with no arguments still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'isFinite' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('separate create() calls produce independent visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferNumberIsfiniteRule.create(ctx1)
      const visitor2 = preferNumberIsfiniteRule.create(ctx2)
      visitor1.CallExpression(makeIsFiniteCall())
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(rep1).toHaveLength(1)
      expect(rep2).toHaveLength(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'a' }, 1, 0))
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'b' }, 2, 0))
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'c' }, 3, 0))
      expect(reports).toHaveLength(3)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      })
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('CallExpression with null callee does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      expect(() =>
        visitor.CallExpression({
          type: 'CallExpression',
          callee: null,
          arguments: [{ type: 'Identifier', name: 'x' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        }),
      ).not.toThrow()
      expect(reports).toHaveLength(0)
    })

    test('CallExpression with undefined callee does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      expect(() =>
        visitor.CallExpression({
          type: 'CallExpression',
          callee: undefined,
          arguments: [{ type: 'Identifier', name: 'x' }],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        }),
      ).not.toThrow()
      expect(reports).toHaveLength(0)
    })

    test('reports isFinite in unary expression: !isFinite(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite in assignment: const result = isFinite(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Literal', value: 42 }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite in if condition: if (isFinite(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'x' }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite in return: return isFinite(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall())
      expect(reports).toHaveLength(1)
    })

    test('node with extra properties still reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
        range: [0, 12],
        parent: { type: 'ExpressionStatement' },
        extra: { parenthesized: false },
      })
      expect(reports).toHaveLength(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferNumberIsfiniteRule.create(context)
      const visitor2 = preferNumberIsfiniteRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed: isFinite(x) reports and foo() does not in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with assignment expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 1 },
        }),
      )
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Literal', value: true }))
      expect(reports).toHaveLength(1)
    })

    test('reports isFinite with regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(
        makeIsFiniteCall({ type: 'Literal', regex: { pattern: 'abc', flags: '' } }),
      )
      expect(reports).toHaveLength(1)
    })

    test('schema is an array type', () => {
      expect(Array.isArray(preferNumberIsfiniteRule.meta.schema)).toBe(true)
    })

    test('docs URL contains prefer-number-isfinite', () => {
      expect(preferNumberIsfiniteRule.meta.docs?.url).toContain('prefer-number-isfinite')
    })

    test('default export has same meta properties as named export', () => {
      expect(defaultExport.meta.type).toBe(preferNumberIsfiniteRule.meta.type)
      expect(defaultExport.meta.severity).toBe(preferNumberIsfiniteRule.meta.severity)
      expect(defaultExport.meta.docs?.category).toBe(preferNumberIsfiniteRule.meta.docs?.category)
    })

    test('does NOT report isFinite.apply(null, [x])', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'isFinite' },
          property: { type: 'Identifier', name: 'apply' },
        },
        arguments: [
          { type: 'Literal', value: null },
          { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'x' }] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 24 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does NOT report isFinite.bind(obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'isFinite' },
          property: { type: 'Identifier', name: 'bind' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports isFinite with undefined keyword argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNumberIsfiniteRule.create(context)
      visitor.CallExpression(makeIsFiniteCall({ type: 'Identifier', name: 'undefined' }))
      expect(reports).toHaveLength(1)
    })

  })
})
