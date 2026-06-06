import { describe, test, expect } from 'vitest'
import { noFuncAssignRule } from '../../../../src/rules/patterns/no-func-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createAssignmentExpression(right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name: 'MyFunc',
    },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createAssignmentWithLeft(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createAssignmentWithOperator(
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left: {
      type: 'Identifier',
      name: 'MyFunc',
    },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createArrowFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createCallExpression(calleeName: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: [],
  }
}

function createMemberExpression(object: string, property: string): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: object },
    property: { type: 'Identifier', name: property },
    computed: false,
  }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

function createUpdateExpression(operator: string, argument: unknown, prefix: boolean): unknown {
  return {
    type: 'UpdateExpression',
    operator,
    argument,
    prefix,
  }
}

function createLogicalExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    left,
    operator,
    right,
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

function createTemplateLiteral(quasis: unknown[], expressions: unknown[]): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions,
  }
}

function createTaggedTemplateExpression(tag: unknown, quasi: unknown): unknown {
  return {
    type: 'TaggedTemplateExpression',
    tag,
    quasi,
  }
}

function createNewExpression(calleeName: string): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [],
  }
}

function createSequenceExpression(expressions: unknown[]): unknown {
  return {
    type: 'SequenceExpression',
    expressions,
  }
}

function createAwaitExpression(argument: unknown): unknown {
  return {
    type: 'AwaitExpression',
    argument,
  }
}

