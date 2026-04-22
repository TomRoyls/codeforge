import { noIteratorRule } from '../../../../src/rules/patterns/no-iterator.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createMemberExpression(propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Identifier',
      name: propertyName,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMemberExpressionWithLiteralProperty(
  propertyValue: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Literal',
      value: propertyValue,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createAssignmentExpression(propertyName: string, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: propertyName,
      },
    },
    right: {
      type: 'FunctionExpression',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createAssignmentExpressionWithLiteral(
  propertyValue: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    left: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Literal',
        value: propertyValue,
      },
    },
    right: {
      type: 'FunctionExpression',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

// ============================================================================
// META TESTS (20)
// ============================================================================
describe('no-iterator rule - meta', () => {
  test('should have problem type', () => {
    expect(noIteratorRule.meta.type).toBe('problem')
  })

  test('should have warn severity', () => {
    expect(noIteratorRule.meta.severity).toBe('warn')
  })

  test('should be recommended', () => {
    expect(noIteratorRule.meta.docs?.recommended).toBe(true)
  })

  test('should have patterns category', () => {
    expect(noIteratorRule.meta.docs?.category).toBe('patterns')
  })

  test('should have schema defined', () => {
    expect(noIteratorRule.meta.schema).toBeDefined()
  })

  test('should not be fixable', () => {
    expect(noIteratorRule.meta.fixable).toBeUndefined()
  })

  test('should mention iterator in description', () => {
    expect(noIteratorRule.meta.docs?.description.toLowerCase()).toContain('iterator')
  })

  test('should have empty schema array', () => {
    expect(noIteratorRule.meta.schema).toEqual([])
  })

  test('should have a meta object', () => {
    expect(noIteratorRule.meta).toBeDefined()
    expect(typeof noIteratorRule.meta).toBe('object')
  })

  test('should have docs property in meta', () => {
    expect(noIteratorRule.meta.docs).toBeDefined()
    expect(typeof noIteratorRule.meta.docs).toBe('object')
  })

  test('should have a string description in docs', () => {
    expect(typeof noIteratorRule.meta.docs?.description).toBe('string')
  })

  test('should have a non-empty description', () => {
    expect(noIteratorRule.meta.docs?.description.length).toBeGreaterThan(0)
  })

  test('should mention __iterator__ in description', () => {
    expect(noIteratorRule.meta.docs?.description).toContain('__iterator__')
  })

  test('should mention __defineIterator__ in description', () => {
    expect(noIteratorRule.meta.docs?.description).toContain('__defineIterator__')
  })

  test('should mention __defineSetter__ in description', () => {
    expect(noIteratorRule.meta.docs?.description).toContain('__defineSetter__')
  })

  test('should mention non-standard in description', () => {
    expect(noIteratorRule.meta.docs?.description.toLowerCase()).toContain('non-standard')
  })

  test('should have type as a valid RuleType', () => {
    expect(['problem', 'suggestion', 'layout']).toContain(noIteratorRule.meta.type)
  })

  test('should have severity as a valid Severity', () => {
    expect(['off', 'warn', 'error']).toContain(noIteratorRule.meta.severity)
  })

  test('should have docs url defined', () => {
    expect(noIteratorRule.meta.docs?.url).toBeDefined()
  })

  test('should have a docs url containing codeforge', () => {
    expect(noIteratorRule.meta.docs?.url).toContain('codeforge')
  })
})

// ============================================================================
// CREATE / VISITOR TESTS (8)
// ============================================================================
describe('no-iterator rule - create and visitor', () => {
  test('should have a create method', () => {
    expect(typeof noIteratorRule.create).toBe('function')
  })

  test('should return visitor object with MemberExpression method', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(visitor).toHaveProperty('MemberExpression')
  })

  test('should return visitor object with AssignmentExpression method', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(visitor).toHaveProperty('AssignmentExpression')
  })

  test('MemberExpression should be a function', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(typeof visitor.MemberExpression).toBe('function')
  })

  test('AssignmentExpression should be a function', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(typeof visitor.AssignmentExpression).toBe('function')
  })

  test('should return exactly two visitor methods', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(Object.keys(visitor)).toHaveLength(2)
  })

  test('should return a new visitor object on each create call', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor1 = noIteratorRule.create(context)
    const visitor2 = noIteratorRule.create(context)

    expect(visitor1).not.toBe(visitor2)
  })

  test('create should accept a valid RuleContext', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    expect(() => noIteratorRule.create(context)).not.toThrow()
  })
})

