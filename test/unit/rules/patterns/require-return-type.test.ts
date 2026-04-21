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

// ============================================================
// META PROPERTIES (20 tests)
// ============================================================
describe('require-return-type rule - meta properties', () => {
  test('meta.type should be suggestion', () => {
    expect(requireReturnTypeRule.meta.type).toBe('suggestion')
  })

  test('meta.severity should be warn', () => {
    expect(requireReturnTypeRule.meta.severity).toBe('warn')
  })

  test('meta.docs.recommended should be false', () => {
    expect(requireReturnTypeRule.meta.docs?.recommended).toBe(false)
  })

  test('meta.docs.category should be patterns', () => {
    expect(requireReturnTypeRule.meta.docs?.category).toBe('patterns')
  })

  test('meta.schema should be defined', () => {
    expect(requireReturnTypeRule.meta.schema).toBeDefined()
  })

  test('meta.schema should be an array', () => {
    expect(Array.isArray(requireReturnTypeRule.meta.schema)).toBe(true)
  })

  test('meta.schema should have one element', () => {
    expect(requireReturnTypeRule.meta.schema).toHaveLength(1)
  })

  test('meta.schema first element should be an object', () => {
    const schema = requireReturnTypeRule.meta.schema as Record<string, unknown>[]
    expect(typeof schema[0]).toBe('object')
  })

  test('meta.schema should define allowArrowFunctions property', () => {
    const schema = requireReturnTypeRule.meta.schema as Record<string, unknown>[]
    const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
    expect(props).toHaveProperty('allowArrowFunctions')
  })

  test('meta.schema should define allowTypedFunctionExpressions property', () => {
    const schema = requireReturnTypeRule.meta.schema as Record<string, unknown>[]
    const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
    expect(props).toHaveProperty('allowTypedFunctionExpressions')
  })

  test('meta.schema should define allowHigherOrderFunctions property', () => {
    const schema = requireReturnTypeRule.meta.schema as Record<string, unknown>[]
    const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
    expect(props).toHaveProperty('allowHigherOrderFunctions')
  })

  test('meta.fixable should be undefined', () => {
    expect(requireReturnTypeRule.meta.fixable).toBeUndefined()
  })

  test('meta.docs.description should mention return type', () => {
    expect(requireReturnTypeRule.meta.docs?.description.toLowerCase()).toContain('return type')
  })

  test('meta.docs.description should be a non-empty string', () => {
    expect(typeof requireReturnTypeRule.meta.docs?.description).toBe('string')
    expect(requireReturnTypeRule.meta.docs!.description.length).toBeGreaterThan(0)
  })

  test('meta.docs should have a url', () => {
    expect(requireReturnTypeRule.meta.docs?.url).toBeDefined()
  })

  test('meta.docs.url should be a string', () => {
    expect(typeof requireReturnTypeRule.meta.docs?.url).toBe('string')
  })

  test('meta.docs.url should contain require-return-type', () => {
    expect(requireReturnTypeRule.meta.docs?.url).toContain('require-return-type')
  })

  test('meta should not be deprecated', () => {
    expect(requireReturnTypeRule.meta.deprecated).toBeUndefined()
  })

  test('meta should not have replacedBy', () => {
    expect(requireReturnTypeRule.meta.replacedBy).toBeUndefined()
  })

  test('meta should not require type checking', () => {
    expect(requireReturnTypeRule.meta.requiresTypeChecking).toBeUndefined()
  })
})

