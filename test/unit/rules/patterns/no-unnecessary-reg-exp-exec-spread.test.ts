

import { noUnnecessaryRegExpExecSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reg-exp-exec-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeRegExpExecCall(args: unknown[], overrides: Record<string, unknown> = {}): unknown {
  return {
    type: 'CallExpression',
    arguments: args,
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'regex',
      },
      property: {
        type: 'Identifier',
        name: 'exec',
      },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
    range: [0, 20],
    ...overrides,
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function makeIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function makeLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
  }
}

describe('no-unnecessary-reg-exp-exec-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.schema).toEqual([])
    })

    test('should mention regex.exec in description', () => {
      expect(noUnnecessaryRegExpExecSpreadRule.meta.docs?.description).toContain('regex.exec')
    })

    test('should have meta property', () => {
      expect(noUnnecessaryRegExpExecSpreadRule).toHaveProperty('meta')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('positive cases - should report', () => {
    test('should report regex.exec(...items) with spread identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))]))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for spread argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))]))

      expect(reports[0].message).toBe(
        'regex.exec(...items) with a single spread is unusual. Consider passing the string directly.',
      )
    })

    test('should report regex.exec(...arr) with different spread variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...arr)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...strings)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...strings)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('strings'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...data) with data variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...data)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...result) with result variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...result)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...matches) with matches variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...matches)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('matches'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...input) with input variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...input)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...values) with values variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...values)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...args) with args variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...args)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report when spread argument is a member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...obj.str)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const memberArg = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('str'),
        computed: false,
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(memberArg)]))

      expect(reports.length).toBe(1)
    })

    test('should report when spread argument is a call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...getStr())' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const callArg = {
        type: 'CallExpression',
        callee: makeIdentifier('getStr'),
        arguments: [],
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(callArg)]))

      expect(reports.length).toBe(1)
    })

    test('should report when spread argument is a computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...obj[0])' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const computedArg = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeLiteral(0),
        computed: true,
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(computedArg)]))

      expect(reports.length).toBe(1)
    })

    test('should report when spread argument is a conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...(a ? b : c))' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const condArg = {
        type: 'ConditionalExpression',
        test: makeIdentifier('a'),
        consequent: makeIdentifier('b'),
        alternate: makeIdentifier('c'),
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(condArg)]))

      expect(reports.length).toBe(1)
    })

    test('should report when node has additional range property', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], { range: [0, 25] }),
      )

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...[x]) with spread array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...[x])' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const arrayArg = {
        type: 'ArrayExpression',
        elements: [makeIdentifier('x')],
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(arrayArg)]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...new Set()) with spread new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...new Set())' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const newArg = {
        type: 'NewExpression',
        callee: makeIdentifier('Set'),
        arguments: [],
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(newArg)]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...template) with spread identifier named template', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...template)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('template'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...text) with spread identifier named text', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...text)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('text'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...str) with spread identifier named str', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...str)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('str'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...content) with spread identifier named content', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...content)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('content'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...buffer) with spread identifier named buffer', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...buffer)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...source) with spread identifier named source', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...source)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...target) with spread identifier named target', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...target)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('target'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...payload) with spread identifier named payload', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...payload)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('payload'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...chunk) with spread identifier named chunk', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...chunk)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('chunk'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.exec(...segment) with spread identifier named segment', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...segment)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('segment'))]))

      expect(reports.length).toBe(1)
    })

    test('should report with correct loc on node', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))]))

      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('negative cases - should not report', () => {
    test('should not report regex.exec(str) with direct string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(str)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeIdentifier('str')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec("hello") with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec("hello")' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec()' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(a, b) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(a, b)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeIdentifier('a'), makeIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(...a, ...b) with two spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...a, ...b)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([
          makeSpreadElement(makeIdentifier('a')),
          makeSpreadElement(makeIdentifier('b')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report pattern.exec(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'pattern.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'pattern' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'test' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.match(...items) with match method', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.match(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'match' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.replace(...items) with replace method', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.replace(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'replace' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.search(...items) with search method', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.search(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'search' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report exec(...items) with bare function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: {
          type: 'Identifier',
          name: 'exec',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex[exec](...items) with computed member', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex[exec](...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for non-CallExpression node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({ type: 'Identifier', name: 'x' })

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(member.property) with member expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(str.val)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const memberArg = {
        type: 'MemberExpression',
        object: makeIdentifier('str'),
        property: makeIdentifier('val'),
        computed: false,
      }
      visitor.CallExpression(makeRegExpExecCall([memberArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(42) with numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(42)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(null) with null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(null)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([{ type: 'Literal', value: null, raw: 'null' }]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(true) with boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(true)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(undefined) with undefined identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(undefined)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeIdentifier('undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report re.exec(...items) with re object name', () => {
      const { context, reports } = createMockRuleContext({ source: 're.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myRegex.exec(...items) with myRegex object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myRegex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myRegex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(...items, extra) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items, extra)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([makeSpreadElement(makeIdentifier('items')), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(extra, ...items) with two arguments reversed', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(extra, ...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([makeIdentifier('extra'), makeSpreadElement(makeIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for object with non-identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'getRegex().exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: makeIdentifier('getRegex'),
            arguments: [],
          },
          property: { type: 'Identifier', name: 'exec' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for non-identifier callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex["exec"](...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Literal', value: 'exec', raw: '"exec"' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(template) with template literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(`hello`)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const templateArg = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }
      visitor.CallExpression(makeRegExpExecCall([templateArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(obj[str]) with computed member arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(obj[str])' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const arg = {
        type: 'MemberExpression',
        object: makeIdentifier('obj'),
        property: makeIdentifier('str'),
        computed: true,
      }
      visitor.CallExpression(makeRegExpExecCall([arg]))

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: makeIdentifier('exec'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when node is null', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(null)

      expect(reports.length).toBe(0)
    })

    test('should not report when node is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(...items) with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...a, b, c)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([
          makeSpreadElement(makeIdentifier('a')),
          makeIdentifier('b'),
          makeIdentifier('c'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(callback) with function expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(() => {})' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const fnArg = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.CallExpression(makeRegExpExecCall([fnArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(arr[0]) with single non-spread arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(arr[0])' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const arg = {
        type: 'MemberExpression',
        object: makeIdentifier('arr'),
        property: makeLiteral(0),
        computed: true,
      }
      visitor.CallExpression(makeRegExpExecCall([arg]))

      expect(reports.length).toBe(0)
    })

    test('should not report when arguments array is missing', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report regex.compile(...items) with compile method', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.compile(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'compile' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(slice) with identifier named slice', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(slice)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeIdentifier('slice')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec([...items]) with array expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec([...items])' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const arrArg = {
        type: 'ArrayExpression',
        elements: [makeSpreadElement(makeIdentifier('items'))],
      }
      visitor.CallExpression(makeRegExpExecCall([arrArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.toString(...items) with toString method', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.toString(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'toString' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(new String(s)) with new expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(new String(s))' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const newArg = {
        type: 'NewExpression',
        callee: makeIdentifier('String'),
        arguments: [makeIdentifier('s')],
      }
      visitor.CallExpression(makeRegExpExecCall([newArg]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(String(s)) with call expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(String(s))' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const callArg = {
        type: 'CallExpression',
        callee: makeIdentifier('String'),
        arguments: [makeIdentifier('s')],
      }
      visitor.CallExpression(makeRegExpExecCall([callArg]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should not crash on empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should not crash on node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        callee: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash on node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: null,
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash on node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        callee: undefined,
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash on node with undefined arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: undefined,
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
          extra: true,
          nested: { deep: { value: 42 } },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('should report multiple times for multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(makeIdentifier('data'))]))

      expect(reports.length).toBe(2)
    })

    test('should not crash when callee object has no name property', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash when callee property has no name property', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash when argument has no type property', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpExecCall([{ name: 'items' }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle spread with nested spread element', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const nestedSpread = makeSpreadElement(makeSpreadElement(makeIdentifier('items')))
      visitor.CallExpression(makeRegExpExecCall([nestedSpread]))

      expect(reports.length).toBe(1)
    })

    test('should not crash when callee object is null', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'exec' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not crash when callee property is null', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: null,
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report regex.exec(...items) when object name is Regex (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const node = makeRegExpExecCall([makeSpreadElement(makeIdentifier('items'))], {
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should create new visitor for each create call', () => {
      const { context } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor1 = noUnnecessaryRegExpExecSpreadRule.create(context)
      const visitor2 = noUnnecessaryRegExpExecSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should report even when spread argument is an empty array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...[])' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      const emptyArr = {
        type: 'ArrayExpression',
        elements: [],
      }
      visitor.CallExpression(makeRegExpExecCall([makeSpreadElement(emptyArr)]))

      expect(reports.length).toBe(1)
    })

    test('should not report regex.exec(...items) when object has no type', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle arguments that are empty spread element gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(...items)' })
      const visitor = noUnnecessaryRegExpExecSpreadRule.create(context)

      visitor.CallExpression(makeRegExpExecCall([{ type: 'SpreadElement', argument: null }]))

      expect(reports.length).toBe(1)
    })
  })
})