// ============================================================================
// DETECTION TESTS (30)
// ============================================================================
describe('no-iterator rule - detecting __iterator__', () => {
  test('should report obj.__iterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('__iterator__')
  })

  test('should report obj.__iterator__ assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('__iterator__')
  })
})

describe('no-iterator rule - detecting __defineIterator__', () => {
  test('should report obj.__defineIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineIterator__'))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('__defineIterator__')
  })

  test('should report obj.__defineIterator__ assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__defineIterator__'))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('__defineIterator__')
  })
})

describe('no-iterator rule - detecting __defineSetter__', () => {
  test('should report obj.__defineSetter__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineSetter__'))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('__defineSetter__')
  })

  test('should report obj.__defineSetter__ assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__defineSetter__'))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain('__defineSetter__')
  })
})

describe('no-iterator rule - detecting custom iterator patterns', () => {
  test('should report __customIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__customIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __myIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__myIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __ITERATOR__ access (uppercase)', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__ITERATOR__'))

    expect(reports.length).toBe(1)
  })

  test('should report __CustomIterator__ access (mixed case)', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__CustomIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report custom iterator assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__myCustomIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __MyITERATOR__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__MyITERATOR__'))

    expect(reports.length).toBe(1)
  })

  test('should report __listIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__listIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __treeIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__treeIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __rangeIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__rangeIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __asyncIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__asyncIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __mapiterator__ access (lowercase)', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__mapiterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __SynCIterator__ access (mixed case)', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__SynCIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __arrayIterator__ access via assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__arrayIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __hashIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__hashIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __setIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__setIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __objectIterator__ assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__objectIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __reverseIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__reverseIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report __entryIterator__ access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__entryIterator__'))

    expect(reports.length).toBe(1)
  })
})

// ============================================================================
// NOT REPORTING TESTS (30)
// ============================================================================
describe('no-iterator rule - allowing regular properties', () => {
  test('should not report regular property access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('name'))
    visitor.MemberExpression(createMemberExpression('value'))
    visitor.MemberExpression(createMemberExpression('toString'))

    expect(reports.length).toBe(0)
  })

  test('should not report regular property assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('name'))
    visitor.AssignmentExpression(createAssignmentExpression('value'))

    expect(reports.length).toBe(0)
  })

  test('should not report properties starting with single underscore', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('_iterator'))
    visitor.MemberExpression(createMemberExpression('_privateIterator'))

    expect(reports.length).toBe(0)
  })

  test('should not report properties without iterator in name', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__private'))
    visitor.MemberExpression(createMemberExpression('__custom'))

    expect(reports.length).toBe(0)
  })

  test('should not report Symbol.iterator access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('Symbol'))

    expect(reports.length).toBe(0)
  })

  test('should not report length property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('length'))

    expect(reports.length).toBe(0)
  })

  test('should not report prototype property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('prototype'))

    expect(reports.length).toBe(0)
  })

  test('should not report constructor property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('constructor'))

    expect(reports.length).toBe(0)
  })

  test('should not report hasOwnProperty property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('hasOwnProperty'))

    expect(reports.length).toBe(0)
  })

  test('should not report forEach property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('forEach'))

    expect(reports.length).toBe(0)
  })

  test('should not report map property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('map'))

    expect(reports.length).toBe(0)
  })

  test('should not report filter property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('filter'))

    expect(reports.length).toBe(0)
  })

  test('should not report next property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('next'))

    expect(reports.length).toBe(0)
  })

  test('should not report done property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('done'))

    expect(reports.length).toBe(0)
  })

  test('should not report value property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('value'))

    expect(reports.length).toBe(0)
  })

  test('should not report __proto__ property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__proto__'))

    expect(reports.length).toBe(0)
  })

  test('should not report __defineGetter__ property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineGetter__'))

    expect(reports.length).toBe(0)
  })

  test('should not report __lookupGetter__ property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__lookupGetter__'))

    expect(reports.length).toBe(0)
  })

  test('should not report __lookupSetter__ property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__lookupSetter__'))

    expect(reports.length).toBe(0)
  })

  test('should not report regular assignment to name', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('firstName'))

    expect(reports.length).toBe(0)
  })

  test('should not report assignment to items property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('items'))

    expect(reports.length).toBe(0)
  })

  test('should not report assignment to data property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('data'))

    expect(reports.length).toBe(0)
  })

  test('should not report assignment to _iterator property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('_iterator'))

    expect(reports.length).toBe(0)
  })

  test('should not report assignment to __private property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__private'))

    expect(reports.length).toBe(0)
  })

  test('should not report empty string property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression(''))

    expect(reports.length).toBe(0)
  })
})

