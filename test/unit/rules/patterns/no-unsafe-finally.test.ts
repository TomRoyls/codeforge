import { describe, test, expect } from 'vitest'
import { noUnsafeFinallyRule } from '../../../../src/rules/patterns/no-unsafe-finally.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createTryWithReturnInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ReturnStatement',
          argument: null,
          loc: { start: { line, column }, end: { line, column: column + 7 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithThrowInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ThrowStatement',
          argument: { type: 'Identifier', name: 'e' },
          loc: { start: { line, column }, end: { line, column: column + 7 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithBreakInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'BreakStatement',
          label: null,
          loc: { start: { line, column }, end: { line, column: column + 5 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithContinueInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ContinueStatement',
          label: null,
          loc: { start: { line, column }, end: { line, column: column + 8 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithSafeFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 1 },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithoutFinally(): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: {
      type: 'CatchClause',
      body: { type: 'BlockStatement', body: [] },
    },
    finalizer: null,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
  }
}

function createNonTryStatement(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-unsafe-finally rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeFinallyRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeFinallyRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeFinallyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeFinallyRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention finally in description', () => {
      expect(noUnsafeFinallyRule.meta.docs?.description.toLowerCase()).toContain('finally')
    })

    test('should mention control flow in description', () => {
      expect(noUnsafeFinallyRule.meta.docs?.description.toLowerCase()).toContain('control flow')
    })

    test('should have a non-empty description', () => {
      expect(noUnsafeFinallyRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have string type for meta.type', () => {
      expect(typeof noUnsafeFinallyRule.meta.type).toBe('string')
    })

    test('should have string severity for meta.severity', () => {
      expect(typeof noUnsafeFinallyRule.meta.severity).toBe('string')
    })

    test('should have docs object', () => {
      expect(noUnsafeFinallyRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as string', () => {
      expect(typeof noUnsafeFinallyRule.meta.docs?.description).toBe('string')
    })

    test('should have valid rule type value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUnsafeFinallyRule.meta.type)
    })

    test('should have valid severity value', () => {
      expect(['off', 'warn', 'error']).toContain(noUnsafeFinallyRule.meta.severity)
    })

    test('should have schema property', () => {
      expect(noUnsafeFinallyRule.meta.schema).toBeDefined()
    })

    test('should have schema as empty array', () => {
      expect(noUnsafeFinallyRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUnsafeFinallyRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noUnsafeFinallyRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUnsafeFinallyRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnsafeFinallyRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have docs category as string', () => {
      expect(typeof noUnsafeFinallyRule.meta.docs?.category).toBe('string')
    })

    test('should have docs recommended as boolean', () => {
      expect(typeof noUnsafeFinallyRule.meta.docs?.recommended).toBe('boolean')
    })
  })

  describe('create', () => {
    test('should return visitor with TryStatement method', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(visitor).toHaveProperty('TryStatement')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return TryStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(typeof visitor.TryStatement).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor1 = noUnsafeFinallyRule.create(context)
      const visitor2 = noUnsafeFinallyRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should create visitor with independent report contexts', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor1 = noUnsafeFinallyRule.create(ctx1)
      const visitor2 = noUnsafeFinallyRule.create(ctx2)

      visitor1.TryStatement(createTryWithReturnInFinally())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('create should be a function on the rule', () => {
      expect(typeof noUnsafeFinallyRule.create).toBe('function')
    })

    test('should accept a valid RuleContext', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      expect(() => noUnsafeFinallyRule.create(context)).not.toThrow()
    })

    test('visitor should only have TryStatement key', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('TryStatement')
    })
  })

  describe('detecting unsafe control flow in finally', () => {
    test('should report return statement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('control flow')
      expect(reports[0].message).toContain('finally')
    })

    test('should report throw statement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally())

      expect(reports.length).toBe(1)
    })

    test('should report break statement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally())

      expect(reports.length).toBe(1)
    })

    test('should report continue statement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally())

      expect(reports.length).toBe(1)
    })

    test('should not report safe finally block', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithSafeFinally())

      expect(reports.length).toBe(0)
    })

    test('should not report try without finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithoutFinally())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report return at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report return at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report throw at specific location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally(7, 4))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report break at specific location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally(3, 12))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report continue at specific location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally(15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report unsafe control flow message for return', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports[0].message).toBe(
        "Unsafe use of control flow statement inside 'finally' block.",
      )
    })

    test('should report unsafe control flow message for throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally())

      expect(reports[0].message).toBe(
        "Unsafe use of control flow statement inside 'finally' block.",
      )
    })

    test('should report unsafe control flow message for break', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally())

      expect(reports[0].message).toBe(
        "Unsafe use of control flow statement inside 'finally' block.",
      )
    })

    test('should report unsafe control flow message for continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally())

      expect(reports[0].message).toBe(
        "Unsafe use of control flow statement inside 'finally' block.",
      )
    })

    test('should include end location in report for return', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(5, 10))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should include end location in report for throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally(3, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should include end location in report for break', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally(8, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should include end location in report for continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally(2, 4))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(2)
    })

    test('should detect return with argument value', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'Literal', value: 42 },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect throw with NewExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Error' },
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect break with label', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'BreakStatement',
              label: { type: 'Identifier', name: 'outerLabel' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect continue with label', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ContinueStatement',
              label: { type: 'Identifier', name: 'loopLabel' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple unsafe statements in finally', () => {
    test('should report each unsafe statement individually', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'e' },
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(2)
    })

    test('should report return and break in same finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 7 } },
            },
            {
              type: 'BreakStatement',
              label: null,
              loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 5 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(2)
    })

    test('should report return and continue in same finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
            {
              type: 'ContinueStatement',
              label: null,
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 8 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(2)
    })

    test('should report all four control flow types together', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'e' },
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
            },
            {
              type: 'BreakStatement',
              label: null,
              loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            },
            {
              type: 'ContinueStatement',
              label: null,
              loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 8 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(4)
    })

    test('should report correct locations for multiple unsafe statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 9 } },
            },
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'e' },
              loc: { start: { line: 6, column: 4 }, end: { line: 6, column: 11 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[1].loc?.start.line).toBe(6)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should mix safe and unsafe statements, reporting only unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: { type: 'Literal', value: 1 },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
            },
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
            },
            {
              type: 'VariableDeclaration',
              declarations: [],
              loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should report unsafe between multiple safe statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            {
              type: 'BreakStatement',
              label: null,
              loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 5 } },
            },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } },
            {
              type: 'ContinueStatement',
              label: null,
              loc: { start: { line: 8, column: 0 }, end: { line: 8, column: 8 } },
            },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 4 } },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(2)
    })

    test('should report three returns in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
            },
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(3)
    })

    test('should report five unsafe statements in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'e' },
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
            },
            {
              type: 'BreakStatement',
              label: null,
              loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            },
            {
              type: 'ContinueStatement',
              label: null,
              loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 8 } },
            },
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(5)
    })

    test('should report same message for each unsafe statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'e' },
              loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('safe statements in finally', () => {
    test('should not report ExpressionStatement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithSafeFinally())

      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'VariableDeclaration',
              declarations: [],
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'FunctionDeclaration',
              id: { type: 'Identifier', name: 'fn' },
              params: [],
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report IfStatement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ForStatement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForStatement',
              init: null,
              test: null,
              update: null,
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report WhileStatement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ForInStatement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForInStatement',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report SwitchStatement in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'SwitchStatement',
              discriminant: { type: 'Identifier', name: 'x' },
              cases: [],
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty finally block', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report BlockStatement type as unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'BlockStatement', body: [] }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement (nested) in finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'TryStatement',
              block: { type: 'BlockStatement', body: [] },
              handler: null,
              finalizer: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(undefined)).not.toThrow()
    })

    test('should handle non-TryStatement gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(createNonTryStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without finalizer', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = { type: 'TryStatement', block: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = createTryWithReturnInFinally() as Record<string, unknown>
      delete node.loc
      const finalizer = node.finalizer as Record<string, unknown>
      const body = finalizer.body as unknown[]
      delete (body[0] as Record<string, unknown>).loc

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement('try')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer as non-block (string)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: 'not a block',
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: 42,
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: null,
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer with non-array body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: 'not an array',
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle finalizer body with null entry', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: [null],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle finalizer body with undefined entry', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: [undefined],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle finalizer body with string entry', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: ['return;'],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle finalizer body with number entry', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: [42],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle statement without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: [{ someProp: 'value' }],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle statement with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 123 }],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle node with type as number instead of string', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = { type: 42 }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with block as non-object', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: 'not a block',
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle undefined type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = { type: undefined }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 } },
            },
          ],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { end: { line: 1, column: 7 } },
            },
          ],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '7' } },
            },
          ],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with null line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: null, column: null }, end: { line: null, column: null } },
            },
          ],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle zero column location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(99999, 0))

      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(1, 999))

      expect(reports[0].loc?.start.column).toBe(999)
    })
  })

  describe('try with catch and finally', () => {
    test('should detect return in finally with catchClause present', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: { type: 'BlockStatement', body: [] },
        },
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect throw in finally with catchClause present', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'err' },
          body: { type: 'BlockStatement', body: [] },
        },
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'err' },
              loc: { start: { line: 6, column: 0 }, end: { line: 6, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect break in finally with catchClause present', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          body: { type: 'BlockStatement', body: [] },
        },
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'BreakStatement',
              label: null,
              loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect continue in finally with catchClause present', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          body: { type: 'BlockStatement', body: [] },
        },
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ContinueStatement',
              label: null,
              loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 8 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when only catch exists without finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithoutFinally())

      expect(reports.length).toBe(0)
    })

    test('should handle try with handler and no finalizer', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: null,
                loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 7 } },
              },
            ],
          },
        },
        finalizer: null,
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report unsafe in finally regardless of try block content', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
          ],
        },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting details', () => {
    test('should report loc start object with line and column for return', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(3, 8))

      expect(reports[0].loc?.start).toEqual({ line: 3, column: 8 })
    })

    test('should report loc end object for return', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report loc start for throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally(4, 2))

      expect(reports[0].loc?.start).toEqual({ line: 4, column: 2 })
    })

    test('should report loc end for throw', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally(4, 2))

      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('should report loc start for break', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally(6, 1))

      expect(reports[0].loc?.start).toEqual({ line: 6, column: 1 })
    })

    test('should report loc end for break', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally(6, 1))

      expect(reports[0].loc?.end.line).toBe(6)
      expect(reports[0].loc?.end.column).toBe(6)
    })

    test('should report loc start for continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally(7, 3))

      expect(reports[0].loc?.start).toEqual({ line: 7, column: 3 })
    })

    test('should report loc end for continue', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally(7, 3))

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('should use statement location not try statement location', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 100, column: 50 }, end: { line: 100, column: 57 } },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 100, column: 57 } },
      }

      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })
  })

  describe('message content', () => {
    test('should contain word Unsafe in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports[0].message).toContain('Unsafe')
    })

    test('should contain word finally in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports[0].message).toContain('finally')
    })

    test('should contain word control flow in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally())

      expect(reports[0].message).toContain('control flow')
    })

    test('should contain word statement in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally())

      expect(reports[0].message).toContain('statement')
    })

    test('should contain word block in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally())

      expect(reports[0].message).toContain('block')
    })

    test('should have consistent message across all control flow types', () => {
      const expectedMessage = "Unsafe use of control flow statement inside 'finally' block."

      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      noUnsafeFinallyRule.create(ctx1).TryStatement(createTryWithReturnInFinally())

      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      noUnsafeFinallyRule.create(ctx2).TryStatement(createTryWithThrowInFinally())

      const { context: ctx3, reports: r3 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      noUnsafeFinallyRule.create(ctx3).TryStatement(createTryWithBreakInFinally())

      const { context: ctx4, reports: r4 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      noUnsafeFinallyRule.create(ctx4).TryStatement(createTryWithContinueInFinally())

      expect(r1[0].message).toBe(expectedMessage)
      expect(r2[0].message).toBe(expectedMessage)
      expect(r3[0].message).toBe(expectedMessage)
      expect(r4[0].message).toBe(expectedMessage)
    })

    test('message should start with Unsafe', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports[0].message.startsWith('Unsafe')).toBe(true)
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  describe('repeated invocations', () => {
    test('should report each invocation of TryStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())
      visitor.TryStatement(createTryWithThrowInFinally())

      expect(reports.length).toBe(2)
    })

    test('should report across multiple safe and unsafe nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithSafeFinally())
      visitor.TryStatement(createTryWithReturnInFinally())
      visitor.TryStatement(createTryWithSafeFinally())
      visitor.TryStatement(createTryWithBreakInFinally())
      visitor.TryStatement(createTryWithoutFinally())

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.TryStatement(createTryWithReturnInFinally())
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating safe and unsafe calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())
      visitor.TryStatement(createTryWithSafeFinally())
      visitor.TryStatement(createTryWithThrowInFinally())
      visitor.TryStatement(createTryWithoutFinally())

      expect(reports.length).toBe(2)
    })

    test('should not carry state between visitor instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor1 = noUnsafeFinallyRule.create(ctx1)

      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor2 = noUnsafeFinallyRule.create(ctx2)

      visitor1.TryStatement(createTryWithReturnInFinally())
      visitor2.TryStatement(createTryWithSafeFinally())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('handler variations', () => {
    test('should handle TryStatement with null handler and unsafe finally', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle TryStatement with undefined handler', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: undefined,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'e' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle handler with catch body containing control flow', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: null,
                loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 7 } },
              },
            ],
          },
        },
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: { type: 'Literal', value: 1 },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('export verification', () => {
    test('should export noUnsafeFinallyRule as named export', () => {
      expect(noUnsafeFinallyRule).toBeDefined()
    })

    test('should export object with meta property', () => {
      expect(noUnsafeFinallyRule).toHaveProperty('meta')
    })

    test('should export object with create property', () => {
      expect(noUnsafeFinallyRule).toHaveProperty('create')
    })

    test('should export meta as object', () => {
      expect(typeof noUnsafeFinallyRule.meta).toBe('object')
    })

    test('should export create as function', () => {
      expect(typeof noUnsafeFinallyRule.create).toBe('function')
    })

    test('should be a valid RuleDefinition', () => {
      expect(noUnsafeFinallyRule.meta).toBeDefined()
      expect(noUnsafeFinallyRule.create).toBeDefined()
      expect(typeof noUnsafeFinallyRule.create).toBe('function')
    })
  })

  describe('visitor does not crash on unexpected inputs', () => {
    test('should handle Date object as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Map as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(new Map())).not.toThrow()
    })

    test('should handle Set as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(new Set())).not.toThrow()
    })

    test('should handle deeply nested object without finalizer', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [
            {
              type: 'TryStatement',
              block: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'TryStatement',
                    block: { type: 'BlockStatement', body: [] },
                    handler: null,
                    finalizer: null,
                  },
                ],
              },
              handler: null,
              finalizer: null,
            },
          ],
        },
        handler: null,
        finalizer: null,
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Infinity as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(Infinity)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle negative zero as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(-0)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('finalizer type variations', () => {
    test('should handle finalizer that is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: [],
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer that is a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: true,
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer with type that is not BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 1 },
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle finalizer with undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
          ],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
    })

    test('should handle finalizer with empty string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        finalizer: {
          type: '',
          body: [],
        },
      }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('control flow statement type variations', () => {
    test('should detect ReturnStatement with lowercase type match', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not detect returnstatement (wrong case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'returnstatement' }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should detect ThrowStatement exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'ThrowStatement', argument: null }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect BreakStatement exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'BreakStatement', label: null }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect ContinueStatement exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'ContinueStatement', label: null }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not detect LabeledStatement as control flow', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'LabeledStatement',
              label: { type: 'Identifier', name: 'label' },
              body: { type: 'EmptyStatement' },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect DebuggerStatement as control flow', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'DebuggerStatement' }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect EmptyStatement as control flow', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'EmptyStatement' }],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect WithStatement as control flow', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WithStatement',
              object: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location defaults when loc is missing', () => {
    test('should use default line 1 when stmt has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
      }

      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null, loc: undefined }],
        },
      }

      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default location when loc is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null, loc: null }],
        },
      }

      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default location when loc.start is missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: {}, end: {} },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('docs url', () => {
    test('should not have docs url by default', () => {
      expect(noUnsafeFinallyRule.meta.docs?.url).toBeUndefined()
    })
  })

  describe('block variations', () => {
    test('should handle try block with complex body', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [
            { type: 'VariableDeclaration', declarations: [] },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle finalizer with DoWhileStatement (safe)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'DoWhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle finalizer with ForOfStatement (safe)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForOfStatement',
              left: { type: 'Identifier', name: 'x' },
              right: { type: 'Identifier', name: 'arr' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle finalizer with ClassDeclaration (safe)', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ClassDeclaration',
              id: { type: 'Identifier', name: 'Foo' },
              body: { type: 'ClassBody', body: [] },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should detect return in finally of try-catch-finally with code in all blocks', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'try' } }],
        },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'catch' } },
            ],
          },
        },
        finalizer: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'cleanup' } },
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 20, column: 4 }, end: { line: 20, column: 11 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(20)
    })

    test('should handle finalizer with mixed ExpressionStatements and control flow', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'cleanup' },
                arguments: [],
              },
            },
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'log' },
                arguments: [],
              },
            },
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'err' },
              loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 7 } },
            },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'end' } },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should handle try with finalizer body containing only safe statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: { type: 'CatchClause', body: { type: 'BlockStatement', body: [] } },
        finalizer: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
            { type: 'ExpressionStatement', expression: { type: 'Literal', value: 3 } },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('return statement argument variations', () => {
    test('should detect return with CallExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'getValue' },
                arguments: [],
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with ObjectExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'ObjectExpression', properties: [] },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'ArrowFunctionExpression',
                params: [],
                body: { type: 'BlockStatement', body: [] },
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with BinaryExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Literal', value: 1 },
                right: { type: 'Literal', value: 2 },
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with ConditionalExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'ConditionalExpression',
                test: { type: 'Literal', value: true },
                consequent: { type: 'Literal', value: 1 },
                alternate: { type: 'Literal', value: 2 },
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('throw statement argument variations', () => {
    test('should detect throw with NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Error' },
                arguments: [{ type: 'Literal', value: 'fail' }],
              },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect throw with Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: { type: 'Identifier', name: 'customError' },
              loc: { start: { line: 2, column: 3 }, end: { line: 2, column: 10 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should detect throw with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('break and continue with various labels', () => {
    test('should detect break with single character label', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'BreakStatement',
              label: { type: 'Identifier', name: 'x' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect continue with long label name', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ContinueStatement',
              label: { type: 'Identifier', name: 'veryLongDescriptiveLoopLabelName' },
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect break with underscore label', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'BreakStatement',
              label: { type: 'Identifier', name: '_private_label' },
              loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 15 } },
            },
          ],
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('consecutive safe finally blocks', () => {
    test('should report 0 for multiple safe finally blocks', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.TryStatement(createTryWithSafeFinally())
      }

      expect(reports.length).toBe(0)
    })

    test('should report 0 for multiple try-without-finally blocks', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.TryStatement(createTryWithoutFinally())
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('rule idempotency', () => {
    test('should produce same result when called twice with same node', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'try {} finally { return; }' })

      const visitor1 = noUnsafeFinallyRule.create(ctx1)
      const visitor2 = noUnsafeFinallyRule.create(ctx2)

      const node = createTryWithReturnInFinally(5, 3)

      visitor1.TryStatement(node)
      visitor2.TryStatement(node)

      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
      expect(r1[0].loc?.start.line).toBe(r2[0].loc?.start.line)
      expect(r1[0].loc?.start.column).toBe(r2[0].loc?.start.column)
    })

    test('should not mutate the input node', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = createTryWithReturnInFinally()
      const originalType = (node as Record<string, unknown>).type

      visitor.TryStatement(node)

      expect((node as Record<string, unknown>).type).toBe(originalType)
    })

    test('should not mutate the finalizer', () => {
      const { context } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = createTryWithReturnInFinally() as Record<string, unknown>
      const finalizer = node.finalizer as Record<string, unknown>
      const originalBodyLength = (finalizer.body as unknown[]).length

      visitor.TryStatement(node)

      expect((finalizer.body as unknown[]).length).toBe(originalBodyLength)
    })
  })

  describe('stress tests', () => {
    test('should handle finalizer with 20 safe statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const body = Array.from({ length: 20 }, () => ({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
      }))

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: { type: 'BlockStatement', body },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle finalizer with 20 unsafe statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const body = Array.from({ length: 20 }, (_, i) => ({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 7 } },
      }))

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: { type: 'BlockStatement', body },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(20)
    })

    test('should handle finalizer with 10 safe and 10 unsafe alternating', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const body = Array.from({ length: 20 }, (_, i) => {
        if (i % 2 === 0) {
          return { type: 'ExpressionStatement', expression: { type: 'Literal', value: i } }
        }
        return {
          type: 'ReturnStatement',
          argument: null,
          loc: { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 7 } },
        }
      })

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: { type: 'BlockStatement', body },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(10)
    })

    test('should handle calling visitor with 50 different nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) {
          visitor.TryStatement(createTryWithReturnInFinally(i + 1, 0))
        } else if (i % 3 === 1) {
          visitor.TryStatement(createTryWithSafeFinally())
        } else {
          visitor.TryStatement(createTryWithoutFinally())
        }
      }

      expect(reports.length).toBe(17)
    })

    test('should handle alternating control flow types in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())
      visitor.TryStatement(createTryWithThrowInFinally())
      visitor.TryStatement(createTryWithBreakInFinally())
      visitor.TryStatement(createTryWithContinueInFinally())
      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports.length).toBe(5)
    })

    test('should handle mixed control flow across many invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const generators = [
        createTryWithReturnInFinally,
        createTryWithThrowInFinally,
        createTryWithBreakInFinally,
        createTryWithContinueInFinally,
        createTryWithSafeFinally,
        createTryWithoutFinally,
      ]

      for (let i = 0; i < 30; i++) {
        const gen = generators[i % generators.length]
        visitor.TryStatement(gen(i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should report for single unsafe statement in large safe block', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const body: unknown[] = Array.from({ length: 50 }, (_, i) => ({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: i },
      }))
      body[25] = {
        type: 'ThrowStatement',
        argument: { type: 'Identifier', name: 'err' },
        loc: { start: { line: 26, column: 0 }, end: { line: 26, column: 7 } },
      }

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: { type: 'BlockStatement', body },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(26)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = createTryWithReturnInFinally() as Record<string, unknown>
      node.extraProp = 'value'
      node.numericProp = 42

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle finalizer with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
      const visitor = noUnsafeFinallyRule.create(context)

      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: null,
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
              extraProp: true,
            },
          ],
          extraProp: 'finalizer',
        },
      }

      visitor.TryStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle all four control flow types in separate visitors', () => {
      const types = ['ReturnStatement', 'ThrowStatement', 'BreakStatement', 'ContinueStatement']

      types.forEach((stmtType) => {
        const { context, reports } = createMockRuleContext({ source: 'try {} finally { return; }' })
        const visitor = noUnsafeFinallyRule.create(context)

        const node = {
          type: 'TryStatement',
          block: { type: 'BlockStatement', body: [] },
          handler: null,
          finalizer: {
            type: 'BlockStatement',
            body: [
              {
                type: stmtType,
                argument: null,
                label: null,
                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
              },
            ],
          },
        }

        visitor.TryStatement(node)
        expect(reports.length).toBe(1)
      })
    })
  })
})
