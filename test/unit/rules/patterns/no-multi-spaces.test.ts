import { describe, test, expect, vi } from 'vitest'
import { noMultiSpacesRule } from '../../../../src/rules/patterns/no-multi-spaces.js'
import noMultiSpacesRuleDefault from '../../../../src/rules/patterns/no-multi-spaces.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

    test('has empty schema array', () => {
      expect(noMultiSpacesRule.meta.schema).toEqual([])
    })

    test('meta.type is a string', () => {
      expect(typeof noMultiSpacesRule.meta.type).toBe('string')
    })

    test('meta.severity is a string', () => {
      expect(typeof noMultiSpacesRule.meta.severity).toBe('string')
    })

    test('meta.fixable is a string', () => {
      expect(typeof noMultiSpacesRule.meta.fixable).toBe('string')
    })

    test('meta.docs is defined', () => {
      expect(noMultiSpacesRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description is a string', () => {
      expect(typeof noMultiSpacesRule.meta.docs?.description).toBe('string')
    })

    test('meta.docs.category is a string', () => {
      expect(typeof noMultiSpacesRule.meta.docs?.category).toBe('string')
    })

    test('meta.docs.recommended is a boolean', () => {
      expect(typeof noMultiSpacesRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.docs.url is a string', () => {
      expect(typeof noMultiSpacesRule.meta.docs?.url).toBe('string')
    })

    test('meta.deprecated is not true', () => {
      expect(noMultiSpacesRule.meta.deprecated).not.toBe(true)
    })

    test('meta.requiresTypeChecking is not true', () => {
      expect(noMultiSpacesRule.meta.requiresTypeChecking).not.toBe(true)
    })

    test('meta.replacedBy is undefined or empty', () => {
      expect(noMultiSpacesRule.meta.replacedBy).toBeFalsy()
    })

    test('meta.type is one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noMultiSpacesRule.meta.type)
    })

    test('meta.severity is one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noMultiSpacesRule.meta.severity)
    })

    test('meta.fixable is one of valid fixable values', () => {
      expect(['code', 'whitespace']).toContain(noMultiSpacesRule.meta.fixable)
    })

    test('meta.schema is an array', () => {
      expect(Array.isArray(noMultiSpacesRule.meta.schema)).toBe(true)
    })
  })

  describe('create() method', () => {
    test('returns visitor object', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor).toBeDefined()
      expect(typeof visitor).toBe('object')
    })

    test('visitor has Literal method', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor.Literal).toBeDefined()
      expect(typeof visitor.Literal).toBe('function')
    })

    test('visitor has TemplateElement method', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor.TemplateElement).toBeDefined()
      expect(typeof visitor.TemplateElement).toBe('function')
    })

    test('create is a function', () => {
      expect(typeof noMultiSpacesRule.create).toBe('function')
    })

    test('visitor has exactly 2 methods', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('visitor keys are Literal and TemplateElement', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(Object.keys(visitor)).toEqual(['Literal', 'TemplateElement'])
    })

    test('create returns a new visitor each time', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor1 = noMultiSpacesRule.create(context)
      const visitor2 = noMultiSpacesRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('create does not throw with minimal context', () => {
      const ctx = {
        report: vi.fn(),
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '',
      } as unknown as RuleContext

      expect(() => noMultiSpacesRule.create(ctx)).not.toThrow()
    })

    test('visitor is not null', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('Literal method takes one argument', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor.Literal.length).toBe(1)
    })

    test('TemplateElement method takes one argument', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      expect(visitor.TemplateElement.length).toBe(1)
    })
  })

  describe('Literal visitor - detecting multiple spaces', () => {
    test('reports multiple spaces in string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
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
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
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
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
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
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello    world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe('Multiple spaces found in string literal.')
    })

    test('reports exactly 2 spaces between words', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a  b',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports 3 spaces between words', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a   b',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports 5 spaces between words', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a     b',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports 10 spaces between words', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a          b',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces around punctuation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'foo  ,  bar',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces around equals sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'x  =  y',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports leading spaces followed by text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '   indented',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports trailing spaces after text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'trailing   ',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces in sentence with punctuation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'Hello,  world!  How are you?',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 32 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces with numbers in string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'item  1',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces around braces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '{  key  }',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'foo  &  bar',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces with unicode text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '日本語  中文',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces in path-like string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '/path  /to  /file',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces in SQL-like string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'SELECT  *  FROM  table',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 24 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces in alignment pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'name        age',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports string that is only spaces with a letter at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '     a',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports string that is only spaces with a letter at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a     ',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('Literal visitor - not reporting', () => {
    test('does not report single spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report newlines only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello\nworld',
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report numeric literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 123,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report boolean literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report string with no spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'helloworld',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report single character string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report string with only one space', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: ' ',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report string with tabs only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '\t\t\t',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report string with single space and newlines', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello\nworld\nfoo',
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report string with single spaces and newlines mixed', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'line1 word\nline2 word',
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 12 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report regex literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: /test/,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report string with carriage return only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello\r\nworld',
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report zero number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 0,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report negative number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: -42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report float number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 3.14,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report false boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report undefined value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('Literal visitor - edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal(null)

      expect(reports).toHaveLength(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal(undefined)

      expect(reports).toHaveLength(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 1, column: 1 } })
    })

    test('handles node as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({})

      expect(reports).toHaveLength(0)
    })

    test('handles node as number primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal(42)

      expect(reports).toHaveLength(0)
    })

    test('handles node as string primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal('not an object')

      expect(reports).toHaveLength(0)
    })

    test('handles node as boolean primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal(true)

      expect(reports).toHaveLength(0)
    })

    test('handles node with null value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles node with value as object instead of string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: { nested: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles node with value as array', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: ['hello', 'world'],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('handles loc with zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toEqual({ start: { line: 0, column: 0 }, end: { line: 0, column: 0 } })
    })

    test('handles loc with large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 500, column: 10 }, end: { line: 500, column: 26 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('handles loc with large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 999 }, end: { line: 1, column: 1015 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('handles multi-line loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 3, column: 5 }, end: { line: 4, column: 10 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('handles loc with partial start only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 2, column: 3 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        raw: '"hello  world"',
        parent: {},
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('TemplateElement visitor - detecting multiple spaces', () => {
    test('reports multiple spaces in template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
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
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: '  hello', cooked: '  hello' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports multiple spaces at end of template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  ', cooked: 'hello  ' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports 3 spaces in template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'a   b', cooked: 'a   b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports 5 spaces in template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'a     b', cooked: 'a     b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces in template with punctuation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'foo  ,  bar', cooked: 'foo  ,  bar' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces in template with numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'item  1  qty  5', cooked: 'item  1  qty  5' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports leading spaces in template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: '   indented text', cooked: '   indented text' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports trailing spaces in template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'text   ', cooked: 'text   ' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('reports spaces with unicode in template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  世界', cooked: 'hello  世界' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('TemplateElement visitor - not reporting', () => {
    test('does not report single spaces in template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello world', cooked: 'hello world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report newlines in template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello\nworld', cooked: 'hello\nworld' },
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report template element with no spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'helloworld', cooked: 'helloworld' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report template element with single space', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: ' ', cooked: ' ' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report template element with tabs only', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: '\t\t', cooked: '\t\t' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report template element with mixed newlines and single spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'line1\nline2 word\nline3', cooked: 'line1\nline2 word\nline3' },
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report template element with carriage returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'line1\r\nline2', cooked: 'line1\r\nline2' },
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })
  })

  describe('TemplateElement visitor - edge cases', () => {
    test('handles null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement(null)

      expect(reports).toHaveLength(0)
    })

    test('handles undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement(undefined)

      expect(reports).toHaveLength(0)
    })

    test('handles node without value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toEqual({ start: { line: 1, column: 0 }, end: { line: 1, column: 1 } })
    })

    test('handles node as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({})

      expect(reports).toHaveLength(0)
    })

    test('handles node as number primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement(42)

      expect(reports).toHaveLength(0)
    })

    test('handles node as string primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement('not an object')

      expect(reports).toHaveLength(0)
    })

    test('handles value as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles value as string instead of object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles value with empty raw string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: '', cooked: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles value with raw as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 42, cooked: '42' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles value with raw as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: undefined, cooked: 'hello' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles value with raw as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: null, cooked: 'hello' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('handles value object with no raw property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { cooked: 'hello' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('uses raw value not cooked for detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('reports when raw has multi-spaces even if cooked differs', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('handles loc with zero values on template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('handles loc with large line numbers on template element', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1000, column: 5 }, end: { line: 1000, column: 21 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        tail: true,
        parent: {},
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('location reporting accuracy', () => {
    test('default location when no loc for Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
      })

      expect(reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('default location when no loc for TemplateElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
      })

      expect(reports[0].loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('preserves exact loc from node for Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 26 } },
      })

      expect(reports[0].loc).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 5, column: 26 },
      })
    })

    test('preserves exact loc from node for TemplateElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 7, column: 3 }, end: { line: 7, column: 19 } },
      })

      expect(reports[0].loc).toEqual({
        start: { line: 7, column: 3 },
        end: { line: 7, column: 19 },
      })
    })

    test('location column 0 is preserved', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a  b',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('location line 1 is preserved', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a  b',
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 11 } },
      })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('multi-line location end is preserved', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 10, column: 0 }, end: { line: 12, column: 5 } },
      })

      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('loc with only start property uses default end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 3, column: 2 } },
      })

      expect(reports[0].loc?.start).toEqual({ line: 3, column: 2 })
    })

    test('loc end column is 0 when end has no column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1 } },
      })

      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('message content verification', () => {
    test('Literal report message is exact', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].message).toBe('Multiple spaces found in string literal.')
    })

    test('TemplateElement report message is exact', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].message).toBe('Multiple spaces found in template literal.')
    })

    test('Literal message does not contain template literal text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].message).not.toContain('template')
    })

    test('TemplateElement message does not contain string literal text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].message).not.toContain('string')
    })

    test('Literal message ends with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('TemplateElement message ends with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  describe('multiple reports in same context', () => {
    test('reports multiple Literal violations independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'foo  bar',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })

      expect(reports).toHaveLength(2)
    })

    test('reports multiple TemplateElement violations independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'foo  bar', cooked: 'foo  bar' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })

      expect(reports).toHaveLength(2)
    })

    test('reports mixed Literal and TemplateElement violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'foo  bar', cooked: 'foo  bar' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })

      expect(reports).toHaveLength(2)
      expect(reports[0].message).toContain('string literal')
      expect(reports[1].message).toContain('template literal')
    })

    test('reports 3 Literal violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'one  two',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'three  four',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 14 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'five  six',
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 12 } },
      })

      expect(reports).toHaveLength(3)
    })

    test('does not report when Literal is clean but TemplateElement violates', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'foo  bar', cooked: 'foo  bar' },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('template literal')
    })

    test('does not report when TemplateElement is clean but Literal violates', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello world', cooked: 'hello world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'foo  bar',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 12 } },
      })

      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('string literal')
    })

    test('each report has independent location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'foo  bar',
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 22 } },
      })

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('mixed clean and violating calls report only violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'clean string',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'dirty  string',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 16 } },
      })

      visitor.Literal({
        type: 'Literal',
        value: 'another clean',
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 15 } },
      })

      expect(reports).toHaveLength(1)
    })
  })

  describe('context variations', () => {
    test('works with different file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";', filePath: '/different/path.ts' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "hello  world"', filePath: '/src/file.ts' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 26 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with custom options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOption: true }], source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with long file path', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.ts'
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";', filePath: longPath })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";', filePath: '/src/file.js' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";', filePath: '/src/component.tsx' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('works with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/custom/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/custom/workspace',
      } as unknown as RuleContext

      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('rule behavior is consistent across multiple contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'const x = "test";' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'const x = "test";' })

      const visitor1 = noMultiSpacesRule.create(ctx1)
      const visitor2 = noMultiSpacesRule.create(ctx2)

      const node = {
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor1.Literal(node)
      visitor2.Literal(node)

      expect(rep1).toHaveLength(1)
      expect(rep2).toHaveLength(1)
      expect(rep1[0].message).toBe(rep2[0].message)
    })
  })

  describe('report descriptor structure', () => {
    test('report descriptor has message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report descriptor loc has start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report descriptor loc has end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report descriptor loc.start has line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('report descriptor loc.start has column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report is called exactly once per violating node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('report is not called for clean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello world',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('TemplateElement report descriptor has correct structure', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'hello  world', cooked: 'hello  world' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })
  })

  describe('export verification', () => {
    test('default export equals named export', () => {
      expect(noMultiSpacesRuleDefault).toBe(noMultiSpacesRule)
    })

    test('named export is defined', () => {
      expect(noMultiSpacesRule).toBeDefined()
    })

    test('named export has meta property', () => {
      expect(noMultiSpacesRule).toHaveProperty('meta')
    })

    test('named export has create property', () => {
      expect(noMultiSpacesRule).toHaveProperty('create')
    })

    test('rule has exactly meta and create properties', () => {
      const keys = Object.keys(noMultiSpacesRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('hasMultipleSpaces pattern edge cases via Literal', () => {
    test('detects two spaces at very start of string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '  a',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects two spaces at very end of string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a  ',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('does not report single space between words with unicode', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello 世界',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('detects spaces around angle brackets', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '<  div  >',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces in URL-like string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'http://example.com/path  to/resource',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 38 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with emoji characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello  🌍',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('does not report string of only tabs', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '\t\t\t\t',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('does not report tab followed by single space', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '\t hello',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('detects spaces in multiline string with tabs', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'line1\n\titem  value\nline3',
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 6 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with dollar sign in string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '$100  $200',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with hash symbol', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '#tag1  #tag2',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with at sign', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '@user1  @user2',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('does not report string with only one word and no spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'oneword',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('detects spaces in JSON-like string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '{"key":  "value"}',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with pipe character', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'option1  |  option2',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with semicolons', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'stmt1;  stmt2',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with backslash', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'path\\to  \\file',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with forward slashes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '/path  /to/file',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with parentheses', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '(  inner  )',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with square brackets', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '[  item  ]',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('does not report carriage return followed by newline with single space', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'hello\r\n world',
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('detects spaces in template element with escape sequences', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.TemplateElement({
        type: 'TemplateElement',
        value: { raw: 'line1\\n  line2', cooked: 'line1\n  line2' },
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 8 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('detects spaces with dots in string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'v1.0.0  ..  v2.0.0',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      })

      expect(reports).toHaveLength(1)
    })

    test('does not report string with just whitespace chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: '\n\r\n\t',
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })

      expect(reports).toHaveLength(0)
    })

    test('detects spaces with plus sign in string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
      const visitor = noMultiSpacesRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 'a  +  b',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports).toHaveLength(1)
    })
  })
})