// ============================================================
// CREATE / VISITOR (8 tests)
// ============================================================
describe('require-return-type rule - create/visitor', () => {
  test('create should return an object', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(typeof visitor).toBe('object')
  })

  test('visitor should have FunctionDeclaration method', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(typeof visitor.FunctionDeclaration).toBe('function')
  })

  test('visitor should have FunctionExpression method', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(typeof visitor.FunctionExpression).toBe('function')
  })

  test('visitor should have ArrowFunctionExpression method', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(typeof visitor.ArrowFunctionExpression).toBe('function')
  })

  test('visitor should only have exactly 3 keys', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(Object.keys(visitor)).toHaveLength(3)
  })

  test('visitor methods should be callable without throwing', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('fn'))).not.toThrow()
    expect(() => visitor.FunctionExpression(createFunctionExpression('fn'))).not.toThrow()
    expect(() => visitor.ArrowFunctionExpression(createArrowFunctionExpression())).not.toThrow()
  })

  test('create can be called multiple times with different contexts', () => {
    const { context: ctx1, reports: r1 } = createMockContext()
    const { context: ctx2, reports: r2 } = createMockContext({ allowArrowFunctions: true })
    const v1 = requireReturnTypeRule.create(ctx1)
    const v2 = requireReturnTypeRule.create(ctx2)
    v1.ArrowFunctionExpression(createArrowFunctionExpression())
    v2.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(r1.length).toBe(1)
    expect(r2.length).toBe(0)
  })

  test('visitor FunctionDeclaration should accept single argument', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(visitor.FunctionDeclaration.length).toBeLessThanOrEqual(1)
  })
})

