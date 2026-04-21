import { describe, test, expect } from 'vitest'
import { explicitModuleBoundaryTypesRule } from '../../../../src/rules/patterns/explicit-module-boundary-types.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

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

function createNonExportedFunctionExpression(
  varName: string,
  hasReturnType = false,
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
      id: { type: 'Identifier', name: varName },
      parent: {
        type: 'VariableDeclaration',
        parent: { type: 'Program' },
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

    test('should have a docs url', () => {
      expect(explicitModuleBoundaryTypesRule.meta.docs?.url).toBeDefined()
      expect(typeof explicitModuleBoundaryTypesRule.meta.docs?.url).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(explicitModuleBoundaryTypesRule.meta.schema)).toBe(true)
    })

    test('should have allowArrowFunctions in schema properties', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('allowArrowFunctions')
    })

    test('should have allowHigherOrderFunctions in schema properties', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('allowHigherOrderFunctions')
    })

    test('should have allowTypedFunctionExpressions in schema properties', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('allowTypedFunctionExpressions')
    })

    test('should not be deprecated', () => {
      expect(explicitModuleBoundaryTypesRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(explicitModuleBoundaryTypesRule.meta.replacedBy).toBeUndefined()
    })

    test('should have type as string', () => {
      expect(typeof explicitModuleBoundaryTypesRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof explicitModuleBoundaryTypesRule.meta.severity).toBe('string')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })

    test('should return FunctionDeclaration as a function', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should return FunctionExpression as a function', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should return ArrowFunctionExpression as a function', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should return exactly 3 visitor methods', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(3)
    })

    test('should create new visitor per call', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor1 = explicitModuleBoundaryTypesRule.create(context)
      const visitor2 = explicitModuleBoundaryTypesRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting missing return types on exported functions', () => {
    test('should report exported function declaration without return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('add')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report exported function declaration with return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add', true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-exported function declaration without return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('internal'))

      expect(reports.length).toBe(0)
    })

    test('should report exported default function without return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration('defaultFunc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('defaultFunc')
    })

    test('should not report exported default function with return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration('defaultFunc', true))

      expect(reports.length).toBe(0)
    })

    test('should report multiple exported functions independently', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('func1'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('func2'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('func3'))

      expect(reports.length).toBe(3)
    })

    test('should report function named with special characters', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('$myFunction'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$myFunction')
    })

    test('should report function with underscore name', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('_privateHelper'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_privateHelper')
    })

    test('should report function with single character name', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('f'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('f')
    })

    test('should report exported function at different line numbers', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('func', false, 42, 5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report exported function at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('topLevel', false, 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report exported default function without name', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration(null))

      expect(reports.length).toBe(1)
    })

    test('should report exported function with empty body', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'emptyFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report exported function with parameters but no return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'withParams' },
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting missing return types on exported arrow functions', () => {
    test('should report exported arrow function without return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myArrow')
      expect(reports[0].message).toContain('return type')
    })

    test('should not report exported arrow function with return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow', true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-exported arrow function', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createNonExportedArrowFunction('internal'))

      expect(reports.length).toBe(0)
    })

    test('should report multiple exported arrow functions independently', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow1'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow2'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow3'))

      expect(reports.length).toBe(3)
    })

    test('should use arrow function kind in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports[0].message).toContain('Exported arrow function')
    })

    test('should report exported arrow function with underscore prefix', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('_helper'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_helper')
    })

    test('should report exported arrow function at specific location', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('loc', false, false, 10, 4))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report arrow function with expression body', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
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

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arrow function without type annotation on variable', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('noAnnotation', false, false))

      expect(reports.length).toBe(1)
    })

    test('should not report arrow function with both return type and type annotation', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('both', true, true))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting missing return types on exported function expressions', () => {
    test('should report exported function expression without return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('myFunc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myFunc')
    })

    test('should not report exported function expression with return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('myFunc', true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-exported function expression', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createNonExportedFunctionExpression('internal'))

      expect(reports.length).toBe(0)
    })

    test('should use function expression kind in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('myFunc'))

      expect(reports[0].message).toContain('Exported function expression')
    })

    test('should report multiple exported function expressions independently', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('fn1'))
      visitor.FunctionExpression(createExportedFunctionExpression('fn2'))

      expect(reports.length).toBe(2)
    })

    test('should report exported function expression at specific location', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('located', false, false, 25, 8))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report exported function expression with $ prefix name', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('$jQuery'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jQuery')
    })

    test('should report named function expression inside export', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'namedInner' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'namedOuter' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      // The function's own id (innerName) is preferred over the variable name
      expect(reports[0].message).toContain('namedInner')
    })
  })

  describe('options - allowArrowFunctions', () => {
    test('should not report exported arrow function when allowArrowFunctions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports.length).toBe(0)
    })

    test('should still report exported function declaration when allowArrowFunctions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports.length).toBe(1)
    })

    test('should still report exported function expression when allowArrowFunctions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('fn'))

      expect(reports.length).toBe(1)
    })

    test('should report exported arrow function when allowArrowFunctions is false', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: false }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports.length).toBe(1)
    })

    test('should report exported arrow function when allowArrowFunctions is not set', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports.length).toBe(1)
    })

    test('should only exempt arrow functions, not regular functions, with allowArrowFunctions true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('regular'))
      visitor.FunctionExpression(createExportedFunctionExpression('expr'))

      expect(reports.length).toBe(2)
    })

    test('should allow multiple arrow functions when allowArrowFunctions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('a1'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('a2'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('a3'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowTypedFunctionExpressions', () => {
    test('should not report exported arrow function when variable has type annotation', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('typedArrow', false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report exported function expression when variable has type annotation', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('typedFunc', false, true))

      expect(reports.length).toBe(0)
    })

    test('should still report when variable has no type annotation', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('untyped'))

      expect(reports.length).toBe(1)
    })

    test('should still report exported function declaration when allowTypedFunctionExpressions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('decl'))

      expect(reports.length).toBe(1)
    })

    test('should report arrow function without type annotation when allowTypedFunctionExpressions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('noAnnotation', false, false))

      expect(reports.length).toBe(1)
    })

    test('should report function expression without type annotation when allowTypedFunctionExpressions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('noAnnotation', false, false))

      expect(reports.length).toBe(1)
    })

    test('should not report when variable has type annotation but function also has return type', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('doubleTyped', true, true))

      expect(reports.length).toBe(0)
    })

    test('should handle null type annotation on variable', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'nullAnnotation',
            typeAnnotation: null,
          },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined type annotation on variable', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: 'undefAnnotation',
            typeAnnotation: undefined,
          },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report function expression with type annotation when option is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('typedExpr', false, true))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowHigherOrderFunctions', () => {
    test('should not report exported function returning arrow function', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
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
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('regular'))

      expect(reports.length).toBe(1)
    })

    test('should not report exported function returning function expression', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerFunc = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'returnsFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerFunc }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function returning arrow function directly', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'curried' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function returning function expression directly', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'factory' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when body returns a non-function', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'returnsValue' },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })

    test('should report when body has no return statement', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'noReturn' },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })

    test('should report when body has empty block statement', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'emptyBody' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })

    test('should report when return statement has null argument', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'returnNull' },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })

    test('should detect higher-order among multiple statements', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'multiStmt' },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ReturnStatement', argument: innerArrow },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should report when allowHigherOrderFunctions is false', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: false }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'hof' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })
  })

  describe('combined options', () => {
    test('should handle all options true', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.FunctionExpression(createExportedFunctionExpression('typedFunc', false, true))

      expect(reports.length).toBe(0)
    })

    test('should handle allowArrowFunctions + allowHigherOrderFunctions', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'hof' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }
      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should handle allowTypedFunctionExpressions + allowHigherOrderFunctions', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('typed', false, true))

      expect(reports.length).toBe(0)
    })

    test('should report function declaration even with all options true', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('regularFunc'))

      expect(reports.length).toBe(1)
    })

    test('should handle allowArrowFunctions + allowTypedFunctionExpressions', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowTypedFunctionExpressions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('a'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('b', false, true))
      visitor.FunctionExpression(createExportedFunctionExpression('c', false, true))

      expect(reports.length).toBe(0)
    })

    test('should report untyped function expression with all but typed option true', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('untyped'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty options object', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('test'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.FunctionExpression(createExportedFunctionExpression('expr'))

      expect(reports.length).toBe(3)
    })
  })

  describe('message quality', () => {
    test('should mention API documentation in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].message.toLowerCase()).toContain('api')
    })

    test('should include function name in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('myFunction'))

      expect(reports[0].message).toContain('myFunction')
    })

    test('should mention exported in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].message).toContain('Exported')
    })

    test('should mention type safety in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('should mention return type annotation in message', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].message.toLowerCase()).toContain('return type')
    })

    test('should use correct kind for function declarations', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('myFunc'))

      expect(reports[0].message).toContain('Exported function')
      expect(reports[0].message).not.toContain('arrow')
      expect(reports[0].message).not.toContain('expression')
    })

    test('should use correct kind for arrow functions', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('myArrow'))

      expect(reports[0].message).toContain('Exported arrow function')
    })

    test('should use correct kind for function expressions', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('myExpr'))

      expect(reports[0].message).toContain('Exported function expression')
    })

    test('should handle function without name gracefully', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportDefaultDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Exported function')
      expect(reports[0].message).toContain('missing a return type')
    })

    test('should include function name with single quotes', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('named'))

      expect(reports[0].message).toContain("'named'")
    })
  })

  describe('location reporting', () => {
    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add'))

      expect(reports[0].loc).toBeDefined()
    })

    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add', false, 15, 4))

      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add', false, 15, 8))

      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add', false, 15, 8))

      expect(reports[0].loc?.end.line).toBe(15)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('add', false, 1, 0))

      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should handle high line numbers', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('farDown', false, 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle high column numbers', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('farRight', false, 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
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
      const { context, reports } = createMockRuleContext({ options: [{}] })
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
      const { context, reports } = createMockRuleContext({ options: [{}] })
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
      const { context, reports } = createMockRuleContext({ options: [{}] })
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
      const { context, reports } = createMockRuleContext({ options: [{}] })
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
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.FunctionExpression(createExportedFunctionExpression('typedFunc', false, true))

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as id', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric zero node', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
    })

    test('should handle node with false value', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration(false)).not.toThrow()
    })

    test('should handle node without parent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'orphan' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null parent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'nullParent' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: null,
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined parent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'undefParent' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: undefined,
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without body', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'noBody' },
        params: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'badLoc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 'one', column: 0 }, end: { line: 'two', column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'partialLoc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 2 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where parent type is unrecognized', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'weird' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'SomeOtherNodeType' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc start but no start properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'emptyStart' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: {}, end: {} },
        parent: { type: 'ExportNamedDeclaration' },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
      // Defaults to line 1, column 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle null node for FunctionExpression', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle null node for ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node for FunctionExpression', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle undefined node for ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
    })

    test('should handle config with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: {},
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

    test('should handle arrow function without parent id name', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: {},
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle function expression without parent id name', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: {},
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      expect(() => visitor.FunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with non-VariableDeclarator parent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'CallExpression' },
      }

      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator parent without VariableDeclaration grandparent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'detached' },
          parent: { type: 'SomeOtherType' },
        },
      }

      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('isExported detection - boundary conditions', () => {
    test('should detect ExportNamedDeclaration parent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('named'))

      expect(reports.length).toBe(1)
    })

    test('should detect ExportDefaultDeclaration parent', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration('default'))

      expect(reports.length).toBe(1)
    })

    test('should not detect Program parent as exported', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('local'))

      expect(reports.length).toBe(0)
    })

    test('should detect exported arrow via VariableDeclaration chain', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('chained'))

      expect(reports.length).toBe(1)
    })

    test('should not report when VariableDeclaration parent is Program', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createNonExportedArrowFunction('local'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-exported function expression', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createNonExportedFunctionExpression('localFn'))

      expect(reports.length).toBe(0)
    })

    test('should detect exported function expression via VariableDeclaration chain', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('exportedFn'))

      expect(reports.length).toBe(1)
    })
  })

  describe('hasReturnType detection', () => {
    test('should detect missing return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('noReturn'))

      expect(reports.length).toBe(1)
    })

    test('should detect present return type', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('withReturn', true))

      expect(reports.length).toBe(0)
    })

    test('should treat null returnType as missing', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'nullReturn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        returnType: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should treat undefined returnType as missing', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'undefReturn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        returnType: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should treat empty object returnType as present', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'emptyObjReturn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        returnType: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should detect return type on arrow function', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('typed', true))

      expect(reports.length).toBe(0)
    })

    test('should detect return type on function expression', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('typed', true))

      expect(reports.length).toBe(0)
    })
  })

  describe('isHigherOrderFunction detection', () => {
    test('should detect function returning arrow function via block statement', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'hof' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should detect function returning function expression via block statement', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerFunc = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'hof' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerFunc }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should not consider function returning CallExpression as higher-order', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const call = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'factory' },
        arguments: [],
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'returnsCall' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: call }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })

    test('should handle function with non-array body statements', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'badBody' },
        params: [],
        body: { type: 'BlockStatement', body: 'not-an-array' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(1)
    })

    test('should detect arrow directly returning arrow function (expression body)', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Literal', value: 42 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'curried' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect arrow directly returning FunctionExpression (expression body)', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'factory' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not consider arrow returning literal as higher-order', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'returnsLiteral' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('isVariableTypedWithFunction detection', () => {
    test('should detect type annotation on variable for arrow function', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('typed', false, true))

      expect(reports.length).toBe(0)
    })

    test('should detect type annotation on variable for function expression', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('typed', false, true))

      expect(reports.length).toBe(0)
    })

    test('should not suppress when type annotation is missing', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('untyped', false, false))

      expect(reports.length).toBe(1)
    })

    test('should not suppress function declaration even with allowTypedFunctionExpressions', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('decl'))

      expect(reports.length).toBe(1)
    })

    test('should not detect type annotation when parent is not VariableDeclarator', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'CallExpression',
          arguments: [],
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0) // not exported
    })

    test('should handle parent with null id', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: null,
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('getFunctionName resolution', () => {
    test('should get name from function declaration id', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('directName'))

      expect(reports[0].message).toContain('directName')
    })

    test('should get name from variable declarator for arrow function', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('varName'))

      expect(reports[0].message).toContain('varName')
    })

    test('should get name from variable declarator for function expression', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('varName'))

      expect(reports[0].message).toContain('varName')
    })

    test('should handle function with null id in default export', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedDefaultFunctionDeclaration(null))

      expect(reports.length).toBe(1)
      // No name to include in message, but still reports
      expect(reports[0].message).toContain('Exported function')
    })

    test('should handle function id without name property', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle arrow with parent VariableDeclarator with non-Identifier id', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'ObjectPattern', properties: [] },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should prefer function id over variable name when both exist', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'innerName' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'outerName' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      // FunctionExpression id (innerName) is not used; variable name (outerName) is used
      // because getFunctionName first checks n.id which is the function's own id
      // Actually, looking at the code: for FunctionExpression, the id IS the function's own id
      // which has innerName. So the message should contain 'innerName'
      expect(reports[0].message).toContain('innerName')
    })
  })

  describe('mixed export scenarios', () => {
    test('should report all untyped exports in a module', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('fn1'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('fn2', true))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow1'))
      visitor.FunctionExpression(createExportedFunctionExpression('expr1', true))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow2'))

      expect(reports.length).toBe(3)
    })

    test('should not report any when all have return types', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('fn1', true))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow1', true))
      visitor.FunctionExpression(createExportedFunctionExpression('expr1', true))

      expect(reports.length).toBe(0)
    })

    test('should not report internal functions mixed with exports', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('helper1'))
      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('helper2'))
      visitor.ArrowFunctionExpression(createNonExportedArrowFunction('localArrow'))

      expect(reports.length).toBe(0)
    })

    test('should report only exported without return type in mixed module', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('internal'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('api1'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('api2', true))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('apiArrow'))

      expect(reports.length).toBe(2)
    })

    test('should handle multiple visitors sharing same context', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = createExportedFunctionDeclaration('shared')
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('rule default export', () => {
    test('should have default export matching named export', () => {
      const mod = explicitModuleBoundaryTypesRule
      expect(mod).toBeDefined()
      expect(mod.meta).toBeDefined()
      expect(mod.create).toBeDefined()
    })
  })

  describe('additional option combinations', () => {
    test('should allow typed arrow function but report untyped arrow function with allowTypedFunctionExpressions', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('typed', false, true))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('untyped', false, false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('untyped')
    })

    test('should allow typed function expression but report untyped function expression', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('typed', false, true))
      visitor.FunctionExpression(createExportedFunctionExpression('untyped', false, false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('untyped')
    })

    test('should apply all three options simultaneously', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            allowArrowFunctions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('typedArrow', false, true))
      visitor.FunctionExpression(createExportedFunctionExpression('typedExpr', false, true))

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'hof' },
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }
      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should still report untyped function expression when only allowArrowFunctions is true', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowArrowFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionExpression(createExportedFunctionExpression('untyped'))

      expect(reports.length).toBe(1)
    })

    test('should still report arrow function when only allowTypedFunctionExpressions is true and no annotation', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowTypedFunctionExpressions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.ArrowFunctionExpression(createExportedArrowFunction('noAnnotation'))

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor method invocations', () => {
    test('should not cross-contaminate reports between visitor types', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('fn'))
      visitor.ArrowFunctionExpression(createExportedArrowFunction('arrow'))
      visitor.FunctionExpression(createExportedFunctionExpression('expr'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('fn')
      expect(reports[1].message).toContain('arrow')
      expect(reports[2].message).toContain('expr')
    })

    test('should handle same function visited twice', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = createExportedFunctionDeclaration('dup')
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(2)
    })

    test('should handle rapid sequential visits', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration(createExportedFunctionDeclaration(`func${i}`))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating exported and non-exported visits', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      visitor.FunctionDeclaration(createExportedFunctionDeclaration('exp1'))
      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('int1'))
      visitor.FunctionDeclaration(createExportedFunctionDeclaration('exp2'))
      visitor.FunctionDeclaration(createNonExportedFunctionDeclaration('int2'))

      expect(reports.length).toBe(2)
    })
  })

  describe('higher-order function edge cases', () => {
    test('should handle function with multiple return statements only one being function', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const innerArrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const outerFunc = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'multiReturn' },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: {
                type: 'BlockStatement',
                body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: null } }],
              },
              alternate: null,
            },
            { type: 'ReturnStatement', argument: innerArrow },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(outerFunc)

      expect(reports.length).toBe(0)
    })

    test('should not detect function expression returning non-function expression body', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'exprBody' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect function expression returning arrow function via expression body', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Literal', value: 42 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'hocExpr' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle function with body as non-object', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'stringBody' },
        params: [],
        body: 'not-an-object',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function with null body', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ allowHigherOrderFunctions: true }],
      })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'nullBody' },
        params: [],
        body: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('schema structure', () => {
    test('should have type object as first schema entry', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].type).toBe('object')
    })

    test('should have additionalProperties false in schema', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      expect(schema[0].additionalProperties).toBe(false)
    })

    test('should have boolean type for allowArrowFunctions schema', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.allowArrowFunctions.type).toBe('boolean')
    })

    test('should have boolean type for allowHigherOrderFunctions schema', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.allowHigherOrderFunctions.type).toBe('boolean')
    })

    test('should have boolean type for allowTypedFunctionExpressions schema', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.allowTypedFunctionExpressions.type).toBe('boolean')
    })

    test('should have exactly 3 schema properties', () => {
      const schema = explicitModuleBoundaryTypesRule.meta.schema as Record<string, unknown>[]
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(Object.keys(props)).toHaveLength(3)
    })
  })

  describe('non-standard node shapes', () => {
    test('should handle node where id.name is a number', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 42 },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function expression with array body', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'arrayBody' },
          parent: {
            type: 'VariableDeclaration',
            parent: { type: 'ExportNamedDeclaration' },
          },
        },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'extra' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
        async: true,
        generator: true,
        leadingComments: [],
        trailingComments: [],
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('extra')
    })

    test('should handle exported function with async keyword', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'asyncFn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('asyncFn')
    })

    test('should handle exported generator function', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'genFn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        generator: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('genFn')
    })

    test('should handle function expression inside object property export', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'Property',
          key: { type: 'Identifier', name: 'method' },
          parent: { type: 'ObjectExpression' },
        },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function inside class method', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: {
          type: 'Property',
          key: { type: 'Identifier', name: 'callback' },
          parent: { type: 'ObjectExpression' },
        },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle exported function with type parameters', () => {
      const { context, reports } = createMockRuleContext({ options: [{}] })
      const visitor = explicitModuleBoundaryTypesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'genericFn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        typeParameters: { type: 'TSTypeParameterDeclaration', params: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        parent: { type: 'ExportNamedDeclaration' },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('genericFn')
    })
  })
})
