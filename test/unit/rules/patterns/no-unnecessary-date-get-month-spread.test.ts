

import { noUnnecessaryDateGetMonthSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-month-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetMonthCall(arg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'date',
        range: [column, column + 4],
      },
      property: {
        type: 'Identifier',
        name: 'getMonth',
      },
      range: [column, column + 13],
    },
    arguments: [arg],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
    range: [column, column + 20],
  }
}

function createSpreadElement(name: string): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'Identifier',
      name,
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
  }
}

function createMemberExpr(objectName: string, propertyName: string): unknown {
  return {
    type: 'MemberExpression',
    computed: false,
    object: {
      type: 'Identifier',
      name: objectName,
    },
    property: {
      type: 'Identifier',
      name: propertyName,
    },
  }
}

function createCallWithCallee(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
    range: [0, 20],
  }
}

describe('no-unnecessary-date-get-month-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.schema).toEqual([])
    })

    test('should mention getMonth in description', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.docs?.description.toLowerCase()).toContain('getmonth')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('structure', () => {
    test('should have meta property', () => {
      expect(noUnnecessaryDateGetMonthSpreadRule).toHaveProperty('meta')
    })

    test('should have create property that is a function', () => {
      expect(typeof noUnnecessaryDateGetMonthSpreadRule.create).toBe('function')
    })
  })

  describe('detecting date.getMonth(...spread) patterns', () => {
    test('should report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('items')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.getMonth(...items)')
      expect(reports[0].message).toContain('Consider calling date.getMonth() directly')
    })

    test('should report date.getMonth(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...args);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('args')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...params);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('params')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...rest);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('rest')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...data);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('data')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...arr);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('arr')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...values);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('values')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...list);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('list')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...extras)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...extras);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('extras')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...options);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('options')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...spread);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('spread')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...input);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('input')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...payload);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('payload')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...parts);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('parts')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...stuff);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('stuff')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...x);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('x')))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of member expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...obj.items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const spreadArg = {
        type: 'SpreadElement',
        argument: createMemberExpr('obj', 'items'),
      }
      visitor.CallExpression(makeDateGetMonthCall(spreadArg))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of array literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...[1]);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const spreadArg = {
        type: 'SpreadElement',
        argument: {
          type: 'ArrayExpression',
          elements: [createLiteral(1)],
        },
      }
      visitor.CallExpression(makeDateGetMonthCall(spreadArg))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of call expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...getItems());' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const spreadArg = {
        type: 'SpreadElement',
        argument: createCallWithCallee(createIdentifier('getItems'), []),
      }
      visitor.CallExpression(makeDateGetMonthCall(spreadArg))

      expect(reports.length).toBe(1)
    })

    test('should include correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('items')))

      expect(reports[0].message).toBe(
        'date.getMonth(...items) with a single spread is unusual. Consider calling date.getMonth() directly.',
      )
    })

    test('should report date.getMonth(...n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...n);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('n')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...val)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...val);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('val')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...result);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('result')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...extraArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...extraArgs);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('extraArgs')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...theRest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...theRest);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('theRest')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...remaining);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('remaining')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...all);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('all')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMonth(...everything)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...everything);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('everything')))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-matching patterns', () => {
    test('should not report date.getMonth() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth();' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(undefined))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth() with empty arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth();' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        range: [0, 16],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(0) with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(0);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(n) with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(n);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createIdentifier('n')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getFullYear' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getDate' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getMonth(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myDate' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getMonth(...items) with obj name', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report d.getMonth(...items) with d name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'd' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items, ...more) with multiple spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items, ...more);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items'), createSpreadElement('more')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items, extra) with spread and extra arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items, extra);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items'), createIdentifier('extra')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(1, ...items) with literal and spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(1, ...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createLiteral(1), createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getMonth(...items) without member expression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getMonth' },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getTime' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getDay' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getHours' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMinutes' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getSeconds' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMilliseconds' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.setMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'setMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toString' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toISOString' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth with computed member access', () => {
      const { context, reports } = createMockRuleContext({ source: "date['getMonth'](...items);" })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(undefined);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createLiteral(undefined)))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(null);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createLiteral(null)))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.push(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth with non-identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Date().getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Date' }, arguments: [] },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth with non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date[fn](...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'fn' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth with no args array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth();' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(item) with identifier arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(item);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createIdentifier('item')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(index)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(index);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createIdentifier('index')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items, 1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items, 1);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items'), createLiteral(1)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object name is Date', () => {
      const { context, reports } = createMockRuleContext({ source: 'Date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object name is datetime', () => {
      const { context, reports } = createMockRuleContext({ source: 'datetime.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'datetime' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is month', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.month(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'month' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arr.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'valueOf' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.max(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'console.log(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(item) with single non-spread arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(item);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createIdentifier('item')))

      expect(reports.length).toBe(0)
    })

  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-CallExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        arguments: [createSpreadElement('items')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple visitor invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('items')))
      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('args')))
      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('rest')))

      expect(reports.length).toBe(3)
    })

    test('should report correct location info', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMonthCall(createSpreadElement('items'), 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMonthSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should create new visitor per create call', () => {
      const { context } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor1 = noUnnecessaryDateGetMonthSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateGetMonthSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })
})
