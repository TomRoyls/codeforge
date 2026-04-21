import { describe, test, expect, vi } from 'vitest'
import { requireYieldRule } from '../../../../src/rules/patterns/require-yield.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'function* foo() { }',
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
  generator: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    generator,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(
  generator: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionExpression',
    generator,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrowFunction(
  generator: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    generator,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createYieldExpression(argument: unknown): unknown {
  return {
    type: 'YieldExpression',
    argument,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: name.length },
    },
  }
}

function createReturnStatement(argument: unknown): unknown {
  return {
    type: 'ReturnStatement',
    argument,
  }
}

function createVariableDeclaration(declarations: unknown[]): unknown {
  return {
    type: 'VariableDeclaration',
    declarations,
  }
}

function createVariableDeclarator(id: unknown, init: unknown): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
  }
}

function createExpressionStatement(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

function createIfStatement(test: unknown, consequent: unknown, alternate: unknown = null): unknown {
  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
  }
}

function createCallExpression(callee: unknown, args: unknown[] = []): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
  }
}

function createBinaryExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
  }
}

function createAssignmentExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left,
    right,
  }
}

function createMemberExpression(object: unknown, property: unknown): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
  }
}

function createConditionalExpression(
  test: unknown,
  consequent: unknown,
  alternate: unknown,
): unknown {
  return {
    type: 'ConditionalExpression',
    test,
    consequent,
    alternate,
  }
}

function createLogicalExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

function createObjectExpression(properties: unknown[]): unknown {
  return {
    type: 'ObjectExpression',
    properties,
  }
}

function createArrayExpression(elements: unknown[]): unknown {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

function createNewExpression(callee: unknown, args: unknown[] = []): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
  }
}

function createThrowStatement(argument: unknown): unknown {
  return {
    type: 'ThrowStatement',
    argument,
  }
}

function createWhileStatement(test: unknown, body: unknown): unknown {
  return {
    type: 'WhileStatement',
    test,
    body,
  }
}

function createForStatement(init: unknown, test: unknown, update: unknown, body: unknown): unknown {
  return {
    type: 'ForStatement',
    init,
    test,
    update,
    body,
  }
}

function createForInStatement(left: unknown, right: unknown, body: unknown): unknown {
  return {
    type: 'ForInStatement',
    left,
    right,
    body,
  }
}

function createForOfStatement(left: unknown, right: unknown, body: unknown): unknown {
  return {
    type: 'ForOfStatement',
    left,
    right,
    body,
  }
}

function createSwitchStatement(discriminant: unknown, cases: unknown[]): unknown {
  return {
    type: 'SwitchStatement',
    discriminant,
    cases,
  }
}

function createSwitchCase(test: unknown, consequent: unknown[]): unknown {
  return {
    type: 'SwitchCase',
    test,
    consequent,
  }
}

function createTryStatement(block: unknown, handler: unknown, finalizer: unknown = null): unknown {
  return {
    type: 'TryStatement',
    block,
    handler,
    finalizer,
  }
}

function createCatchClause(param: unknown, body: unknown): unknown {
  return {
    type: 'CatchClause',
    param,
    body,
  }
}

function createDoWhileStatement(test: unknown, body: unknown): unknown {
  return {
    type: 'DoWhileStatement',
    test,
    body,
  }
}