// ============================================================
// DETECTION (30 tests)
// ============================================================
describe('require-return-type rule - detection', () => {
  test('should report function declaration without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('add'))
    expect(reports.length).toBe(1)
  })

  test('should not report function declaration with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('add', true))
    expect(reports.length).toBe(0)
  })

  test('should report function expression without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('handler'))
    expect(reports.length).toBe(1)
  })

  test('should not report function expression with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('handler', true))
    expect(reports.length).toBe(0)
  })

  test('should report arrow function without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(1)
  })

  test('should not report arrow function with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
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

  test('should report function expression with variable name from parent', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'myFunc', hasTypeAnnotation: false })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('myFunc')
  })

  test('should report arrow function with variable name from parent', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'myArrow', hasTypeAnnotation: false })
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('myArrow')
  })

  test('should report function expression with expression body as arrow', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    visitor.ArrowFunctionExpression(
      createArrowFunctionExpression(false, 1, 0, undefined, innerArrow),
    )
    expect(reports.length).toBe(1)
  })

  test('should detect missing return type on exported function', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('exportedFn'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('exportedFn')
  })

  test('should detect missing return type on async function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'asyncFn' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      async: true,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
  })

  test('should detect missing return type on generator function', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'genFn' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      generator: true,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
  })

  test('should detect missing return type on method in object literal', () => {
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
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('methodName')
  })

  test('should detect missing return type on method definition', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'classMethod' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('classMethod')
  })

  test('should detect missing return type on function in assignment expression', () => {
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
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('assignedFunc')
  })

  test('should detect missing return type on arrow function with expression body', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'Identifier', name: 'value' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.ArrowFunctionExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should detect missing return type on function with parameters', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'withParams' },
      params: [
        { type: 'Identifier', name: 'a' },
        { type: 'Identifier', name: 'b' },
      ],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('withParams')
  })

  test('should detect missing return type on function with typed parameters but no return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'typedParams' },
      params: [{ type: 'Identifier', name: 'a', typeAnnotation: { type: 'TSTypeAnnotation' } }],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
  })

  test('should detect on function expression without id', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression(null))
    expect(reports.length).toBe(1)
  })

  test('should detect on nested arrow function without parent', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 5, 10))
    expect(reports.length).toBe(1)
  })

  test('should detect on function with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('emptyBody'))
    expect(reports.length).toBe(1)
  })

  test('should detect on function expression assigned to variable without type annotation', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'untyped', hasTypeAnnotation: false })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(1)
  })

  test('should report when function has body with statements but no return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'withBody' },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 42 } }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
  })

  test('should detect on function with null returnType', () => {
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
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
  })

  test('should detect on function with undefined returnType explicitly', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: undefined,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
  })

  test('should report arrow function as Arrow function kind', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports[0].message).toContain('Arrow function')
  })

  test('should report function expression as Function expression kind', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression())
    expect(reports[0].message).toContain('Function expression')
  })

  test('should report function declaration as Function kind', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
    expect(reports[0].message).toMatch(/^Function\b/)
  })

  test('should report on IIFE function expression', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      id: { type: 'Identifier', name: 'iife' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// NOT REPORTING (30 tests)
// ============================================================
describe('require-return-type rule - not reporting', () => {
  test('should not report function declaration with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('add', true))
    expect(reports.length).toBe(0)
  })

  test('should not report function expression with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('handler', true))
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function when allowArrowFunctions is true', () => {
    const { context, reports } = createMockContext({ allowArrowFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(0)
  })

  test('should not report function expression with typed variable when allowTypedFunctionExpressions is true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'typedFunc', hasTypeAnnotation: true })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function with typed variable when allowTypedFunctionExpressions is true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'typedArrow', hasTypeAnnotation: true })
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should not report higher-order function returning arrow when allowHigherOrderFunctions is true', () => {
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

  test('should not report higher-order arrow returning function when allowHigherOrderFunctions is true', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerFunc = createFunctionExpression()
    const outerArrow = createArrowFunctionExpression(false, 1, 0, undefined, innerFunc)
    visitor.ArrowFunctionExpression(outerArrow)
    expect(reports.length).toBe(0)
  })

  test('should not report named function expression with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('named', true))
    expect(reports.length).toBe(0)
  })

  test('should not report arrow with allowArrowFunctions and no return type', () => {
    const { context, reports } = createMockContext({ allowArrowFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 3, 5))
    expect(reports.length).toBe(0)
  })

  test('should not report function expression when parent is typed variable declarator', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'cb',
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSStringKeyword' } },
      },
    }
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function when parent is typed variable declarator', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'arrowCb',
        typeAnnotation: { type: 'TSTypeAnnotation' },
      },
    }
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should not report function whose body is an arrow function with allowHigherOrderFunctions', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'wrapper' },
      params: [],
      body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(0)
  })

  test('should not report function whose body is a function expression with allowHigherOrderFunctions', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerFunc = createFunctionExpression()
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'wrapper2' },
      params: [],
      body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerFunc }] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function body is a function expression with allowHigherOrderFunctions', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerFunc = createFunctionExpression()
    const outerArrow = createArrowFunctionExpression(false, 1, 0, undefined, innerFunc)
    visitor.ArrowFunctionExpression(outerArrow)
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function body is another arrow with allowHigherOrderFunctions', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    const outerArrow = createArrowFunctionExpression(false, 1, 0, undefined, innerArrow)
    visitor.ArrowFunctionExpression(outerArrow)
    expect(reports.length).toBe(0)
  })

  test('should not report with all options combined for arrow', () => {
    const { context, reports } = createMockContext({
      allowArrowFunctions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(0)
  })

  test('should not report with all options combined for typed function expression', () => {
    const { context, reports } = createMockContext({
      allowArrowFunctions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'typed', hasTypeAnnotation: true })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should not report function with returnType object present', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'annotated' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSNumberKeyword' } },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(0)
  })

  test('should not report function expression with id and return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node: Record<string, unknown> = {
      type: 'FunctionExpression',
      id: { type: 'Identifier', name: 'fn' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: { type: 'TSTypeAnnotation' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report when allowArrowFunctions is true even with expression body', () => {
    const { context, reports } = createMockContext({ allowArrowFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'Identifier', name: 'x' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.ArrowFunctionExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report function expression when parent is MethodDefinition with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: { type: 'TSTypeAnnotation' },
      parent: {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'method' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report function expression when parent is Property with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: { type: 'TSTypeAnnotation' },
      parent: {
        type: 'Property',
        key: { type: 'Identifier', name: 'prop' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report function expression when parent is AssignmentExpression with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: { type: 'TSTypeAnnotation' },
      parent: {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'obj' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(0)
  })

  test('should not report on function declaration at different line positions with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', true, 100, 50))
    expect(reports.length).toBe(0)
  })

  test('should not report on function expression at different line positions with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('fn', true, 200, 30))
    expect(reports.length).toBe(0)
  })

  test('should not report arrow function at different line positions with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, 300, 20))
    expect(reports.length).toBe(0)
  })

  test('should not report function in object property with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      returnType: { type: 'TSTypeAnnotation' },
      parent: {
        type: 'Property',
        key: { type: 'Identifier', name: 'getInfo' },
      },
      loc: { start: { line: 5, column: 4 }, end: { line: 5, column: 40 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(0)
  })
})

// ============================================================
// EDGE CASES (25 tests)
// ============================================================
describe('require-return-type rule - edge cases', () => {
  test('should handle null node for FunctionDeclaration', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
  })

  test('should handle undefined node for FunctionDeclaration', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
  })

  test('should handle string node for FunctionDeclaration', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
  })

  test('should handle number node for FunctionExpression', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionExpression(123)).not.toThrow()
  })

  test('should handle boolean node for ArrowFunctionExpression', () => {
    const { context } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
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

  test('should handle node with partial loc (only start)', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 } },
    }
    expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle empty options object', () => {
    const { context, reports } = createMockContext({})
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test'))
    expect(reports.length).toBe(1)
  })

  test('should handle undefined options array', () => {
    const reports: ReportDescriptor[] = []
    const context: RuleContext = {
      report: (descriptor: ReportDescriptor) => {
        reports.push({ message: descriptor.message, loc: descriptor.loc })
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

  test('should handle node with id but id has no name property', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle node with empty body array', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle node with body as non-object', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: 'not an object',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle function expression parent with non-Identifier key', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: {
        type: 'Property',
        key: { type: 'Literal', value: 'computed' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.FunctionExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle function expression parent with no key property', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: {
        type: 'Property',
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.FunctionExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle arrow function with body as non-BlockStatement and non-function', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'ArrowFunctionExpression',
      params: [],
      body: { type: 'BinaryExpression' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
    expect(reports.length).toBe(1)
  })

  test('should handle function with loc containing zero values', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 0, 0))
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(0)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle function with very large line/column numbers', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 9999, 8888))
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(9999)
    expect(reports[0].loc?.start.column).toBe(8888)
  })

  test('should handle allowTypedFunctionExpressions with non-VariableDeclarator parent', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: {
        type: 'CallExpression',
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle allowHigherOrderFunctions with non-returning function', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'noReturn' },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports.length).toBe(1)
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

  test('should handle node with parent that is null', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node: Record<string, unknown> = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: null,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle VariableDeclarator parent with non-Identifier id', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports.length).toBe(1)
  })

  test('should handle config with no options at all', () => {
    const reports: ReportDescriptor[] = []
    const context: RuleContext = {
      report: (descriptor: ReportDescriptor) => {
        reports.push({ message: descriptor.message, loc: descriptor.loc })
      },
      getFilePath: () => '/src/file.ts',
      getAST: () => null,
      getSource: () => 'function test() {}',
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

    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('test'))).not.toThrow()
  })
})

