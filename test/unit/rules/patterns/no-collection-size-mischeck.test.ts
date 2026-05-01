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

  describe('flags .length with various negatives', () => {
    test('flags arr.length < -2', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(2)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length < -10', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(10)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length < -100', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(100)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length > -2', () => {
      const reports = runRule(createComparison('>', member('arr', 'length'), neg(2)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length >= -2', () => {
      const reports = runRule(createComparison('>=', member('arr', 'length'), neg(2)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length <= -2', () => {
      const reports = runRule(createComparison('<=', member('arr', 'length'), neg(2)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length === -2', () => {
      const reports = runRule(createComparison('===', member('arr', 'length'), neg(2)))
      expect(reports).toHaveLength(1)
    })

    test('flags arr.length !== -2', () => {
      const reports = runRule(createComparison('!==', member('arr', 'length'), neg(2)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags .size with various negatives', () => {
    test('flags map.size < -2', () => {
      const reports = runRule(createComparison('<', member('map', 'size'), neg(2)))
      expect(reports).toHaveLength(1)
    })

    test('flags map.size <= -10', () => {
      const reports = runRule(createComparison('<=', member('map', 'size'), neg(10)))
      expect(reports).toHaveLength(1)
    })

    test('flags map.size >= -1', () => {
      const reports = runRule(createComparison('>=', member('map', 'size'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags map.size === -5', () => {
      const reports = runRule(createComparison('===', member('map', 'size'), neg(5)))
      expect(reports).toHaveLength(1)
    })

    test('flags map.size == -5', () => {
      const reports = runRule(createComparison('==', member('map', 'size'), neg(5)))
      expect(reports).toHaveLength(1)
    })

    test('flags map.size !== -5', () => {
      const reports = runRule(createComparison('!==', member('map', 'size'), neg(5)))
      expect(reports).toHaveLength(1)
    })

    test('flags map.size != -5', () => {
      const reports = runRule(createComparison('!=', member('map', 'size'), neg(5)))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags reversed negative < .size', () => {
    test('flags -1 < map.size', () => {
      const reports = runRule(createComparison('<', neg(1), member('map', 'size')))
      expect(reports).toHaveLength(1)
    })

    test('flags -1 <= map.size', () => {
      const reports = runRule(createComparison('<=', neg(1), member('map', 'size')))
      expect(reports).toHaveLength(1)
    })

    test('flags -1 > map.size', () => {
      const reports = runRule(createComparison('>', neg(1), member('map', 'size')))
      expect(reports).toHaveLength(1)
    })

    test('flags -1 >= map.size', () => {
      const reports = runRule(createComparison('>=', neg(1), member('map', 'size')))
      expect(reports).toHaveLength(1)
    })

    test('flags -5 < set.size', () => {
      const reports = runRule(createComparison('<', neg(5), member('set', 'size')))
      expect(reports).toHaveLength(1)
    })
  })

  describe('flags reversed negative with .length', () => {
    test('flags -5 > arr.length', () => {
      const reports = runRule(createComparison('>', neg(5), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -5 >= arr.length', () => {
      const reports = runRule(createComparison('>=', neg(5), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -10 === arr.length', () => {
      const reports = runRule(createComparison('===', neg(10), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -10 == arr.length', () => {
      const reports = runRule(createComparison('==', neg(10), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -10 !== arr.length', () => {
      const reports = runRule(createComparison('!==', neg(10), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })

    test('flags -10 != arr.length', () => {
      const reports = runRule(createComparison('!=', neg(10), member('arr', 'length')))
      expect(reports).toHaveLength(1)
    })
  })

  describe('message content', () => {
    test('message for .length < -1 mentions non-negative', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1)))
      expect(reports[0].message).toContain('non-negative')
    })

    test('message for .length > -1 mentions always true', () => {
      const reports = runRule(createComparison('>', member('arr', 'length'), neg(1)))
      expect(reports[0].message).toContain('true')
    })

    test('message for .length === -1 mentions always false', () => {
      const reports = runRule(createComparison('===', member('arr', 'length'), neg(1)))
      expect(reports[0].message).toContain('false')
    })

    test('message for -1 > .length mentions non-negative', () => {
      const reports = runRule(createComparison('>', neg(1), member('arr', 'length')))
      expect(reports[0].message).toContain('non-negative')
    })

    test('message for -1 < .length mentions always true', () => {
      const reports = runRule(createComparison('<', neg(1), member('arr', 'length')))
      expect(reports[0].message).toContain('true')
    })

    test('message for -1 === .length mentions always false', () => {
      const reports = runRule(createComparison('===', neg(1), member('arr', 'length')))
      expect(reports[0].message).toContain('false')
    })

    test('message for .size !== -1 mentions always true', () => {
      const reports = runRule(createComparison('!==', member('map', 'size'), neg(1)))
      expect(reports[0].message).toContain('true')
    })

    test('message for .size === -1 mentions always false', () => {
      const reports = runRule(createComparison('===', member('map', 'size'), neg(1)))
      expect(reports[0].message).toContain('false')
    })
  })

  describe('location reporting', () => {
    test('reports correct location line 3', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1), 3, 0))
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('reports correct location column 5', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1), 1, 5))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports correct location line 10 column 20', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1), 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('reports correct location line 100', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), neg(1), 100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('reports correct location for reversed comparison', () => {
      const reports = runRule(createComparison('<', neg(1), member('arr', 'length'), 7, 3))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('does NOT flag other non-size properties', () => {
    test('does NOT flag obj.count < -1', () => {
      const reports = runRule(createComparison('<', member('obj', 'count'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag obj.index < -1', () => {
      const reports = runRule(createComparison('<', member('obj', 'index'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag obj.value < -1', () => {
      const reports = runRule(createComparison('<', member('obj', 'value'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag obj.pos < -1', () => {
      const reports = runRule(createComparison('<', member('obj', 'pos'), neg(1)))
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag non-comparison operators', () => {
    test('does NOT flag arr.length + -1', () => {
      const reports = runRule(createComparison('+', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length - -1', () => {
      const reports = runRule(createComparison('-', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length * -1', () => {
      const reports = runRule(createComparison('*', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length / -1', () => {
      const reports = runRule(createComparison('/', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length % -1', () => {
      const reports = runRule(createComparison('%', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length | -1', () => {
      const reports = runRule(createComparison('|', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length & -1', () => {
      const reports = runRule(createComparison('&', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length ^ -1', () => {
      const reports = runRule(createComparison('^', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length ** -1', () => {
      const reports = runRule(createComparison('**', member('arr', 'length'), neg(1)))
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag both sides size property', () => {
    test('does NOT flag arr.length < arr2.length', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), member('arr2', 'length')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag map.size < set.size', () => {
      const reports = runRule(createComparison('<', member('map', 'size'), member('set', 'size')))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length > arr2.length', () => {
      const reports = runRule(createComparison('>', member('arr', 'length'), member('arr2', 'length')))
      expect(reports).toHaveLength(0)
    })
  })

  describe('does NOT flag positive numbers', () => {
    test('does NOT flag arr.length < 1', () => {
      const reports = runRule(createComparison('<', member('arr', 'length'), lit(1)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length > 0', () => {
      const reports = runRule(createComparison('>', member('arr', 'length'), lit(0)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length >= 0', () => {
      const reports = runRule(createComparison('>=', member('arr', 'length'), lit(0)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length <= 5', () => {
      const reports = runRule(createComparison('<=', member('arr', 'length'), lit(5)))
      expect(reports).toHaveLength(0)
    })

    test('does NOT flag arr.length === 0', () => {
      const reports = runRule(createComparison('===', member('arr', 'length'), lit(0)))
      expect(reports).toHaveLength(0)
    })
  })

  describe('various object names', () => {
    test('flags items.length < -1', () => {
      const reports = runRule(createComparison('<', member('items', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags data.length < -1', () => {
      const reports = runRule(createComparison('<', member('data', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags buffer.length < -1', () => {
      const reports = runRule(createComparison('<', member('buffer', 'length'), neg(1)))
      expect(reports).toHaveLength(1)
    })

    test('flags cache.size < -1', () => {
      const reports = runRule(createComparison('<', member('cache', 'size'), neg(1)))
      expect(reports).toHaveLength(1)
    })
  })
})
