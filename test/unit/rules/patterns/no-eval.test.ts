import { describe, test, expect, vi } from 'vitest'
import { noEvalRule } from '../../../../src/rules/patterns/no-eval.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'eval("test");',
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

function createDirectEvalCall(line = 1, column = 0): unknown {
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

function createMemberEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: 'eval',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWindowEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'window',
      },
      property: {
        type: 'Identifier',
        name: 'eval',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createGlobalEvalCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'global',
      },
      property: {
        type: 'Identifier',
        name: 'eval',
      },
    },
    arguments: [],
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
      name: 'console',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMethodCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-eval rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEvalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEvalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEvalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noEvalRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noEvalRule.meta.schema).toBeDefined()
    })

    test('should not be fixable (eval requires manual review)', () => {
      expect(noEvalRule.meta.fixable).toBeUndefined()
    })

    test('should mention eval in description', () => {
      expect(noEvalRule.meta.docs?.description.toLowerCase()).toContain('eval')
    })

    test('should have empty schema array', () => {
      expect(noEvalRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting direct eval calls', () => {
    test('should report direct eval() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
    })

    test('should report eval with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toBe("Unexpected use of 'eval'.")
    })
  })

  describe('allowing property name usage', () => {
    test('should not report obj.eval property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMemberEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should not report window.eval() method call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createWindowEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should not report global.eval() method call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createGlobalEvalCall())

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createMethodCall('log'))
      visitor.CallExpression(createMethodCall('info'))
      visitor.CallExpression(createMethodCall('test'))

      expect(reports.length).toBe(0)
    })
  })

  describe('allowing other functions', () => {
    test('should not report non-eval function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createOtherFunctionCall())

      expect(reports.length).toBe(0)
    })

    test('should not report Function constructor call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'Function',
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention eval in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toContain('eval')
    })

    test('should use single quotes around eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

      expect(reports[0].message).toContain("'eval'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

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
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())

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
        getSource: () => 'eval("test");',
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

      const visitor = noEvalRule.create(context)

      expect(() => visitor.CallExpression(createDirectEvalCall())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: {
            type: 'Literal',
            value: 'eval',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle different identifier names', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const logCall = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'log',
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      const testCall = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'test',
        },
        arguments: [],
        loc: {
          start: { line: 2, column: 0 },
          end: { line: 2, column: 10 },
        },
      }

      visitor.CallExpression(logCall)
      visitor.CallExpression(testCall)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple eval calls', () => {
    test('should report multiple eval calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall(1, 0))
      visitor.CallExpression(createDirectEvalCall(2, 0))
      visitor.CallExpression(createDirectEvalCall(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report eval but not member eval calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      visitor.CallExpression(createDirectEvalCall())
      visitor.CallExpression(createMemberEvalCall())
      visitor.CallExpression(createWindowEvalCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('additional scenarios', () => {
    test('should handle this.eval() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: 'eval',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle super.eval() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Super',
          },
          property: {
            type: 'Identifier',
            name: 'eval',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle eval with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [
          { type: 'Literal', value: 'test' },
          { type: 'Literal', value: 'arg2' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle nested eval calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'eval',
            },
            arguments: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('extractLocation edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noEvalRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'eval',
        },
        arguments: [],
        loc: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })
})
