import { describe, test, expect, vi } from 'vitest'
import { preferTemplateRule } from '../../../../src/rules/patterns/prefer-template.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '"Hello " + name;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: string | number, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + String(value).length },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createTemplateLiteral(line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [],
    expressions: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('prefer-template rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferTemplateRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferTemplateRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferTemplateRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferTemplateRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferTemplateRule.meta.schema).toBeDefined()
    })

    test('should be fixable with code', () => {
      expect(preferTemplateRule.meta.fixable).toBe('code')
    })

    test('should mention template in description', () => {
      expect(preferTemplateRule.meta.docs?.description.toLowerCase()).toContain('template')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting string concatenation', () => {
    test('should report string literal + identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('template')
    })

    test('should report identifier + string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createIdentifier('name'), createLiteral(' world'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string literal + string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello '), createLiteral('world'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report nested concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const innerConcat = createBinaryExpression(
        createLiteral('Hello '),
        createIdentifier('name'),
        '+',
      )

      const node = createBinaryExpression(innerConcat, createLiteral('!'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal + identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), createIdentifier('name'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report number + number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(
        createLiteral(5 as unknown as string),
        createLiteral(3 as unknown as string),
        '+',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report identifier + identifier without string context', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello'), createIdentifier('name'), '-')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report multiplication', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello'), createIdentifier('name'), '*')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: { type: 'Literal', value: 'Hello ' },
        right: { type: 'Identifier', name: 'name' },
        operator: '+',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(
        createLiteral('Hello ', 10, 5),
        createIdentifier('name', 10, 15),
        '+',
        10,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '"Hello " + name;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferTemplateRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention template in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should mention concatenation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )

      expect(reports[0].message.toLowerCase()).toContain('concatenation')
    })

    test('should mention backticks in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )

      expect(reports[0].message).toContain('backticks')
    })
  })

  describe('fix functionality', () => {
    function createMockContextWithSource(source: string): {
      context: RuleContext
      reports: ReportDescriptor[]
    } {
      const reports: ReportDescriptor[] = []

      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => source,
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
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

    function createBinaryExpressionWithRange(
      left: unknown,
      right: unknown,
      operator: string,
      range: [number, number],
    ): unknown {
      return {
        type: 'BinaryExpression',
        left,
        right,
        operator,
        range,
        loc: {
          start: { line: 1, column: range[0] },
          end: { line: 1, column: range[1] },
        },
      }
    }

    function createLiteralWithRange(value: string, range: [number, number]): unknown {
      return {
        type: 'Literal',
        value,
        range,
      }
    }

    function createIdentifierWithRange(name: string, range: [number, number]): unknown {
      return {
        type: 'Identifier',
        name,
        range,
      }
    }

    function createTemplateLiteralWithRange(range: [number, number]): unknown {
      return {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        range,
      }
    }

    test('should provide fix for string literal + identifier', () => {
      const source = '"Hello " + name'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpressionWithRange(
        createLiteralWithRange('Hello ', [0, 8]),
        createIdentifierWithRange('name', [11, 15]),
        '+',
        [0, 15],
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toContain('Hello ')
    })

    test('should provide fix for template literal + identifier', () => {
      const source = '`Hello ${greeting}` + name'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpressionWithRange(
        createTemplateLiteralWithRange([0, 18]),
        createIdentifierWithRange('name', [21, 25]),
        '+',
        [0, 25],
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for nested concatenation', () => {
      const source = '"Hello " + name + "!"'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)

      const innerConcat = createBinaryExpressionWithRange(
        createLiteralWithRange('Hello ', [0, 8]),
        createIdentifierWithRange('name', [11, 15]),
        '+',
        [0, 15],
      )

      const node = createBinaryExpressionWithRange(
        innerConcat,
        createLiteralWithRange('!', [18, 21]),
        '+',
        [0, 21],
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
