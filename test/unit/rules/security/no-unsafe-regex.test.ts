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

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnsafeRegexRule.meta.schema)).toBe(true)
    })

    test('should have schema with checkReDoS property', () => {
      const schema = noUnsafeRegexRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('checkReDoS')
    })

    test('should have schema with checkInjection property', () => {
      const schema = noUnsafeRegexRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('checkInjection')
    })

    test('should have fixable as undefined', () => {
      expect(noUnsafeRegexRule.meta.fixable).toBeUndefined()
    })

    test('should have schema object type', () => {
      const schema = noUnsafeRegexRule.meta.schema as Array<Record<string, unknown>>
      expect((schema[0] as Record<string, unknown>).type).toBe('object')
    })

    test('should have checkReDoS default true in schema', () => {
      const schema = noUnsafeRegexRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.checkReDoS.default).toBe(true)
    })

    test('should have checkInjection default true in schema', () => {
      const schema = noUnsafeRegexRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.checkInjection.default).toBe(true)
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

    test('should return functions for each visitor method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
      expect(typeof visitor.NewExpression).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeRegexRule.create(context)
      const visitor2 = noUnsafeRegexRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should use default options when none provided', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      // checkReDoS defaults to true, so this should report
      visitor.Literal(createRegexLiteral('(a+)+'))
      expect(reports.length).toBe(1)
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

  describe('nested quantifier patterns - expanded', () => {
    test('should report (a?)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a?)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report (x+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(x+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report (ab+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(ab+)+'))

      expect(reports.length).toBe(1)
    })

    test('should report (a|b+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report (?:a+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(?:a+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report ([a-z]+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('([a-z]+)+'))

      expect(reports.length).toBe(1)
    })

    test('should report (\\w+)* pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(\\w+)*'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report (a+)* pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)*'))

      expect(reports.length).toBe(1)
    })

    test('should report (a*)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a*)+'))

      expect(reports.length).toBe(1)
    })

    test('should report (b?)* pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(b?)*'))

      expect(reports.length).toBe(1)
    })

    test('should report (\\d+)? pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)?'))

      expect(reports.length).toBe(1)
    })

    test('should report nested groups ((a+)+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('((a+)+)+'))

      expect(reports.length).toBe(1)
    })

    test('should report (.*?)* pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(.*?)*'))

      expect(reports.length).toBe(1)
    })

    test('should report (.+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(.+)+'))

      expect(reports.length).toBe(1)
    })

    test('should report (a*b*)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a*b*)+'))

      expect(reports.length).toBe(1)
    })

    test('should report ([ab]+?)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('([ab]+?)+'))

      expect(reports.length).toBe(1)
    })

    test('should report (a+)* with global flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)*', 'g'))

      expect(reports.length).toBe(1)
    })

    test('should report (x+)+ with case-insensitive flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(x+)+', 'i'))

      expect(reports.length).toBe(1)
    })

    test('should report (a+)+ with multiline flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'm'))

      expect(reports.length).toBe(1)
    })
  })

  describe('complex alternation patterns - expanded', () => {
    test('should report (a|b|c|d) with 3 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should report (a|b|c|d|e) with 4 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d|e)'))

      expect(reports.length).toBe(1)
    })

    test('should report (x|y|z|w|v|u) with 5 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(x|y|z|w|v|u)'))

      expect(reports.length).toBe(1)
    })

    test('should report (\\d|\\w|\\s|[a-z]|[A-Z]) with 4 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d|\\w|\\s|[a-z]|[A-Z])'))

      expect(reports.length).toBe(1)
    })

    test('should report (?:a|b|c|d) non-capturing group with complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(?:a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should report pattern with both nested quantifiers and complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+|b|c|d)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should report (red|green|blue|yellow|purple) complex alternation with words', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(red|green|blue|yellow|purple)'))

      expect(reports.length).toBe(1)
    })

    test('should report (cat|dog|fish|bird) with 3 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(cat|dog|fish|bird)'))

      expect(reports.length).toBe(1)
    })

    test('should report (one|two|three|four|five|six) with 5 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(one|two|three|four|five|six)'))

      expect(reports.length).toBe(1)
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

  describe('safe regex patterns - extended', () => {
    test('should not report empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should not report dot pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('.'))

      expect(reports.length).toBe(0)
    })

    test('should not report character class [abc]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('[abc]'))

      expect(reports.length).toBe(0)
    })

    test('should not report character range [a-z]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('[a-z]'))

      expect(reports.length).toBe(0)
    })

    test('should not report negated character class [^abc]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('[^abc]'))

      expect(reports.length).toBe(0)
    })

    test('should not report word boundary \\b', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\bword\\b'))

      expect(reports.length).toBe(0)
    })

    test('should not report anchored pattern ^test$', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('^test$'))

      expect(reports.length).toBe(0)
    })

    test('should not report simple email-like pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('[a-z]+@[a-z]+\\.[a-z]{2,3}'))

      expect(reports.length).toBe(0)
    })

    test('should not report URL-like pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('https?://[a-z0-9.-]+'))

      expect(reports.length).toBe(0)
    })

    test('should not report simple date pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d{4}-\\d{2}-\\d{2}'))

      expect(reports.length).toBe(0)
    })

    test('should not report hex color pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('#[0-9a-fA-F]{6}'))

      expect(reports.length).toBe(0)
    })

    test('should not report IP address pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'))

      expect(reports.length).toBe(0)
    })

    test('should not report simple phone pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d{3}-\\d{3}-\\d{4}'))

      expect(reports.length).toBe(0)
    })

    test('should not report tab pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\t'))

      expect(reports.length).toBe(0)
    })

    test('should not report newline pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\n'))

      expect(reports.length).toBe(0)
    })

    test('should not report unicode pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\u0041'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-capturing group (?:abc)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(?:abc)'))

      expect(reports.length).toBe(0)
    })

    test('should not report lookahead (?=abc)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(?=abc)'))

      expect(reports.length).toBe(0)
    })

    test('should not report negative lookahead (?!abc)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(?!abc)'))

      expect(reports.length).toBe(0)
    })

    test('should not report digits only pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+'))

      expect(reports.length).toBe(0)
    })

    test('should not report whitespace pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\s+'))

      expect(reports.length).toBe(0)
    })

    test('should not report word characters pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\w+'))

      expect(reports.length).toBe(0)
    })

    test('should not report escaped special chars pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\.\\*\\+\\?'))

      expect(reports.length).toBe(0)
    })

    test('should not report exact match pattern ^abc$', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('^abc$'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-greedy quantifier without nesting abc+?', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('abc+?'))

      expect(reports.length).toBe(0)
    })

    test('should not report single digit pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('\\d'))

      expect(reports.length).toBe(0)
    })

    test('should not report UUID-like pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(
        createRegexLiteral('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report bounded repetition only pattern a{2,5}', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('a{2,5}'))

      expect(reports.length).toBe(0)
    })

    test('should not report alternation outside groups a|b', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('a|b'))

      expect(reports.length).toBe(0)
    })

    test('should not report complex but safe pattern with only 2 pipes in group', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(foo|bar|baz)'))

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

    test('should report new RegExp() with nested quantifier pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(x+)*'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report new RegExp() with complex alternation pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should not report new RegExp() with simple safe pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('\\d+'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp() with anchored safe pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('^\\w+$'))

      expect(reports.length).toBe(0)
    })

    test('should report new RegExp() with (.*?)? pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(.*?)?'))

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp() with pattern containing both issues', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a+|b|c|d)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
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

    test('should report RegExp() call with complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(a|b|c|d|e)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should not report RegExp() call with safe bounded repetition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('\\d{3}'))

      expect(reports.length).toBe(0)
    })

    test('should not report RegExp() call with simple word pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('hello'))

      expect(reports.length).toBe(0)
    })

    test('should report RegExp() call with (\\w+)? pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(\\w+)?'))

      expect(reports.length).toBe(1)
    })

    test('should report RegExp() call with (x+)+ pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(x+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(x+)+')
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

    test('should report new RegExp() with Identifier at different location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp(10, 5))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('dynamic input')
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report RegExp() call with Identifier at different location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp(7, 3))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report MemberExpression argument via CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

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

    test('should not report complex alternation when checkReDoS is false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(0)
    })

    test('should not report nested quantifier in new RegExp when checkReDoS is false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a+)+'))

      expect(reports.length).toBe(0)
    })

    test('should not report nested quantifier in RegExp call when checkReDoS is false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(a+)+'))

      expect(reports.length).toBe(0)
    })

    test('should still report injection via CallExpression when checkReDoS is false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp())

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

    test('should not report dynamic CallExpression when checkInjection is false', () => {
      const { context, reports } = createMockContext({ checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp())

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression arg when checkInjection is false', () => {
      const { context, reports } = createMockContext({ checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicRegExpWithMemberExpression())

      expect(reports.length).toBe(0)
    })

    test('should still report complex alternation when checkInjection is false', () => {
      const { context, reports } = createMockContext({ checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
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

    test('should not report complex alternation when both options false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false, checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(0)
    })

    test('should not report dynamic CallExpression when both options false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false, checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp())

      expect(reports.length).toBe(0)
    })

    test('should not report safe patterns when both options false', () => {
      const { context, reports } = createMockContext({ checkReDoS: false, checkInjection: false })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('test'))
      visitor.NewExpression(createNewRegExp('abc'))

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

  describe('edge cases - extractLocation', () => {
    test('should handle node with null loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
        loc: null,
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
        loc: { start: { line: 3, column: 5 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node with non-numeric line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
        loc: { start: { line: 'bad', column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1) // defaults to 1
    })

    test('should handle node with non-numeric column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
        loc: { start: { line: 1, column: 'bad' }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0) // defaults to 0
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
        loc: undefined,
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '(a+)+', flags: '' },
        loc: { end: { line: 1, column: 10 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('edge cases - extractPattern', () => {
    test('should return null for node with non-string regex pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: 123, flags: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should return null for NewExpression with non-Literal first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should return null for NewExpression with null first arg value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NewExpression with non-RegExp callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Literal', value: '(a+)+' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-RegExp callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Literal', value: '(a+)+' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - isRegexNode', () => {
    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node in NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.NewExpression(42)).not.toThrow()
    })

    test('should handle numeric node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal({})

      expect(reports.length).toBe(0)
    })

    test('should handle node with type but no other properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal({ type: 'Literal' })

      expect(reports.length).toBe(0)
    })

    test('should handle undefined NewExpression node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle undefined CallExpression node', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
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

    test('should report correct location for dynamic new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp(12, 4))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for dynamic RegExp() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp(6, 8))

      expect(reports[0].loc?.start.line).toBe(6)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', '', 1, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
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

    test('should handle config with no options property', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUnsafeRegexRule.create(context)

      // Should use defaults (both true)
      expect(() => visitor.Literal(createRegexLiteral('(a+)+'))).not.toThrow()
    })

    test('should handle config with undefined options array', () => {
      const context: RuleContext = {
        report: vi.fn(),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
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

    test('should handle extra unknown options gracefully', () => {
      const { context, reports } = createMockContext({ checkReDoS: true, unknownOption: true })
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports.length).toBe(1)
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

    test('should include "Unsafe regex pattern" prefix in ReDoS messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports[0].message).toContain('Unsafe regex pattern detected')
    })

    test('should include "Issues:" separator in ReDoS messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports[0].message).toContain('Issues:')
    })

    test('should include pattern wrapped in quotes in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a*)*'))

      expect(reports[0].message).toContain('"(a*)*"')
    })

    test('should include "RegExp constructor with dynamic input" in injection message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createDynamicCallRegExp())

      expect(reports[0].message).toContain('RegExp constructor with dynamic input')
    })

    test('should include "regex injection" in injection message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports[0].message).toContain('regex injection')
    })
  })

  describe('multiple violations in one file', () => {
    test('should report multiple unsafe regex literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))
      visitor.Literal(createRegexLiteral('(b*)*'))

      expect(reports.length).toBe(2)
    })

    test('should report mixed violations across node types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))
      visitor.NewExpression(createNewRegExp('(b*)*'))
      visitor.CallExpression(createCallRegExp('(c+)?'))

      expect(reports.length).toBe(3)
    })

    test('should report both ReDoS and injection in same file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))
      visitor.NewExpression(createDynamicNewRegExp())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('nested quantifiers')
      expect(reports[1].message).toContain('dynamic input')
    })

    test('should report complex alternation and nested quantifiers separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))
      visitor.Literal(createRegexLiteral('(x+)+'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('complex alternation')
      expect(reports[1].message).toContain('nested quantifiers')
    })

    test('should report three violations with different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', '', 1, 0))
      visitor.Literal(createRegexLiteral('(b*)*', '', 5, 10))
      visitor.NewExpression(createNewRegExp('(c+)?', 10, 2))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })
  })

  describe('violation properties', () => {
    test('should have loc object with start and end in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have numeric line and column in start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric line and column in end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should include pattern in quoted format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+'))

      expect(reports[0].message).toContain('"(a+)+"')
    })

    test('should include both issues when pattern has nested quantifiers and complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+|b|c|d)+'))

      expect(reports[0].message).toContain('nested quantifiers')
      expect(reports[0].message).toContain('complex alternation')
    })
  })

  describe('NewExpression with RegExp and string literal (safe patterns)', () => {
    test('should not report new RegExp("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('abc'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp("^test$")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('^test$'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp("\\\\d+")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('\\d+'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp("[a-z]+")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('[a-z]+'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp("(a|b)") with simple alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a|b)'))

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp("(a|b|c)") with two alternations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a|b|c)'))

      expect(reports.length).toBe(0)
    })
  })

  describe('CallExpression with RegExp and string literal (safe patterns)', () => {
    test('should not report RegExp("test")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report RegExp("\\\\w+")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('\\w+'))

      expect(reports.length).toBe(0)
    })

    test('should not report RegExp("(x|y)") with simple alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(x|y)'))

      expect(reports.length).toBe(0)
    })
  })

  describe('ReDoS patterns via NewExpression', () => {
    test('should report new RegExp("(a+)+")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report new RegExp("(\\w*)*")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(\\w*)*'))

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("(a|b|c|d)")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.NewExpression(createNewRegExp('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })
  })

  describe('ReDoS patterns via CallExpression', () => {
    test('should report RegExp("(b+)+")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(b+)+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('nested quantifiers')
    })

    test('should report RegExp("(x|y|z|w)")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(x|y|z|w)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should report RegExp("(.*)*")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.CallExpression(createCallRegExp('(.*)*'))

      expect(reports.length).toBe(1)
    })
  })

  describe('flags do not affect detection', () => {
    test('should detect unsafe regex with g flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'g'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with i flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'i'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with m flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'm'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with s flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 's'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with u flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'u'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with y flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'y'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with combined flags gi', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'gi'))

      expect(reports.length).toBe(1)
    })

    test('should detect unsafe regex with combined flags gim', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a+)+', 'gim'))

      expect(reports.length).toBe(1)
    })

    test('should not report safe regex with g flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('test', 'g'))

      expect(reports.length).toBe(0)
    })

    test('should not report safe regex with all flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('^\\w+$', 'gimsuy'))

      expect(reports.length).toBe(0)
    })
  })

  describe('regex literal with only complex alternation (no nested quantifiers)', () => {
    test('should report (one|two|three|four) only for complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(one|two|three|four)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
      expect(reports[0].message).not.toContain('nested quantifiers')
    })

    test('should report (a|b|c|d) only for complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('complex alternation')
    })

    test('should report ([a-z]|[A-Z]|[0-9]|_) only for complex alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('([a-z]|[A-Z]|[0-9]|_)'))

      expect(reports.length).toBe(1)
    })
  })

  describe('safe patterns with alternation exactly at boundary', () => {
    test('should not report (a|b) with 1 pipe', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b)'))

      expect(reports.length).toBe(0)
    })

    test('should not report (a|b|c) with 2 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c)'))

      expect(reports.length).toBe(0)
    })

    test('should report (a|b|c|d) with 3 pipes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      visitor.Literal(createRegexLiteral('(a|b|c|d)'))

      expect(reports.length).toBe(1)
    })

    test('should not report alternation outside groups a|b|c|d', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeRegexRule.create(context)

      // Alternation outside groups is not checked by hasComplexAlternation
      visitor.Literal(createRegexLiteral('a|b|c|d'))

      expect(reports.length).toBe(0)
    })
  })
})