// ============================================================================
// EDGE CASES (25)
// ============================================================================
describe('no-iterator rule - edge cases', () => {
  test('should handle null MemberExpression node gracefully', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.MemberExpression(null)).not.toThrow()
  })

  test('should handle undefined MemberExpression node gracefully', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.MemberExpression(undefined)).not.toThrow()
  })

  test('should handle non-object MemberExpression node gracefully (string)', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.MemberExpression('string')).not.toThrow()
  })

  test('should handle non-object MemberExpression node gracefully (number)', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.MemberExpression(123)).not.toThrow()
  })

  test('should handle non-object MemberExpression node gracefully (boolean)', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.MemberExpression(true)).not.toThrow()
  })

  test('should handle null AssignmentExpression node gracefully', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.AssignmentExpression(null)).not.toThrow()
  })

  test('should handle undefined AssignmentExpression node gracefully', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
  })

  test('should handle non-object AssignmentExpression node gracefully (string)', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.AssignmentExpression('string')).not.toThrow()
  })

  test('should handle non-object AssignmentExpression node gracefully (number)', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.AssignmentExpression(123)).not.toThrow()
  })

  test('should handle non-object AssignmentExpression node gracefully (boolean)', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    expect(() => visitor.AssignmentExpression(true)).not.toThrow()
  })

  test('should handle MemberExpression without type', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = { property: { type: 'Identifier', name: '__iterator__' } }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle MemberExpression with wrong type', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'CallExpression',
      property: { type: 'Identifier', name: '__iterator__' },
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression without type', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      left: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: '__iterator__' },
      },
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression with wrong type', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'CallExpression',
      left: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: '__iterator__' },
      },
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression without left', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'AssignmentExpression',
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression with null left', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'AssignmentExpression',
      left: null,
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression with undefined left', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'AssignmentExpression',
      left: undefined,
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression with non-MemberExpression left', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'AssignmentExpression',
      left: {
        type: 'Identifier',
        name: 'x',
      },
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle MemberExpression without property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle MemberExpression with null property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: null,
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle MemberExpression with non-Identifier property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'CallExpression' },
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle MemberExpression with non-string Identifier name', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 123 as unknown as string },
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle MemberExpression with non-string Literal value', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Literal', value: 123 },
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle AssignmentExpression with left MemberExpression missing property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'AssignmentExpression',
      left: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
      },
    }

    expect(() => visitor.AssignmentExpression(node)).not.toThrow()
    expect(reports.length).toBe(0)
  })

  test('should handle deeply nested object node without crashing', () => {
    const { context } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    const node = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'a' },
      property: { type: 'Identifier', name: 'b' },
      extra: { nested: { deep: { value: true } } },
    }

    expect(() => visitor.MemberExpression(node)).not.toThrow()
  })
})

// ============================================================================
// LOCATION TESTS (15)
// ============================================================================
describe('no-iterator rule - location reporting', () => {
  test('should report correct location for MemberExpression', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 10, 5))

    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('should report correct location for AssignmentExpression', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__iterator__', 15, 8))

    expect(reports[0].loc?.start.line).toBe(15)
    expect(reports[0].loc?.start.column).toBe(8)
  })

  test('should report location at line 1 column 0 by default', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report correct location for literal property access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__iterator__', 20, 10))

    expect(reports[0].loc?.start.line).toBe(20)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('should report correct location for literal assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpressionWithLiteral('__iterator__', 30, 15))

    expect(reports[0].loc?.start.line).toBe(30)
    expect(reports[0].loc?.start.column).toBe(15)
  })

  test('should report location for __defineIterator__', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineIterator__', 5, 2))

    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(2)
  })

  test('should report location for __defineSetter__', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineSetter__', 7, 3))

    expect(reports[0].loc?.start.line).toBe(7)
    expect(reports[0].loc?.start.column).toBe(3)
  })

  test('should include end location in report', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 1, 0))

    expect(reports[0].loc?.end).toBeDefined()
    expect(reports[0].loc?.end.line).toBe(1)
  })

  test('should report location at high line numbers', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 500, 20))

    expect(reports[0].loc?.start.line).toBe(500)
    expect(reports[0].loc?.start.column).toBe(20)
  })

  test('should report location at column 0', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 1, 0))

    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report location for each violation separately', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 1, 0))
    visitor.MemberExpression(createMemberExpression('__defineIterator__', 5, 10))

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[1].loc?.start.line).toBe(5)
    expect(reports[1].loc?.start.column).toBe(10)
  })

  test('should report location for assignment at line 100', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__iterator__', 100, 0))

    expect(reports[0].loc?.start.line).toBe(100)
  })

  test('should report location with same start and end line', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 3, 5))

    expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
  })

  test('should report location for custom iterator pattern', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__myIterator__', 42, 7))

    expect(reports[0].loc?.start.line).toBe(42)
    expect(reports[0].loc?.start.column).toBe(7)
  })

  test('should have loc defined in report', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 2, 4))

    expect(reports[0].loc).toBeDefined()
  })
})

