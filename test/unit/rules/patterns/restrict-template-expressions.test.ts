import { describe, test, expect, vi } from 'vitest'
import { restrictTemplateExpressionsRule } from '../../../../src/rules/patterns/restrict-template-expressions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = `${y}`;',
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

function createTemplateLiteral(expressions: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    expressions,
    quasis: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
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

function createNumberLiteral(value: number, line = 1, column = 0): unknown {
  const length = String(value).length
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + length },
    },
  }
}

function createStringLiteral(value: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + value.length },
    },
  }
}

function createBooleanLiteral(value: boolean, line = 1, column = 0): unknown {
  const length = String(value).length
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + length },
    },
  }
}

function createNullLiteral(line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 4 },
    },
  }
}

function createCallExpression(callee: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createBinaryExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('restrict-template-expressions rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(restrictTemplateExpressionsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(restrictTemplateExpressionsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(restrictTemplateExpressionsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(restrictTemplateExpressionsRule.meta.fixable).toBeUndefined()
    })

    test('should mention template in description', () => {
      expect(restrictTemplateExpressionsRule.meta.docs?.description.toLowerCase()).toContain(
        'template',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })
  })

  describe('detecting non-string expressions', () => {
    test('should report identifier in template', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'x'")
    })

    test('should report number literal in template by default', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number literal')
    })

    test('should report boolean literal in template by default', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean literal')
    })

    test('should report null in template by default', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report call expression in template', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createCallExpression(createIdentifier('fn'))])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function call')
    })

    test('should report binary expression in template', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createBinaryExpression(createIdentifier('a'), createIdentifier('b')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('binary expression')
    })

    test('should not report string literal in template', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createStringLiteral('hello')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report multiple non-string expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createIdentifier('x'),
        createNumberLiteral(42),
        createCallExpression(createIdentifier('fn')),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })
  })

  describe('options - allowNumber', () => {
    test('should allow number literals when option is true', () => {
      const { context, reports } = createMockContext({ allowNumber: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNumberLiteral(42)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowNumber is true', () => {
      const { context, reports } = createMockContext({ allowNumber: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowBoolean', () => {
    test('should allow boolean literals when option is true', () => {
      const { context, reports } = createMockContext({ allowBoolean: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createBooleanLiteral(true)])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowBoolean is true', () => {
      const { context, reports } = createMockContext({ allowBoolean: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowNull', () => {
    test('should allow null when option is true', () => {
      const { context, reports } = createMockContext({ allowNull: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createNullLiteral()])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowNull is true', () => {
      const { context, reports } = createMockContext({ allowNull: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowUndefined', () => {
    test('should allow undefined when option is true', () => {
      const { context, reports } = createMockContext({ allowUndefined: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('undefined')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report other types when allowUndefined is true', () => {
      const { context, reports } = createMockContext({ allowUndefined: true })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple options', () => {
    test('should allow multiple types when multiple options are true', () => {
      const { context, reports } = createMockContext({
        allowNumber: true,
        allowBoolean: true,
        allowNull: true,
        allowUndefined: true,
      })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createBooleanLiteral(true),
        createNullLiteral(),
        createIdentifier('undefined'),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should still report disallowed types with mixed options', () => {
      const { context, reports } = createMockContext({
        allowNumber: true,
        allowBoolean: true,
      })
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        createNumberLiteral(42),
        createIdentifier('x'),
        createBooleanLiteral(true),
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("identifier 'x'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() => visitor.TemplateLiteral('string')).not.toThrow()
      expect(() => visitor.TemplateLiteral(123)).not.toThrow()
    })

    test('should handle template without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle template with undefined expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: undefined as unknown as unknown[],
        quasis: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: [createIdentifier('x')],
        quasis: [],
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const expr = createIdentifier('x', 10, 5)
      const node = createTemplateLiteral([expr], 10, 0)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

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
        getSource: () => 'const x = `${y}`;',
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

      const visitor = restrictTemplateExpressionsRule.create(context)

      expect(() =>
        visitor.TemplateLiteral(createTemplateLiteral([createIdentifier('x')])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention string conversion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('string')
    })

    test('should mention template literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should include expression type in message', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([createIdentifier('myVar')])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain("identifier 'myVar'")
    })
  })

  describe('getExpressionDescription edge cases', () => {
    test('should describe member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: { type: 'Identifier', name: 'prop' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('property')
    })

    test('should describe expression without type', () => {
      const { context, reports } = createMockContext()
      const visitor = restrictTemplateExpressionsRule.create(context)

      const node = createTemplateLiteral([
        {
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })
})
