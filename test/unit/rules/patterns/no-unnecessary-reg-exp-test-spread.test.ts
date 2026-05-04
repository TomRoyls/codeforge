import { describe, test, expect } from 'vitest'
import { noUnnecessaryRegExpTestSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reg-exp-test-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeRegExpTestCall(args: unknown[], line = 1, column = 0): unknown {
  const callEnd = column + 'regex.test'.length + 5 + 5
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
        name: 'test',
      },
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

describe('no-unnecessary-reg-exp-test-spread rule', () => {
  // ============================================================
  // META TESTS (8)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.schema).toBeDefined()
    })

    test('should mention regex in description', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.docs?.description.toLowerCase()).toContain('regex')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have documentation URL', () => {
      expect(noUnnecessaryRegExpTestSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  // ============================================================
  // STRUCTURE / CREATE TESTS (2)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor1 = noUnnecessaryRegExpTestSpreadRule.create(context)
      const visitor2 = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // POSITIVE / DETECTION TESTS (28)
  // ============================================================
  describe('detecting regex.test(...items) with spread', () => {
    test('should report regex.test(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('regex.test(...items)')
      expect(reports[0].message).toContain('single spread')
      expect(reports[0].message).toContain('Consider passing the string directly')
    })

    test('should report regex.test(...str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('str'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...text)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...text);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('text'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...value);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('value'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...result);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...output);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...data);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...input);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...arr);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...list);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...names)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...names);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('names'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...args);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...strings)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...strings);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('strings'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...values);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...parts);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('parts'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...elements);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...chunks);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...segments)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...segments);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('segments'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...pieces)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...pieces);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('pieces'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...match)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...match);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('match'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...content)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...content);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('content'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...payload);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('payload'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...response)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...response);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('response'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...body)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...body);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('body'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...line)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...line);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('line'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...entry)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...entry);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('entry'))]))

      expect(reports.length).toBe(1)
    })

    test('should report regex.test(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...source);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...fn());' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const fnCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(fnCall)]))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NEGATIVE / NOT REPORTING TESTS (40)
  // ============================================================
  describe('not reporting valid regex.test usage', () => {
    test('should not report regex.test(str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('str')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test("hello");' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(text)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(text);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('text')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(value);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(input);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('input')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(result);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('result')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(output);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('output')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(data);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('data')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(content)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(content);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('content')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(source);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('source')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(line)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(line);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('line')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(body)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(body);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('body')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(payload);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('payload')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(response)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(response);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('response')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(buffer);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('buffer')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(match)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(match);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('match')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(entry)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(entry);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('entry')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(arr);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('arr')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(list);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('list')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(names)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(names);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('names')]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(str, 0);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createIdentifier('str'), createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test with zero arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test();' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(a, b, c);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpTestCall([createIdentifier('a'), createIdentifier('b'), createIdentifier('c')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-regex.test calls', () => {
    test('should not report regex.exec(str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.exec(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createIdentifier('str')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.match(str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.match(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createIdentifier('str')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'match' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.replace(str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.replace(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createIdentifier('str')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'replace' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.search(str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.search(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createIdentifier('str')],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'search' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report pattern.test(str)', () => {
      const { context, reports } = createMockRuleContext({ source: 'pattern.test(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('str'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'pattern' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report re.test(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 're.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report reg.test(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'reg.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'reg' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report expression.test(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'expression.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'expression' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.compile(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.compile(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'compile' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.toString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.toString();' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'toString' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.source', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.source;' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'source' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.flags;' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'flags' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report test(str) direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'test(str);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createIdentifier('str')],
        callee: { type: 'Identifier', name: 'test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex[\'test\'](...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex["test"](...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Literal', value: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test() with no args', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test();' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test(str, str2) with multiple args', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(str, str2);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpTestCall([createIdentifier('str'), createIdentifier('str2')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regex.test with template literal arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(`hello`);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const templateLiteral = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      visitor.CallExpression(makeRegExpTestCall([templateLiteral]))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASE TESTS (17)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { type: 'Identifier', name: 'test' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'test' },
        },
        range: [0, 10],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'regex' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Literal', value: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'regex' },
          property: { type: 'Identifier', name: 'test' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(
        makeRegExpTestCall([createSpreadElement(createIdentifier('items'))], 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle boolean node input', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node input', () => {
      const { context } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'regex.test(...items);' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeRegExpTestCall([createIdentifier('str')]))
      visitor.CallExpression(makeRegExpTestCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(2)
    })

    test('should handle empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnnecessaryRegExpTestSpreadRule.create(context)

      expect(() =>
        visitor.CallExpression(
          makeRegExpTestCall([createSpreadElement(createIdentifier('items'))]),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

  })
})
