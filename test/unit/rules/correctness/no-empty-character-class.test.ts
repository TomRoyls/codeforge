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

  describe('rule metadata - comprehensive', () => {
    test('meta.type should be a string', () => {
      expect(typeof noEmptyCharacterClassRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof noEmptyCharacterClassRule.meta.severity).toBe('string')
    })

    test('meta should have docs property', () => {
      expect(noEmptyCharacterClassRule.meta).toHaveProperty('docs')
    })

    test('meta.docs should have description', () => {
      expect(noEmptyCharacterClassRule.meta.docs).toHaveProperty('description')
    })

    test('meta.docs.description should be a string', () => {
      expect(typeof noEmptyCharacterClassRule.meta.docs?.description).toBe('string')
    })

    test('meta.docs.description should mention character class', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.description.toLowerCase()).toContain(
        'character class',
      )
    })

    test('meta.docs.description should mention regular expression', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.description.toLowerCase()).toContain(
        'regular expression',
      )
    })

    test('meta.docs should have category property', () => {
      expect(noEmptyCharacterClassRule.meta.docs).toHaveProperty('category')
    })

    test('meta.docs.category should be correctness', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.category).toBe('correctness')
    })

    test('meta.docs should have recommended property', () => {
      expect(noEmptyCharacterClassRule.meta.docs).toHaveProperty('recommended')
    })

    test('meta.docs.recommended should be true', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.recommended).toBe(true)
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noEmptyCharacterClassRule.meta.schema)).toBe(true)
    })

    test('meta.schema should be empty (no options)', () => {
      expect(noEmptyCharacterClassRule.meta.schema).toEqual([])
    })

    test('meta should not have fixable property or it should be undefined', () => {
      expect(noEmptyCharacterClassRule.meta.fixable).toBeUndefined()
    })

    test('meta should have exactly type, severity, docs, schema keys', () => {
      const keys = Object.keys(noEmptyCharacterClassRule.meta)
      expect(keys).toContain('type')
      expect(keys).toContain('severity')
      expect(keys).toContain('docs')
      expect(keys).toContain('schema')
    })

    test('rule should have a create function', () => {
      expect(typeof noEmptyCharacterClassRule.create).toBe('function')
    })

    test('create should accept a context parameter and return a visitor', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should have exactly the Literal method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      expect(Object.keys(visitor)).toContain('Literal')
    })

    test('visitor.Literal should be a function', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      expect(typeof visitor.Literal).toBe('function')
    })
  })

  describe('empty character class detection - regex literal patterns', () => {
    test('should report /[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /a[]b/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/a[]b/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]abc/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]abc/'))
      expect(reports.length).toBe(1)
    })

    test('should report /abc[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/abc[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[].[]./', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[].[]./'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]+/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]+/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]*/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]*/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]?/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]?/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]{3}/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]{3}/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]{1,3}/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]{1,3}/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[][]/ - multiple empty classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[][]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /a[]b[]c/ - multiple empty classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/a[]b[]c/'))
      expect(reports.length).toBe(1)
    })

    test('should report /|[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/|[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]|/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]|/'))
      expect(reports.length).toBe(1)
    })

    test('should report /([])/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/([])/'))
      expect(reports.length).toBe(1)
    })

    test('should report /^[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/^[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]$/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]$/'))
      expect(reports.length).toBe(1)
    })

    test('should report /\\b[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/\\b[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /.[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/.[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /\\d[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/\\d[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /\\w[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/\\w[]/'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]\\d/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]\\d/'))
      expect(reports.length).toBe(1)
    })

    test('should report /(?:[])/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/(?:[])/'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo[]bar/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/foo[]bar/'))
      expect(reports.length).toBe(1)
    })

    test('should report /\\n[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/\\n[]/'))
      expect(reports.length).toBe(1)
    })
  })

  describe('empty character class detection - RegExp objects', () => {
    test('should report RegExp with empty character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with empty char class in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('a[]b')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with empty char class at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]abc')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with empty char class at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('abc[]')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with multiple empty char classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('a[]b[]c')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with empty char class and quantifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]+')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with empty char class and star quantifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]*')))
      expect(reports.length).toBe(1)
    })

    test('should not report RegExp with non-empty character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[a]')))
      expect(reports.length).toBe(0)
    })

    test('should not report RegExp with range character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[a-z]')))
      expect(reports.length).toBe(0)
    })

    test('should report RegExp with empty char class having g flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]', 'g')))
      expect(reports.length).toBe(1)
    })

    test('should report RegExp with empty char class having i flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]', 'i')))
      expect(reports.length).toBe(1)
    })

    test('should not report RegExp without character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('abc')))
      expect(reports.length).toBe(0)
    })
  })

  describe('flags variations', () => {
    test('should report /[]/g', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/g'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/i', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/i'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/m', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/m'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/s', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/s'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/u', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/u'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/y', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/y'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/gi', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/gi'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/gim', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/gim'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/gims', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/gims'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]/gimsuy', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/gimsuy'))
      expect(reports.length).toBe(1)
    })

    test('should report /a[]b/gi', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/a[]b/gi'))
      expect(reports.length).toBe(1)
    })

    test('should report /[]+/g', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]+/g'))
      expect(reports.length).toBe(1)
    })
  })

  describe('NOT flagged: non-empty character classes', () => {
    test('should not report /[a]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[abc]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[abc]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[^a]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[^a]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[a-z]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a-z]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[0-9]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[0-9]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\w]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\w]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\d]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\d]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\s]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\s]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[a-z0-9]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a-z0-9]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[^]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[^]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\]]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\]]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\\\]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\\\]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\b]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\b]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[A-Z]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[A-Z]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[a-zA-Z]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a-zA-Z]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\n]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\n]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\t]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\t]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\W]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\W]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\D]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\D]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\S]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\S]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[a-z][0-9]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a-z][0-9]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[\\u0041]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\u0041]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report /[aeiou]/i', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[aeiou]/i'))
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged: non-regex values', () => {
    test('should not report string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('hello'))
      expect(reports.length).toBe(0)
    })

    test('should not report number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(42))
      expect(reports.length).toBe(0)
    })

    test('should not report zero number', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(0))
      expect(reports.length).toBe(0)
    })

    test('should not report negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(-1))
      expect(reports.length).toBe(0)
    })

    test('should not report boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(true))
      expect(reports.length).toBe(0)
    })

    test('should not report boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(false))
      expect(reports.length).toBe(0)
    })

    test('should not report null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(null))
      expect(reports.length).toBe(0)
    })

    test('should not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(''))
      expect(reports.length).toBe(0)
    })

    test('should not report object value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode({ key: 'value' }))
      expect(reports.length).toBe(0)
    })

    test('should not report array value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode([1, 2, 3]))
      expect(reports.length).toBe(0)
    })

    test('should not report undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should not report float number', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(3.14))
      expect(reports.length).toBe(0)
    })

    test('should not report string with brackets but no slashes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('[]'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with text and brackets', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('some [] text'))
      expect(reports.length).toBe(0)
    })

    test('should not report a valid regex string /[a]+/g', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a]+/g'))
      expect(reports.length).toBe(0)
    })

    test('should not report a regex without character class /abc/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/abc/'))
      expect(reports.length).toBe(0)
    })

    test('should not report a regex with dot /a.b/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/a.b/'))
      expect(reports.length).toBe(0)
    })

    test('should not report NaN value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(NaN))
      expect(reports.length).toBe(0)
    })

    test('should not report Infinity value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(Infinity))
      expect(reports.length).toBe(0)
    })
  })

  describe('violation properties', () => {
    test('report message should contain "Empty character class in regular expression"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports[0].message).toBe('Empty character class in regular expression')
    })

    test('report should include location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start should have column', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end should have line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('report loc end should have column', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report loc should match node location line 5 column 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/', 5, 3))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('report loc should match node location line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report message is exactly the expected string', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports[0].message).toBe('Empty character class in regular expression')
    })
  })

  describe('extractLocation edge cases', () => {
    test('should return default location for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(null)
      expect(reports.length).toBe(0)
    })

    test('should return default location for node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = { type: 'Literal', value: '/[]/', loc: null }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should return default location for node with undefined loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = { type: 'Literal', value: '/[]/' }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc - only start', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 3, column: 7 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should handle node with loc.start having non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 'bad', column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc.start having non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 2, column: 'bad' }, end: { line: 2, column: 5 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.end having non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 'bad', column: 5 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle node with loc.end having non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 'bad' } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle node with loc.start being undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: undefined, end: { line: 1, column: 5 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.end being undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 2, column: 3 }, end: undefined },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle node with custom high line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/', 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle node with line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/', 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report each regex separately when called multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/'))
      visitor.Literal(createLiteralNode('/abc[]def/'))

      expect(reports.length).toBe(2)
    })

    test('should report three separate violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/'))
      visitor.Literal(createLiteralNode('/a[]/'))
      visitor.Literal(createLiteralNode('/[]b/'))

      expect(reports.length).toBe(3)
    })

    test('should not report for valid regex mixed with invalid ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[a]/'))
      visitor.Literal(createLiteralNode('/[]/'))
      visitor.Literal(createLiteralNode('/[0-9]/'))

      expect(reports.length).toBe(1)
    })

    test('should track distinct locations for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode('/[]/', 1, 0))
      visitor.Literal(createLiteralNode('/[]/', 5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should report RegExp objects and string regex patterns separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.Literal(createLiteralNode(new RegExp('[]')))
      visitor.Literal(createLiteralNode('/[]/'))

      expect(reports.length).toBe(2)
    })
  })

  describe('node edge cases', () => {
    test('should handle node without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with value being an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode({}))
      expect(reports.length).toBe(0)
    })

    test('should handle node with value being an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode([]))
      expect(reports.length).toBe(0)
    })

    test('should handle node with value being a function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const fn = () => {}
      visitor.Literal(createLiteralNode(fn))
      expect(reports.length).toBe(0)
    })

    test('should handle node with value being a Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(Symbol('test')))
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = {
        type: 'Literal',
        value: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
        raw: '/[]/',
        range: [0, 4],
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('42'))
      expect(reports.length).toBe(0)
    })

    test('should handle node with whitespace string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('   '))
      expect(reports.length).toBe(0)
    })

    test('should handle node with newline string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('\n'))
      expect(reports.length).toBe(0)
    })

    test('should handle node with value 0 (falsy but valid)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(0))
      expect(reports.length).toBe(0)
    })

    test('should handle node with value false (falsy but valid)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(false))
      expect(reports.length).toBe(0)
    })

    test('should handle node with value being empty string (falsy but valid)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(''))
      expect(reports.length).toBe(0)
    })
  })

  describe('string regex literal detection', () => {
    test('should detect /[]/ as regex literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('should detect /[]/g as regex literal string with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/g'))
      expect(reports.length).toBe(1)
    })

    test('should not detect [] without slashes as regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('[]'))
      expect(reports.length).toBe(0)
    })

    test('should not detect string with [] but no regex delimiters', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('array[]'))
      expect(reports.length).toBe(0)
    })

    test('should not detect string /abc/ without empty char class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/abc/'))
      expect(reports.length).toBe(0)
    })

    test('should not detect string /path/to/file as regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/path/to/file'))
      expect(reports.length).toBe(0)
    })

    test('should detect /[.[]/ as containing empty char class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[.[]/'))
      expect(reports.length).toBe(1)
    })

    test('should not detect // as regex with empty char class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('//'))
      expect(reports.length).toBe(0)
    })

    test('should detect /x[]y/ as regex with empty char class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/x[]y/'))
      expect(reports.length).toBe(1)
    })

    test('should not flag valid regex /[a-z]+/gi', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[a-z]+/gi'))
      expect(reports.length).toBe(0)
    })

    test('should detect /[]/v flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/v'))
      expect(reports.length).toBe(1)
    })
  })

  describe('context usage', () => {
    test('should call context.report with message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
      expect(reports[0]).toHaveProperty('message')
    })

    test('should call context.report with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/src/utils/regex.ts')
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockContext({}, '/test.ts', 'const re = /[]/')
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('should work when called with no options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('should create a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noEmptyCharacterClassRule.create(context)
      const visitor2 = noEmptyCharacterClassRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('each visitor should have independent report tracking', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const visitor1 = noEmptyCharacterClassRule.create(ctx1)
      const visitor2 = noEmptyCharacterClassRule.create(ctx2)
      visitor1.Literal(createLiteralNode('/[]/'))
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
      visitor2.Literal(createLiteralNode('/[]/'))
      expect(r2.length).toBe(1)
    })
  })

  describe('regression and special patterns', () => {
    test('should report regex with escaped bracket /[\\[]/ due to substring match', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\[]/'))
      expect(reports.length).toBe(1)
    })

    test('should handle regex /[^x]/ as negated class with content', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[^x]/'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex with alternation /a|[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/a|[]/'))
      expect(reports.length).toBe(1)
    })

    test('should handle regex with groups /([]|a)/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/([]|a)/'))
      expect(reports.length).toBe(1)
    })

    test('should handle regex with lookahead /(?=[])//*', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/(?=[])/'))
      expect(reports.length).toBe(1)
    })

    test('should handle regex with lookbehind /(?<=[])/*', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/(?<=[])/'))
      expect(reports.length).toBe(1)
    })

    test('should not report regex with non-empty class and empty lookbehind assertion', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/(?<=a)[b]/'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex with backreference /(a)\\1[]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/(a)\\1[]/'))
      expect(reports.length).toBe(1)
    })

    test('should handle /[]/ as RegExp object', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]')))
      expect(reports.length).toBe(1)
    })

    test('should handle RegExp with flags and empty char class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode(new RegExp('[]', 'gi')))
      expect(reports.length).toBe(1)
    })

    test('should handle regex with unicode escape in char class /[\\u0041]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\u0041]/'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex with hex escape in char class /[\\x41]/', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[\\x41]/'))
      expect(reports.length).toBe(0)
    })

    test('should handle /a[]/ with char class at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/a[]/'))
      expect(reports.length).toBe(1)
    })

    test('should handle /[]a/ with char class at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]a/'))
      expect(reports.length).toBe(1)
    })
  })

  describe('no options behavior', () => {
    test('rule should work without any options provided', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('rule should work with empty options object', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })

    test('rule should work with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noEmptyCharacterClassRule.create(context)
      visitor.Literal(createLiteralNode('/[]/'))
      expect(reports.length).toBe(1)
    })
  })
})
