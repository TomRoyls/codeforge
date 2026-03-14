import { describe, test, expect, vi } from 'vitest'
import { noImpliedEvalRule } from '../../../../src/rules/patterns/no-implied-eval.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'setTimeout("code", 100);',
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

function createSetTimeoutWithString(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'Literal',
        value: 'alert(1)',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetIntervalWithString(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setInterval',
    },
    arguments: [
      {
        type: 'Literal',
        value: 'alert(1)',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithFunction(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'FunctionExpression',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithArrowFunction(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithIdentifier(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'myCallback',
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithTemplateLiteral(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'TemplateLiteral',
        quasis: [
          {
            type: 'TemplateElement',
            value: { raw: 'alert', cooked: 'alert' },
          },
        ],
        expressions: [],
      },
      {
        type: 'Literal',
        value: 1000,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createSetTimeoutWithNumber(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'setTimeout',
    },
    arguments: [
      {
        type: 'Literal',
        value: 123,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createOtherFunctionCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'eval',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-implied-eval rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noImpliedEvalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noImpliedEvalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noImpliedEvalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noImpliedEvalRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noImpliedEvalRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noImpliedEvalRule.meta.fixable).toBeUndefined()
    })

    test('should mention setTimeout/setInterval in description', () => {
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('settimeout')
      expect(noImpliedEvalRule.meta.docs?.description.toLowerCase()).toContain('setinterval')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting implied eval - setTimeout', () => {
    test('should report setTimeout with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })

    test('should report setTimeout with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithTemplateLiteral())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })

    test('should not report setTimeout with function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithFunction())

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithArrowFunction())

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with identifier (function reference)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithIdentifier())

      expect(reports.length).toBe(0)
    })

    test('should not report setTimeout with number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithNumber())

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting implied eval - setInterval', () => {
    test('should report setInterval with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetIntervalWithString())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Implied eval')
    })
  })

  describe('ignoring other functions', () => {
    test('should not report other function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createOtherFunctionCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention setTimeout/setInterval in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).toContain('setTimeout')
      expect(reports[0].message).toContain('setInterval')
    })

    test('should mention first argument in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString())

      expect(reports[0].message).toContain('first argument')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'setTimeout' },
        },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-object first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [
          {
            type: 'Literal',
            value: 123,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      visitor.CallExpression(createSetTimeoutWithString(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noImpliedEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'setTimeout',
        },
        arguments: [
          {
            type: 'Literal',
            value: 'alert(1)',
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
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
        getSource: () => 'setTimeout("code", 100);',
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

      const visitor = noImpliedEvalRule.create(context)

      expect(() => visitor.CallExpression(createSetTimeoutWithString())).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})
