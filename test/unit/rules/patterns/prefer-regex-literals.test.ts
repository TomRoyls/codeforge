import { describe, test, expect, vi } from 'vitest'
import { preferRegexLiteralsRule } from '../../../../src/rules/patterns/prefer-regex-literals.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new RegExp("abc");',
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

function createNewExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
  }
}

function createCallExpression(callee: unknown, args: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

describe('prefer-regex-literals rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferRegexLiteralsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferRegexLiteralsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferRegexLiteralsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferRegexLiteralsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferRegexLiteralsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferRegexLiteralsRule.meta.fixable).toBeUndefined()
    })

    test('should mention regex literal in description', () => {
      expect(preferRegexLiteralsRule.meta.docs?.description.toLowerCase()).toContain('literal')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting new RegExp() with string literal pattern', () => {
    test('should report new RegExp("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/abc/')
    })

    test('should report new RegExp("test", "i")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('test'),
        createLiteral('i'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/test/i')
    })

    test('should report new RegExp("pattern", "gi")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('pattern'),
        createLiteral('gi'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('/pattern/gi')
    })

    test('should report new RegExp() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report new RegExp("") with empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral('')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting dynamic patterns', () => {
    test('should not report new RegExp(variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createIdentifier('variable')])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp(getPattern())', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const callExpr = createCallExpression(createIdentifier('getPattern'), [])
      const node = createNewExpression(createIdentifier('RegExp'), [callExpr])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp(pattern, flagsVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('test'),
        createIdentifier('flagsVar'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new RegExp(userInput, "i")', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createIdentifier('userInput'),
        createLiteral('i'),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting other constructors', () => {
    test('should not report new Other()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('Other'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('Array'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('Set'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral('test')], 25, 10)

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [createLiteral('abc')],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
    })

    test('should handle non-string pattern literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [createLiteral(123)])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-string flags literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = createNewExpression(createIdentifier('RegExp'), [
        createLiteral('test'),
        createLiteral(123),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('RegExp'),
        arguments: [createLiteral('abc')],
        loc: {},
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention regex literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports[0].message).toContain('/abc/')
    })

    test('should include pattern in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [createLiteral('mypattern')]),
      )

      expect(reports[0].message).toContain('mypattern')
    })

    test('should include flags in message when present', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('RegExp'), [
          createLiteral('test'),
          createLiteral('gi'),
        ]),
      )

      expect(reports[0].message).toContain('gi')
    })

    test('should mention new RegExp in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRegexLiteralsRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('RegExp'), [createLiteral('abc')]))

      expect(reports[0].message).toContain('new RegExp')
    })
  })
})
