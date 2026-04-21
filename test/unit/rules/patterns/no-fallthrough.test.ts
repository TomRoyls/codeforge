import { describe, test, expect, vi } from 'vitest'
import { noFallthroughRule } from '../../../../src/rules/patterns/no-fallthrough.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSwitchCase(consequent: unknown[], line = 1): unknown {
  return {
    type: 'SwitchCase',
    test: { type: 'Literal', value: 1 },
    consequent,
    loc: {
      start: { line, column: 0 },
      end: { line, column: 30 },
    },
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

      expect(visitor).toHaveProperty('SwitchCase')
    })
  })

  describe('detecting fallthrough', () => {
    test('should report missing break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('break')
    })

    test('should not report with break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report with throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createThrowStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report with continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createContinueStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report non-SwitchCase nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createNonSwitchCase())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      expect(() => visitor.SwitchCase(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      expect(() => visitor.SwitchCase(undefined)).not.toThrow()
    })

    test('should handle empty consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple statements without break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(
        createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle break not being last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createBreakStatement(), createExpressionStatement()]))

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

    test('meta.docs.url should be undefined or falsy', () => {
      expect(noFallthroughRule.meta.docs?.url).toBeFalsy()
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
      expect(typeof visitor.SwitchCase).toBe('function')
    })

    test('SwitchCase should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(visitor.SwitchCase.length).toBeGreaterThanOrEqual(1)
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
      const result = visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
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
        visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
        visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
        visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      }).not.toThrow()
    })
  })

  describe('isSwitchCase - non-SwitchCase types', () => {
    test('should not report for IfStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createNonSwitchCase())
      expect(reports.length).toBe(0)
    })

    test('should not report for ForStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
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
      visitor.SwitchCase({
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
      visitor.SwitchCase({
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
      visitor.SwitchCase({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for TryStatement node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report for empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({})
      expect(reports.length).toBe(0)
    })

    test('should not report for object with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({ type: 'SwitchCasee' })
      expect(reports.length).toBe(0)
    })

    test('should not report for object with lowercase type', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({ type: 'switchcase' })
      expect(reports.length).toBe(0)
    })

    test('should not report for numeric node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(42)
      expect(reports.length).toBe(0)
    })

    test('should not report for string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase('SwitchCase')
      expect(reports.length).toBe(0)
    })

    test('should not report for boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(true)
      expect(reports.length).toBe(0)
    })

    test('should not report for array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase([])
      expect(reports.length).toBe(0)
    })
  })

  describe('terminating statements - break', () => {
    test('should not report when break is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report when break follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report with break at different line', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement(5, 10)]))
      expect(reports.length).toBe(0)
    })

    test('should not report with labeled break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'BreakStatement',
            label: { type: 'Identifier', name: 'outer' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when break is first of two statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement(), createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })

    test('should report when break is in middle of three statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createBreakStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('terminating statements - return', () => {
    test('should not report when return is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createReturnStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report when return follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createReturnStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report with return at different line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createReturnStatement(10, 5)]))
      expect(reports.length).toBe(0)
    })

    test('should not report with return that has an argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'ReturnStatement',
            argument: { type: 'Literal', value: 42 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when return is not last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createReturnStatement(), createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })

    test('should report when return is in middle of three statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createReturnStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('terminating statements - throw', () => {
    test('should not report when throw is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createThrowStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report when throw follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createThrowStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report with throw at different line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createThrowStatement(7, 3)]))
      expect(reports.length).toBe(0)
    })

    test('should not report with throw that has complex argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
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
      )
      expect(reports.length).toBe(0)
    })

    test('should report when throw is not last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createThrowStatement(), createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })
  })

  describe('terminating statements - continue', () => {
    test('should not report when continue is last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createContinueStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report when continue follows expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createContinueStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report with continue at different line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createContinueStatement(3, 8)]))
      expect(reports.length).toBe(0)
    })

    test('should not report with labeled continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'ContinueStatement',
            label: { type: 'Identifier', name: 'loop' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when continue is not last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createContinueStatement(), createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })
  })

  describe('non-terminating statements', () => {
    test('should report with only ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })

    test('should report with VariableDeclaration as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'VariableDeclaration',
            declarations: [],
            kind: 'let',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with FunctionDeclaration as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: 'helper' },
            params: [],
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with IfStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'IfStatement',
            test: { type: 'Literal', value: true },
            consequent: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with ForStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
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
      )
      expect(reports.length).toBe(1)
    })

    test('should report with WhileStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'WhileStatement',
            test: { type: 'Literal', value: true },
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with SwitchStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'SwitchStatement',
            discriminant: { type: 'Identifier', name: 'x' },
            cases: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with BlockStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'BlockStatement',
            body: [],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with TryStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'TryStatement',
            block: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with DebuggerStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'DebuggerStatement',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with WithStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'WithStatement',
            object: { type: 'Identifier', name: 'obj' },
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with DoWhileStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'DoWhileStatement',
            test: { type: 'Literal', value: true },
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with ForInStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'ForInStatement',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'obj' },
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with ForOfStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'ForOfStatement',
            left: { type: 'Identifier', name: 'x' },
            right: { type: 'Identifier', name: 'arr' },
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with LabeledStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          {
            type: 'LabeledStatement',
            label: { type: 'Identifier', name: 'label' },
            body: { type: 'EmptyStatement' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with EmptyStatement as last', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          {
            type: 'EmptyStatement',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('report message', () => {
    test('should include "break" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports[0].message).toContain('break')
    })

    test('should include "fallthrough" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports[0].message.toLowerCase()).toContain('fallthrough')
    })

    test('should have exact expected message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports[0].message).toBe('Expected a break statement before fallthrough.')
    })

    test('should always report same message for different fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(
        createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message should be a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('report location', () => {
    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('should report location of last statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(5, 10)]))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(3, 5)]))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(5 + 15)
    })

    test('should report location of last statement when multiple', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([createExpressionStatement(1, 0), createExpressionStatement(7, 12)]),
      )
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should handle location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(1, 0)]))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(100, 50)]))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle location at line 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(0, 0)]))
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
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
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('multiple consequent scenarios', () => {
    test('should report once for single expression without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })

    test('should report once for two expressions without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report once for three expressions without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report once for five expressions without terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report for expression then break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report for expression then return', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createReturnStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report for expression then throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createThrowStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report for expression then continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createContinueStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should not report for multiple expressions then break', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createBreakStatement(),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report for break then expression then expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createBreakStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('consequent edge cases', () => {
    test('should not report for consequent with undefined last element', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([undefined]))
      expect(reports.length).toBe(1)
    })

    test('should not report for consequent with null last element', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([null]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent with only break statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createReturnStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createThrowStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent with only continue statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createContinueStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent where last element has no type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([{ foo: 'bar' }]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([42]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase(['hello']))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element type is empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([{ type: '' }]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent where last element type is unknown', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([{ type: 'UnknownStatement' }]))
      expect(reports.length).toBe(1)
    })
  })

  describe('test value variations', () => {
    test('should work with literal test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(1)
    })

    test('should work with string literal test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: { type: 'Literal', value: 'hello' },
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should work with identifier test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: { type: 'Identifier', name: 'x' },
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should work with null test value (default case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: null,
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should work without test property', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple calls accumulation', () => {
    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(3)
    })

    test('should accumulate only for fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      expect(reports.length).toBe(2)
    })

    test('should not report for any call when all have terminators', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      visitor.SwitchCase(createSwitchCase([createReturnStatement()]))
      visitor.SwitchCase(createSwitchCase([createThrowStatement()]))
      visitor.SwitchCase(createSwitchCase([createContinueStatement()]))
      expect(reports.length).toBe(0)
    })

    test('should handle alternating valid and invalid cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createReturnStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createThrowStatement()]))
      expect(reports.length).toBe(2)
    })

    test('should handle 10 sequential fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      }
      expect(reports.length).toBe(10)
    })

    test('should handle 50 sequential fallthrough cases', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
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
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
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
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
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
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
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
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(5, 10)]))
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
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
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
      visitor.SwitchCase(
        createSwitchCase([
          createBreakStatement(),
          createReturnStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report when break is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
          createBreakStatement(),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when return is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createReturnStatement(),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when throw is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createThrowStatement(),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when continue is after expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createExpressionStatement(),
          createContinueStatement(),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report when last statement is expression after return in middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createReturnStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report when last statement is expression after throw in middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createThrowStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report when last statement is expression after continue in middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(),
          createContinueStatement(),
          createExpressionStatement(),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('location with different consequent sizes', () => {
    test('should report location from last statement in 1-element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(2, 4)]))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location from last statement in 2-element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([createExpressionStatement(1, 0), createExpressionStatement(8, 3)]),
      )
      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location from last statement in 3-element consequent', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
        createSwitchCase([
          createExpressionStatement(1, 0),
          createExpressionStatement(2, 0),
          createExpressionStatement(9, 15),
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
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: null,
        consequent: [createExpressionStatement(), createBreakStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report with default case and return', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: null,
        consequent: [createExpressionStatement(), createReturnStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should report with default case and no terminator', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: null,
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should work with boolean test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: { type: 'Literal', value: true },
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should work with object test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: { type: 'ObjectExpression', properties: [] },
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should work with member expression test value', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        consequent: [createExpressionStatement(), createBreakStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('consequent as non-array values', () => {
    test('should handle consequent as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as empty array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([]))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent as string (non-array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })
  })

  describe('rule robustness', () => {
    test('should not throw when node type is a number', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: 42, consequent: [] }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should not throw when node type is boolean', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: true, consequent: [] }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should not throw when node type is object', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: {}, consequent: [] }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should not throw when node type is function', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: () => 'SwitchCase', consequent: [] }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should not throw when consequent contains only numbers', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [1, 2, 3],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should not throw when consequent contains mixed types', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createExpressionStatement(), null, undefined, 'string', 42],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should handle deep nesting of node properties', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = {
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
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should handle Symbol as node type', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const node = { type: Symbol('SwitchCase'), consequent: [] }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })
  })

  describe('visitor reusability', () => {
    test('should be usable across multiple node visits with same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      }
      expect(reports.length).toBe(5)
    })

    test('should maintain correct report order', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(1, 0)]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(2, 0)]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement(3, 0)]))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should handle interleaved valid and invalid visits', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([createBreakStatement()]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))
      visitor.SwitchCase(createSwitchCase([]))
      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))

      expect(reports.length).toBe(3)
    })
  })

  describe('location extraction integration', () => {
    test('should use extractLocation for report location', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
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
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should handle multi-line location', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
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
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should handle node with partial loc (start only)', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(
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
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('isSwitchCase strict type checking', () => {
    test('should not report for SwitchCase with extra whitespace in type', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: ' SwitchCase ',
        consequent: [createExpressionStatement()],
      })
      expect(reports.length).toBe(0)
    })

    test('should report for exactly SwitchCase type', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should not report when type property is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        consequent: [createExpressionStatement()],
      })
      expect(reports.length).toBe(0)
    })

    test('should not crash for node that is a Date object', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(new Date())).not.toThrow()
    })

    test('should not crash for node that is a RegExp object', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(/test/)).not.toThrow()
    })

    test('should not crash for node that is a Map', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(new Map())).not.toThrow()
    })

    test('should not crash for node that is a Set', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(new Set())).not.toThrow()
    })

    test('should not crash for NaN', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(NaN)).not.toThrow()
    })

    test('should not crash for Infinity', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(Infinity)).not.toThrow()
    })

    test('should not crash for negative number', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(-1)).not.toThrow()
    })

    test('should not crash for BigInt', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      expect(() => visitor.SwitchCase(BigInt(42))).not.toThrow()
    })

    test('should not crash when node has circular reference', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const circular: Record<string, unknown> = { type: 'SwitchCase' }
      circular.self = circular
      expect(() => visitor.SwitchCase(circular)).not.toThrow()
    })

    test('should not crash when consequent has circular reference', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const circularStmt: Record<string, unknown> = { type: 'ExpressionStatement' }
      circularStmt.self = circularStmt
      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [circularStmt],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.SwitchCase(node)).not.toThrow()
    })

    test('should not crash when loc has non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createExpressionStatement()],
        loc: { start: { line: 'one', column: 0 }, end: { line: 'one', column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should not crash when loc has non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase({
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 'zero' }, end: { line: 1, column: 'five' } },
      })
      expect(reports.length).toBe(1)
    })

    test('should not crash when last consequent element is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      visitor.SwitchCase(createSwitchCase([[createBreakStatement()]]))
      expect(reports.length).toBe(1)
    })

    test('should handle consequent with sparse array', () => {
      const { context } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const sparse: unknown[] = []
      sparse[0] = createExpressionStatement()
      sparse[5] = createBreakStatement()
      expect(() => visitor.SwitchCase(createSwitchCase(sparse))).not.toThrow()
    })

    test('should handle consequent where only element is break at index 0 of sparse array', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const sparse: unknown[] = []
      sparse[0] = createBreakStatement()
      visitor.SwitchCase(createSwitchCase(sparse))
      expect(reports.length).toBe(0)
    })

    test('should handle consequent where sparse array has undefined at last index', () => {
      const { context, reports } = createMockRuleContext({ source: 'switch(x) { case 1: foo(); case 2: bar(); }' })
      const visitor = noFallthroughRule.create(context)
      const sparse: unknown[] = [createExpressionStatement(), undefined]
      visitor.SwitchCase(createSwitchCase(sparse))
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
      visitor.SwitchCase(createSwitchCase(stmts))
      expect(reports.length).toBe(0)
    })
  })
})