// ============================================================================
// MESSAGE TESTS (10)
// ============================================================================
describe('no-iterator rule - message quality', () => {
  test('should include property name in member expression message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports[0].message).toContain('__iterator__')
    expect(reports[0].message).toContain('Non-standard')
  })

  test('should mention assignment in assignment expression message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

    expect(reports[0].message).toContain('assignment')
  })

  test('should mention "avoided" in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports[0].message.toLowerCase()).toContain('avoid')
  })

  test('should include property name in custom iterator message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__customIterator__'))

    expect(reports[0].message).toContain('__customIterator__')
  })

  test('should include property name in __defineIterator__ message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineIterator__'))

    expect(reports[0].message).toContain('__defineIterator__')
  })

  test('should include property name in __defineSetter__ message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__defineSetter__'))

    expect(reports[0].message).toContain('__defineSetter__')
  })

  test('should mention non-standard in assignment message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

    expect(reports[0].message).toContain('Non-standard')
  })

  test('should mention "Unexpected" in member expression message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports[0].message).toContain('Unexpected')
  })

  test('should have different messages for access vs assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))
    visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

    expect(reports[0].message).not.toBe(reports[1].message)
  })

  test('should mention "iterator properties" in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports[0].message.toLowerCase()).toContain('iterator properties')
  })
})

// ============================================================================
// MULTIPLE REPORTS (10)
// ============================================================================
describe('no-iterator rule - multiple violations', () => {
  test('should report multiple iterator property accesses', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))
    visitor.MemberExpression(createMemberExpression('__defineIterator__'))
    visitor.MemberExpression(createMemberExpression('__myIterator__'))

    expect(reports.length).toBe(3)
  })

  test('should report both member and assignment expressions', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))
    visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))

    expect(reports.length).toBe(2)
  })

  test('should report five __iterator__ accesses independently', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    for (let i = 0; i < 5; i++) {
      visitor.MemberExpression(createMemberExpression('__iterator__', i + 1, 0))
    }

    expect(reports.length).toBe(5)
  })

  test('should report mixed violations correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))
    visitor.MemberExpression(createMemberExpression('regularProp'))
    visitor.AssignmentExpression(createAssignmentExpression('__defineIterator__'))
    visitor.MemberExpression(createMemberExpression('__customIterator__'))

    expect(reports.length).toBe(3)
  })

  test('should maintain order of reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__', 1, 0))
    visitor.MemberExpression(createMemberExpression('__defineIterator__', 2, 0))
    visitor.MemberExpression(createMemberExpression('__defineSetter__', 3, 0))

    expect(reports[0].message).toContain('__iterator__')
    expect(reports[1].message).toContain('__defineIterator__')
    expect(reports[2].message).toContain('__defineSetter__')
  })

  test('should report iterator in separate contexts independently', () => {
    const ctx1 = createMockRuleContext({ source: 'obj.__iterator__' })
    const ctx2 = createMockRuleContext({ source: 'obj.__iterator__' })

    const visitor1 = noIteratorRule.create(ctx1.context)
    const visitor2 = noIteratorRule.create(ctx2.context)

    visitor1.MemberExpression(createMemberExpression('__iterator__'))
    visitor2.MemberExpression(createMemberExpression('__iterator__'))
    visitor1.MemberExpression(createMemberExpression('__defineIterator__'))

    expect(ctx1.reports.length).toBe(2)
    expect(ctx2.reports.length).toBe(1)
  })

  test('should report all three known patterns in MemberExpression', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))
    visitor.MemberExpression(createMemberExpression('__defineIterator__'))
    visitor.MemberExpression(createMemberExpression('__defineSetter__'))

    expect(reports.length).toBe(3)
  })

  test('should report all three known patterns in AssignmentExpression', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression('__iterator__'))
    visitor.AssignmentExpression(createAssignmentExpression('__defineIterator__'))
    visitor.AssignmentExpression(createAssignmentExpression('__defineSetter__'))

    expect(reports.length).toBe(3)
  })

  test('should report 10 mixed violations', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    for (let i = 0; i < 5; i++) {
      visitor.MemberExpression(createMemberExpression('__iterator__', i + 1, 0))
      visitor.AssignmentExpression(createAssignmentExpression('__iterator__', i + 1, 5))
    }

    expect(reports.length).toBe(10)
  })

  test('should not conflate reports between member and assignment', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))
    visitor.AssignmentExpression(createAssignmentExpression('__defineSetter__'))

    expect(reports[0].message).toContain('Unexpected use')
    expect(reports[1].message).toContain('Unexpected assignment')
  })
})