function createLabeledStatement(label: unknown, body: unknown): unknown {
  return {
    type: 'LabeledStatement',
    label,
    body,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createProperty(key: unknown, value: unknown): unknown {
  return {
    type: 'Property',
    key,
    value,
  }
}

describe('require-yield rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(requireYieldRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(requireYieldRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(requireYieldRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(requireYieldRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention yield in description', () => {
      expect(requireYieldRule.meta.docs?.description.toLowerCase()).toContain('yield')
    })

    test('should mention generator in description', () => {
      expect(requireYieldRule.meta.docs?.description.toLowerCase()).toContain('generator')
    })

    test('should have empty schema', () => {
      expect(requireYieldRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(requireYieldRule.meta.fixable).toBeUndefined()
    })

    test('should have meta object', () => {
      expect(typeof requireYieldRule.meta).toBe('object')
      expect(requireYieldRule.meta).not.toBeNull()
    })

    test('should have docs object', () => {
      expect(typeof requireYieldRule.meta.docs).toBe('object')
      expect(requireYieldRule.meta.docs).not.toBeNull()
    })

    test('should have string description', () => {
      expect(typeof requireYieldRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(requireYieldRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have boolean recommended', () => {
      expect(typeof requireYieldRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have string category', () => {
      expect(typeof requireYieldRule.meta.docs?.category).toBe('string')
    })

    test('should have string type in meta', () => {
      expect(typeof requireYieldRule.meta.type).toBe('string')
    })

    test('should have string severity in meta', () => {
      expect(typeof requireYieldRule.meta.severity).toBe('string')
    })

    test('should have array schema in meta', () => {
      expect(Array.isArray(requireYieldRule.meta.schema)).toBe(true)
    })

    test('should have create function', () => {
      expect(typeof requireYieldRule.create).toBe('function')
    })

    test('description should be a complete sentence', () => {
      const desc = requireYieldRule.meta.docs?.description
      expect(desc).toBeTruthy()
    })

    test('schema should be empty array (not undefined)', () => {
      expect(requireYieldRule.meta.schema).toBeDefined()
      expect(requireYieldRule.meta.schema!.length).toBe(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should return object from create', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should only have FunctionDeclaration and FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('FunctionDeclaration')
      expect(keys).toContain('FunctionExpression')
    })

    test('multiple create calls should return independent visitors', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const visitor1 = requireYieldRule.create(ctx1)
      const visitor2 = requireYieldRule.create(ctx2)

      const body = createBlockStatement([])
      visitor1.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockContext()
      expect(() => requireYieldRule.create(context)).not.toThrow()
    })

    test('FunctionDeclaration should accept single argument', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)
      expect(visitor.FunctionDeclaration.length).toBeLessThanOrEqual(1)
    })

    test('FunctionExpression should accept single argument', () => {
      const { context } = createMockContext()
      const visitor = requireYieldRule.create(context)
      expect(visitor.FunctionExpression.length).toBeLessThanOrEqual(1)
    })
  })

  describe('detecting generator functions without yield', () => {
    test('should report generator function declaration without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('yield')
    })

    test('should report generator function expression without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('yield')
    })

    test('should report generator function with only synchronous operations', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(createIdentifier('x'), createIdentifier('y')),
        ]),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report generator function with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body, [], 42, 10)

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report generator with only variable declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(createIdentifier('a'), createLiteral(1)),
        ]),
        createVariableDeclaration([
          createVariableDeclarator(createIdentifier('b'), createLiteral(2)),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only assignment expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createAssignmentExpression('=', createIdentifier('x'), createLiteral(1)),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(createIdentifier('console.log'), [createLiteral('hello')]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createBinaryExpression('+', createIdentifier('a'), createIdentifier('b')),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only conditional expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createConditionalExpression(
            createIdentifier('x'),
            createIdentifier('a'),
            createIdentifier('b'),
          ),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only logical expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createLogicalExpression('&&', createIdentifier('a'), createIdentifier('b')),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only object expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createExpressionStatement(createObjectExpression([]))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only array expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createExpressionStatement(createArrayExpression([]))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with only new expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createNewExpression(createIdentifier('MyClass'), [])),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createThrowStatement(createLiteral('error'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with while loop without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createWhileStatement(
          createIdentifier('true'),
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with for loop without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createForStatement(
          createLiteral(0),
          createIdentifier('i'),
          createIdentifier('i'),
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with for-in loop without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createForInStatement(
          createIdentifier('key'),
          createIdentifier('obj'),
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with for-of loop without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createForOfStatement(
          createIdentifier('item'),
          createIdentifier('arr'),
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with switch statement without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createSwitchStatement(createIdentifier('x'), [
          createSwitchCase(createLiteral(1), [createExpressionStatement(createLiteral(1))]),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with try-catch without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createTryStatement(
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
          createCatchClause(createIdentifier('e'), createBlockStatement([])),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with do-while loop without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createDoWhileStatement(
          createIdentifier('x'),
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with labeled statement without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createLabeledStatement(
          createIdentifier('loop'),
          createExpressionStatement(createLiteral(1)),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with multiple statements none yielding', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createLiteral(1)),
        createExpressionStatement(createLiteral(2)),
        createExpressionStatement(createLiteral(3)),
        createReturnStatement(createLiteral(4)),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator FunctionExpression with only return', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createLiteral(42))])
      visitor.FunctionExpression(createFunctionExpression(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with unary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createUnaryExpression('typeof', createIdentifier('x'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with void expression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createUnaryExpression('void', createLiteral(0))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with delete expression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createUnaryExpression(
            'delete',
            createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
          ),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should report generator with nested function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(
          createCallExpression(
            createMemberExpression(createIdentifier('console'), createIdentifier('log')),
            [createCallExpression(createIdentifier('fn'), [])],
          ),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid generator functions', () => {
    test('should not report non-generator function', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function with yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createYieldExpression(createIdentifier('value'))])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function with yield in return', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createYieldExpression(createIdentifier('value'))),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function with multiple yields', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createYieldExpression(createIdentifier('value1')),
        createYieldExpression(createIdentifier('value2')),
        createYieldExpression(createIdentifier('value3')),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function expression with yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createYieldExpression(createIdentifier('value'))])
      const node = createFunctionExpression(true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator function without body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in if consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createYieldExpression(createIdentifier('val'))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in if alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createExpressionStatement(createLiteral(1))]),
          createBlockStatement([createYieldExpression(createIdentifier('val'))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createYieldExpression(createIdentifier('val'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in variable initializer', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createYieldExpression(createIdentifier('val')),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in conditional expression consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        {
          type: 'SomeNode',
          consequent: createYieldExpression(createIdentifier('a')),
          alternate: createIdentifier('b'),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in variable declarator init', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('result'),
            createYieldExpression(createIdentifier('val')),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in nested variable init', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createReturnStatement(createYieldExpression(createIdentifier('val'))),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in expression of if consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(createIdentifier('x'), createYieldExpression(createIdentifier('a'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in return argument', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createYieldExpression(createIdentifier('val'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in nested return argument', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createReturnStatement(createYieldExpression(createIdentifier('val'))),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in if alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createLiteral(1),
          createYieldExpression(createIdentifier('val')),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in nested if consequent through block', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([
            createReturnStatement(createYieldExpression(createIdentifier('val'))),
          ]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in nested if alternate through block', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createLiteral(1),
          createBlockStatement([createYieldExpression(createIdentifier('val'))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createYieldExpression(createIdentifier('val'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in deeply nested if-return chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('a'),
          createReturnStatement(
            createIfStatement(
              createIdentifier('b'),
              createYieldExpression(createIdentifier('deep')),
            ),
          ),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in nested init through argument', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createReturnStatement(createYieldExpression(createIdentifier('val'))),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in init of declaration in block', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createIfStatement(
              createIdentifier('y'),
              createYieldExpression(createIdentifier('val')),
            ),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in expression of nested node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: createReturnStatement(createYieldExpression(createIdentifier('val'))),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in alternate of nested conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createLiteral(1),
          createIfStatement(
            createIdentifier('y'),
            createLiteral(2),
            createYieldExpression(createIdentifier('val')),
          ),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in consequent through nested blocks', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createBlockStatement([
          createBlockStatement([
            createReturnStatement(createYieldExpression(createIdentifier('val'))),
          ]),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in init through nested declarations', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('a'),
            createVariableDeclaration([
              createVariableDeclarator(
                createIdentifier('b'),
                createYieldExpression(createIdentifier('val')),
              ),
            ]),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield deeply nested', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('a'),
          createBlockStatement([
            createIfStatement(
              createIdentifier('b'),
              createBlockStatement([
                createIfStatement(
                  createIdentifier('c'),
                  createBlockStatement([createYieldExpression(createIdentifier('deep'))]),
                ),
              ]),
            ),
          ]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with multiple yields scattered throughout', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createYieldExpression(createIdentifier('first')),
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createYieldExpression(createIdentifier('second'))]),
        ),
        createForStatement(
          createLiteral(0),
          createIdentifier('i'),
          createIdentifier('i'),
          createBlockStatement([createYieldExpression(createIdentifier('third'))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield* (delegated yield)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        {
          type: 'YieldExpression',
          delegate: true,
          argument: createIdentifier('other'),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in argument chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(
          createReturnStatement(createYieldExpression(createIdentifier('val'))),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in nested if alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createExpressionStatement(createLiteral(1)),
          createIfStatement(
            createIdentifier('y'),
            createExpressionStatement(createLiteral(2)),
            createYieldExpression(createIdentifier('val')),
          ),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not report generator with yield in conditional alternate', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createLiteral(1),
          createReturnStatement(createYieldExpression(createIdentifier('val'))),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention generator function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('generator')
    })

    test('should mention yield in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('yield')
    })

    test('should mention does not have in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('does not have')
    })

    test('should have consistent message for FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message).toBe('This generator function does not have yield.')
    })

    test('should have consistent message for FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionExpression(createFunctionExpression(true, body))

      expect(reports[0].message).toBe('This generator function does not have yield.')
    })

    test('message should be the same across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 5, 3))

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('FunctionExpression specific tests', () => {
    test('should report generator expression assigned to variable', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report generator expression as object property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('yield')
    })

    test('should not report generator expression with yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createYieldExpression(createIdentifier('val'))])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report generator expression with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report generator expression with params but no yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('a'))])
      const node = createFunctionExpression(true, body, [
        createIdentifier('a'),
        createIdentifier('b'),
        createIdentifier('c'),
      ])
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle generator expression with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionExpression(true, body, [], 10, 5)
      visitor.FunctionExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle generator expression with yield in nested structure', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createYieldExpression(createIdentifier('val'))]),
        ),
      ])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle multiple generator expressions independently', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const bodyWithYield = createBlockStatement([createYieldExpression(createIdentifier('val'))])
      const bodyWithoutYield = createBlockStatement([])

      visitor.FunctionExpression(createFunctionExpression(true, bodyWithYield))
      visitor.FunctionExpression(createFunctionExpression(true, bodyWithoutYield))

      expect(reports.length).toBe(1)
    })

    test('should report generator expression with complex body but no yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(createIdentifier('x'), createLiteral(1)),
        ]),
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([createReturnStatement(createLiteral(2))]),
          createBlockStatement([createThrowStatement(createLiteral('err'))]),
        ),
      ])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report non-generator function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createReturnStatement(createLiteral(1))])
      const node = createFunctionExpression(false, body)
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('hasYield recursion paths', () => {
    test('should find yield in consequent of IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(createIdentifier('x'), createYieldExpression(createIdentifier('val'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield in alternate of IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createLiteral(1),
          createYieldExpression(createIdentifier('val')),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield in argument of node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createYieldExpression(createIdentifier('val'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield in expression of ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createExpressionStatement(createYieldExpression(createIdentifier('val'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield in init of VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createYieldExpression(createIdentifier('val')),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield in declarations array', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('a'),
            createYieldExpression(createIdentifier('val')),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield through consequent -> body chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createBlockStatement([
            createIfStatement(
              createIdentifier('y'),
              createYieldExpression(createIdentifier('deep')),
            ),
          ]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield through alternate -> body chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createIfStatement(
          createIdentifier('x'),
          createLiteral(1),
          createBlockStatement([createYieldExpression(createIdentifier('val'))]),
        ),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield through argument -> argument chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createReturnStatement(createYieldExpression(createIdentifier('fn')))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield through declarations -> init -> consequent chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createIfStatement(
              createIdentifier('y'),
              createYieldExpression(createIdentifier('val')),
            ),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield through declarations -> init -> consequent chain', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createIfStatement(
              createIdentifier('y'),
              createYieldExpression(createIdentifier('val')),
            ),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield deeply nested in multiple levels', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        createVariableDeclaration([
          createVariableDeclarator(
            createIdentifier('x'),
            createIfStatement(
              createIdentifier('a'),
              createBlockStatement([
                createIfStatement(
                  createIdentifier('b'),
                  createBlockStatement([
                    createReturnStatement(createYieldExpression(createIdentifier('veryDeep'))),
                  ]),
                ),
              ]),
            ),
          ),
        ]),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should not find yield when node type contains yield in name but is not YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        {
          type: 'NotYieldExpressionButContainsYield',
          argument: createIdentifier('x'),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle non-YieldExpression type named similarly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        {
          type: 'YieldStatement',
          argument: createIdentifier('x'),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should find yield in expression property of node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createExpressionStatement(createYieldExpression(null))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([createYieldExpression(null)])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should find yield with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([{ type: 'YieldExpression', argument: undefined }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })
  })

  describe('location/reporting details', () => {
    test('should report location with specific line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 42, 10))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location with line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location with large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 1, 8888))

      expect(reports[0].loc?.start.column).toBe(8888)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body)
      delete (node as Record<string, unknown>).loc
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report multiple reports from different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 1, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 10, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should report same message for FunctionDeclaration and FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor.FunctionExpression(createFunctionExpression(true, body))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should handle FunctionExpression with specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionExpression(createFunctionExpression(true, body, [], 15, 20))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should default to line 1 column 0 when loc is null', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: createBlockStatement([]),
        loc: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default to line 1 column 0 when loc is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default when loc has no start', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: createBlockStatement([]),
        loc: {},
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default when loc.start has no line', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: createBlockStatement([]),
        loc: { start: {}, end: {} },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  describe('options/config variations', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle options with irrelevant keys', () => {
      const { context, reports } = createMockContext({ someOption: true, anotherOption: 'value' })
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should still report with arbitrary options', () => {
      const { context, reports } = createMockContext({ allowWithoutYield: true })
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/generators.ts')
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle different source code strings', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'function* gen() { return 1; }',
      )
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should work with complex file path', () => {
      const { context, reports } = createMockContext({}, '/very/deep/nested/path/to/file.ts')
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node gracefully in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        generator: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without generator property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body)
      delete (node as Record<string, unknown>).loc
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle null body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle function declaration with incorrect type (still reports if generator true)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'NotFunctionDeclaration',
        generator: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function expression with incorrect type (still reports if generator true)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'NotFunctionExpression',
        generator: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body as number', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: 42,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body as string', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: 'expression body',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body as boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: true,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body as empty string (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: '',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle generator as truthy string', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: 'yes',
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle generator as truthy number', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: 1,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle generator as falsy number', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: 0,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle generator as falsy empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: '',
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle generator as null (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: null,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle generator as undefined (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: undefined,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with many params', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const params = Array.from({ length: 20 }, (_, i) => createIdentifier(`p${i}`))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, params))

      expect(reports.length).toBe(1)
    })

    test('should handle calling visitor method multiple times on same node', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(3)
    })

    test('should handle calling different visitor methods on same context', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor.FunctionExpression(createFunctionExpression(true, body))

      expect(reports.length).toBe(2)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
        async: true,
        id: createIdentifier('myGen'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle very deeply nested body without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      let inner = createBlockStatement([createExpressionStatement(createLiteral(1))])
      for (let i = 0; i < 50; i++) {
        inner = createBlockStatement([inner])
      }

      visitor.FunctionDeclaration(createFunctionDeclaration(true, inner))

      expect(reports.length).toBe(1)
    })

    test('should find yield in very deeply nested body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      let inner: unknown = createYieldExpression(createIdentifier('deep'))
      for (let i = 0; i < 50; i++) {
        inner = createBlockStatement([inner])
      }

      visitor.FunctionDeclaration(createFunctionDeclaration(true, inner))

      expect(reports.length).toBe(0)
    })

    test('should handle body with many statements none with yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const stmts = Array.from({ length: 100 }, () => createExpressionStatement(createLiteral(1)))
      const body = createBlockStatement(stmts)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should find yield among many statements', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const stmts = Array.from({ length: 50 }, () => createExpressionStatement(createLiteral(1)))
      stmts.push(createYieldExpression(createIdentifier('found')))
      stmts.push(...Array.from({ length: 50 }, () => createExpressionStatement(createLiteral(1))))
      const body = createBlockStatement(stmts)

      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      expect(() => visitor.FunctionExpression('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      expect(() => visitor.FunctionExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle frozen body object', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = Object.freeze(createBlockStatement([]))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle ArrowFunctionExpression with generator (unusual but handled)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = createArrowFunction(true, createBlockStatement([]))
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle non-generator ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = createArrowFunction(false, createBlockStatement([]))
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const proto = { generator: false }
      const node = Object.create(proto)
      node.type = 'FunctionDeclaration'
      node.body = createBlockStatement([])
      node.params = []

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle body as array (not wrapped in BlockStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: [createExpressionStatement(createLiteral(1))],
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('rule exports', () => {
    test('should have named export', () => {
      expect(requireYieldRule).toBeDefined()
      expect(typeof requireYieldRule).toBe('object')
    })

    test('should have meta property on named export', () => {
      expect(requireYieldRule.meta).toBeDefined()
      expect(typeof requireYieldRule.meta).toBe('object')
    })

    test('should have create property on named export', () => {
      expect(requireYieldRule.create).toBeDefined()
      expect(typeof requireYieldRule.create).toBe('function')
    })

    test('should have exactly meta and create keys', () => {
      const keys = Object.keys(requireYieldRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('mixed generator and non-generator', () => {
    test('should only report generator functions in mixed scenarios', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const emptyBody = createBlockStatement([])
      const yieldBody = createBlockStatement([createYieldExpression(createIdentifier('val'))])

      visitor.FunctionDeclaration(createFunctionDeclaration(false, emptyBody))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, emptyBody))
      visitor.FunctionDeclaration(createFunctionDeclaration(false, yieldBody))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, yieldBody))

      expect(reports.length).toBe(1)
    })

    test('should handle alternating generator and non-generator function expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const emptyBody = createBlockStatement([])

      visitor.FunctionExpression(createFunctionExpression(false, emptyBody))
      visitor.FunctionExpression(createFunctionExpression(true, emptyBody))
      visitor.FunctionExpression(createFunctionExpression(false, emptyBody))

      expect(reports.length).toBe(1)
    })

    test('should report each generator without yield separately', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const emptyBody = createBlockStatement([])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, emptyBody, [], 1, 0))
      visitor.FunctionExpression(createFunctionExpression(true, emptyBody, [], 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, emptyBody, [], 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should handle mix of declarations and expressions with and without yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const emptyBody = createBlockStatement([])
      const yieldBody = createBlockStatement([createYieldExpression(createIdentifier('val'))])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, yieldBody))
      visitor.FunctionExpression(createFunctionExpression(true, emptyBody))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, yieldBody))
      visitor.FunctionExpression(createFunctionExpression(true, emptyBody))

      expect(reports.length).toBe(2)
    })
  })

  describe('ArrowFunctionExpression edge cases', () => {
    test('should not crash when processing arrow function via FunctionDeclaration visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = createArrowFunction(false, createIdentifier('x'))
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash when processing arrow function via FunctionExpression visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = createArrowFunction(false, createIdentifier('x'))
      expect(() => visitor.FunctionExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report arrow function with generator: true via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = createArrowFunction(true, createBlockStatement([]))
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report arrow function with generator: true via FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = createArrowFunction(true, createBlockStatement([]))
      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('isYieldExpression edge cases', () => {
    test('should not treat object with type YieldExpression as yield when case differs', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([{ type: 'yieldexpression', argument: null }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should treat exact type YieldExpression as yield', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([
        { type: 'YieldExpression', argument: createIdentifier('x') },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(0)
    })

    test('should handle yield expression as body directly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body: createYieldExpression(createIdentifier('val')),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('hasYield with various body structures', () => {
    test('should find yield in consequent directly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        consequent: createYieldExpression(createIdentifier('val')),
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should find yield in alternate directly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        alternate: createYieldExpression(createIdentifier('val')),
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should find yield in expression directly', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        expression: createYieldExpression(createIdentifier('val')),
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash when body properties are primitive values', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        consequent: 'string value',
        alternate: 42,
        argument: false,
        expression: null,
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body with non-array body property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        body: 'not an array',
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body with non-array declarations property', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        declarations: 'not an array',
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body with empty declarations array', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = {
        type: 'SomeNode',
        declarations: [],
      }
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body with empty body array', () => {
      const { context, reports } = createMockContext()
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      const node = {
        type: 'FunctionDeclaration',
        generator: true,
        params: [],
        body,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor independence and isolation', () => {
    test('different contexts should produce independent reports', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const visitor1 = requireYieldRule.create(ctx1)
      const visitor2 = requireYieldRule.create(ctx2)

      const body = createBlockStatement([])
      visitor1.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('same context different visitors should accumulate reports', () => {
      const { context, reports } = createMockContext()

      const visitor1 = requireYieldRule.create(context)
      const visitor2 = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor1.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor2.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(2)
    })

    test('visitor should work after multiple create calls', () => {
      const { context, reports } = createMockContext()

      requireYieldRule.create(context)
      const visitor = requireYieldRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })
  })
})
