import { noUnnecessaryDateGetDaySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-day-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetDayCall(args: unknown[], line = 1, column = 0): unknown {
  const callEnd = column + 'date.getDay'.length + args.length * 3 + 2

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'date',
      },
      property: {
        type: 'Identifier',
        name: 'getDay',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: callEnd },
    },
    range: [column, callEnd],
  }
}

function makeSpreadArg(argName = 'items'): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'Identifier',
      name: argName,
    },
  }
}

function makeIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function makeLiteral(value: unknown, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? String(value),
  }
}

function makeMemberCall(objectName: string, methodName: string, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: methodName,
      },
    },
    arguments: args,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-unnecessary-date-get-day-spread rule', () => {
  // ============================================================
  // META TESTS (8)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.schema).toBeDefined()
    })

    test('should mention getDay in description', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.docs?.description.toLowerCase()).toContain('getday')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have documentation URL', () => {
      expect(noUnnecessaryDateGetDaySpreadRule.meta.docs?.url).toContain(
        'no-unnecessary-date-get-day-spread',
      )
    })
  })

  // ============================================================
  // STRUCTURE / CREATE TESTS (2)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor1 = noUnnecessaryDateGetDaySpreadRule.create(context)
      const visitor2 = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // POSITIVE DETECTION TESTS (28)
  // ============================================================
  describe('detecting date.getDay with single spread argument', () => {
    test('should report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('items')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.getDay')
      expect(reports[0].message).toContain('spread')
    })

    test('should report date.getDay(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('args')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('params')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('rest')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('options')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('extra')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('values')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('data')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('list')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('spread')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...elems)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('elems')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('parts')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('fields')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('input')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('collection')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('elements')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...arguments)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('arguments')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...parameters)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('parameters')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('restArgs')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('theArgs')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('more')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('stuff')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('x')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDay(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('all')]))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('items')]))

      expect(reports[0].message).toBe(
        'date.getDay(...items) with a single spread is unusual. Consider calling date.getDay() directly.',
      )
    })

    test('should report with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('items')], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('items')]))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report multiple calls independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('a')]))
      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('b')]))
      visitor.CallExpression(makeDateGetDayCall([makeSpreadArg('c')]))

      expect(reports.length).toBe(3)
    })
  })

  // ============================================================
  // NEGATIVE TESTS (40)
  // ============================================================
  describe('not reporting date.getDay without spread', () => {
    test('should not report date.getDay()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(arg)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeIdentifier('arg')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(null, 'null')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeIdentifier('a'), makeIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(1), makeLiteral(2)]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting wrong object name', () => {
    test('should not report d.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('d', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('dt', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('myDate', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('today', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('time', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('obj', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report x.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('x', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report val.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'val.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('val', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report result.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'result.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('result', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report instance.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'instance.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('instance', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting wrong method name', () => {
    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getFullYear', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getMonth', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getHours', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getMinutes', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getSeconds', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getTime', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'toString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'toISOString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'valueOf', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-spread or multiple arguments', () => {
    test('should not report date.getDay(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(
        makeDateGetDayCall([makeSpreadArg('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(
        makeDateGetDayCall([makeIdentifier('extra'), makeSpreadArg('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...a, ...b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(
        makeDateGetDayCall([makeSpreadArg('a'), makeSpreadArg('b')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(
        makeDateGetDayCall([makeSpreadArg('items'), makeSpreadArg('more')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(arg, ...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(
        makeDateGetDayCall([makeIdentifier('arg'), makeSpreadArg('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(0, 1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(0), makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay("monday")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral('monday')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      visitor.CallExpression(makeDateGetDayCall([makeLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const objArg = {
        type: 'ObjectExpression',
        properties: [],
      }
      visitor.CallExpression(makeDateGetDayCall([objArg]))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASE TESTS (17)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = { type: 'ExpressionStatement' }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'getDay',
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'Identifier',
            name: 'date',
          },
          property: {
            type: 'Literal',
            value: 'getDay',
          },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'date' },
          },
          property: {
            type: 'Identifier',
            name: 'getDay',
          },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'Identifier',
            name: 'date',
          },
          property: {
            type: 'Literal',
            value: 'getDay',
          },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getDay' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getDay' },
        },
        arguments: [makeSpreadArg('items')],
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee with null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'getDay' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})
