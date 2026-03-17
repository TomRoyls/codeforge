import { describe, test, expect, vi } from 'vitest'
import { noUselessBackreferenceRule } from '../../../../src/rules/patterns/no-useless-backreference.js'
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
    getSource: () => '/\\(?<name>\\d+\\)\\k<name>/',
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

function createRegexLiteral(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    regex: {
      pattern,
      flags: '',
    },
    loc: {
      start: { line, column },
      end: { line, column: pattern.length + 4 },
    },
  }
}

function createRegexLiteralWithFlags(
  pattern: string,
  flags: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'Literal',
    regex: {
      pattern,
      flags,
    },
    loc: {
      start: { line, column },
      end: { line, column: pattern.length + flags.length + 4 },
    },
  }
}

function createStringLiteral(value: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw: `'${value}'`,
    loc: {
      start: { line, column },
      end: { line, column: value.length + 2 },
    },
  }
}

function createNumberLiteral(value: number, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw: value.toString(),
    loc: {
      start: { line, column },
      end: { line, column: value.toString().length },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

describe('no-useless-backreference rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessBackreferenceRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessBackreferenceRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessBackreferenceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessBackreferenceRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention backreference in description', () => {
      expect(noUselessBackreferenceRule.meta.docs?.description.toLowerCase()).toContain(
        'backreference',
      )
    })

    test('should mention regular expression in description', () => {
      expect(noUselessBackreferenceRule.meta.docs?.description.toLowerCase()).toContain('regular')
    })

    test('should have empty schema', () => {
      expect(noUselessBackreferenceRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUselessBackreferenceRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('Literal should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return object with only Literal method', () => {
      const { context } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['Literal'])
    })
  })

  describe('valid cases', () => {
    test('should not report valid named backreference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\d+)\\k<name>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid numeric backreference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)\\1'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with valid multiple backreferences', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\w+)\\k<a>-(?<b>\\w+)\\k<b>'))
      expect(reports.length).toBe(0)
    })

    test('should not report string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createStringLiteral('hello world'))
      expect(reports.length).toBe(0)
    })

    test('should not report number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createNumberLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('should not report regex without backreferences', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+\\w+'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with only named groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)(?<b>\\w+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with valid numeric backreferences', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)-(\\w+)\\1\\2'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with valid mixed backreferences', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\w+)\\k<name>-(\\d+)\\1'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<name>\\d+)\\k<name>', 'gi'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with just groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createIdentifier('x'))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report backreference to non-existent named group', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<nonexistent>'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should report backreference to non-existent numbered group', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\9'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should report named backreference when only numbered groups exist', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)\\k<name>'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should report numbered backreference when only named groups exist', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\d+)\\1'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should report correct location for useless backreference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<nonexistent>', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report multiple useless backreferences', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>\\k<bar>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference to undefined named group', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<b>\\k<c>'))
      expect(reports.length).toBe(1)
    })

    test('should report high numbered backreference without groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\99'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference with non-existent group after valid groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>\\k<b>'))
      expect(reports.length).toBe(1)
    })

    test('should report only when no groups exist for backreference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\1\\2\\3'))
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex without pattern property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { flags: '' } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with null pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { pattern: null } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with undefined pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: {} }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = createRegexLiteral('\\k<nonexistent>') as Record<string, unknown>
      delete node.loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Identifier', name: 'x' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with special characters in named group', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name123>\\d+)\\k<name123>'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex pattern as number type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { pattern: 123, flags: '' } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex pattern with nested groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?:(?<a>\\d+)|(?<b>\\w+))\\k<a>'))
      expect(reports.length).toBe(0)
    })

    test('should handle empty named group', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<>)\\k<>'))
      expect(reports.length).toBe(0)
    })
  })
})