// ============================================================
// LOCATION (15 tests)
// ============================================================
describe('require-return-type rule - location', () => {
  test('should report correct location for function declaration at line 10, column 5', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 10, 5))
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('should report correct location for function declaration at line 1, column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 1, 0))
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report correct location for function expression', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('fn', false, 5, 10))
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('should report correct location for arrow function', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 7, 3))
    expect(reports[0].loc?.start.line).toBe(7)
    expect(reports[0].loc?.start.column).toBe(3)
  })

  test('should report default location when node has no loc', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }
    visitor.FunctionDeclaration(node)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report default location when loc is null', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: null,
    }
    visitor.FunctionDeclaration(node)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle location with column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 3, 0))
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle location at line 100', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 100, 0))
    expect(reports[0].loc?.start.line).toBe(100)
  })

  test('should preserve end location from node', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test', false, 2, 4))
    expect(reports[0].loc?.end.line).toBe(2)
    expect(reports[0].loc?.end.column).toBe(34)
  })

  test('should report location for multiple different functions', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn1', false, 1, 0))
    visitor.FunctionDeclaration(createFunctionDeclaration('fn2', false, 2, 0))
    visitor.FunctionDeclaration(createFunctionDeclaration('fn3', false, 3, 0))
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[1].loc?.start.line).toBe(2)
    expect(reports[2].loc?.start.line).toBe(3)
  })

  test('should handle location for function expression at various positions', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression(null, false, 42, 8))
    expect(reports[0].loc?.start.line).toBe(42)
    expect(reports[0].loc?.start.column).toBe(8)
  })

  test('should handle location for arrow at line 50 column 25', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 50, 25))
    expect(reports[0].loc?.start.line).toBe(50)
    expect(reports[0].loc?.start.column).toBe(25)
  })

  test('should not crash for non-object node in location context', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle location when start has non-numeric line', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'test' },
      params: [],
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 'not-a-number', column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionDeclaration(node)
    expect(reports[0].loc?.start.line).toBe(1)
  })
})