function createYieldExpression(argument: unknown, delegate: boolean): unknown {
  return {
    type: 'YieldExpression',
    argument,
    delegate,
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createObjectPattern(properties: unknown[]): unknown {
  return {
    type: 'ObjectPattern',
    properties,
  }
}

function createArrayPattern(elements: unknown[]): unknown {
  return {
    type: 'ArrayPattern',
    elements,
  }
}

function createRestElement(argument: unknown): unknown {
  return {
    type: 'RestElement',
    argument,
  }
}

function createAssignmentPattern(left: unknown, right: unknown): unknown {
  return {
    type: 'AssignmentPattern',
    left,
    right,
  }
}

describe('no-func-assign rule', () => {
  // ============================================================
  // META TESTS (original 8)
  // ============================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noFuncAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFuncAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFuncAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noFuncAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noFuncAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noFuncAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention function in description', () => {
      expect(noFuncAssignRule.meta.docs?.description.toLowerCase()).toContain('function')
    })

    test('should mention reassigning in description', () => {
      expect(noFuncAssignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })
  })

  // ============================================================
  // ADDITIONAL META TESTS
  // ============================================================
  describe('meta - additional', () => {
    test('should have meta property', () => {
      expect(noFuncAssignRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noFuncAssignRule).toHaveProperty('create')
    })

    test('meta type should be a string', () => {
      expect(typeof noFuncAssignRule.meta.type).toBe('string')
    })

    test('meta severity should be a string', () => {
      expect(typeof noFuncAssignRule.meta.severity).toBe('string')
    })

    test('meta docs should be an object', () => {
      expect(typeof noFuncAssignRule.meta.docs).toBe('object')
    })

    test('meta docs description should be a string', () => {
      expect(typeof noFuncAssignRule.meta.docs?.description).toBe('string')
    })

    test('meta docs description should not be empty', () => {
      expect(noFuncAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta docs recommended should be boolean true', () => {
      expect(noFuncAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('meta docs category should be a string', () => {
      expect(typeof noFuncAssignRule.meta.docs?.category).toBe('string')
    })

    test('meta schema should be an array', () => {
      expect(Array.isArray(noFuncAssignRule.meta.schema)).toBe(true)
    })

    test('meta schema should have length 0', () => {
      expect(noFuncAssignRule.meta.schema).toHaveLength(0)
    })

    test('meta type should not be suggestion', () => {
      expect(noFuncAssignRule.meta.type).not.toBe('suggestion')
    })

    test('meta type should not be layout', () => {
      expect(noFuncAssignRule.meta.type).not.toBe('layout')
    })

    test('meta severity should not be off', () => {
      expect(noFuncAssignRule.meta.severity).not.toBe('off')
    })

    test('meta severity should not be warn', () => {
      expect(noFuncAssignRule.meta.severity).not.toBe('warn')
    })

    test('meta should not have deprecated flag', () => {
      expect(noFuncAssignRule.meta.deprecated).toBeUndefined()
    })

    test('meta should not have replacedBy', () => {
      expect(noFuncAssignRule.meta.replacedBy).toBeUndefined()
    })

    test('meta should not have requiresTypeChecking', () => {
      expect(noFuncAssignRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('create should be a function', () => {
      expect(typeof noFuncAssignRule.create).toBe('function')
    })

    test('rule should be frozen/sealed-compatible object', () => {
      expect(Object.keys(noFuncAssignRule)).toContain('meta')
      expect(Object.keys(noFuncAssignRule)).toContain('create')
    })

    test('meta docs should have url', () => {
      expect(noFuncAssignRule.meta.docs?.url).toBeDefined()
    })

    test('description should start with uppercase', () => {
      const desc = noFuncAssignRule.meta.docs?.description ?? ''
      expect(desc[0]).toBe(desc[0].toUpperCase())
    })

    test('description should end with period', () => {
      const desc = noFuncAssignRule.meta.docs?.description ?? ''
      expect(desc.endsWith('.')).toBe(true)
    })
  })

  // ============================================================
  // CREATE / VISITOR TESTS (original 1 + new)
  // ============================================================
  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should only have AssignmentExpression key', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(Object.keys(visitor)).toEqual(['AssignmentExpression'])
    })

    test('AssignmentExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(visitor.AssignmentExpression.length).toBe(1)
    })

    test('create should return a new visitor each time', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor1 = noFuncAssignRule.create(context)
      const visitor2 = noFuncAssignRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('calling AssignmentExpression should not return a value', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const result = visitor.AssignmentExpression(
        createAssignmentExpression(createFunctionExpression()),
      )
      expect(result).toBeUndefined()
    })

    test('calling AssignmentExpression with no args should not throw', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression()).not.toThrow()
    })
  })

  // ============================================================
  // REPORTING FUNCTION ASSIGNMENT VIOLATIONS (original 4 + new)
  // ============================================================
  describe('reporting function assignment violations', () => {
    test('should report assignment with FunctionExpression on right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should report assignment with ArrowFunctionExpression on right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('function')
    })

    test('should report correct location for function assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 10, 5)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report appropriate error message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })

    test('should report for FunctionExpression at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 1, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report for FunctionExpression at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 999, 50)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report for ArrowFunctionExpression at specific location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createArrowFunctionExpression(), 5, 10)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report only once for a single function assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report each call separately with new visitor', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'const foo = function() {};' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'const foo = function() {};' })

      const visitor1 = noFuncAssignRule.create(ctx1)
      const visitor2 = noFuncAssignRule.create(ctx2)

      visitor1.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))
      visitor2.AssignmentExpression(createAssignmentExpression(createArrowFunctionExpression()))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should report multiple calls on same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createArrowFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(3)
    })

    test('should report for function with empty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function with complex body', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'VariableDeclaration', declarations: [], kind: 'const' },
            { type: 'ReturnStatement', argument: createLiteral(42) },
          ],
        },
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with expression body', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'Identifier',
          name: 'x',
        },
      }
      const node = createAssignmentExpression(arrowExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(arrowExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for function with id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'named' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(funcExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for function with parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(funcExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report for FunctionExpression with many parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: Array.from({ length: 10 }, (_, i) => ({
          type: 'Identifier',
          name: `p${i}`,
        })),
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for ArrowFunctionExpression with many parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: Array.from({ length: 5 }, (_, i) => ({
          type: 'Identifier',
          name: `arg${i}`,
        })),
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function with default parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 10 },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with default parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [
          {
            type: 'AssignmentPattern',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Literal', value: 0 },
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function with rest parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with rest parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'rest' } }],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function with destructured parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [
          {
            type: 'ObjectPattern',
            properties: [
              {
                type: 'Property',
                key: { type: 'Identifier', name: 'a' },
                value: { type: 'Identifier', name: 'a' },
              },
            ],
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with destructured parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [
          {
            type: 'ArrayPattern',
            elements: [
              { type: 'Identifier', name: 'a' },
              { type: 'Identifier', name: 'b' },
            ],
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function returning literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Literal', value: 42 },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function returning object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'ObjectExpression', properties: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function returning binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        body: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '+',
          right: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function expression with generator flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'YieldExpression', argument: createLiteral(1), delegate: false }],
        },
        generator: true,
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function expression with async flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for arrow function with async flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })

    test('should report for function expression with both async and generator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'asyncGen' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: true,
        generator: true,
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING NON-FUNCTION ASSIGNMENTS (original 8 + new)
  // ============================================================
  describe('not reporting non-function assignments', () => {
    test('should not report assignment with Identifier on right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('MyVar'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with Literal on right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(42))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with CallExpression on right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createCallExpression('getFunc'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with object literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const objectLiteral = {
        type: 'ObjectExpression',
        properties: [],
      }
      const node = createAssignmentExpression(objectLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with array literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrayLiteral = {
        type: 'ArrayExpression',
        elements: [],
      }
      const node = createAssignmentExpression(arrayLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(null))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(undefined))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(true))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral('hello'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with number zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(0))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with negative number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createUnaryExpression('-', createLiteral(5)))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with boolean false', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(false))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createLiteral(''))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const binary = createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b'))
      const node = createAssignmentExpression(binary)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with LogicalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const logical = createLogicalExpression(createIdentifier('a'), '&&', createIdentifier('b'))
      const node = createAssignmentExpression(logical)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with UnaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const unary = createUnaryExpression('!', createIdentifier('x'))
      const node = createAssignmentExpression(unary)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with UpdateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const update = createUpdateExpression('++', createIdentifier('x'), false)
      const node = createAssignmentExpression(update)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ConditionalExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const conditional = createConditionalExpression(
        createIdentifier('cond'),
        createLiteral(1),
        createLiteral(2),
      )
      const node = createAssignmentExpression(conditional)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const newExpr = createNewExpression('MyClass')
      const node = createAssignmentExpression(newExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with SequenceExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const seq = createSequenceExpression([createLiteral(1), createLiteral(2), createLiteral(3)])
      const node = createAssignmentExpression(seq)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with AwaitExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const awaitExpr = createAwaitExpression(createCallExpression('fetchData'))
      const node = createAssignmentExpression(awaitExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with YieldExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const yieldExpr = createYieldExpression(createLiteral(42), false)
      const node = createAssignmentExpression(yieldExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const template = createTemplateLiteral(
        [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
        [createIdentifier('name')],
      )
      const node = createAssignmentExpression(template)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TaggedTemplateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const tagged = createTaggedTemplateExpression(
        createIdentifier('tag'),
        createTemplateLiteral([], []),
      )
      const node = createAssignmentExpression(tagged)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const member = createMemberExpression('obj', 'prop')
      const node = createAssignmentExpression(member)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with object containing methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const objectLiteral = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'method' },
            value: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          },
        ],
      }
      const node = createAssignmentExpression(objectLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with array containing functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrayLiteral = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
      }
      const node = createAssignmentExpression(arrayLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with FunctionDeclaration (not Expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const functionDeclaration = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'MyFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(functionDeclaration)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with regex literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const regex = {
        type: 'Literal',
        value: /test/g,
        regex: { pattern: 'test', flags: 'g' },
      }
      const node = createAssignmentExpression(regex)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with SpreadElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const spread = createSpreadElement(createIdentifier('arr'))
      const node = createAssignmentExpression(spread)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with ThisExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'ThisExpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with TypeCastExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({
        type: 'TypeCastExpression',
        expression: createIdentifier('x'),
        typeAnnotation: { type: 'TypeAnnotation' },
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with CallExpression returning function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const callReturningFunc = {
        type: 'CallExpression',
        callee: createMemberExpression('factory', 'create'),
        arguments: [createLiteral('param')],
      }
      const node = createAssignmentExpression(callReturningFunc)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with IIFE result', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const iife = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: createLiteral(42) }],
          },
        },
        arguments: [],
      }
      const node = createAssignmentExpression(iife)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with void expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const voidExpr = createUnaryExpression('void', createLiteral(0))
      const node = createAssignmentExpression(voidExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with typeof expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const typeofExpr = createUnaryExpression('typeof', createIdentifier('x'))
      const node = createAssignmentExpression(typeofExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with delete expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const deleteExpr = createUnaryExpression('delete', createMemberExpression('obj', 'prop'))
      const node = createAssignmentExpression(deleteExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (original + new)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle assignment without right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(null)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: null,
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side with undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({})
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration (not Expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const functionDeclaration = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'MyFunc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(functionDeclaration)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not crash with malformed right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'InvalidType' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with expression body', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'Identifier',
          name: 'x',
        },
      }
      const node = createAssignmentExpression(arrowExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(arrowExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function with id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'named' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(funcExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle function with parameters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
        ],
        body: { type: 'BlockStatement', body: [] },
      }
      const node = createAssignmentExpression(funcExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    // New edge cases below

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 42,
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: true,
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with object type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: { name: 'AssignmentExpression' },
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: ['AssignmentExpression'],
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong casing type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'assignmentexpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with FunctionExpression as type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'FunctionExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: createFunctionExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side being a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: 42,
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side being a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: 'function() {}',
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side being a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: true,
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side being an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: [createFunctionExpression()],
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right side being undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: undefined,
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle case-sensitive FunctionExpression type on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'functionexpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle case-sensitive ArrowFunctionExpression type on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'arrowfunctionexpression' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle case-sensitive FUNCTIONEXPRESSION type on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'FUNCTIONEXPRESSION' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where type is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: undefined },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested right side that is not a function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const nestedCall = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [],
          },
          property: createIdentifier('method'),
          computed: false,
        },
        arguments: [],
      }
      const node = createAssignmentExpression(nestedCall)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LEFT-HAND SIDE VARIATIONS
  // ============================================================
  describe('left-hand side variations', () => {
    test('should report with Identifier left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithLeft(createIdentifier('foo'), createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with MemberExpression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithLeft(
        createMemberExpression('obj', 'method'),
        createFunctionExpression(),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with computed MemberExpression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 'key' },
        computed: true,
      }
      const node = createAssignmentWithLeft(computedMember, createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with deeply nested MemberExpression left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const deepMember = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'c' },
        computed: false,
      }
      const node = createAssignmentWithLeft(deepMember, createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ObjectPattern left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const pattern = createObjectPattern([
        { type: 'Property', key: createIdentifier('a'), value: createIdentifier('a') },
      ])
      const node = createAssignmentWithLeft(pattern, createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ArrayPattern left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const pattern = createArrayPattern([createIdentifier('a'), createIdentifier('b')])
      const node = createAssignmentWithLeft(pattern, createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with RestElement left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const rest = createRestElement(createIdentifier('rest'))
      const node = createAssignmentWithLeft(rest, createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with AssignmentPattern left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const pattern = createAssignmentPattern(createIdentifier('x'), createLiteral(0))
      const node = createAssignmentWithLeft(pattern, createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report with non-function right and MemberExpression left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithLeft(
        createMemberExpression('obj', 'prop'),
        createLiteral(42),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with non-function right and ObjectPattern left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const pattern = createObjectPattern([
        { type: 'Property', key: createIdentifier('a'), value: createIdentifier('a') },
      ])
      const node = createAssignmentWithLeft(pattern, createCallExpression('fn'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with non-function right and ArrayPattern left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const pattern = createArrayPattern([createIdentifier('a')])
      const node = createAssignmentWithLeft(pattern, createLiteral('value'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report arrow function with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithLeft(null, createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // OPERATOR VARIATIONS
  // ============================================================
  describe('operator variations', () => {
    test('should report with = operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with += operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('+=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with -= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('-=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with *= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('*=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with /= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('/=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with %= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('%=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with **= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('**=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with <<= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('<<=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with >>= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('>>=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with >>>= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('>>>=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with &= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('&=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ^= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('^=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with |= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('|=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with &&= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('&&=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ||= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('||=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report with ??= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('??=', createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report non-function with += operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('+=', createLiteral(5))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-function with -= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('-=', createIdentifier('x'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report arrow function with += operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('+=', createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arrow function with &&= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentWithOperator('&&=', createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // LOCATION REPORTING
  // ============================================================
  describe('location reporting', () => {
    test('should report end location for function assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 3, 8)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 0, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
        loc: null,
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default location when loc is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
        loc: undefined,
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default when loc.start is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
        loc: {},
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default when loc.start.line is not a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
        loc: {
          start: { line: '1', column: 0 },
          end: { line: '1', column: 10 },
        },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default when loc.start.column is not a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
        loc: {
          start: { line: 5, column: 'abc' },
          end: { line: 5, column: 20 },
        },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should use default when loc.end is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: createFunctionExpression(),
        loc: {
          start: { line: 2, column: 5 },
        },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression(), 100000, 999)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(100000)
      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('should handle location at start of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createArrowFunctionExpression(), 1, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ============================================================
  // MESSAGE QUALITY (original 3 + new)
  // ============================================================
  describe('message quality', () => {
    test('should include function in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('function')
    })

    test('should include reassigning in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('reassign')
    })

    test('should use clear error language', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const node = createAssignmentExpression(createArrowFunctionExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })

    test('should have consistent message for FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })

    test('should have consistent message for ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createArrowFunctionExpression()))

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })

    test('should have consistent message regardless of operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentWithOperator('+=', createFunctionExpression()))

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })

    test('should have consistent message regardless of left side', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentWithLeft(createMemberExpression('obj', 'fn'), createFunctionExpression()),
      )

      expect(reports[0].message).toBe('Reassigning function declaration is not allowed.')
    })

    test('message should not be empty', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should start with uppercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('should not contain undefined in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports[0].message).not.toContain('undefined')
      expect(reports[0].message).not.toContain('null')
    })
  })

  // ============================================================
  // SEQUENTIAL AND REPEATED CALLS
  // ============================================================
  describe('sequential and repeated calls', () => {
    test('should report each function assignment in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createFunctionExpression(), i + 1, 0),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should report each arrow function assignment in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createArrowFunctionExpression(), i + 1, 0),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should mix reported and non-reported assignments correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createLiteral(42)))
      visitor.AssignmentExpression(createAssignmentExpression(createArrowFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createCallExpression('fn')))
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(3)
    })

    test('should handle rapid alternation between function and non-function', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const rights = [
        createFunctionExpression(),
        createLiteral(1),
        createArrowFunctionExpression(),
        createIdentifier('x'),
        createFunctionExpression(),
        createCallExpression('fn'),
        createArrowFunctionExpression(),
        createLiteral('str'),
        createFunctionExpression(),
        createMemberExpression('a', 'b'),
      ]

      for (const right of rights) {
        visitor.AssignmentExpression(createAssignmentExpression(right))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle 100 consecutive function assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))
      }

      expect(reports.length).toBe(100)
    })

    test('should handle 100 consecutive non-function assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.AssignmentExpression(createAssignmentExpression(createLiteral(i)))
      }

      expect(reports.length).toBe(0)
    })

    test('should accumulate reports correctly after mixed calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      // 3 function assignments
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createArrowFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      // 2 non-function assignments
      visitor.AssignmentExpression(createAssignmentExpression(createLiteral(1)))
      visitor.AssignmentExpression(createAssignmentExpression(createLiteral(2)))

      // 2 more function assignments
      visitor.AssignmentExpression(createAssignmentExpression(createArrowFunctionExpression()))
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(5)
    })
  })

  // ============================================================
  // EXACT TYPE MATCHING
  // ============================================================
  describe('exact type matching', () => {
    test('should only match FunctionExpression exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const nearTypes = [
        'FunctionExpressions',
        'functionexpression',
        'FUNCTIONEXPRESSION',
        'Function_Expression',
        'FunctionExpressio',
        'unctionExpression',
      ]

      for (const t of nearTypes) {
        const node = createAssignmentExpression({ type: t })
        visitor.AssignmentExpression(node)
      }

      expect(reports.length).toBe(0)
    })

    test('should only match ArrowFunctionExpression exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const nearTypes = [
        'ArrowFunctionExpressions',
        'arrowfunctionexpression',
        'ARROWFUNCTIONEXPRESSION',
        'Arrow_FunctionExpression',
        'ArrowFunctionExpressio',
        'rrowFunctionExpression',
      ]

      for (const t of nearTypes) {
        const node = createAssignmentExpression({ type: t })
        visitor.AssignmentExpression(node)
      }

      expect(reports.length).toBe(0)
    })

    test('should not match ClassExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const classExpr = {
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(classExpr))

      expect(reports.length).toBe(0)
    })

    test('should not match ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const classDecl = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }
      visitor.AssignmentExpression(createAssignmentExpression(classDecl))

      expect(reports.length).toBe(0)
    })

    test('should not match MethodDefinition', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const method = {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'method' },
        value: createFunctionExpression(),
        kind: 'method',
        computed: false,
        static: false,
      }
      visitor.AssignmentExpression(createAssignmentExpression(method))

      expect(reports.length).toBe(0)
    })

    test('should not match Property with function value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const prop = {
        type: 'Property',
        key: { type: 'Identifier', name: 'fn' },
        value: createFunctionExpression(),
        kind: 'init',
        computed: false,
        method: false,
        shorthand: false,
      }
      visitor.AssignmentExpression(createAssignmentExpression(prop))

      expect(reports.length).toBe(0)
    })

    test('should match FunctionExpression with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const funcExpr = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        generator: false,
        async: false,
        expression: false,
        extra: 'data',
      }
      visitor.AssignmentExpression(createAssignmentExpression(funcExpr))

      expect(reports.length).toBe(1)
    })

    test('should match ArrowFunctionExpression with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const visitor = noFuncAssignRule.create(context)

      const arrowExpr = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        expression: false,
        extra: 'data',
      }
      visitor.AssignmentExpression(createAssignmentExpression(arrowExpr))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // CONTEXT INDEPENDENCE
  // ============================================================
  describe('context independence', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const ctx: RuleContext = {
        ...context,
        getFilePath: () => '/different/path.ts',
      } as unknown as RuleContext

      const visitor = noFuncAssignRule.create(ctx)
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const ctx: RuleContext = {
        ...context,
        getSource: () => 'let x = () => {};',
      } as unknown as RuleContext

      const visitor = noFuncAssignRule.create(ctx)
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const ctx: RuleContext = {
        ...context,
        getSource: () => '',
      } as unknown as RuleContext

      const visitor = noFuncAssignRule.create(ctx)
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const ctx: RuleContext = {
        ...context,
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noFuncAssignRule.create(ctx)
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })

    test('should work with different config', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = function() {};' })
      const ctx: RuleContext = {
        ...context,
        config: { options: { someOption: true } },
      } as unknown as RuleContext

      const visitor = noFuncAssignRule.create(ctx)
      visitor.AssignmentExpression(createAssignmentExpression(createFunctionExpression()))

      expect(reports.length).toBe(1)
    })
  })
})
