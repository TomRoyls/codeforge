import { describe, test, expect, vi } from 'vitest'
import { preferStringReplaceAllRule } from '../../../../src/rules/patterns/prefer-string-replace-all.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createReplaceWithGlobalRegex(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'str' },
      property: { type: 'Identifier', name: 'replace' },
      computed: false,
    },
    arguments: [
      {
        type: 'Literal',
        value: null,
        raw: '/foo/g',
        regex: { pattern: 'foo', flags: 'g' },
      },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createReplaceWithCaseInsensitiveRegex(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'str' },
      property: { type: 'Identifier', name: 'replace' },
      computed: false,
    },
    arguments: [
      {
        type: 'Literal',
        value: null,
        raw: '/foo/gi',
        regex: { pattern: 'foo', flags: 'gi' },
      },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createReplaceWithStringArg(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'str' },
      property: { type: 'Identifier', name: 'replace' },
      computed: false,
    },
    arguments: [
      { type: 'Literal', value: 'foo' },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createReplaceWithNonGlobalRegex(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'str' },
      property: { type: 'Identifier', name: 'replace' },
      computed: false,
    },
    arguments: [
      {
        type: 'Literal',
        value: null,
        raw: '/foo/',
        regex: { pattern: 'foo', flags: '' },
      },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createReplaceAllCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'str' },
      property: { type: 'Identifier', name: 'replaceAll' },
      computed: false,
    },
    arguments: [
      { type: 'Literal', value: 'foo' },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createOtherMethodCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'str' },
      property: { type: 'Identifier', name: 'trim' },
      computed: false,
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('prefer-string-replace-all rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferStringReplaceAllRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStringReplaceAllRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(preferStringReplaceAllRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(preferStringReplaceAllRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferStringReplaceAllRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(preferStringReplaceAllRule.meta.docs?.description).toContain('replaceAll')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should report replace() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithGlobalRegex())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('replaceAll')
    })

    test('should not report replace() with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithStringArg())

      expect(reports.length).toBe(0)
    })

    test('should not report replace() with non-global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithNonGlobalRegex())

      expect(reports.length).toBe(0)
    })

    test('should not report replaceAll() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceAllCall())

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createOtherMethodCall())

      expect(reports.length).toBe(0)
    })

    test('should not report replace() with case-insensitive regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithCaseInsensitiveRegex())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithGlobalRegex(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should include pattern in suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithGlobalRegex())

      expect(reports[0].message).toContain('foo')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
          { type: 'Literal', value: 'x' },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'replace' },
        arguments: [{ type: 'Literal', value: 'test' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: true,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
          { type: 'Literal', value: 'x' },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should include actionable guidance', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithGlobalRegex())

      expect(reports[0].message).toContain('replaceAll')
    })

    test('should mention explicit alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      visitor.CallExpression(createReplaceWithGlobalRegex())

      expect(reports[0].message).toContain('instead of')
    })
  })

  describe('missing edge cases', () => {
    test('should handle RegexLiteral without pattern property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { flags: 'g' },
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('replaceAll')
      expect(reports[0].message).not.toContain('foo')
    })

    test('should handle string regex without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: 'test',
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replace' },
          computed: true,
        },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle non-CallExpression node in isStringReplaceCall', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'replace' },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle Literal argument with non-Literal non-RegExpLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Identifier',
            name: 'pattern',
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle case-sensitive global regex with multiple flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { pattern: 'foo', flags: 'gm' },
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('should handle string regex with raw but not global flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/i',
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle complex regex with escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { pattern: '\\d+', flags: 'g' },
          },
          { type: 'Literal', value: 'X' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\d+')
    })
  })
})
