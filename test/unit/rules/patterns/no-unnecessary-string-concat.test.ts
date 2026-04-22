import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryStringConcatRule } from '../../../../src/rules/patterns/no-unnecessary-string-concat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createConcatCall(objectName = 'str', args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Literal',
        value: objectName,
        raw: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'concat',
      },
      computed: false,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 + objectName.length },
    },
    range: [column, column + 10 + objectName.length],
  }
}

function createConcatCallWithIdentifierObject(
  objectName = 'str',
  args: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'concat',
      },
      computed: false,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 + objectName.length },
    },
    range: [column, column + 10 + objectName.length],
  }
}

function createLiteral(value: unknown, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? String(value),
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createNonConcatCall(methodName = 'map'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'arr',
      },
      property: {
        type: 'Identifier',
        name: methodName,
      },
    },
    arguments: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

function createDirectCall(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'concat',
    },
    arguments: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-unnecessary-string-concat rule', () => {
  // ============================================================
  // META TESTS (20)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryStringConcatRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryStringConcatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryStringConcatRule.meta.schema).toBeDefined()
    })

    test('should be fixable as code', () => {
      expect(noUnnecessaryStringConcatRule.meta.fixable).toBe('code')
    })

    test('should mention concat in description', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.description.toLowerCase()).toContain('concat')
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })

    test('should mention empty string in description', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.description.toLowerCase()).toContain(
        'empty string',
      )
    })

    test('should have documentation URL', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.url).toContain('no-unnecessary-string-concat')
    })

    test('should have meta property defined', () => {
      expect(noUnnecessaryStringConcatRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs).toBeDefined()
    })

    test('should have type as a string', () => {
      expect(typeof noUnnecessaryStringConcatRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noUnnecessaryStringConcatRule.meta.severity).toBe('string')
    })

    test('should have description as a string', () => {
      expect(typeof noUnnecessaryStringConcatRule.meta.docs?.description).toBe('string')
    })

    test('should have description longer than 10 characters', () => {
      expect((noUnnecessaryStringConcatRule.meta.docs?.description ?? '').length).toBeGreaterThan(
        10,
      )
    })

    test('should have url as a string', () => {
      expect(typeof noUnnecessaryStringConcatRule.meta.docs?.url).toBe('string')
    })

    test('should have https in url', () => {
      expect(noUnnecessaryStringConcatRule.meta.docs?.url).toContain('https://')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnnecessaryStringConcatRule.meta.schema)).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(noUnnecessaryStringConcatRule.meta.deprecated).toBeUndefined()
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (8)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a CallExpression method that is a function', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return a visitor object', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ source: '"".concat(str);' })
      const { context: ctx2 } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor1 = noUnnecessaryStringConcatRule.create(ctx1)
      const visitor2 = noUnnecessaryStringConcatRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with empty options', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should accept context with custom file path', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);', filePath: '/custom/path.ts' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should accept context with custom source', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1;', filePath: '/src/file.ts' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  // ============================================================
  // DETECTION TESTS (30)
  // ============================================================
  describe('detecting emptyString.concat(str)', () => {
    test('should report "".concat("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('concat')
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should report "".concat(str)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat(text)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('text')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat(name)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('name')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat(value)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('value')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat(result)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('result')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat(output)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('output')]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat with template literal arg', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const templateLiteral = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      visitor.CallExpression(createConcatCall('', [templateLiteral]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat with number literal arg', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral(42)]))

      expect(reports.length).toBe(1)
    })

    test('should report "".concat with boolean literal arg', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral(true)]))

      expect(reports.length).toBe(1)
    })

    test('should report empty string with extra trailing args', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCall('', [createIdentifier('str'), createLiteral('extra')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report empty string concat with call expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const fnCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }

      visitor.CallExpression(createConcatCall('', [fnCall]))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting str.concat("")', () => {
    test('should report str.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('concat')
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should report text.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('text', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report message.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('message', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report name.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('name', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report value.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('value', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report result.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('result', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report output.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('output', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report label.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('label', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report title.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('title', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report header.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('header', [createLiteral('')]))

      expect(reports.length).toBe(1)
    })

    test('should report myVar.concat("") with trailing args', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('myVar', [createLiteral(''), createLiteral('extra')]),
      )

      // First arg is empty string so it's unnecessary
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING TESTS (30)
  // ============================================================
  describe('not reporting valid concat usage', () => {
    test('should not report "hello".concat("world")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat("world")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))

      expect(reports.length).toBe(0)
    })

    test('should not report "hello".concat(str)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createIdentifier('str')]))

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat(text)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat(text1, text2)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [
          createIdentifier('text1'),
          createIdentifier('text2'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat("world", "!")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createLiteral('world'), createLiteral('!')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "".concat()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', []))

      expect(reports.length).toBe(0)
    })

    test('should not report str.concat()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', []))

      expect(reports.length).toBe(0)
    })

    test('should not report "prefix".concat("suffix")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('prefix', [createLiteral('suffix')]))

      expect(reports.length).toBe(0)
    })

    test('should not report "a".concat("b")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('a', [createLiteral('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report base.concat(append)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('base', [createIdentifier('append')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "hello".concat(name, "!")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCall('hello', [createIdentifier('name'), createLiteral('!')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report greeting.concat(" world", "!")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('greeting', [
          createLiteral(' world'),
          createLiteral('!'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report "start".concat(middle, "end")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCall('start', [createIdentifier('middle'), createLiteral('end')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report path.concat("/") with non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('path', [createLiteral('/')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-concat calls', () => {
    test('should not report arr.map()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('filter'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('forEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.push()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('push'))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(0)
    })

    test('should not report arr.join()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('join'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('slice'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.toString()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.indexOf()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('indexOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.includes()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('includes'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.split()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('split'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.trim()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('trim'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.replace()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('replace'))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.toUpperCase()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createNonConcatCall('toUpperCase'))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASE TESTS (25)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'str',
          },
        ],
        range: [0, 9],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'str',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'concat',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Literal',
            value: 'concat',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Literal',
            value: 'concat',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty source', () => {
      const { context } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() =>
        visitor.CallExpression(createConcatCall('', [createLiteral('hello')])),
      ).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: '',
            raw: '""',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
        range: [0, 9],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-literal object for empty string check', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle empty string object with empty string arg', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('')]))

      // Both the object is empty string AND first arg is empty string
      // The rule checks object first, so it should report (isEmptyString(calleeObj) && firstArg !== null)
      expect(reports.length).toBe(1)
    })

    test('should handle whitespace-only string as object', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      // " ".concat(str) — whitespace is not empty string, so should NOT report
      visitor.CallExpression(createConcatCall(' ', [createIdentifier('str')]))

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type value', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      // Number literal object with concat — not empty string
      visitor.CallExpression(createConcatCall(0, [createIdentifier('str')]))

      expect(reports.length).toBe(0)
    })

    test('should handle null value in literal object', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: null,
            raw: 'null',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [createIdentifier('str')],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined value in literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: undefined,
            raw: 'undefined',
          },
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [createIdentifier('str')],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle boolean node input', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = { type: 'ExpressionStatement' }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node input', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with null object', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [createIdentifier('str')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined object', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: undefined,
          property: {
            type: 'Identifier',
            name: 'concat',
          },
        },
        arguments: [createIdentifier('str')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION TESTS (15)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location at line 1, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 10, column 5', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location at line 42, column 20', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 42, 20))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location at line 100, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 1, column 50', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 1, 50))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location for identifier object concat', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createLiteral('')], 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report both start and end location', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 3, 8))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report end location greater than start', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 1, 0))

      expect(reports[0].loc!.end.column).toBeGreaterThan(reports[0].loc!.start.column)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: '', raw: '""' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [createIdentifier('str')],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with only start property', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: '', raw: '""' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [createIdentifier('str')],
        loc: {
          start: { line: 7, column: 3 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: '', raw: '""' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [createIdentifier('str')],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 'not-a-number' as unknown as number, column: 0 },
        },
      }

      visitor.CallExpression(node)

      // Should fallback to default line 1
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: '', raw: '""' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [createIdentifier('str')],
        loc: {
          start: { line: 5, column: 'bad' as unknown as number },
          end: { line: 5, column: 'bad' as unknown as number },
        },
      }

      visitor.CallExpression(node)

      // Should fallback to default column 0
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('x')], 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for multiple nodes at different positions', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('a')], 1, 0))
      visitor.CallExpression(createConcatCall('', [createLiteral('b')], 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should preserve end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')], 3, 4))

      // end column should be start column + 10 + length of objectName ('') = 4 + 10 + 0 = 14
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(14)
    })
  })

  // ============================================================
  // MESSAGE QUALITY TESTS (10)
  // ============================================================
  describe('message quality', () => {
    test('should mention string concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('string concatenation')
    })

    test('should mention empty string', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('empty string')
    })

    test('should mention same as using the string directly', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('same as using the string directly')
    })

    test('should include Unnecessary in message', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should have consistent message for "".concat(str)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))

      expect(reports[0].message).toBe(
        'Unnecessary string concatenation with empty string. The result is the same as using the string directly.',
      )
    })

    test('should have consistent message for str.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))

      expect(reports[0].message).toBe(
        'Unnecessary string concatenation with empty string. The result is the same as using the string directly.',
      )
    })

    test('should have identical messages for both patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('a')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('b', [createLiteral('')]))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce a non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce a message longer than 20 characters', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports[0].message.length).toBeGreaterThan(20)
    })

    test('should produce a message that is a string', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(typeof reports[0].message).toBe('string')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS TESTS (10)
  // ============================================================
  describe('multiple reports', () => {
    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('text', [createIdentifier('world')]),
      )
      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))

      expect(reports.length).toBe(2)
    })

    test('should report all empty string object concats', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('a')]))
      visitor.CallExpression(createConcatCall('', [createLiteral('b')]))
      visitor.CallExpression(createConcatCall('', [createLiteral('c')]))

      expect(reports.length).toBe(3)
    })

    test('should report all empty string arg concats', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCallWithIdentifierObject('a', [createLiteral('')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('b', [createLiteral('')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('c', [createLiteral('')]))

      expect(reports.length).toBe(3)
    })

    test('should report mixed patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('x')]))
      visitor.CallExpression(createConcatCall('valid', [createLiteral('str')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('y', [createLiteral('')]))
      visitor.CallExpression(createConcatCall('', [createIdentifier('z')]))

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createConcatCall('', [createLiteral(`str${i}`)]))
      }

      expect(reports.length).toBe(10)
    })

    test('should not report when all calls are valid', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))
      visitor.CallExpression(createConcatCall('a', [createLiteral('b')]))

      expect(reports.length).toBe(0)
    })

    test('should detect common unnecessary concat patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))
      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('text', [createLiteral('')]))

      expect(reports.length).toBe(4)
    })

    test('should not flag necessary concat patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))
      visitor.CallExpression(createConcatCall('hello', [createIdentifier('str')]))
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('str', [createIdentifier('text')]),
      )
      visitor.CallExpression(
        createConcatCall('hello', [createLiteral('world'), createLiteral('!')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report correct count with alternating valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('a')])) // report
      visitor.CallExpression(createConcatCall('valid', [createLiteral('x')])) // no report
      visitor.CallExpression(createConcatCallWithIdentifierObject('b', [createLiteral('')])) // report
      visitor.CallExpression(createConcatCallWithIdentifierObject('c', [createIdentifier('d')])) // no report
      visitor.CallExpression(createConcatCall('', [createIdentifier('e')])) // report

      expect(reports.length).toBe(3)
    })

    test('should handle single report correctly', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('only')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary')
    })
  })

  // ============================================================
  // CONTEXT TESTS (10)
  // ============================================================
  describe('context usage', () => {
    test('should work with default context', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports.length).toBe(1)
    })

    test('should work with context with custom workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/project/src/file.ts',
        getAST: () => null,
        getSource: () => '"".concat(str);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))

      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports.length).toBe(1)
    })

    test('should work with config options present', () => {
      const { context, reports } = createMockRuleContext({ options: [{ checkConcat: true }], source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports.length).toBe(1)
    })

    test('should use report function from context', () => {
      const mockReport = vi.fn()
      const context: RuleContext = {
        report: mockReport,
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '"".concat(str);',
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

      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(mockReport).toHaveBeenCalledTimes(1)
    })

    test('should not call report for valid patterns', () => {
      const mockReport = vi.fn()
      const context: RuleContext = {
        report: mockReport,
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '"hello".concat("world");',
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

      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))

      expect(mockReport).not.toHaveBeenCalled()
    })

    test('should work with long source strings', () => {
      const longSource = 'const x = '.repeat(100) + '"".concat(str);'
      const { context, reports } = createMockRuleContext({ source: longSource, filePath: '/src/file.ts' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports.length).toBe(1)
    })

    test('should work with special characters in source', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "héllo"; "".concat(str);', filePath: '/src/file.ts' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))

      expect(reports.length).toBe(1)
    })

    test('should work with .ts file extension', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);', filePath: '/src/module.ts' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);', filePath: '/src/component.tsx' })
      const visitor = noUnnecessaryStringConcatRule.create(context)

      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // TEST.EACH DATA-DRIVEN TESTS (45+)
  // ============================================================
  describe('"".concat detection with various identifier args', () => {
    test('should report "".concat(str)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('str')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(text)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('text')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(name)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('name')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(value)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('value')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(result)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('result')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(output)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('output')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(msg)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('msg')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(input)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('input')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(data)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('data')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat(content)', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createIdentifier('content')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('hello')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat("world")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('world')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat("test")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('test')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat("a")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('a')]))
      expect(reports.length).toBe(1)
    })

    test('should report "".concat("x")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('', [createLiteral('x')]))
      expect(reports.length).toBe(1)
    })
  })

  describe('str.concat("") detection with various identifiers', () => {
    test('should report str.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report text.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('text', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report message.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('message', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report name.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('name', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report value.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('value', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report result.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('result', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report output.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('output', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report label.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('label', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report title.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('title', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report header.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('header', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report footer.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('footer', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report prefix.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('prefix', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report suffix.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('suffix', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report desc.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('desc', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })

    test('should report body.concat("")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('body', [createLiteral('')]))
      expect(reports.length).toBe(1)
    })
  })

  describe('valid non-empty literal concat patterns', () => {
    test('should not report "hello".concat("world")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('hello', [createLiteral('world')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "prefix".concat("suffix")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('prefix', [createLiteral('suffix')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "a".concat("b")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('a', [createLiteral('b')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "start".concat("end")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('start', [createLiteral('end')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "left".concat("right")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('left', [createLiteral('right')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "first".concat("second")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('first', [createLiteral('second')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "before".concat("after")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('before', [createLiteral('after')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "open".concat("close")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('open', [createLiteral('close')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "up".concat("down")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('up', [createLiteral('down')]))
      expect(reports.length).toBe(0)
    })

    test('should not report "in".concat("out")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCall('in', [createLiteral('out')]))
      expect(reports.length).toBe(0)
    })
  })

  describe('non-concat method names should not report', () => {
    test('should not report arr.map()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('map'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('filter'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('reduce'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('forEach'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.find()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('find'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.some()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('some'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.every()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('every'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.includes()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('includes'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.indexOf()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('indexOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.join()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('join'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('slice'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.splice()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('splice'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.push()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('push'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.pop()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('pop'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.shift()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('shift'))
      expect(reports.length).toBe(0)
    })

    test('should not report arr.unshift()', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createNonConcatCall('unshift'))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid identifier object concat with non-empty args', () => {
    test('should not report str.concat("world")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(createConcatCallWithIdentifierObject('str', [createLiteral('world')]))
      expect(reports.length).toBe(0)
    })

    test('should not report text.concat("more text")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('text', [createLiteral('more text')]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report base.concat("append")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('base', [createLiteral('append')]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report first.concat("second")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('first', [createLiteral('second')]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report greeting.concat(" name")', () => {
      const { context, reports } = createMockRuleContext({ source: '"".concat(str);' })
      const visitor = noUnnecessaryStringConcatRule.create(context)
      visitor.CallExpression(
        createConcatCallWithIdentifierObject('greeting', [createLiteral(' name')]),
      )
      expect(reports.length).toBe(0)
    })
  })
})