// ============================================================
// MESSAGES (10 tests)
// ============================================================
describe('require-return-type rule - messages', () => {
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

  test('should include return type annotation in message', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('add'))
    expect(reports[0].message).toContain('return type annotation')
  })

  test('should include function kind for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
    expect(reports[0].message).toMatch(/^Function\b/)
  })

  test('should include Arrow function kind for arrow', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports[0].message).toContain('Arrow function')
  })

  test('should include Function expression kind for function expression', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression())
    expect(reports[0].message).toContain('Function expression')
  })

  test('should not include name for anonymous function expression', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression(null))
    const msg = reports[0].message
    // Anonymous function expression should not have a name in the message
    expect(msg).toContain('Function expression')
    expect(msg).not.toContain("'null'")
  })

  test('should not include name for anonymous arrow without parent', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    const msg = reports[0].message
    expect(msg).toContain('Arrow function')
    // Message should not have the name part (quoted)
    expect(msg).not.toMatch(/'[^)]+'/)
  })

  test('should include property name when function is in object property', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    const node = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
      parent: {
        type: 'Property',
        key: { type: 'Identifier', name: 'calculate' },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    }
    visitor.FunctionExpression(node)
    expect(reports[0].message).toContain('calculate')
  })
})

// ============================================================
// MULTIPLE REPORTS (10 tests)
// ============================================================
describe('require-return-type rule - multiple reports', () => {
  test('should report multiple function declarations', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn1'))
    visitor.FunctionDeclaration(createFunctionDeclaration('fn2'))
    visitor.FunctionDeclaration(createFunctionDeclaration('fn3'))
    expect(reports.length).toBe(3)
  })

  test('should report multiple function expressions', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('a'))
    visitor.FunctionExpression(createFunctionExpression('b'))
    expect(reports.length).toBe(2)
  })

  test('should report multiple arrow functions', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0))
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 2, 0))
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 3, 0))
    expect(reports.length).toBe(3)
  })

  test('should report mixed function types', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
    visitor.FunctionExpression(createFunctionExpression('expr'))
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(3)
  })

  test('should report only functions without return types in mixed batch', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('has', true))
    visitor.FunctionDeclaration(createFunctionDeclaration('nothas', false))
    visitor.FunctionDeclaration(createFunctionDeclaration('alsohas', true))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('nothas')
  })

  test('should report 10 functions without return types', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    for (let i = 0; i < 10; i++) {
      visitor.FunctionDeclaration(createFunctionDeclaration(`fn${i}`, false, i + 1, 0))
    }
    expect(reports.length).toBe(10)
  })

  test('should report interleaved typed and untyped functions correctly', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('a', false))
    visitor.FunctionDeclaration(createFunctionDeclaration('b', true))
    visitor.FunctionDeclaration(createFunctionDeclaration('c', false))
    visitor.FunctionDeclaration(createFunctionDeclaration('d', true))
    visitor.FunctionDeclaration(createFunctionDeclaration('e', false))
    expect(reports.length).toBe(3)
  })

  test('should report for all three visitor types in sequence', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('decl'))
    visitor.FunctionExpression(createFunctionExpression('expr'))
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports).toHaveLength(3)
    expect(reports[0].message).toContain('decl')
    expect(reports[1].message).toContain('expr')
    expect(reports[2].message).toContain('Arrow function')
  })

  test('should not carry over reports between separate create calls', () => {
    const { context: ctx1, reports: r1 } = createMockContext()
    const { context: ctx2, reports: r2 } = createMockContext()
    const v1 = requireReturnTypeRule.create(ctx1)
    const v2 = requireReturnTypeRule.create(ctx2)
    v1.FunctionDeclaration(createFunctionDeclaration('fn'))
    expect(r1.length).toBe(1)
    expect(r2.length).toBe(0)
    v2.FunctionDeclaration(createFunctionDeclaration('fn'))
    expect(r1.length).toBe(1)
    expect(r2.length).toBe(1)
  })

  test('should report all arrows when allowArrowFunctions is false but not when true', () => {
    const { context: ctx1, reports: r1 } = createMockContext({ allowArrowFunctions: false })
    const { context: ctx2, reports: r2 } = createMockContext({ allowArrowFunctions: true })
    const v1 = requireReturnTypeRule.create(ctx1)
    const v2 = requireReturnTypeRule.create(ctx2)
    v1.ArrowFunctionExpression(createArrowFunctionExpression())
    v1.ArrowFunctionExpression(createArrowFunctionExpression())
    v2.ArrowFunctionExpression(createArrowFunctionExpression())
    v2.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(r1.length).toBe(2)
    expect(r2.length).toBe(0)
  })
})

