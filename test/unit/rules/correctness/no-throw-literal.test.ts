import { describe, test, expect, vi } from 'vitest'
import { noThrowLiteralRule } from '../../../../src/rules/correctness/no-throw-literal.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'throw "error";',
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

function createThrowStatement(
  argumentType: string,
  value?: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: argumentType,
      value,
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'Identifier',
      name,
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowObject(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ObjectExpression',
      properties: [],
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowArray(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'ArrayExpression',
      elements: [],
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowNewError(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: {
        type: 'Identifier',
        name: 'Error',
      },
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createThrowTSAsExpression(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'TSAsExpression',
      expression: {
        type: 'Literal',
        value: 'error',
      },
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-throw-literal rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noThrowLiteralRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noThrowLiteralRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noThrowLiteralRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correctness category', () => {
      expect(noThrowLiteralRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noThrowLiteralRule.meta.schema).toBeDefined()
    })

    test('should mention throw in description', () => {
      expect(noThrowLiteralRule.meta.docs?.description.toLowerCase()).toContain('throw')
    })
  })

  describe('create', () => {
    test('should return visitor object with ThrowStatement method', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(visitor).toHaveProperty('ThrowStatement')
    })
  })

  describe('detecting thrown literals', () => {
    test('should report thrown string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error message'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string')
    })

    test('should report thrown number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 42))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('number')
    })

    test('should report thrown null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('null')
    })

    test('should report thrown undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowIdentifier('undefined'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
    })

    test('should report thrown boolean literal (true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should report thrown boolean literal (false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
    })

    test('should report thrown object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowObject())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('object')
    })

    test('should report thrown array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowArray())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('array')
    })
  })

  describe('allowing valid throws', () => {
    test('should not report thrown Error object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowNewError())

      expect(reports.length).toBe(0)
    })

    test('should not report thrown identifier other than undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowIdentifier('myError'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowThrowingObjects', () => {
    test('should allow thrown objects when option is true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowObject())

      expect(reports.length).toBe(0)
    })

    test('should still report thrown strings even when allowThrowingObjects is true', () => {
      const { context, reports } = createMockContext({ allowThrowingObjects: true })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowThrowingAny', () => {
    test('should allow thrown TSAsExpression when option is true', () => {
      const { context, reports } = createMockContext({ allowThrowingAny: true })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowTSAsExpression())

      expect(reports.length).toBe(0)
    })

    test('should still report thrown strings when allowThrowingAny is false', () => {
      const { context, reports } = createMockContext({ allowThrowingAny: false })
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement('string')).not.toThrow()
      expect(() => visitor.ThrowStatement(123)).not.toThrow()
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const node = { type: 'ThrowStatement' }

      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const node = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
      }

      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

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
        getSource: () => 'throw "error";',
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

      const visitor = noThrowLiteralRule.create(context)

      expect(() => visitor.ThrowStatement(createThrowStatement('Literal', 'error'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      const node = {
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.ThrowStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle thrown bigint literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', BigInt(123)))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('bigint')
    })

    test('should handle thrown regexp literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', /test/))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('RegExp')
    })
  })

  describe('message quality', () => {
    test('should mention Error object in string message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 'error'))

      expect(reports[0].message.toLowerCase()).toContain('error')
    })

    test('should mention Error object in number message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', 42))

      expect(reports[0].message.toLowerCase()).toContain('error')
    })

    test('should mention Error object in null message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowStatement('Literal', null))

      expect(reports[0].message.toLowerCase()).toContain('error')
    })

    test('should mention Error object in object message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowLiteralRule.create(context)

      visitor.ThrowStatement(createThrowObject())

      expect(reports[0].message.toLowerCase()).toContain('error')
    })
  })
})
