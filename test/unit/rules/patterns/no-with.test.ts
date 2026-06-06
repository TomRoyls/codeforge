import { describe, test, expect, vi } from 'vitest'
import { noWithRule } from '../../../../src/rules/patterns/no-with.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: String(value).length },
    },
  }
}

function createWithStatement(object: unknown, body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WithStatement',
    object,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-with rule', () => {
  // ===================== META EXHAUSTIVE =====================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noWithRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noWithRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noWithRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noWithRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention with in description', () => {
      expect(noWithRule.meta.docs?.description.toLowerCase()).toContain('with')
    })

    test('should have empty schema', () => {
      expect(noWithRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noWithRule.meta.fixable).toBeUndefined()
    })

    test('should have exact description text', () => {
      expect(noWithRule.meta.docs?.description).toBe('Disallow with statements.')
    })

    test('should have docs object defined', () => {
      expect(noWithRule.meta.docs).toBeDefined()
      expect(typeof noWithRule.meta.docs).toBe('object')
    })

    test('should have description as non-empty string', () => {
      expect(typeof noWithRule.meta.docs?.description).toBe('string')
      expect(noWithRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description ending with period', () => {
      expect(noWithRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noWithRule.meta.schema)).toBe(true)
    })

    test('should have schema with length 0', () => {
      expect(noWithRule.meta.schema).toHaveLength(0)
    })

    test('should have type as valid RuleType', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noWithRule.meta.type)
    })

    test('should have severity as valid Severity', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noWithRule.meta.severity)
    })

    test('should not have deprecated flag', () => {
      expect(noWithRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noWithRule.meta.replacedBy).toBeUndefined()
    })

    test('should not have requiresTypeChecking', () => {
      expect(noWithRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have docs url', () => {
      expect(noWithRule.meta.docs?.url).toBeDefined()
    })

    test('should have meta object defined', () => {
      expect(noWithRule.meta).toBeDefined()
      expect(typeof noWithRule.meta).toBe('object')
    })

    test('should have recommended as boolean true', () => {
      expect(noWithRule.meta.docs?.recommended).toBe(true)
      expect(typeof noWithRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof noWithRule.meta.docs?.category).toBe('string')
    })

    test('should have type as string', () => {
      expect(typeof noWithRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noWithRule.meta.severity).toBe('string')
    })

    test('should have meta with create function', () => {
      expect(typeof noWithRule.create).toBe('function')
    })

    test('should not be fixable as code', () => {
      expect(noWithRule.meta.fixable).not.toBe('code')
    })

    test('should not be fixable as whitespace', () => {
      expect(noWithRule.meta.fixable).not.toBe('whitespace')
    })

    test('should have description containing Disallow', () => {
      expect(noWithRule.meta.docs?.description).toContain('Disallow')
    })

    test('should have description mentioning statements', () => {
      expect(noWithRule.meta.docs?.description.toLowerCase()).toContain('statements')
    })
  })

  // ===================== VISITOR STRUCTURE =====================
  describe('create', () => {
    test('should return visitor object with WithStatement method', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).toHaveProperty('WithStatement')
      expect(typeof visitor.WithStatement).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return a defined visitor', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('should return an object type visitor', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have WithStatement as a function type', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(typeof visitor.WithStatement).toBe('function')
    })

    test('should allow creating multiple visitors from same context', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor1 = noWithRule.create(context)
      const visitor2 = noWithRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor that is not an array', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(Array.isArray(visitor)).toBe(false)
    })

    test('should have WithStatement that accepts one argument', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor.WithStatement.length).toBe(1)
    })

    test('should not have FunctionDeclaration handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('should not have VariableDeclaration handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('should not have IfStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('should not have ForStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('ForStatement')
    })

    test('should not have WhileStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('WhileStatement')
    })

    test('should not have ExpressionStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('should not have ReturnStatement handler', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(visitor).not.toHaveProperty('ReturnStatement')
    })

    test('should have WithStatement that returns void', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      const result = visitor.WithStatement(createWithStatement(obj, body))

      expect(result).toBeUndefined()
    })
  })

  // ===================== DETECTING WITH STATEMENTS =====================
  describe('detecting with statements', () => {
    test('should report with statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('with')
      expect(reports[0].message).toContain('not allowed')
    })

    test('should report with statement with identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('data')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with literal object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createLiteral('test')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with statements in body', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('x') },
      ])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report multiple with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(3)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 42, 10))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report with statement with MemberExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'MemberExpression',
        object: createIdentifier('window'),
        property: createIdentifier('config'),
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with CallExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'CallExpression',
        callee: createIdentifier('getConfig'),
        arguments: [],
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with ObjectExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'ObjectExpression',
        properties: [],
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with ArrayExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'ArrayExpression',
        elements: [],
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with numeric literal object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createLiteral(42)
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with boolean literal object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createLiteral(true)
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with null literal object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createLiteral(null)
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with empty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with ExpressionStatement body', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = {
        type: 'ExpressionStatement',
        expression: createIdentifier('x'),
      }
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with deeply nested body statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('a') },
        { type: 'ExpressionStatement', expression: createIdentifier('b') },
        { type: 'ExpressionStatement', expression: createIdentifier('c') },
      ])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with BinaryExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'BinaryExpression',
        operator: '+',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with ConditionalExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'ConditionalExpression',
        test: createIdentifier('flag'),
        consequent: createIdentifier('a'),
        alternate: createIdentifier('b'),
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with ThisExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = { type: 'ThisExpression' }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with ArrowFunctionExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: createBlockStatement([]),
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report two sequential with statements independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj1 = createIdentifier('a')
      const obj2 = createIdentifier('b')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj1, body, 1, 0))
      visitor.WithStatement(createWithStatement(obj2, body, 2, 0))

      expect(reports).toHaveLength(2)
    })

    test('should report five sequential with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      for (let i = 0; i < 5; i++) {
        visitor.WithStatement(createWithStatement(obj, body, i + 1, 0))
      }

      expect(reports).toHaveLength(5)
    })

    test('should report ten sequential with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      for (let i = 0; i < 10; i++) {
        visitor.WithStatement(createWithStatement(obj, body))
      }

      expect(reports).toHaveLength(10)
    })

    test('should report with statement with TemplateLiteral object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should report with statement with NewExpression object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = {
        type: 'NewExpression',
        callee: createIdentifier('Map'),
        arguments: [],
      }
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })
  })

  // ===================== NEGATIVE CASES =====================
  describe('negative cases - non-WithStatement nodes', () => {
    test('should not report for IfStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'IfStatement',
        test: createIdentifier('x'),
        consequent: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ForStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: createIdentifier('i'),
        update: null,
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for WhileStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: createIdentifier('x'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for SwitchStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'SwitchStatement',
        discriminant: createIdentifier('x'),
        cases: [],
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for DoWhileStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'DoWhileStatement',
        test: createIdentifier('x'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ForInStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ForInStatement',
        left: createIdentifier('key'),
        right: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ForOfStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ForOfStatement',
        left: createIdentifier('item'),
        right: createIdentifier('arr'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for TryStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'TryStatement',
        block: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: createIdentifier('fn'),
        params: [],
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for VariableDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ReturnStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: null,
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ThrowStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ThrowStatement',
        argument: createIdentifier('err'),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      visitor.WithStatement({})

      expect(reports.length).toBe(0)
    })

    test('should not report for object with type null', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: null,
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for object with type undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: undefined,
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for LabeledStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'LabeledStatement',
        label: createIdentifier('loop'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BreakStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      visitor.WithStatement({ type: 'BreakStatement', label: null })

      expect(reports.length).toBe(0)
    })

    test('should not report for ContinueStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      visitor.WithStatement({ type: 'ContinueStatement', label: null })

      expect(reports.length).toBe(0)
    })

    test('should not report for ClassDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: createIdentifier('MyClass'),
        body: { type: 'ClassBody', body: [] },
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ImportDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'ImportDeclaration',
        source: createLiteral('module'),
        specifiers: [],
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  // ===================== MESSAGE QUALITY =====================
  describe('message quality', () => {
    test('should mention with statement in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.toLowerCase()).toContain('with')
    })

    test('should mention not allowed in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })

    test('should use single quotes around with', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message).toContain("'with'")
    })

    test('should have exact message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message).toBe("'with' statement is not allowed.")
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have message containing statement word', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.toLowerCase()).toContain('statement')
    })

    test('should have consistent message across multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should have message that is a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message shorter than 100 characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].message.length).toBeLessThan(100)
    })
  })

  // ===================== EDGE CASES =====================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement('string')).not.toThrow()
      expect(() => visitor.WithStatement(123)).not.toThrow()
      expect(() => visitor.WithStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without object property', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      const node = createWithStatement(obj, body)
      delete (node as Record<string, unknown>).loc
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle with statement with null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: null,
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with undefined object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with null body', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: null,
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with undefined body', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should handle with statement with incorrect type', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'NotWithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          start: { line: 1, column: 'not-a-number' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      const node = {
        type: 'WithStatement',
        object: obj,
        body,
        loc: {},
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle numeric node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement('WithStatement')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(() => visitor.WithStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with null start', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
        loc: {
          start: null,
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with null end', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
        loc: {
          start: { line: 1, column: 0 },
          end: null,
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle extra properties on node', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
        extra: 'value',
        another: 42,
        nested: { deep: true },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      expect(() => visitor.WithStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with type as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 42,
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: true,
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: '',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle with statement with many extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
        range: [0, 15],
        leadingComments: [],
        trailingComments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.WithStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle case-sensitive type check', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'withstatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle WITHSTATEMENT uppercase type', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WITHSTATEMENT',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle With_Statement type with underscore', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'With_Statement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle symbol as type', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: Symbol('WithStatement'),
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  // ===================== LOCATION =====================
  describe('location', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 5, 3))

      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 1, 8))

      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 5, 3))

      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 5, 3))

      expect(reports[0].loc?.end.column).toBe(3 + 15)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report location at large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 1, 9999))

      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should report location at line 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should have both start and end in location', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 3, 5))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have line and column in start location', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have line and column in end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should preserve exact location for first of multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body, 10, 5))
      visitor.WithStatement(createWithStatement(obj, body, 20, 10))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should preserve exact location for second of multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body, 10, 5))
      visitor.WithStatement(createWithStatement(obj, body, 20, 10))

      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const node = {
        type: 'WithStatement',
        object: createIdentifier('obj'),
        body: createBlockStatement([]),
      }
      visitor.WithStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===================== MULTIPLE REPORTS =====================
  describe('multiple reports', () => {
    test('should report exactly 2 with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports).toHaveLength(2)
    })

    test('should report exactly 4 with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      for (let i = 0; i < 4; i++) {
        visitor.WithStatement(createWithStatement(obj, body))
      }

      expect(reports).toHaveLength(4)
    })

    test('should report exactly 7 with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      for (let i = 0; i < 7; i++) {
        visitor.WithStatement(createWithStatement(obj, body))
      }

      expect(reports).toHaveLength(7)
    })

    test('should have correct message for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(createWithStatement(obj, body))

      for (const report of reports) {
        expect(report.message).toBe("'with' statement is not allowed.")
      }
    })

    test('should have correct location for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body, 1, 0))
      visitor.WithStatement(createWithStatement(obj, body, 2, 4))
      visitor.WithStatement(createWithStatement(obj, body, 3, 8))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should preserve report order', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body, 5, 0))
      visitor.WithStatement(createWithStatement(obj, body, 10, 0))
      visitor.WithStatement(createWithStatement(obj, body, 15, 0))

      expect(reports[0].loc?.start.line).toBeLessThan(reports[1].loc?.start.line as number)
      expect(reports[1].loc?.start.line).toBeLessThan(reports[2].loc?.start.line as number)
    })

    test('should report 0 after only non-WithStatement nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      visitor.WithStatement({ type: 'IfStatement' })
      visitor.WithStatement({ type: 'ForStatement' })
      visitor.WithStatement({ type: 'WhileStatement' })

      expect(reports).toHaveLength(0)
    })

    test('should report correct count with mix of valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement({ type: 'IfStatement' })
      visitor.WithStatement(createWithStatement(obj, body))
      visitor.WithStatement(null)
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports).toHaveLength(3)
    })

    test('should handle 20 sequential with statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      for (let i = 0; i < 20; i++) {
        visitor.WithStatement(createWithStatement(obj, body))
      }

      expect(reports).toHaveLength(20)
    })

    test('should report after reset of reports array context', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])

      visitor.WithStatement(createWithStatement(obj, body))
      expect(reports).toHaveLength(1)

      reports.length = 0

      visitor.WithStatement(createWithStatement(obj, body))
      expect(reports).toHaveLength(1)
    })
  })

  // ===================== CONTEXT VARIATIONS =====================
  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }', filePath: '/src/different.ts' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (x) { foo() }', filePath: '/src/file.ts' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('x')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with empty string source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra data', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extra: true, nested: { value: 1 } }], source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'with (obj) { }',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with context that has parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'with (obj) { }',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext

      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }', filePath: 'C:\\Users\\dev\\project\\file.ts' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }', filePath: '/a/b/c/d/e/f/g/h/file.ts' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }', filePath: '/src/file.js' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }', filePath: '/src/component.jsx' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with .mjs file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }', filePath: '/src/module.mjs' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with getAST returning object', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => 'with (obj) { }',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with getTokens returning populated array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'with (obj) { }',
        getTokens: () => [{ type: 'Keyword', value: 'with' }],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with getComments returning populated array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '/* comment */ with (obj) { }',
        getTokens: () => [],
        getComments: () => [{ type: 'Block', value: ' comment ' }],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should work with context having undefined config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'with (obj) { }',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })
  })

  // ===================== EXPORTS =====================
  describe('exports', () => {
    test('should have named export noWithRule', () => {
      expect(noWithRule).toBeDefined()
    })

    test('should have noWithRule as an object', () => {
      expect(typeof noWithRule).toBe('object')
    })

    test('should have meta on exported rule', () => {
      expect(noWithRule.meta).toBeDefined()
      expect(typeof noWithRule.meta).toBe('object')
    })

    test('should have create on exported rule', () => {
      expect(noWithRule.create).toBeDefined()
      expect(typeof noWithRule.create).toBe('function')
    })

    test('should have meta with type property', () => {
      expect(noWithRule.meta).toHaveProperty('type')
    })

    test('should have meta with severity property', () => {
      expect(noWithRule.meta).toHaveProperty('severity')
    })

    test('should have meta with docs property', () => {
      expect(noWithRule.meta).toHaveProperty('docs')
    })

    test('should have meta with schema property', () => {
      expect(noWithRule.meta).toHaveProperty('schema')
    })

    test('should have create that returns a RuleVisitor', () => {
      const { context } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should be a valid RuleDefinition', () => {
      expect(noWithRule.meta).toBeDefined()
      expect(noWithRule.create).toBeDefined()
      expect(typeof noWithRule.create).toBe('function')
    })
  })

  // ===================== REPORT DESCRIPTOR =====================
  describe('report descriptor', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc.end in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have line in loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc?.start).toHaveProperty('line')
    })

    test('should have column in loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have line in loc.end', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc?.end).toHaveProperty('line')
    })

    test('should have column in loc.end', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should have numeric start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric end line', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have numeric end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-null loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc).not.toBeNull()
    })

    test('should have non-undefined loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports[0].loc).toBeDefined()
    })

    test('should report exactly one issue per WithStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(reports.length).toBe(1)
    })

    test('should have start line >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 0, 0))

      expect(reports[0].loc!.start.line).toBeGreaterThanOrEqual(0)
    })

    test('should have start column >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 1, 0))

      expect(reports[0].loc!.start.column).toBeGreaterThanOrEqual(0)
    })

    test('should have end column greater than or equal to start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body, 5, 3))

      expect(reports[0].loc!.end.column).toBeGreaterThanOrEqual(reports[0].loc!.start.column)
    })

    test('should have report object with exactly two keys', () => {
      const { context, reports } = createMockRuleContext({ source: 'with (obj) { }' })
      const visitor = noWithRule.create(context)

      const obj = createIdentifier('obj')
      const body = createBlockStatement([])
      visitor.WithStatement(createWithStatement(obj, body))

      expect(Object.keys(reports[0])).toContain('message')
      expect(Object.keys(reports[0])).toContain('loc')
    })
  })
})
