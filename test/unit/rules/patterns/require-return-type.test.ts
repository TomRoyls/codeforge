import { describe, test, expect, vi } from 'vitest'
import { requireReturnTypeRule } from '../../../../src/rules/patterns/require-return-type.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function add(a: number, b: number) { return a + b; }',
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

function createFunctionDeclaration(
  name: string,
  hasReturnType = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createFunctionExpression(
  name: string | null = null,
  hasReturnType = false,
  line = 1,
  column = 0,
  parent?: unknown,
): unknown {
  const node: Record<string, unknown> = {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
  if (name) {
    node.id = { type: 'Identifier', name }
  }
  if (parent) {
    node.parent = parent
  }
  return node
}

function createArrowFunctionExpression(
  hasReturnType = false,
  line = 1,
  column = 0,
  parent?: unknown,
  body?: unknown,
): unknown {
  const node: Record<string, unknown> = {
    type: 'ArrowFunctionExpression',
    params: [],
    body: body ?? { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
  if (parent) {
    node.parent = parent
  }
  return node
}

function createVariableDeclarator(id: { name: string; hasTypeAnnotation: boolean }): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: id.name,
      typeAnnotation: id.hasTypeAnnotation ? { type: 'TSTypeAnnotation' } : undefined,
    },
  }
}

describe('require-return-type rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(requireReturnTypeRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(requireReturnTypeRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(requireReturnTypeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(requireReturnTypeRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(requireReturnTypeRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(requireReturnTypeRule.meta.fixable).toBeUndefined()
    })

    test('should mention return type in description', () => {
      expect(requireReturnTypeRule.meta.docs?.description.toLowerCase()).toContain('return type')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })
  })

  describe('detecting missing return types on function declarations', () => {
    test('should report function declaration without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('add')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report function declaration with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('add', true))

      expect(reports.length).toBe(0)
    })

    test('should report anonymous function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location for function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('detecting missing return types on function expressions', () => {
    test('should report function expression without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionExpression(createFunctionExpression('handler'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function expression')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report function expression with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionExpression(createFunctionExpression('handler', true))

      expect(reports.length).toBe(0)
    })

    test('should report function expression with variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const parent = createVariableDeclarator({ name: 'myFunc', hasTypeAnnotation: false })
      visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myFunc')
    })
  })

  describe('detecting missing return types on arrow functions', () => {
    test('should report arrow function without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Arrow function')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report arrow function with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(0)
    })

    test('should report arrow function with variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const parent = createVariableDeclarator({ name: 'myArrow', hasTypeAnnotation: false })
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myArrow')
    })
  })

  describe('options - allowArrowFunctions', () => {
    test('should not report arrow function when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = requireReturnTypeRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should still report function declaration when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
    })

    test('should still report function expression when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionExpression(createFunctionExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowTypedFunctionExpressions', () => {
    test('should not report function expression when variable has type annotation', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = requireReturnTypeRule.create(context)

      const parent = createVariableDeclarator({ name: 'typedFunc', hasTypeAnnotation: true })
      visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function when variable has type annotation', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = requireReturnTypeRule.create(context)

      const parent = createVariableDeclarator({ name: 'typedArrow', hasTypeAnnotation: true })
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))

      expect(reports.length).toBe(0)
    })

    test('should still report function expression when variable has no type annotation', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = requireReturnTypeRule.create(context)

      const parent = createVariableDeclarator({ name: 'untypedFunc', hasTypeAnnotation: false })
      visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))

      expect(reports.length).toBe(1)
    })

    test('should still report function declaration when allowTypedFunctionExpressions is true', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowHigherOrderFunctions', () => {
    test('should not report function returning arrow function', () => {
      const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
      const visitor = requireReturnTypeRule.create(context)

      const innerArrow = createArrowFunctionExpression()
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'higherOrder' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function returning function', () => {
      const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
      const visitor = requireReturnTypeRule.create(context)

      const innerFunc = createFunctionExpression()
      const outerArrow = createArrowFunctionExpression(false, 1, 0, undefined, innerFunc)

      visitor.ArrowFunctionExpression(outerArrow)

      expect(reports.length).toBe(0)
    })

    test('should still report regular function when allowHigherOrderFunctions is true', () => {
      const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('regular'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention type safety in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('add'))

      expect(reports[0].message).toContain('type safety')
    })

    test('should mention documentation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('add'))

      expect(reports[0].message).toContain('documentation')
    })

    test('should include function name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunction'))

      expect(reports[0].message).toContain('myFunction')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'test' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'test' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = requireReturnTypeRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test'))

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
        getSource: () => 'function test() {}',
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

      const visitor = requireReturnTypeRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('test'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null returnType', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'test' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        returnType: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle function in property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        parent: {
          type: 'Property',
          key: { type: 'Identifier', name: 'methodName' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.FunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('methodName')
    })

    test('should handle function in assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireReturnTypeRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        parent: {
          type: 'AssignmentExpression',
          left: { type: 'Identifier', name: 'assignedFunc' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.FunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assignedFunc')
    })

    test('should handle combined options', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      })
      const visitor = requireReturnTypeRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression())
      visitor.FunctionExpression(
        createFunctionExpression(
          null,
          false,
          1,
          0,
          createVariableDeclarator({ name: 'typed', hasTypeAnnotation: true }),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })
})
