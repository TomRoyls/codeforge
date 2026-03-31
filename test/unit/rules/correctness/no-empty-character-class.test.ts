import { describe, test, expect, vi } from 'vitest'
import { noEmptyCharacterClassRule } from '../../../../src/rules/correctness/no-empty-character-class.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const foo = "bar";',
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

function createLiteralNode(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: String(value).length + 1 },
    },
  }
}

describe('no-empty-character-class rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyCharacterClassRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEmptyCharacterClassRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correctness category', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noEmptyCharacterClassRule.meta.schema).toBeDefined()
    })

    test('should mention empty in description', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })
  })

  describe('create', () => {
    test('should return visitor object with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })
  })

  describe('detecting empty character classes', () => {
    test('should report empty character class in /[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty character class')
    })

    test('should not report non-empty character class /[^]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[^]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with content /[a]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[a]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report plain string without regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('hello world'))

      expect(reports.length).toBe(0)
    })

    test('should report empty class with flags /[]/g', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/g'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(() => visitor.Literal(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = { type: 'Literal', value: '/[]/' }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
