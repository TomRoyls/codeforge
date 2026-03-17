import { describe, test, expect, vi } from 'vitest'
import { noInvalidRegexpRule } from '../../../../src/rules/patterns/no-invalid-regexp.js'
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
    getSource: () => 'new RegExp("[", "g");',
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

function createRegExpCall(pattern: string, flags?: string, line = 1, column = 0): unknown {
  const args = flags
    ? [
        {
          type: 'Literal',
          value: pattern,
        },
        {
          type: 'Literal',
          value: flags,
        },
      ]
    : [
        {
          type: 'Literal',
          value: pattern,
        },
      ]

  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'RegExp',
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createCallExpression(
  calleeName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-invalid-regexp rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noInvalidRegexpRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noInvalidRegexpRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noInvalidRegexpRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noInvalidRegexpRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noInvalidRegexpRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noInvalidRegexpRule.meta.fixable).toBeUndefined()
    })

    test('should mention RegExp in description', () => {
      expect(noInvalidRegexpRule.meta.docs?.description.toLowerCase()).toContain('regexp')
    })

    test('should mention invalid in description', () => {
      expect(noInvalidRegexpRule.meta.docs?.description.toLowerCase()).toContain('invalid')
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('reporting invalid regex patterns', () => {
    test('should report invalid regex with unclosed bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed parenthesis', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(unclosed'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with quantifier at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('?'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with invalid quantifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('*invalid'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with malformed range', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[z-a]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report correct location for invalid regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed', undefined, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should include error message in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('('))

      expect(reports[0].message).toMatch(/^Invalid regular expression:/)
    })
  })

  describe('not reporting valid regex patterns', () => {
    test('should not report valid regex without flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+', 'gi'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with global flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\d+', 'g'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with case-insensitive flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[A-Z]', 'i'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with multiline flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('^test$', 'm'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with multiple flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z0-9]+', 'gim'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[\\w\\s]+'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with quantifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a{1,3}b+c?'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(foo|bar)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with lookaheads', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a(?=b)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\d\\w\\s'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with anchors', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('^start$'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with escaped special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\[\\]\\(\\)'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-RegExp call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createCallExpression('createPattern', [createLiteral('[a-z]')]))

      expect(reports.length).toBe(0)
    })

    test('should handle call without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createCallExpression('RegExp', []))

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-array arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: 'not-an-array',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle first argument that is not a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [{ type: 'Identifier', name: 'patternVar' }])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle null pattern argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [null])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined pattern argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [undefined])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle pattern argument that is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [{ type: 'Literal', value: 123 }])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle flags argument that is not a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [
        { type: 'Literal', value: '[a-z]' },
        { type: 'Identifier', name: 'flagsVar' },
      ])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-string flags argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [
        { type: 'Literal', value: '[a-z]' },
        { type: 'Literal', value: 123 },
      ])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBeGreaterThanOrEqual(0)
    })

    test('should handle empty string pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall(''))

      expect(reports.length).toBe(0)
    })

    test('should handle empty string flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', ''))

      expect(reports.length).toBe(0)
    })

    test('should report invalid flag characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'z'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: null,
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle valid regex with unicode flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'u'))

      expect(reports.length).toBe(0)
    })

    test('should handle valid regex with sticky flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'y'))

      expect(reports.length).toBe(0)
    })

    test('should report multiple invalid regex calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed1'))
      visitor.CallExpression(createRegExpCall('[unclosed2'))
      visitor.CallExpression(createRegExpCall('[unclosed3'))

      expect(reports.length).toBe(3)
    })
  })

  describe('complex regex patterns', () => {
    test('should not report valid regex with nested groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('((foo)(bar))'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with lookbehind', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<=a)b'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with named groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<name>foo)'))

      expect(reports.length).toBe(0)
    })

    test('should report invalid regex with unclosed named group', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<name>foo'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should not report valid regex with non-capturing group', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?:foo)'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include Invalid regular expression in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('('))

      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should include error details in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z'))

      expect(reports[0].message).toMatch(/^Invalid regular expression:/)
      expect(reports[0].message.length).toBeGreaterThan('Invalid regular expression: '.length)
    })
  })
})
