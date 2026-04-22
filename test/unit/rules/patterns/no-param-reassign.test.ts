import { describe, test, expect, vi } from 'vitest'
import { noParamReassignRule } from '../../../../src/rules/patterns/no-param-reassign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createFunctionDeclaration(params: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(params: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrowFunctionExpression(params: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-param-reassign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noParamReassignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noParamReassignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noParamReassignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noParamReassignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noParamReassignRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noParamReassignRule.meta.fixable).toBeUndefined()
    })

    test('should mention parameter in description', () => {
      expect(noParamReassignRule.meta.docs?.description.toLowerCase()).toContain('parameter')
    })

    test('should mention reassignment in description', () => {
      expect(noParamReassignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })

    test('should have docs property', () => {
      expect(noParamReassignRule.meta.docs).toBeDefined()
      expect(typeof noParamReassignRule.meta.docs).toBe('object')
    })

    test('should have docs description as string', () => {
      expect(typeof noParamReassignRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noParamReassignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url', () => {
      expect(noParamReassignRule.meta.docs?.url).toBeDefined()
      expect(typeof noParamReassignRule.meta.docs?.url).toBe('string')
    })

    test('should have url starting with https', () => {
      expect(noParamReassignRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noParamReassignRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noParamReassignRule.meta.schema).toHaveLength(0)
    })

    test('should have docs category as string', () => {
      expect(typeof noParamReassignRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as boolean', () => {
      expect(typeof noParamReassignRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have type as one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noParamReassignRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      expect(['error', 'warn', 'info', 'off']).toContain(noParamReassignRule.meta.severity)
    })

    test('should mention modified in description', () => {
      expect(noParamReassignRule.meta.docs?.description.toLowerCase()).toContain('modif')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should have FunctionDeclaration as function', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should have FunctionExpression as function', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should have ArrowFunctionExpression as function', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should have AssignmentExpression as function', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return exactly 4 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(4)
    })

    test('should create independent visitors per call', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const { context: ctx2 } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor1 = noParamReassignRule.create(ctx1)
      const visitor2 = noParamReassignRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should return non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)
      expect(visitor).not.toBeNull()
      expect(visitor).not.toBeUndefined()
    })
  })

  describe('parameter tracking in FunctionDeclaration', () => {
    test('should track parameters in function declaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([createIdentifier('x')])

      visitor.FunctionDeclaration(funcDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple parameters', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([
        createIdentifier('x'),
        createIdentifier('y'),
        createIdentifier('z'),
      ])

      visitor.FunctionDeclaration(funcDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('parameter tracking in FunctionExpression', () => {
    test('should track parameters in function expression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcExpr = createFunctionExpression([createIdentifier('x')])

      visitor.FunctionExpression(funcExpr)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple parameters in function expression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcExpr = createFunctionExpression([createIdentifier('a'), createIdentifier('b')])

      visitor.FunctionExpression(funcExpr)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('parameter tracking in ArrowFunctionExpression', () => {
    test('should track parameters in arrow function', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const arrowFunc = createArrowFunctionExpression([createIdentifier('x')])

      visitor.ArrowFunctionExpression(arrowFunc)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple parameters in arrow function', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const arrowFunc = createArrowFunctionExpression([
        createIdentifier('a'),
        createIdentifier('b'),
      ])

      visitor.ArrowFunctionExpression(arrowFunc)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('reporting direct parameter reassignment', () => {
    test('should report assignment to parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message).toContain('parameter')
    })

    test('should report with correct message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('myParam')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myParam'), { type: 'Literal', value: 42 }),
      )

      expect(reports[0].message).toBe("Reassignment of function parameter 'myParam'.")
    })

    test('should not report assignment to non-parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should report multiple parameter reassignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('x'), createIdentifier('y')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(2)
    })

    test('should report assignment to parameter with underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('my_param')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_param'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_param')
    })

    test('should report assignment to parameter with dollar signs', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('$param')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$param'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$param')
    })
  })

  describe('reporting parameter property mutation', () => {
    test('should report parameter property assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
      expect(reports[0].message).toContain('parameter')
    })

    test('should report multiple property mutations on same parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop1')),
          { type: 'Literal', value: 1 },
        ),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop2')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report property mutation on non-parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('y'), createIdentifier('prop')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('compound assignments', () => {
    test('should not report += assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report -= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '-=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report *= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '*=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report /= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '/=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('detection across function types', () => {
    test('should detect reassignment in arrow function parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('p')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('p'), { type: 'Literal', value: 10 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('p')
    })

    test('should detect reassignment in function expression parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionExpression(createFunctionExpression([createIdentifier('val')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('val'), { type: 'Literal', value: 0 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('val')
    })

    test('should detect property mutation in arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('config')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('config'), createIdentifier('name')),
          { type: 'Literal', value: 'new' },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('config')
    })

    test('should detect property mutation in function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionExpression(createFunctionExpression([createIdentifier('state')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('state'), createIdentifier('count')),
          { type: 'Literal', value: 5 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('state')
    })

    test('should detect with single letter parameter', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('a')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })

    test('should detect with long parameter name', () => {
      const longName = 'veryLongParameterNameThatExceedsNormalLength'
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier(longName)]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(longName), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should detect when multiple function types register same param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect each param in multi-param function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createIdentifier('a'),
          createIdentifier('b'),
          createIdentifier('c'),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should detect last param in multi-param function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createIdentifier('a'),
          createIdentifier('b'),
          createIdentifier('c'),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('c')
    })

    test('should detect reassignment of all params sequentially', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('a'), createIdentifier('b')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(3)
    })

    test('should detect property mutation via MemberExpression with computed false', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('arr')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('arr'), createIdentifier('length')),
          { type: 'Literal', value: 0 },
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect param with double dollar signs', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('$$')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$$'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect param with trailing underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('rest_')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('rest_'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect param with leading underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('_unused')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_unused'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect reassignment with object right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), {
          type: 'ObjectExpression',
          properties: [],
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect reassignment with function call right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'CallExpression' }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect reassignment with Identifier right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect property mutation on second param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('a'), createIdentifier('b')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('b'), createIdentifier('val')),
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should detect in function with five params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createIdentifier('a'),
          createIdentifier('b'),
          createIdentifier('c'),
          createIdentifier('d'),
          createIdentifier('e'),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('d'), { type: 'Literal', value: 4 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('d')
    })

    test('should detect reassignment after all three function types visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('fd')]))
      visitor.FunctionExpression(createFunctionExpression([createIdentifier('fe')]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('af')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('af'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('af')
    })

    test('should detect all three param types independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('fd')]))
      visitor.FunctionExpression(createFunctionExpression([createIdentifier('fe')]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('af')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('fd'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('fe'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('af'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(3)
    })

    test('should report for param named like JS keywords', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('class')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('class'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for param with uppercase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('UPPER')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('UPPER'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for param with camelCase name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('myVarName')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVarName'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect MemberExpression with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: createIdentifier('obj'),
            property: { type: 'Literal', value: 0 },
            computed: true,
          },
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
    })

    test('should detect MemberExpression with nested MemberExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('data')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(
            createMemberExpression(createIdentifier('data'), createIdentifier('nested')),
            createIdentifier('prop'),
          ),
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('NOT reporting', () => {
    test('should not report assignment when no function visited', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to non-param variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report %= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '%=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report <<= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '<<=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report >>= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '>>=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report >>>= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '>>>=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report |= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '|=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report &= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '&=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ^= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '^=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report **= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '**=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report &&= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '&&=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ||= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '||=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ??= assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '??=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report property mutation on non-param object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('window'), createIdentifier('location')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when left is not Identifier or MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ObjectPattern', properties: [] },
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when left is ArrayPattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'ArrayPattern', elements: [] },
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when left is empty MemberExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: createIdentifier('prop'),
            computed: false,
          },
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when MemberExpression object has no name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: { type: 'Identifier' },
            property: createIdentifier('prop'),
            computed: false,
          },
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for assignment to local variable same name as param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is wrong for AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'BinaryExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when node type is wrong for FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration({
        type: 'VariableDeclaration',
        declarations: [],
      })

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when FunctionExpression has wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionExpression({
        type: 'CallExpression',
      })

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when ArrowFunctionExpression has wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.ArrowFunctionExpression({
        type: 'CallExpression',
      })

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report for compound assignment with property mutation', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createMemberExpression(createIdentifier('obj'), createIdentifier('count')),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle null node in FunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node in FunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle null node in ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle undefined node in ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })

    test('should handle null node in AssignmentExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node in AssignmentExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle non-object node in AssignmentExpression', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle node without loc in FunctionDeclaration', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node without loc in AssignmentExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty params array', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([])
      expect(() => visitor.FunctionDeclaration(funcDecl)).not.toThrow()
    })

    test('should handle params without identifier', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([{ type: 'Literal', value: 1 }])
      expect(() => visitor.FunctionDeclaration(funcDecl)).not.toThrow()
    })

    test('should handle assignment without identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 2 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 10, 5),
          { type: 'Literal', value: 2 },
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

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
        getSource: () => 'function foo(x) { x = 1; }',
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

      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      expect(() =>
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle assignment before parameter declaration order', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in visitor', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(() => visitor.FunctionExpression(false)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(true)).not.toThrow()
      expect(() => visitor.AssignmentExpression(false)).not.toThrow()
    })

    test('should handle param with empty string name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([{ type: 'Identifier', name: '' }])
      visitor.FunctionDeclaration(funcDecl)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(''), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle params array with null entries', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([null, createIdentifier('x'), undefined])
      expect(() => visitor.FunctionDeclaration(funcDecl)).not.toThrow()
    })

    test('should handle params array with mixed types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = createFunctionDeclaration([
        createIdentifier('x'),
        { type: 'RestElement', argument: createIdentifier('rest') },
        { type: 'AssignmentPattern', left: createIdentifier('def') },
      ])

      visitor.FunctionDeclaration(funcDecl)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with undefined operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
      }

      visitor.AssignmentExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle function with null id', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = {
        type: 'FunctionDeclaration',
        id: null,
        params: [createIdentifier('x')],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(funcDecl)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle function without body', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcDecl = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [createIdentifier('x')],
      }

      expect(() => visitor.FunctionDeclaration(funcDecl)).not.toThrow()
    })

    test('should handle node that is a number primitive', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
      expect(() => visitor.AssignmentExpression(NaN)).not.toThrow()
    })

    test('should handle same param name in two functions', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle AssignmentExpression with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested function params still tracked', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('outer')]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('inner')]))

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('outer'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('inner'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('message quality', () => {
    test('should include parameter in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('parameter')
    })

    test('should include parameter name in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('testParam')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('testParam'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message).toContain('testParam')
    })

    test('should use word reassignment in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('reassignment')
    })

    test('should use word function in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('function')
    })

    test('should wrap parameter name in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message).toContain("'x'")
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should include correct param name for arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('callback')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('callback'), { type: 'Literal', value: null }),
      )

      expect(reports[0].message).toContain("'callback'")
    })

    test('should include correct param name for function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionExpression(createFunctionExpression([createIdentifier('handler')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('handler'), { type: 'Literal', value: null }),
      )

      expect(reports[0].message).toContain("'handler'")
    })

    test('should differentiate param names in multi-report', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('alpha'), createIdentifier('beta')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('alpha'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('beta'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should have consistent message format for property mutation', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('opts')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('opts'), createIdentifier('flag')),
          { type: 'Literal', value: true },
        ),
      )

      expect(reports[0].message).toBe("Reassignment of function parameter 'opts'.")
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {},
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 1, 0),
          { type: 'Literal', value: 2 },
          1,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 9999, 50),
          { type: 'Literal', value: 2 },
          9999,
          50,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 0, 0),
          { type: 'Literal', value: 2 },
          0,
          0,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report both start and end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 5, 10),
          { type: 'Literal', value: 2 },
          5,
          10,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location from property mutation', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('x'), 3, 7),
          { type: 'Literal', value: 2 },
          3,
          7,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should default to line 1 when loc is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: null,
      })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should default column to 0 when start has no column', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 5 },
          end: { line: 5, column: 10 },
        },
      })

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle NaN line value', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: NaN, column: NaN },
          end: { line: NaN, column: NaN },
        },
      })

      expect(reports.length).toBe(1)
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should handle negative line value', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: -1, column: -5 },
          end: { line: -1, column: 0 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle fractional line value', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1.5, column: 0 },
          end: { line: 1.5, column: 10 },
        },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1.5)
    })
  })

  describe('multiple reports', () => {
    test('should report each assignment separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(3)
    })

    test('should report mix of direct and property assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('obj'), { type: 'Literal', value: null }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('prop')),
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report across different params with same report count', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('a'), createIdentifier('b')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(3)
      expect(reports.filter((r) => r.message.includes("'a'")).length).toBe(2)
      expect(reports.filter((r) => r.message.includes("'b'")).length).toBe(1)
    })

    test('should report same param twice with different locations', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 5, 0),
          { type: 'Literal', value: 1 },
          5,
          0,
        ),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 10, 0),
          { type: 'Literal', value: 2 },
          10,
          0,
        ),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should report property mutations on different params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([createIdentifier('a'), createIdentifier('b')]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('x')),
          { type: 'Literal', value: 1 },
        ),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('b'), createIdentifier('y')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should only report = operator not compound in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(1)
    })

    test('should report each param once when all reassigned', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(
        createFunctionDeclaration([
          createIdentifier('p1'),
          createIdentifier('p2'),
          createIdentifier('p3'),
          createIdentifier('p4'),
        ]),
      )
      for (let i = 1; i <= 4; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier(`p${i}`), { type: 'Literal', value: i }),
        )
      }

      expect(reports.length).toBe(4)
    })

    test('should report interleaved param and non-param assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(2)
    })

    test('should report 10 reassignments of same param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: i }),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should accumulate reports across multiple function types', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('a')]))
      visitor.FunctionExpression(createFunctionExpression([createIdentifier('b')]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('c')]))

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }', filePath: '/custom/path.ts' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const foo = (x) => x = 1', filePath: '/src/file.ts' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should call report function correctly', () => {
      const reports: ReportDescriptor[] = []
      let reportCallCount = 0

      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reportCallCount++
          reports.push(descriptor)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'x = 1',
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

      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reportCallCount).toBe(1)
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should work with options containing irrelevant keys', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOtherOption: true }], source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should not access filePath during detection', () => {
      let filePathAccessed = false
      const context: RuleContext = {
        report: () => {},
        getFilePath: () => {
          filePathAccessed = true
          return '/src/file.ts'
        },
        getAST: () => null,
        getSource: () => '',
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

      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(filePathAccessed).toBe(false)
    })

    test('should not call logger during normal operation', () => {
      const debugFn = vi.fn()
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const ctx: RuleContext = {
        ...context,
        logger: {
          debug: debugFn,
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
      } as unknown as RuleContext

      const visitor = noParamReassignRule.create(ctx)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(debugFn).not.toHaveBeenCalled()
    })

    test('should work with TypeScript file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }', filePath: '/src/component.tsx' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with JavaScript file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }', filePath: '/src/index.js' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - compound operators not reported', () => {
    test.each([
      ['+=', 1],
      ['-=', 1],
      ['*=', 2],
      ['/=', 2],
      ['%=', 3],
      ['<<=', 1],
      ['>>=', 1],
      ['>>>=', 1],
      ['|=', 1],
      ['&=', 1],
      ['^=', 1],
      ['**=', 2],
      ['&&=', true],
      ['||=', false],
      ['??=', null],
    ])('should not report %s assignment to parameter', (operator, value) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator,
        left: createIdentifier('x'),
        right: { type: 'Literal', value },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - param names detected', () => {
    test.each([
      ['x'],
      ['a'],
      ['myVar'],
      ['_private'],
      ['$jQuery'],
      ['camelCase'],
      ['snake_case'],
      ['UPPER'],
      ['a1'],
      ['param99'],
      ['__dunder__'],
      ['$'],
      ['_'],
      ['data'],
      ['callback'],
      ['result'],
      ['value'],
      ['config'],
      ['options'],
      ['ctx'],
    ])('should report reassignment of param named "%s"', (paramName) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier(paramName)]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(paramName), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(paramName)
    })
  })

  describe('test.each - function types detection', () => {
    test.each([
      ['FunctionDeclaration', createFunctionDeclaration],
      ['FunctionExpression', createFunctionExpression],
      ['ArrowFunctionExpression', createArrowFunctionExpression],
    ] as const)('should detect reassignment via %s', (_name, createFn) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const funcNode = createFn([createIdentifier('x')])

      if (funcNode.type === 'FunctionDeclaration') {
        visitor.FunctionDeclaration(funcNode)
      } else if (funcNode.type === 'FunctionExpression') {
        visitor.FunctionExpression(funcNode)
      } else {
        visitor.ArrowFunctionExpression(funcNode)
      }

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - non-param assignments not reported', () => {
    test.each([
      ['y', 'x'],
      ['local', 'param'],
      ['result', 'input'],
      ['window', 'config'],
      ['self', 'ctx'],
      ['global', 'state'],
      ['arr', 'obj'],
      ['temp', 'data'],
      ['sum', 'total'],
      ['index', 'i'],
    ])('should not report assignment to "%s" when param is "%s"', (varName, paramName) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier(paramName)]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier(varName), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - null/undefined edge cases', () => {
    test.each([
      [
        'FunctionDeclaration',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.FunctionDeclaration(null),
      ],
      [
        'FunctionDeclaration',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.FunctionDeclaration(undefined),
      ],
      [
        'FunctionExpression',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.FunctionExpression(null),
      ],
      [
        'FunctionExpression',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.FunctionExpression(undefined),
      ],
      [
        'ArrowFunctionExpression',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.ArrowFunctionExpression(null),
      ],
      [
        'ArrowFunctionExpression',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.ArrowFunctionExpression(undefined),
      ],
      [
        'AssignmentExpression',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.AssignmentExpression(null),
      ],
      [
        'AssignmentExpression',
        (v: ReturnType<typeof noParamReassignRule.create>) => v.AssignmentExpression(undefined),
      ],
    ] as const)('should not throw on null/undefined for %s', (_name, action) => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => action(visitor)).not.toThrow()
    })
  })

  describe('test.each - location accuracy', () => {
    test.each([
      [1, 0],
      [1, 5],
      [5, 0],
      [10, 20],
      [100, 50],
      [2, 1],
      [3, 14],
      [7, 3],
      [1, 100],
      [50, 0],
    ] as const)('should report correct location at line %d column %d', (line, column) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', line, column),
          { type: 'Literal', value: 2 },
          line,
          column,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('test.each - right side values', () => {
    test.each([
      ['Literal', { type: 'Literal', value: 42 }],
      ['Literal string', { type: 'Literal', value: 'hello' }],
      ['Literal null', { type: 'Literal', value: null }],
      ['Literal boolean', { type: 'Literal', value: true }],
      ['Identifier', { type: 'Identifier', name: 'other' }],
      ['CallExpression', { type: 'CallExpression', callee: {} }],
      ['ObjectExpression', { type: 'ObjectExpression', properties: [] }],
      ['ArrayExpression', { type: 'ArrayExpression', elements: [] }],
      ['UnaryExpression', { type: 'UnaryExpression', operator: '!' }],
      ['BinaryExpression', { type: 'BinaryExpression', operator: '+' }],
    ])('should report regardless of right side type: %s', (_name, right) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('x'), right))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - property mutation detection', () => {
    test.each([
      ['prop'],
      ['name'],
      ['value'],
      ['length'],
      ['count'],
      ['data'],
      ['items'],
      ['0'],
      ['key'],
      ['_private'],
    ])('should report property mutation for property named "%s"', (propName) => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier(propName)),
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
    })
  })

  describe('additional detection coverage', () => {
    test('should detect reassignment with null right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: null }),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect reassignment with undefined right side', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), {
          type: 'Identifier',
          name: 'undefined',
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when param name is substring of variable name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('data')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('dataset'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when variable name is substring of param name', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('dataset')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('data'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should report reassignment after visiting FunctionExpression then FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionExpression(createFunctionExpression([createIdentifier('feParam')]))
      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('fdParam')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('feParam'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('fdParam'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(2)
    })

    test('should handle visitor called with array node', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration([1, 2, 3])).not.toThrow()
      expect(() => visitor.AssignmentExpression([])).not.toThrow()
    })

    test('should handle visitor called with Date object', () => {
      const { context } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      expect(() => visitor.FunctionDeclaration(new Date())).not.toThrow()
      expect(() => visitor.AssignmentExpression(new Date())).not.toThrow()
    })

    test('should handle AssignmentExpression with only operator field', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: null,
            property: createIdentifier('prop'),
            computed: false,
          },
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with undefined object', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: undefined,
            property: createIdentifier('prop'),
            computed: false,
          },
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should detect after visiting ArrowFunction then FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('a')]))
      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('b')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })

    test('should not report assignment to global-like variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('localVar')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('console'), { type: 'Literal', value: null }),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle function with ten params', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const params = Array.from({ length: 10 }, (_, i) => createIdentifier(`p${i}`))
      visitor.FunctionDeclaration(createFunctionDeclaration(params))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('p5'), { type: 'Literal', value: 5 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'p5'")
    })

    test('should handle function with ten params reassigning last', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      const params = Array.from({ length: 10 }, (_, i) => createIdentifier(`p${i}`))
      visitor.FunctionDeclaration(createFunctionDeclaration(params))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('p9'), { type: 'Literal', value: 9 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'p9'")
    })

    test('should handle member expression with numeric literal property', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('arr')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: createIdentifier('arr'),
            property: { type: 'NumericLiteral', value: 0 },
            computed: true,
          },
          { type: 'Literal', value: 42 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'arr'")
    })

    test('should handle member expression on function expression param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionExpression(createFunctionExpression([createIdentifier('item')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('item'), createIdentifier('id')),
          { type: 'Literal', value: 99 },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'item'")
    })

    test('should handle member expression on arrow function param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.ArrowFunctionExpression(createArrowFunctionExpression([createIdentifier('event')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('event'), createIdentifier('target')),
          { type: 'Literal', value: null },
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'event'")
    })

    test('should not report compound assignment via MemberExpression on param', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '-=',
        left: createMemberExpression(createIdentifier('obj'), createIdentifier('count')),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle visiting same function type twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('y')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 1 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(2)
    })

    test('should not report UpdateExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))

      expect(() =>
        visitor.AssignmentExpression({
          type: 'UpdateExpression',
          operator: '++',
          argument: createIdentifier('x'),
          prefix: false,
        }),
      ).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with empty string operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '',
        left: createIdentifier('x'),
        right: { type: 'Literal', value: 1 },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested property mutations', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('obj')]))
      const innerMember = createMemberExpression(createIdentifier('obj'), createIdentifier('a'))
      const outerMember = createMemberExpression(innerMember, createIdentifier('b'))
      visitor.AssignmentExpression(
        createAssignmentExpression(outerMember, { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should report direct reassignment and property mutation in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('p')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('p'), { type: 'Literal', value: null }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('p'), createIdentifier('x')),
          { type: 'Literal', value: 1 },
        ),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(createIdentifier('p'), createIdentifier('y')),
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(3)
    })

    test('should handle param named with single character after underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('_x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_x'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'_x'")
    })

    test('should handle param named with trailing digits', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('arg123')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('arg123'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'arg123'")
    })

    test('should not report when AssignmentExpression left is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('x')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          { type: 'CallExpression', callee: createIdentifier('fn') },
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report when MemberExpression object is CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('fn')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createMemberExpression(
            { type: 'CallExpression', callee: createIdentifier('fn') },
            createIdentifier('prop'),
          ),
          { type: 'Literal', value: 1 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle param named with double underscore prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'function foo(x) { x = 1; }' })
      const visitor = noParamReassignRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration([createIdentifier('__internal')]))
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('__internal'), { type: 'Literal', value: 1 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'__internal'")
    })
  })
})
