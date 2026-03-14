import { describe, test, expect, vi } from 'vitest'
import { explicitModuleBoundaryTypesRule } from '../../../../src/rules/patterns/explicit-module-boundary-types.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'export function add(a: number, b: number) { return a + b; }',
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

function createExportedFunctionDeclaration(
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
    parent: { type: 'ExportNamedDeclaration' },
  }
}

function createExportedDefaultFunctionDeclaration(
  name: string | null = null,
  hasReturnType = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    id: name ? { type: 'Identifier', name } : null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    parent: { type: 'ExportDefaultDeclaration' },
  }
}

function createNonExportedFunctionDeclaration(
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
    parent: { type: 'Program' },
  }
}

function createExportedArrowFunction(
  varName: string,
  hasReturnType = false,
  hasTypeAnnotation = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    parent: {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: varName,
        typeAnnotation: hasTypeAnnotation ? { type: 'TSTypeAnnotation' } : undefined,
      },
      parent: {
        type: 'VariableDeclaration',
        parent: { type: 'ExportNamedDeclaration' },
      },
    },
  }
}

function createNonExportedArrowFunction(
  varName: string,
  hasReturnType = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    parent: {
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: varName },
      parent: {
        type: 'VariableDeclaration',
        parent: { type: 'Program' },
      },
    },
  }
}

function createExportedFunctionExpression(
  varName: string,
  hasReturnType = false,
  hasTypeAnnotation = false,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionExpression',
    params: [],
    body: { type: 'BlockStatement', body: [] },
    returnType: hasReturnType ? { type: 'TSTypeAnnotation' } : undefined,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    parent: {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: varName,
        typeAnnotation: hasTypeAnnotation ? { type: 'TSTypeAnnotation' } : undefined,
      },
      parent: {
        type: 'VariableDeclaration',
        parent: { type: 'ExportNamedDeclaration' },
      },
    },
  }
}

describe('explicit-module-boundary-types rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(explicitModuleBoundaryTypesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(explicitModuleBoundaryTypesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(explicitModuleBoundaryTypesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(explicitModuleBoundaryTypesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(explicitModuleBoundaryTypesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(explicitModuleBoundaryTypesRule.meta.fixable).toBeUndefined()
    })

    test('should mention return type in description', () => {
      expect(explicitModuleBoundaryTypesRule.meta.docs?.description.toLowerCase()).toContain(
        'return type',
      )
    })

    test('should mention exported in description', () => {
      expect(explicitModuleBoundaryTypesRule.meta.docs?.description.toLowerCase()).toContain(
        'exported',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })
  })

  describe('detecting missing return types on exported functions', () => {
    test('should report exported function declaration without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('add')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report exported function declaration with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add', true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-exported function declaration without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('internal'))

      expect(reports.length).toBe(0)
    })

    test('should report exported default function without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration('defaultFunc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('defaultFunc')
    })

    test('should not report exported default function with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration('defaultFunc', true))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting missing return types on exported arrow functions', () => {
    test('should report exported arrow function without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myArrow')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report exported arrow function with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow', true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-exported arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createNonExportedArrowFunction('internal'))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting missing return types on exported function expressions', () => {
    test('should report exported function expression without return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('myFunc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myFunc')
    })

    test('should not report exported function expression with return type', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('myFunc', true))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowArrowFunctions', () => {
    test('should not report exported arrow function when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports.length).toBe(0)
    })

    test('should still report exported function declaration when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowTypedFunctionExpressions', () => {
    test('should not report exported arrow function when variable has type annotation', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('typedArrow', false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report exported function expression when variable has type annotation', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('typedFunc', false, true))

      expect(reports.length).toBe(0)
    })

    test('should still report when variable has no type annotation', () => {
      const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('untyped'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options - allowHigherOrderFunctions', () => {
    test('should not report exported function returning arrow function', () => {
      const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'higherOrder' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should still report regular exported function when allowHigherOrderFunctions is true', () => {
      const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('regular'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention API documentation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].message.toLowerCase()).toContain('api')
    })

    test('should include function name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('myFunction'))

      expect(reports[0].message).toContain('myFunction')
    })

    test('should mention exported in message', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].message).toContain('Exported')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'test' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { type: 'ExportDefaultDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null returnType', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'test' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        returnType: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('test'))

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
        getSource: () => 'export function test() {}',
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

      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createExportedFunctionDeclaration('test')),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'value' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'expr' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle combined options', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.FunctionExpression(createExportedFunctionExpression('typedFunc', false, true))

      expect(reports.length).toBe(0)
    })
  })
})
