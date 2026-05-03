import { describe, expect, test } from 'vitest'

import {
  createMockRuleContext,
  createSimpleCallExpression,
  createSimpleIdentifier,
  createSimpleMemberExpression,
  type ReportDescriptor,
} from '../../../helpers/ast-helpers.js'

import {
  noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule,
  default as defaultExport,
} from '../../../../src/rules/patterns/no-unnecessary-reflect-get-own-property-symbols-spread.js'

function createSpreadElement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'SpreadElement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createReflectCallWithSpread(spreadArgName = 'arr', line = 1, column = 0): unknown {
  const reflect = createSimpleIdentifier('Reflect', line, column)
  const method = createSimpleIdentifier('getOwnPropertySymbols', line, column + 8)
  const callee = createSimpleMemberExpression(reflect, method, false, line, column)
  const spreadArg = createSpreadElement(createSimpleIdentifier(spreadArgName), line, column + 35)
  return createSimpleCallExpression(callee, [spreadArg], line, column)
}

describe('no-unnecessary-reflect-get-own-property-symbols-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.severity).toBe('warn')
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a truthy description', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should mention Reflect.getOwnPropertySymbols in description', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.docs?.description).toContain(
        'Reflect.getOwnPropertySymbols',
      )
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-get-own-property-symbols-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.meta.schema).toEqual([])
    })
  })

  describe('structure', () => {
    test('should return visitor with CallExpression from create', () => {
      const { context } = createMockRuleContext({ source: 'Reflect.getOwnPropertySymbols(...arr)' })
      const visitor = noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should have default export match named export', () => {
      expect(defaultExport).toBe(noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule)
    })
  })

  describe('positive cases - reports spread argument', () => {
    test('should report Reflect.getOwnPropertySymbols(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports.length).toBe(1)
    })

    test('should report Reflect.getOwnPropertySymbols(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...items)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('items'))
      expect(reports.length).toBe(1)
    })

    test('should report Reflect.getOwnPropertySymbols(...args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...args)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('args'))
      expect(reports.length).toBe(1)
    })

    test('should report Reflect.getOwnPropertySymbols(...data)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...data)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('data'))
      expect(reports.length).toBe(1)
    })

    test('should report Reflect.getOwnPropertySymbols(...objs)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...objs)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('objs'))
      expect(reports.length).toBe(1)
    })

    test('should report Reflect.getOwnPropertySymbols(...list)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...list)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('list'))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of member expression ...this.props', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...this.props)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const thisId = createSimpleIdentifier('this')
      const propsId = createSimpleIdentifier('props')
      const memberArg = createSimpleMemberExpression(thisId, propsId)
      const spread = createSpreadElement(memberArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report with spread of array literal ...[a, b]', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...[a, b])',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const arrayArg = {
        type: 'ArrayExpression',
        elements: [createSimpleIdentifier('a'), createSimpleIdentifier('b')],
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 40 } },
      }
      const spread = createSpreadElement(arrayArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report with spread of call expression ...fn()', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...fn())',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const callArg = createSimpleCallExpression(createSimpleIdentifier('fn'), [])
      const spread = createSpreadElement(callArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report with spread of conditional expression ...cond', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(x ? a : b))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const condArg = {
        type: 'ConditionalExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 45 } },
      }
      const spread = createSpreadElement(condArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report with spread of binary expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(a || b))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const binArg = {
        type: 'LogicalExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 42 } },
      }
      const spread = createSpreadElement(binArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports[0].message).toBe(
        'Reflect.getOwnPropertySymbols(...items) with spread is unusual. getOwnPropertySymbols() expects a single object argument.',
      )
    })

    test('should report with message containing spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports[0].message).toContain('spread')
    })

    test('should report with message containing getOwnPropertySymbols', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports[0].message).toContain('getOwnPropertySymbols')
    })

    test('should report with message mentioning single object argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports[0].message).toContain('single object argument')
    })

    test('should report with location info', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should report at correct line and column', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report with node reference in report', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const call = createReflectCallWithSpread('arr')
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report when spread argument is a literal', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...x)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const literalArg = { type: 'Literal', value: 'x', loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 38 } } }
      const spread = createSpreadElement(literalArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report when spread argument is an object expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...{})',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const objArg = {
        type: 'ObjectExpression',
        properties: [],
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 37 } },
      }
      const spread = createSpreadElement(objArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of template literal', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...`str`)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const tplArg = {
        type: 'TemplateLiteral',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 40 } },
      }
      const spread = createSpreadElement(tplArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of function expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(function() {}))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const fnArg = {
        type: 'FunctionExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 50 } },
      }
      const spread = createSpreadElement(fnArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of arrow function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(() => {}))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const arrowArg = {
        type: 'ArrowFunctionExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 45 } },
      }
      const spread = createSpreadElement(arrowArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of new expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(new Set()))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const newArg = {
        type: 'NewExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 45 } },
      }
      const spread = createSpreadElement(newArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of yield expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(yield x))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const yieldArg = {
        type: 'YieldExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 43 } },
      }
      const spread = createSpreadElement(yieldArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of await expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(await promise))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const awaitArg = {
        type: 'AwaitExpression',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 49 } },
      }
      const spread = createSpreadElement(awaitArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of chained member expression ...a.b.c', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...a.b.c)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const aId = createSimpleIdentifier('a')
      const bId = createSimpleIdentifier('b')
      const ab = createSimpleMemberExpression(aId, bId)
      const cId = createSimpleIdentifier('c')
      const abc = createSimpleMemberExpression(ab, cId)
      const spread = createSpreadElement(abc)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report spread of unary expression ...(-x)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...(-x))',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const unaryArg = {
        type: 'UnaryExpression',
        operator: '-',
        loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 38 } },
      }
      const spread = createSpreadElement(unaryArg)
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })
  })

  describe('negative cases - does not report', () => {
    test('should not report Object.getOwnPropertySymbols(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Object.getOwnPropertySymbols(...arr)',
      })
      const obj = createSimpleIdentifier('Object')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(obj, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.getOwnPropertySymbols(obj) without spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(obj)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const arg = createSimpleIdentifier('obj')
      const call = createSimpleCallExpression(callee, [arg])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.getOwnPropertyDescriptor(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertyDescriptor(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertyDescriptor')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.ownKeys(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.ownKeys(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('ownKeys')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.get(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.get(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('get')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.set(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.set(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('set')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.apply(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.apply(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('apply')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.construct(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.construct(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('construct')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.has(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.has(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('has')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.deleteProperty(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.deleteProperty(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('deleteProperty')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.getOwnPropertySymbols(...arr, extra) with multiple args', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr, extra)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const extra = createSimpleIdentifier('extra')
      const call = createSimpleCallExpression(callee, [spread, extra])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.getOwnPropertySymbols() with no args', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols()',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const call = createSimpleCallExpression(callee, [])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report null node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      expect(() =>
        noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(null),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report undefined node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      expect(() =>
        noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(undefined),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report empty object node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('should not report node missing callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression({ type: 'CallExpression', arguments: [createSpreadElement(createSimpleIdentifier('arr'))] })
      expect(reports.length).toBe(0)
    })

    test('should not report node missing object on callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = { type: 'MemberExpression', property: method, computed: false }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report node missing property on callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const callee = { type: 'MemberExpression', object: reflect, computed: false }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report computed member expression Reflect["getOwnPropertySymbols"](...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect["getOwnPropertySymbols"](...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method, true)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when object is not Identifier type', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const obj = { type: 'MemberExpression', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } }
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(obj, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when property is not Identifier type', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const prop = { type: 'Literal', value: 'getOwnPropertySymbols', loc: { start: { line: 1, column: 8 }, end: { line: 1, column: 33 } } }
      const callee = { type: 'MemberExpression', object: reflect, property: prop, computed: true, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 34 } } }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report string node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      expect(() =>
        noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression('string'),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report number node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      expect(() =>
        noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(42),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report boolean node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      expect(() =>
        noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(true),
      ).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report callee as Identifier (simple function call)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'getOwnPropertySymbols(...arr)',
      })
      const callee = createSimpleIdentifier('getOwnPropertySymbols')
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report callee as Super', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const callee = { type: 'Super' }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report callee as ThisExpression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const callee = { type: 'ThisExpression' }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee object name is not Reflect', () => {
      const { context, reports } = createMockRuleContext({
        source: 'MyReflect.getOwnPropertySymbols(...arr)',
      })
      const obj = createSimpleIdentifier('MyReflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(obj, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee property name is not getOwnPropertySymbols', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.keys(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('keys')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when argument is Identifier (not spread)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(obj)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const regularArg = createSimpleIdentifier('obj')
      const callWithRegArg = createSimpleCallExpression(callee, [regularArg])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(callWithRegArg)
      expect(reports.length).toBe(0)
    })

    test('should not report when argument is Literal (not spread)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(null)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const literalArg = { type: 'Literal', value: null, loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 39 } } }
      const call = createSimpleCallExpression(callee, [literalArg])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const callee = { type: 'ArrowFunctionExpression' }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const callee = { type: 'FunctionExpression' }
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(obj)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const objArg = { type: 'ObjectExpression', properties: [], loc: { start: { line: 1, column: 35 }, end: { line: 1, column: 37 } } }
      const call = createSimpleCallExpression(callee, [objArg])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report reflect (lowercase) object name', () => {
      const { context, reports } = createMockRuleContext({
        source: 'reflect.getOwnPropertySymbols(...arr)',
      })
      const obj = createSimpleIdentifier('reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(obj, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report REFLECT (uppercase) object name', () => {
      const { context, reports } = createMockRuleContext({
        source: 'REFLECT.getOwnPropertySymbols(...arr)',
      })
      const obj = createSimpleIdentifier('REFLECT')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(obj, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report getOwnPropertyNames method', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertyNames(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertyNames')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report getPrototypeOf method', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getPrototypeOf(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getPrototypeOf')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report defineProperty method', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperty(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('defineProperty')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report callee object with null name', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = { type: 'Identifier', name: null, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } } }
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should maintain independent state between calls', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(obj)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(ctx1)
        .CallExpression(createReflectCallWithSpread('arr'))
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const regularArg = createSimpleIdentifier('obj')
      const call = createSimpleCallExpression(callee, [regularArg])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(ctx2).CallExpression(call)
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should accumulate reports within same context', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const visitor = noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context)
      visitor.CallExpression(createReflectCallWithSpread('arr1'))
      visitor.CallExpression(createReflectCallWithSpread('arr2'))
      expect(reports.length).toBe(2)
    })

    test('should report correct loc from node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr', 3, 5))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = {
        type: 'CallExpression',
        callee,
        arguments: [spread],
      }
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should handle extra properties on node without issue', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = {
        type: 'CallExpression',
        callee,
        arguments: [spread],
        extra: 'data',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
        trailingComments: [],
      }
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should not report node with wrong type (not CallExpression)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression({ type: 'ExpressionStatement' })
      expect(reports.length).toBe(0)
    })

    test('should return new visitor each create call', () => {
      const { context } = createMockRuleContext({ source: 'test' })
      const v1 = noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context)
      const v2 = noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context)
      expect(v1).not.toBe(v2)
    })

    test('should handle arguments as empty array', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols()',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const call = createSimpleCallExpression(callee, [])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle three arguments with first being spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr, b, c)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const b = createSimpleIdentifier('b')
      const c = createSimpleIdentifier('c')
      const call = createSimpleCallExpression(callee, [spread, b, c])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle end location in report', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule
        .create(context)
        .CallExpression(createReflectCallWithSpread('arr'))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle node with null arguments array', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const call = {
        type: 'CallExpression',
        callee,
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle callee object with empty string name', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const obj = createSimpleIdentifier('')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(obj, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle callee property with empty string name', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = createSimpleCallExpression(callee, [spread])
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should produce consistent report for same input', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'test1' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'test2' })
      const call1 = createReflectCallWithSpread('arr')
      const call2 = createReflectCallWithSpread('arr')
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(ctx1).CallExpression(call1)
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(ctx2).CallExpression(call2)
      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should report with correct location at various positions', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect', 50, 100)
      const method = createSimpleIdentifier('getOwnPropertySymbols', 50, 108)
      const callee = createSimpleMemberExpression(reflect, method, false, 50, 100)
      const spread = createSpreadElement(createSimpleIdentifier('arr'), 50, 135)
      const call = createSimpleCallExpression(callee, [spread], 50, 100)
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should handle node with only start loc', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertySymbols(...arr)',
      })
      const reflect = createSimpleIdentifier('Reflect')
      const method = createSimpleIdentifier('getOwnPropertySymbols')
      const callee = createSimpleMemberExpression(reflect, method)
      const spread = createSpreadElement(createSimpleIdentifier('arr'))
      const call = {
        type: 'CallExpression',
        callee,
        arguments: [spread],
        loc: { start: { line: 7, column: 3 } },
      }
      noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should work with create called multiple times producing independent visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'a' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'b' })
      const visitor1 = noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryReflectGetOwnPropertySymbolsSpreadRule.create(ctx2)
      visitor1.CallExpression(createReflectCallWithSpread('arr'))
      visitor1.CallExpression(createReflectCallWithSpread('arr'))
      visitor2.CallExpression(createReflectCallWithSpread('arr'))
      expect(reports1.length).toBe(2)
      expect(reports2.length).toBe(1)
    })
  })
})
