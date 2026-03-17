import { describe, test, expect, vi } from 'vitest'
import { noIrregularWhitespaceRule } from '../../../../src/rules/patterns/no-irregular-whitespace.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'const x = "test";',
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

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createTemplateLiteral(quasis: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions: [],
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createQuasi(value: Record<string, unknown>, line = 1, column = 0): unknown {
  return {
    type: 'TemplateElement',
    value,
    tail: true,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

describe('no-irregular-whitespace rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noIrregularWhitespaceRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noIrregularWhitespaceRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noIrregularWhitespaceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noIrregularWhitespaceRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention irregular whitespace in description', () => {
      expect(noIrregularWhitespaceRule.meta.docs?.description.toLowerCase()).toContain('irregular')
      expect(noIrregularWhitespaceRule.meta.docs?.description.toLowerCase()).toContain('whitespace')
    })

    test('should have empty schema', () => {
      expect(noIrregularWhitespaceRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noIrregularWhitespaceRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('should return visitor with TemplateLiteral method', () => {
      const { context } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      expect(visitor).toHaveProperty('TemplateLiteral')
    })
  })

  describe('literal nodes - valid cases', () => {
    test('should not report normal space', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello world'))

      expect(reports.length).toBe(0)
    })

    test('should not report tab character', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\tworld'))

      expect(reports.length).toBe(0)
    })

    test('should not report newline character', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\nworld'))

      expect(reports.length).toBe(0)
    })

    test('should not report carriage return', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\rworld'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral(42))
      visitor.Literal(createLiteral(true))
      visitor.Literal(createLiteral(null))

      expect(reports.length).toBe(0)
    })

    test('should not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should not report string with only regular whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral(' \t\n\r'))

      expect(reports.length).toBe(0)
    })
  })

  describe('literal nodes - invalid cases', () => {
    test('should report vertical tab (\\u000B)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u000Bworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report form feed (\\u000C)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u000Cworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report non-breaking space (\\u00A0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u00A0world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report next line (\\u0085)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u0085world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report ogham space mark (\\u1680)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u1680world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report mongolian vowel separator (\\u180E)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u180Eworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report en quad (\\u2000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u2000world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report en space (\\u2002)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u2002world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report em space (\\u2003)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u2003world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report thin space (\\u2009)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u2009world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report hair space (\\u200A)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u200Aworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report zero width space (\\u200B)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u200Bworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report line separator (\\u2028)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u2028world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report paragraph separator (\\u2029)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u2029world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report narrow no-break space (\\u202F)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u202Fworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report medium mathematical space (\\u205F)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u205Fworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report ideographic space (\\u3000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u3000world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report zero width no-break space (\\uFEFF)', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\uFEFFworld'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report multiple irregular whitespace characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u00A0\u2000\u3000world'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u00A0world', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('template literal nodes - valid cases', () => {
    test('should not report template with regular whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello world', cooked: 'hello world' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })

    test('should not report template with tabs and newlines', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello\t\nworld', cooked: 'hello\t\nworld' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })

    test('should not report empty template', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: '', cooked: '' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })

    test('should not report template with only regular whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: ' \t\n\r', cooked: ' \t\n\r' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })
  })

  describe('template literal nodes - invalid cases', () => {
    test('should report template with non-breaking space', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report template with zero width space', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello\u200Bworld', cooked: 'hello\u200Bworld' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report template with ideographic space', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello\u3000world', cooked: 'hello\u3000world' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report template with line separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello\u2028world', cooked: 'hello\u2028world' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should report multiple quasis with irregular whitespace', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [
        createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' }, 1, 0),
        createQuasi({ raw: 'test\u2000data', cooked: 'test\u2000data' }, 1, 20),
      ]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(2)
    })

    test('should report correct location for template', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' }, 5, 10)]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in Literal', () => {
      const { context } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in Literal', () => {
      const { context } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in TemplateLiteral', () => {
      const { context } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in TemplateLiteral', () => {
      const { context } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const node = { type: 'Literal', value: 'hello\u00A0world' }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const node = { type: 'Identifier', name: 'test' }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TemplateLiteral without quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const node = { type: 'TemplateLiteral', expressions: [] }
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle quasi without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [{ type: 'TemplateElement', tail: true }]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })

    test('should handle quasi with value without raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ cooked: 'test' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })

    test('should handle non-TemplateLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const node = { type: 'Literal', value: 'test' }
      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle string literal that is not a string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral(123))
      visitor.Literal(createLiteral(true))
      visitor.Literal(createLiteral(null))
      visitor.Literal(createLiteral(undefined))

      expect(reports.length).toBe(0)
    })

    test('should handle empty string value correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should handle non-string value type', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const node = { type: 'Literal', value: {} }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle raw undefined in quasi', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [createQuasi({ raw: undefined, cooked: 'test' })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid template quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      const quasis = [
        createQuasi({ raw: 'hello world', cooked: 'hello world' }, 1, 0),
        createQuasi({ raw: 'test\u00A0data', cooked: 'test\u00A0data' }, 1, 20),
        createQuasi({ raw: 'normal text', cooked: 'normal text' }, 1, 40),
      ]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should report correct message for literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u00A0world'))

      expect(reports[0].message).toBe('Irregular whitespace found.')
    })

    test('should mention irregular in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u00A0world'))

      expect(reports[0].message.toLowerCase()).toContain('irregular')
    })

    test('should mention whitespace in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noIrregularWhitespaceRule.create(context)

      visitor.Literal(createLiteral('hello\u00A0world'))

      expect(reports[0].message.toLowerCase()).toContain('whitespace')
    })
  })
})
