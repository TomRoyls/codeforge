
import { noUnnecessaryDateToLocaleStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-locale-string-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDateToLocaleStringSpreadCall(
  spreadArg: unknown,
  line = 1,
  column = 0,
): unknown {
  const objectEnd = column + 'date'.length
  const callEnd = objectEnd + '.toLocaleString'.length + 10

  return {
    type: 'CallExpression',
    arguments: [spreadArg],
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'date',
        range: [column, objectEnd],
      },
      property: {
        type: 'Identifier',
        name: 'toLocaleString',
      },
      range: [column, objectEnd + '.toLocaleString'.length],
    },
    loc: {
      start: { line, column },
      end: { line, column: callEnd },
    },
    range: [column, callEnd],
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? String(value),
  }
}

function createNonToLocaleStringCall(objectName = 'date', methodName = 'toString'): unknown {
  return {
    type: 'CallExpression',
    arguments: [],
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
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createCallWithDifferentObject(objectName: string, spreadArg: unknown): unknown {
  return {
    type: 'CallExpression',
    arguments: [spreadArg],
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'toLocaleString',
      },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-unnecessary-date-to-locale-string-spread rule', () => {
  // ============================================================
  // META TESTS (8)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule.meta.schema).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateToLocaleStringSpreadRule).toHaveProperty('create')
    })

    test('should mention toLocaleString in description', () => {
      expect(
        noUnnecessaryDateToLocaleStringSpreadRule.meta.docs?.description.toLowerCase(),
      ).toContain('tolocalestring')
    })
  })

  // ============================================================
  // CREATE TESTS (2)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleString(...items);' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleString(...items);' })
      const visitor1 = noUnnecessaryDateToLocaleStringSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // DETECTION TESTS (28)
  // ============================================================
  describe('detecting date.toLocaleString(...spread)', () => {
    test('should report date.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/spread/i)
      expect(reports[0].message).toContain('toLocaleString')
    })

    test('should report date.toLocaleString(...args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...args);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('args'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...options)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...options);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('options'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...config)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...config);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('config'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...params)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...params);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('params'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...arr);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('arr'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...data)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...data);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('data'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...localeOptions)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...localeOptions);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('localeOptions'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...rest)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...rest);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('rest'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...parts)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...parts);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('parts'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...values)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...values);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('values'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...settings)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...settings);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('settings'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...array)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...array);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('array'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...list)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...list);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('list'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with spread of array literal', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...["en-US"]);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [createLiteral('en-US')],
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(arrayExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of member expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...obj.opts);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('opts'),
        computed: false,
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(memberExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of call expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...getOptions());',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('getOptions'),
        arguments: [],
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(callExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...(cond ? a : b));',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const condExpr = {
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createIdentifier('a'),
        alternate: createIdentifier('b'),
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(condExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of logical expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...(a || b));',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const logicalExpr = {
        type: 'LogicalExpression',
        left: createIdentifier('a'),
        operator: '||',
        right: createIdentifier('b'),
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(logicalExpr)))

      expect(reports.length).toBe(1)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items'))),
      )

      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should mention date in message', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items'))),
      )

      expect(reports[0].message).toContain('date')
    })

    test('should mention spread in message', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items'))),
      )

      expect(reports[0].message).toMatch(/spread/i)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items')), 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report at default location', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items'))),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report date.toLocaleString(...getLocale())', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...getLocale());',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('getLocale'),
        arguments: [],
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(callExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleString(...getLocaleOpts())', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...getLocaleOpts());',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('getLocaleOpts'),
        arguments: [],
      }
      visitor.CallExpression(createDateToLocaleStringSpreadCall(createSpreadElement(callExpr)))

      expect(reports.length).toBe(1)
    })

    test('should include node in report descriptor', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const node = createDateToLocaleStringSpreadCall(
        createSpreadElement(createIdentifier('items')),
      )
      visitor.CallExpression(node)

      expect(reports[0].node).toBeDefined()
    })

    test('should report at line 42 column 7', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('x')), 42, 7),
      )

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })
  })

  // ============================================================
  // NEGATIVE TESTS (40)
  // ============================================================
  describe('not reporting non-spread date.toLocaleString calls', () => {
    test('should not report date.toLocaleString()', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString();',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString("en-US")', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString("en-US");',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createLiteral('en-US')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString("en-US", opts)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString("en-US", opts);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createLiteral('en-US'), createIdentifier('opts')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(locale)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(locale);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createIdentifier('locale')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(locale, options)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(locale, options);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createIdentifier('locale'), createIdentifier('options')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(...items, extra) - 2 args', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items, extra);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [
          createSpreadElement(createIdentifier('items')),
          createIdentifier('extra'),
        ],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(...a, ...b) - 2 args', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...a, ...b);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [
          createSpreadElement(createIdentifier('a')),
          createSpreadElement(createIdentifier('b')),
        ],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting toLocaleString on different objects', () => {
    test('should not report myDate.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'myDate.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('myDate', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report now.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'now.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('now', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report today.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'today.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('today', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'timestamp.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject(
          'timestamp',
          createSpreadElement(createIdentifier('items')),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report d.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'd.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('d', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report obj.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'obj.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('obj', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report value.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'value.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('value', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report result.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'result.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithDifferentObject('result', createSpreadElement(createIdentifier('items'))),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-toLocaleString methods on date', () => {
    test('should not report date.toString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toISOString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toDateString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toTimeString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString()', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleDateString();',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toLocaleDateString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString()', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleTimeString();',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toLocaleTimeString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'getTime'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'getFullYear'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'valueOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'toJSON'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'getUTCMonth'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate();' })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(createNonToLocaleStringCall('date', 'setDate'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting other non-matching patterns', () => {
    test('should not report computed property date["toLocaleString"](...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date["toLocaleString"](...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report direct toLocaleString() call', () => {
      const { context, reports } = createMockRuleContext({
        source: 'toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { type: 'Identifier', name: 'toLocaleString' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(...items) when no arguments', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString();',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property is Literal not Identifier', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when object is Literal not Identifier', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(regularArg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString("en-US");',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createLiteral('en-US')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(identifierArg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(locale);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createIdentifier('locale')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(objectArg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString({});',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const objExpr = { type: 'ObjectExpression', properties: [] }
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [objExpr],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(nullArg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(null);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createLiteral(null, 'null')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(undefinedArg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(undefined);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createLiteral(undefined, 'undefined')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report number.toLocaleString(...items) (member expression object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'number.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: createIdentifier('a'), property: createIdentifier('b'), computed: false },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASE TESTS (17)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { type: 'Identifier', name: 'toLocaleString' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle callee without object', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle callee without property', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple consecutive calls correctly', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('a'))),
      )
      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('b'))),
      )
      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('c'))),
      )

      expect(reports.length).toBe(3)
    })

    test('should handle mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      // Valid: no spread
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createLiteral('en-US')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      // Invalid: has spread
      visitor.CallExpression(
        createDateToLocaleStringSpreadCall(createSpreadElement(createIdentifier('items'))),
      )

      // Valid: different method
      visitor.CallExpression(createNonToLocaleStringCall('date', 'toString'))

      expect(reports.length).toBe(1)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression({ foo: 'bar' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node input', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({
        source: 'date.toLocaleString(...items);',
      })
      const visitor = noUnnecessaryDateToLocaleStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'ExpressionStatement',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleString' },
        },
      })

      expect(reports.length).toBe(0)
    })
  })
})
