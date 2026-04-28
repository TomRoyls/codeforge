import { describe, test, expect } from 'vitest'
import { noRedundantBooleanRule } from '../../../../src/rules/patterns/no-redundant-boolean.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createComparison(op: string, left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: op,
    left,
    right,
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function id(name: string): unknown {
  return { type: 'Identifier', name }
}

function boolLit(value: boolean): unknown {
  return { type: 'Literal', value }
}

function numLit(value: number): unknown {
  return { type: 'Literal', value }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noRedundantBooleanRule.create(context as RuleContext)
  if (visitor.BinaryExpression) {
    visitor.BinaryExpression(node)
  }
  return reports
}

describe('no-redundant-boolean', () => {
  test('has correct category', () => {
    expect(noRedundantBooleanRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noRedundantBooleanRule.meta.docs?.description).toBeDefined()
  })

  test('is not recommended', () => {
    expect(noRedundantBooleanRule.meta.docs?.recommended).toBe(false)
  })

  test('has suggestion type', () => {
    expect(noRedundantBooleanRule.meta.type).toBe('suggestion')
  })

  test('has suggestion severity', () => {
    expect(noRedundantBooleanRule.meta.severity).toBe('warn')
  })

  describe('flags x === true', () => {
    test('flags identifier === true', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('true')
    })

    test('flags identifier == true', () => {
      const reports = runRule(createComparison('==', id('x'), boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags identifier !== true', () => {
      const reports = runRule(createComparison('!==', id('x'), boolLit(true)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('negation')
    })

    test('flags identifier != true', () => {
      const reports = runRule(createComparison('!=', id('x'), boolLit(true)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags x === false', () => {
    test('flags identifier === false', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags identifier == false', () => {
      const reports = runRule(createComparison('==', id('x'), boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags identifier !== false', () => {
      const reports = runRule(createComparison('!==', id('x'), boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags identifier != false', () => {
      const reports = runRule(createComparison('!=', id('x'), boolLit(false)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags true === x (reversed)', () => {
    test('flags true === identifier', () => {
      const reports = runRule(createComparison('===', boolLit(true), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags false === identifier', () => {
      const reports = runRule(createComparison('===', boolLit(false), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags true !== identifier', () => {
      const reports = runRule(createComparison('!==', boolLit(true), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags false !== identifier', () => {
      const reports = runRule(createComparison('!==', boolLit(false), id('x')))
      expect(reports).toHaveLength(1)
    })
  })

  describe('does NOT flag valid comparisons', () => {
    test('does NOT flag x === y', () => {
      const reports = runRule(createComparison('===', id('x'), id('y')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x === 5', () => {
      const reports = runRule(createComparison('===', id('x'), numLit(5)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x > 5', () => {
      const reports = runRule(createComparison('>', id('x'), numLit(5)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag true === true', () => {
      const reports = runRule(createComparison('===', boolLit(true), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag false === false', () => {
      const reports = runRule(createComparison('===', boolLit(false), boolLit(false)))
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('does NOT flag null node', () => {
      const reports = runRule(null)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag non-BinaryExpression', () => {
      const reports = runRule({ type: 'Identifier', name: 'x', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } } })
      expect(reports).toHaveLength(0)
    })

    test('reports correct location', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true), 5, 10))
      expect(reports[0].loc).toBeDefined()
    })

    test('does NOT flag + operator', () => {
      const reports = runRule(createComparison('+', id('x'), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag < operator', () => {
      const reports = runRule(createComparison('<', id('x'), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag instanceof', () => {
      const reports = runRule(createComparison('instanceof', id('x'), id('Array')))
      expect(reports).toHaveLength(0)
    })

    test('flags complex expression === true', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('===', callExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags member expression === false', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('===', memberExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('visitor', () => {
    test('has BinaryExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noRedundantBooleanRule.create(context as RuleContext)
      expect(typeof visitor.BinaryExpression).toBe('function')
    })
  })
})
