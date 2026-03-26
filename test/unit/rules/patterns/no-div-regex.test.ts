import { describe, test, expect, vi } from 'vitest'
import { noDivRegexRule } from '../../../../src/rules/patterns/no-div-regex.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'x = /foo/',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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
  })

  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting ambiguous regex', () => {
    test('should report x = /foo/', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /bar/', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('bar'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /test\\d+/', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('test\\d+'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /^hello/', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('^hello'))

      expect(reports.length).toBe(1)
    })

    test('should report x = /world$/', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('world$'))

      expect(reports.length).toBe(1)
    })

    test('should report empty regex pattern x = //', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex(''))

      expect(reports.length).toBe(1)
    })
  })

  describe('allowing non-ambiguous expressions', () => {
    test('should not report regular division', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 5))

      expect(reports.length).toBe(0)
    })

    test('should not report addition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', 'Literal', 10))

      expect(reports.length).toBe(0)
    })

    test('should not report multiplication', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', 'Literal', 3))

      expect(reports.length).toBe(0)
    })

    test('should not report modulo', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('%', 'Literal', 2))

      expect(reports.length).toBe(0)
    })

    test('should not report comparison operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('===', 'Literal', 'foo'))
      visitor.BinaryExpression(createBinaryExpression('==', 'Literal', 'foo'))
      visitor.BinaryExpression(createBinaryExpression('!==', 'Literal', 'foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report division with non-string right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', 'Identifier', 'y'))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 100))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', null))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention ambiguous in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.toLowerCase()).toContain('ambiguous')
    })

    test('should mention RegExp in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message).toContain('RegExp')
    })

    test('should mention parentheses in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))

      expect(reports[0].message.toLowerCase()).toContain('parenthes')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      const node = { operator: '/', right: { type: 'Literal', value: 'foo' } }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type gracefully', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        right: { type: 'Literal', value: 'foo' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null right gracefully', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '/',
        right: { type: 'Literal', value: null },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockContext()
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
  })

  describe('multiple violations', () => {
    test('should report multiple ambiguous regex expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      visitor.BinaryExpression(createAmbiguousRegex('bar'))
      visitor.BinaryExpression(createAmbiguousRegex('baz'))

      expect(reports.length).toBe(3)
    })

    test('should report ambiguous but not regular division', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('foo'))
      visitor.BinaryExpression(createBinaryExpression('/', 'Literal', 5))
      visitor.BinaryExpression(createAmbiguousRegex('bar'))

      expect(reports.length).toBe(2)
    })
  })

  describe('complex regex patterns', () => {
    test('should report regex with flags pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('[a-z]+'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with character classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('[0-9]{3}'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('(foo|bar)'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with quantifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('a+'))
      visitor.BinaryExpression(createAmbiguousRegex('a*'))
      visitor.BinaryExpression(createAmbiguousRegex('a?'))

      expect(reports.length).toBe(3)
    })

    test('should report regex with escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = noDivRegexRule.create(context)

      visitor.BinaryExpression(createAmbiguousRegex('\\w+'))
      visitor.BinaryExpression(createAmbiguousRegex('\\d+'))
      visitor.BinaryExpression(createAmbiguousRegex('\\s+'))

      expect(reports.length).toBe(3)
    })
  })
})
