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

  describe('flags x == true variations', () => {
    test('flags call expression == true', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('==', callExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags member expression == true', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('==', memberExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags unary expression == true', () => {
      const unaryExpr = { type: 'UnaryExpression', operator: '!', argument: id('x') }
      const reports = runRule(createComparison('==', unaryExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags x != true variations', () => {
    test('flags call expression != true', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('!=', callExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags member expression != true', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('!=', memberExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags x == false variations', () => {
    test('flags call expression == false', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('==', callExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags member expression == false', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('==', memberExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags x != false variations', () => {
    test('flags call expression != false', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('!=', callExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags member expression != false', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('!=', memberExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags reversed comparisons with == and !=', () => {
    test('flags true == identifier', () => {
      const reports = runRule(createComparison('==', boolLit(true), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags false == identifier', () => {
      const reports = runRule(createComparison('==', boolLit(false), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags true != identifier', () => {
      const reports = runRule(createComparison('!=', boolLit(true), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags false != identifier', () => {
      const reports = runRule(createComparison('!=', boolLit(false), id('x')))
      expect(reports).toHaveLength(1)
    })

    test('flags true == call expression', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('==', boolLit(true), callExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags false == call expression', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('==', boolLit(false), callExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags true != member expression', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('!=', boolLit(true), memberExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags false != member expression', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('!=', boolLit(false), memberExpr))
      expect(reports).toHaveLength(1)
    })
  })

  describe('message format for === true', () => {
    test('message mentions removing comparison for === true', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true)))
      expect(reports[0].message).toContain('===')
      expect(reports[0].message).toContain('true')
      expect(reports[0].message).toContain('directly')
    })
  })

  describe('message format for !== true', () => {
    test('message mentions negation for !== true', () => {
      const reports = runRule(createComparison('!==', id('x'), boolLit(true)))
      expect(reports[0].message).toContain('negation')
      expect(reports[0].message).toContain('!==')
    })
  })

  describe('message format for === false', () => {
    test('message mentions negation for === false', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(false)))
      expect(reports[0].message).toContain('negation')
      expect(reports[0].message).toContain('false')
    })
  })

  describe('message format for !== false', () => {
    test('message mentions directly for !== false', () => {
      const reports = runRule(createComparison('!==', id('x'), boolLit(false)))
      expect(reports[0].message).toContain('directly')
      expect(reports[0].message).toContain('!==')
    })
  })

  describe('location reporting', () => {
    test('reports correct start line for line 3', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true), 3, 0))
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('reports correct start column for column 5', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true), 1, 5))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports correct start line for line 10 column 20', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true), 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports correct start line for line 100', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true), 100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('reports correct start line for line 1 column 0', () => {
      const reports = runRule(createComparison('===', id('x'), boolLit(true), 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('non-boolean literals are ignored', () => {
    test('does NOT flag x === "true" (string)', () => {
      const reports = runRule(createComparison('===', id('x'), { type: 'Literal', value: 'true' }))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x === 1', () => {
      const reports = runRule(createComparison('===', id('x'), numLit(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x === 0', () => {
      const reports = runRule(createComparison('===', id('x'), numLit(0)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x === null', () => {
      const reports = runRule(createComparison('===', id('x'), { type: 'Literal', value: null }))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x === undefined', () => {
      const reports = runRule(createComparison('===', id('x'), { type: 'Identifier', name: 'undefined' }))
      expect(reports).toHaveLength(0)
    })
  })

  describe('does not flag other operators', () => {
    test('does NOT flag x <= true', () => {
      const reports = runRule(createComparison('<=', id('x'), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x >= true', () => {
      const reports = runRule(createComparison('>=', id('x'), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x in obj', () => {
      const reports = runRule(createComparison('in', id('x'), id('obj')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x ** 2', () => {
      const reports = runRule(createComparison('**', id('x'), numLit(2)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x | y', () => {
      const reports = runRule(createComparison('|', id('x'), id('y')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x & y', () => {
      const reports = runRule(createComparison('&', id('x'), id('y')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x ^ y', () => {
      const reports = runRule(createComparison('^', id('x'), id('y')))
      expect(reports).toHaveLength(0)
    })
  })

  describe('does not flag both sides boolean', () => {
    test('does NOT flag true == true', () => {
      const reports = runRule(createComparison('==', boolLit(true), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag true == false', () => {
      const reports = runRule(createComparison('==', boolLit(true), boolLit(false)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag false != true', () => {
      const reports = runRule(createComparison('!=', boolLit(false), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag false != false', () => {
      const reports = runRule(createComparison('!=', boolLit(false), boolLit(false)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag false !== true', () => {
      const reports = runRule(createComparison('!==', boolLit(false), boolLit(true)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag true !== false', () => {
      const reports = runRule(createComparison('!==', boolLit(true), boolLit(false)))
      expect(reports).toHaveLength(0)
    })
  })

  describe('complex expression patterns', () => {
    test('flags binary expression === true', () => {
      const binExpr = { type: 'BinaryExpression', operator: '>', left: id('a'), right: id('b') }
      const reports = runRule(createComparison('===', binExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags logical expression === false', () => {
      const logExpr = { type: 'LogicalExpression', operator: '&&', left: id('a'), right: id('b') }
      const reports = runRule(createComparison('===', logExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags conditional expression == true', () => {
      const condExpr = { type: 'ConditionalExpression', test: id('a'), consequent: id('b'), alternate: id('c') }
      const reports = runRule(createComparison('==', condExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags array expression !== true', () => {
      const arrExpr = { type: 'ArrayExpression', elements: [] }
      const reports = runRule(createComparison('!==', arrExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags object expression == false', () => {
      const objExpr = { type: 'ObjectExpression', properties: [] }
      const reports = runRule(createComparison('==', objExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags function expression != false', () => {
      const fnExpr = { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }
      const reports = runRule(createComparison('!=', fnExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags arrow function === true', () => {
      const arrowExpr = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }
      const reports = runRule(createComparison('===', arrowExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })

    test('flags new expression !== false', () => {
      const newExpr = { type: 'NewExpression', callee: id('MyClass'), arguments: [] }
      const reports = runRule(createComparison('!==', newExpr, boolLit(false)))
      expect(reports).toHaveLength(1)
    })

    test('flags typeof expression == true', () => {
      const typeofExpr = { type: 'UnaryExpression', operator: 'typeof', argument: id('x') }
      const reports = runRule(createComparison('==', typeofExpr, boolLit(true)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('reversed complex expressions', () => {
    test('flags true === call expression', () => {
      const callExpr = { type: 'CallExpression', callee: id('fn'), arguments: [] }
      const reports = runRule(createComparison('===', boolLit(true), callExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags false === member expression', () => {
      const memberExpr = { type: 'MemberExpression', object: id('obj'), property: id('flag'), computed: false }
      const reports = runRule(createComparison('===', boolLit(false), memberExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags true !== binary expression', () => {
      const binExpr = { type: 'BinaryExpression', operator: '>', left: id('a'), right: id('b') }
      const reports = runRule(createComparison('!==', boolLit(true), binExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags false == logical expression', () => {
      const logExpr = { type: 'LogicalExpression', operator: '||', left: id('a'), right: id('b') }
      const reports = runRule(createComparison('==', boolLit(false), logExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags true != unary expression', () => {
      const unaryExpr = { type: 'UnaryExpression', operator: '!', argument: id('x') }
      const reports = runRule(createComparison('!=', boolLit(true), unaryExpr))
      expect(reports).toHaveLength(1)
    })

    test('flags false !== typeof expression', () => {
      const typeofExpr = { type: 'UnaryExpression', operator: 'typeof', argument: id('x') }
      const reports = runRule(createComparison('!==', boolLit(false), typeofExpr))
      expect(reports).toHaveLength(1)
    })
  })

  describe('additional valid cases', () => {
    test('does NOT flag x === y with both identifiers', () => {
      const reports = runRule(createComparison('===', id('a'), id('b')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag a > b', () => {
      const reports = runRule(createComparison('>', id('a'), id('b')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag a < b', () => {
      const reports = runRule(createComparison('<', id('a'), id('b')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag a >= b', () => {
      const reports = runRule(createComparison('>=', id('a'), id('b')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag a + b', () => {
      const reports = runRule(createComparison('+', id('a'), id('b')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag a - b', () => {
      const reports = runRule(createComparison('-', id('a'), id('b')))
      expect(reports).toHaveLength(0)
    })
  })
})
