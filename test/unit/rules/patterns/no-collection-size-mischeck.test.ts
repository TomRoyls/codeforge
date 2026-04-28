import { describe, test, expect } from 'vitest'
import { noCollectionSizeMischeckRule } from '../../../../src/rules/patterns/no-collection-size-mischeck.js'
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

function member(name: string, prop: string): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name },
    property: { type: 'Identifier', name: prop },
    computed: false,
    optional: false,
  }
}

function neg(num: number): unknown {
  return {
    type: 'UnaryExpression',
    operator: '-',
    argument: { type: 'Literal', value: num },
    prefix: true,
  }
}

function lit(num: number): unknown {
  return { type: 'Literal', value: num }
}

function runRule(node: unknown): ReportDescriptor[] {
  const { context, reports } = createMockRuleContext()
  const visitor = noCollectionSizeMischeckRule.create(context as RuleContext)
  if (visitor.BinaryExpression) {
    visitor.BinaryExpression(node)
  }
  return reports
}

describe('no-collection-size-mischeck', () => {
  test('has correct category', () => {
    expect(noCollectionSizeMischeckRule.meta.docs?.category).toBe('patterns')
  })

  test('has description', () => {
    expect(noCollectionSizeMischeckRule.meta.docs?.description).toBeDefined()
  })

  test('is not recommended', () => {
    expect(noCollectionSizeMischeckRule.meta.docs?.recommended).toBe(false)
  })

  test('has problem type', () => {
    expect(noCollectionSizeMischeckRule.meta.type).toBe('problem')
  })

  test('has error severity', () => {
    expect(noCollectionSizeMischeckRule.meta.severity).toBe('error')
  })

  describe('flags .length < negative', () => {
    test('flags arr.length < -1', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('non-negative')
    })

    test('flags arr.length <= -1', () => {
      const reports = runRule(createComparison('<=', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length > -1', () => {
      const reports = runRule(createComparison('>', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain('true')
    })

    test('flags arr.length >= -1', () => {
      const reports = runRule(createComparison('>=', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length === -1', () => {
      const reports = runRule(createComparison('===', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length == -1', () => {
      const reports = runRule(createComparison('==', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length !== -1', () => {
      const reports = runRule(createComparison('!==', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length != -1', () => {
      const reports = runRule(createComparison('!=', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags .size < negative', () => {
    test('flags map.size < -1', () => {
      const reports = runRule(createComparison('<', member('map', 'size'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags set.size > -5', () => {
      const reports = runRule(createComparison('>', member('set', 'size'), neg(5)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags negative < .length', () => {
    test('flags -1 < arr.length', () => {
      const reports = runRule(createComparison('<', neg(1), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -1 <= arr.length', () => {
      const reports = runRule(createComparison('<=', neg(1), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -1 > arr.length', () => {
      const reports = runRule(createComparison('>', neg(1), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })
  })

  describe('does NOT flag valid comparisons', () => {
    test('does NOT flag arr.length > 0', () => {
      const reports = runRule(createComparison('>', member('arr', 'length'), lit(0)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length === 0', () => {
      const reports = runRule(createComparison('===', member('arr', 'length'), lit(0)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length < 10', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), lit(10)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag x > -1 (not a size property)', () => {
      const reports = runRule(createComparison('>', { type: 'Identifier', name: 'x' }, neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length < arr2.length', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), member('arr2', 'length')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag computed property access arr["length"] < -1', () => {
      const computedMember = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Literal', value: 'length' },
        computed: true,
        optional: false,
      }
      const reports = runRule(createComparison('<', computedMember, neg(1)))
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

    test('does NOT flag plus operator', () => {
      const reports = runRule(createComparison('+', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag -0 as negative', () => {
      const zeroNode = {
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Literal', value: 0 },
        prefix: true,
      }
      const reports = runRule(createComparison('<', member('arr', 'length'), zeroNode))
      expect(reports).toHaveLength(0)
    })

    test('reports correct location', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1), 5, 10))
      expect(reports[0].loc).toBeDefined()
    })

    test('does NOT flag .name < -1', () => {
      const reports = runRule(createComparison('<', member('arr', 'name'), neg(1)))
      expect(reports).toHaveLength(0)
    })
  })

  describe('visitor', () => {
    test('has BinaryExpression visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noCollectionSizeMischeckRule.create(context as RuleContext)
      expect(typeof visitor.BinaryExpression).toBe('function')
    })
  })
})