// ============================================================
// CONTEXT (10 tests)
// ============================================================
describe('require-return-type rule - context', () => {
  test('should work with different file paths', () => {
    const { context, reports } = createMockContext({}, '/custom/path.ts')
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test'))
    expect(reports.length).toBe(1)
  })

  test('should work with different source code', () => {
    const { context, reports } = createMockContext({}, '/src/app.ts', 'const x = () => 1')
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(1)
  })

  test('should work with empty source code', () => {
    const { context, reports } = createMockContext({}, '/src/empty.ts', '')
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test'))
    expect(reports.length).toBe(1)
  })

  test('should work with .tsx file extension', () => {
    const { context, reports } = createMockContext({}, '/src/component.tsx')
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('Component'))
    expect(reports.length).toBe(1)
  })

  test('should work with .js file extension', () => {
    const { context, reports } = createMockContext({}, '/src/index.js')
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('handler'))
    expect(reports.length).toBe(1)
  })

  test('should work with allowArrowFunctions set to false explicitly', () => {
    const { context, reports } = createMockContext({ allowArrowFunctions: false })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(1)
  })

  test('should work with allowTypedFunctionExpressions set to false explicitly', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: false })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'typed', hasTypeAnnotation: true })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(1)
  })

  test('should work with allowHigherOrderFunctions set to false explicitly', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: false })
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
    expect(reports.length).toBe(1)
  })

  test('should work with unknown extra options', () => {
    const { context, reports } = createMockContext({ unknownOption: true })
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('test'))
    expect(reports.length).toBe(1)
  })

  test('should work with all three options set to true', () => {
    const { context, reports } = createMockContext({
      allowArrowFunctions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(0)
  })
})

