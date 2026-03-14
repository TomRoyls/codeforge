import { describe, test, expect, vi } from 'vitest'
import { preferStringStartsEndsWithRule } from '../../../../src/rules/patterns/prefer-string-starts-ends-with.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '/^abc/.test(str);',
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

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMemberExpression(object: unknown, property: string, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
      loc: {
        start: { line, column: column + 5 },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createRegexLiteral(regex: RegExp, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: regex,
    regex: {
      pattern: regex.source,
      flags: regex.flags,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createBinaryExpression(
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

describe('prefer-string-starts-ends-with rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferStringStartsEndsWithRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStringStartsEndsWithRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferStringStartsEndsWithRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferStringStartsEndsWithRule.meta.fixable).toBe('code')
    })

    test('should mention startsWith and endsWith in description', () => {
      const description = preferStringStartsEndsWithRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('starts')
      expect(description).toContain('ends')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('regex .test() pattern detection', () => {
    test('should report regex test with startsWith pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report regex test with endsWith pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should report simple alphanumeric startsWith pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^Hello/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report simple alphanumeric endsWith pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/World$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex test with pattern containing special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc\./)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/i)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test with multiline flag', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/m)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test with both ^ and $', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test without ^ or $', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-regex literal test call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const stringLit = createLiteral('abc')
      const callee = createMemberExpression(stringLit, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report test call with wrong number of arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str'), createLiteral('extra')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('regex .match() pattern detection', () => {
    test('should report string match with startsWith regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report string match with endsWith regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/abc$/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should not report string match with complex regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc\./)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string match with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc/i)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('indexOf() === 0 pattern detection', () => {
    test('should report indexOf === 0 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report indexOf == 0 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 === indexOf pattern (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(createLiteral(0), indexOfCall, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report indexOf !== 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf === non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(5), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [
        createLiteral('prefix'),
        createLiteral(5),
      ])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('lastIndexOf() pattern detection', () => {
    test('should report lastIndexOf compared to length expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('suffix')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should not report lastIndexOf with non-length comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('suffix')])
      const node = createBinaryExpression(lastIndexOfCall, createLiteral(5), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report lastIndexOf without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle null node in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      delete (regex as any).loc
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      delete (callee as any).loc
      const node = createCallExpression(callee, args)
      delete (node as any).loc

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc in BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      delete (indexOfCall as any).loc
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')
      delete (node as any).loc

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location for regex test', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/, 10, 5)
      const callee = createMemberExpression(regex, 'test', 10, 5)
      const args = [createIdentifier('str', 10, 15)]
      const node = createCallExpression(callee, args, 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for indexOf pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 20, 3)
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf', 20, 3)
      const indexOfCall = createCallExpression(
        indexOfCallee,
        [createLiteral('prefix', 20, 12)],
        20,
        3,
      )
      const node = createBinaryExpression(indexOfCall, createLiteral(0, 20, 25), '===', 20, 3)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => '/^abc/.test(str);',
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

      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle regex with underscores and spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^hello_world/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle regex with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^test123/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report other method calls on regex', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'exec')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls on string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'trim')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention startsWith in message for startsWith patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('startswith')
    })

    test('should mention endsWith in message for endsWith patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('endswith')
    })

    test('should mention readability in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message).toBeTruthy()
    })

    test('should mention start of string in startsWith message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('start')
    })

    test('should mention end of string in endsWith message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('end')
    })
  })
})