// ============================================================================
// CONTEXT TESTS (10)
// ============================================================================
describe('no-iterator rule - context behavior', () => {
  test('should work with different file paths', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__', filePath: '/src/custom.ts' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should work with different source content', () => {
    const { context, reports } = createMockRuleContext({ source: 'foo.__iterator__', filePath: '/src/file.ts' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should work with empty options', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should work with options present', () => {
    const { context, reports } = createMockRuleContext({ options: [{ strict: true }], source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should not crash with a long file path', () => {
    const longPath = '/src/' + 'a'.repeat(500) + '/file.ts'
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__', filePath: longPath })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should create independent visitors for independent contexts', () => {
    const ctx1 = createMockRuleContext({ source: 'obj.__iterator__' })
    const ctx2 = createMockRuleContext({ source: 'obj.__iterator__' })

    const visitor1 = noIteratorRule.create(ctx1.context)
    const visitor2 = noIteratorRule.create(ctx2.context)

    visitor1.MemberExpression(createMemberExpression('__iterator__'))

    expect(ctx1.reports.length).toBe(1)
    expect(ctx2.reports.length).toBe(0)
  })

  test('should handle multiple create calls', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    noIteratorRule.create(context)
    noIteratorRule.create(context)

    const visitor = noIteratorRule.create(context)
    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should work with default workspace root', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should call context.report exactly once per violation', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should not call context.report for non-violations', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression('name'))
    visitor.MemberExpression(createMemberExpression('value'))

    expect(reports.length).toBe(0)
  })
})

// ============================================================================
// LITERAL PROPERTY ACCESS TESTS (from original + expanded)
// ============================================================================
describe('no-iterator rule - literal property access', () => {
  test('should report obj["__iterator__"] access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report obj["__defineIterator__"] access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__defineIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report assignment with literal property', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpressionWithLiteral('__iterator__'))

    expect(reports.length).toBe(1)
  })

  test('should not report regular literal property access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('name'))
    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('value'))

    expect(reports.length).toBe(0)
  })

  test('should report obj["__defineSetter__"] access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__defineSetter__'))

    expect(reports.length).toBe(1)
  })

  test('should report obj["__myIterator__"] access', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__myIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report assignment with literal __defineIterator__', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpressionWithLiteral('__defineIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report assignment with literal __defineSetter__', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpressionWithLiteral('__defineSetter__'))

    expect(reports.length).toBe(1)
  })

  test('should not report literal property "toString"', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('toString'))

    expect(reports.length).toBe(0)
  })

  test('should not report literal property "length"', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('length'))

    expect(reports.length).toBe(0)
  })

  test('should not report literal property "__proto__"', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__proto__'))

    expect(reports.length).toBe(0)
  })

  test('should report custom iterator via literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__customIterator__'))

    expect(reports.length).toBe(1)
  })

  test('should report uppercase iterator via literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty('__ITERATOR__'))

    expect(reports.length).toBe(1)
  })
})

