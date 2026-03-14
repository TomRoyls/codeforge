import { describe, test, expect, vi } from 'vitest'
import { preferRestParamsRule } from '../../../../src/rules/patterns/prefer-rest-params.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function test() { return arguments; }',
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

function createIdentifier(name: string, line = 1, column = 0, range?: [number, number]): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
    range: range ?? [column, column + name.length],
  }
}

function createFunctionDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: createIdentifier(name, line, column),
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createArrowFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
  }
}

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: createIdentifier(name, line, column),
    init: null,
  }
}

describe('prefer-rest-params rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferRestParamsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferRestParamsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferRestParamsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferRestParamsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferRestParamsRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferRestParamsRule.meta.fixable).toBe('code')
    })

    test('should mention rest parameters in description', () => {
      expect(preferRestParamsRule.meta.docs?.description.toLowerCase()).toContain('rest parameters')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      expect(visitor).toHaveProperty('Identifier')
      expect(visitor).toHaveProperty('VariableDeclarator')
    })
  })

  describe('detecting arguments usage inside functions', () => {
    test('should report arguments inside function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should report arguments inside function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionExpression(),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should report arguments inside arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createArrowFunctionExpression(),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should report multiple arguments usage', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments', 1, 10))
      visitor.Identifier(createIdentifier('arguments', 1, 25))

      expect(reports.length).toBe(2)
    })
  })

  describe('not reporting arguments outside functions', () => {
    test('should not report arguments outside any function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report other identifiers outside functions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('bar'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting other identifiers inside functions', () => {
    test('should not report regular identifiers inside function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('bar'))
      visitor.Identifier(createIdentifier('args'))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting when arguments is explicitly declared', () => {
    test('should not report when arguments is declared as variable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should not report other identifiers even when arguments is declared', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('foo'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(0)
    })

    test('should report arguments if different variable is declared', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.VariableDeclarator(createVariableDeclarator('foo'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should reset arguments declared flag on function exit', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test1'),
      )
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))
      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'](
        createFunctionDeclaration('test1'),
      )

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test2'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })
  })

  describe('nested functions', () => {
    test('should track function depth correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('outer'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('inner'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(2)
    })

    test('should not report arguments in outer function when declared in inner', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('outer'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('inner'),
      )
      visitor.VariableDeclarator(createVariableDeclarator('arguments'))
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      expect(() => visitor.Identifier('string')).not.toThrow()
      expect(() => visitor.Identifier(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )

      const node = {
        type: 'Identifier',
        name: 'arguments',
      }

      expect(() => visitor.Identifier(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'function test() { return arguments; }',
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

      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )

      expect(() => visitor.Identifier(createIdentifier('arguments'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle multiple function types', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('decl'),
      )
      visitor.Identifier(createIdentifier('arguments'))
      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'](
        createFunctionDeclaration('decl'),
      )

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionExpression(),
      )
      visitor.Identifier(createIdentifier('arguments'))
      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'](
        createFunctionExpression(),
      )

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createArrowFunctionExpression(),
      )
      visitor.Identifier(createIdentifier('arguments'))
      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression):exit'](
        createArrowFunctionExpression(),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('message quality', () => {
    test('should mention rest parameters in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message.toLowerCase()).toContain('rest parameters')
    })

    test('should mention arguments in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message).toContain('arguments')
    })

    test('should have correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports[0].message).toBe("Use rest parameters (...args) instead of 'arguments'.")
    })

    test('should work with custom tokens and comments arrays', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
            fix: descriptor.fix,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'function test() { return arguments; }',
        getTokens: () =>
          [
            { type: 'Keyword', value: 'function' },
            { type: 'Identifier', value: 'test' },
          ] as any,
        getComments: () => [{ type: 'Line', value: '// test' }] as any,
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rest parameters')
    })

    test('should not report arguments when used as property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('obj'))

      expect(reports.length).toBe(0)
    })

    test('should report when arguments is used multiple times in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments', 1, 10))
      visitor.Identifier(createIdentifier('arguments', 1, 30))
      visitor.Identifier(createIdentifier('arguments', 2, 15))

      expect(reports.length).toBe(3)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix replacing arguments with args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments', 1, 10, [10, 19]))

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('args')
      expect(reports[0].fix?.range).toEqual([10, 19])
    })

    test('should provide fix for each arguments usage', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )
      visitor.Identifier(createIdentifier('arguments', 1, 10, [10, 19]))
      visitor.Identifier(createIdentifier('arguments', 1, 30, [30, 39]))

      expect(reports.length).toBe(2)
      expect(reports[0].fix?.text).toBe('args')
      expect(reports[1].fix?.text).toBe('args')
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockContext()
      const visitor = preferRestParamsRule.create(context)

      visitor[':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)'](
        createFunctionDeclaration('test'),
      )

      const nodeWithoutRange = {
        type: 'Identifier',
        name: 'arguments',
        loc: {
          start: { line: 1, column: 10 },
          end: { line: 1, column: 19 },
        },
      }

      visitor.Identifier(nodeWithoutRange)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})
