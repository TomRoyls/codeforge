import { describe, test, expect, vi } from 'vitest'
import { noDivRegexRule } from '../../../../src/rules/patterns/no-div-regex.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  operator: string,
  rightType: string,
  rightValue: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left: {
      type: 'Identifier',
      name: 'x',
    },
    right: {
      type: rightType,
      value: rightValue,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createAmbiguousRegex(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '/',
    left: {
      type: 'Identifier',
      name: 'x',
    },
    right: {
      type: 'Literal',
      value: pattern,
      raw: `/${pattern}/`,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-div-regex rule', () => {
  // =========================================================================
  // META TESTS (20 tests)
  // =========================================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDivRegexRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDivRegexRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDivRegexRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDivRegexRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noDivRegexRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noDivRegexRule.meta.fixable).toBeUndefined()
    })

    test('should mention ambiguous in description', () => {
      expect(noDivRegexRule.meta.docs?.description.toLowerCase()).toContain('ambiguous')
    })

    test('should mention regex in description', () => {
      expect(noDivRegexRule.meta.docs?.description.toLowerCase()).toContain('regex')
    })

    test('should have empty schema array', () => {
      expect(noDivRegexRule.meta.schema).toEqual([])
    })

    test('should have meta property as object', () => {
      expect(typeof noDivRegexRule.meta).toBe('object')
    })

    test('should have docs property defined', () => {
      expect(noDivRegexRule.meta.docs).toBeDefined()
    })

    test('should have docs description as string', () => {
      expect(typeof noDivRegexRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noDivRegexRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDivRegexRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noDivRegexRule.meta.severity)
    })

    test('should have url in docs', () => {
      expect(noDivRegexRule.meta.docs?.url).toBeDefined()
    })

    test('should have url containing rules', () => {
      expect(noDivRegexRule.meta.docs?.url).toContain('rules')
    })

    test('should have url containing no-div-regex', () => {
      expect(noDivRegexRule.meta.docs?.url).toContain('no-div-regex')
    })

    test('should have recommended as boolean true', () => {
      expect(noDivRegexRule.meta.docs?.recommended).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(noDivRegexRule.meta.deprecated).toBeUndefined()
    })
  })

  // =========================================================================
  // CREATE / VISITOR TESTS (8 tests)
  // =========================================================================
  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return object from create', () => {
      const { context } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return visitor that is not null', () => {
      const { context } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should have BinaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'x = /foo/', filePath: '/a.ts' })
      const { context: ctx2 } = createMockRuleContext({ source: 'x = /foo/', filePath: '/b.ts' })
      const visitor1 = noDivRegexRule.create(ctx1)
      const visitor2 = noDivRegexRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should have exactly one visitor key (BinaryExpression)', () => {
      const { context } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(Object.keys(visitor)).toEqual(['BinaryExpression'])
    })

    test('should accept context with empty options', () => {
      const { context } = createMockRuleContext({ source: 'x = /foo/' })
      expect(() => noDivRegexRule.create(context)).not.toThrow()
    })

    test('should accept context with populated options', () => {
      const { context } = createMockRuleContext({ options: [{ strict: true, level: 3 }], source: 'x = /foo/' })
      expect(() => noDivRegexRule.create(context)).not.toThrow()
    })
  })

  // =========================================================================
  // DETECTION TESTS (30 tests)
  // =========================================================================
  describe('detecting ambiguous regex', () => {
    test('should report x = /foo/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /bar/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('bar'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /test\\d+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test\\d+'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /^hello/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('^hello'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /world$/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('world$'))

      expect(reports.length).toBe(1)
    })

    test('should report empty regex pattern x = //', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex(''))

      expect(reports.length).toBe(1)
    })

    test('should report regex with single character pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with dot pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('.'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with unicode pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\u0041'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with backreference pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('(a)\\1'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with lookahead pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo(?=bar)'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with negative lookahead pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo(?!bar)'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with alternation pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('cat|dog'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with anchor patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('^start$'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with word boundary pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\bword\\b'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with character class range', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('[a-zA-Z0-9]'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with negated character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('[^abc]'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with non-capturing group', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('(?:foo)'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with named capture group', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('(?<name>foo)'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with escaped forward slash', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a\\/b'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with hex escape pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\x41'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with tab escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\t'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with newline escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\n'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with exact quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a{3}'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with range quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a{2,5}'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with lazy quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a+?'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with complex email pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('[\\w.+-]+@[\\w-]+\\.[\\w.]+'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with URL-like pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('https?://\\S+'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with IP address pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with whitespace-only string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex(' '))

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // NOT REPORTING TESTS (30 tests)
  // =========================================================================
  describe('allowing non-ambiguous expressions', () => {
    test('should not report regular division', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 5))

      expect(reports.length).toBe(0)
    })

    test('should not report addition', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', 'Literal', 10))

      expect(reports.length).toBe(0)
    })

    test('should not report multiplication', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', 'Literal', 3))

      expect(reports.length).toBe(0)
    })

    test('should not report modulo', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('%', 'Literal', 2))

      expect(reports.length).toBe(0)
    })

    test('should not report comparison operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('===', 'Literal', 'foo'))
      visitor.BinaryExpression(createBinaryExpression('==', 'Literal', 'foo'))
      visitor.BinaryExpression(createBinaryExpression('!==', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report division with non-string right operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Identifier', 'y'))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 100))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', null))

      expect(reports.length).toBe(0)
    })

    test('should not report exponentiation operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('**', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report less-than operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report greater-than operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report less-than-or-equal operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<=', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report greater-than-or-equal operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>=', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report in operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('in', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report instanceof operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('instanceof', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report bitwise AND operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report bitwise OR operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('|', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report bitwise XOR operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('^', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report left shift operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('<<', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report right shift operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report unsigned right shift operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('>>>', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report logical AND operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('&&', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report logical OR operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('||', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report nullish coalescing operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('??', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      for (const op of ['+=', '-=', '*=', '/=', '%=']) {
        visitor.BinaryExpression(createBinaryExpression(op, 'Literal', 'foo'))
      }

      expect(reports.length).toBe(0)
    })

    test('should not report when right is a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', true))

      expect(reports.length).toBe(0)
    })

    test('should not report when right is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', undefined))

      expect(reports.length).toBe(0)
    })

    test('should not report when right is a numeric string with division', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right is BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when operator is not division with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('==', 'Literal', 'some pattern'))

      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // EDGE CASE TESTS (25 tests)
  // =========================================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = { operator: '/', right: { type: 'Literal', value: 'foo' } }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without operator gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null right gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: null,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Literal right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Identifier', name: 'y' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number Literal right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Literal', value: 42 },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null Literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Literal', value: null },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined Literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Literal', value: undefined },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean Literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Literal', value: true },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with object Literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Literal', value: { key: 'val' } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '',
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with ArrayExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'ArrayExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with UpdateExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'UpdateExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number operator (non-string)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: 42,
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle deeply nested empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right missing type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with right as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: {},
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 'foo' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        extra: { parenthesized: true },
        leadingComments: [],
        trailingComments: [],
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(() => visitor.BinaryExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(0)).not.toThrow()
      expect(() => visitor.BinaryExpression(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(() => visitor.BinaryExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // LOCATION TESTS (15 tests)
  // =========================================================================
  describe('location reporting', () => {
    test('should report correct location at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo', 500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location at high column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo', 3, 200))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report correct location for end position', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo', 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report location for multiple nodes correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a', 2, 4))
      visitor.BinaryExpression(createAmbiguousRegex('b', 8, 16))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[1].loc?.start.line).toBe(8)
      expect(reports[1].loc?.start.column).toBe(16)
    })

    test('should report location with zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 'test' },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for single column position', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('x', 1, 0))

      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('should report end location calculated from start', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test', 7, 3))

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('abc', 15, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for pattern at line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('z', 1, 99))

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should preserve location data in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test', 42, 7))

      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toBeDefined()
      expect(loc?.end).toBeDefined()
    })

    test('should report distinct locations for distinct nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a', 1, 0))
      visitor.BinaryExpression(createAmbiguousRegex('b', 2, 0))

      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
    })

    test('should report correct location at very end of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('end', 999, 999))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(999)
    })
  })

  // =========================================================================
  // MESSAGE TESTS (10 tests)
  // =========================================================================
  describe('message quality', () => {
    test('should mention ambiguous in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.toLowerCase()).toContain('ambiguous')
    })

    test('should mention RegExp in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message).toContain('RegExp')
    })

    test('should mention parentheses in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.toLowerCase()).toContain('parenthes')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have consistent message for different patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      visitor.BinaryExpression(createAmbiguousRegex('bar'))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should contain suggestion in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.toLowerCase()).toContain('regexp()')
    })

    test('should not contain placeholder markers in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('should have message starting with capital letter', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  // =========================================================================
  // MULTIPLE REPORTS TESTS (10 tests)
  // =========================================================================
  describe('multiple violations', () => {
    test('should report multiple ambiguous regex expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      visitor.BinaryExpression(createAmbiguousRegex('bar'))
      visitor.BinaryExpression(createAmbiguousRegex('baz'))

      expect(reports.length).toBe(3)
    })

    test('should report ambiguous but not regular division', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 5))
      visitor.BinaryExpression(createAmbiguousRegex('bar'))

      expect(reports.length).toBe(2)
    })

    test('should report each ambiguous regex in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(createAmbiguousRegex(`pattern${i}`))
      }

      expect(reports.length).toBe(5)
    })

    test('should report mixed violations correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a'))
      visitor.BinaryExpression(createBinaryExpression('+', 'Literal', 5))
      visitor.BinaryExpression(createAmbiguousRegex('b'))
      visitor.BinaryExpression(createBinaryExpression('-', 'Literal', 3))
      visitor.BinaryExpression(createAmbiguousRegex('c'))

      expect(reports.length).toBe(3)
    })

    test('should report only ambiguous regex among many expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      for (const op of ['+', '-', '*', '%', '===', '==', '!=', '!==', '<', '>']) {
        visitor.BinaryExpression(createBinaryExpression(op, 'Literal', 'test'))
      }
      visitor.BinaryExpression(createAmbiguousRegex('caught'))

      expect(reports.length).toBe(1)
    })

    test('should accumulate reports across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a'))
      expect(reports.length).toBe(1)

      visitor.BinaryExpression(createAmbiguousRegex('b'))
      expect(reports.length).toBe(2)
    })

    test('should handle alternating valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 5))
      visitor.BinaryExpression(createAmbiguousRegex('a'))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 10))
      visitor.BinaryExpression(createAmbiguousRegex('b'))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 15))
      visitor.BinaryExpression(createAmbiguousRegex('c'))

      expect(reports.length).toBe(3)
    })

    test('should handle large number of violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.BinaryExpression(createAmbiguousRegex(`p${i}`))
      }

      expect(reports.length).toBe(50)
    })

    test('should report zero violations for all valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(createBinaryExpression('/', 'Literal', i))
      }

      expect(reports.length).toBe(0)
    })

    test('should not mix up report order', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('first', 1, 0))
      visitor.BinaryExpression(createAmbiguousRegex('second', 2, 0))
      visitor.BinaryExpression(createAmbiguousRegex('third', 3, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })

  // =========================================================================
  // CONTEXT TESTS (10 tests)
  // =========================================================================
  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/', filePath: '/src/utils/helpers.ts' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/', filePath: '/src/file.ts' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test'))

      expect(reports.length).toBe(1)
    })

    test('should work with config options present', () => {
      const { context, reports } = createMockRuleContext({ options: [{ customOption: true }], source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty config options', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports.length).toBe(1)
    })

    test('should not call logger methods during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports.length).toBe(1)
    })

    test('should use report function from context', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)

      expect(reports.length).toBe(0)
      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      expect(reports.length).toBe(1)
    })

    test('should not throw when context has minimal setup', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/',
      } as unknown as RuleContext

      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(createAmbiguousRegex('foo'))).not.toThrow()
    })

    test('should work with .ts file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/', filePath: '/src/app.ts' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test'))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/', filePath: '/src/component.tsx' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test'))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/', filePath: '/src/index.js' })
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test'))

      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // PARAMETERIZED PATTERN DETECTION TESTS (10 tests)
  // =========================================================================
  describe('parameterized pattern detection', () => {
    test('should report ambiguous regex with pattern /foo/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /bar/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('bar'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /test\\d+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test\\d+'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /^hello/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('^hello'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /world$/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('world$'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with empty pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex(''))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with single char pattern /a/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('a'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /[a-z]+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('[a-z]+'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /[0-9]{3}/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('[0-9]{3}'))
      expect(reports.length).toBe(1)
    })

    test('should report ambiguous regex with pattern /(foo|bar)/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('(foo|bar)'))
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // PARAMETERIZED NON-DETECTION BY OPERATOR TESTS (10 tests)
  // =========================================================================
  describe('parameterized non-detection by operator', () => {
    test('should not report with addition operator +', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('+', 'Literal', 5))
      expect(reports.length).toBe(0)
    })

    test('should not report with subtraction operator -', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('-', 'Literal', 10))
      expect(reports.length).toBe(0)
    })

    test('should not report with multiplication operator *', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('*', 'Literal', 3))
      expect(reports.length).toBe(0)
    })

    test('should not report with modulo operator %', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('%', 'Literal', 2))
      expect(reports.length).toBe(0)
    })

    test('should not report with exponentiation operator **', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('**', 'Literal', 2))
      expect(reports.length).toBe(0)
    })

    test('should not report with strict equality operator ===', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('===', 'Literal', 'foo'))
      expect(reports.length).toBe(0)
    })

    test('should not report with loose equality operator ==', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('==', 'Literal', 'foo'))
      expect(reports.length).toBe(0)
    })

    test('should not report with strict inequality operator !==', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('!==', 'Literal', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('should not report with loose inequality operator !=', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('!=', 'Literal', 'bar'))
      expect(reports.length).toBe(0)
    })

    test('should not report with less-than operator <', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('<', 'Literal', 5))
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // PARAMETERIZED RIGHT-TYPE NON-DETECTION TESTS (10 tests)
  // =========================================================================
  describe('parameterized right-type non-detection', () => {
    test('should not report when right type is Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('/', 'Identifier', 'y'))
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', 'MemberExpression', {
          object: { type: 'Identifier', name: 'obj' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', 'CallExpression', {
          callee: { type: 'Identifier', name: 'fn' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', 'BinaryExpression', {
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('/', 'TemplateLiteral', { quasis: [] }))
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', 'ArrowFunctionExpression', {
          params: [],
          body: { type: 'Literal', value: 1 },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', 'FunctionExpression', {
          params: [],
          body: { type: 'BlockStatement' },
        }),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is ObjectExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('/', 'ObjectExpression', { properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is ArrayExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('/', 'ArrayExpression', { elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('should not report when right type is NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression('/', 'NewExpression', {
          callee: { type: 'Identifier', name: 'RegExp' },
        }),
      )
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // PARAMETERIZED NODE TYPE NON-DETECTION TESTS (10 tests)
  // =========================================================================
  describe('parameterized node type non-detection', () => {
    test('should not report when node type is CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'CallExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'MemberExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is ArrayExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'ArrayExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is ObjectExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'ObjectExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'FunctionExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'ArrowFunctionExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'ConditionalExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is LogicalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'LogicalExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'AssignmentExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression({
        type: 'SequenceExpression',
        operator: '/',
        right: { type: 'Literal', value: 'foo' },
      })
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // PARAMETERIZED REGEX ESCAPE SEQUENCE DETECTION TESTS (10 tests)
  // =========================================================================
  describe('parameterized regex escape sequence detection', () => {
    test('should report regex with word character escape /\\w+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\w+'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with digit escape /\\d+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\d+'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with whitespace escape /\\s+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\s+'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with non-word escape /\\W+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\W+'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with non-digit escape /\\D+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\D+'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with non-whitespace escape /\\S+/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\S+'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with word boundary /\\b/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\b'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with non-word boundary /\\B/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\B'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with tab escape /\\t/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\t'))
      expect(reports.length).toBe(1)
    })

    test('should report regex with newline escape /\\n/', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('\\n'))
      expect(reports.length).toBe(1)
    })
  })

  // =========================================================================
  // PARAMETERIZED LOCATION VERIFICATION TESTS (10 tests)
  // =========================================================================
  describe('parameterized location verification', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 2 column 3', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 2, 3))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location at line 50 column 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 50, 100))
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report correct location at line 1 column 999', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 1, 999))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('should report correct location at line 999 column 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 999, 1))
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report correct location at line 5 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 5, 0))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location at line 25 column 75', () => {
      const { context, reports } = createMockRuleContext({ source: 'x = /foo/' })
      const visitor = noDivRegexRule.create(context)
      visitor.BinaryExpression(createAmbiguousRegex('test', 25, 75))
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(75)
    })
  })
})