// ============================================================================
// TEST.EACH DATA-DRIVEN TESTS (40+)
// ============================================================================
describe('no-iterator rule - data-driven MemberExpression detection', () => {
  const iteratorProperties = [
    ['__iterator__'],
    ['__defineIterator__'],
    ['__defineSetter__'],
    ['__customIterator__'],
    ['__myIterator__'],
    ['__ITERATOR__'],
    ['__CustomIterator__'],
    ['__listIterator__'],
    ['__treeIterator__'],
    ['__rangeIterator__'],
    ['__asyncIterator__'],
    ['__mapiterator__'],
    ['__SynCIterator__'],
    ['__hashIterator__'],
    ['__setIterator__'],
    ['__reverseIterator__'],
    ['__entryIterator__'],
    ['__objectIterator__'],
    ['__arrayIterator__'],
    ['__nextIterator__'],
  ]

  test.each(iteratorProperties)('should report MemberExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression(prop))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain(prop)
  })
})

describe('no-iterator rule - data-driven AssignmentExpression detection', () => {
  const iteratorProperties = [
    ['__iterator__'],
    ['__defineIterator__'],
    ['__defineSetter__'],
    ['__customIterator__'],
    ['__myIterator__'],
    ['__ITERATOR__'],
    ['__CustomIterator__'],
    ['__listIterator__'],
    ['__treeIterator__'],
    ['__rangeIterator__'],
    ['__asyncIterator__'],
    ['__hashIterator__'],
    ['__setIterator__'],
    ['__reverseIterator__'],
    ['__entryIterator__'],
  ]

  test.each(iteratorProperties)('should report AssignmentExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression(prop))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toContain(prop)
  })
})

describe('no-iterator rule - data-driven non-violation MemberExpression', () => {
  const safeProperties = [
    ['name'],
    ['value'],
    ['toString'],
    ['length'],
    ['prototype'],
    ['constructor'],
    ['hasOwnProperty'],
    ['forEach'],
    ['map'],
    ['filter'],
    ['reduce'],
    ['find'],
    ['includes'],
    ['indexOf'],
    ['push'],
    ['pop'],
    ['shift'],
    ['unshift'],
    ['slice'],
    ['splice'],
  ]

  test.each(safeProperties)('should not report MemberExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpression(prop))

    expect(reports.length).toBe(0)
  })
})

describe('no-iterator rule - data-driven non-violation AssignmentExpression', () => {
  const safeProperties = [
    ['name'],
    ['value'],
    ['data'],
    ['items'],
    ['count'],
    ['flag'],
    ['result'],
    ['status'],
    ['message'],
    ['error'],
  ]

  test.each(safeProperties)('should not report AssignmentExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpression(prop))

    expect(reports.length).toBe(0)
  })
})

describe('no-iterator rule - data-driven literal MemberExpression detection', () => {
  const iteratorLiterals = [
    ['__iterator__'],
    ['__defineIterator__'],
    ['__defineSetter__'],
    ['__customIterator__'],
    ['__myIterator__'],
    ['__ITERATOR__'],
    ['__CustomIterator__'],
    ['__listIterator__'],
    ['__treeIterator__'],
    ['__rangeIterator__'],
  ]

  test.each(iteratorLiterals)('should report literal MemberExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty(prop))

    expect(reports.length).toBe(1)
  })
})

describe('no-iterator rule - data-driven literal AssignmentExpression detection', () => {
  const iteratorLiterals = [
    ['__iterator__'],
    ['__defineIterator__'],
    ['__defineSetter__'],
    ['__customIterator__'],
    ['__myIterator__'],
  ]

  test.each(iteratorLiterals)('should report literal AssignmentExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.AssignmentExpression(createAssignmentExpressionWithLiteral(prop))

    expect(reports.length).toBe(1)
  })
})

describe('no-iterator rule - data-driven safe literal MemberExpression', () => {
  const safeLiterals = [
    ['name'],
    ['value'],
    ['toString'],
    ['__proto__'],
    ['__defineGetter__'],
    ['__lookupGetter__'],
    ['__lookupSetter__'],
    ['__noSuchMethod__'],
    ['__count__'],
  ]

  test.each(safeLiterals)('should not report literal MemberExpression for %s', (prop) => {
    const { context, reports } = createMockRuleContext({ source: 'obj.__iterator__' })
    const visitor = noIteratorRule.create(context)

    visitor.MemberExpression(createMemberExpressionWithLiteralProperty(prop))

    expect(reports.length).toBe(0)
  })
})
