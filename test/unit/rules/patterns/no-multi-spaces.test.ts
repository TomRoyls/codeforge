import { describe, test, expect, vi } from 'vitest'
import { noMultiSpacesRule } from '../../../../src/rules/patterns/no-multi-spaces.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = "test";',
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

describe('no-multi-spaces rule', () => {
  describe('meta properties', () => {
    test('has correct type', () => {
      expect(noMultiSpacesRule.meta.type).toBe('suggestion')
    })

    test('has correct severity', () => {
      expect(noMultiSpacesRule.meta.severity).toBe('warn')
    })

    test('has correct category', () => {
      expect(noMultiSpacesRule.meta.docs?.category).toBe('style')
    })

    test('has correct recommended flag', () => {
      expect(noMultiSpacesRule.meta.docs?.recommended).toBe(false)
    })

    test('has correct fixable property', () => {
      expect(noMultiSpacesRule.meta.fixable).toBe('whitespace')
    })

    test('has description', () => {
      expect(noMultiSpacesRule.meta.docs?.description).toBe(
        'Disallow multiple spaces except for indentation. Multiple spaces can be confusing and may indicate errors.',
      )
    })

    test('has correct url', () => {
      expect(noMultiSpacesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-multi-spaces',
      )
    })
  })

  describe('create() method', () => {
    test('returns visitor object', () => {
      const { context } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })

    test('visitor has Literal method', () => {
      const { context } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor.Literal).toBeDefined()
      expect(typeof visitor.Literal).toBe('function')
    })

    test('visitor has TemplateElement method', () => {
      const { context } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor.TemplateElement).toBeDefined()
      expect(typeof visitor.TemplateElement).toBe('function')
    })
  })

  describe('Literal visitor - detecting multiple spaces', () => {
    test('reports multiple spaces in string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Multiple spaces found in string literal.')
    })

    test('reports multiple spaces at start of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '  hello',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Multiple spaces found in string literal.')
    })

    test('reports multiple spaces at end of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  ',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Multiple spaces found in string literal.')
    })

    test('reports multiple spaces with more than 2 spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello    world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Multiple spaces found in string literal.')
    })
  })

  describe('Literal visitor - not reporting', () => {
    test('does not report single spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report newlines only', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello\nworld',
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report numeric literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 123,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report boolean literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('Literal visitor - edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal(null)

      expect(reports).toHaveLength(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal(undefined)

      expect(reports).toHaveLength(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 1, column: 1 } })
    })
  })

  describe('TemplateElement visitor - detecting multiple spaces', () => {
    test('reports multiple spaces in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Multiple spaces found in template literal.')
    })

    test('reports multiple spaces at start of template element', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: '  hello', cooked: '  hello' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports multiple spaces at end of template element', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  ', cooked: 'hello  ' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('TemplateElement visitor - not reporting', () => {
    test('does not report single spaces in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello world', cooked: 'hello world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report newlines in template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello\nworld', cooked: 'hello\nworld' },
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('TemplateElement visitor - edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement(null)

      expect(reports).toHaveLength(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement(undefined)

      expect(reports).toHaveLength(0)
    })

    test('handles node without value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 1, column: 1 } })
    })
  })
})
