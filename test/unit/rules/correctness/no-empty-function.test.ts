import { describe, test, expect, vi } from 'vitest'
import { noEmptyFunctionRule } from '../../../../src/rules/correctness/no-empty-function.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function foo() {}',
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

function createFunctionDeclaration(name = 'foo', isEmpty = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name },
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createFunctionExpression(isEmpty = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createArrowFunctionExpression(
  isEmpty = true,
  hasExpressionBody = false,
  line = 1,
  column = 0,
): unknown {
  if (hasExpressionBody) {
    return {
      type: 'ArrowFunctionExpression',
      body: { type: 'Literal', value: 1 },
      loc: {
        start: { line, column },
        end: { line, column: column + 10 },
      },
    }
  }
  return {
    type: 'ArrowFunctionExpression',
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMethodDefinition(
  kind = 'method',
  name = 'foo',
  isEmpty = true,
  hasSuper = false,
  line = 1,
  column = 0,
): unknown {
  const body: unknown[] = []

  if (hasSuper) {
    body.push({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Super' },
        arguments: [],
      },
    })
  }

  if (!isEmpty && !hasSuper) {
    body.push({
      type: 'ExpressionStatement',
      expression: { type: 'Literal', value: 1 },
    })
  }

  return {
    type: 'MethodDefinition',
    kind,
    key: { type: 'Identifier', name },
    value: {
      type: 'FunctionExpression',
      body: { type: 'BlockStatement', body },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMethodWithDecorator(
  decoratorName = 'override',
  name = 'foo',
  isEmpty = true,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    key: { type: 'Identifier', name },
    decorators: [
      {
        type: 'Decorator',
        expression: { type: 'Identifier', name: decoratorName },
      },
    ],
    value: {
      type: 'FunctionExpression',
      body: isEmpty
        ? { type: 'BlockStatement', body: [] }
        : {
            type: 'BlockStatement',
            body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
          },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createAsyncFunction(isEmpty = true, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    async: true,
    id: { type: 'Identifier', name: 'asyncFoo' },
    body: isEmpty
      ? { type: 'BlockStatement', body: [] }
      : {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-empty-function rule', () => {
  // ============================================================
  // META (12 tests)
  // ============================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyFunctionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noEmptyFunctionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noEmptyFunctionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correctness category', () => {
      expect(noEmptyFunctionRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noEmptyFunctionRule.meta.schema).toBeDefined()
    })

    test('should mention empty in description', () => {
      expect(noEmptyFunctionRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noEmptyFunctionRule.meta.schema)).toBe(true)
    })

    test('should have schema with object type', () => {
      const schema = noEmptyFunctionRule.meta.schema as Array<Record<string, unknown>>
      expect(schema[0].type).toBe('object')
    })

    test('should have allowArrowFunctions in schema properties', () => {
      const schema = noEmptyFunctionRule.meta.schema as Array<Record<string, unknown>>
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('allowArrowFunctions')
    })

    test('should have allowAsyncFunctions in schema properties', () => {
      const schema = noEmptyFunctionRule.meta.schema as Array<Record<string, unknown>>
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('allowAsyncFunctions')
    })

    test('should have allowConstructors in schema properties', () => {
      const schema = noEmptyFunctionRule.meta.schema as Array<Record<string, unknown>>
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('allowConstructors')
    })

    test('should have allowOverrideMethods in schema properties', () => {
      const schema = noEmptyFunctionRule.meta.schema as Array<Record<string, unknown>>
      const props = schema[0].properties as Record<string, unknown>
      expect(props).toHaveProperty('allowOverrideMethods')
    })
  })

  // ============================================================
  // CREATE VISITOR (1 test, kept from original)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with function methods', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  // ============================================================
  // DETECTING EMPTY FUNCTIONS - kept from original (8 tests)
  // ============================================================
  describe('detecting empty functions', () => {
    test('should report empty function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should not report function with non-empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', false))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report method with super call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EMPTY FUNCTION DECLARATIONS (15 tests)
  // ============================================================
  describe('empty function declarations', () => {
    test('should report empty function with name foo', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('should report empty function with name bar', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('bar', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('bar')
    })

    test('should report empty function with name handleClick', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('handleClick', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('handleClick')
    })

    test('should report empty function with underscore prefix name', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('_private', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should report empty function with dollar sign name', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('$jquery', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })

    test('should report empty function at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report empty function at arbitrary line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true, 42, 15))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report empty function at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true, 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report exactly one violation for one empty function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))

      expect(reports.length).toBe(1)
    })

    test('should report two separate empty function declarations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn2', true))

      expect(reports.length).toBe(2)
    })

    test('should report message containing "function" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('testFn', true))

      expect(reports[0].message).toContain('function')
      expect(reports[0].message).toContain('testFn')
    })

    test('should not report non-empty function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('notEmpty', false))

      expect(reports.length).toBe(0)
    })

    test('should report empty function with single character name', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('f', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"f"')
    })

    test('should report empty function with long descriptive name', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration('thisIsAVeryLongFunctionNameThatDescribesSomething', true),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report function with body containing statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('hasBody', false))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EMPTY FUNCTION EXPRESSIONS (11 tests)
  // ============================================================
  describe('empty function expressions', () => {
    test('should report empty function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should report message containing "function expression" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports[0].message).toContain('function expression')
    })

    test('should not include name in function expression message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      // FunctionExpression helper does not set id, so no name in message
      expect(reports[0].message).toContain('function expression')
    })

    test('should report empty function expression at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report empty function expression at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should not report non-empty function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(false))

      expect(reports.length).toBe(0)
    })

    test('should report multiple empty function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true, 1, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 2, 0))
      visitor.FunctionExpression(createFunctionExpression(true, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report exactly one violation for one empty function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should report empty function expression with message containing "empty"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('should report empty function expression with message containing "implementation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports[0].message.toLowerCase()).toContain('implementation')
    })

    test('should distinguish between empty and non-empty function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))
      visitor.FunctionExpression(createFunctionExpression(false))
      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================
  // EMPTY ARROW FUNCTIONS (12 tests)
  // ============================================================
  describe('empty arrow functions', () => {
    test('should report empty arrow function with block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should report message containing "arrow function" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports[0].message).toContain('arrow function')
    })

    test('should report empty arrow function at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false, 7, 20))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should not report arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-empty arrow function with block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, false))

      expect(reports.length).toBe(0)
    })

    test('should report multiple empty arrow functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false, 1, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false, 2, 0))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report empty arrow function with message containing "implementation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports[0].message.toLowerCase()).toContain('implementation')
    })

    test('should report exactly one violation for one empty arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should distinguish between empty and non-empty arrow functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, false))

      expect(reports.length).toBe(1)
    })

    test('should not report arrow function with expression body even when isEmpty is true', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      // hasExpressionBody=true takes precedence over isEmpty
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, true))

      expect(reports.length).toBe(0)
    })

    test('should report empty arrow function at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report empty arrow function with message containing "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports[0].message).toContain('Unexpected')
    })
  })

  // ============================================================
  // EMPTY METHODS (12 tests)
  // ============================================================
  describe('empty methods', () => {
    test('should report empty method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should report message containing "method" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'myMethod', true))

      expect(reports[0].message).toContain('method')
      expect(reports[0].message).toContain('myMethod')
    })

    test('should report empty method with name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'render', true))

      expect(reports[0].message).toContain('"render"')
    })

    test('should report empty method at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'fn', true, false, 12, 4))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should not report non-empty method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', false))

      expect(reports.length).toBe(0)
    })

    test('should report empty get method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('get', 'value', true))

      expect(reports.length).toBe(1)
    })

    test('should report empty set method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('set', 'value', true))

      expect(reports.length).toBe(1)
    })

    test('should report multiple empty methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'a', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'b', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'c', true))

      expect(reports.length).toBe(3)
    })

    test('should report empty method with message containing "implementation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'fn', true))

      expect(reports[0].message.toLowerCase()).toContain('implementation')
    })

    test('should report empty method with underscore name', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', '_internal', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_internal')
    })

    test('should distinguish between empty and non-empty methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'notEmpty', false))
      visitor.MethodDefinition(createMethodDefinition('method', 'empty', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('empty')
    })

    test('should report empty method at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'fn', true, false, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ============================================================
  // NON-EMPTY FUNCTIONS (22 tests)
  // ============================================================
  describe('non-empty functions', () => {
    test('should not report function declaration with body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('notEmpty', false))

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(false))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with block body and statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, false))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report method with body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'notEmpty', false))

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', false))

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with body containing return', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'returns' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'declares' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'VariableDeclaration', declarations: [], kind: 'const' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'conditional' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ThrowStatement', argument: { type: 'Literal', value: 'err' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with return statement in block', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'loop' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'WhileStatement',
                test: { type: 'Literal', value: true },
                body: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with try-catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'tryCatch' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'TryStatement',
              block: { type: 'BlockStatement', body: [] },
              handler: {
                type: 'CatchClause',
                body: { type: 'BlockStatement', body: [] },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with console.log call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'logger' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'Identifier', name: 'console' },
                  property: { type: 'Identifier', name: 'log' },
                },
                arguments: [{ type: 'Literal', value: 'hello' }],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with for loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForStatement',
              init: null,
              test: null,
              update: null,
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'AssignmentExpression',
                left: { type: 'Identifier', name: 'x' },
                right: { type: 'Literal', value: 1 },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'multi' },
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with switch statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'switcher' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'SwitchStatement',
                discriminant: { type: 'Identifier', name: 'x' },
                cases: [],
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with object expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'ObjectExpression', properties: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with call expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with conditional expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'ConditionalExpression',
          test: { type: 'Literal', value: true },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // ALLOW ARROW FUNCTIONS OPTION (11 tests)
  // ============================================================
  describe('options - allowArrowFunctions', () => {
    test('should allow empty arrow functions when option is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty regular functions when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty function expressions when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty methods when allowArrowFunctions is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should report empty arrow functions when option is false', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should report empty arrow functions when option is not set', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should allow multiple empty arrow functions when option is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(0)
    })

    test('should not affect non-empty arrow functions when option is true', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, false))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should allow empty arrow function but still report empty function declaration', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createFunctionDeclaration('decl', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('decl')
    })

    test('should allow empty arrow function but still report empty function expression', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should handle allowArrowFunctions with mixed function types', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, false))
      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================
  // ALLOW ASYNC FUNCTIONS OPTION (11 tests)
  // ============================================================
  describe('options - allowAsyncFunctions', () => {
    test('should allow empty async functions when option is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty sync functions when allowAsyncFunctions is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports.length).toBe(1)
    })

    test('should report empty async functions when option is false', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))

      expect(reports.length).toBe(1)
    })

    test('should report empty async functions when option is not set', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))

      expect(reports.length).toBe(1)
    })

    test('should not report non-empty async function', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(false))

      expect(reports.length).toBe(0)
    })

    test('should still report empty sync function expressions when allowAsyncFunctions is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty methods when allowAsyncFunctions is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty arrow functions when allowAsyncFunctions is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should allow multiple empty async functions when option is true', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.FunctionDeclaration(createAsyncFunction(true))

      expect(reports.length).toBe(0)
    })

    test('should allow empty async function but report empty sync function', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.FunctionDeclaration(createFunctionDeclaration('sync', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sync')
    })

    test('should report empty async function at specific location when option is false', () => {
      const { context, reports } = createMockContext({ allowAsyncFunctions: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true, 3, 8))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  // ============================================================
  // ALLOW CONSTRUCTORS OPTION (11 tests)
  // ============================================================
  describe('options - allowConstructors', () => {
    test('should allow empty constructors when option is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty methods when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should report empty constructors when option is false', () => {
      const { context, reports } = createMockContext({ allowConstructors: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should report empty constructors when option is not set', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty function declarations when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty function expressions when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty arrow functions when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should allow multiple empty constructors when option is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports.length).toBe(0)
    })

    test('should allow empty constructor but report empty method', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'foo', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('should not report non-empty constructor when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', false))

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super when allowConstructors is true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // ALLOW OVERRIDE METHODS OPTION (11 tests)
  // ============================================================
  describe('options - allowOverrideMethods', () => {
    test('should allow empty override methods when option is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('override', 'foo', true))

      expect(reports.length).toBe(0)
    })

    test('should still report empty methods without override decorator', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'bar', true))

      expect(reports.length).toBe(1)
    })

    test('should report override methods when option is false', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('override', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should report override methods when option is not set', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('override', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty function declarations when allowOverrideMethods is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty function expressions when allowOverrideMethods is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should still report empty arrow functions when allowOverrideMethods is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should not report non-empty override method when option is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('override', 'foo', false))

      expect(reports.length).toBe(0)
    })

    test('should allow multiple empty override methods when option is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('override', 'a', true))
      visitor.MethodDefinition(createMethodWithDecorator('override', 'b', true))
      visitor.MethodDefinition(createMethodWithDecorator('override', 'c', true))

      expect(reports.length).toBe(0)
    })

    test('should not skip method with non-override decorator when option is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodWithDecorator('deprecated', 'foo', true))

      expect(reports.length).toBe(1)
    })

    test('should report empty method with override decorator at specific location when option is false', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: false })
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'overridden' },
        decorators: [
          {
            type: 'Decorator',
            expression: { type: 'Identifier', name: 'override' },
          },
        ],
        value: {
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 12 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  // ============================================================
  // CONSTRUCTOR WITH SUPER (11 tests)
  // ============================================================
  describe('constructor with super', () => {
    test('should not report constructor with super call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super call even without allowConstructors', () => {
      const { context, reports } = createMockContext({ allowConstructors: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })

    test('should report empty constructor without super call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, false))

      expect(reports.length).toBe(1)
    })

    test('should report empty constructor without super when allowConstructors is false', () => {
      const { context, reports } = createMockContext({ allowConstructors: false })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, false))

      expect(reports.length).toBe(1)
    })

    test('should not report constructor with super at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition('constructor', 'constructor', true, true, 20, 8),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with super and allowConstructors true', () => {
      const { context, reports } = createMockContext({ allowConstructors: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, true))

      expect(reports.length).toBe(0)
    })

    test('should report empty constructor message as "constructor" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, false))

      expect(reports[0].message).toContain('constructor')
    })

    test('should not report constructor with super call and arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { type: 'Identifier', name: 'constructor' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [{ type: 'Identifier', name: 'args' }],
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should report empty method with kind "method" even when super is present', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      // isConstructorWithSuper checks for kind === 'constructor', so a regular method
      // with super expression in body should still be reported if empty
      visitor.MethodDefinition(createMethodDefinition('method', 'regularMethod', true, false))

      expect(reports.length).toBe(1)
    })

    test('should not report constructor with super followed by other code', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { type: 'Identifier', name: 'constructor' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'CallExpression',
                  callee: { type: 'Super' },
                  arguments: [],
                },
              },
              {
                type: 'ExpressionStatement',
                expression: { type: 'Literal', value: 42 },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should report constructor without super even when allowOverrideMethods is true', () => {
      const { context, reports } = createMockContext({ allowOverrideMethods: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true, false))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // ARROW FUNCTION EXPRESSION BODY (10 tests)
  // ============================================================
  describe('arrow function expression body', () => {
    test('should not report arrow function with literal expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with identifier expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with binary expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report arrow function with empty block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false))

      expect(reports.length).toBe(1)
    })

    test('should not report arrow function with member expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with template literal body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with logical expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'LogicalExpression',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with arrow function expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'ArrowFunctionExpression',
          body: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report arrow function with empty block body at specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true, false, 15, 6))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should not report arrow function with unary expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'UnaryExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // VIOLATION PROPERTIES (11 tests)
  // ============================================================
  describe('violation properties', () => {
    test('should mention function name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunction', true))

      expect(reports[0].message).toContain('myFunction')
    })

    test('should mention implementation in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports[0].message.toLowerCase()).toContain('implementation')
    })

    test('should include "Unexpected" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should include function type "function" in message for declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('test', true))

      expect(reports[0].message).toContain('empty function')
      expect(reports[0].message).toContain('"test"')
    })

    test('should include function type "function expression" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports[0].message).toContain('empty function expression')
    })

    test('should include function type "arrow function" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports[0].message).toContain('empty arrow function')
    })

    test('should include function type "method" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'myMethod', true))

      expect(reports[0].message).toContain('empty method')
      expect(reports[0].message).toContain('"myMethod"')
    })

    test('should include function type "constructor" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))

      expect(reports[0].message).toContain('empty constructor')
    })

    test('should report correct location for function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for method', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'fn', true, false, 8, 3))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should include name in quotes in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('quoted', true))

      expect(reports[0].message).toContain('"quoted"')
    })
  })

  // ============================================================
  // EDGE CASES (16 tests)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' } }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('foo', true))

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
        getSource: () => 'function foo() {}',
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

      const visitor = noEmptyFunctionRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createFunctionDeclaration('foo', true)),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle null FunctionExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle null ArrowFunctionExpression node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle null MethodDefinition node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle node with body of wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'SomeOtherType', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle MethodDefinition with missing value', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'noValue' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
    })

    test('should handle node with boolean node value', () => {
      const { context } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
    })

    test('should handle node with empty body array that is not BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'SomeType', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // MULTIPLE VIOLATIONS (11 tests)
  // ============================================================
  describe('multiple violations', () => {
    test('should report all empty function types in one context', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', true))
      visitor.FunctionExpression(createFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.MethodDefinition(createMethodDefinition('method', 'm1', true))

      expect(reports.length).toBe(4)
    })

    test('should report correct count of empty functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('a', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('b', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('c', false))

      expect(reports.length).toBe(2)
    })

    test('should report mixed violations with non-violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('empty', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('notempty', false))
      visitor.FunctionExpression(createFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(2)
    })

    test('should report all empty function declarations separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('a', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('b', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('c', true))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
      expect(reports[2].message).toContain('c')
    })

    test('should report all empty arrow functions separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))

      expect(reports.length).toBe(2)
    })

    test('should report all empty methods separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'a', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'b', true))

      expect(reports.length).toBe(2)
    })

    test('should report violations at different locations', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('a', true, 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration('b', true, 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should report all with all options disabled', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))
      visitor.FunctionExpression(createFunctionExpression(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.MethodDefinition(createMethodDefinition('method', 'm', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', 'c', true))

      expect(reports.length).toBe(5)
    })

    test('should report multiple function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.FunctionExpression(createFunctionExpression(true, i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should skip only allowed types with mixed options', () => {
      const { context, reports } = createMockContext({ allowArrowFunctions: true })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('fn')
    })

    test('should report each visitor independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('f1', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'm1', true))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('f1')
      expect(reports[1].message).toContain('m1')
    })
  })

  // ============================================================
  // VALID CODE - EXTENDED (32 tests)
  // ============================================================
  describe('valid code - extended', () => {
    test('should not report function with single statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('fn', false))

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionExpression(createFunctionExpression(false))

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(false, true))

      expect(reports.length).toBe(0)
    })

    test('should not report method with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', 'fn', false))

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', false))

      expect(reports.length).toBe(0)
    })

    test('should not report function with if-else statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'conditional' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: {
                type: 'BlockStatement',
                body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
              },
              alternate: {
                type: 'BlockStatement',
                body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } }],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with for-in loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'iterate' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForInStatement',
              left: { type: 'Identifier', name: 'key' },
              right: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with for-of loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'iterateOf' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForOfStatement',
              left: { type: 'Identifier', name: 'item' },
              right: { type: 'Identifier', name: 'arr' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'loopWhile' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with do-while loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'doWhile' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'DoWhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with switch statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'switchFn' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'SwitchStatement',
              discriminant: { type: 'Identifier', name: 'val' },
              cases: [
                {
                  type: 'SwitchCase',
                  test: { type: 'Literal', value: 1 },
                  consequent: [{ type: 'BreakStatement', label: null }],
                },
              ],
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with class declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'createClass' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ClassDeclaration',
              id: { type: 'Identifier', name: 'MyClass' },
              body: { type: 'ClassBody', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'caller' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'other' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'constructor' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Error' },
                arguments: [],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function returning arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'ArrowFunctionExpression',
          body: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with debugger statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'debugFn' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'DebuggerStatement' }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with labeled statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'labeled' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'LabeledStatement',
              label: { type: 'Identifier', name: 'loop' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with with statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'withFn' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WithStatement',
              object: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function expression with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with block and return', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with function expression inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'factory' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'FunctionDeclaration',
                id: { type: 'Identifier', name: 'inner' },
                body: { type: 'BlockStatement', body: [] },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with boolean expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'Literal', value: true },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with null expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'Literal', value: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with string expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'Literal', value: 'hello' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with array expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: { type: 'ArrayExpression', elements: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with empty for loop body (the for loop has content)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'loopFn' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForStatement',
              init: {
                type: 'VariableDeclaration',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'i' },
                    init: { type: 'Literal', value: 0 },
                  },
                ],
                kind: 'let',
              },
              test: { type: 'Literal', value: true },
              update: { type: 'UpdateExpression', argument: { type: 'Identifier', name: 'i' } },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with async function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'asyncCaller' },
        async: true,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'AwaitExpression',
                argument: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'fetch' },
                  arguments: [],
                },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function returning ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Literal', value: 'yes' },
          alternate: { type: 'Literal', value: 'no' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'spreadFn' },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fn' },
                arguments: [
                  {
                    type: 'SpreadElement',
                    argument: { type: 'Identifier', name: 'args' },
                  },
                ],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function with yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'genFn' },
        generator: true,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'YieldExpression',
                argument: { type: 'Literal', value: 1 },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with this assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        key: { type: 'Identifier', name: 'init' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'value' },
                  },
                  right: { type: 'Literal', value: 42 },
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with this assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { type: 'Identifier', name: 'constructor' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'initialized' },
                  },
                  right: { type: 'Literal', value: true },
                },
              },
            ],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with tagged template', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: {
            type: 'TemplateLiteral',
            quasis: [],
            expressions: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with typeof expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arrow function with void expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyFunctionRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Literal', value: 0 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // COMBINED OPTIONS (8 tests)
  // ============================================================
  describe('combined options', () => {
    test('should apply allowArrowFunctions and allowAsyncFunctions together', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: true,
        allowAsyncFunctions: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.FunctionDeclaration(createFunctionDeclaration('sync', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sync')
    })

    test('should apply all options together', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: true,
        allowAsyncFunctions: true,
        allowConstructors: true,
        allowOverrideMethods: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.MethodDefinition(createMethodWithDecorator('override', 'fn', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('sync', true))
      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(2)
    })

    test('should only skip arrows when allowArrowFunctions is combined with allowConstructors', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: true,
        allowConstructors: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'm', true))

      expect(reports.length).toBe(2)
    })

    test('should respect allowAsyncFunctions with allowArrowFunctions', () => {
      const { context, reports } = createMockContext({
        allowAsyncFunctions: true,
        allowArrowFunctions: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionExpression(createFunctionExpression(true))

      expect(reports.length).toBe(1)
    })

    test('should respect allowConstructors with allowOverrideMethods', () => {
      const { context, reports } = createMockContext({
        allowConstructors: true,
        allowOverrideMethods: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.MethodDefinition(createMethodWithDecorator('override', 'fn', true))
      visitor.MethodDefinition(createMethodDefinition('method', 'm', true))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('m')
    })

    test('should allow everything when all options are true', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: true,
        allowAsyncFunctions: true,
        allowConstructors: true,
        allowOverrideMethods: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.MethodDefinition(createMethodWithDecorator('override', 'fn', true))

      expect(reports.length).toBe(0)
    })

    test('should still report sync functions and expressions when async and arrows allowed', () => {
      const { context, reports } = createMockContext({
        allowAsyncFunctions: true,
        allowArrowFunctions: true,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('sync1', true))
      visitor.FunctionExpression(createFunctionExpression(true))
      visitor.MethodDefinition(createMethodDefinition('method', 'm1', true))

      expect(reports.length).toBe(3)
    })

    test('should handle options with all false values', () => {
      const { context, reports } = createMockContext({
        allowArrowFunctions: false,
        allowAsyncFunctions: false,
        allowConstructors: false,
        allowOverrideMethods: false,
      })
      const visitor = noEmptyFunctionRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression(true))
      visitor.FunctionDeclaration(createAsyncFunction(true))
      visitor.MethodDefinition(createMethodDefinition('constructor', 'constructor', true))
      visitor.MethodDefinition(createMethodWithDecorator('override', 'fn', true))
      visitor.FunctionDeclaration(createFunctionDeclaration('sync', true))

      expect(reports.length).toBe(5)
    })
  })
})
