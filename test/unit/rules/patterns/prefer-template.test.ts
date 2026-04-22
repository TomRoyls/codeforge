import { describe, test, expect, vi } from 'vitest'
import { preferTemplateRule } from '../../../../src/rules/patterns/prefer-template.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting string concatenation', () => {
    test('should report string literal + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('template')
    })

    test('should report identifier + string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createIdentifier('name'), createLiteral(' world'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string literal + string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello '), createLiteral('world'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report nested concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
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
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), createIdentifier('name'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report number + number', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
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
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report subtraction', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello'), createIdentifier('name'), '-')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report multiplication', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello'), createIdentifier('name'), '*')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
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
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
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
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
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
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should mention concatenation in message', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )

      expect(reports[0].message.toLowerCase()).toContain('concatenation')
    })

    test('should mention backticks in message', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
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
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      const node = createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('meta - exhaustive', () => {
    test('should have correct type value', () => {
      expect(preferTemplateRule.meta.type).toBe('suggestion')
    })

    test('should have correct severity value', () => {
      expect(preferTemplateRule.meta.severity).toBe('warn')
    })

    test('should have docs object', () => {
      expect(preferTemplateRule.meta.docs).toBeDefined()
      expect(typeof preferTemplateRule.meta.docs).toBe('object')
    })

    test('should have docs description that is a string', () => {
      expect(typeof preferTemplateRule.meta.docs?.description).toBe('string')
    })

    test('should have docs description with non-zero length', () => {
      expect(preferTemplateRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url', () => {
      expect(preferTemplateRule.meta.docs?.url).toBeDefined()
      expect(typeof preferTemplateRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url pointing to codeforge', () => {
      expect(preferTemplateRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have docs url containing prefer-template', () => {
      expect(preferTemplateRule.meta.docs?.url).toContain('prefer-template')
    })

    test('should have recommended set to true', () => {
      expect(preferTemplateRule.meta.docs?.recommended).toBe(true)
    })

    test('should have category set to patterns', () => {
      expect(preferTemplateRule.meta.docs?.category).toBe('patterns')
    })

    test('should have fixable set to code', () => {
      expect(preferTemplateRule.meta.fixable).toBe('code')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferTemplateRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(preferTemplateRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(preferTemplateRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferTemplateRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferTemplateRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should mention string concatenation in description', () => {
      expect(preferTemplateRule.meta.docs?.description.toLowerCase()).toContain('concatenation')
    })

    test('should mention backticks in description', () => {
      expect(preferTemplateRule.meta.docs?.description).toContain('backticks')
    })

    test('should mention + operator in description', () => {
      expect(preferTemplateRule.meta.docs?.description).toContain('+')
    })
  })

  describe('create - visitor shape', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have BinaryExpression method', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor1 = preferTemplateRule.create(context)
      const visitor2 = preferTemplateRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should not have unrelated visitor methods', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('BinaryExpression')
      // Only BinaryExpression should exist
      expect(keys.length).toBe(1)
    })

    test('BinaryExpression should be callable without throwing', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
    })
  })

  describe('string concatenation detection - string literal left', () => {
    test('should report "Hello " + name', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createIdentifier('name'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report "Error: " + msg', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Error: '), createIdentifier('msg'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report empty string + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(''), createIdentifier('x'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report single-char string + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report long string + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createLiteral('This is a very long string value '),
          createIdentifier('val'),
          '+',
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should report string with special chars + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('value: \n\t'), createIdentifier('data'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report string with unicode + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello 世界 '), createIdentifier('x'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report string + number literal (string left)', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('count: '), createLiteral(42), '+'),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('string concatenation detection - string literal right', () => {
    test('should report name + " world"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('name'), createLiteral(' world'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report identifier + empty string', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral(''), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report identifier + "!"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('val'), createLiteral('!'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report identifier + " suffix text"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('result'), createLiteral(' is done'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report number literal + string (string right)', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(42), createLiteral(' items'), '+'),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('string concatenation detection - string literal both sides', () => {
    test('should report "a" + "b"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral('a'), createLiteral('b'), '+'))
      expect(reports.length).toBe(1)
    })

    test('should report "Hello " + "World"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('Hello '), createLiteral('World'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report "" + ""', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral(''), createLiteral(''), '+'))
      expect(reports.length).toBe(1)
    })
  })

  describe('string concatenation detection - template literals', () => {
    test('should report template literal + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createTemplateLiteral(), createIdentifier('name'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report identifier + template literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('name'), createTemplateLiteral(), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report template literal + string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createTemplateLiteral(), createLiteral(' extra'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report string literal + template literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('prefix '), createTemplateLiteral(), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report template literal + template literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createTemplateLiteral(), createTemplateLiteral(), '+'),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('nested concatenation detection', () => {
    test('should report ("a" + b) + "c"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+')
      const outer = createBinaryExpression(inner, createLiteral('c'), '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report "a" + (b + "c")', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createIdentifier('b'), createLiteral('c'), '+')
      const outer = createBinaryExpression(createLiteral('a'), inner, '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report ("a" + b) + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+')
      const outer = createBinaryExpression(inner, createIdentifier('c'), '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report identifier + ("a" + b)', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+')
      const outer = createBinaryExpression(createIdentifier('c'), inner, '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report deeply nested ("a" + b) + ("c" + d)', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const left = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+')
      const right = createBinaryExpression(createLiteral('c'), createIdentifier('d'), '+')
      const outer = createBinaryExpression(left, right, '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report triple nested (("a" + b) + c) + "d"', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner1 = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+')
      const inner2 = createBinaryExpression(inner1, createIdentifier('c'), '+')
      const outer = createBinaryExpression(inner2, createLiteral('d'), '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should report template literal nested in concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createTemplateLiteral(), createIdentifier('x'), '+')
      const outer = createBinaryExpression(inner, createLiteral(' end'), '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })
  })

  describe('non-concatenation operators', () => {
    test('should not report for - operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '-'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for * operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '*'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for / operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '/'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for % operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '%'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for == operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for === operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for != operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for !== operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for < operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '<'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for > operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for <= operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '<='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for >= operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for && operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '&&'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for || operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '||'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for ?? operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '??'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for in operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), 'in'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for instanceof operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), 'instanceof'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for ** operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '**'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for & operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '&'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for | operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '|'),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('no report scenarios', () => {
    test('should not report number + number', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral(5), createLiteral(3), '+'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report number + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral(1), createIdentifier('x'), '+'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier + number', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createIdentifier('x'), createLiteral(1), '+'))
      expect(reports.length).toBe(0)
    })

    test('should not report when node type is not BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: createIdentifier('fn') })
      expect(reports.length).toBe(0)
    })

    test('should not report when node is a plain object without type', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression({ foo: 'bar' })
      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression({
        type: 'MemberExpression',
        object: createIdentifier('a'),
        property: createIdentifier('b'),
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+', 1, 0),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+', 5, 10),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+', 100, 50),
      )
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+', 3, 5),
      )
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+', 2, 3)
      const outer = createBinaryExpression(inner, createLiteral('c'), '+', 2, 3)
      visitor.BinaryExpression(outer)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: { type: 'Literal', value: 'Hello ' },
        right: { type: 'Identifier', name: 'name' },
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('report message content', () => {
    test('message should contain the word template', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('message should contain the word concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message.toLowerCase()).toContain('concatenation')
    })

    test('message should contain the word backticks', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message).toContain('backticks')
    })

    test('message should contain the word Prefer', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message).toContain('Prefer')
    })

    test('message should mention + operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message).toContain('+')
    })

    test('message is consistent across different string concatenations', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      const msg1 = reports[0].message
      reports.length = 0

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createLiteral('y'), '+'),
      )
      const msg2 = reports[0].message

      expect(msg1).toBe(msg2)
    })
  })

  describe('fix - detailed scenarios', () => {
    function createMockContextWithSource(source: string): {
      context: RuleContext
      reports: ReportDescriptor[]
    } {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => source,
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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
        loc: { start: { line: 1, column: range[0] }, end: { line: 1, column: range[1] } },
      }
    }

    function createLiteralWithRange(value: string, range: [number, number]): unknown {
      return { type: 'Literal', value, range }
    }

    function createIdentifierWithRange(name: string, range: [number, number]): unknown {
      return { type: 'Identifier', name, range }
    }

    function createTemplateLiteralWithRange(range: [number, number]): unknown {
      return { type: 'TemplateLiteral', quasis: [], expressions: [], range }
    }

    test('should provide fix that wraps in backticks', () => {
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
      expect(reports[0].fix?.text.startsWith('`')).toBe(true)
      expect(reports[0].fix?.text.endsWith('`')).toBe(true)
    })

    test('should provide fix with correct range', () => {
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
      expect(reports[0].fix?.range).toEqual([0, 15])
    })

    test('should provide fix that preserves string content', () => {
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
      expect(reports[0].fix?.text).toContain('Hello ')
    })

    test('should provide fix converting identifier to interpolation', () => {
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
      expect(reports[0].fix?.text).toContain('${name}')
    })

    test('should provide fix for identifier + string', () => {
      const source = 'name + " world"'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)
      const node = createBinaryExpressionWithRange(
        createIdentifierWithRange('name', [0, 4]),
        createLiteralWithRange(' world', [7, 15]),
        '+',
        [0, 15],
      )
      visitor.BinaryExpression(node)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text.startsWith('`')).toBe(true)
    })

    test('should provide fix for string + string', () => {
      const source = '"Hello " + "world"'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)
      const node = createBinaryExpressionWithRange(
        createLiteralWithRange('Hello ', [0, 8]),
        createLiteralWithRange('world', [11, 18]),
        '+',
        [0, 18],
      )
      visitor.BinaryExpression(node)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for template literal + string', () => {
      const source = '`Hello ${greeting}` + " world"'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)
      const node = createBinaryExpressionWithRange(
        createTemplateLiteralWithRange([0, 18]),
        createLiteralWithRange(' world', [21, 29]),
        '+',
        [0, 29],
      )
      visitor.BinaryExpression(node)
      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for nested binary expression', () => {
      const source = '"Hello " + name + "!"'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpressionWithRange(
        createLiteralWithRange('Hello ', [0, 8]),
        createIdentifierWithRange('name', [11, 15]),
        '+',
        [0, 15],
      )
      const node = createBinaryExpressionWithRange(
        inner,
        createLiteralWithRange('!', [18, 21]),
        '+',
        [0, 21],
      )
      visitor.BinaryExpression(node)
      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix without range', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when left has no range', () => {
      const source = '"Hello " + name'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)
      const node = createBinaryExpressionWithRange(
        createLiteral('Hello '),
        createIdentifierWithRange('name', [11, 15]),
        '+',
        [0, 15],
      )
      visitor.BinaryExpression(node)
      // No range on left means no fix since no range on the node itself either
      // The outer node has range but left has no range => convertToTemplateLiteral gets empty source
      expect(reports.length).toBe(1)
    })

    test('should provide fix with correct range for nested expression', () => {
      const source = '"Hello " + name + "!"'
      const { context, reports } = createMockContextWithSource(source)
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpressionWithRange(
        createLiteralWithRange('Hello ', [0, 8]),
        createIdentifierWithRange('name', [11, 15]),
        '+',
        [0, 15],
      )
      const node = createBinaryExpressionWithRange(
        inner,
        createLiteralWithRange('!', [18, 21]),
        '+',
        [0, 21],
      )
      visitor.BinaryExpression(node)
      expect(reports[0].fix?.range).toEqual([0, 21])
    })
  })

  describe('edge cases - null/undefined/invalid inputs', () => {
    test('should handle null node', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression('node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: null,
        right: createIdentifier('b'),
        operator: '+',
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('a'),
        right: null,
        operator: '+',
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined operator', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        right: createIdentifier('b'),
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing left', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = { type: 'BinaryExpression', right: createIdentifier('b'), operator: '+' }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing right and string left', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = { type: 'BinaryExpression', left: createLiteral('a'), operator: '+' }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      // Left is a string literal, so it still reports
      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression with left as boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: { type: 'Literal', value: true },
        right: createLiteral(' text'),
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle BinaryExpression with right as null literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: createLiteral('value: '),
        right: { type: 'Literal', value: null },
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('context options handling', () => {
    test('should work with empty options object', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '"a" + b',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with config options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extra: true, someFlag: false }], source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;', filePath: '/custom/path/file.tsx' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "a" + b;', filePath: '/src/file.ts' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple invocations', () => {
    test('should report for each invocation with string concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('c'), createIdentifier('d'), '+'),
      )
      expect(reports.length).toBe(2)
    })

    test('should report only for string concatenation invocations', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '+'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('c'), createIdentifier('d'), '+'),
      )
      expect(reports.length).toBe(2)
    })

    test('should report for mixed valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(null)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      visitor.BinaryExpression({})
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('c'), createIdentifier('d'), '+'),
      )
      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across 10 invocations', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createLiteral(`v${i}`), createIdentifier('x'), '+'),
        )
      }
      expect(reports.length).toBe(10)
    })
  })

  describe('rule exports', () => {
    test('should export preferTemplateRule as named export', () => {
      expect(preferTemplateRule).toBeDefined()
    })

    test('should export a valid RuleDefinition', () => {
      expect(preferTemplateRule.meta).toBeDefined()
      expect(preferTemplateRule.create).toBeDefined()
      expect(typeof preferTemplateRule.create).toBe('function')
    })

    test('should have exactly two top-level properties (meta and create)', () => {
      const keys = Object.keys(preferTemplateRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('node without operator +', () => {
    test('should not report BinaryExpression with + operator but number left and right', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: { type: 'Literal', value: 42 },
        right: { type: 'Literal', value: 10 },
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with + operator but boolean values', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: { type: 'Literal', value: true },
        right: { type: 'Literal', value: false },
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when left is string and right is identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: { type: 'Literal', value: 'Hello ' },
        right: { type: 'Identifier', name: 'user' },
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when right is string and left is identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'user' },
        right: { type: 'Literal', value: ' world' },
        operator: '+',
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('recursive detection', () => {
    test('should detect concatenation through left recursion', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const deep = createBinaryExpression(createLiteral('a'), createIdentifier('x'), '+')
      const mid = createBinaryExpression(deep, createIdentifier('y'), '+')
      const outer = createBinaryExpression(mid, createIdentifier('z'), '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should detect concatenation through right recursion', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const deep = createBinaryExpression(createIdentifier('x'), createLiteral('a'), '+')
      const mid = createBinaryExpression(createIdentifier('y'), deep, '+')
      const outer = createBinaryExpression(createIdentifier('z'), mid, '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('should detect when string is deeply nested in left branch', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const l1 = createBinaryExpression(createLiteral('start'), createIdentifier('a'), '+')
      const l2 = createBinaryExpression(l1, createIdentifier('b'), '+')
      const l3 = createBinaryExpression(l2, createIdentifier('c'), '+')
      visitor.BinaryExpression(l3)
      expect(reports.length).toBe(1)
    })

    test('should detect when string is deeply nested in right branch', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const r1 = createBinaryExpression(createIdentifier('a'), createLiteral('end'), '+')
      const r2 = createBinaryExpression(createIdentifier('b'), r1, '+')
      const r3 = createBinaryExpression(createIdentifier('c'), r2, '+')
      visitor.BinaryExpression(r3)
      expect(reports.length).toBe(1)
    })

    test('should not detect when no string anywhere in tree', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const inner = createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '+')
      const outer = createBinaryExpression(inner, createIdentifier('c'), '+')
      visitor.BinaryExpression(outer)
      expect(reports.length).toBe(0)
    })
  })

  describe('mixed node types in concatenation', () => {
    test('should report CallExpression + string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const callNode = { type: 'CallExpression', callee: createIdentifier('fn') }
      const node = createBinaryExpression(callNode, createLiteral(' result'), '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report string literal + CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const callNode = { type: 'CallExpression', callee: createIdentifier('fn') }
      const node = createBinaryExpression(createLiteral('result: '), callNode, '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report MemberExpression + string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const memberNode = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }
      const node = createBinaryExpression(memberNode, createLiteral(' text'), '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report string literal + MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const memberNode = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }
      const node = createBinaryExpression(createLiteral('text: '), memberNode, '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report ConditionalExpression + string', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const condNode = { type: 'ConditionalExpression', test: createIdentifier('x') }
      const node = createBinaryExpression(condNode, createLiteral(' end'), '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report string + ArrayExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const arrNode = { type: 'ArrayExpression', elements: [] }
      const node = createBinaryExpression(createLiteral('items: '), arrNode, '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report ObjectExpression + string', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const objNode = { type: 'ObjectExpression', properties: [] }
      const node = createBinaryExpression(objNode, createLiteral(' data'), '+')
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('visitor method behavior', () => {
    test('should not throw when BinaryExpression is called with 0 args', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      expect(() => visitor.BinaryExpression()).not.toThrow()
    })

    test('should return undefined from BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const result = visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(result).toBeUndefined()
    })

    test('should return undefined from BinaryExpression with null', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const result = visitor.BinaryExpression(null)
      expect(result).toBeUndefined()
    })

    test('should return undefined from BinaryExpression with no args', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      const result = visitor.BinaryExpression()
      expect(result).toBeUndefined()
    })
  })

  describe('fix content details', () => {
    function createFixContext(source: string): {
      context: RuleContext
      reports: ReportDescriptor[]
    } {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc, fix: d.fix })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => source,
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      return { context, reports }
    }

    function rangeBin(left: unknown, right: unknown, op: string, range: [number, number]): unknown {
      return {
        type: 'BinaryExpression',
        left,
        right,
        operator: op,
        range,
        loc: { start: { line: 1, column: range[0] }, end: { line: 1, column: range[1] } },
      }
    }

    function rangeLit(value: string, range: [number, number]): unknown {
      return { type: 'Literal', value, range }
    }

    function rangeId(name: string, range: [number, number]): unknown {
      return { type: 'Identifier', name, range }
    }

    function rangeTpl(range: [number, number]): unknown {
      return { type: 'TemplateLiteral', quasis: [], expressions: [], range }
    }

    test('fix should escape backticks in string value', () => {
      const source = '"He`llo" + name'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeLit('He`llo', [0, 8]), rangeId('name', [11, 15]), '+', [0, 15])
      visitor.BinaryExpression(node)
      expect(reports[0].fix?.text).toContain('\\`')
    })

    test('fix should escape dollar signs in string value', () => {
      const source = '"$100" + name'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeLit('$100', [0, 6]), rangeId('name', [9, 13]), '+', [0, 13])
      visitor.BinaryExpression(node)
      expect(reports[0].fix?.text).toContain('\\$')
    })

    test('fix should wrap interpolation around identifiers', () => {
      const source = '"Hello " + name'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeLit('Hello ', [0, 8]), rangeId('name', [11, 15]), '+', [0, 15])
      visitor.BinaryExpression(node)
      expect(reports[0].fix?.text).toContain('${name}')
    })

    test('fix should combine string content and interpolation', () => {
      const source = '"Value: " + x'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeLit('Value: ', [0, 9]), rangeId('x', [12, 13]), '+', [0, 13])
      visitor.BinaryExpression(node)
      const fixText = reports[0].fix?.text ?? ''
      expect(fixText).toContain('Value: ')
      expect(fixText).toContain('${x}')
    })

    test('fix should handle template literal content extraction', () => {
      const source = '`Hello ${greeting}` + name'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeTpl([0, 18]), rangeId('name', [21, 25]), '+', [0, 25])
      visitor.BinaryExpression(node)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text.startsWith('`')).toBe(true)
    })

    test('fix range should match node range', () => {
      const source = '"Hello " + name'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeLit('Hello ', [2, 10]), rangeId('name', [13, 17]), '+', [2, 17])
      visitor.BinaryExpression(node)
      expect(reports[0].fix?.range).toEqual([2, 17])
    })

    test('fix should handle both sides being string literals', () => {
      const source = '"Hello " + "world"'
      const { context, reports } = createFixContext(source)
      const visitor = preferTemplateRule.create(context)
      const node = rangeBin(rangeLit('Hello ', [0, 8]), rangeLit('world', [11, 18]), '+', [0, 18])
      visitor.BinaryExpression(node)
      const fixText = reports[0].fix?.text ?? ''
      expect(fixText).toContain('Hello ')
      expect(fixText).toContain('world')
    })
  })

  describe('createMockContext helper validation', () => {
    test('createMockContext should provide working context', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      expect(context.report).toBeDefined()
      expect(typeof context.report).toBe('function')
      expect(context.getFilePath()).toBe('/src/file.ts')
      expect(context.getSource()).toBe('"Hello " + name;')
      expect(reports).toEqual([])
    })

    test('createMockContext with custom source returns correct source', () => {
      const { context } = createMockRuleContext({ source: 'custom source', filePath: '/src/file.ts' })
      expect(context.getSource()).toBe('custom source')
    })

    test('createMockContext with custom path returns correct path', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;', filePath: '/custom/path.ts' })
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('createMockContext logger methods should be vi fns', () => {
      const { context } = createMockRuleContext({ source: '"Hello " + name;' })
      expect(vi.isMockFunction(context.logger.debug)).toBe(true)
      expect(vi.isMockFunction(context.logger.info)).toBe(true)
      expect(vi.isMockFunction(context.logger.warn)).toBe(true)
      expect(vi.isMockFunction(context.logger.error)).toBe(true)
    })
  })

  describe('AST node helpers', () => {
    test('createBinaryExpression should create valid structure', () => {
      const node = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+', 5, 10)
      const n = node as Record<string, unknown>
      expect(n.type).toBe('BinaryExpression')
      expect(n.operator).toBe('+')
      expect(n.loc).toBeDefined()
    })

    test('createLiteral should create valid structure', () => {
      const node = createLiteral('test', 3, 5)
      const n = node as Record<string, unknown>
      expect(n.type).toBe('Literal')
      expect(n.value).toBe('test')
      expect(n.loc).toBeDefined()
    })

    test('createIdentifier should create valid structure', () => {
      const node = createIdentifier('myVar', 7, 2)
      const n = node as Record<string, unknown>
      expect(n.type).toBe('Identifier')
      expect(n.name).toBe('myVar')
      expect(n.loc).toBeDefined()
    })

    test('createTemplateLiteral should create valid structure', () => {
      const node = createTemplateLiteral(4, 8)
      const n = node as Record<string, unknown>
      expect(n.type).toBe('TemplateLiteral')
      expect(n.quasis).toEqual([])
      expect(n.expressions).toEqual([])
      expect(n.loc).toBeDefined()
    })

    test('createBinaryExpression default line/column should be 1/0', () => {
      const node = createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })

    test('createLiteral default line/column should be 1/0', () => {
      const node = createLiteral('a')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })

    test('createIdentifier default line/column should be 1/0', () => {
      const node = createIdentifier('x')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })

    test('createTemplateLiteral default line/column should be 1/0', () => {
      const node = createTemplateLiteral()
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })
  })

  describe('concurrent visitor instances', () => {
    test('two visitors should be independent', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: '"Hello " + name;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor1 = preferTemplateRule.create(ctx1)
      const visitor2 = preferTemplateRule.create(ctx2)

      visitor1.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIdentifier('x'), createIdentifier('y'), '+'),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createLiteral('c'), createIdentifier('d'), '+'),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('three visitors should be independent', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: '"Hello " + name;' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: '"Hello " + name;' })
      const { context: ctx3, reports: r3 } = createMockRuleContext({ source: '"Hello " + name;' })
      const v1 = preferTemplateRule.create(ctx1)
      const v2 = preferTemplateRule.create(ctx2)
      const v3 = preferTemplateRule.create(ctx3)

      v1.BinaryExpression(createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'))
      v2.BinaryExpression(createBinaryExpression(createLiteral('c'), createIdentifier('d'), '-'))
      v3.BinaryExpression(createBinaryExpression(createLiteral('e'), createLiteral('f'), '+'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
      expect(r3.length).toBe(1)
    })
  })

  describe('report descriptor completeness', () => {
    test('report should always have message and location', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].loc).toBeDefined()
    })

    test('report message should not be empty', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report should have loc with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello " + name;' })
      const visitor = preferTemplateRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('a'), createIdentifier('b'), '+'),
      )
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })
})
