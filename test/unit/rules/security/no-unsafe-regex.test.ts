import { describe, test, expect, beforeEach, vi } from 'vitest'
import { noUnsafeRegexRule } from '../../../../src/rules/security/no-unsafe-regex.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

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

function createRegexLiteral(pattern: string, flags = '', line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    regex: {
      pattern,
      flags,
    },
    value: new RegExp(pattern, flags),
    loc: {
      start: { line, column },
      end: { line, column: column + pattern.length + 3 },
    },
  }
}

function createNewRegExp(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [{ type: 'Literal', value: pattern }],
    loc: {
      start: { line, column },
      end: { line, column: column + pattern.length + 20 },
    },
  }
}

function createCallRegExp(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [{ type: 'Literal', value: pattern }],
    loc: {
      start: { line, column },
      end: { line, column: column + pattern.length + 15 },
    },
  }
}

function createDynamicNewRegExp(line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [{ type: 'Identifier', name: 'userInput' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createDynamicCallRegExp(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [{ type: 'Identifier', name: 'someVar' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDynamicRegExpWithMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [
      {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'req' },
        property: { type: 'Identifier', name: 'body' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createNonRegexNode(line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: 'hello world',
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonRegExpCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'String' },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-unsafe-regex rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noUnsafeRegexRule.meta.type).toBe('problem')
    })

    test('should have warning severity', () => {
      expect(noUnsafeRegexRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnsafeRegexRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noUnsafeRegexRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noUnsafeRegexRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning ReDoS', () => {
      expect(noUnsafeRegexRule.meta.docs?.description).toContain('ReDoS')
    })

    test('should mention security in description', () => {
      expect(noUnsafeRegexRule.meta.docs?.description.toLowerCase()).toContain('security')
    })

    test('should have correct URL', () => {
      expect(noUnsafeRegexRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unsafe-regex',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(visitor).toHaveProperty('Literal')
      expect(visitor).toHaveProperty('NewExpression')
      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('regex literals with unsafe patterns', () => {
    test('should report regex literal with nested quantifiers (a+)+', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
      expect(reports[0].message).toContain('ReDoS')
    })

    test('should report regex literal with nested quantifiers (a*)*', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a*)*'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report regex literal with nested quantifiers (a+)?', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)?'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report regex literal with nested quantifiers ([a+])+', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('([a+])+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report regex literal with nested quantifiers in pattern like a+ (not a ReDoS)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('a+'))

      expect(reports.length).toBe(0) // a+ alone is NOT a ReDoS
    })

    test('should not report regex literal with standalone * (not a ReDoS)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('a*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex literal with standalone {n,} quantifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a){1,}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex literal with overlapping character classes alone', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('[ab]+[bc]+'))

      expect(reports.length).toBe(0)
    })

    test('should report regex literal with complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should report pattern with nested quantifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('((a+)+)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })
  })

  describe('regex literals with safe patterns', () => {
    test('should not report simple regex literal /test/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report anchored regex /^[a-z]+$/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('^[a-z]+$'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with bounded repetition /\\d{3}-\\d{4}/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d{3}-\\d{4}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex literal /^\\w+$/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('^\\w+$'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex literal /\\d+/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex literal /hello/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('hello'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with simple alternation (a|b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b)'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with two alternations (a|b|c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c)'))

      expect(reports.length).toBe(0)
    })
  })

  describe('new RegExp() with string patterns', () => {
    test('should report new RegExp() with unsafe pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe regex pattern')
    })

    test('should not report new RegExp() with safe pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('^[a-z]+$'))

      expect(reports.length).toBe(0)
    })

    test('should report regex literal with complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })
  })

  describe('RegExp() call with string patterns', () => {
    test('should report RegExp() call with unsafe pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(a*)*'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unsafe regex pattern')
    })

    test('should not report RegExp() call with safe pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('^[a-z]+$'))

      expect(reports.length).toBe(0)
    })

    test('should report RegExp() call with nested quantifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(a+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })
  })

  describe('dynamic RegExp construction (injection risk)', () => {
    test('should report new RegExp(userInput) as injection risk', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dynamic input')
      expect(reports[0].message).toContain('injection')
    })

    test('should report RegExp(someVar) as injection risk', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dynamic input')
    })

    test('should report new RegExp() with MemberExpression argument as injection risk', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicRegExpWithMemberExpression())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dynamic input')
    })
  })

  describe('options: checkReDoS disabled', () => {
    test('should not report ReDoS issues when checkReDoS is false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports.length).toBe(0)
    })

    test('should still report injection risk when checkReDoS is false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dynamic input')
    })
  })

  describe('options: checkInjection disabled', () => {
    test('should not report injection risk when checkInjection is false', () => {
      const { context, reports } = createMockContext({ checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports.length).toBe(0)
    })

    test('should still report ReDoS issues when checkInjection is false', () => {
      const { context, reports } = createMockContext({ checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })
  })

  describe('options: both disabled', () => {
    test('should not report anything when both options are false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false, checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))
      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in Literal', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in Literal', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(() => visitor.Literal(123)).not.toThrow()
    })

    test('should not report non-regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createNonRegexNode())

      expect(reports.length).toBe(0)
    })

    test('should not report non-RegExp call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createNonRegExpCall())

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        value: 'hello',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [{ type: 'Literal', value: '(a+)+' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [{ type: 'Literal', value: '(a+)+' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', '', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a+)+', 8, 15))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location for RegExp() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(a+)+', 3, 5))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('options handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports.length).toBe(1)
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

      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.Literal(createRegexLiteral('(a+)+'))).not.toThrow()
    })
  })

  describe('message content', () => {
    test('should include the pattern in the message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports[0].message).toContain('(a+)+')
    })

    test('should include refactoring suggestion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports[0].message).toContain('Consider refactoring')
    })

    test('should include safe regex library suggestion in injection message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports[0].message).toContain('safe regex library')
    })

    test('should include escaping user input suggestion in injection message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports[0].message).toContain('escaping user input')
    })
  })
})
