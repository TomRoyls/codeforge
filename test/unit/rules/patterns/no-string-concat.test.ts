import { describe, test, expect, vi } from 'vitest'
import { noStringConcatRule } from '../../../../src/rules/patterns/no-string-concat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const str = "hello" + "world";',
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
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createTemplateLiteral(): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [],
    expressions: [],
  }
}

describe('no-string-concat rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noStringConcatRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noStringConcatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noStringConcatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noStringConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noStringConcatRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noStringConcatRule.meta.fixable).toBeUndefined()
    })

    test('should mention string concatenation in description', () => {
      expect(noStringConcatRule.meta.docs?.description.toLowerCase()).toContain(
        'string concatenation',
      )
    })

    test('should mention template literals in description', () => {
      expect(noStringConcatRule.meta.docs?.description.toLowerCase()).toContain('template')
    })

    test('should mention array join in description', () => {
      expect(noStringConcatRule.meta.docs?.description.toLowerCase()).toContain('join')
    })

    test('should have documentation URL', () => {
      expect(noStringConcatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-string-concat',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting string literal + string literal', () => {
    test('should report "hello" + "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should report "" + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(''), '+', createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "a" + "b" + "c" (left operand is literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('a'),
        '+',
        createBinaryExpression(createLiteral('b'), '+', createLiteral('c')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report multi-line string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('first line\n'),
        '+',
        createLiteral('second line'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting string literal + variable', () => {
    test('should report "hello" + variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createIdentifier('name'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should report "prefix: " + user.id', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('prefix: '), '+', createIdentifier('user'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + emptyVar', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(''), '+', createIdentifier('emptyVar'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "result: " + (a + b) (right operand is expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('result: '),
        '+',
        createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting variable + string literal', () => {
    test('should report variable + "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('name'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should report user.id + " suffix"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('userId'), '+', createLiteral(' suffix'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report emptyVar + ""', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('emptyVar'), '+', createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report (a + b) + " suffix" (left operand is expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b')),
        '+',
        createLiteral(' suffix'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting template literal concatenation', () => {
    test('should report "prefix" + templateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('prefix'), '+', createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report templateLiteral + "suffix"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createLiteral('suffix'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report templateLiteral + templateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting numeric addition', () => {
    test('should not report 1 + 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(1), '+', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + y (variables)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), '+', createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a + (b + c) (nested expressions)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('a'),
        '+',
        createBinaryExpression(createIdentifier('b'), '+', createIdentifier('c')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 10 + count', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(10), '+', createIdentifier('count'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report index + 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('index'), '+', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-plus operators', () => {
    test('should not report "hello" - "world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '-', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" * 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '*', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str === "test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('str'), '===', createLiteral('test'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 5 + 5 (numeric addition)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(5), '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        25,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without left operand (reports if right is string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without right operand (reports if left is string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left operand (reports if right is string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: null,
        operator: '+',
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null right operand (reports if left is string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: null,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          end: { line: 1, column: 15 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with invalid line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          start: { line: -1, column: 'invalid' as unknown as number },
          end: { line: null as unknown as number, column: 15 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(true), '+', createLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention string concatenation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('string concatenation')
    })

    test('should mention template literals in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('template literals')
    })

    test('should mention array.join() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('array.join()')
    })

    test('should mention unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should suggest use template literals or array join', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Use')
      expect(reports[0].message).toContain('instead')
    })
  })

  describe('location accuracy', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        42,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'), 1)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        1,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should provide default location when loc is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple concatenations in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node1 = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      const node2 = createBinaryExpression(createLiteral('c'), '+', createLiteral('d'))

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report same violation only once', () => {
      const { context, reports } = createMockContext()
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })
  })
})
