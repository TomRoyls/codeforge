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

  describe('negated return patterns - return !x / return !!x', () => {
    test('flags if-else with return !true / return !!true', () => {
      const node = {
        type: 'IfStatement',
        test: id('isValid'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: true } },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: true } },
            },
          }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('return')
    })

    test('flags if-else with return !!true / return false (double negation)', () => {
      const node = {
        type: 'IfStatement',
        test: id('flag'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: true } },
            },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('flags if-else with return false / return !false', () => {
      const node = {
        type: 'IfStatement',
        test: id('cond'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: false } },
          }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('!')
    })

    test('flags if-else with return !!false / return true', () => {
      const node = {
        type: 'IfStatement',
        test: id('cond'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: false } },
            },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('does NOT flag ternary operators', () => {
    test('does NOT flag ConditionalExpression (ternary)', () => {
      const node = {
        type: 'ConditionalExpression',
        test: id('x'),
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag switch statements', () => {
    test('does NOT flag SwitchStatement with boolean returns', () => {
      const node = {
        type: 'SwitchStatement',
        discriminant: id('x'),
        cases: [
          { type: 'SwitchCase', test: { type: 'Literal', value: 1 }, consequent: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }] },
          { type: 'SwitchCase', test: null, consequent: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag if without else', () => {
    test('does NOT flag if-else-if chain without final else', () => {
      const node = {
        type: 'IfStatement',
        test: id('a'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'IfStatement',
          test: id('b'),
          consequent: {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
          },
          alternate: null,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag if-else with multiple statements in branches', () => {
    test('does NOT flag when consequent has 2 statements', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: id('log') },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: true } },
          ],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag when alternate has 2 statements', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: id('log') },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: false } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag when both branches have 3 statements each', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: id('a') },
            { type: 'ExpressionStatement', expression: id('b') },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: true } },
          ],
        },
        alternate: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: id('c') },
            { type: 'ExpressionStatement', expression: id('d') },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: false } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag if-else returning non-boolean', () => {
    test('does NOT flag return 1 / return 0', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 0 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return "yes" / return "no"', () => {
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

    test('does NOT flag return null / return undefined', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: null } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'undefined' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag deeply nested if-else that does not match exact pattern', () => {
    test('does NOT flag nested if with only consequent having boolean return', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'IfStatement',
            test: id('y'),
            consequent: {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
            },
            alternate: {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
            },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('if-else with return true/return false in various forms', () => {
    test('flags with logical AND condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'LogicalExpression', operator: '&&', left: id('a'), right: id('b') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with logical OR condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'LogicalExpression', operator: '||', left: id('a'), right: id('b') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with unary NOT condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'UnaryExpression', operator: '!', argument: id('x') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with call expression condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'CallExpression', callee: id('fn'), arguments: [] },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with member expression condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'MemberExpression', object: id('obj'), property: id('prop'), computed: false },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with ternary condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'ConditionalExpression', test: id('a'), consequent: id('b'), alternate: id('c') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })
  })

  describe('arrow function return patterns', () => {
    test('flags if-else returning true/false inside arrow function body', () => {
      const ifNode = createIfElseReturn(id('x'), true, false)
      const reports = runRule(ifNode)
      expect(reports).toHaveLength(1)
    })

    test('flags if-else returning false/true inside arrow function body', () => {
      const ifNode = createIfElseReturn(id('x'), false, true)
      const reports = runRule(ifNode)
      expect(reports).toHaveLength(1)
    })
  })

  describe('method return patterns', () => {
    test('flags if-else returning true/false in method context', () => {
      const reports = runRule(createIfElseReturn(id('this.active'), true, false))
      expect(reports).toHaveLength(1)
    })

    test('flags if-else with this.property condition', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'MemberExpression', object: id('this'), property: id('visible'), computed: false },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })
  })

  describe('function expression return patterns', () => {
    test('flags if-else returning true/false in function expression', () => {
      const reports = runRule(createIfElseReturn(id('val'), true, false))
      expect(reports).toHaveLength(1)
    })
  })

  describe('inline if-else (no block, single return statement)', () => {
    test('flags if-else where consequent is a bare ReturnStatement', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: { type: 'ReturnStatement', argument: { type: 'Literal', value: true } },
        alternate: { type: 'ReturnStatement', argument: { type: 'Literal', value: false } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('flags if-else where consequent is bare and alternate is block', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: { type: 'ReturnStatement', argument: { type: 'Literal', value: true } },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('flags if-else where consequent is block and alternate is bare ReturnStatement', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: { type: 'ReturnStatement', argument: { type: 'Literal', value: false } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('if-else in nested functions', () => {
    test('flags if-else that could appear inside a nested function', () => {
      const reports = runRule(createIfElseReturn(id('inner'), true, false, 3, 4))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('mixed return types (should NOT report)', () => {
    test('does NOT flag return true / return 42', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return 0 / return false', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 0 } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return true / return identifier', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: id('result') }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return identifier / return false', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: id('result') }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('if-else where one branch has return and other does not', () => {
    test('does NOT flag if consequent has return and alternate has assignment', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if consequent has assignment and alternate has return', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'AssignmentExpression' } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('multi-line if-else', () => {
    test('flags multi-line if-else with boolean returns', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false, 10, 5))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('flags multi-line if-else spanning many lines', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 5, column: 2 }, end: { line: 15, column: 3 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(15)
    })
  })

  describe('if-else with comments (comments ignored, structure matters)', () => {
    test('flags if-else that would have comments - structure still matches', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false))
      expect(reports).toHaveLength(1)
    })
  })

  describe('complex conditions in if statement', () => {
    test('flags with chained binary expressions', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'BinaryExpression', operator: '===', left: id('a'), right: id('b') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with typeof check', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'BinaryExpression', operator: '===', left: { type: 'UnaryExpression', operator: 'typeof', argument: id('x') }, right: { type: 'Literal', value: 'string' } },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with instanceof check', () => {
      const reports = runRule(createIfElseReturn(
        { type: 'BinaryExpression', operator: 'instanceof', left: id('obj'), right: id('Array') },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })

    test('flags with grouped logical expressions', () => {
      const reports = runRule(createIfElseReturn(
        {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'BinaryExpression', operator: '>', left: id('x'), right: { type: 'Literal', value: 0 } },
          right: { type: 'BinaryExpression', operator: '<', left: id('x'), right: { type: 'Literal', value: 100 } },
        },
        true,
        false,
      ))
      expect(reports).toHaveLength(1)
    })
  })

  describe('location reporting', () => {
    test('reports location at column 0', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false, 1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports location at non-zero column', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false, 3, 8))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports location at deep nesting', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false, 50, 12))
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  describe('message content', () => {
    test('truthy/falsy message suggests direct return', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false))
      expect(reports[0].message).toContain("return <condition>")
    })

    test('falsy/truthy message mentions negation', () => {
      const reports = runRule(createIfElseReturn(id('x'), false, true))
      expect(reports[0].message).toContain("return !<condition>")
    })

    test('message says Unexpected', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message mentions boolean', () => {
      const reports = runRule(createIfElseReturn(id('x'), true, false))
      expect(reports[0].message).toContain('boolean')
    })
  })

  describe('does NOT flag same-boolean returns', () => {
    test('does NOT flag return true / return true', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return false / return false', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('return without argument', () => {
    test('does NOT flag return / return false', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return true / return void', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag non-unary operators', () => {
    test('does NOT flag return -true / return false', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: true } },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return +false / return true', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '+', argument: { type: 'Literal', value: false } },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return ~true / return false', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '~', argument: { type: 'Literal', value: true } },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('meta properties', () => {
    test('has url in docs', () => {
      expect(preferSingleBooleanReturnRule.meta.docs?.url).toBeDefined()
    })

    test('fixable is undefined', () => {
      expect(preferSingleBooleanReturnRule.meta.fixable).toBeUndefined()
    })

    test('schema is empty array', () => {
      expect(preferSingleBooleanReturnRule.meta.schema).toEqual([])
    })
  })

  describe('ExpressionStatement bodies', () => {
    test('does NOT flag if consequent is ExpressionStatement', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: { type: 'ExpressionStatement', expression: id('doSomething') },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag if alternate is ExpressionStatement', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: { type: 'ExpressionStatement', expression: id('doSomething') },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('if-else with consequent alternate swapped', () => {
    test('flags when false branch is consequent and true is alternate', () => {
      const reports = runRule(createIfElseReturn(id('flag'), false, true))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('negated')
    })

    test('does NOT flag when both branches return via unary negation to same truthiness', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: {
                type: 'UnaryExpression',
                operator: '!',
                argument: { type: 'Literal', value: true },
              },
            },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: {
                type: 'UnaryExpression',
                operator: '!',
                argument: { type: 'Literal', value: true },
              },
            },
          }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag if-else with throw in branch', () => {
    test('does NOT flag when consequent is ThrowStatement', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ThrowStatement', argument: id('err') }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag when alternate is ThrowStatement', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ThrowStatement', argument: id('err') }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag when both branches throw', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ThrowStatement', argument: id('err1') }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ThrowStatement', argument: id('err2') }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('negation patterns with mixed unary and literal', () => {
    test('does NOT flag return !true / return false (!true is falsy, false is falsy)', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: true } },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag return !false / return true (!false is truthy, true is truthy)', () => {
      const node = {
        type: 'IfStatement',
        test: id('x'),
        consequent: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'UnaryExpression', operator: '!', argument: { type: 'Literal', value: false } },
          }],
        },
        alternate: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })
})
