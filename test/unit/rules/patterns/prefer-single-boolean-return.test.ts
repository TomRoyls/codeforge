import { describe, test, expect } from 'vitest'
import { preferSingleBooleanReturnRule } from '../../../../src/rules/patterns/prefer-single-boolean-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIfElseReturn(
  testExpr: unknown,
  consValue: boolean,
  altValue: boolean,
  line = 1,
  column = 0,
): unknown {
  const ifNode = {
    type: 'IfStatement',
    test: testExpr,
    consequent: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: consValue } }],
    },
    alternate: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: altValue } }],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
  return ifNode
}

function createIfWithoutElse(testExpr: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testExpr,
    consequent: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
    },
    alternate: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createIfElseMultiStatement(testExpr: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testExpr,
    consequent: {
      type: 'BlockStatement',
      body: [
        { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'log' } },
        { type: 'ReturnStatement', argument: { type: 'Literal', value: true } },
      ],
    },
    alternate: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 50 },
    },
  }
}

function createIfElseNonReturn(testExpr: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testExpr,
    consequent: {
      type: 'BlockStatement',
      body: [{ type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } }],
    },
    alternate: {
      type: 'BlockStatement',
      body: [{ type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } }],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createIfElseReturnNonBoolean(testExpr: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testExpr,
    consequent: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
    },
    alternate: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 0 } }],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createNegatedIfElse(testExpr: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testExpr,
    consequent: {
      type: 'BlockStatement',
      body: [{
        type: 'ReturnStatement',
        argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: true } },
      }],
    },
    alternate: {
      type: 'BlockStatement',
      body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = preferSingleBooleanReturnRule.create(context as RuleContext)
  if (visitor.IfStatement) {
    visitor.IfStatement(node)
  }
  return reports
}

const id = (name: string) => ({ type: 'Identifier', name })

describe('prefer-single-boolean-return', () => {
  test('has correct category', () => {
    expect(preferSingleBooleanReturnRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(preferSingleBooleanReturnRule.meta.docs?.description).toBeDefined()
  })

  test('is not recommended', () => {
    expect(preferSingleBooleanReturnRule.meta.docs?.recommended).toBe(false)
  })

  test('has suggestion type', () => {
    expect(preferSingleBooleanReturnRule.meta.type).toBe('suggestion')
  })

  test('has suggestion severity', () => {
    expect(preferSingleBooleanReturnRule.meta.severity).toBe('warn')
  })

  describe('flags if-else returning true/false', () => {
    test('flags if (x) return true; else return false;', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false))
      expect(reports).toHaveLength(1)
    })

    test('message suggests direct return', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false))
      expect(reports[0].message).toContain('return')
    })

    test('flags if (x) return false; else return true;', () => {
      const reports = runRule(createIfElseReturn(id('x'), false, true))
      expect(reports).toHaveLength(1)
    })

    test('negated case message mentions negation', () => {
      const reports = runRule(createIfElseReturn(id('x'), false, true))
      expect(reports[0].message).toContain('!')
    })

    test('flags with complex test expression', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'BinaryExpression', operator: '>', left: id('a'), right: id('b') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('reports correct location', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false, 5, 10))
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('does NOT flag non-matching patterns', () => {
    test('does NOT flag if without else', () => {
      const reports = runRule(createIfWithoutElse(id('x')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if-else with multiple statements', () => {
      const reports = runRule(createIfElseMultiStatement(id('x')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if-else with non-return bodies', () => {
      const reports = runRule(createIfElseNonReturn(id('x')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if-else returning non-boolean', () => {
      const reports = runRule(createIfElseReturnNonBoolean(id('x')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if-else returning same boolean', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, true))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if-else returning false/false', () => {
      const reports = runRule(createIfElseReturn(id('x'), false, false))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag null node', () => {
      const reports = runRule(null)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag undefined node', () => {
      const reports = runRule(undefined)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag non-IfStatement type', () => {
      const reports = runRule({ type: 'ForStatement', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })
  })

  describe('negated boolean patterns via unary !', () => {
    test('flags return !true / return true pattern', () => {
      const reports = runRule(createNegatedIfElse(id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags return true / return !true pattern', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: true } },
          }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    test('does NOT flag if-else with empty consequent', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: { type: 'BlockStatement', body: [] },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if-else with empty alternate', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if with string literal returns', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 'yes' } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 'no' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('handles IfStatement with undefined test', () => {
      const node = {
        type: 'IfStatement',
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('visitor', () => {
    test('has IfStatement visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = preferSingleBooleanReturnRule.create(context as RuleContext)
      expect(typeof visitor.IfStatement).toBe('function')
    })
  })
})
