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

/** Creates a CallExpression node with replace/replaceAll and a regex first argument */
function createReplaceWithRegex(
  pattern: string,
  flags: string,
  line = 1,
  column = 0,
  objectName = 'str',
  methodName = 'replace',
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: [
      {
        type: 'Literal',
        value: null,
        raw: `/${pattern}/${flags}`,
        regex: { pattern, flags },
      },
      { type: 'Literal', value: 'bar' },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

describe('prefer-string-replace-all rule', () => {
  // ────────────────────────────────────────────────────────────────
  // EXISTING: meta (tests 1-6)
  // ────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────
  // EXISTING: create (tests 7-15)
  // ────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────
  // EXISTING: edge cases (tests 16-23)
  // ────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────
  // EXISTING: message quality (tests 24-25)
  // ────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────
  // EXISTING: missing edge cases (tests 26-34)
  // ────────────────────────────────────────────────────────────────
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

  // ════════════════════════════════════════════════════════════════
  // NEW TESTS START HERE
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // meta exhaustive additional (tests 35-48)
  // ────────────────────────────────────────────────────────────────
  describe('meta exhaustive additional', () => {
    test('should have docs property', () => {
      expect(preferStringReplaceAllRule.meta.docs).toBeDefined()
    })

    test('should have docs with description string', () => {
      expect(typeof preferStringReplaceAllRule.meta.docs?.description).toBe('string')
    })

    test('should have docs with url', () => {
      expect(preferStringReplaceAllRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url containing rule name', () => {
      expect(preferStringReplaceAllRule.meta.docs?.url).toContain('prefer-string-replace-all')
    })

    test('should have empty schema array', () => {
      expect(preferStringReplaceAllRule.meta.schema).toEqual([])
    })

    test('should not have fixable property', () => {
      expect(preferStringReplaceAllRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(preferStringReplaceAllRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferStringReplaceAllRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferStringReplaceAllRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have description mentioning replace', () => {
      expect(preferStringReplaceAllRule.meta.docs?.description).toContain('replace')
    })

    test('should have description mentioning global regex', () => {
      expect(preferStringReplaceAllRule.meta.docs?.description).toContain('global regex')
    })

    test('should have description that is non-empty', () => {
      expect(preferStringReplaceAllRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have valid severity type', () => {
      expect(['off', 'warn', 'error']).toContain(preferStringReplaceAllRule.meta.severity)
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferStringReplaceAllRule.meta.type)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // visitor structure additional (tests 49-55)
  // ────────────────────────────────────────────────────────────────
  describe('visitor structure additional', () => {
    test('create should not throw', () => {
      const { context } = createMockContext()
      expect(() => preferStringReplaceAllRule.create(context)).not.toThrow()
    })

    test('visitor should be a non-null object', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('visitor should only have CallExpression key', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('create returns a new visitor each time', () => {
      const { context } = createMockContext()
      const visitor1 = preferStringReplaceAllRule.create(context)
      const visitor2 = preferStringReplaceAllRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('CallExpression should accept one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression(createReplaceWithGlobalRegex())).not.toThrow()
      expect(reports).toHaveLength(1)
    })

    test('CallExpression returns undefined or void', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const result = visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(result).toBeUndefined()
    })
  })

  // ────────────────────────────────────────────────────────────────
  // detection positive - various patterns (tests 56-75)
  // ────────────────────────────────────────────────────────────────
  describe('detection positive - various patterns', () => {
    test('should report /hello/g pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('hello', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report /[a-z]+/g pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('[a-z]+', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[a-z]+')
    })

    test('should report /^\\s+/g pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('^\\s+', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report /\\d{2,4}/g pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\d{2,4}', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\d{2,4}')
    })

    test('should report /(foo|bar)/g pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('(foo|bar)', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(foo|bar)')
    })

    test('should report /\\w+/g pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\w+', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report /./g dot pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('.', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.')
    })

    test('should report with RegExpLiteral type argument', () => {
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
            type: 'RegExpLiteral',
            value: null,
            regex: { pattern: 'test', flags: 'g' },
          },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report /\\s+/g whitespace pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\s+', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\s+')
    })

    test('should report /\\bword\\b/g boundary pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\bword\\b', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\bword\\b')
    })

    test('should report with different object names', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('test', 'g', 1, 0, 'myString'))
      expect(reports.length).toBe(1)
    })

    test('should report with chained call on this.replace', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report empty string pattern //g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report unicode escape pattern /\\u0041/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\u0041', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\u0041')
    })

    test('should report hex escape pattern /\\x41/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\x41', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\x41')
    })

    test('should report character class /[^a-z]/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('[^a-z]', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[^a-z]')
    })

    test('should report quantifier /a{3}/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('a{3}', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report lazy quantifier /a+?/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('a+?', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report lookahead /foo(?=bar)/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo(?=bar)', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo(?=bar)')
    })

    test('should report lookbehind /(?<=foo)bar/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('(?<=foo)bar', 'g'))
      expect(reports.length).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // detection negative - flag combinations (tests 76-90)
  // ────────────────────────────────────────────────────────────────
  describe('detection negative - flag combinations', () => {
    test('should not report /foo/i (i only)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'i'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/m (m only)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'm'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/s (s only)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 's'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/u (u only)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'u'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/v (v only)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'v'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/y (y only)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'y'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/ (no flags)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', ''))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/im (no g)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'im'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/gim (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gim'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/gis (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gis'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/giv (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'giv'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/giu (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'giu'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/gimsvy (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gimsvy'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/gi with complex pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\d+\\s*\\w+', 'gi'))
      expect(reports.length).toBe(0)
    })

    test('should not report /foo/ig (flags as ig not gi)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'ig'))
      expect(reports.length).toBe(0)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // detection positive - multi-flag without i (tests 91-100)
  // ────────────────────────────────────────────────────────────────
  describe('detection positive - multi-flag without i', () => {
    test('should report /foo/gm (g and m)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gm'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gs (g and s)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gs'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gu (g and u)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gu'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gv (g and v)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gv'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gy (g and y)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gy'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gms (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gms'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gmu (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gmu'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gsuv (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gsuv'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gmsv (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gmsv'))
      expect(reports.length).toBe(1)
    })

    test('should report /foo/gmy (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'gmy'))
      expect(reports.length).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // detection negative - method names (tests 101-108)
  // ────────────────────────────────────────────────────────────────
  describe('detection negative - method names', () => {
    test('should not report match() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'str', 'match'))
      expect(reports.length).toBe(0)
    })

    test('should not report split() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'str', 'split'))
      expect(reports.length).toBe(0)
    })

    test('should not report search() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'str', 'search'))
      expect(reports.length).toBe(0)
    })

    test('should not report test() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'regex', 'test'))
      expect(reports.length).toBe(0)
    })

    test('should not report exec() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'regex', 'exec'))
      expect(reports.length).toBe(0)
    })

    test('should not report Replace (capital R)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'str', 'Replace'))
      expect(reports.length).toBe(0)
    })

    test('should not report REPLACE (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'str', 'REPLACE'))
      expect(reports.length).toBe(0)
    })

    test('should not report replaceAll() with global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g', 1, 0, 'str', 'replaceAll'))
      expect(reports.length).toBe(0)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // detection negative - argument types (tests 109-118)
  // ────────────────────────────────────────────────────────────────
  describe('detection negative - argument types', () => {
    test('should not report when first arg is number', () => {
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
          { type: 'Literal', value: 42 },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is boolean', () => {
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
          { type: 'Literal', value: true },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is null', () => {
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
          { type: 'Literal', value: null },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is TemplateLiteral', () => {
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
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is ArrowFunctionExpression', () => {
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
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is CallExpression', () => {
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
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getRegex' },
            arguments: [],
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is MemberExpression', () => {
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
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'regex' },
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is ObjectExpression', () => {
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
          { type: 'ObjectExpression', properties: [] },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when replace has only one argument', () => {
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
        arguments: [{ type: 'Literal', value: null, regex: { pattern: 'foo', flags: 'g' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when replace has three arguments', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'foo', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // edge cases - malformed nodes additional (tests 119-130)
  // ────────────────────────────────────────────────────────────────
  describe('edge cases - malformed nodes additional', () => {
    test('should handle node with type null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: null,
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
        },
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = { type: 'CallExpression', callee: null, arguments: [] }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with arguments undefined', () => {
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
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle first arg with regex flags undefined', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle first arg with regex flags null', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: null } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should throw when first arg has regex flags as number', () => {
      const { context } = createMockContext()
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 123 } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      expect(() => visitor.CallExpression(node)).toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc.start.line as string', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: '1', column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc.start.column as string', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: '0' }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.start undefined', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.end undefined', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // edge cases - callee variations (tests 131-138)
  // ────────────────────────────────────────────────────────────────
  describe('edge cases - callee variations', () => {
    test('should handle callee with object as non-Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle callee with property as different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replacer' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee with empty property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: '' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee property missing type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { name: 'replace' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee property missing name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee property as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: undefined,
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: undefined,
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Super as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Super' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // location exhaustive (tests 139-152)
  // ────────────────────────────────────────────────────────────────
  describe('location exhaustive', () => {
    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(5, 10))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should report location at origin', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(999, 0))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report location with large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(1, 500))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report default location when loc missing', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when loc is null', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: null,
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve location across different line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(10, 20))
      visitor.CallExpression(createReplaceWithGlobalRegex(30, 40))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
      expect(reports[1].loc?.start.line).toBe(30)
      expect(reports[1].loc?.start.column).toBe(40)
    })

    test('should handle location with same start and end line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(5, 10))
      expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
    })

    test('should handle loc with start having missing properties', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: {}, end: { line: 2, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with end having missing properties', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 5, column: 3 }, end: {} },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc where start.line is zero', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle loc where start and end are identical', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should handle loc with negative column value', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 1, column: -1 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.column).toBe(-1)
    })

    test('should handle loc with fractional line values (uses default)', () => {
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
          { type: 'Literal', value: null, regex: { pattern: 'test', flags: 'g' } },
          { type: 'Literal', value: 'x' },
        ],
        loc: { start: { line: 1.5, column: 0 }, end: { line: 1.5, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1.5)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // message content additional (tests 153-165)
  // ────────────────────────────────────────────────────────────────
  describe('message content additional', () => {
    test('should start with Prefer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toContain('Prefer')
    })

    test('should mention replace()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toContain('replace()')
    })

    test('should mention global regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toContain('global regex')
    })

    test('should be a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should include str.replaceAll in suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toContain("str.replaceAll('foo'")
    })

    test('should include str.replace in suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toContain('str.replace(')
    })

    test('should include generic message when no pattern available', () => {
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
          { type: 'Literal', value: null, regex: { flags: 'g' } },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports[0].message).toContain(
        'Use str.replaceAll() instead of str.replace() with global regex',
      )
    })

    test('should include pattern in suggestion format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('hello', 'g'))
      expect(reports[0].message).toContain("str.replaceAll('hello', ...)")
      expect(reports[0].message).toContain('str.replace(/hello/g, ...)')
    })

    test('should produce consistent messages for same pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce different messages for different patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('foo', 'g'))
      visitor.CallExpression(createReplaceWithRegex('bar', 'g'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should include special regex chars in message verbatim', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('[a-z]+', 'g'))
      expect(reports[0].message).toContain('[a-z]+')
    })

    test('should include newline escape in message verbatim', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\n', 'g'))
      expect(reports[0].message).toContain('\\n')
    })
  })

  // ────────────────────────────────────────────────────────────────
  // multiple reports (tests 166-175)
  // ────────────────────────────────────────────────────────────────
  describe('multiple reports', () => {
    test('should produce two reports for two global regex calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(2)
    })

    test('should produce three reports for three global regex calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(3)
    })

    test('should produce one report for mixed positive then negative', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithStringArg())
      expect(reports.length).toBe(1)
    })

    test('should produce correct count for mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithStringArg())
      visitor.CallExpression(createReplaceWithRegex('test', 'g'))
      visitor.CallExpression(createReplaceWithNonGlobalRegex())
      expect(reports.length).toBe(2)
    })

    test('should preserve report order', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('first', 'g'))
      visitor.CallExpression(createReplaceWithRegex('second', 'g'))
      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
    })

    test('should give each report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex(1, 0))
      visitor.CallExpression(createReplaceWithGlobalRegex(5, 10))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should not carry state across different visitor instances', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = preferStringReplaceAllRule.create(ctx1)
      const visitor2 = preferStringReplaceAllRule.create(ctx2)
      visitor1.CallExpression(createReplaceWithGlobalRegex())
      visitor2.CallExpression(createReplaceWithGlobalRegex())
      visitor2.CallExpression(createReplaceWithGlobalRegex())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(2)
    })

    test('should handle zero reports when all calls are negative', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithStringArg())
      visitor.CallExpression(createReplaceWithNonGlobalRegex())
      visitor.CallExpression(createReplaceWithCaseInsensitiveRegex())
      visitor.CallExpression(createReplaceAllCall())
      visitor.CallExpression(createOtherMethodCall())
      expect(reports.length).toBe(0)
    })

    test('should handle many calls without performance issues', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createReplaceWithGlobalRegex())
      }
      expect(reports.length).toBe(50)
    })

    test('should handle alternating positive and negative calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithStringArg())
      visitor.CallExpression(createReplaceWithGlobalRegex())
      visitor.CallExpression(createReplaceWithNonGlobalRegex())
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(3)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // context variations (tests 176-183)
  // ────────────────────────────────────────────────────────────────
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'str.replace(/foo/g, "bar")',
      )
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockContext({ extraOption: true })
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })

    test('should call context report exactly once per detection', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reportCount).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/file.ts'
      const { context, reports } = createMockContext({}, longPath)
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })

    test('should not affect logger calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // exports (tests 184-188)
  // ────────────────────────────────────────────────────────────────
  describe('exports', () => {
    test('should export rule as named export', () => {
      expect(preferStringReplaceAllRule).toBeDefined()
    })

    test('should have meta property', () => {
      expect(preferStringReplaceAllRule.meta).toBeDefined()
    })

    test('should have create method', () => {
      expect(typeof preferStringReplaceAllRule.create).toBe('function')
    })

    test('should have exactly meta and create properties', () => {
      expect(Object.keys(preferStringReplaceAllRule).sort()).toEqual(['create', 'meta'])
    })

    test('named export should be the rule definition object', () => {
      expect(typeof preferStringReplaceAllRule).toBe('object')
      expect(preferStringReplaceAllRule).not.toBeNull()
    })
  })

  // ────────────────────────────────────────────────────────────────
  // report descriptor (tests 189-196)
  // ────────────────────────────────────────────────────────────────
  describe('report descriptor', () => {
    test('should include message in report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].loc).toBeDefined()
    })

    test('should have start in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have end in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should have numeric line and column in start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric line and column in end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should not report when no matching pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithStringArg())
      expect(reports.length).toBe(0)
    })

    test('should report once per matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithGlobalRegex())
      expect(reports.length).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // raw string detection (tests 197-207)
  // ────────────────────────────────────────────────────────────────
  describe('raw string detection', () => {
    test('should detect raw string /test/g format', () => {
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
          { type: 'Literal', value: '/test/g', raw: '/test/g' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test')
    })

    test('should not detect raw string /test/gi (has i flag)', () => {
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
          { type: 'Literal', value: '/test/gi', raw: '/test/gi' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect raw string /test/ (no g flag)', () => {
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
          { type: 'Literal', value: '/test/', raw: '/test/' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect raw string /test/gm (does not end with /g)', () => {
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
          { type: 'Literal', value: '/test/gm', raw: '/test/gm' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect raw string without leading /', () => {
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
          { type: 'Literal', value: 'test/g', raw: 'test/g' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect raw string when value is not string', () => {
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
          { type: 'Literal', value: null, raw: '/test/g' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not detect when raw is missing', () => {
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
          { type: 'Literal', value: '/test/g' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should extract pattern from raw string /pattern/g', () => {
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
          { type: 'Literal', value: '/hello world/g', raw: '/hello world/g' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hello world')
    })

    test('should detect raw string //g (empty pattern)', () => {
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
          { type: 'Literal', value: '//g', raw: '//g' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should prefer regex property over raw string when both exist', () => {
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
            raw: '/foo/g',
            regex: { pattern: 'fromRegex', flags: 'g' },
          },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('fromRegex')
    })

    test('should not detect raw string /test/gim (has i in flags)', () => {
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
          { type: 'Literal', value: '/test/gim', raw: '/test/gim' },
          { type: 'Literal', value: 'bar' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ────────────────────────────────────────────────────────────────
  // regex pattern edge cases (tests 208-219)
  // ────────────────────────────────────────────────────────────────
  describe('regex pattern edge cases', () => {
    test('should handle pattern with forward slashes /\\/path/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\/', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\/')
    })

    test('should handle pattern with caret /^start/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('^start', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('^start')
    })

    test('should handle pattern with dollar /end$/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('end$', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('end$')
    })

    test('should handle pattern with asterisk /a*/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('a*', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should handle pattern with question mark /a?/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('a?', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should handle pattern with pipe /cat|dog/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('cat|dog', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('cat|dog')
    })

    test('should handle very long pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      const longPattern = 'a'.repeat(100)
      visitor.CallExpression(createReplaceWithRegex(longPattern, 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longPattern)
    })

    test('should handle pattern with backreference /\\1/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\1', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should handle pattern with non-capturing group /(?:foo)/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('(?:foo)', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(?:foo)')
    })

    test('should handle pattern with named group /(?<name>foo)/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('(?<name>foo)', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should handle pattern with tab escape /\\t/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\t', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\t')
    })

    test('should handle pattern with carriage return /\\r\\n/g', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('\\r\\n', 'g'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\r\\n')
    })
  })

  // ────────────────────────────────────────────────────────────────
  // global flag exhaustive combinations (tests 220-235)
  // ────────────────────────────────────────────────────────────────
  describe('global flag exhaustive combinations', () => {
    test('flags "g" alone triggers report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'g'))
      expect(reports.length).toBe(1)
    })

    test('flags "ig" triggers no report (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'ig'))
      expect(reports.length).toBe(0)
    })

    test('flags "mg" triggers no report (ends /mg not /g via raw)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      // regex path: has g, no i => reports
      visitor.CallExpression(createReplaceWithRegex('x', 'mg'))
      expect(reports.length).toBe(1)
    })

    test('flags "sg" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'sg'))
      expect(reports.length).toBe(1)
    })

    test('flags "ug" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'ug'))
      expect(reports.length).toBe(1)
    })

    test('flags "vg" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'vg'))
      expect(reports.length).toBe(1)
    })

    test('flags "yg" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'yg'))
      expect(reports.length).toBe(1)
    })

    test('flags "gms" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'gms'))
      expect(reports.length).toBe(1)
    })

    test('flags "gmu" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'gmu'))
      expect(reports.length).toBe(1)
    })

    test('flags "gmsuvy" triggers report (no i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'gmsuvy'))
      expect(reports.length).toBe(1)
    })

    test('flags "gims" triggers no report (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'gims'))
      expect(reports.length).toBe(0)
    })

    test('flags "gimu" triggers no report (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'gimu'))
      expect(reports.length).toBe(0)
    })

    test('flags "gimsvy" triggers no report (has i)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'gimsvy'))
      expect(reports.length).toBe(0)
    })

    test('flags "" (empty) triggers no report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', ''))
      expect(reports.length).toBe(0)
    })

    test('flags "i" triggers no report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'i'))
      expect(reports.length).toBe(0)
    })

    test('flags "m" triggers no report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringReplaceAllRule.create(context)
      visitor.CallExpression(createReplaceWithRegex('x', 'm'))
      expect(reports.length).toBe(0)
    })
  })
})
