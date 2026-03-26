import { describe, test, expect, vi } from 'vitest'
import { noNewFuncRule } from '../../../../src/rules/patterns/no-new-func.js'
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

function createNewExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 10 },
    },
  }
}

function createCallExpression(calleeName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + calleeName.length + 8 },
    },
  }
}

function createFunctionDeclaration(lineNumber = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'myFunc' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createArrowFunctionExpression(lineNumber = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

describe('no-new-func rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNewFuncRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNewFuncRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNewFuncRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noNewFuncRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noNewFuncRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noNewFuncRule.meta.fixable).toBeUndefined()
    })

    test('should mention Function in description', () => {
      expect(noNewFuncRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should mention security risk in description', () => {
      const desc = noNewFuncRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/security|risk|eval/)
    })

    test('should have empty schema array', () => {
      expect(noNewFuncRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })

    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting new Function()', () => {
    test('should report new Function() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })

    test('should report multiple new Function() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.NewExpression(createNewExpression('Function', 2, 0))
      visitor.NewExpression(createNewExpression('Function', 3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('detecting Function() without new', () => {
    test('should report Function() call without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for Function() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function'))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
    })

    test('should report multiple Function() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))
      visitor.CallExpression(createCallExpression('Function', 3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('not reporting regular function declarations', () => {
    test('should not report function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report regular constructor calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Array'))
      visitor.NewExpression(createNewExpression('Object'))
      visitor.NewExpression(createNewExpression('Date'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Math'))
      visitor.CallExpression(createCallExpression('console'))
      visitor.CallExpression(createCallExpression('myFunc'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

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
        getSource: () => 'new Function()',
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

      const visitor = noNewFuncRule.create(context)
      visitor.NewExpression(createNewExpression('Function'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for Function() without new', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location with end position for new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location with end position for Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should mention Function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('Function')
    })

    test('should mention constructor in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('constructor')
    })

    test('should mention unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should have consistent message format for new Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.NewExpression(createNewExpression('Function', 1, 0))
      visitor.NewExpression(createNewExpression('Function', 2, 0))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
      expect(reports[1].message).toBe('Unexpected use of Function constructor.')
    })

    test('should have consistent message format for Function()', () => {
      const { context, reports } = createMockContext()
      const visitor = noNewFuncRule.create(context)

      visitor.CallExpression(createCallExpression('Function', 1, 0))
      visitor.CallExpression(createCallExpression('Function', 2, 0))

      expect(reports[0].message).toBe('Unexpected use of Function constructor.')
      expect(reports[1].message).toBe('Unexpected use of Function constructor.')
    })
  })
})
