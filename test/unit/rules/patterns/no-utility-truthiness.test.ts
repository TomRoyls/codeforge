import { describe, test, expect } from 'vitest'
import { noUtilityTruthinessRule } from '../../../../src/rules/patterns/no-utility-truthiness.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createMemberInIf(propName: string, line = 1, column = 0): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + propName.length + 5 },
    },
  }
  return {
    ...member,
    parent: {
      type: 'IfStatement',
      test: member,
      consequent: { type: 'BlockStatement', body: [] },
      loc: { start: { line, column: 0 }, end: { line, column: 40 } },
    },
  }
}

function createMemberInConditional(propName: string, line = 1, column = 0): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + propName.length + 5 },
    },
  }
  return {
    ...member,
    parent: {
      type: 'ConditionalExpression',
      test: member,
      consequent: { type: 'Literal', value: 1 },
      alternate: { type: 'Literal', value: 0 },
      loc: { start: { line, column: 0 }, end: { line, column: 40 } },
    },
  }
}

function createMemberInLogicalAnd(propName: string, line = 1, column = 0): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'data' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + propName.length + 6 },
    },
  }
  return {
    ...member,
    parent: {
      type: 'LogicalExpression',
      operator: '&&',
      left: member,
      right: { type: 'Literal', value: true },
      loc: { start: { line, column: 0 }, end: { line, column: 40 } },
    },
  }
}

function createMemberInWhile(propName: string, line = 1, column = 0): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'q' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: {
      start: { line, column },
      end: { line, column: column + propName.length + 3 },
    },
  }
  return {
    ...member,
    parent: {
      type: 'WhileStatement',
      test: member,
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line, column: 0 }, end: { line, column: 40 } },
    },
  }
}

function createMemberNotInBooleanContext(propName: string): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    parent: {
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'x' },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
}

function createMemberInComparison(propName: string): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
  return {
    ...member,
    parent: {
      type: 'BinaryExpression',
      operator: '>',
      left: member,
      right: { type: 'Literal', value: 0 },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    },
  }
}

function createMemberInNegation(propName: string): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 14 } },
  }
  return {
    ...member,
    parent: {
      type: 'UnaryExpression',
      operator: '!',
      argument: member,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
    },
  }
}

function createDoubleNegation(propName: string): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 15 } },
  }
  const innerNeg = {
    type: 'UnaryExpression',
    operator: '!',
    argument: member,
    loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 16 } },
  }
  return {
    ...member,
    parent: {
      type: 'UnaryExpression',
      operator: '!',
      argument: innerNeg,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 17 } },
    },
  }
}

function createMemberInDoWhile(propName: string): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'q' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
  return {
    ...member,
    parent: {
      type: 'DoWhileStatement',
      test: member,
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    },
  }
}

function createMemberInFor(propName: string): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Identifier', name: propName },
    computed: false,
    optional: false,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
  return {
    ...member,
    parent: {
      type: 'ForStatement',
      test: member,
      init: null,
      update: null,
      body: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    },
  }
}

function createComputedMember(propName: string): unknown {
  const member = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'arr' },
    property: { type: 'Literal', value: propName },
    computed: true,
    optional: false,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
  return {
    ...member,
    parent: {
      type: 'IfStatement',
      test: member,
      consequent: { type: 'BlockStatement', body: [] },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    },
  }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noUtilityTruthinessRule.create(context as RuleContext)
  if (visitor.MemberExpression) {
    visitor.MemberExpression(node)
  }
  return reports
}

describe('no-utility-truthiness', () => {
  test('has correct category', () => {
    expect(noUtilityTruthinessRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noUtilityTruthinessRule.meta.docs?.description).toBeDefined()
  })

  test('is not recommended', () => {
    expect(noUtilityTruthinessRule.meta.docs?.recommended).toBe(false)
  })

  test('has suggestion type', () => {
    expect(noUtilityTruthinessRule.meta.type).toBe('suggestion')
  })

  test('has warn severity', () => {
    expect(noUtilityTruthinessRule.meta.severity).toBe('warn')
  })

  describe('.length', () => {
    test('flags .length in if-statement', () => {
      const reports = runRule(createMemberInIf('length'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('.length')
    })

    test('flags .length in ternary', () => {
      const reports = runRule(createMemberInConditional('length'))
      expect(reports).toHaveLength(1)
    })

    test('flags .length in logical AND', () => {
      const reports = runRule(createMemberInLogicalAnd('length'))
      expect(reports).toHaveLength(1)
    })

    test('flags .length in while-loop', () => {
      const reports = runRule(createMemberInWhile('length'))
      expect(reports).toHaveLength(1)
    })

    test('flags .length in do-while', () => {
      const reports = runRule(createMemberInDoWhile('length'))
      expect(reports).toHaveLength(1)
    })

    test('flags .length in for-loop', () => {
      const reports = runRule(createMemberInFor('length'))
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag .length in comparison', () => {
      const reports = runRule(createMemberInComparison('length'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .length in assignment', () => {
      const reports = runRule(createMemberNotInBooleanContext('length'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('.size', () => {
    test('flags .size in if-statement', () => {
      const reports = runRule(createMemberInIf('size'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('.size')
    })

    test('flags .size in ternary', () => {
      const reports = runRule(createMemberInConditional('size'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('.count', () => {
    test('flags .count in if-statement', () => {
      const reports = runRule(createMemberInIf('count'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('.count')
    })
  })

  describe('negation', () => {
    test('flags .length with single negation in if', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          parent: {
            type: 'IfStatement',
          },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag double negation (intentional boolean cast)', () => {
      const reports = runRule(createDoubleNegation('length'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('non-boolean contexts', () => {
    test('does NOT flag regular property in assignment', () => {
      const reports = runRule(createMemberNotInBooleanContext('length'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag other properties', () => {
      const reports = runRule(createMemberInIf('name'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag computed member access', () => {
      const reports = runRule(createComputedMember('length'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    test('does NOT flag null node', () => {
      const reports = runRule(null)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag undefined node', () => {
      const reports = runRule(undefined)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag string node', () => {
      const reports = runRule('not-a-node')
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node without parent', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag non-MemberExpression', () => {
      const node = {
        type: 'Identifier',
        name: 'length',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('suggests explicit comparison', () => {
      const reports = runRule(createMemberInIf('length'))
      expect(reports[0].message).toContain('> 0')
      expect(reports[0].message).toContain('!== 0')
    })

    test('reports location', () => {
      const reports = runRule(createMemberInIf('length', 5, 10))
      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('visitor', () => {
    test('has MemberExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noUtilityTruthinessRule.create(context as RuleContext)
      expect(typeof visitor.MemberExpression).toBe('function')
    })
  })
})
