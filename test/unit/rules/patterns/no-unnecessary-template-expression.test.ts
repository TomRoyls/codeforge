import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryTemplateExpressionRule } from '../../../../src/rules/patterns/no-unnecessary-template-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const s = `hello`;',
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

function createTemplateLiteral(
  quasis: { raw: string; cooked?: string }[],
  expressions: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: quasis.map((q) => ({
      type: 'TemplateElement',
      value: {
        raw: q.raw,
        cooked: q.cooked ?? q.raw,
      },
      tail: true,
    })),
    expressions,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-unnecessary-template-expression rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.schema).toBeDefined()
    })

    test('should be fixable with code', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.fixable).toBe('code')
    })

    test('should mention template literal in description', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'template',
      )
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryTemplateExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })
  })

  describe('detecting unnecessary template literals', () => {
    test('should report simple string template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should report empty template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with only text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'some text here' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '12345' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '   ' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: '!@#$%^&*()' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with URL-safe characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'path/to/file' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal with dashes and underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'my-variable_name' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting necessary template literals', () => {
    test('should not report template literal with interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: 'Hello ', cooked: 'Hello ' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('name')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multi-line content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'line1\nline2' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with newline escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const stringWithNewline = 'line1' + '\n' + 'line2'
      const node = createTemplateLiteral([{ raw: stringWithNewline }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with single quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: "it's" }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with double quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'say "hello"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with both quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'it\'s "quoted"' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with carriage return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'line1\rline2' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report template literal with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral(
        [
          { raw: '', cooked: '' },
          { raw: ' and ', cooked: ' and ' },
          { raw: '', cooked: '' },
        ],
        [createIdentifier('a'), createIdentifier('b')],
      )
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral('string')).not.toThrow()
      expect(() => visitor.TemplateLiteral(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test', cooked: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }], [], 42, 15)
      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }])
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without expressions array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle tagged template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: createIdentifier('tag'),
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'a' }, tail: false },
          { type: 'TemplateElement', value: { raw: 'b' }, tail: true },
        ],
        expressions: [createIdentifier('x')],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should mention template literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should include suggestion with the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'hello' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"hello"')
    })

    test('should suggest using regular string syntax', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = createTemplateLiteral([{ raw: 'test' }])
      visitor.TemplateLiteral(node)

      expect(reports[0].message).toContain('"test"')
    })
  })

  describe('additional edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 1, column: 'not-a-number' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle quasi without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: null, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi with non-string raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 123 as unknown as string }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasi as non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: ['not-an-object' as unknown],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle expressions as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: null,
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle quasis as empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle quasis with multiple elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'a' }, tail: false },
          { type: 'TemplateElement', value: { raw: 'b' }, tail: true },
        ],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
        loc: {},
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle template literal with undefined tag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        tag: undefined,
        quasis: [{ type: 'TemplateElement', value: { raw: 'test' }, tail: true }],
        expressions: [],
      }

      expect(() => visitor.TemplateLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