// ============================================================
// PARAMETERIZED - FUNCTION NAMES
// ============================================================
describe('require-return-type rule - parameterized function names', () => {
  test('should report function declaration named "add" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('add'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('add')
  })

  test('should report function declaration named "subtract" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('subtract'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('subtract')
  })

  test('should report function declaration named "multiply" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('multiply'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('multiply')
  })

  test('should report function declaration named "divide" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('divide'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('divide')
  })

  test('should report function declaration named "compute" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('compute'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('compute')
  })

  test('should report function declaration named "process" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('process'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('process')
  })

  test('should report function declaration named "handleClick" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('handleClick'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('handleClick')
  })

  test('should report function declaration named "onChange" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('onChange'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('onChange')
  })

  test('should report function declaration named "fetchData" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fetchData'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('fetchData')
  })

  test('should report function declaration named "render" without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('render'))
    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('render')
  })
})

// ============================================================
// PARAMETERIZED - FUNCTION TYPES
// ============================================================
describe('require-return-type rule - parameterized function types', () => {
  test('should report FunctionDeclaration without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
    expect(reports.length).toBe(1)
  })

  test('should report FunctionExpression without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('fn'))
    expect(reports.length).toBe(1)
  })

  test('should report ArrowFunctionExpression without return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(1)
  })

  test('should not report FunctionDeclaration with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))
    expect(reports.length).toBe(0)
  })

  test('should not report FunctionExpression with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionExpression(createFunctionExpression('fn', true))
    expect(reports.length).toBe(0)
  })

  test('should not report ArrowFunctionExpression with return type', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
    expect(reports.length).toBe(0)
  })
})

// ============================================================
// PARAMETERIZED - LINE NUMBERS
// ============================================================
describe('require-return-type rule - parameterized line numbers', () => {
  test('should report correct line 1 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 0))
    expect(reports[0].loc?.start.line).toBe(1)
  })

  test('should report correct line 5 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 5, 0))
    expect(reports[0].loc?.start.line).toBe(5)
  })

  test('should report correct line 10 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 10, 0))
    expect(reports[0].loc?.start.line).toBe(10)
  })

  test('should report correct line 25 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 25, 0))
    expect(reports[0].loc?.start.line).toBe(25)
  })

  test('should report correct line 50 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 50, 0))
    expect(reports[0].loc?.start.line).toBe(50)
  })

  test('should report correct line 100 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 100, 0))
    expect(reports[0].loc?.start.line).toBe(100)
  })

  test('should report correct line 250 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 250, 0))
    expect(reports[0].loc?.start.line).toBe(250)
  })

  test('should report correct line 500 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 500, 0))
    expect(reports[0].loc?.start.line).toBe(500)
  })
})

// ============================================================
// PARAMETERIZED - COLUMN NUMBERS
// ============================================================
describe('require-return-type rule - parameterized column numbers', () => {
  test('should report correct column 0 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 0))
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report correct column 2 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 2))
    expect(reports[0].loc?.start.column).toBe(2)
  })

  test('should report correct column 4 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 4))
    expect(reports[0].loc?.start.column).toBe(4)
  })

  test('should report correct column 8 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 8))
    expect(reports[0].loc?.start.column).toBe(8)
  })

  test('should report correct column 12 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 12))
    expect(reports[0].loc?.start.column).toBe(12)
  })

  test('should report correct column 16 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 16))
    expect(reports[0].loc?.start.column).toBe(16)
  })

  test('should report correct column 20 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 20))
    expect(reports[0].loc?.start.column).toBe(20)
  })

  test('should report correct column 32 for function declaration', () => {
    const { context, reports } = createMockContext()
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('fn', false, 1, 32))
    expect(reports[0].loc?.start.column).toBe(32)
  })
})

