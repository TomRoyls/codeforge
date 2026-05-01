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

  describe('.size additional contexts', () => {
    test('flags .size in logical AND', () => {
      const reports = runRule(createMemberInLogicalAnd('size'))
      expect(reports).toHaveLength(1)
    })

    test('flags .size in while-loop', () => {
      const reports = runRule(createMemberInWhile('size'))
      expect(reports).toHaveLength(1)
    })

    test('flags .size in do-while', () => {
      const reports = runRule(createMemberInDoWhile('size'))
      expect(reports).toHaveLength(1)
    })

    test('flags .size in for-loop', () => {
      const reports = runRule(createMemberInFor('size'))
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag .size in comparison', () => {
      const reports = runRule(createMemberInComparison('size'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .size in assignment', () => {
      const reports = runRule(createMemberNotInBooleanContext('size'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .size in double negation', () => {
      const reports = runRule(createDoubleNegation('size'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('.count additional contexts', () => {
    test('flags .count in ternary', () => {
      const reports = runRule(createMemberInConditional('count'))
      expect(reports).toHaveLength(1)
    })

    test('flags .count in logical AND', () => {
      const reports = runRule(createMemberInLogicalAnd('count'))
      expect(reports).toHaveLength(1)
    })

    test('flags .count in while-loop', () => {
      const reports = runRule(createMemberInWhile('count'))
      expect(reports).toHaveLength(1)
    })

    test('flags .count in do-while', () => {
      const reports = runRule(createMemberInDoWhile('count'))
      expect(reports).toHaveLength(1)
    })

    test('flags .count in for-loop', () => {
      const reports = runRule(createMemberInFor('count'))
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag .count in comparison', () => {
      const reports = runRule(createMemberInComparison('count'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .count in assignment', () => {
      const reports = runRule(createMemberNotInBooleanContext('count'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .count in double negation', () => {
      const reports = runRule(createDoubleNegation('count'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('logical expressions with different operators', () => {
    test('flags .length in logical OR', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Literal', value: null },
          right: { type: 'Literal', value: true },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(1)
    })

    test('flags .length in nullish coalescing', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'LogicalExpression',
          operator: '??',
          left: { type: 'Literal', value: null },
          right: { type: 'Literal', value: true },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(1)
    })

    test('flags .size in logical OR', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'set' },
        property: { type: 'Identifier', name: 'size' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Literal', value: null },
          right: { type: 'Literal', value: true },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(1)
    })

    test('flags .count in nullish coalescing', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'list' },
        property: { type: 'Identifier', name: 'count' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'LogicalExpression',
          operator: '??',
          left: { type: 'Literal', value: null },
          right: { type: 'Literal', value: true },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(1)
    })
  })

  describe('negation variations', () => {
    test('flags .size with single negation', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 's' },
        property: { type: 'Identifier', name: 'size' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 's' },
            property: { type: 'Identifier', name: 'size' },
            computed: false,
          },
          parent: { type: 'IfStatement' },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('flags .count with single negation', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'c' },
        property: { type: 'Identifier', name: 'count' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'c' },
            property: { type: 'Identifier', name: 'count' },
            computed: false,
          },
          parent: { type: 'IfStatement' },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })

    test('does NOT flag .size double negation', () => {
      const reports = runRule(createDoubleNegation('size'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .count double negation', () => {
      const reports = runRule(createDoubleNegation('count'))
      expect(reports).toHaveLength(0)
    })

    test('flags .length in single negation via helper', () => {
      const reports = runRule(createMemberInNegation('length'))
      expect(reports).toHaveLength(1)
    })
  })

  describe('non-tracked properties', () => {
    test('does NOT flag .name in if-statement', () => {
      const reports = runRule(createMemberInIf('name'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .type in if-statement', () => {
      const reports = runRule(createMemberInIf('type'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .value in if-statement', () => {
      const reports = runRule(createMemberInIf('value'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .id in if-statement', () => {
      const reports = runRule(createMemberInIf('id'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .key in ternary', () => {
      const reports = runRule(createMemberInConditional('key'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .indexOf in if-statement', () => {
      const reports = runRule(createMemberInIf('indexOf'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .push in while-loop', () => {
      const reports = runRule(createMemberInWhile('push'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .map in logical AND', () => {
      const reports = runRule(createMemberInLogicalAnd('map'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .filter in do-while', () => {
      const reports = runRule(createMemberInDoWhile('filter'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .forEach in for-loop', () => {
      const reports = runRule(createMemberInFor('forEach'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('computed member access', () => {
    test('does NOT flag computed .length', () => {
      const reports = runRule(createComputedMember('length'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag computed .size', () => {
      const reports = runRule(createComputedMember('size'))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag computed .count', () => {
      const reports = runRule(createComputedMember('count'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('non-boolean parent contexts', () => {
    test('does NOT flag .length in return statement', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'ReturnStatement',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .length in call expression', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .length in binary expression minus', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node = {
        ...member,
        parent: {
          type: 'BinaryExpression',
          operator: '-',
          left: member,
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag .length in switch case', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'SwitchCase',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(0)
    })
  })

  describe('message format', () => {
    test('.length message mentions explicit comparisons', () => {
      const reports = runRule(createMemberInIf('length'))
      const msg = reports[0].message
      expect(msg).toContain('.length')
      expect(msg).toContain('> 0')
      expect(msg).toContain('!== 0')
    })

    test('.size message mentions explicit comparisons', () => {
      const reports = runRule(createMemberInIf('size'))
      const msg = reports[0].message
      expect(msg).toContain('.size')
      expect(msg).toContain('> 0')
      expect(msg).toContain('!== 0')
    })

    test('.count message mentions explicit comparisons', () => {
      const reports = runRule(createMemberInIf('count'))
      const msg = reports[0].message
      expect(msg).toContain('.count')
      expect(msg).toContain('> 0')
      expect(msg).toContain('!== 0')
    })

    test('message includes utility property name', () => {
      const reports = runRule(createMemberInIf('length'))
      expect(reports[0].message).toMatch(/\.length/)
    })
  })

  describe('location reporting', () => {
    test('reports correct start line', () => {
      const reports = runRule(createMemberInIf('length', 3, 5))
      expect(reports[0].loc.start.line).toBe(3)
    })

    test('reports correct start column', () => {
      const reports = runRule(createMemberInIf('length', 1, 8))
      expect(reports[0].loc.start.column).toBe(8)
    })

    test('.size reports location', () => {
      const reports = runRule(createMemberInIf('size', 10, 2))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc.start.line).toBe(10)
    })

    test('.count reports location', () => {
      const reports = runRule(createMemberInIf('count', 7, 0))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc.start.line).toBe(7)
    })
  })

  describe('additional edge cases', () => {
    test('does NOT flag empty object', () => {
      const reports = runRule({})
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag number node', () => {
      const reports = runRule(42)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag array node', () => {
      const reports = runRule([])
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag MemberExpression with non-Identifier property', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Literal', value: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'IfStatement',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag node with empty loc', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: {},
        parent: {
          type: 'IfStatement',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(member)
      expect(reports).toHaveLength(1)
    })
  })

  describe('.length in all boolean contexts', () => {
    test('flags .length in conditional expression', () => {
      const reports = runRule(createMemberInConditional('length'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('.length')
    })

    test('flags .length in logical AND expression', () => {
      const reports = runRule(createMemberInLogicalAnd('length'))
      expect(reports).toHaveLength(1)
    })

    test('flags .length in single negation', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'items' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        parent: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'items' },
            property: { type: 'Identifier', name: 'length' },
            computed: false,
          },
          parent: { type: 'CallExpression' },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('unary expressions non-negation', () => {
    test('does NOT flag typeof operator', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node = {
        ...member,
        parent: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: member,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag void operator', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node = {
        ...member,
        parent: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: member,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag delete operator', () => {
      const member = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Identifier', name: 'length' },
        computed: false,
        optional: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      const node = {
        ...member,
        parent: {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: member,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        },
      }
      const reports = runRule(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('meta properties', () => {
    test('is not fixable', () => {
      expect(noUtilityTruthinessRule.meta.fixable).toBeUndefined()
    })

    test('has empty schema', () => {
      expect(noUtilityTruthinessRule.meta.schema).toEqual([])
    })

    test('has docs url', () => {
      expect(noUtilityTruthinessRule.meta.docs?.url).toBeDefined()
    })

    test('docs category is patterns', () => {
      expect(noUtilityTruthinessRule.meta.docs?.category).toBe('patterns')
    })

    test('type is suggestion', () => {
      expect(noUtilityTruthinessRule.meta.type).toBe('suggestion')
    })

    test('severity is warn', () => {
      expect(noUtilityTruthinessRule.meta.severity).toBe('warn')
    })
  })
})
