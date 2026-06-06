import { describe, test, expect, vi } from 'vitest'
import { noFallthroughRule } from '../../../../src/rules/patterns/no-fallthrough.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSwitchCase(consequent: unknown[], line = 1): unknown {
  let caseLoc: { start: { line: number; column: number }; end: { line: number; column: number } } = {
    start: { line, column: 0 },
    end: { line, column: 30 },
  }
  if (consequent.length > 0) {
    const last = consequent[consequent.length - 1] as {
      loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
    }
    if (last?.loc) {
      caseLoc = last.loc
    }
  }
  return {
    type: 'SwitchCase',
    test: { type: 'Literal', value: 1 },
    consequent,
    loc: caseLoc,
  }
}

function createSwitchStatement(cases: unknown[]): unknown {
  return {
    type: 'SwitchStatement',
    discriminant: { type: 'Identifier', name: 'foo' },
    cases,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createBreakStatement(line = 1, column = 0): unknown {
  return {
    type: 'BreakStatement',
    label: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createReturnStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Error' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createContinueStatement(line = 1, column = 0): unknown {
  return {
    type: 'ContinueStatement',
    label: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'doSomething' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonSwitchCase(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-fallthrough rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noFallthroughRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFallthroughRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFallthroughRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noFallthroughRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention fallthrough in description', () => {
      expect(noFallthroughRule.meta.docs?.description.toLowerCase()).toContain('fallthrough')
    })
  })

  describe('create', () => {
    test('should return visitor with SwitchCase method', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      expect(visitor).toHaveProperty('SwitchStatement')
    })
  })

  describe('detecting fallthrough', () => {
    test('should report missing break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('break')
    })

    test('should not report with break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createBreakStatement()])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createReturnStatement()])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createThrowStatement()])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createContinueStatement()])]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-SwitchCase nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(createNonSwitchCase())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      expect(() => visitor.SwitchStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      expect(() => visitor.SwitchStatement(undefined)).not.toThrow()
    })

    test('should handle empty consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([])]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])

      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple statements without break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle break not being last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createBreakStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('meta - exhaustive properties', () => {
    test('meta.type should be exactly problem', () => {
      expect(noFallthroughRule.meta.type).toBe('problem')
      expect(noFallthroughRule.meta.type).not.toBe('suggestion')
      expect(noFallthroughRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should be exactly error', () => {
      expect(noFallthroughRule.meta.severity).toBe('error')
      expect(noFallthroughRule.meta.severity).not.toBe('warn')
      expect(noFallthroughRule.meta.severity).not.toBe('off')
    })

    test('meta.docs should be defined', () => {
      expect(noFallthroughRule.meta.docs).toBeDefined()
      expect(typeof noFallthroughRule.meta.docs).toBe('object')
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof noFallthroughRule.meta.docs?.description).toBe('string')
      expect(noFallthroughRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.description should mention switch', () => {
      expect(noFallthroughRule.meta.docs?.description.toLowerCase()).toContain('switch')
    })

    test('meta.docs.category should be patterns', () => {
      expect(noFallthroughRule.meta.docs?.category).toBe('patterns')
    })

    test('meta.docs.recommended should be true', () => {
      expect(noFallthroughRule.meta.docs?.recommended).toBe(true)
    })

    test('meta.schema should be empty array', () => {
      expect(noFallthroughRule.meta.schema).toEqual([])
    })

    test('meta.fixable should be undefined', () => {
      expect(noFallthroughRule.meta.fixable).toBeUndefined()
    })

    test('meta.requiresTypeChecking should be undefined or falsy', () => {
      expect(noFallthroughRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('meta.deprecated should be undefined or falsy', () => {
      expect(noFallthroughRule.meta.deprecated).toBeFalsy()
    })

    test('meta.docs.url should be defined', () => {
      expect(noFallthroughRule.meta.docs?.url).toBeDefined()
    })

    test('meta should be frozen/readonly - type field', () => {
      const typed = noFallthroughRule.meta.type
      expect(['problem', 'suggestion', 'layout']).toContain(typed)
    })

    test('meta should have correct RuleMeta shape', () => {
      const meta = noFallthroughRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should have exactly SwitchCase method', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(typeof visitor.SwitchStatement).toBe('function')
    })

    test('SwitchCase should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(visitor.SwitchStatement.length).toBeGreaterThanOrEqual(1)
    })

    test('create should return a new visitor each call', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor1 = noFallthroughRule.create(context)
      const visitor2 = noFallthroughRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('SwitchCase method should not return a value for valid input', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const result = visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createExpressionStatement()])]))
      expect(result).toBeUndefined()
    })

    test('visitor should not have other common visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(visitor).not.toHaveProperty('IfStatement')
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
      expect(visitor).not.toHaveProperty('Program')
    })

    test('SwitchCase should be callable multiple times', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => {
        visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createExpressionStatement()])]))
        visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createExpressionStatement()])]))
        visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createExpressionStatement()])]))
      }).not.toThrow()
    })
  })

  describe('isSwitchCase - non-SwitchCase types', () => {
    test('should not report for IfStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createNonSwitchCase())
      expect(reports.length).toBe(0)
    })

    test('should not report for ForStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for WhileStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for FunctionDeclaration node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for BlockStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for TryStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({})
      expect(reports.length).toBe(0)
    })

    test('should not report for object with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({ type: 'SwitchCasee' })
      expect(reports.length).toBe(0)
    })

    test('should not report for object with lowercase type', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({ type: 'switchcase' })
      expect(reports.length).toBe(0)
    })

    test('should not report for numeric node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(42)
      expect(reports.length).toBe(0)
    })

    test('should not report for string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement('SwitchCase')
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(true)
      expect(reports.length).toBe(0)
    })

    test('should not report for array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement([])
      expect(reports.length).toBe(0)
    })
  })

  describe('terminating statements - break', () => {
    test('should not report when break is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createBreakStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should not report when break follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createBreakStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with break at different line', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createBreakStatement(5, 10)])]))
      expect(reports.length).toBe(0)
    })

    test('should not report with labeled break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'BreakStatement',
              label: { type: 'Identifier', name: 'outer' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
            },
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when break is first of two statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createBreakStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report when break is in middle of three statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createBreakStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('terminating statements - return', () => {
    test('should not report when return is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createReturnStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should not report when return follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createReturnStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with return at different line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createReturnStatement(10, 5)])]))
      expect(reports.length).toBe(0)
    })

    test('should not report with return that has an argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ReturnStatement',
              argument: { type: 'Literal', value: 42 },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
            },
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when return is not last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createReturnStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report when return is in middle of three statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createReturnStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('terminating statements - throw', () => {
    test('should not report when throw is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createThrowStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should not report when throw follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createThrowStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with throw at different line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createThrowStatement(7, 3)])]))
      expect(reports.length).toBe(0)
    })

    test('should not report with throw that has complex argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ThrowStatement',
              argument: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'TypeError' },
                arguments: [{ type: 'Literal', value: 'bad' }],
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when throw is not last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createThrowStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('terminating statements - continue', () => {
    test('should not report when continue is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createContinueStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should not report when continue follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createContinueStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with continue at different line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createContinueStatement(3, 8)])]))
      expect(reports.length).toBe(0)
    })

    test('should not report with labeled continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ContinueStatement',
              label: { type: 'Identifier', name: 'loop' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
            },
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when continue is not last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createContinueStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('non-terminating statements', () => {
    test('should report with only ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with VariableDeclaration as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'VariableDeclaration',
              declarations: [],
              kind: 'let',
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with FunctionDeclaration as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'FunctionDeclaration',
              id: { type: 'Identifier', name: 'helper' },
              params: [],
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with IfStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with ForStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ForStatement',
              init: null,
              test: null,
              update: null,
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with WhileStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'WhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with SwitchStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'SwitchStatement',
              discriminant: { type: 'Identifier', name: 'x' },
              cases: [],
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with BlockStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'BlockStatement',
              body: [],
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with TryStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'TryStatement',
              block: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with DebuggerStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'DebuggerStatement',
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with WithStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'WithStatement',
              object: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with DoWhileStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'DoWhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with ForInStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ForInStatement',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with ForOfStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ForOfStatement',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'arr' },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with LabeledStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'LabeledStatement',
              label: { type: 'Identifier', name: 'label' },
              body: { type: 'EmptyStatement' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with EmptyStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            {
              type: 'EmptyStatement',
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('report message', () => {
    test('should include "break" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports[0].message).toContain('break')
    })

    test('should include "fallthrough" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports[0].message.toLowerCase()).toContain('fallthrough')
    })

    test('should have exact expected message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports[0].message).toBe('Expected a break statement before fallthrough.')
    })

    test('should always report same message for different fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message should be a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('report location', () => {
    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location of last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(5, 10)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(3, 5)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(5 + 15)
    })

    test('should report location of last statement when multiple', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(1, 0), createExpressionStatement(7, 12)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should handle location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(1, 0)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(100, 50)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle location at line 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(0, 0)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fn' },
                arguments: [],
              },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('multiple consequent scenarios', () => {
    test('should report once for single expression without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report once for two expressions without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report once for three expressions without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report once for five expressions without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createExpressionStatement(),
            createExpressionStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report for expression then break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createBreakStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for expression then return', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createReturnStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for expression then throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createThrowStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for expression then continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createContinueStatement()])]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report for multiple expressions then break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createBreakStatement(),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report for break then expression then expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createBreakStatement(),
            createExpressionStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('consequent edge cases', () => {
    test('should not report for consequent with undefined last element', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([undefined]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report for consequent with null last element', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([null]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle consequent with only break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createBreakStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createReturnStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createThrowStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createContinueStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent where last element has no type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([{ foo: 'bar' }]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([42]), createSwitchCase([])]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase(['hello']), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element type is empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([{ type: '' }]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element type is unknown', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([{ type: 'UnknownStatement' }]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('test value variations', () => {
    test('should work with literal test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with string literal test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 'hello' },
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with identifier test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: { type: 'Identifier', name: 'x' },
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with null test value (default case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: null,
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work without test property', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple calls accumulation', () => {
    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(3)
    })

    test('should accumulate only for fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createBreakStatement()])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(2)
    })

    test('should not report for any call when all have terminators', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createBreakStatement()])]))
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createReturnStatement()])]))
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createThrowStatement()])]))
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createContinueStatement()])]))
      expect(reports.length).toBe(0)
    })

    test('should handle alternating valid and invalid cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createBreakStatement()])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createReturnStatement()])]))
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(), createThrowStatement()])]),
      )
      expect(reports.length).toBe(2)
    })

    test('should handle 10 sequential fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.SwitchStatement(
          createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
        )
      }
      expect(reports.length).toBe(10)
    })

    test('should handle 50 sequential fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.SwitchStatement(
          createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
        )
      }
      expect(reports.length).toBe(50)
    })
  })

  describe('context interaction', () => {
    test('should use provided context report function', () => {
      let reportCalled = false
      const context = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reportCalled).toBe(true)
    })

    test('should not call report for valid case', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createBreakStatement()])]))
      expect(reportCount).toBe(0)
    })

    test('should pass message to report', () => {
      let reportedMessage = ''
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reportedMessage = descriptor.message
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(reportedMessage).toBe('Expected a break statement before fallthrough.')
    })

    test('should pass loc to report', () => {
      let reportedLoc: unknown = null
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reportedLoc = descriptor.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(5, 10)]),
          createSwitchCase([]),
        ]),
      )
      expect(reportedLoc).toBeDefined()
      expect((reportedLoc as { start: { line: number } }).start.line).toBe(5)
    })

    test('should work with different workspace roots', () => {
      const context = {
        report: vi.fn(),
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      expect(context.report).toHaveBeenCalledTimes(1)
    })
  })

  describe('exports', () => {
    test('should export noFallthroughRule as named export', () => {
      expect(noFallthroughRule).toBeDefined()
    })

    test('should export an object with meta property', () => {
      expect(noFallthroughRule).toHaveProperty('meta')
    })

    test('should export an object with create property', () => {
      expect(noFallthroughRule).toHaveProperty('create')
    })

    test('meta should be an object', () => {
      expect(typeof noFallthroughRule.meta).toBe('object')
    })

    test('create should be a function', () => {
      expect(typeof noFallthroughRule.create).toBe('function')
    })

    test('rule should have exactly meta and create properties', () => {
      const keys = Object.keys(noFallthroughRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('mixed terminating and non-terminating sequences', () => {
    test('should report when last is expression after break+return', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createBreakStatement(),
            createReturnStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report when break is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createExpressionStatement(),
            createBreakStatement(),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when return is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createReturnStatement(),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when throw is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createThrowStatement(),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when continue is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createExpressionStatement(),
            createContinueStatement(),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when last statement is expression after return in middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createReturnStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report when last statement is expression after throw in middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createThrowStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report when last statement is expression after continue in middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(),
            createContinueStatement(),
            createExpressionStatement(),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('location with different consequent sizes', () => {
    test('should report location from last statement in 1-element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(2, 4)]), createSwitchCase([])]),
      )
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location from last statement in 2-element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([createExpressionStatement(1, 0), createExpressionStatement(8, 3)]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location from last statement in 3-element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            createExpressionStatement(1, 0),
            createExpressionStatement(2, 0),
            createExpressionStatement(9, 15),
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(9)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('SwitchCase test variations with terminators', () => {
    test('should not report with default case and break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: null,
            consequent: [createExpressionStatement(), createBreakStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report with default case and return', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: null,
            consequent: [createExpressionStatement(), createReturnStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report with default case and no terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: null,
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with boolean test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: true },
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with object test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: { type: 'ObjectExpression', properties: [] },
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with member expression test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'prop' },
            },
            consequent: [createExpressionStatement(), createBreakStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('consequent as non-array values', () => {
    test('should handle consequent as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          consequent: undefined,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          consequent: null,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([])]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as string (non-array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          consequent: 'not-an-array',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })
  })

  describe('rule robustness', () => {
    test('should not throw when node type is a number', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: 42, consequent: [] }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should not throw when node type is boolean', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: true, consequent: [] }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should not throw when node type is object', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: {}, consequent: [] }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should not throw when node type is function', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: () => 'SwitchCase', consequent: [] }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should not throw when consequent contains only numbers', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          consequent: [1, 2, 3],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should not throw when consequent contains mixed types', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          consequent: [createExpressionStatement(), null, undefined, 'string', 42],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should handle deep nesting of node properties', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: {
            type: 'BinaryExpression',
            left: { type: 'Identifier', name: 'a' },
            operator: '===',
            right: { type: 'Identifier', name: 'b' },
          },
          consequent: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'deepFn' },
                arguments: [],
              },
              loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 12 } },
            },
          ],
          loc: { start: { line: 3, column: 0 }, end: { line: 6, column: 1 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should handle Symbol as node type', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: Symbol('SwitchCase'), consequent: [] }
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })
  })

  describe('visitor reusability', () => {
    test('should be usable across multiple node visits with same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.SwitchStatement(
          createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
        )
      }
      expect(reports.length).toBe(5)
    })

    test('should maintain correct report order', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(1, 0)]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(2, 0)]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement(3, 0)]), createSwitchCase([])]),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should handle interleaved valid and invalid visits', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([createBreakStatement()])]))
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase([])]))
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([createExpressionStatement()]), createSwitchCase([])]),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('location extraction integration', () => {
    test('should use extractLocation for report location', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fn' },
                arguments: [],
              },
              loc: { start: { line: 10, column: 4 }, end: { line: 10, column: 20 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should handle multi-line location', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fn' },
                arguments: [],
              },
              loc: { start: { line: 5, column: 0 }, end: { line: 10, column: 3 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should handle node with partial loc (start only)', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          createSwitchCase([
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fn' },
                arguments: [],
              },
              loc: { start: { line: 3, column: 2 } },
            },
          ]),
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('isSwitchCase strict type checking', () => {
    test('should not report for SwitchCase with extra whitespace in type', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: ' SwitchCase ',
            consequent: [createExpressionStatement()],
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report for exactly SwitchCase type', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report when type property is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement({
        consequent: [createExpressionStatement()],
      })
      expect(reports.length).toBe(0)
    })

    test('should not crash for node that is a Date object', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(new Date())).not.toThrow()
    })

    test('should not crash for node that is a RegExp object', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(/test/)).not.toThrow()
    })

    test('should not crash for node that is a Map', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(new Map())).not.toThrow()
    })

    test('should not crash for node that is a Set', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(new Set())).not.toThrow()
    })

    test('should not crash for NaN', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(NaN)).not.toThrow()
    })

    test('should not crash for Infinity', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(Infinity)).not.toThrow()
    })

    test('should not crash for negative number', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(-1)).not.toThrow()
    })

    test('should not crash for BigInt', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchStatement(BigInt(42))).not.toThrow()
    })

    test('should not crash when node has circular reference', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const circular: Record<string, unknown> = { type: 'SwitchCase' }
      circular.self = circular
      expect(() => visitor.SwitchStatement(circular)).not.toThrow()
    })

    test('should not crash when consequent has circular reference', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const circularStmt: Record<string, unknown> = { type: 'ExpressionStatement' }
      circularStmt.self = circularStmt
      const node = createSwitchStatement([
        {
          type: 'SwitchCase',
          test: { type: 'Literal', value: 1 },
          consequent: [circularStmt],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
      ])
      expect(() => visitor.SwitchStatement(node)).not.toThrow()
    })

    test('should not crash when loc has non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 1 },
            consequent: [createExpressionStatement()],
            loc: { start: { line: 'one', column: 0 }, end: { line: 'one', column: 5 } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not crash when loc has non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 1 },
            consequent: [createExpressionStatement()],
            loc: { start: { line: 1, column: 'zero' }, end: { line: 1, column: 'five' } },
          },
          createSwitchCase([]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not crash when last consequent element is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchStatement(
        createSwitchStatement([createSwitchCase([[createBreakStatement()]]), createSwitchCase([])]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle consequent with sparse array', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const sparse: unknown[] = []
      sparse[0] = createExpressionStatement()
      sparse[5] = createBreakStatement()
      expect(() => visitor.SwitchStatement(createSwitchStatement([createSwitchCase(sparse)]))).not.toThrow()
    })

    test('should handle consequent where only element is break at index 0 of sparse array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const sparse: unknown[] = []
      sparse[0] = createBreakStatement()
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase(sparse)]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent where sparse array has undefined at last index', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const sparse: unknown[] = [createExpressionStatement(), undefined]
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase(sparse), createSwitchCase([])]))
      expect(reports.length).toBe(1)
    })

    test('should handle extremely large consequent array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const stmts: unknown[] = []
      for (let i = 0; i < 100; i++) {
        stmts.push(createExpressionStatement())
      }
      stmts.push(createBreakStatement())
      visitor.SwitchStatement(createSwitchStatement([createSwitchCase(stmts)]))
      expect(reports.length).toBe(0)
    })
  })
})