// ============================================================
// PARAMETERIZED - OPTION COMBINATIONS
// ============================================================
describe('require-return-type rule - parameterized option combos', () => {
  test('arrow function with allowArrowFunctions=true should produce 0 reports', () => {
    const { context, reports } = createMockContext({ allowArrowFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(0)
  })

  test('arrow function with allowArrowFunctions=false should produce 1 report', () => {
    const { context, reports } = createMockContext({ allowArrowFunctions: false })
    const visitor = requireReturnTypeRule.create(context)
    visitor.ArrowFunctionExpression(createArrowFunctionExpression())
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// HIGHER-ORDER FUNCTION DETECTION
// ============================================================
describe('require-return-type rule - higher-order functions', () => {
  test('should detect function returning arrow function body as higher-order', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'hof' },
      params: [],
      body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(0)
  })

  test('should not suppress report when allowHigherOrderFunctions is false', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: false })
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'hof' },
      params: [],
      body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(1)
  })

  test('should detect arrow with arrow body as higher-order', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    const outerArrow = createArrowFunctionExpression(false, 1, 0, undefined, innerArrow)
    visitor.ArrowFunctionExpression(outerArrow)
    expect(reports.length).toBe(0)
  })

  test('should detect arrow with function expression body as higher-order', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerFunc = createFunctionExpression()
    const outerArrow = createArrowFunctionExpression(false, 1, 0, undefined, innerFunc)
    visitor.ArrowFunctionExpression(outerArrow)
    expect(reports.length).toBe(0)
  })

  test('should not consider function returning non-function as higher-order', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'notHof' },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(1)
  })

  test('should handle block body with no return statement as non-higher-order', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'noReturn' },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(1)
  })

  test('should handle block body with return of non-function argument', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const outerFunc = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'returnsValue' },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'value' } }],
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionDeclaration(outerFunc)
    expect(reports.length).toBe(1)
  })

  test('should handle function expression returning arrow function with allowHigherOrderFunctions', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerArrow = createArrowFunctionExpression()
    const outerFunc = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerArrow }] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionExpression(outerFunc)
    expect(reports.length).toBe(0)
  })

  test('should handle function expression returning function expression with allowHigherOrderFunctions', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    const innerFunc = createFunctionExpression()
    const outerFunc = {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: innerFunc }] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.FunctionExpression(outerFunc)
    expect(reports.length).toBe(0)
  })

  test('should still report function declaration when allowHigherOrderFunctions is true and body is not higher-order', () => {
    const { context, reports } = createMockContext({ allowHigherOrderFunctions: true })
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('regular'))
    expect(reports.length).toBe(1)
  })
})

// ============================================================
// TYPED FUNCTION EXPRESSIONS
// ============================================================
describe('require-return-type rule - typed function expressions', () => {
  test('should not report function expression in typed variable when allowTypedFunctionExpressions is true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'typed', hasTypeAnnotation: true })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should report function expression in untyped variable when allowTypedFunctionExpressions is true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'untyped', hasTypeAnnotation: false })
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(1)
  })

  test('should not report arrow function in typed variable when allowTypedFunctionExpressions is true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'typedArrow', hasTypeAnnotation: true })
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))
    expect(reports.length).toBe(0)
  })

  test('should report arrow function in untyped variable when allowTypedFunctionExpressions is true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = createVariableDeclarator({ name: 'untypedArrow', hasTypeAnnotation: false })
    visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, 1, 0, parent))
    expect(reports.length).toBe(1)
  })

  test('should report function declaration even with allowTypedFunctionExpressions true', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    visitor.FunctionDeclaration(createFunctionDeclaration('add'))
    expect(reports.length).toBe(1)
  })

  test('should handle variable declarator with null type annotation', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'nullTyped',
        typeAnnotation: null,
      },
    }
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(1)
  })

  test('should handle variable declarator with undefined type annotation', () => {
    const { context, reports } = createMockContext({ allowTypedFunctionExpressions: true })
    const visitor = requireReturnTypeRule.create(context)
    const parent = {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'undefTyped',
        typeAnnotation: undefined,
      },
    }
    visitor.FunctionExpression(createFunctionExpression(null, false, 1, 0, parent))
    expect(reports.length).toBe(1)
  })
})
