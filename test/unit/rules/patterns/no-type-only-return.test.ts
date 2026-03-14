import { describe, test, expect, vi } from 'vitest'
import { noTypeOnlyReturnRule } from '../../../../src/rules/patterns/no-type-only-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function test() {}',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createFunctionDeclaration(hasReturnType = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { name: 'test' },
    returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createFunctionExpression(hasReturnType = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createArrowFunctionExpression(hasReturnType = true, line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    returnType: hasReturnType ? { typeAnnotation: { type: 'TSTypeAnnotation' } } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createReturnStatement(hasArgument = false, line = 2, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: hasArgument ? { type: 'Literal', value: 'test' } : null,
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

describe('no-type-only-return rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noTypeOnlyReturnRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noTypeOnlyReturnRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noTypeOnlyReturnRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noTypeOnlyReturnRule.meta.fixable).toBeUndefined()
    })

    test('should have docs url', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-type-only-return',
      )
    })

    test('should mention return type in description', () => {
      expect(noTypeOnlyReturnRule.meta.docs?.description.toLowerCase()).toContain('return type')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('ReturnStatement')
    })
  })

  describe('function declaration detection', () => {
    test('should report function declaration with return type but empty return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(
        'Function has a return type annotation but returns nothing',
      )
    })

    test('should not report function declaration without return type and empty return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with return type and valid return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should report only once per function even with multiple empty returns', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle function exit properly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })

    test('should track nested functions separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      // Outer function
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      // Inner function
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 2, 0))
      visitor.ReturnStatement(createReturnStatement(false, 3, 0))
      // Exit inner function
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      // Outer function's return
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      // Exit outer function
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })
  })

  describe('function expression detection', () => {
    test('should report function expression with return type but empty return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(
        'Function has a return type annotation but returns nothing',
      )
    })

    test('should not report function expression without return type and empty return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with return type and valid return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle function expression exit properly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })
  })

  describe('arrow function expression detection', () => {
    test('should report arrow function with return type but empty return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(
        'Function has a return type annotation but returns nothing',
      )
    })

    test('should not report arrow function without return type and empty return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with return type and valid return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function exit properly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(1)
    })
  })

  describe('valid returns', () => {
    test('should not report when function returns a value', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(true, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when function has no return type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(false, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle return statement with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null function node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined function node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object function node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null return statement node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined return statement node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object return statement node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function without returnType property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { name: 'test' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.FunctionDeclaration(node)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle function with null returnType', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { name: 'test' },
        returnType: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.FunctionDeclaration(node)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle return statement without argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle return statement without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
      })

      expect(reports.length).toBe(1)
    })

    test('should handle empty function stack on return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle return with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should report correct message for type-only return', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message).toBe(
        'Function has a return type annotation but returns nothing. This is likely a bug - you should return a value of the declared type.',
      )
    })

    test('should mention return type annotation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message.toLowerCase()).toContain('return type annotation')
    })

    test('should mention bug in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports[0].message.toLowerCase()).toContain('bug')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle return statement with no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location at line 10, column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 10, 20))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  describe('multiple functions', () => {
    test('should handle multiple function declarations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      // First function - should report
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // Second function - should not report (no return type)
      visitor.FunctionDeclaration(createFunctionDeclaration(false, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // Third function - should report
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      expect(reports.length).toBe(2)
    })

    test('should handle mixed function types', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      // Function declaration - should report
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // Function expression - should report
      visitor.FunctionExpression(createFunctionExpression(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      // Arrow function - should report
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      expect(reports.length).toBe(3)
    })
  })

  describe('function type checking', () => {
    test('should only handle known function types', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      visitor.FunctionExpression(createFunctionExpression(true, 3, 0))
      visitor.ReturnStatement(createReturnStatement(false, 4, 0))
      ;(visitor['FunctionExpression:exit'] as () => void)()

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 5, 0))
      visitor.ReturnStatement(createReturnStatement(false, 6, 0))
      ;(visitor['ArrowFunctionExpression:exit'] as () => void)()

      // Should report for all three function types
      expect(reports.length).toBe(3)
    })

    test('should ignore unknown node types', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration({ type: 'UnknownType' } as unknown)
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('exit handlers', () => {
    test('should handle FunctionDeclaration:exit', () => {
      const { context } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      expect(() => (visitor['FunctionDeclaration:exit'] as () => void)()).not.toThrow()
    })

    test('should handle FunctionExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      expect(() => (visitor['FunctionExpression:exit'] as () => void)()).not.toThrow()
    })

    test('should handle ArrowFunctionExpression:exit', () => {
      const { context } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 1, 0))
      expect(() => (visitor['ArrowFunctionExpression:exit'] as () => void)()).not.toThrow()
    })

    test('should handle multiple exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeOnlyReturnRule.create(context)

      // Enter function
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      // Return - should report
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))
      expect(reports.length).toBe(1)
      // Exit function
      ;(visitor['FunctionDeclaration:exit'] as () => void)()

      // Enter second function
      visitor.FunctionDeclaration(createFunctionDeclaration(true, 3, 0))
      // Exit without return - no report
      ;(visitor['FunctionDeclaration:exit'] as () => void)()
      expect(reports.length).toBe(1)
    })
  })

  describe('config handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noTypeOnlyReturnRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, 1, 0))
      visitor.ReturnStatement(createReturnStatement(false, 2, 0))

      expect(reports.length).toBe(1)
    })
  })
})
