import { preferNumberPropertiesRule } from '../../../../src/rules/patterns/prefer-number-properties.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createMemberExpression(object: string, property: string): unknown {
  return {
    type: 'MemberExpression',
    object: createIdentifier(object),
    property: createIdentifier(property),
    computed: false,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createCallExpression(callee: unknown): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: [],
  }
}

function createComputedMemberExpression(object: string, property: string): unknown {
  return {
    type: 'MemberExpression',
    object: createIdentifier(object),
    property: createIdentifier(property),
    computed: true,
  }
}

describe('prefer-number-properties rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferNumberPropertiesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferNumberPropertiesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferNumberPropertiesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferNumberPropertiesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferNumberPropertiesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferNumberPropertiesRule.meta.fixable).toBeUndefined()
    })

    test('should mention Number.isNaN in description', () => {
      expect(preferNumberPropertiesRule.meta.docs?.description).toContain('Number.isNaN')
    })

    test('should mention Number.isFinite in description', () => {
      expect(preferNumberPropertiesRule.meta.docs?.description).toContain('Number.isFinite')
    })

    test('should have docs url', () => {
      expect(preferNumberPropertiesRule.meta.docs?.url).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(preferNumberPropertiesRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return a function for BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should create new visitor for each context', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'x === NaN;' })
      const { context: ctx2 } = createMockRuleContext({ source: 'x === NaN;' })

      const visitor1 = preferNumberPropertiesRule.create(ctx1)
      const visitor2 = preferNumberPropertiesRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting NaN comparisons', () => {
    test('should report x === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number.isNaN')
    })

    test('should report NaN === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report NaN == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('==', createIdentifier('NaN'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should report NaN !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!==', createIdentifier('NaN'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should report x != NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report NaN != x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!=', createIdentifier('NaN'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'NaN'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '==',
        createIdentifier('x'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '==',
        createMemberExpression('Number', 'NaN'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should report Number.NaN !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createMemberExpression('Number', 'NaN'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should report x != Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createIdentifier('x'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN != x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createMemberExpression('Number', 'NaN'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report NaN === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN === Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'NaN'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report NaN === Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('NaN'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'NaN'),
        createIdentifier('NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Infinity comparisons', () => {
    test('should report x === Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('should report Infinity === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('Infinity'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('==', createIdentifier('x'), createIdentifier('Infinity'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Infinity == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('==', createIdentifier('Infinity'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report Infinity !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('Infinity'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report x != Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!=', createIdentifier('x'), createIdentifier('Infinity'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Infinity != x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('!=', createIdentifier('Infinity'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.POSITIVE_INFINITY === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NEGATIVE_INFINITY === x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '==',
        createIdentifier('x'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.POSITIVE_INFINITY == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '==',
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '==',
        createIdentifier('x'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.NEGATIVE_INFINITY == x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '==',
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report Number.POSITIVE_INFINITY !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report x !== Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report Number.NEGATIVE_INFINITY !== x', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should report x != Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createIdentifier('x'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x != Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createIdentifier('x'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Infinity === Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('Infinity'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Infinity === Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('Infinity'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.POSITIVE_INFINITY === Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Number.POSITIVE_INFINITY === Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid comparisons', () => {
    test('should not report x === 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), {
        type: 'Literal',
        value: 5,
      })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), { type: 'Literal', value: 0 })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('undefined'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === null', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), {
        type: 'Literal',
        value: null,
      })

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x < NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x >= NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>=', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x <= NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('<=', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), createIdentifier('Infinity'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x < Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('x'), createIdentifier('Infinity'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x >= Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>=', createIdentifier('x'), createIdentifier('Infinity'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x <= Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('<=', createIdentifier('x'), createIdentifier('Infinity'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x - y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('-', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x * y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('*', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x / y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('/', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x % y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('%', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ** y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('**', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x | y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('|', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x & y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('&', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x ^ y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('^', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x << y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('<<', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x >> y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('>>', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x in y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('in', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x instanceof y', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        'instanceof',
        createIdentifier('x'),
        createIdentifier('y'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === true', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(true))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === ""', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(-1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting wrong member expressions', () => {
    test('should not report x === Math.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Math', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === window.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('window', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === global.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('global', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report x === Number["NaN"] (computed member still matches)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createComputedMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report x === Math.Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Math', 'Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === window.Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('window', 'Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === Number.Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report x === Number["POSITIVE_INFINITY"] (computed member still matches)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createComputedMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Number["NEGATIVE_INFINITY"] (computed member still matches)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createComputedMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report x === Number.isFinite', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'isFinite'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === Number.isNaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'isNaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === Number.MAX_SAFE_INTEGER', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'MAX_SAFE_INTEGER'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === Number.MIN_SAFE_INTEGER', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'MIN_SAFE_INTEGER'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === Number.MAX_VALUE', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'MAX_VALUE'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === Number.MIN_VALUE', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createMemberExpression('Number', 'MIN_VALUE'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('complex operand types', () => {
    test('should report obj.prop === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('obj', 'prop'),
        createIdentifier('NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report NaN === obj.prop', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('NaN'),
        createMemberExpression('obj', 'prop'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report foo() === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createCallExpression(createIdentifier('foo')),
        createIdentifier('NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report NaN === foo()', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('NaN'),
        createCallExpression(createIdentifier('foo')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report arr[0] === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createComputedMemberExpression('arr', '0'),
        createIdentifier('NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.prop === Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('obj', 'prop'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Infinity === obj.prop', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('Infinity'),
        createMemberExpression('obj', 'prop'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report foo() === Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createCallExpression(createIdentifier('foo')),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Infinity === foo()', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('Infinity'),
        createCallExpression(createIdentifier('foo')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.prop === Number.NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('obj', 'prop'),
        createMemberExpression('Number', 'NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.prop === Number.POSITIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createMemberExpression('obj', 'prop'),
        createMemberExpression('Number', 'POSITIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report obj.prop !== Number.NEGATIVE_INFINITY', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createMemberExpression('obj', 'prop'),
        createMemberExpression('Number', 'NEGATIVE_INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report this.val === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const thisVal = {
        type: 'MemberExpression',
        object: { type: 'ThisExpression' },
        property: createIdentifier('val'),
        computed: false,
      }
      const node = createBinaryExpression('===', thisVal, createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report result === NaN with literal zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('result'),
        createIdentifier('NaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 / 0 === NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const division = createBinaryExpression('/', createLiteral(0), createLiteral(0))
      const node = createBinaryExpression('===', division, createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('NaN'),
        25,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(() => visitor.BinaryExpression(false)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression(0)).not.toThrow()
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(() => visitor.BinaryExpression(-1)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'Literal',
        value: 42,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left and NaN right (reports NaN)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: null,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined left and NaN right (reports NaN)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: undefined,
        right: createIdentifier('NaN'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: undefined,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle NaN identifier with different casing on left', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('nan'), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN identifier with different casing on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('nan'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Infinity identifier with different casing on right', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN-like identifier nanValue', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('nanValue'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle Infinity-like identifier InfinityValue', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('InfinityValue'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN-like identifier isNaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('isNaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle NaN-like identifier NumberNaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('NumberNaN'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-identifier object for NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
        property: createIdentifier('NaN'),
        computed: false,
      }

      const node = createBinaryExpression('===', createIdentifier('x'), memberExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-identifier property for NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('Number'),
        property: { type: 'Literal', value: 'NaN' },
        computed: false,
      }

      const node = createBinaryExpression('===', createIdentifier('x'), memberExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression without object', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        property: createIdentifier('NaN'),
        computed: false,
      }

      const node = createBinaryExpression('===', createIdentifier('x'), memberExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('Number'),
        computed: false,
      }

      const node = createBinaryExpression('===', createIdentifier('x'), memberExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with custom file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;', filePath: '/custom/path.ts' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 5;', filePath: '/src/file.ts' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('location tracking', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('NaN'),
        1,
        0,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('NaN'),
        100,
        50,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location for Infinity at line 5 column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('Infinity'),
        5,
        20,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('NaN'),
        3,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report NaN comparison at various lines', () => {
      const lines = [1, 2, 5, 10, 50, 100, 500, 1000]

      for (const line of lines) {
        const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
        const visitor = preferNumberPropertiesRule.create(context)

        const node = createBinaryExpression(
          '===',
          createIdentifier('x'),
          createIdentifier('NaN'),
          line,
          0,
        )

        visitor.BinaryExpression(node)

        expect(reports[0].loc?.start.line).toBe(line)
      }
    })
  })

  describe('message quality', () => {
    test('should mention Number.isNaN for NaN comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('Number.isNaN')
    })

    test('should mention !Number.isNaN for negative NaN comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should mention Number.isFinite for Infinity comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('should mention that NaN comparisons return false', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should mention always return false in NaN negative comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should mention Number.isFinite for POSITIVE_INFINITY comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createIdentifier('x'),
          createMemberExpression('Number', 'POSITIVE_INFINITY'),
        ),
      )

      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('should mention Number.isFinite for NEGATIVE_INFINITY comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createIdentifier('x'),
          createMemberExpression('Number', 'NEGATIVE_INFINITY'),
        ),
      )

      expect(reports[0].message).toContain('Number.isFinite')
    })

    test('should mention !Number.isFinite for negative Infinity comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should mention !Number.isFinite for negative POSITIVE_INFINITY comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createIdentifier('x'),
          createMemberExpression('Number', 'POSITIVE_INFINITY'),
        ),
      )

      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should mention !Number.isFinite for negative NEGATIVE_INFINITY comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createIdentifier('x'),
          createMemberExpression('Number', 'NEGATIVE_INFINITY'),
        ),
      )

      expect(reports[0].message).toContain('!Number.isFinite')
    })

    test('should mention NaN in NaN positive message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('NaN')
    })

    test('should mention Infinity in Infinity positive message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('Infinity')
    })

    test('should mention Number.isNaN for == NaN loose equality', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('Number.isNaN')
      expect(reports[0].message).not.toContain('!Number.isNaN')
    })

    test('should mention Number.isFinite for == Infinity loose equality', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('Number.isFinite')
      expect(reports[0].message).not.toContain('!Number.isFinite')
    })

    test('should mention !Number.isNaN for != NaN loose inequality', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should mention !Number.isFinite for != Infinity loose inequality', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('!Number.isFinite')
    })
  })

  describe('report consistency', () => {
    test('should produce exactly one report per NaN comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should produce exactly one report per Infinity comparison', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report separately for multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('y'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(2)
    })

    test('should report separately for NaN then Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('a'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('b'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('c'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(3)
    })

    test('should not report for valid then report for NaN', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('y')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report for NaN in sequence of mixed calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('y')),
      )
      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('z'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('identifier case sensitivity', () => {
    test('should not report x === nan (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('nan'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === NAN (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('NAN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === infinity (lowercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === INFINITY (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('INFINITY'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report x === NaN (exact case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x === Infinity (exact case)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createIdentifier('Infinity'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('strict vs loose equality operators', () => {
    test('should report x === NaN (strict)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x == NaN (loose)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x !== NaN (strict negative)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x != NaN (loose negative)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x === Infinity (strict)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x == Infinity (loose)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x !== Infinity (strict negative)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x != Infinity (loose negative)', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report == NaN with message about Number.isNaN not negated', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('Number.isNaN')
      expect(reports[0].message).not.toContain('!Number.isNaN')
    })

    test('should report != NaN with negated message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports[0].message).toContain('!Number.isNaN')
    })

    test('should report == Infinity with message about Number.isFinite not negated', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('Number.isFinite')
      expect(reports[0].message).not.toContain('!Number.isFinite')
    })

    test('should report != Infinity with negated message', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports[0].message).toContain('!Number.isFinite')
    })
  })

  describe('positional symmetry', () => {
    test('should report NaN on left side of ===', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('value')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report NaN on right side of ===', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('value'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Infinity on left side of ===', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('Infinity'), createIdentifier('value')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Infinity on right side of ===', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('value'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN on left side of ==', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '==',
          createMemberExpression('Number', 'NaN'),
          createIdentifier('value'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Number.NaN on right side of ==', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '==',
          createIdentifier('value'),
          createMemberExpression('Number', 'NaN'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Number.POSITIVE_INFINITY on left side of !==', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createMemberExpression('Number', 'POSITIVE_INFINITY'),
          createIdentifier('value'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Number.POSITIVE_INFINITY on right side of !==', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createIdentifier('value'),
          createMemberExpression('Number', 'POSITIVE_INFINITY'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Number.NEGATIVE_INFINITY on left side of !=', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!=',
          createMemberExpression('Number', 'NEGATIVE_INFINITY'),
          createIdentifier('value'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Number.NEGATIVE_INFINITY on right side of !=', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!=',
          createIdentifier('value'),
          createMemberExpression('Number', 'NEGATIVE_INFINITY'),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('operator precedence edge cases', () => {
    test('should not report x === NaN with non-equality operator in node type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report NaN with < operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Infinity with > operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('>', createIdentifier('Infinity'), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NaN with >= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('>=', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Infinity with <= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<=', createIdentifier('Infinity'), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NaN with + operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Infinity with - operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NaN with * operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Infinity with / operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('x'), createIdentifier('Infinity')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NaN with % operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('%', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report NaN with ** operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'x === NaN;' })
      const visitor = preferNumberPropertiesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('**', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('should have default export', () => {
      expect(preferNumberPropertiesRule).toBeDefined()
    })

    test('should be same as named export', async () => {
      const mod = await import('../../../../src/rules/patterns/prefer-number-properties.js')
      expect(mod.default).toBe(mod.preferNumberPropertiesRule)
    })
  })
})
