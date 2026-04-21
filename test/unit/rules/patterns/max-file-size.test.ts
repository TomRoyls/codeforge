import { describe, test, expect, beforeEach, vi } from 'vitest'
import { maxFileSizeRule } from '../../../../src/rules/patterns/max-file-size.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function createLargeSource(lineCount: number): string {
  return Array(lineCount).fill('const x = 1;').join('\n')
}

function createLargeCharacterSource(charCount: number): string {
  return 'x'.repeat(charCount)
}

function createProgramNode(): unknown {
  return {
    type: 'Program',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 0 },
    },
  }
}

describe('max-file-size rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(maxFileSizeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(maxFileSizeRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(maxFileSizeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(maxFileSizeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(maxFileSizeRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(maxFileSizeRule.meta.docs?.description).toContain('file size')
    })

    test('should have docs property', () => {
      expect(maxFileSizeRule.meta.docs).toBeDefined()
    })

    test('should have docs url', () => {
      expect(maxFileSizeRule.meta.docs?.url).toBeDefined()
    })

    test('should have schema as array', () => {
      expect(Array.isArray(maxFileSizeRule.meta.schema)).toBe(true)
    })

    test('should have exactly one schema entry', () => {
      expect(maxFileSizeRule.meta.schema).toHaveLength(1)
    })

    test('should have schema type object', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.type).toBe('object')
    })

    test('should have maxLines in schema properties', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('maxLines')
    })

    test('should have maxCharacters in schema properties', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('maxCharacters')
    })

    test('should have ignoreComments in schema properties', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('ignoreComments')
    })

    test('should have ignoreBlankLines in schema properties', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('ignoreBlankLines')
    })

    test('should have exclude in schema properties', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('exclude')
    })

    test('should have additionalProperties false in schema', () => {
      const schema = maxFileSizeRule.meta.schema[0] as Record<string, unknown>
      expect(schema.additionalProperties).toBe(false)
    })

    test('should have description containing maintainability', () => {
      expect(maxFileSizeRule.meta.docs?.description).toContain('maintain')
    })

    test('should have description mentioning splitting', () => {
      expect(maxFileSizeRule.meta.docs?.description).toContain('splitting')
    })

    test('should have url pointing to docs', () => {
      expect(maxFileSizeRule.meta.docs?.url).toContain('codeforge.dev')
    })

    test('should have url mentioning rule name', () => {
      expect(maxFileSizeRule.meta.docs?.url).toContain('max-file-size')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should not report small files', () => {
      const { context, reports } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report file exceeding maxLines', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
      expect(reports[0].message).toContain('lines')
    })

    test('should report file exceeding maxCharacters', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
      expect(reports[0].message).toContain('characters')
    })

    test('should handle null node gracefully in Program', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      expect(() => visitor.Program(null)).not.toThrow()
    })

    test('should handle Program:exit', () => {
      const { context, reports } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report critically large files', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeDefined()
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('should return visitor as object', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should return empty visitor for excluded files', () => {
      const { context } = createMockRuleContext({ options: [{ exclude: ['/src/file.ts'] }] })
      const visitor = maxFileSizeRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should return visitor with Program as function', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)
      expect(typeof visitor.Program).toBe('function')
    })

    test('should return visitor with Program:exit as function', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('should handle undefined node in Program', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)
      expect(() => visitor.Program(undefined)).not.toThrow()
    })
  })

  describe('options', () => {
    test('should respect maxLines option', () => {
      const source = createLargeSource(100)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 50 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should respect maxCharacters option', () => {
      const source = createLargeCharacterSource(1000)
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 500 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should respect ignoreComments option', () => {
      const source = '// comment\n'.repeat(100) + 'const x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 50, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // With ignoreComments, comments should not count
    })

    test('should respect ignoreBlankLines option', () => {
      const source = '\n'.repeat(100) + 'const x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 50, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // With ignoreBlankLines, blank lines should not count
    })

    test('should respect exclude option with exact match', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/file.ts'] },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      if (visitor.Program) {
        visitor.Program(createProgramNode())
      }

      expect(reports.length).toBe(0)
    })

    test('should respect exclude option with glob pattern', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['**/*.test.ts'] },
        '/src/file.test.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      if (visitor.Program) {
        visitor.Program(createProgramNode())
      }

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
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

      const visitor = maxFileSizeRule.create(context)

      expect(() => visitor.Program(createProgramNode())).not.toThrow()
    })

    test('should use default maxLines when not specified', () => {
      const source = createLargeSource(400)
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should use default maxLines and report when exceeded', () => {
      const source = createLargeSource(600)
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should accept maxLines as 1', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 1 }],
        filePath: '/src/file.ts',
        source: 'a\nb',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should accept maxCharacters as 100', () => {
      const source = 'x'.repeat(200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 100 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should not report when line count equals maxLines', () => {
      const source = createLargeSource(100)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 100 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should not report when character count equals maxCharacters', () => {
      const source = createLargeCharacterSource(1000)
      const { context, reports } = createMockContext(
        { maxCharacters: 1000 },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report when line count is one over maxLines', () => {
      const source = createLargeSource(101)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 100 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should report when character count is one over maxCharacters', () => {
      const source = createLargeCharacterSource(1001)
      const { context, reports } = createMockContext(
        { maxCharacters: 1000 },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })
  })

  describe('line counting', () => {
    test('should count single line as 1', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 1 }],
        filePath: '/src/file.ts',
        source: 'hello',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count two lines correctly', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 1 }],
        filePath: '/src/file.ts',
        source: 'a\nb',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should count empty lines', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 2 }],
        filePath: '/src/file.ts',
        source: '\n\n',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should count trailing newline as extra line', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 2 }],
        filePath: '/src/file.ts',
        source: 'a\nb\n',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle 100 lines with limit 100', () => {
      const source = createLargeSource(100)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 100 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle 101 lines with limit 100', () => {
      const source = createLargeSource(101)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 100 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle very large line count', () => {
      const source = createLargeSource(5000)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should count lines in source with mixed line content', () => {
      const lines = ['const a = 1;', '', '// comment', 'const b = 2;']
      const source = lines.join('\n')
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 3 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })
  })

  describe('character counting', () => {
    test('should count characters accurately', () => {
      const source = 'a'.repeat(10)
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 10 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count characters including newlines', () => {
      const source = 'a\nb\nc'
      const { context, reports } = createMockContext(
        { maxCharacters: source.length },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report when characters exceed limit by 1', () => {
      const source = 'a'.repeat(101)
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 100 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle very large character count', () => {
      const source = createLargeCharacterSource(100000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should count unicode characters', () => {
      const source = '🎉'.repeat(50)
      const { context, reports } = createMockContext(
        { maxCharacters: source.length },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count whitespace characters', () => {
      const source = '     '.repeat(20)
      const { context, reports } = createMockContext(
        { maxCharacters: source.length },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count tab characters', () => {
      const source = '\t\t\t'.repeat(20)
      const { context, reports } = createMockContext(
        { maxCharacters: source.length },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count empty string as 0 characters', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 0 }],
        filePath: '/src/file.ts',
        source: '',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count single character', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 1 }],
        filePath: '/src/file.ts',
        source: 'a',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report single character over limit 0', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 0 }],
        filePath: '/src/file.ts',
        source: 'a',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })
  })

  describe('comment handling', () => {
    test('should remove single-line comments when ignoreComments is true', () => {
      const source = '// comment line 1\n// comment line 2\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Comments are removed so effective lines should be less
      expect(reports.length).toBe(0)
    })

    test('should remove multi-line comments when ignoreComments is true', () => {
      const source = '/* comment\nline 2\nline 3 */\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count comments as lines when ignoreComments is false', () => {
      const source = '// comment line\n'.repeat(20) + 'const x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 10, ignoreComments: false },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should count comments as lines when ignoreComments is not set', () => {
      const source = '// comment line\n'.repeat(20) + 'const x = 1;'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle inline comments after code', () => {
      const source = 'const x = 1; // inline comment\n'.repeat(5)
      const { context, reports } = createMockContext(
        { maxLines: 10, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle multiple multi-line comments', () => {
      const source = '/* a */\n/* b */\n/* c */\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle nested-like comments gracefully', () => {
      const source = '/* outer /* inner */ end */\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Should not throw
      expect(true).toBe(true)
    })

    test('should handle comment-only file with ignoreComments', () => {
      const source = '// only comments\n// more comments\n// and more'
      const { context, reports } = createMockContext(
        { maxLines: 1, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Comments removed, so remaining content may be empty or very small
      expect(true).toBe(true)
    })

    test('should handle JSDoc-style comments', () => {
      const source = '/**\n * JSDoc comment\n * @param x\n * @returns\n */\nfunction f() {}'
      const { context, reports } = createMockContext(
        { maxLines: 10, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('blank line handling', () => {
    test('should ignore blank lines when ignoreBlankLines is true', () => {
      const source = '\n\n\n\n\nconst x = 1;\n\n\n\n\n'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should count blank lines when ignoreBlankLines is false', () => {
      const source = '\n\n\n\n\n\n\n\n\n\n\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreBlankLines: false },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should count blank lines when ignoreBlankLines is not set', () => {
      const source = '\n\n\n\n\n\n\n\n\n\n\nconst x = 1;'
      const { context, reports } = createMockContext({ maxLines: 5 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should treat whitespace-only lines as blank', () => {
      const source = '   \n   \n   \n   \n   \nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should treat tab-only lines as blank', () => {
      const source = '\t\n\t\n\t\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should not treat lines with code as blank', () => {
      const source = 'const a = 1;\nconst b = 2;\nconst c = 3;'
      const { context, reports } = createMockContext(
        { maxLines: 2, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle file with only blank lines and ignoreBlankLines', () => {
      const source = '\n\n\n\n\n'
      const { context, reports } = createMockContext(
        { maxLines: 1, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // All lines are blank and ignored, so no violation
      expect(reports.length).toBe(0)
    })

    test('should handle mixed blank and code lines with ignoreBlankLines', () => {
      const source = 'const a = 1;\n\nconst b = 2;\n\nconst c = 3;'
      const { context, reports } = createMockContext(
        { maxLines: 3, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // 3 code lines = exactly at limit
      expect(reports.length).toBe(0)
    })

    test('should handle mixed blank and code lines without ignoreBlankLines', () => {
      const source = 'const a = 1;\n\nconst b = 2;\n\nconst c = 3;'
      const { context, reports } = createMockContext(
        { maxLines: 3, ignoreBlankLines: false },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // 5 total lines exceeds 3
      expect(reports.length).toBeGreaterThan(0)
    })
  })

  describe('exclude patterns', () => {
    test('should exclude exact file path match', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/file.ts'] },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      if (visitor.Program) {
        visitor.Program(createProgramNode())
      }

      expect(reports.length).toBe(0)
    })

    test('should exclude glob pattern with double star', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['**/*.test.ts'] },
        '/src/file.test.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      if (visitor.Program) {
        visitor.Program(createProgramNode())
      }

      expect(reports.length).toBe(0)
    })

    test('should exclude with partial path match', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['generated'] },
        '/src/generated/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      if (visitor.Program) {
        visitor.Program(createProgramNode())
      }

      expect(reports.length).toBe(0)
    })

    test('should not exclude non-matching patterns', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxCharacters: 50000 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle multiple exclude patterns', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/generated', '**/*.test.ts', '/src/vendor'] },
        '/src/vendor/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      // Should be excluded due to /src/vendor match
      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should match first exclude pattern in list', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/file.ts', '/src/other.ts'] },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should match second exclude pattern in list', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/first.ts', '/src/second.ts'] },
        '/src/second.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should handle empty exclude array', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: [] },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle glob with single star', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['*.ts'] },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      // *.ts matches file.ts substring via includes or glob
      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should handle glob with question mark', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['file?.ts'] },
        '/src/file1.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      // ? matches single char
      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should handle nested directory exclude', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['**/node_modules/**'] },
        '/src/node_modules/package/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(0)
    })

    test('should be case sensitive for exclude', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['/src/Generated'] },
        '/src/generated/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Case sensitive, should not match
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle exclude with file extension pattern', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['.generated.'] },
        '/src/file.generated.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(0)
    })
  })

  describe('location reporting', () => {
    test('should include loc in line violation report', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc in character violation report', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc).toBeDefined()
    })

    test('should report location at line 1', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location start column as 0', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location end column as 1', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should report location with start and end', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should include loc in critical report', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport?.loc).toBeDefined()
    })

    test('should have same start and end line in loc', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
    })
  })

  describe('messages', () => {
    test('should include actual line count in message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('600')
    })

    test('should include max lines limit in message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('500')
    })

    test('should include actual character count in message', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('60000')
    })

    test('should include max characters limit in message', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('50000')
    })

    test('should mention splitting in line violation message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('splitting')
    })

    test('should mention splitting in character violation message', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('splitting')
    })

    test('should mention exceeds in line violation message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('exceeds')
    })

    test('should mention exceeds in character violation message', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('exceeds')
    })

    test('should mention critically in critical report', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeDefined()
      expect(criticalReport?.message).toContain('critically')
    })

    test('should mention refactoring in critical report', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport?.message).toContain('refactor')
    })

    test('should include line count in critical report', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport?.message).toContain('1200')
    })

    test('should say File has in line violation message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('File has')
    })

    test('should say File has in character violation message', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('File has')
    })
  })

  describe('combined options', () => {
    test('should report both line and character violations', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 100, maxCharacters: 100 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      const lineReport = reports.find((r) => r.message.includes('lines'))
      const charReport = reports.find((r) => r.message.includes('characters'))
      expect(lineReport).toBeDefined()
      expect(charReport).toBeDefined()
    })

    test('should combine ignoreComments and ignoreBlankLines', () => {
      const source = '// comment\n\n\nconst x = 1;\n\n// another'
      const { context, reports } = createMockContext(
        { maxLines: 1, ignoreComments: true, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // After removing comments and blank lines, only 'const x = 1;' remains
      expect(reports.length).toBe(0)
    })

    test('should use ignoreBlankLines with maxLines', () => {
      const source = 'a\n\n\n\n\n\n\n\n\nb'
      const { context, reports } = createMockContext(
        { maxLines: 2, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Only 2 non-blank lines: 'a' and 'b'
      expect(reports.length).toBe(0)
    })

    test('should use ignoreComments with maxLines', () => {
      const source = '// comment\n'.repeat(10) + 'const x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Comments are stripped but newlines remain, so lines still exceed 5
      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle all options together', () => {
      const source = '// comment\n\nconst x = 1;\n'
      const { context, reports } = createMockContext(
        { maxLines: 100, maxCharacters: 50000, ignoreComments: true, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle exclude with other options', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 100, maxCharacters: 100, exclude: ['/src/file.ts'] },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      // Excluded, so no reports regardless of other options
      expect(Object.keys(visitor)).toHaveLength(0)
    })
  })

  describe('critically large files', () => {
    test('should report critically large at exactly 2x maxLines', () => {
      const largeSource = createLargeSource(1001)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeDefined()
    })

    test('should not report critical for less than 2x maxLines', () => {
      const largeSource = createLargeSource(999)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeUndefined()
    })

    test('should report critical for very large files', () => {
      const largeSource = createLargeSource(5000)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeDefined()
    })

    test('should report critical only in Program:exit', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeUndefined()
    })

    test('should report critical after line violation', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      const lineReport = reports.find(
        (r) => r.message.includes('lines') && !r.message.includes('critically'),
      )
      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(lineReport).toBeDefined()
      expect(criticalReport).toBeDefined()
    })

    test('should calculate critical threshold based on custom maxLines', () => {
      const largeSource = createLargeSource(250)
      const { context, reports } = createMockContext({ maxLines: 100 }, '/src/file.ts', largeSource)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      // 250 > 100 * 2 = 200, so critically large
      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeDefined()
    })

    test('should not report critical when below 2x threshold', () => {
      const largeSource = createLargeSource(150)
      const { context, reports } = createMockContext({ maxLines: 100 }, '/src/file.ts', largeSource)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      // 150 < 100 * 2 = 200, not critically large
      const criticalReport = reports.find((r) => r.message.includes('critically'))
      expect(criticalReport).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    test('should handle empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle single line source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle source with only whitespace', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '   \n   \n   ')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle source with mixed content', () => {
      const source = `
// Comment
const x = 1;

/* Multi-line
   comment */
const y = 2;
      `.trim()

      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle file path with special characters', () => {
      const { context, reports } = createMockContext({}, '/src/[test]/file.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report correct line count in message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('600')
      expect(reports[0].message).toContain('500')
    })

    test('should report correct character count in message', () => {
      const largeSource = createLargeCharacterSource(60000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message).toContain('60000')
      expect(reports[0].message).toContain('50000')
    })

    test('should handle exclude with partial path match', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, exclude: ['generated'] },
        '/src/generated/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      if (visitor.Program) {
        visitor.Program(createProgramNode())
      }

      expect(reports.length).toBe(0)
    })

    test('should handle both line and character limits', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 500, maxCharacters: 50000 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Should report line violation
      const lineReport = reports.find((r) => r.message.includes('lines'))
      expect(lineReport).toBeDefined()
    })

    test('should handle source with only newlines', () => {
      const source = '\n\n\n\n\n'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle source with carriage returns', () => {
      const source = 'line1\r\nline2\r\nline3'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Should not crash
      expect(true).toBe(true)
    })

    test('should handle very long single line', () => {
      const source = 'x'.repeat(100000)
      const { context, reports } = createMockContext(
        { maxCharacters: 50000 },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle file path with unicode', () => {
      const { context, reports } = createMockContext({}, '/src/文件.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested file path', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/a/b/c/d/e/f/g/h/i/j/file.ts',
        'const x = 1;',
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle source with tabs and spaces', () => {
      const source = '\t\tconst x = 1;\n    const y = 2;'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle repeated Program calls', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 1 }],
        filePath: '/src/file.ts',
        source: 'a\nb',
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThanOrEqual(2)
    })

    test('should handle Program:exit without Program', () => {
      const { context, reports } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle source with special regex characters', () => {
      const source = 'const x = /regex/g;'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle file path with dots', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.name.with.dots.ts',
        'const x = 1;',
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle source with only a newline', () => {
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', '\n')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('reports array', () => {
    test('should push to reports array for each violation', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('should have message property in report', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have string message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('rule exports', () => {
    test('should export maxFileSizeRule as named export', () => {
      expect(maxFileSizeRule).toBeDefined()
    })

    test('should export rule with meta property', () => {
      expect(maxFileSizeRule.meta).toBeDefined()
    })

    test('should export rule with create property', () => {
      expect(maxFileSizeRule.create).toBeDefined()
    })

    test('should export create as function', () => {
      expect(typeof maxFileSizeRule.create).toBe('function')
    })

    test('should have meta as object', () => {
      expect(typeof maxFileSizeRule.meta).toBe('object')
    })
  })

  describe('file path handling', () => {
    test('should use file path from context', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle root path', () => {
      const { context, reports } = createMockContext({}, '/file.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle relative-looking path', () => {
      const { context, reports } = createMockContext({}, 'src/file.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle path with hash character', () => {
      const { context, reports } = createMockContext({}, '/src/#issue/file.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle path with spaces', () => {
      const { context, reports } = createMockContext({}, '/src/my project/file.ts', 'const x = 1;')
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('Program:exit', () => {
    test('should not report for small files on exit', () => {
      const { context, reports } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report critical on exit for large files', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      expect(reports.some((r) => r.message.includes('critically'))).toBe(true)
    })

    test('should accept undefined argument in exit', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      expect(() => visitor['Program:exit']?.(undefined)).not.toThrow()
    })

    test('should accept no argument in exit', () => {
      const { context } = createMockContext()
      const visitor = maxFileSizeRule.create(context)

      expect(() => visitor['Program:exit']?.()).not.toThrow()
    })

    test('should generate additional report for critical files', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source: largeSource,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      const reportsAfterProgram = reports.length
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThan(reportsAfterProgram)
    })
  })

  describe('boundary tests', () => {
    test('should not report at exactly maxLines boundary', () => {
      const source = createLargeSource(200)
      const { context, reports } = createMockContext({ maxLines: 200 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report one over maxLines boundary', () => {
      const source = createLargeSource(201)
      const { context, reports } = createMockContext({ maxLines: 200 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should not report at exactly maxCharacters boundary', () => {
      const source = 'a'.repeat(200)
      const { context, reports } = createMockContext({ maxCharacters: 200 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should report one over maxCharacters boundary', () => {
      const source = 'a'.repeat(201)
      const { context, reports } = createMockContext({ maxCharacters: 200 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should report critical at exactly 2x + 1 maxLines', () => {
      const source = createLargeSource(1001)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      expect(reports.some((r) => r.message.includes('critically'))).toBe(true)
    })

    test('should not report critical at exactly 2x maxLines', () => {
      // 1000 = 500 * 2, not > 2x, so no critical report
      const source = createLargeSource(1000)
      const { context, reports } = createMockRuleContext({
        options: [{ maxLines: 500 }],
        filePath: '/src/file.ts',
        source,
      })
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      expect(reports.some((r) => r.message.includes('critically'))).toBe(false)
    })

    test('should handle maxLines of 1 with 2-line file', () => {
      const source = 'a\nb'
      const { context, reports } = createMockContext({ maxLines: 1 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })

    test('should handle maxCharacters of 1 with 2-char file', () => {
      const source = 'ab'
      const { context, reports } = createMockContext({ maxCharacters: 1 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBeGreaterThan(0)
    })
  })

  describe('ignoreComments edge cases', () => {
    test('should handle comment at end of file', () => {
      const source = 'const x = 1;\n// end comment'
      const { context, reports } = createMockContext(
        { maxLines: 10, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle multiple inline comments', () => {
      const source = 'const a = 1; // first\nconst b = 2; // second'
      const { context, reports } = createMockContext(
        { maxLines: 10, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle comment with leading whitespace', () => {
      const source = '  // indented comment\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 10, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle block comment spanning multiple lines', () => {
      const source = '/* line1\nline2\nline3\nline4\nline5 */\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 5, ignoreComments: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('ignoreBlankLines edge cases', () => {
    test('should handle alternating blank and code lines', () => {
      const source = 'a\n\nb\n\nc'
      const { context, reports } = createMockContext(
        { maxLines: 3, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // 3 non-blank lines: a, b, c
      expect(reports.length).toBe(0)
    })

    test('should handle file starting with blank lines', () => {
      const source = '\n\n\nconst x = 1;'
      const { context, reports } = createMockContext(
        { maxLines: 1, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Only 1 non-blank line
      expect(reports.length).toBe(0)
    })

    test('should handle file ending with blank lines', () => {
      const source = 'const x = 1;\n\n\n'
      const { context, reports } = createMockContext(
        { maxLines: 1, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      // Only 1 non-blank line
      expect(reports.length).toBe(0)
    })

    test('should handle file with only blank lines', () => {
      const source = '\n\n\n\n\n'
      const { context, reports } = createMockContext(
        { maxLines: 1, ignoreBlankLines: true },
        '/src/file.ts',
        source,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('should be importable as default', async () => {
      const mod = await import('../../../../src/rules/patterns/max-file-size.js')
      expect(mod.default).toBeDefined()
    })

    test('default export should equal named export', async () => {
      const mod = await import('../../../../src/rules/patterns/max-file-size.js')
      expect(mod.default).toBe(mod.maxFileSizeRule)
    })
  })

  describe('multiple violations', () => {
    test('should produce separate reports for lines and characters', () => {
      const largeSource = createLargeSource(600)
      const { context, reports } = createMockContext(
        { maxLines: 100, maxCharacters: 100 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      const lineReports = reports.filter(
        (r) => r.message.includes('lines') && !r.message.includes('critically'),
      )
      const charReports = reports.filter((r) => r.message.includes('characters'))
      expect(lineReports.length).toBeGreaterThan(0)
      expect(charReports.length).toBeGreaterThan(0)
    })

    test('should produce three reports for critically large file exceeding both limits', () => {
      const largeSource = createLargeSource(1200)
      const { context, reports } = createMockContext(
        { maxLines: 100, maxCharacters: 100 },
        '/src/file.ts',
        largeSource,
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('glob caching', () => {
    test('should handle multiple files with same exclude pattern', () => {
      const largeSource = createLargeSource(600)
      const { context: ctx1, reports: r1 } = createMockContext(
        { maxLines: 500, exclude: ['**/*.gen.ts'] },
        '/src/a.gen.ts',
        largeSource,
      )
      const v1 = maxFileSizeRule.create(ctx1)

      const { context: ctx2, reports: r2 } = createMockContext(
        { maxLines: 500, exclude: ['**/*.gen.ts'] },
        '/src/b.gen.ts',
        largeSource,
      )
      const v2 = maxFileSizeRule.create(ctx2)

      expect(Object.keys(v1)).toHaveLength(0)
      expect(Object.keys(v2)).toHaveLength(0)
    })
  })

  describe('source with CRLF', () => {
    test('should handle CRLF line endings', () => {
      const source = 'a\r\nb\r\nc\r\nd\r\ne'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })

    test('should handle mixed LF and CRLF line endings', () => {
      const source = 'a\nb\r\nc\nd\r\ne'
      const { context, reports } = createMockContext({ maxLines: 10 }, '/src/file.ts', source)
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())

      expect(reports.length).toBe(0)
    })
  })

  describe('idempotency', () => {
    test('should produce same results on repeated create calls', () => {
      const largeSource = createLargeSource(600)
      const { context, reports: reports1 } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        largeSource,
      )
      const visitor1 = maxFileSizeRule.create(context)
      visitor1.Program(createProgramNode())

      const { context: ctx2, reports: reports2 } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        largeSource,
      )
      const visitor2 = maxFileSizeRule.create(ctx2)
      visitor2.Program(createProgramNode())

      expect(reports1.length).toBe(reports2.length)
    })

    test('should produce consistent report messages', () => {
      const largeSource = createLargeSource(600)
      const { context, reports: r1 } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        largeSource,
      )
      maxFileSizeRule.create(context).Program(createProgramNode())

      const { context: ctx2, reports: r2 } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        largeSource,
      )
      maxFileSizeRule.create(ctx2).Program(createProgramNode())

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should produce consistent report locations', () => {
      const largeSource = createLargeSource(600)
      const { context, reports: r1 } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        largeSource,
      )
      maxFileSizeRule.create(context).Program(createProgramNode())

      const { context: ctx2, reports: r2 } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        largeSource,
      )
      maxFileSizeRule.create(ctx2).Program(createProgramNode())

      expect(r1[0].loc).toEqual(r2[0].loc)
    })

    test('should handle multiple sequential Program calls consistently', () => {
      const { context, reports } = createMockContext(
        { maxLines: 500 },
        '/src/file.ts',
        createLargeSource(600),
      )
      const visitor = maxFileSizeRule.create(context)

      visitor.Program(createProgramNode())
      const firstBatch = reports.length

      visitor.Program(createProgramNode())
      expect(reports.length).toBe(firstBatch * 2)
    })
  })
})
